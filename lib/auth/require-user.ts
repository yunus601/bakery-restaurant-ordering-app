import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";

export async function requireUser() {
  const { isAuthenticated, userId, redirectToSignIn } = await auth();

  if (!isAuthenticated || !userId) {
    return redirectToSignIn();
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      clerkId: userId,
    },
    select: {
      id: true,
      clerkId: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
    },
  });

  if (existingUser) {
    return existingUser;
  }

  // Fallback for a delayed or missed Clerk webhook.
  const clerkUser = await currentUser();

  if (!clerkUser) {
    throw new Error("The authenticated Clerk user could not be loaded.");
  }

  const primaryEmail =
    clerkUser.emailAddresses.find(
      (email) => email.id === clerkUser.primaryEmailAddressId,
    )?.emailAddress ?? null;

  return prisma.user.create({
    data: {
      clerkId: clerkUser.id,
      email: primaryEmail,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      phone: clerkUser.primaryPhoneNumber?.phoneNumber ?? null,
    },
    select: {
      id: true,
      clerkId: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
    },
  });
}
