"use client";

import { Star, Trash2 } from "lucide-react";
import { useActionState } from "react";

import {
  deleteAddressAction,
  setDefaultAddressAction,
  type AddressActionState,
} from "@/app/account/addresses/action";
import { Button } from "@/components/ui/button";

const initialState: AddressActionState = { success: false };

export function AddressActions({
  addressId,
  isDefault,
}: {
  addressId: string;
  isDefault: boolean;
}) {
  const [defaultState, defaultAction, settingDefault] = useActionState(
    setDefaultAddressAction,
    initialState,
  );
  const [deleteState, deleteAction, deleting] = useActionState(
    deleteAddressAction,
    initialState,
  );

  const message = deleteState.message ?? defaultState.message;
  const hasError =
    (deleteState.message && !deleteState.success) ||
    (defaultState.message && !defaultState.success);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {!isDefault && (
          <form action={defaultAction}>
            <input type="hidden" name="addressId" value={addressId} />
            <Button type="submit" variant="outline" disabled={settingDefault}>
              <Star className="size-4" aria-hidden="true" />
              {settingDefault ? "Updating..." : "Make default"}
            </Button>
          </form>
        )}

        <form
          action={deleteAction}
          onSubmit={(event) => {
            if (!window.confirm("Delete this saved address?")) {
              event.preventDefault();
            }
          }}
        >
          <input type="hidden" name="addressId" value={addressId} />
          <Button
            type="submit"
            variant="destructive"
            size="icon"
            disabled={deleting}
            aria-label="Delete address"
            title="Delete address"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </Button>
        </form>
      </div>

      {message && (
        <p
          role={hasError ? "alert" : "status"}
          aria-live="polite"
          className={`mt-2 text-xs ${hasError ? "text-destructive" : "text-emerald-700"}`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
