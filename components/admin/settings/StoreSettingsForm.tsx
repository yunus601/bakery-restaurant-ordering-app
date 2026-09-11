"use client";

import { CheckCircle2 } from "lucide-react";
import { useActionState } from "react";

import {
  updateStoreSettingsAction,
  type StoreSettingsActionState,
} from "@/app/admin/settings/action";
import { Button } from "@/components/ui/button";
import type { StoreSettings } from "@/lib/queries/store-settings";
import { cn } from "@/lib/utils";
import type { StoreSettingsInput } from "@/lib/validation/store-settings";

const initialState: StoreSettingsActionState = { success: false };

export function StoreSettingsForm({ settings }: { settings: StoreSettings }) {
  const [state, formAction, pending] = useActionState(
    updateStoreSettingsAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-8 space-y-6">
      <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
        <h2 className="font-navigation text-lg font-semibold">Contact and pickup</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field label="Phone number" name="contactPhone" type="tel" defaultValue={settings.contactPhone} error={firstError(state.errors?.contactPhone)} />
          <Field label="Email address" name="contactEmail" type="email" defaultValue={settings.contactEmail} error={firstError(state.errors?.contactEmail)} />
          <Field label="Pickup address" name="pickupAddress" defaultValue={settings.pickupAddress} error={firstError(state.errors?.pickupAddress)} className="sm:col-span-2" />
          <label className="sm:col-span-2">
            <span className="text-sm font-medium">Opening hours</span>
            <textarea name="openingHours" rows={4} required defaultValue={settings.openingHours} aria-invalid={Boolean(state.errors?.openingHours)} className={inputClasses(Boolean(state.errors?.openingHours))} />
            <FieldError message={firstError(state.errors?.openingHours)} />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
        <h2 className="font-navigation text-lg font-semibold">Ordering</h2>
        <p className="mt-1 text-sm text-bakery-muted">Pause new orders without hiding the menu or deploying the app.</p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Toggle name="acceptingOrders" label="Accepting new orders" defaultChecked={settings.acceptingOrders} />
          <Toggle name="pickupEnabled" label="Pickup enabled" defaultChecked={settings.pickupEnabled} />
          <Toggle name="deliveryEnabled" label="Delivery enabled" defaultChecked={settings.deliveryEnabled} error={firstError(state.errors?.deliveryEnabled)} />
          <Field label="Default delivery fee (GHS)" name="deliveryFeeGhs" type="number" min="0" step="0.01" defaultValue={(settings.flatDeliveryFeePesewas / 100).toFixed(2)} error={firstError(state.errors?.flatDeliveryFeePesewas)} />
          <Field label="Minimum pickup preparation (minutes)" name="pickupPreparationMinMinutes" type="number" min="0" max="1440" step="1" defaultValue={settings.pickupPreparationMinMinutes} error={firstError(state.errors?.pickupPreparationMinMinutes)} />
          <Field label="Maximum pickup preparation (minutes)" name="pickupPreparationMaxMinutes" type="number" min="0" max="1440" step="1" defaultValue={settings.pickupPreparationMaxMinutes} error={firstError(state.errors?.pickupPreparationMaxMinutes)} />
        </div>
      </section>

      {state.message && (
        <p aria-live="polite" className={cn("flex items-center gap-2 rounded-xl p-3 text-sm", state.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700")}>
          {state.success && <CheckCircle2 className="size-5" aria-hidden="true" />}
          {state.message}
        </p>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={pending} className="h-11 bg-brand px-6 font-navigation text-white hover:bg-brand/90">
          {pending ? "Saving…" : "Save settings"}
        </Button>
      </div>
    </form>
  );
}

type FieldProps = React.ComponentProps<"input"> & {
  label: string;
  name: keyof StoreSettingsInput | "deliveryFeeGhs";
  error?: string;
};

function Field({ label, name, error, className, ...props }: FieldProps) {
  return (
    <label className={className}>
      <span className="text-sm font-medium">{label}</span>
      <input name={name} required aria-invalid={Boolean(error)} className={inputClasses(Boolean(error))} {...props} />
      <FieldError message={error} />
    </label>
  );
}

function Toggle({ name, label, defaultChecked, error }: { name: keyof StoreSettingsInput; label: string; defaultChecked: boolean; error?: string }) {
  return (
    <label className="rounded-xl border bg-background p-4 text-sm font-medium">
      <span className="flex cursor-pointer items-center gap-3">
        <input type="checkbox" name={name} defaultChecked={defaultChecked} className="size-4 accent-brand" />
        {label}
      </span>
      <FieldError message={error} />
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? <span className="mt-1 block text-sm text-red-700">{message}</span> : null;
}

function firstError(errors?: string[]) {
  return errors?.[0];
}

function inputClasses(hasError: boolean) {
  return cn("mt-2 w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15", hasError && "border-red-500");
}
