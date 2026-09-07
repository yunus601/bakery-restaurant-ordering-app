import type { Metadata } from "next";
import { connection } from "next/server";

import { CheckoutPageContent } from "@/components/CheckoutPageContent";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/Header";

export const metadata: Metadata = {
  title: "Checkout | Confirm Bakery",
  description: "Complete your pickup or delivery order from Confirm Bakery.",
};

export default async function CheckoutPage() {
  await connection();
  const idempotencyKey = crypto.randomUUID();

  return (
    <main className="min-h-screen bg-background">
      <div className="relative h-24 bg-foreground">
        <SiteHeader />
      </div>

      <section className="min-h-[60vh] px-6 py-16 lg:px-10">
        <CheckoutPageContent idempotencyKey={idempotencyKey} />
      </section>

      <Footer />
    </main>
  );
}
