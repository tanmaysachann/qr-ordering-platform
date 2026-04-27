import { NextResponse } from "next/server";
import { auth } from "@/backend/lib/auth";
import { adminRepository } from "@/backend/repositories/admin.repository";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (session?.user?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { phonepeMerchantId, phonepeSaltKey, phonepeSaltIndex } = body;

    if (!phonepeMerchantId?.trim()) {
      return NextResponse.json(
        { success: false, error: "PhonePe Merchant ID is required" },
        { status: 400 }
      );
    }

    const cafe = await adminRepository.getCafeById(id);
    if (!cafe) {
      return NextResponse.json({ success: false, error: "Cafe not found" }, { status: 404 });
    }

    // If salt key is blank but one already exists, keep the existing one
    const saltKey = phonepeSaltKey?.trim();
    const existingCafe = cafe as typeof cafe & { phonepeSaltKey?: string | null };
    if (!saltKey && !existingCafe.phonepeSaltKey) {
      return NextResponse.json(
        { success: false, error: "PhonePe Salt Key is required" },
        { status: 400 }
      );
    }

    const updated = await adminRepository.updateCafePaymentCredentials(id, {
      phonepeMerchantId: phonepeMerchantId.trim(),
      phonepeSaltKey: saltKey || existingCafe.phonepeSaltKey!,
      phonepeSaltIndex: phonepeSaltIndex?.trim() || "1",
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Admin update payment settings error:", error);
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
    const session = await auth();
    if (session?.user?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const cafe = await adminRepository.getCafeById(id);
    if (!cafe) {
      return NextResponse.json({ success: false, error: "Cafe not found" }, { status: 404 });
    }

    await adminRepository.clearCafePaymentCredentials(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin remove payment settings error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove payment settings" },
      { status: 500 }
    );
  }
}
