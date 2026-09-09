"use client";

import { UserButton } from "@clerk/nextjs";
import { ClipboardList } from "lucide-react";

export function AccountUserButton() {
  return (
    <UserButton>
      <UserButton.MenuItems>
        <UserButton.Link
          label="My orders"
          labelIcon={<ClipboardList className="size-4" aria-hidden="true" />}
          href="/account/orders"
        />
      </UserButton.MenuItems>
    </UserButton>
  );
}
