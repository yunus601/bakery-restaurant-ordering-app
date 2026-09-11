"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";

const timeFormatter = new Intl.DateTimeFormat("en-GH", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Africa/Accra",
});

export function AdminOrderRefresh({ updatedAt }: { updatedAt: Date }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [lastUpdated, setLastUpdated] = useState(updatedAt);

  function refreshOrders() {
    startTransition(() => {
      router.refresh();
      setLastUpdated(new Date());
    });
  }

  return (
    <div className="flex items-center gap-3">
      <p className="hidden text-xs text-bakery-muted sm:block">
        Updated {timeFormatter.format(lastUpdated)}
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={refreshOrders}
        disabled={isPending}
        aria-label="Refresh orders"
      >
        <RefreshCw
          className={isPending ? "animate-spin" : undefined}
          aria-hidden="true"
        />
        {isPending ? "Refreshing" : "Refresh"}
      </Button>
    </div>
  );
}
