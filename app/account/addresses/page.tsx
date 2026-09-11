import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { AddressList } from "@/components/account/addresses/AddressList";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/Header";
import { getCustomerAddresses } from "@/lib/queries/customer-addresses";
import { MAX_SAVED_ADDRESSES } from "@/lib/validation/address";

export const metadata: Metadata = {
  title: "Saved addresses",
  description: "Manage your Confirm Bakery delivery addresses.",
};

export default async function AddressesPage() {
  const addresses = await getCustomerAddresses();

  return (
    <main className="min-h-screen bg-background">
      <div className="relative h-24 bg-foreground">
        <SiteHeader />
      </div>

      <section className="min-h-[60vh] px-6 py-14 lg:px-10 lg:py-16">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="font-navigation text-sm font-semibold uppercase tracking-[0.18em] text-brand">
                Your account
              </p>
              <h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">
                Saved addresses
              </h1>
              <p className="mt-3 text-sm text-bakery-muted">
                Manage the delivery details you use at checkout.
              </p>
            </div>

            {addresses.length > 0 && addresses.length < MAX_SAVED_ADDRESSES && (
              <Button render={<Link href="/account/addresses/new" />}>
                <Plus className="size-4" aria-hidden="true" />
                Add address
              </Button>
            )}
          </div>

          <div className="mt-9">
            <AddressList
              addresses={addresses}
              maximumAddresses={MAX_SAVED_ADDRESSES}
            />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
