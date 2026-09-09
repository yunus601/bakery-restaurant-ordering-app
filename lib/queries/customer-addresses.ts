import "server-only";
import { requireUser } from "../auth/require-user";
import prisma from "../prisma";

const addressSelect = {
  id: true,
  label: true,
  recipient: true,
  phone: true,
  addressLine: true,
  city: true,
  region: true,
  directions: true,
  isDefault: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function getCustomerAddresses() {
  const user = await requireUser();
  return prisma.address.findMany({
    where: {
      userId: user.id,
    },
    orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
    select: addressSelect,
  });
}

export async function getCustomerAddressById(addressId: string) {
  const user = await requireUser();

  return prisma.address.findFirst({
    where: {
      id: addressId,
      userId: user.id,
    },
    select: addressSelect,
  });
}

export type CustomerAddress = Awaited<
  ReturnType<typeof getCustomerAddresses>
>[number];

export type CustomerAddressDetails = NonNullable<
  Awaited<ReturnType<typeof getCustomerAddressById>>
>;
