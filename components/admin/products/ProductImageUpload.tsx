"use client";

import { ImagePlus, RefreshCw, Trash2 } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const uploadFolder = "confirm-bakery/products";

type ProductImageUploadProps = {
  defaultImageUrl?: string;
  defaultImagePublicId?: string | null;
  error?: string;
};

type UploadedImage = {
  secure_url: string;
  public_id: string;
};

export function ProductImageUpload({
  defaultImageUrl = "",
  defaultImagePublicId = null,
  error,
}: ProductImageUploadProps) {
  const [imageUrl, setImageUrl] = useState(defaultImageUrl);
  const [imagePublicId, setImagePublicId] = useState(
    defaultImagePublicId ?? "",
  );

  function removeImage() {
    setImageUrl("");
    setImagePublicId("");
  }

  function saveUpload(upload: UploadedImage) {
    setImageUrl(upload.secure_url);
    setImagePublicId(upload.public_id);
  }

  return (
    <div className="sm:col-span-2">
      <span className="text-sm font-medium">Product image</span>

      <input type="hidden" name="imageUrl" value={imageUrl} />
      <input type="hidden" name="imagePublicId" value={imagePublicId} />

      <div
        className={cn(
          "mt-2 overflow-hidden rounded-2xl border bg-background",
          error && "border-red-500",
        )}
      >
        {imageUrl ? (
          <div className="grid gap-4 p-4 sm:grid-cols-[180px_1fr] sm:items-center">
            <div className="aspect-square overflow-hidden rounded-xl bg-bakery-cream">
              {/* This preview also supports legacy local product images. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="Product image preview"
                className="size-full object-cover"
              />
            </div>

            <div>
              <p className="font-navigation font-semibold">Image ready</p>
              <p className="mt-1 text-sm text-bakery-muted">
                Square images with the product centred work best.
              </p>
              <UploadControls
                hasImage
                onUpload={saveUpload}
                onRemove={removeImage}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center px-5 py-10 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-brand/10 text-brand">
              <ImagePlus className="size-6" aria-hidden="true" />
            </span>
            <p className="mt-3 font-navigation font-semibold">
              Add a product image
            </p>
            <p className="mt-1 max-w-sm text-sm text-bakery-muted">
              Upload a JPG, PNG or WebP image up to 5 MB.
            </p>
            <UploadControls
              hasImage={false}
              onUpload={saveUpload}
              onRemove={removeImage}
            />
          </div>
        )}
      </div>

      {error && (
        <span id="imageUrl-error" className="mt-1 block text-sm text-red-700">
          {error}
        </span>
      )}
    </div>
  );
}

function UploadControls({
  hasImage,
  onUpload,
  onRemove,
}: {
  hasImage: boolean;
  onUpload: (upload: UploadedImage) => void;
  onRemove: () => void;
}) {
  return (
    <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
      <CldUploadWidget
        signatureEndpoint="/api/cloudinary/sign"
        options={{
          folder: uploadFolder,
          multiple: false,
          maxFiles: 1,
          maxFileSize: 5_000_000,
          clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
          sources: ["local", "camera"],
        }}
        onSuccess={(result) => {
          if (typeof result.info !== "object" || !result.info) return;

          const upload = result.info as UploadedImage;

          if (upload.secure_url && upload.public_id) onUpload(upload);
        }}
      >
        {({ open }) => (
          <Button
            type="button"
            variant={hasImage ? "outline" : "default"}
            onClick={() => open()}
            className={cn(
              "cursor-pointer",
              !hasImage && "bg-brand text-white hover:bg-brand/90",
            )}
          >
            {hasImage ? (
              <RefreshCw className="size-4" aria-hidden="true" />
            ) : (
              <ImagePlus className="size-4" aria-hidden="true" />
            )}
            {hasImage ? "Replace image" : "Upload image"}
          </Button>
        )}
      </CldUploadWidget>

      {hasImage && (
        <Button
          type="button"
          variant="outline"
          onClick={onRemove}
          className="cursor-pointer text-red-700 hover:border-red-200 hover:bg-red-50 hover:text-red-800"
        >
          <Trash2 className="size-4" aria-hidden="true" />
          Remove
        </Button>
      )}
    </div>
  );
}
