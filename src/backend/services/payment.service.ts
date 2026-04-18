import { paymentRepository } from "@/backend/repositories/payment.repository";
import { orderRepository } from "@/backend/repositories/order.repository";
import { adminRepository } from "@/backend/repositories/admin.repository";
import { verifyWebhookSignature, checkPaymentStatus } from "@/backend/lib/phonepe";
import { sseManager } from "@/backend/lib/sse";
import { notifyOrderPlaced } from "@/backend/lib/whatsapp";
import { notifyOrderPlacedEmail } from "@/backend/lib/email";
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

async function sendOrderPlacedEmail(fullOrder: FullOrder) {
  if (!fullOrder.customerEmail) return;
  const cafe = await adminRepository.getCafeById(fullOrder.cafeId).catch(() => null);
  const payment = fullOrder.payments[0];

  notifyOrderPlacedEmail({
    customerEmail: fullOrder.customerEmail,
    customerName: fullOrder.customerName || "there",
    customerPhone: fullOrder.customerPhone,
    orderNumber: fullOrder.orderNumber,
    totalPaise: fullOrder.totalPaise,
    cafeName: fullOrder.cafe?.name || cafe?.name || "the cafe",
    cafeAddress: cafe?.address ?? null,
    cafeSlug: fullOrder.cafe?.slug || "",
    orderId: fullOrder.id,
    notes: fullOrder.notes,
    paymentMethod: payment?.paymentMethod ?? null,
    placedAt: fullOrder.createdAt,
    items: fullOrder.items.map((i) => ({
      itemName: i.itemName,
      quantity: i.quantity,
      itemPricePaise: i.itemPricePaise,
      subtotalPaise: i.subtotalPaise,
    })),
  }).catch((err) => console.error("[Email] notifyOrderPlacedEmail failed:", err));
}

export const paymentService = {
  async handleWebhook(
    body: string,
    xVerifyHeader: string
  ): Promise<{ success: boolean; message: string }> {
    // Verify signature
    if (!verifyWebhookSignature(body, xVerifyHeader)) {
      return { success: false, message: "Invalid signature" };
    }

    const decoded = JSON.parse(
      Buffer.from(JSON.parse(body).response, "base64").toString()
    );

    const merchantTxnId = decoded.data?.merchantTransactionId;
    if (!merchantTxnId) {
      return { success: false, message: "Missing merchantTransactionId" };
    }

    const payment = await paymentRepository.findByMerchantTxnId(merchantTxnId);
    if (!payment) {
      return { success: false, message: "Payment not found" };
    }

    // Idempotent: already processed
    if (payment.status === "SUCCESS" || payment.status === "REFUNDED") {
      return { success: true, message: "Already processed" };
    }

    const isSuccess = decoded.code === "PAYMENT_SUCCESS";

    await paymentRepository.updatePaymentStatus(merchantTxnId, {
      status: isSuccess ? "SUCCESS" : "FAILED",
      phonepeTxnId: decoded.data?.transactionId,
      paymentMethod: decoded.data?.paymentInstrument?.type,
      webhookPayload: decoded as Prisma.InputJsonValue,
      paidAt: isSuccess ? new Date() : undefined,
    });

    const newOrderStatus = isSuccess ? "PAID" : "FAILED";
    const updatedOrder = await orderRepository.updateOrderStatus(
      payment.orderId,
      newOrderStatus as "PAID" | "FAILED"
    );

    // Push SSE for successful payments
    if (isSuccess && updatedOrder) {
      const fullOrder = await orderRepository.getOrderById(payment.orderId);
      if (fullOrder) {
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

        sendOrderPlacedWhatsApp(fullOrder);
        sendOrderPlacedEmail(fullOrder).catch((err) =>
          console.error("[Email] sendOrderPlacedEmail failed:", err)
        );
      }
    }

    return { success: true, message: isSuccess ? "Payment confirmed" : "Payment failed" };
  },

  async reconcilePayment(merchantTxnId: string) {
    const result = await checkPaymentStatus(merchantTxnId);
    if (!result.success) return null;

    const payment = await paymentRepository.findByMerchantTxnId(merchantTxnId);
    if (!payment || payment.status === "SUCCESS") return payment;

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

    // Push SSE for successful payments (same as webhook flow)
    if (isSuccess && updatedOrder) {
      const fullOrder = await orderRepository.getOrderById(payment.orderId);
      if (fullOrder) {
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

        sendOrderPlacedWhatsApp(fullOrder);
        sendOrderPlacedEmail(fullOrder).catch((err) =>
          console.error("[Email] sendOrderPlacedEmail failed:", err)
        );
      }
    }

    return payment;
  },
};
