"use server";

import { requireAdmin } from "@/lib/auth/require-admin";
import prisma from "@/lib/prisma";
import { productSchema, type ProductInput } from "@/lib/validation/product";
import { revalidatePath } from "next/cache";
import z from "zod";
import {
  deleteProductImage,
  isProductImagePublicId,
} from "@/lib/cloudinary/cloudinary";

export type ProductActionState = {
  success: boolean;
  message?: string;
  errors?: Partial<Record<keyof ProductInput, string[]>>;
};

const archiveProductSchema = z.object({
  productId: z.string().min(1),
});

export type ArchiveProductState = {
  success: boolean;
  message?: string;
};

const cleanupProductImageSchema = z.object({
  publicId: z.string().trim().min(1),
});

export async function createProductAction(
  _previousState: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  await requireAdmin();

  const result = productSchema.safeParse(getProductFormValues(formData));

  if (!result.success) {
    return {
      success: false,
      message: "Please correct the highlighted fields.",
      errors: result.error.flatten().fieldErrors,
    };
  }

  const product = result.data;

  if (!isValidCloudinaryImage(product.imageUrl, product.imagePublicId)) {
    return invalidProductImageState();
  }

  try {
    const category = await prisma.category.findFirst({
      where: {
        id: product.categoryId,
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    if (!category) {
      return {
        success: false,
        message: "Please select a valid category.",
        errors: {
          categoryId: ["The selected category does not exist or is inactive."],
        },
      };
    }

    const slug =
      createSlug(product.name) || `product-${crypto.randomUUID().slice(0, 8)}`;

    const existingProduct = await prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (existingProduct) {
      return {
        success: false,
        message: "A product with this name already exists.",
        errors: {
          name: ["Please use a different product name."],
        },
      };
    }
    const pricePesewas = ghsToPesewas(product.priceGhs);

    await prisma.product.create({
      data: {
        name: product.name,
        slug,
        description: product.description || null,
        pricePesewas,
        imageUrl: product.imageUrl,
        imagePublicId: product.imagePublicId,
        categoryId: product.categoryId,
        isAvailable: product.isAvailable,
        isFeatured: product.isFeatured,
        sortOrder: product.sortOrder,
      },
    });

    revalidatePath("/");
    revalidatePath("/menu");
    revalidatePath("/admin/products");

    return {
      success: true,
      message: "Product created successfully.",
    };
  } catch (error) {
    console.error("Product creation failed:", error);

    return {
      success: false,
      message: "We could not create the product. Please try again.",
    };
  }
}

export async function updateProductAction(
  _previousState: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  await requireAdmin();

  const productId = formData.get("productId");

  if (typeof productId !== "string" || !productId) {
    return {
      success: false,
      message: "A valid product ID is required.",
    };
  }

  const result = productSchema.safeParse(getProductFormValues(formData));

  if (!result.success) {
    return {
      success: false,
      message: "Please correct the highlighted fields.",
      errors: result.error.flatten().fieldErrors,
    };
  }

  const product = result.data;

  try {
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: productId,
        archivedAt: null,
      },
      select: {
        id: true,
        slug: true,
        name: true,
        imageUrl: true,
        imagePublicId: true,
      },
    });

    if (!existingProduct) {
      return {
        success: false,
        message: "This product no longer exists.",
      };
    }

    const keptLegacyImage =
      !existingProduct.imagePublicId &&
      !product.imagePublicId &&
      product.imageUrl === existingProduct.imageUrl;

    if (
      !keptLegacyImage &&
      !isValidCloudinaryImage(product.imageUrl, product.imagePublicId)
    ) {
      return invalidProductImageState();
    }

    const category = await prisma.category.findFirst({
      where: {
        id: product.categoryId,
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    if (!category) {
      return {
        success: false,
        message: "Please select a valid category.",
        errors: {
          categoryId: ["The selected category does not exist or is inactive."],
        },
      };
    }

    const nextSlug =
      product.name === existingProduct.name
        ? existingProduct.slug
        : createSlug(product.name) ||
          `product-${crypto.randomUUID().slice(0, 8)}`;

    const conflictingProduct = await prisma.product.findFirst({
      where: {
        slug: nextSlug,
        id: {
          not: productId,
        },
      },
      select: {
        id: true,
      },
    });

    if (conflictingProduct) {
      return {
        success: false,
        message: "A product with this name already exists.",
        errors: {
          name: ["Please use a different product name."],
        },
      };
    }

    const updateResult = await prisma.product.updateMany({
      where: {
        id: productId,
        archivedAt: null,
      },
      data: {
        name: product.name,
        slug: nextSlug,
        description: product.description || null,
        pricePesewas: ghsToPesewas(product.priceGhs),
        imageUrl: product.imageUrl,
        imagePublicId: product.imagePublicId,
        categoryId: product.categoryId,
        isAvailable: product.isAvailable,
        isFeatured: product.isFeatured,
        sortOrder: product.sortOrder,
      },
    });

    if (updateResult.count !== 1) {
      return {
        success: false,
        message:
          "This product changed while you were editing it. Refresh and try again.",
      };
    }

    const previousImagePublicId = existingProduct.imagePublicId;

    if (
      previousImagePublicId &&
      previousImagePublicId !== product.imagePublicId
    ) {
      try {
        await deleteProductImage(previousImagePublicId);
      } catch (error) {
        console.error("Old product image cleanup failed:", error);
      }
    }

    revalidatePath("/");
    revalidatePath("/menu");
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${productId}/edit`);

    return {
      success: true,
      message: "Product updated successfully.",
    };
  } catch (error) {
    console.error("Product update failed:", error);

    return {
      success: false,
      message: "We could not update the product. Please try again.",
    };
  }
}

export async function cleanupProductImageAction(publicId: string) {
  await requireAdmin();

  const result = cleanupProductImageSchema.safeParse({ publicId });

  if (!result.success || !isProductImagePublicId(result.data.publicId)) {
    return {
      success: false,
      message: "Invalid product image.",
    };
  }

  const productUsingImage = await prisma.product.findFirst({
    where: {
      imagePublicId: result.data.publicId,
    },
    select: {
      id: true,
    },
  });

  if (productUsingImage) {
    return {
      success: false,
      message: "This image is currently assigned to a product.",
    };
  }

  try {
    await deleteProductImage(result.data.publicId);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Unused product image cleanup failed:", error);

    return {
      success: false,
      message: "The unused image could not be removed.",
    };
  }
}

export async function archiveProductAction(
  _previousState: ArchiveProductState,
  formData: FormData,
): Promise<ArchiveProductState> {
  await requireAdmin();

  const result = archiveProductSchema.safeParse({
    productId: formData.get("productId"),
  });

  if (!result.success) {
    return {
      success: false,
      message: "A valid product ID is required.",
    };
  }

  try {
    const updateResult = await prisma.product.updateMany({
      where: {
        id: result.data.productId,
        archivedAt: null,
      },
      data: {
        archivedAt: new Date(),
        isAvailable: false,
        isFeatured: false,
      },
    });

    if (updateResult.count !== 1) {
      return {
        success: false,
        message: "This product no longer exists or is already archived.",
      };
    }

    revalidatePath("/");
    revalidatePath("/menu");
    revalidatePath("/admin/products");

    return {
      success: true,
      message: "Product archived successfully.",
    };
  } catch (error) {
    console.error("Product archive failed:", error);

    return {
      success: false,
      message: "We could not archive the product. Please try again.",
    };
  }
}

export async function restoreProductAction(
  _previousState: ArchiveProductState,
  formData: FormData,
): Promise<ArchiveProductState> {
  await requireAdmin();

  const result = archiveProductSchema.safeParse({
    productId: formData.get("productId"),
  });

  if (!result.success) {
    return {
      success: false,
      message: "A valid product ID is required.",
    };
  }

  try {
    const updateResult = await prisma.product.updateMany({
      where: {
        id: result.data.productId,
        archivedAt: { not: null },
      },
      data: {
        archivedAt: null,
        isAvailable: false,
      },
    });

    if (updateResult.count !== 1) {
      return {
        success: false,
        message: "This product no longer exists or is already active.",
      };
    }

    revalidatePath("/");
    revalidatePath("/menu");
    revalidatePath("/admin/products");

    return {
      success: true,
      message: "Product restored as unavailable.",
    };
  } catch (error) {
    console.error("Product restoration failed:", error);

    return {
      success: false,
      message: "We could not restore the product. Please try again.",
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

function ghsToPesewas(priceGhs: string) {
  const [cedis, decimal = ""] = priceGhs.split(".");
  const pesewas = decimal.padEnd(2, "0");

  return Number(cedis) * 100 + Number(pesewas);
}

function getProductFormValues(formData: FormData) {
  return {
    name: formData.get("name"),
    description: formData.get("description"),
    priceGhs: formData.get("priceGhs"),
    imageUrl: formData.get("imageUrl"),
    imagePublicId: normalizeOptionalString(formData.get("imagePublicId")),
    categoryId: formData.get("categoryId"),
    isAvailable: formData.get("isAvailable") === "on",
    isFeatured: formData.get("isFeatured") === "on",
    sortOrder: Number(formData.get("sortOrder") ?? 0),
  };
}

function normalizeOptionalString(value: FormDataEntryValue | null) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function isValidCloudinaryImage(
  imageUrl: string,
  imagePublicId: string | null,
) {
  if (!imagePublicId?.startsWith("confirm-bakery/products/")) return false;

  try {
    const url = new URL(imageUrl);
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    return (
      url.protocol === "https:" &&
      url.hostname === "res.cloudinary.com" &&
      (!cloudName || url.pathname.startsWith(`/${cloudName}/`))
    );
  } catch {
    return false;
  }
}

function invalidProductImageState(): ProductActionState {
  return {
    success: false,
    message: "Please upload a valid product image.",
    errors: {
      imageUrl: ["Upload the image using the product image uploader."],
    },
  };
}
