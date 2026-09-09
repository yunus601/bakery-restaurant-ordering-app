"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  createAddressAction,
  updateAddressAction,
  type AddressActionState,
} from "@/app/account/addresses/action";
import { Button } from "@/components/ui/button";
import type { CustomerAddressDetails } from "@/lib/queries/customer-addresses";

type AddressFormProps =
  | { mode: "create"; address?: never }
  | { mode: "edit"; address: CustomerAddressDetails };

const initialState: AddressActionState = { success: false };

const inputClassName =
  "mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20";
const textareaClassName =
  "mt-2 min-h-24 w-full resize-y rounded-xl border border-border bg-background px-3 py-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20";

export function AddressForm({ mode, address }: AddressFormProps) {
  const action = mode === "edit" ? updateAddressAction : createAddressAction;
  const [state, formAction, pending] = useActionState(action, initialState);

  if (state.success) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <p className="font-semibold text-emerald-900">{state.message}</p>
        <p className="mt-2 text-sm text-emerald-800">
          Your address has been saved to your account.
        </p>
        <Button className="mt-5" render={<Link href="/account/addresses" />}>
          View saved addresses
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      {mode === "edit" && (
        <input type="hidden" name="addressId" value={address.id} />
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="label" label="Label" hint="For example, Home or Office">
          <input
            id="label"
            name="label"
            defaultValue={address?.label ?? ""}
            maxLength={40}
            placeholder="Home"
            aria-invalid={Boolean(state.errors?.label)}
            aria-describedby={state.errors?.label ? "label-error" : undefined}
            className={inputClassName}
          />
          <FieldError id="label-error" errors={state.errors?.label} />
        </Field>

        <Field id="recipient" label="Recipient name" required>
          <input
            id="recipient"
            name="recipient"
            defaultValue={address?.recipient ?? ""}
            required
            maxLength={100}
            autoComplete="name"
            aria-invalid={Boolean(state.errors?.recipient)}
            aria-describedby={
              state.errors?.recipient ? "recipient-error" : undefined
            }
            className={inputClassName}
          />
          <FieldError id="recipient-error" errors={state.errors?.recipient} />
        </Field>

        <Field id="phone" label="Phone number" required>
          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={address?.phone ?? ""}
            required
            maxLength={20}
            autoComplete="tel"
            placeholder="024 123 4567"
            aria-invalid={Boolean(state.errors?.phone)}
            aria-describedby={state.errors?.phone ? "phone-error" : undefined}
            className={inputClassName}
          />
          <FieldError id="phone-error" errors={state.errors?.phone} />
        </Field>

        <Field id="city" label="City" required>
          <input
            id="city"
            name="city"
            defaultValue={address?.city ?? ""}
            required
            maxLength={100}
            autoComplete="address-level2"
            placeholder="Accra"
            aria-invalid={Boolean(state.errors?.city)}
            aria-describedby={state.errors?.city ? "city-error" : undefined}
            className={inputClassName}
          />
          <FieldError id="city-error" errors={state.errors?.city} />
        </Field>
      </div>

      <Field id="addressLine" label="Street address" required>
        <input
          id="addressLine"
          name="addressLine"
          defaultValue={address?.addressLine ?? ""}
          required
          maxLength={200}
          autoComplete="street-address"
          placeholder="House number, street and neighbourhood"
          aria-invalid={Boolean(state.errors?.addressLine)}
          aria-describedby={
            state.errors?.addressLine ? "addressLine-error" : undefined
          }
          className={inputClassName}
        />
        <FieldError id="addressLine-error" errors={state.errors?.addressLine} />
      </Field>

      <Field id="region" label="Region">
        <input
          id="region"
          name="region"
          defaultValue={address?.region ?? ""}
          maxLength={100}
          autoComplete="address-level1"
          placeholder="Greater Accra"
          aria-invalid={Boolean(state.errors?.region)}
          aria-describedby={state.errors?.region ? "region-error" : undefined}
          className={inputClassName}
        />
        <FieldError id="region-error" errors={state.errors?.region} />
      </Field>

      <Field
        id="directions"
        label="Delivery directions"
        hint="Landmarks help our rider find you"
      >
        <textarea
          id="directions"
          name="directions"
          defaultValue={address?.directions ?? ""}
          maxLength={300}
          placeholder="Blue gate, opposite the pharmacy"
          aria-invalid={Boolean(state.errors?.directions)}
          aria-describedby={
            state.errors?.directions ? "directions-error" : undefined
          }
          className={textareaClassName}
        />
        <FieldError id="directions-error" errors={state.errors?.directions} />
      </Field>

      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-4">
        <input
          type="checkbox"
          name={address?.isDefault ? undefined : "isDefault"}
          defaultChecked={address?.isDefault ?? false}
          disabled={address?.isDefault}
          className="mt-0.5 size-4 accent-brand"
        />
        {address?.isDefault && (
          <input type="hidden" name="isDefault" value="on" />
        )}
        <span>
          <span className="block text-sm font-semibold">Use as default address</span>
          <span className="mt-1 block text-xs text-bakery-muted">
            {address?.isDefault
              ? "This is already your default. Choose another address to change it."
              : "We will select it first when you order delivery."}
          </span>
        </span>
      </label>

      {state.message && !state.success && (
        <p
          role="alert"
          aria-live="polite"
          className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {state.message}
        </p>
      )}

      <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          render={<Link href="/account/addresses" />}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending
            ? "Saving..."
            : mode === "edit"
              ? "Save changes"
              : "Save address"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  hint,
  required,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </label>
      {hint && <p className="mt-0.5 text-xs text-bakery-muted">{hint}</p>}
      {children}
    </div>
  );
}

function FieldError({ id, errors }: { id: string; errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p id={id} className="mt-1.5 text-xs text-destructive">
      {errors[0]}
    </p>
  );
}
