import { verifyWebhook } from "@clerk/nextjs/webhooks";

import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  let event;

  try {
    event = await verifyWebhook(request);
  } catch (error) {
    console.error("Clerk webhook verification failed", error);

    return new Response("Invalid webhook", { status: 400 });
  }

  try {
    if (event.type === "user.created" || event.type === "user.updated") {
      const { data: userData } = event;
      const {
        id,
        first_name,
        last_name,
        email_addresses,
        primary_email_address_id,
      } = userData;

      const primaryEmail =
        email_addresses.find((email) => email.id === primary_email_address_id)
          ?.email_address ?? null;

      await prisma.user.upsert({
        where: { clerkId: id },
        update: {
          firstName: first_name,
          lastName: last_name,
          email: primaryEmail,
        },
        create: {
          clerkId: id,
          firstName: first_name,
          lastName: last_name,
          email: primaryEmail,
        },
      });
    }

    if (event.type === "user.deleted") {
      const { data: userData } = event;
      const { id } = userData;

      if (!id) {
        return new Response("Missing Clerk user ID", { status: 400 });
      }

      await prisma.user.deleteMany({
        where: {
          clerkId: id,
        },
      });
    }

    return new Response("Webhook processed", { status: 200 });
  } catch (error) {
    console.error("Clerk webhook processing failed", error);

    return new Response("webhook processing error", { status: 500 });
  }
}
