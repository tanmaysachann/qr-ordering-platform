import { prisma } from "@/backend/lib/db";
import type { UserRole } from "@/generated/prisma";

export const adminRepository = {
  async getAllCafes() {
    return prisma.cafe.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { orders: true, menuItems: true, users: true } },
      },
    });
  },

  async getCafeById(id: string) {
    return prisma.cafe.findUnique({
      where: { id },
      include: {
        _count: { select: { orders: true, menuItems: true, users: true } },
        users: {
          where: { role: "CAFE_OWNER", isActive: true },
          select: { id: true, name: true, email: true },
          take: 1,
        },
      },
    });
  },

  async createCafe(data: {
    name: string;
    slug: string;
    address?: string;
    phone?: string;
    imageUrl?: string;
  }) {
    return prisma.cafe.create({ data });
  },

  async updateCafe(
    id: string,
    data: {
      name?: string;
      address?: string;
      phone?: string;
      imageUrl?: string;
      isActive?: boolean;
      openingTime?: string;
      closingTime?: string;
    }
  ) {
    return prisma.cafe.update({ where: { id }, data });
  },

  async deleteCafe(id: string) {
    // Soft delete — deactivate instead of hard-deleting to preserve order history
    return prisma.cafe.update({
      where: { id },
      data: { isActive: false },
    });
  },

  async hardDeleteCafe(id: string) {
    // Cascade delete everything: payments → orderItems → orders → menuItems → categories → tables → users → cafe
    // Delete in dependency order
    const orders = await prisma.order.findMany({ where: { cafeId: id }, select: { id: true } });
    const orderIds = orders.map((o) => o.id);

    if (orderIds.length > 0) {
      await prisma.payment.deleteMany({ where: { orderId: { in: orderIds } } });
      await prisma.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
      await prisma.order.deleteMany({ where: { cafeId: id } });
    }

    await prisma.menuItem.deleteMany({ where: { cafeId: id } });
    await prisma.menuCategory.deleteMany({ where: { cafeId: id } });
    await prisma.table.deleteMany({ where: { cafeId: id } });
    await prisma.user.deleteMany({ where: { cafeId: id } });
    await prisma.cafe.delete({ where: { id } });
  },

  async getAllUsers() {
    return prisma.user.findMany({
      orderBy: { name: "asc" },
      include: { cafe: { select: { name: true } } },
    });
  },

  async createUser(data: {
    email: string;
    passwordHash: string;
    name: string;
    role: UserRole;
    cafeId?: string;
  }) {
    return prisma.user.create({ data });
  },

  /**
   * Get analytics for a specific cafe within a date range.
   * `from` is the start of the period, `to` defaults to now.
   */
  async getCafeAnalytics(cafeId: string, from: Date, to: Date = new Date()) {
    const where = {
      cafeId,
      status: { in: ["PAID", "PREPARING", "READY", "COMPLETED"] as Array<"PAID" | "PREPARING" | "READY" | "COMPLETED"> },
      createdAt: { gte: from, lte: to },
    };

    const [orderCount, revenue, recentOrders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.aggregate({
        where,
        _sum: { totalPaise: true },
      }),
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          orderNumber: true,
          status: true,
          totalPaise: true,
          customerName: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      orders: orderCount,
      revenue: revenue._sum.totalPaise || 0,
      recentOrders,
    };
  },

  async getAnalyticsOverview() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const cafes = await prisma.cafe.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true },
    });

    const cafeStats = await Promise.all(
      cafes.map(async (cafe) => {
        const [totalOrders, todayOrders, totalRevenue, todayRevenue] =
          await Promise.all([
            prisma.order.count({
              where: { cafeId: cafe.id, status: { notIn: ["FAILED", "CANCELLED"] } },
            }),
            prisma.order.count({
              where: {
                cafeId: cafe.id,
                status: { notIn: ["FAILED", "CANCELLED"] },
                createdAt: { gte: todayStart },
              },
            }),
            prisma.order.aggregate({
              where: { cafeId: cafe.id, status: { in: ["PAID", "PREPARING", "READY", "COMPLETED"] } },
              _sum: { totalPaise: true },
            }),
            prisma.order.aggregate({
              where: {
                cafeId: cafe.id,
                status: { in: ["PAID", "PREPARING", "READY", "COMPLETED"] },
                createdAt: { gte: todayStart },
              },
              _sum: { totalPaise: true },
            }),
          ]);

        return {
          cafeId: cafe.id,
          cafeName: cafe.name,
          cafeSlug: cafe.slug,
          totalOrders,
          todayOrders,
          totalRevenue: totalRevenue._sum.totalPaise || 0,
          todayRevenue: todayRevenue._sum.totalPaise || 0,
        };
      })
    );

    return {
      activeCafes: cafes.length,
      totalOrders: cafeStats.reduce((sum, c) => sum + c.totalOrders, 0),
      totalRevenue: cafeStats.reduce((sum, c) => sum + c.totalRevenue, 0),
      todayOrders: cafeStats.reduce((sum, c) => sum + c.todayOrders, 0),
      todayRevenue: cafeStats.reduce((sum, c) => sum + c.todayRevenue, 0),
      cafeStats,
    };
  },

  async getAuditLogs(limit = 50, offset = 0) {
    return prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      include: { actor: { select: { name: true, email: true } } },
      take: limit,
      skip: offset,
    });
  },
};
