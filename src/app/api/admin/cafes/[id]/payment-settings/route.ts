import { NextResponse } from "next/server";
import { adminRepository } from "@/backend/repositories/admin.repository";
import { requireRole, AuthError } from "@/backend/lib/authz";
import { audit } from "@/backend/lib/audit";
import { rateLimitResponse, getClientIp } from "@/backend/lib/rate-limit";

const UUID_RE = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireRole("SUPER_ADMIN");

    const limited = rateLimitResponse(`admin-payment-settings:${getClientIp(request)}`, {
      max: 20,
      windowMs: 60 * 1000,
    });
    if (limited) return limited;

    const { id } = await params;
    if (!UUID_RE.test(id)) {
      return NextResponse.json({ success: false, error: "Invalid id" }, { status: 400 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
    }
    const { phonepeMerchantId, phonepeSaltKey, phonepeSaltIndex } =
      (body ?? {}) as Record<string, unknown>;

    if (typeof phonepeMerchantId !== "string" || phonepeMerchantId.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "PhonePe Merchant ID is required" },
        { status: 400 }
      );
    }
    if (phonepeMerchantId.length > 64) {
      return NextResponse.json({ success: false, error: "Merchant ID too long" }, { status: 400 });
    }

    const cafe = await adminRepository.getCafeById(id);
    if (!cafe) {
      return NextResponse.json({ success: false, error: "Cafe not found" }, { status: 404 });
    }

    const newSaltKey = typeof phonepeSaltKey === "string" ? phonepeSaltKey.trim() : "";
    if (newSaltKey.length > 256) {
      return NextResponse.json({ success: false, error: "Salt key too long" }, { status: 400 });
    }

    const existingCafe = cafe as typeof cafe & { phonepeSaltKey?: string | null };
    if (!newSaltKey && !existingCafe.phonepeSaltKey) {
      return NextResponse.json(
        { success: false, error: "PhonePe Salt Key is required" },
        { status: 400 }
      );
    }

    const saltIndex =
      typeof phonepeSaltIndex === "string" && /^[0-9]{1,3}$/.test(phonepeSaltIndex.trim())
        ? phonepeSaltIndex.trim()
        : "1";

    const updated = await adminRepository.updateCafePaymentCredentials(id, {
      phonepeMerchantId: phonepeMerchantId.trim(),
      phonepeSaltKey: newSaltKey || existingCafe.phonepeSaltKey!,
      phonepeSaltIndex: saltIndex,
    });

    // Never log salt key value — only that it was rotated.
    await audit({
      entityType: "Cafe",
      entityId: id,
      action: "payment_settings_update",
      actorId: actor.id,
      newData: {
        phonepeMerchantId: phonepeMerchantId.trim(),
        phonepeSaltIndex: saltIndex,
        saltKeyRotated: !!newSaltKey,
      },
    });

    // Strip salt key from response
    const { phonepeSaltKey: _sk, ...safe } = updated as typeof updated & { phonepeSaltKey?: string };
    return NextResponse.json({ success: true, data: safe });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ success: false, error: e.message }, { status: e.status });
    }
    return NextResponse.json(
      { success: false, error: "Failed to update payment settings" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireRole("SUPER_ADMIN");
    const { id } = await params;
    if (!UUID_RE.test(id)) {
      return NextResponse.json({ success: false, error: "Invalid id" }, { status: 400 });
    }

    const cafe = await adminRepository.getCafeById(id);
    if (!cafe) {
      return NextResponse.json({ success: false, error: "Cafe not found" }, { status: 404 });
    }

    await adminRepository.clearCafePaymentCredentials(id);

    await audit({
      entityType: "Cafe",
      entityId: id,
      action: "payment_settings_clear",
      actorId: actor.id,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ success: false, error: e.message }, { status: e.status });
    }
    return NextResponse.json(
      { success: false, error: "Failed to remove payment settings" },
      { status: 500 }
    );
  }
}
