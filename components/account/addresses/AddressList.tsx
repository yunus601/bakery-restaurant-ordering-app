import { MapPin, Pencil, Phone } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { CustomerAddress } from "@/lib/queries/customer-addresses";

import { AddressActions } from "./AddressActions";

export function AddressList({ addresses }: { addresses: CustomerAddress[] }) {
  if (addresses.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center">
        <MapPin className="mx-auto size-10 text-brand" aria-hidden="true" />
        <h2 className="mt-4 font-display text-2xl font-semibold">
          No saved addresses yet
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-bakery-muted">
          Save a delivery address to fill checkout faster next time.
        </p>
        <Button className="mt-6" render={<Link href="/account/addresses/new" />}>
          Add your first address
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {addresses.map((address) => (
        <article
          key={address.id}
          className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-xl font-semibold">
                  {address.label || "Delivery address"}
                </h2>
                {address.isDefault && (
                  <span className="rounded-full bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand">
                    Default
                  </span>
                )}
              </div>
              <p className="mt-3 font-semibold">{address.recipient}</p>
            </div>

            <Button
              variant="ghost"
              size="icon"
              render={<Link href={`/account/addresses/${address.id}/edit`} />}
              aria-label={`Edit ${address.label || "address"}`}
              title="Edit address"
            >
              <Pencil className="size-4" aria-hidden="true" />
            </Button>
          </div>

          <div className="mt-4 space-y-2 text-sm text-bakery-muted">
            <p className="flex gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
              <span>
                {address.addressLine}, {address.city}
                {address.region ? `, ${address.region}` : ""}
              </span>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="size-4 shrink-0 text-brand" aria-hidden="true" />
              {address.phone}
            </p>
            {address.directions && (
              <p className="rounded-lg bg-muted px-3 py-2 text-xs">
                Directions: {address.directions}
              </p>
            )}
          </div>

          <div className="mt-auto border-t border-border pt-4">
            <AddressActions
              addressId={address.id}
              isDefault={address.isDefault}
            />
          </div>
        </article>
      ))}
    </div>
  );
}
