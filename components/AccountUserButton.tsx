"use client";

import { UserButton } from "@clerk/nextjs";
import { ClipboardList, MapPin } from "lucide-react";

export function AccountUserButton() {
  return (
    <UserButton>
      <UserButton.MenuItems>
        <UserButton.Link
          label="My orders"
          labelIcon={<ClipboardList className="size-4" aria-hidden="true" />}
          href="/account/orders"
        />
        <UserButton.Link
          label="Saved addresses"
          labelIcon={<MapPin className="size-4" aria-hidden="true" />}
          href="/account/addresses"
        />
      </UserButton.MenuItems>
    </UserButton>
  );
}
