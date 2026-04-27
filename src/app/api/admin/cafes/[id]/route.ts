import { NextResponse } from "next/server";
import { adminRepository } from "@/backend/repositories/admin.repository";
import { requireRole, AuthError } from "@/backend/lib/authz";
import { audit } from "@/backend/lib/audit";
import { rateLimitResponse, getClientIp } from "@/backend/lib/rate-limit";

const UUID_RE = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

function validateId(id: string): boolean {
  return typeof id === "string" && UUID_RE.test(id);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole("SUPER_ADMIN");
    const { id } = await params;
    if (!validateId(id)) {
      return NextResponse.json({ success: false, error: "Invalid id" }, { status: 400 });
    }

    const cafe = await adminRepository.getCafeById(id);
    if (!cafe) {
      return NextResponse.json({ success: false, error: "Cafe not found" }, { status: 404 });
    }

    // Strip secrets — never expose salt key, even to admins on the client.
    const { phonepeSaltKey: _saltKey, ...safeData } = cafe as typeof cafe & { phonepeSaltKey?: string };
    return NextResponse.json({ success: true, data: safeData });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ success: false, error: e.message }, { status: e.status });
    }
    return NextResponse.json({ success: false, error: "Failed to fetch cafe" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireRole("SUPER_ADMIN");

    const limited = rateLimitResponse(`admin-cafe-update:${getClientIp(request)}`, {
      max: 30,
      windowMs: 60 * 1000,
    });
    if (limited) return limited;

    const { id } = await params;
    if (!validateId(id)) {
      return NextResponse.json({ success: false, error: "Invalid id" }, { status: 400 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
    }
    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, error: "Invalid body" }, { status: 400 });
    }

    // Whitelist editable fields (mass-assignment defence)
    const { name, address, phone, openingTime, closingTime } = body as Record<string, unknown>;

    const safeStr = (v: unknown, max: number): string | undefined => {
      if (v === undefined || v === null || v === "") return undefined;
      if (typeof v !== "string") return undefined;
      const t = v.trim();
      if (t.length === 0 || t.length > max) return undefined;
      return t;
    };

    const cleanName = safeStr(name, 100);
    if (!cleanName) {
      return NextResponse.json({ success: false, error: "Cafe name is required" }, { status: 400 });
    }

    const existing = await adminRepository.getCafeById(id);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Cafe not found" }, { status: 404 });
    }

    const updated = await adminRepository.updateCafe(id, {
      name: cleanName,
      address: safeStr(address, 200),
      phone: safeStr(phone, 20),
      openingTime: safeStr(openingTime, 10),
      closingTime: safeStr(closingTime, 10),
    });

    await audit({
      entityType: "Cafe",
      entityId: id,
      action: "update",
      actorId: actor.id,
      oldData: { name: existing.name, address: existing.address, phone: existing.phone },
      newData: { name: cleanName, address: safeStr(address, 200), phone: safeStr(phone, 20) },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ success: false, error: e.message }, { status: e.status });
    }
    return NextResponse.json({ success: false, error: "Failed to update cafe" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireRole("SUPER_ADMIN");
    const { id } = await params;
    if (!validateId(id)) {
      return NextResponse.json({ success: false, error: "Invalid id" }, { status: 400 });
    }

    const cafe = await adminRepository.getCafeById(id);
    if (!cafe) {
      return NextResponse.json({ success: false, error: "Cafe not found" }, { status: 404 });
    }

    if (cafe._count.orders > 0) {
      await adminRepository.deleteCafe(id);
      await audit({
        entityType: "Cafe",
        entityId: id,
        action: "soft_delete",
        actorId: actor.id,
        oldData: { name: cafe.name, slug: cafe.slug },
      });
    } else {
      await adminRepository.hardDeleteCafe(id);
      await audit({
        entityType: "Cafe",
        entityId: id,
        action: "hard_delete",
        actorId: actor.id,
        oldData: { name: cafe.name, slug: cafe.slug },
      });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ success: false, error: e.message }, { status: e.status });
    }
    return NextResponse.json({ success: false, error: "Failed to delete cafe" }, { status: 500 });
  }
}
