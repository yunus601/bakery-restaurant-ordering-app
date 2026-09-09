"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const refreshIntervalMs = 30_000;
const terminalStatuses = new Set(["COMPLETED", "CANCELLED"]);
const timeFormatter = new Intl.DateTimeFormat("en-GH", {
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit",
  timeZone: "Africa/Accra",
});

export function OrderStatusRefresh({
  status,
  initialCheckedAt,
}: {
  status: string;
  initialCheckedAt: string;
}) {
  const router = useRouter();
  const [isRefreshing, startTransition] = useTransition();
  const [lastChecked, setLastChecked] = useState(
    () => new Date(initialCheckedAt),
  );
  const isActive = !terminalStatuses.has(status);

  const refreshStatus = useCallback(() => {
    startTransition(() => {
      router.refresh();
      setLastChecked(new Date());
    });
  }, [router]);

  useEffect(() => {
    if (!isActive) return;

    const interval = window.setInterval(refreshStatus, refreshIntervalMs);

    return () => window.clearInterval(interval);
  }, [isActive, refreshStatus]);

  return (
    <div className="text-left sm:text-right">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={refreshStatus}
        disabled={isRefreshing}
        className="cursor-pointer"
      >
        <RefreshCw
          className={cn("size-4", isRefreshing && "animate-spin")}
          aria-hidden="true"
        />
        {isRefreshing ? "Refreshing…" : "Refresh status"}
      </Button>
      <p className="mt-2 text-xs text-bakery-muted" aria-live="polite">
        Last checked {timeFormatter.format(lastChecked)}
        {isActive ? " · Updates every 30 seconds" : ""}
      </p>
    </div>
  );
}
