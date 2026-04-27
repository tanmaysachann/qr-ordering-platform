import { NextResponse } from "next/server";
import { adminRepository } from "@/backend/repositories/admin.repository";
import { hashPassword, validatePasswordStrength } from "@/backend/lib/utils/password";
import { requireRole, AuthError } from "@/backend/lib/authz";
import { audit } from "@/backend/lib/audit";
import { rateLimitResponse, getClientIp } from "@/backend/lib/rate-limit";
import { validateEmail, validateName } from "@/shared/utils/validation";
import { prisma } from "@/backend/lib/db";

export async function GET() {
  try {
    await requireRole("SUPER_ADMIN");
    const cafes = await adminRepository.getAllCafes();
    const safeCafes = cafes.map((c) => {
      const { phonepeSaltKey: _sk, ...rest } = c as typeof c & { phonepeSaltKey?: string | null };
      return rest;
    });
    return NextResponse.json({ success: true, data: safeCafes });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ success: false, error: e.message }, { status: e.status });
    }
    return NextResponse.json({ success: false, error: "Failed to fetch cafes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireRole("SUPER_ADMIN");

    const limited = rateLimitResponse(`admin-cafe-create:${getClientIp(request)}`, {
      max: 10,
      windowMs: 60 * 1000,
    });
    if (limited) return limited;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
    }
    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, error: "Invalid body" }, { status: 400 });
    }

    // Whitelist fields (mass assignment defence — explicitly NOT taking phonepeSaltKey/Index here)
    const {
      name,
      address,
      phone,
      imageUrl,
      ownerName,
      ownerEmail,
      ownerPassword,
    } = body as Record<string, unknown>;

    if (
      typeof name !== "string" || typeof address !== "string" ||
      typeof phone !== "string" ||
      typeof ownerName !== "string" || typeof ownerEmail !== "string" ||
      typeof ownerPassword !== "string"
    ) {
      return NextResponse.json(
        { success: false, error: "name, address, phone, ownerName, ownerEmail, ownerPassword required" },
        { status: 400 }
      );
    }
    if (name.trim().length === 0 || name.length > 100) {
      return NextResponse.json({ success: false, error: "Invalid cafe name" }, { status: 400 });
    }
    if (address.trim().length === 0 || address.length > 200) {
      return NextResponse.json({ success: false, error: "Invalid address" }, { status: 400 });
    }
    if (phone.trim().length === 0 || phone.length > 20) {
      return NextResponse.json({ success: false, error: "Invalid phone" }, { status: 400 });
    }
    if (imageUrl !== undefined && imageUrl !== null && imageUrl !== "") {
      if (
        typeof imageUrl !== "string" ||
        imageUrl.length > 500 ||
        !/^https:\/\//.test(imageUrl)
      ) {
        return NextResponse.json({ success: false, error: "Invalid imageUrl" }, { status: 400 });
      }
    }

    const ownerNameCheck = validateName(ownerName);
    if (!ownerNameCheck.valid) {
      return NextResponse.json({ success: false, error: ownerNameCheck.error }, { status: 400 });
    }
    const ownerEmailCheck = validateEmail(ownerEmail);
    if (!ownerEmailCheck.valid) {
      return NextResponse.json({ success: false, error: ownerEmailCheck.error }, { status: 400 });
    }
    const passCheck = validatePasswordStrength(ownerPassword);
    if (!passCheck.valid) {
      return NextResponse.json({ success: false, error: passCheck.error }, { status: 400 });
    }

    const normalizedEmail = ownerEmail.trim().toLowerCase();
    const slugMatch = normalizedEmail.match(/^owner@([a-z0-9][a-z0-9-]{0,40})\./);
    if (!slugMatch) {
      return NextResponse.json(
        { success: false, error: "Owner email must be in the format: owner@branch-name.com" },
        { status: 400 }
      );
    }
    const slug = slugMatch[1];

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "A user with this email already exists" },
        { status: 409 }
      );
    }

    const cafe = await adminRepository.createCafe({
      name: name.trim(),
      slug,
      address: address.trim(),
      phone: phone.trim(),
      imageUrl: typeof imageUrl === "string" ? imageUrl : undefined,
    });

    const passwordHash = await hashPassword(ownerPassword);
    const owner = await adminRepository.createUser({
      email: normalizedEmail,
      passwordHash,
      name: ownerName.trim(),
      role: "CAFE_OWNER",
      cafeId: cafe.id,
    });

    await audit({
      entityType: "Cafe",
      entityId: cafe.id,
      action: "create",
      actorId: actor.id,
      newData: { name: cafe.name, slug: cafe.slug, ownerEmail: owner.email },
    });
    await audit({
      entityType: "User",
      entityId: owner.id,
      action: "create",
      actorId: actor.id,
      newData: { email: owner.email, role: "CAFE_OWNER", cafeId: cafe.id },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          ...cafe,
          owner: { id: owner.id, email: owner.email, name: owner.name },
        },
      },
      { status: 201 }
    );
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ success: false, error: e.message }, { status: e.status });
    }
    const message = e instanceof Error ? e.message : "Failed to create cafe";
    const isDuplicate = message.includes("Unique constraint");
    return NextResponse.json(
      { success: false, error: isDuplicate ? "A user with this email already exists" : "Failed to create cafe" },
      { status: isDuplicate ? 409 : 500 }
    );
  }
}
