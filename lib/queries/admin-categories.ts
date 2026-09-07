import "server-only";

import { requireAdmin } from "../auth/require-admin";
import prisma from "../prisma";

export async function getAdminCategories() {
  await requireAdmin();

  return prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      name: true,
      id: true,
      slug: true,
      description: true,
      isActive: true,
      sortOrder: true,
      updatedAt: true,
      createdAt: true,
      _count: { select: { products: true } },
    },
  });
}

export async function getAdminCategoryById(categoryId: string) {
  await requireAdmin();

  return prisma.category.findUnique({
    where: {
      id: categoryId,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      isActive: true,
      sortOrder: true,
      _count: {
        select: {
          products: true,
        },
      },
    },
  });
}

export type AdminCategoryDetails = NonNullable<
  Awaited<ReturnType<typeof getAdminCategoryById>>
>;

export type AdminCategory = Awaited<
  ReturnType<typeof getAdminCategories>
>[number];
