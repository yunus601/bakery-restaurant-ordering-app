import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeliveryZoneForm } from "@/components/admin/delivery-zones/DeliveryZoneForm";
import { getAdminDeliveryZoneById } from "@/lib/queries/delivery-zones";
import { getAdminStoreSettings } from "@/lib/queries/store-settings";

export default async function EditDeliveryZonePage({ params }: { params: Promise<{ zoneId: string }> }) {
  const { zoneId } = await params;
  const [zone, settings] = await Promise.all([getAdminDeliveryZoneById(zoneId), getAdminStoreSettings()]);
  if (!zone) notFound();
  return <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-10"><Link href="/admin/delivery-zones" className="inline-flex items-center gap-2 text-sm font-semibold text-brand"><ArrowLeft className="size-4" /> Back to delivery zones</Link><header className="mt-6"><p className="font-navigation text-sm font-semibold uppercase tracking-[0.18em] text-brand">Fulfilment</p><h1 className="mt-2 font-display text-4xl font-semibold">Edit delivery zone</h1><p className="mt-3 text-sm text-bakery-muted">Update {zone.name}.</p></header><div className="mt-8"><DeliveryZoneForm mode="edit" zone={zone} defaultFeePesewas={settings.flatDeliveryFeePesewas} /></div></div>;
}
