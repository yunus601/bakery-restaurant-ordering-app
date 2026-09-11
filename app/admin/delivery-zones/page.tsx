import { Plus } from "lucide-react";
import Link from "next/link";

import { DeliveryZoneList } from "@/components/admin/delivery-zones/DeliveryZoneList";
import { getAdminDeliveryZones } from "@/lib/queries/delivery-zones";

export default async function AdminDeliveryZonesPage() {
  const zones = await getAdminDeliveryZones();
  return (
    <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-10">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="font-navigation text-sm font-semibold uppercase tracking-[0.18em] text-brand">Fulfilment</p><h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">Delivery zones</h1><p className="mt-3 text-sm text-bakery-muted">Control eligible Ghana delivery areas, fees, minimums, and checkout order.</p></div>
        <Link href="/admin/delivery-zones/new" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-white"><Plus className="size-4" /> Add zone</Link>
      </header>
      <DeliveryZoneList zones={zones} />
    </div>
  );
}
