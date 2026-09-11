"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/lib/auth/require-user";
import { prisma } from "@/lib/prisma";
import {
  addressSchema,
  MAX_SAVED_ADDRESSES,
  type AddressInput,
} from "@/lib/validation/address";

export type AddressActionState = {
  success: boolean;
  message?: string;
  errors?: Partial<Record<keyof AddressInput, string[]>>;
};

const addressIdSchema = z.object({
  addressId: z.string().trim().min(1),
});

function getAddressFormValues(formData: FormData) {
  return {
    label: formData.get("label"),
    recipient: formData.get("recipient"),
    phone: formData.get("phone"),
    addressLine: formData.get("addressLine"),
    city: formData.get("city"),
    region: formData.get("region"),
    directions: formData.get("directions"),
    isDefault: formData.get("isDefault") === "on",
  };
}

function revalidateAddressPages() {
  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
}

export async function createAddressAction(
  _previousState: AddressActionState,
  formData: FormData,
): Promise<AddressActionState> {
  const user = await requireUser();
  const result = addressSchema.safeParse(getAddressFormValues(formData));

  if (!result.success) {
    return {
      success: false,
      message: "Please correct the highlighted fields.",
      errors: result.error.flatten().fieldErrors,
    };
  }

  try {
    const created = await prisma.$transaction(
      async (tx) => {
        const addressCount = await tx.address.count({
          where: {
            userId: user.id,
          },
        });

        if (addressCount >= MAX_SAVED_ADDRESSES) {
          return false;
        }

        const shouldBeDefault = addressCount === 0 || result.data.isDefault;

        if (shouldBeDefault) {
          await tx.address.updateMany({
            where: {
              userId: user.id,
              isDefault: true,
            },
            data: {
              isDefault: false,
            },
          });
        }

        await tx.address.create({
          data: {
            userId: user.id,
            label: result.data.label,
            recipient: result.data.recipient,
            phone: result.data.phone,
            addressLine: result.data.addressLine,
            city: result.data.city,
            region: result.data.region,
            directions: result.data.directions,
            isDefault: shouldBeDefault,
          },
        });

        return true;
      },
      {
        isolationLevel: "Serializable",
        maxWait: 10_000,
        timeout: 15_000,
      },
    );

    if (!created) {
      return {
        success: false,
        message: `You can save up to ${MAX_SAVED_ADDRESSES} addresses. Delete one before adding another.`,
      };
    }

    revalidateAddressPages();

    return {
      success: true,
      message: "Address saved successfully.",
    };
  } catch (error) {
    console.error("Address creation failed:", error);

    return {
      success: false,
      message: "We could not save the address. Please try again.",
    };
  }
}

export async function updateAddressAction(
  _previousState: AddressActionState,
  formData: FormData,
): Promise<AddressActionState> {
  const user = await requireUser();

  const idResult = addressIdSchema.safeParse({
    addressId: formData.get("addressId"),
  });

  const addressResult = addressSchema.safeParse(getAddressFormValues(formData));

  if (!idResult.success) {
    return {
      success: false,
      message: "A valid address ID is required.",
    };
  }

  if (!addressResult.success) {
    return {
      success: false,
      message: "Please correct the highlighted fields.",
      errors: addressResult.error.flatten().fieldErrors,
    };
  }

  try {
    const updated = await prisma.$transaction(
      async (tx) => {
        const existingAddress = await tx.address.findFirst({
          where: {
            id: idResult.data.addressId,
            userId: user.id,
          },
          select: {
            id: true,
            isDefault: true,
          },
        });

        if (!existingAddress) {
          return false;
        }

        const shouldBeDefault =
          existingAddress.isDefault || addressResult.data.isDefault;

        if (addressResult.data.isDefault) {
          await tx.address.updateMany({
            where: {
              userId: user.id,
              id: {
                not: existingAddress.id,
              },
              isDefault: true,
            },
            data: {
              isDefault: false,
            },
          });
        }

        const result = await tx.address.updateMany({
          where: {
            id: existingAddress.id,
            userId: user.id,
          },
          data: {
            label: addressResult.data.label,
            recipient: addressResult.data.recipient,
            phone: addressResult.data.phone,
            addressLine: addressResult.data.addressLine,
            city: addressResult.data.city,
            region: addressResult.data.region,
            directions: addressResult.data.directions,
            isDefault: shouldBeDefault,
          },
        });

        return result.count === 1;
      },
      {
        isolationLevel: "Serializable",
        maxWait: 10_000,
        timeout: 15_000,
      },
    );

    if (!updated) {
      return {
        success: false,
        message: "This address no longer exists or does not belong to you.",
      };
    }

    revalidateAddressPages();

    return {
      success: true,
      message: "Address updated successfully.",
    };
  } catch (error) {
    console.error("Address update failed:", error);

    return {
      success: false,
      message: "We could not update the address. Please try again.",
    };
  }
}

export async function deleteAddressAction(
  _previousState: AddressActionState,
  formData: FormData,
): Promise<AddressActionState> {
  const user = await requireUser();

  const result = addressIdSchema.safeParse({
    addressId: formData.get("addressId"),
  });

  if (!result.success) {
    return {
      success: false,
      message: "A valid address ID is required.",
    };
  }

  try {
    const deleted = await prisma.$transaction(
      async (tx) => {
        const address = await tx.address.findFirst({
          where: {
            id: result.data.addressId,
            userId: user.id,
          },
          select: {
            id: true,
            isDefault: true,
          },
        });

        if (!address) {
          return false;
        }

        const deleteResult = await tx.address.deleteMany({
          where: {
            id: address.id,
            userId: user.id,
          },
        });

        if (deleteResult.count !== 1) {
          return false;
        }

        if (address.isDefault) {
          const replacement = await tx.address.findFirst({
            where: {
              userId: user.id,
            },
            orderBy: {
              updatedAt: "desc",
            },
            select: {
              id: true,
            },
          });

          if (replacement) {
            await tx.address.updateMany({
              where: {
                id: replacement.id,
                userId: user.id,
              },
              data: {
                isDefault: true,
              },
            });
          }
        }

        return true;
      },
      {
        isolationLevel: "Serializable",
        maxWait: 10_000,
        timeout: 15_000,
      },
    );

    if (!deleted) {
      return {
        success: false,
        message: "This address no longer exists or does not belong to you.",
      };
    }

    revalidateAddressPages();

    return {
      success: true,
      message: "Address deleted successfully.",
    };
  } catch (error) {
    console.error("Address deletion failed:", error);

    return {
      success: false,
      message: "We could not delete the address. Please try again.",
    };
  }
}

export async function setDefaultAddressAction(
  _previousState: AddressActionState,
  formData: FormData,
): Promise<AddressActionState> {
  const user = await requireUser();

  const result = addressIdSchema.safeParse({
    addressId: formData.get("addressId"),
  });

  if (!result.success) {
    return {
      success: false,
      message: "A valid address ID is required.",
    };
  }

  try {
    const updated = await prisma.$transaction(
      async (tx) => {
        const targetAddress = await tx.address.findFirst({
          where: {
            id: result.data.addressId,
            userId: user.id,
          },
          select: {
            id: true,
            isDefault: true,
          },
        });

        if (!targetAddress) {
          return false;
        }

        if (targetAddress.isDefault) {
          return true;
        }

        await tx.address.updateMany({
          where: {
            userId: user.id,
            isDefault: true,
          },
          data: {
            isDefault: false,
          },
        });

        const updateResult = await tx.address.updateMany({
          where: {
            id: targetAddress.id,
            userId: user.id,
          },
          data: {
            isDefault: true,
          },
        });

        return updateResult.count === 1;
      },
      {
        isolationLevel: "Serializable",
        maxWait: 10_000,
        timeout: 15_000,
      },
    );

    if (!updated) {
      return {
        success: false,
        message: "This address no longer exists or does not belong to you.",
      };
    }

    revalidateAddressPages();

    return {
      success: true,
      message: "Default address updated.",
    };
  } catch (error) {
    console.error("Default address update failed:", error);

    return {
      success: false,
      message: "We could not update your default address. Please try again.",
    };
  }
}
