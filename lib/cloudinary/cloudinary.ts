import "server-only";

import { v2 as cloudinary } from "cloudinary";

const productImageFolder = "confirm-bakery/products";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export function isProductImagePublicId(publicId: string) {
  return publicId.startsWith(`${productImageFolder}/`);
}

export async function deleteProductImage(publicId: string) {
  if (!isProductImagePublicId(publicId)) {
    throw new Error("Refusing to delete an image outside the product folder.");
  }

  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
    invalidate: true,
  });

  if (result.result !== "ok" && result.result !== "not found") {
    throw new Error(`Cloudinary deletion failed: ${result.result}`);
  }
}
