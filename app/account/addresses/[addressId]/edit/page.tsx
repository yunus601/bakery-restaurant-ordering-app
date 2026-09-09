import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AddressForm } from "@/components/account/addresses/AddressForm";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/Header";
import { getCustomerAddressById } from "@/lib/queries/customer-addresses";

export const metadata: Metadata = { title: "Edit address" };

export default async function EditAddressPage({
  params,
}: {
  params: Promise<{ addressId: string }>;
}) {
  const { addressId } = await params;
  const address = await getCustomerAddressById(addressId);

  if (!address) notFound();

  return (
    <main className="min-h-screen bg-background">
      <div className="relative h-24 bg-foreground"><SiteHeader /></div>
      <section className="px-6 py-12 lg:px-10 lg:py-16">
        <div className="mx-auto max-w-3xl">
          <Link href="/account/addresses" className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline">
            <ArrowLeft className="size-4" aria-hidden="true" /> Back to addresses
          </Link>
          <h1 className="mt-5 font-display text-4xl font-semibold">Edit address</h1>
          <p className="mt-2 text-sm text-bakery-muted">Keep your delivery details accurate and up to date.</p>
          <div className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-8">
            <AddressForm mode="edit" address={address} />
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
