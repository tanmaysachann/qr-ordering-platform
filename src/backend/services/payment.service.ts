import { paymentRepository } from "@/backend/repositories/payment.repository";
import { orderRepository } from "@/backend/repositories/order.repository";
import { verifyWebhookSignature, checkPaymentStatus } from "@/backend/lib/phonepe";
import { sseManager } from "@/backend/lib/sse";
import { notifyOrderPlaced } from "@/backend/lib/whatsapp";
import type { Prisma } from "@/generated/prisma";

type FullOrder = NonNullable<Awaited<ReturnType<typeof orderRepository.getOrderById>>>;

function sendOrderPlacedWhatsApp(fullOrder: FullOrder) {
  if (!fullOrder.customerPhone) return;
  notifyOrderPlaced({
    customerPhone: fullOrder.customerPhone,
    customerName: fullOrder.customerName || "there",
    orderNumber: fullOrder.orderNumber,
    totalPaise: fullOrder.totalPaise,
    cafeName: fullOrder.cafe?.name || "the cafe",
    items: fullOrder.items.map((i) => ({
      itemName: i.itemName,
      quantity: i.quantity,
      subtotalPaise: i.subtotalPaise,
    })),
  }).catch((err) => console.error("[WhatsApp] notifyOrderPlaced failed:", err));
}

function broadcastNewOrder(fullOrder: FullOrder) {
  sseManager.sendToCafe(fullOrder.cafeId, "new_order", {
    type: "new_order",
    order: {
      id: fullOrder.id,
      orderNumber: fullOrder.orderNumber,
      status: fullOrder.status,
      totalPaise: fullOrder.totalPaise,
      customerName: fullOrder.customerName,
      customerPhone: fullOrder.customerPhone,
      notes: fullOrder.notes,
      createdAt: fullOrder.createdAt.toISOString(),
      updatedAt: fullOrder.updatedAt.toISOString(),
      cafeId: fullOrder.cafeId,
      cafeName: fullOrder.cafe?.name,
      cafeSlug: fullOrder.cafe?.slug,
      items: fullOrder.items.map((i) => ({
        id: i.id,
        itemName: i.itemName,
        itemPricePaise: i.itemPricePaise,
        quantity: i.quantity,
        subtotalPaise: i.subtotalPaise,
      })),
    },
  });
}

export const paymentService = {
  async handleWebhook(
    body: string,
    xVerifyHeader: string
  ): Promise<{ success: boolean; message: string }> {
    // Step 1: Parse the raw body to extract merchantTransactionId before verifying.
    // We need the txn ID to look up which cafe's salt key to use for verification.
    let decoded: Record<string, unknown>;
    let merchantTxnId: string;
    try {
      decoded = JSON.parse(
        Buffer.from(JSON.parse(body).response, "base64").toString()
      ) as Record<string, unknown>;
      const data = decoded.data as Record<string, unknown> | undefined;
      merchantTxnId = data?.merchantTransactionId as string;
      if (!merchantTxnId) {
        return { success: false, message: "Missing merchantTransactionId" };
      }
    } catch {
      return { success: false, message: "Invalid webhook payload" };
    }

    // Step 2: Look up payment to get the associated cafe's salt key
    const payment = await paymentRepository.findByMerchantTxnId(merchantTxnId);
    if (!payment) {
      return { success: false, message: "Payment not found" };
    }

    const cafe = payment.order.cafe;
    const saltKey = cafe?.phonepeSaltKey ?? undefined;
    const saltIndex = cafe?.phonepeSaltIndex ?? undefined;

    // Step 3: Verify the webhook signature with the cafe's salt key
    if (!verifyWebhookSignature(body, xVerifyHeader, saltKey, saltIndex)) {
      return { success: false, message: "Invalid signature" };
    }

    // Idempotent: already processed
    if (payment.status === "SUCCESS" || payment.status === "REFUNDED") {
      return { success: true, message: "Already processed" };
    }

    const isSuccess = decoded.code === "PAYMENT_SUCCESS";
    const data = decoded.data as Record<string, unknown> | undefined;
    const instrument = data?.paymentInstrument as Record<string, unknown> | undefined;

    await paymentRepository.updatePaymentStatus(merchantTxnId, {
      status: isSuccess ? "SUCCESS" : "FAILED",
      phonepeTxnId: data?.transactionId as string | undefined,
      paymentMethod: instrument?.type as string | undefined,
      webhookPayload: decoded as Prisma.InputJsonValue,
      paidAt: isSuccess ? new Date() : undefined,
    });

    const newOrderStatus = isSuccess ? "PAID" : "FAILED";
    const updatedOrder = await orderRepository.updateOrderStatus(
      payment.orderId,
      newOrderStatus as "PAID" | "FAILED"
    );

    if (isSuccess && updatedOrder) {
      const fullOrder = await orderRepository.getOrderById(payment.orderId);
      if (fullOrder) {
        broadcastNewOrder(fullOrder);
        sendOrderPlacedWhatsApp(fullOrder);
      }
    }

    return { success: true, message: isSuccess ? "Payment confirmed" : "Payment failed" };
  },

  async reconcilePayment(merchantTxnId: string) {
    const payment = await paymentRepository.findByMerchantTxnId(merchantTxnId);
    if (!payment || payment.status === "SUCCESS") return payment;

    const cafe = payment.order.cafe;
    const credentials = cafe?.phonepeMerchantId && cafe?.phonepeSaltKey
      ? {
          merchantId: cafe.phonepeMerchantId,
          saltKey: cafe.phonepeSaltKey,
          saltIndex: cafe.phonepeSaltIndex ?? "1",
        }
      : undefined;

    const result = await checkPaymentStatus(merchantTxnId, credentials);
    if (!result.success) return null;

    const isSuccess = result.status === "PAYMENT_SUCCESS";
    const responseData = result.data?.data as Record<string, unknown> | undefined;
    const instrument = responseData?.paymentInstrument as Record<string, unknown> | undefined;

    await paymentRepository.updatePaymentStatus(merchantTxnId, {
      status: isSuccess ? "SUCCESS" : "FAILED",
      phonepeTxnId: responseData?.transactionId as string | undefined,
      paymentMethod: instrument?.type as string | undefined,
      paidAt: isSuccess ? new Date() : undefined,
    });

    const updatedOrder = await orderRepository.updateOrderStatus(
      payment.orderId,
      isSuccess ? "PAID" : "FAILED"
    );

    if (isSuccess && updatedOrder) {
      const fullOrder = await orderRepository.getOrderById(payment.orderId);
      if (fullOrder) {
        broadcastNewOrder(fullOrder);
        sendOrderPlacedWhatsApp(fullOrder);
      }
    }

    return payment;
  },
};
