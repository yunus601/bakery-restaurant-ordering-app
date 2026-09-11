import type { Metadata } from "next";

import { StoreSettingsForm } from "@/components/admin/settings/StoreSettingsForm";
import { getAdminStoreSettings } from "@/lib/queries/store-settings";

export const metadata: Metadata = { title: "Store settings" };

export default async function AdminSettingsPage() {
  const settings = await getAdminStoreSettings();

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-10">
      <p className="font-navigation text-sm font-semibold uppercase tracking-[0.18em] text-brand">Configuration</p>
      <h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">Store settings</h1>
      <p className="mt-3 max-w-2xl text-sm text-bakery-muted">Manage customer contact details, fulfilment availability, preparation estimates, and default fees.</p>
      <StoreSettingsForm settings={settings} />
    </div>
  );
}
