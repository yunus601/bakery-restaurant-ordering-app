import prisma from "../prisma";

export async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { isAvailable: true, isFeatured: true, archivedAt: null },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      imageUrl: true,
      isAvailable: true,
      pricePesewas: true,
      slug: true,
      category: {
        select: {
          name: true,
        },
      },
    },
  });
}

export function getMenuProducts(categorySlug?: string) {
  return prisma.product.findMany({
    where: {
      archivedAt: null,
      category: {
        isActive: true,
        ...(categorySlug ? { slug: categorySlug } : {}),
      },
    },
    select: {
      name: true,
      imageUrl: true,
      slug: true,
      pricePesewas: true,
      id: true,
      isAvailable: true,
      category: {
        select: {
          name: true,
        },
      },
    },
    orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }],
  });
}
