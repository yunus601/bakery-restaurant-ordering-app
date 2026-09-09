import type { Metadata } from "next";
import { connection } from "next/server";

import { CheckoutPageContent } from "@/components/CheckoutPageContent";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/Header";

import { auth } from "@clerk/nextjs/server";

import { requireUser } from "@/lib/auth/require-user";
import { getCustomerAddresses } from "@/lib/queries/customer-addresses";

export const metadata: Metadata = {
  title: "Checkout | Confirm Bakery",
  description: "Complete your pickup or delivery order from Confirm Bakery.",
};

export default async function CheckoutPage() {
  await connection();
  const idempotencyKey = crypto.randomUUID();

  const { userId } = await auth();
  const user = userId ? await requireUser() : null;

  const customer = user
    ? {
        name: [user.firstName, user.lastName].filter(Boolean).join(" "),
        email: user.email ?? "",
        phone: user.phone ?? "",
      }
    : null;

  const addresses = user
    ? (await getCustomerAddresses()).map(
        ({
          id,
          label,
          recipient,
          phone,
          addressLine,
          city,
          region,
          directions,
          isDefault,
        }) => ({
          id,
          label,
          recipient,
          phone,
          addressLine,
          city,
          region,
          directions,
          isDefault,
        }),
      )
    : [];

  return (
    <main className="min-h-screen bg-background">
      <div className="relative h-24 bg-foreground">
        <SiteHeader />
      </div>

      <section className="min-h-[60vh] px-6 py-16 lg:px-10">
        <CheckoutPageContent
          idempotencyKey={idempotencyKey}
          customer={customer}
          addresses={addresses}
        />
      </section>

      <Footer />
    </main>
  );
}
