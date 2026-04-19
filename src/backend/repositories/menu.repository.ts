import { prisma } from "@/backend/lib/db";
import { toTitleCase } from "@/shared/utils/format";

export const menuRepository = {
  async getCafeBySlug(slug: string) {
    return prisma.cafe.findUnique({
      where: { slug, isActive: true },
    });
  },

  async getMenuForCafe(cafeId: string) {
    // All categories visible to this cafe: cafe-specific + global
    const cafeCategories = await prisma.menuCategory.findMany({
      where: { cafeId, isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    const globalCategories = await prisma.menuCategory.findMany({
      where: { cafeId: null, isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    const allCategories = [...cafeCategories, ...globalCategories];

    // All items visible to this cafe: cafe-specific + global
    const cafeItems = await prisma.menuItem.findMany({
      where: { cafeId, isAvailable: true },
      orderBy: { sortOrder: "asc" },
    });
    const globalItems = await prisma.menuItem.findMany({
      where: { cafeId: null, isAvailable: true },
      orderBy: { sortOrder: "asc" },
    });
    const allItems = [...cafeItems, ...globalItems];

    // Group items under their categories
    const categories = allCategories.map((cat) => ({
      ...cat,
      items: allItems.filter((i) => i.categoryId === cat.id),
    }));

    // Anything that didn't match a visible category falls into uncategorized (legacy data)
    const knownCatIds = new Set(allCategories.map((c) => c.id));
    const uncategorized = allItems.filter(
      (i) => !i.categoryId || !knownCatIds.has(i.categoryId)
    );

    return { categories, uncategorized };
  },

  async getAllMenuItems(cafeId: string) {
    return prisma.menuItem.findMany({
      where: { cafeId },
      include: { category: true },
      orderBy: { sortOrder: "asc" },
    });
  },

  // Returns all items across all cafes for admin unified view.
  // Pass cafeId="null" to fetch only global items.
  async getAllMenuItemsAdmin(cafeId?: string) {
    const where =
      cafeId === "null" ? { cafeId: null as null }
      : cafeId ? { cafeId }
      : {};
    return prisma.menuItem.findMany({
      where,
      include: { category: true, cafe: { select: { id: true, name: true, slug: true } } },
      orderBy: [{ createdAt: "desc" }],
    });
  },

  // Returns all global items (cafeId = null)
  async getGlobalMenuItems() {
    return prisma.menuItem.findMany({
      where: { cafeId: null },
      include: { category: true },
      orderBy: { sortOrder: "asc" },
    });
  },

  async getMenuItemsByIds(itemIds: string[], cafeId: string) {
    return prisma.menuItem.findMany({
      where: {
        id: { in: itemIds },
        isAvailable: true,
        // Accept items belonging to this cafe OR global items (cafeId null)
        OR: [{ cafeId }, { cafeId: null }],
      },
    });
  },

  async createMenuItem(data: {
    cafeId?: string | null;
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

  // Returns categories visible to a specific cafe (cafe-specific + global),
  // OR global-only when cafeId is "null", OR all when cafeId is undefined.
  async getCategories(cafeId?: string) {
    if (cafeId === undefined) {
      return prisma.menuCategory.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      });
    }
    if (cafeId === "null") {
      return prisma.menuCategory.findMany({
        where: { cafeId: null, isActive: true },
        orderBy: { sortOrder: "asc" },
      });
    }
    const cafeCategories = await prisma.menuCategory.findMany({
      where: { cafeId, isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    const globalCategories = await prisma.menuCategory.findMany({
      where: { cafeId: null, isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    return [...cafeCategories, ...globalCategories];
  },

  async createCategory(data: { cafeId?: string | null; name: string; sortOrder?: number }) {
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
