"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";
import { categorySchema, type CategoryInput } from "@/lib/validation/category";

export type CategoryActionState = {
  success: boolean;
  message?: string;
  errors?: Partial<Record<keyof CategoryInput, string[]>>;
};

export async function createCategoryAction(
  _previousState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  await requireAdmin();

  const result = categorySchema.safeParse(getCategoryFormValues(formData));

  if (!result.success) {
    return {
      success: false,
      message: "Please correct the highlighted fields.",
      errors: result.error.flatten().fieldErrors,
    };
  }

  const category = result.data;
  const slug =
    createSlug(category.name) || `category-${crypto.randomUUID().slice(0, 8)}`;

  try {
    const existingCategory = await prisma.category.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (existingCategory) {
      return {
        success: false,
        message: "A category with this name already exists.",
        errors: {
          name: ["Please use a different category name."],
        },
      };
    }

    await prisma.category.create({
      data: {
        name: category.name,
        slug,
        description: category.description || null,
        isActive: category.isActive,
        sortOrder: category.sortOrder,
      },
    });

    revalidatePath("/");
    revalidatePath("/menu");
    revalidatePath("/admin/categories");
    revalidatePath("/admin/products/new");

    return {
      success: true,
      message: "Category created successfully.",
    };
  } catch (error) {
    console.error("Category creation failed:", error);

    return {
      success: false,
      message: "We could not create the category. Please try again.",
    };
  }
}

export async function updateCategoryAction(
  _previousState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  await requireAdmin();

  const categoryId = formData.get("categoryId");

  if (typeof categoryId !== "string" || !categoryId) {
    return {
      success: false,
      message: "A valid category ID is required.",
    };
  }

  const result = categorySchema.safeParse(getCategoryFormValues(formData));

  if (!result.success) {
    return {
      success: false,
      message: "Please correct the highlighted fields.",
      errors: result.error.flatten().fieldErrors,
    };
  }

  const category = result.data;

  try {
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
      },
    });

    if (!existingCategory) {
      return {
        success: false,
        message: "This category no longer exists.",
      };
    }

    if (existingCategory.isActive && !category.isActive) {
      const availableProductCount = await prisma.product.count({
        where: {
          categoryId,
          archivedAt: null,
          isAvailable: true,
        },
      });

      if (availableProductCount > 0) {
        return {
          success: false,
          message:
            `This category contains ${availableProductCount} available ` +
            `${availableProductCount === 1 ? "product" : "products"}. ` +
            "Make them unavailable before deactivating the category.",
        };
      }
    }

    const nextSlug =
      category.name === existingCategory.name
        ? existingCategory.slug
        : createSlug(category.name) ||
          `category-${crypto.randomUUID().slice(0, 8)}`;

    const conflictingCategory = await prisma.category.findFirst({
      where: {
        slug: nextSlug,
        id: {
          not: categoryId,
        },
      },
      select: {
        id: true,
      },
    });

    if (conflictingCategory) {
      return {
        success: false,
        message: "A category with this name already exists.",
        errors: {
          name: ["Please use a different category name."],
        },
      };
    }

    const updateResult = await prisma.category.updateMany({
      where: {
        id: categoryId,
      },
      data: {
        name: category.name,
        slug: nextSlug,
        description: category.description || null,
        isActive: category.isActive,
        sortOrder: category.sortOrder,
      },
    });

    if (updateResult.count !== 1) {
      return {
        success: false,
        message: "This category changed. Refresh and try again.",
      };
    }

    revalidatePath("/");
    revalidatePath("/menu");
    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    revalidatePath("/admin/products/new");
    revalidatePath(`/admin/categories/${categoryId}/edit`);

    return {
      success: true,
      message: "Category updated successfully.",
    };
  } catch (error) {
    console.error("Category update failed:", error);

    return {
      success: false,
      message: "We could not update the category. Please try again.",
    };
  }
}

function createSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getCategoryFormValues(formData: FormData) {
  return {
    name: formData.get("name"),
    description: formData.get("description"),
    isActive: formData.get("isActive") === "on",
    sortOrder: Number(formData.get("sortOrder") ?? 0),
  };
}
