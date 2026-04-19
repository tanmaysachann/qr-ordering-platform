import { NextResponse } from "next/server";
import { auth } from "@/backend/lib/auth";
import { menuRepository } from "@/backend/repositories/menu.repository";
import { sseManager } from "@/backend/lib/sse";
import { prisma } from "@/backend/lib/db";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") return null;
  return session;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { itemId } = await params;
    const body = await request.json();

    // categoryId, if being changed, must be a non-empty string (every item must have a category)
    if ("categoryId" in body && !body.categoryId) {
      return NextResponse.json({ success: false, error: "Category is required" }, { status: 400 });
    }

    const updated = await menuRepository.updateMenuItem(itemId, {
      name: body.name,
      description: body.description,
      pricePaise: body.pricePaise,
      imageUrl: body.imageUrl,
      isAvailable: body.isAvailable,
      isVeg: body.isVeg,
      categoryId: body.categoryId,
      sortOrder: body.sortOrder,
    });

    if (updated.cafeId) sseManager.broadcastMenuUpdate(updated.cafeId);

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Admin menu update error:", error);
    return NextResponse.json({ success: false, error: "Failed to update item" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { itemId } = await params;

    // Fetch cafeId before deletion so we can broadcast
    const item = await prisma.menuItem.findUnique({ where: { id: itemId }, select: { cafeId: true } });
    await menuRepository.deleteMenuItem(itemId);

    if (item?.cafeId) sseManager.broadcastMenuUpdate(item.cafeId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin menu delete error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete item" }, { status: 500 });
  }
}
