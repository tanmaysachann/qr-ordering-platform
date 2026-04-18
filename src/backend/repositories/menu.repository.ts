import { prisma } from "@/backend/lib/db";
import { toTitleCase } from "@/shared/utils/format";

export const menuRepository = {
  async getCafeBySlug(slug: string) {
    return prisma.cafe.findUnique({
      where: { slug, isActive: true },
    });
  },

  async getMenuForCafe(cafeId: string) {
    const categories = await prisma.menuCategory.findMany({
      where: { cafeId, isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        items: {
          where: { isAvailable: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    const uncategorized = await prisma.menuItem.findMany({
      where: { cafeId, isAvailable: true, categoryId: null },
      orderBy: { sortOrder: "asc" },
    });

    return { categories, uncategorized };
  },

  async getAllMenuItems(cafeId: string) {
    return prisma.menuItem.findMany({
      where: { cafeId },
      include: { category: true },
      orderBy: { sortOrder: "asc" },
    });
  },

  async getMenuItemsByIds(itemIds: string[], cafeId: string) {
    return prisma.menuItem.findMany({
      where: {
        id: { in: itemIds },
        cafeId,
        isAvailable: true,
      },
    });
  },

  async createMenuItem(data: {
    cafeId: string;
    categoryId?: string;
    name: string;
    description?: string;
    pricePaise: number;
    imageUrl?: string;
    isVeg?: boolean;
  }) {
    return prisma.menuItem.create({
      data: { ...data, name: toTitleCase(data.name) },
    });
  },

  async updateMenuItem(
    id: string,
    data: {
      name?: string;
      description?: string;
      pricePaise?: number;
      imageUrl?: string;
      isAvailable?: boolean;
      isVeg?: boolean;
      categoryId?: string;
      sortOrder?: number;
    }
  ) {
    const normalized = data.name !== undefined
      ? { ...data, name: toTitleCase(data.name) }
      : data;
    return prisma.menuItem.update({ where: { id }, data: normalized });
  },

  async deleteMenuItem(id: string) {
    return prisma.menuItem.delete({ where: { id } });
  },

  async getCategories(cafeId: string) {
    return prisma.menuCategory.findMany({
      where: { cafeId },
      orderBy: { sortOrder: "asc" },
    });
  },

  async createCategory(data: { cafeId: string; name: string; sortOrder?: number }) {
    return prisma.menuCategory.create({
      data: { ...data, name: toTitleCase(data.name) },
    });
  },

  async updateCategory(id: string, data: { name?: string; sortOrder?: number; isActive?: boolean }) {
    const normalized = data.name !== undefined
      ? { ...data, name: toTitleCase(data.name) }
      : data;
    return prisma.menuCategory.update({ where: { id }, data: normalized });
  },

  async deleteCategory(id: string) {
    // Unlink items from this category first, then delete
    await prisma.menuItem.updateMany({
      where: { categoryId: id },
      data: { categoryId: null },
    });
    return prisma.menuCategory.delete({ where: { id } });
  },

  async getCategoryById(id: string) {
    return prisma.menuCategory.findUnique({ where: { id } });
  },
};
