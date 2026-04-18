import { prisma } from "@/backend/lib/db";

export async function generateOrderNumber(cafeSlug: string): Promise<string> {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
  const prefix = cafeSlug.slice(0, 4).toUpperCase();

  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const count = await prisma.order.count({
    where: {
      cafe: { slug: cafeSlug },
      createdAt: {
        gte: todayStart,
        lt: todayEnd,
      },
    },
  });

  const seq = String(count + 1).padStart(4, "0");
  return `${prefix}-${dateStr}-${seq}`;
}
