import { requireAdmin } from "../auth/require-admin";
import prisma from "../prisma";
import type { Prisma } from "../generated/prisma/client";

export type AvailabilityFilter = "all" | "available" | "unavailable";
export type ProductVisibilityFilter = "active" | "archived";

type GetAdminProductsProps = {
  page: string;
  search?: string;
  categoryId?: string;
  availability?: AvailabilityFilter;
  visibility?: ProductVisibilityFilter;
};
export async function getAdminProducts({
  page,
  search,
  categoryId,
  availability,
  visibility = "active",
}: GetAdminProductsProps) {
  await requireAdmin();
  const parsedPage = Number(page);
  const safePage =
    Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const take = 20;
  const skip = (safePage - 1) * take;
  const normalizedSearch = search?.trim();

  const where: Prisma.ProductWhereInput = {
    ...(categoryId ? { categoryId } : {}),
    archivedAt: visibility === "archived" ? { not: null } : null,
    ...(normalizedSearch
      ? {
          name: { contains: normalizedSearch, mode: "insensitive" },
        }
      : {}),
    ...(visibility === "active"
      ? availability === "available"
        ? { isAvailable: true }
        : availability === "unavailable"
          ? { isAvailable: false }
          : {}
      : {}),
  };

  const [products, count] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: [
        {
          sortOrder: "asc",
        },
        { name: "asc" },
      ],
      skip,
      take,
      select: {
        id: true,
        name: true,
        slug: true,
        imageUrl: true,
        pricePesewas: true,
        isAvailable: true,
        isFeatured: true,
        archivedAt: true,
        updatedAt: true,
        category: { select: { id: true, name: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    pagination: {
      page: safePage,
      pageSize: take,
      totalItems: count,
      totalPages: Math.ceil(count / take),
    },
  };
}

export async function getAdminProductCategories() {
  await requireAdmin();

  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
    },
  });
}

export async function getAdminProductById(productId: string) {
  await requireAdmin();

  return prisma.product.findFirst({
    where: {
      id: productId,
      archivedAt: null,
    },
    select: {
      name: true,
      slug: true,
      description: true,
      pricePesewas: true,
      imageUrl: true,
      imagePublicId: true,
      isAvailable: true,
      isFeatured: true,
      categoryId: true,
      sortOrder: true,
      id: true,
    },
  });
}

export type AdminProduct = Awaited<
  ReturnType<typeof getAdminProducts>
>["products"][number];

export type AdminProductCategory = Awaited<
  ReturnType<typeof getAdminProductCategories>
>[number];

export type AdminProductDetails = NonNullable<
  Awaited<ReturnType<typeof getAdminProductById>>
>;
