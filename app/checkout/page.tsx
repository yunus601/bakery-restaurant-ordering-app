import type { Metadata } from "next";
import { connection } from "next/server";

import { CheckoutPageContent } from "@/components/CheckoutPageContent";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/Header";

import { auth } from "@clerk/nextjs/server";

import { requireUser } from "@/lib/auth/require-user";
import { getCustomerAddresses } from "@/lib/queries/customer-addresses";
import { getActiveDeliveryZones } from "@/lib/queries/delivery-zones";
import { getStoreSettings } from "@/lib/queries/store-settings";

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

  const [storedAddresses, storeSettings, deliveryZones] = await Promise.all([
    user ? getCustomerAddresses() : Promise.resolve([]),
    getStoreSettings(),
    getActiveDeliveryZones(),
  ]);

  const addresses = storedAddresses.map(
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
      );

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
          storeSettings={storeSettings}
          deliveryZones={deliveryZones}
        />
      </section>

      <Footer />
    </main>
  );
}
