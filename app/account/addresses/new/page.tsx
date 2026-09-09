import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { AddressForm } from "@/components/account/addresses/AddressForm";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/Header";
import { requireUser } from "@/lib/auth/require-user";

export const metadata: Metadata = { title: "Add address" };

export default async function NewAddressPage() {
  await requireUser();

  return (
    <main className="min-h-screen bg-background">
      <div className="relative h-24 bg-foreground"><SiteHeader /></div>
      <section className="px-6 py-12 lg:px-10 lg:py-16">
        <div className="mx-auto max-w-3xl">
          <Link href="/account/addresses" className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline">
            <ArrowLeft className="size-4" aria-hidden="true" /> Back to addresses
          </Link>
          <h1 className="mt-5 font-display text-4xl font-semibold">Add address</h1>
          <p className="mt-2 text-sm text-bakery-muted">Save the details our rider needs for delivery.</p>
          <div className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-8">
            <AddressForm mode="create" />
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
