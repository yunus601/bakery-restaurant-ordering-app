import { ArrowDown, ArrowUp, MapPinned, Pencil } from "lucide-react";
import Link from "next/link";

import { moveDeliveryZoneAction } from "@/app/admin/delivery-zones/actions";
import { formatPrice } from "@/lib/formatters";
import type { AdminDeliveryZone } from "@/lib/queries/delivery-zones";

export function DeliveryZoneList({ zones }: { zones: AdminDeliveryZone[] }) {
  if (zones.length === 0) {
    return (
      <div className="mt-6 rounded-2xl border bg-white px-6 py-16 text-center shadow-sm">
        <MapPinned className="mx-auto size-10 text-bakery-muted" aria-hidden="true" />
        <h2 className="mt-4 font-navigation text-xl font-semibold">No delivery zones yet</h2>
        <p className="mt-2 text-sm text-bakery-muted">Add the first area customers can select at checkout.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-3">
      {zones.map((zone, index) => (
        <article key={zone.id} className="flex flex-col gap-4 rounded-2xl border bg-white p-5 shadow-sm sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-navigation text-lg font-semibold">{zone.name}</h2>
              <span className={zone.isActive ? "rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800" : "rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700"}>{zone.isActive ? "Active" : "Inactive"}</span>
            </div>
            <p className="mt-2 text-sm text-bakery-muted">
              {formatPrice(zone.deliveryFeePesewas)} delivery
              {zone.minimumOrderPesewas != null ? ` · ${formatPrice(zone.minimumOrderPesewas)} minimum` : " · No zone minimum"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <form action={moveDeliveryZoneAction.bind(null, zone.id, "up")}><button type="submit" disabled={index === 0} aria-label={`Move ${zone.name} up`} className="grid size-10 place-items-center rounded-xl border disabled:opacity-35"><ArrowUp className="size-4" /></button></form>
            <form action={moveDeliveryZoneAction.bind(null, zone.id, "down")}><button type="submit" disabled={index === zones.length - 1} aria-label={`Move ${zone.name} down`} className="grid size-10 place-items-center rounded-xl border disabled:opacity-35"><ArrowDown className="size-4" /></button></form>
            <Link href={`/admin/delivery-zones/${zone.id}/edit`} className="inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-semibold text-brand"><Pencil className="size-4" /> Edit</Link>
          </div>
        </article>
      ))}
    </div>
  );
}
