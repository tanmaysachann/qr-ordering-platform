import { NextResponse } from "next/server";
import { auth } from "@/backend/lib/auth";
import { adminRepository } from "@/backend/repositories/admin.repository";
import { hashPassword } from "@/backend/lib/utils/password";
import type { CreateUserRequest } from "@/shared/types";

export async function GET() {
  try {
    const session = await auth();
    if (session?.user?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const users = await adminRepository.getAllUsers();
    const data = users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      cafeId: u.cafeId,
      cafeName: u.cafe?.name,
      isActive: u.isActive,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Admin users error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body: CreateUserRequest = await request.json();

    if (!body.email || !body.password || !body.name || !body.role) {
      return NextResponse.json(
        { success: false, error: "Email, password, name, and role are required" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(body.password);

    const user = await adminRepository.createUser({
      email: body.email,
      passwordHash,
      name: body.name,
      role: body.role,
      cafeId: body.cafeId,
    });

    return NextResponse.json(
      { success: true, data: { id: user.id, email: user.email, name: user.name, role: user.role } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin create user error:", error);
    return NextResponse.json({ success: false, error: "Failed to create user" }, { status: 500 });
  }
}
