import { NextResponse } from "next/server";
import { menuService } from "@/backend/services/menu.service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const result = await menuService.getCafeMenu(slug);

    if (!result) {
      return NextResponse.json(
        { success: false, error: "Cafe not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Menu fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch menu" },
      { status: 500 }
    );
  }
}
