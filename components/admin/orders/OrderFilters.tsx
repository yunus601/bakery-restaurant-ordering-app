"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";

import type { OrderStatus } from "@/lib/generated/prisma/client";

type OrderFiltersProps = {
  search?: string;
  status?: OrderStatus;
  statuses: readonly OrderStatus[];
};

export function OrderFilters({ search, status, statuses }: OrderFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(search ?? "");

  const replaceParams = (params: URLSearchParams) => {
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  };

  const debouncedSearch = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const trimmedValue = value.trim();

    if (trimmedValue) {
      params.set("q", trimmedValue);
    } else {
      params.delete("q");
    }
    params.delete("page");
    replaceParams(params);
  }, 350);

  return (
    <form
      action="/admin/orders"
      className="mt-8 grid gap-3 rounded-2xl border bg-white p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_13rem_auto]"
    >
      <label className="relative">
        <span className="sr-only">Search orders</span>
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-bakery-muted"
          aria-hidden="true"
        />
        <input
          name="q"
          type="search"
          value={searchTerm}
          onChange={(event) => {
            const value = event.target.value;
            setSearchTerm(value);
            debouncedSearch(value);
          }}
          placeholder="Order number, customer, or phone"
          className="h-11 w-full rounded-xl border bg-background pl-10 pr-4 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
        />
      </label>

      <label className="relative">
        <span className="sr-only">Filter by status</span>
        <SlidersHorizontal
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-bakery-muted"
          aria-hidden="true"
        />
        <select
          name="status"
          defaultValue={status ?? ""}
          onChange={(event) => {
            const params = new URLSearchParams(searchParams.toString());
            if (event.target.value) {
              params.set("status", event.target.value);
            } else {
              params.delete("status");
            }
            params.delete("page");
            replaceParams(params);
          }}
          className="h-11 w-full cursor-pointer appearance-none rounded-xl border bg-background pl-10 pr-4 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
        >
          <option value="">All statuses</option>
          {statuses.map((value) => (
            <option key={value} value={value}>
              {formatStatus(value)}
            </option>
          ))}
        </select>
      </label>

      {(search || status) && (
        <Link
          href="/admin/orders"
          className="grid h-11 place-items-center rounded-xl border px-4 text-sm font-semibold text-bakery-muted transition hover:border-brand hover:text-brand"
        >
          Reset
        </Link>
      )}
    </form>
  );
}

function formatStatus(value: string) {
  return value.toLowerCase().replaceAll("_", " ");
}
