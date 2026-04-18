import { NextResponse } from "next/server";
import { paymentService } from "@/backend/services/payment.service";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const xVerify = request.headers.get("X-VERIFY") || "";

    const result = await paymentService.handleWebhook(body, xVerify);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, message: result.message });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { success: false, error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
