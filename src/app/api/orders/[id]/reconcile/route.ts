import { NextResponse } from "next/server";
import { paymentService } from "@/backend/services/payment.service";
import { paymentRepository } from "@/backend/repositories/payment.repository";
import { orderService } from "@/backend/services/order.service";

/**
 * POST /api/orders/[id]/reconcile
 * Triggers a server-side payment status check with PhonePe.
 * Called by the payment-return page when the user comes back from PhonePe.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    const body = await request.json();
    const merchantTxnId = body.merchantTransactionId as string;

    if (!merchantTxnId) {
      return NextResponse.json(
        { success: false, error: "merchantTransactionId is required" },
        { status: 400 }
      );
    }

    // Verify the txn belongs to this order
    const payment = await paymentRepository.findByMerchantTxnId(merchantTxnId);
    if (!payment || payment.orderId !== orderId) {
      return NextResponse.json(
        { success: false, error: "Payment not found for this order" },
        { status: 404 }
      );
    }

    // If already resolved, just return current status
    if (payment.status === "SUCCESS") {
      const order = await orderService.getOrderStatus(orderId);
      return NextResponse.json({ success: true, data: order });
    }

    // Reconcile with PhonePe
    await paymentService.reconcilePayment(merchantTxnId);

    // Return updated order status
    const order = await orderService.getOrderStatus(orderId);
    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error("Reconcile error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reconcile payment" },
      { status: 500 }
    );
  }
}
