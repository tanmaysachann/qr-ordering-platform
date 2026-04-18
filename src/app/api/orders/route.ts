import { NextResponse } from "next/server";
import { orderService } from "@/backend/services/order.service";
import type { CreateOrderRequest } from "@/shared/types";
import {
  normalizePhone,
  validateEmail,
  validateName,
  validatePhone,
} from "@/shared/utils/validation";

export async function POST(request: Request) {
  try {
    const body: CreateOrderRequest = await request.json();

    // Validate required fields
    if (!body.cafeSlug || !body.items?.length || !body.idempotencyKey) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: cafeSlug, items, idempotencyKey" },
        { status: 400 }
      );
    }

    const nameCheck = validateName(body.customerName ?? "");
    if (!nameCheck.valid) {
      return NextResponse.json(
        { success: false, error: nameCheck.error },
        { status: 400 }
      );
    }

    const phoneCheck = validatePhone(body.customerPhone ?? "");
    if (!phoneCheck.valid) {
      return NextResponse.json(
        { success: false, error: phoneCheck.error },
        { status: 400 }
      );
    }

    const emailCheck = validateEmail(body.customerEmail ?? "");
    if (!emailCheck.valid) {
      return NextResponse.json(
        { success: false, error: emailCheck.error },
        { status: 400 }
      );
    }

    body.customerName = body.customerName!.trim();
    body.customerPhone = normalizePhone(body.customerPhone!);
    body.customerEmail = body.customerEmail!.trim().toLowerCase();

    // Validate items
    for (const item of body.items) {
      if (!item.menuItemId || !item.quantity || item.quantity < 1) {
        return NextResponse.json(
          { success: false, error: "Each item must have a valid menuItemId and quantity >= 1" },
          { status: 400 }
        );
      }
    }

    const result = await orderService.createOrder(body);

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create order";
    const status = message.includes("not found") || message.includes("unavailable")
      ? 422
      : message.includes("inactive")
        ? 403
        : 500;

    return NextResponse.json({ success: false, error: message }, { status });
  }
}
