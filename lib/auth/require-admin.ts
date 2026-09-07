import "server-only";

import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

export async function requireAdmin() {
  const { userId, redirectToSignIn } = await auth();

  if (!userId) {
    return redirectToSignIn();
  }

  const user = await prisma.user.findUnique({
    where: {
      clerkId: userId,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
    },
  });

  if (!user || user.role !== "ADMIN") {
    notFound();
  }

  return user;
}
