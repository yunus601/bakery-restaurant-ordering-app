import type { Metadata } from "next";

import { CartPageContent } from "@/components/CartPageContent";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/Header";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review your Confirm Bakery order.",
};

export default function CartPage() {
  return (
    <main>
      <div className="relative h-24 bg-foreground">
        <SiteHeader />
      </div>

      <section className="min-h-[60vh] bg-background px-6 py-16 lg:px-10">
        <CartPageContent />
      </section>

      <Footer />
    </main>
  );
}
