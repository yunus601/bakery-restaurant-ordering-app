"use client";

import { UserButton } from "@clerk/nextjs";
import {
  ClipboardList,
  Croissant,
  LayoutDashboard,
  Menu,
  MapPinned,
  Settings,
  Store,
  Tags,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navigation = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Orders", href: "/admin/orders", icon: ClipboardList },
  { label: "Products", href: "/admin/products", icon: Croissant },
  { label: "Categories", href: "/admin/categories", icon: Tags },
  { label: "Delivery zones", href: "/admin/delivery-zones", icon: MapPinned },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

type AdminNavigationProps = {
  adminName: string;
  adminEmail: string | null;
};

export function AdminNavigation({
  adminName,
  adminEmail,
}: AdminNavigationProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navigationLinks = navigation.map((item) => {
    const Icon = item.icon;
    const isActive =
      item.href === "/admin"
        ? pathname === "/admin"
        : pathname.startsWith(item.href);

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setIsOpen(false)}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "flex items-center gap-3 rounded-xl px-4 py-3 font-navigation text-sm font-semibold transition-colors",
          isActive
            ? "bg-brand text-white"
            : "text-bakery-muted hover:bg-brand/10 hover:text-brand",
        )}
      >
        <Icon className="size-5" aria-hidden="true" />
        {item.label}
      </Link>
    );
  });

  return (
    <>
      <aside className="fixed inset-y-0 left-0 hidden w-72 flex-col border-r bg-white p-6 print:hidden lg:flex">
        <AdminSidebarContent
          adminName={adminName}
          adminEmail={adminEmail}
          navigationLinks={navigationLinks}
        />
      </aside>

      <header className="sticky top-0 z-30 flex h-18 items-center justify-between border-b bg-white/95 px-5 backdrop-blur print:hidden lg:hidden">
        <Link href="/admin" className="font-display text-2xl font-semibold text-brand">
          Confirm Bakery
        </Link>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger
            aria-label="Open admin navigation"
            className="grid size-11 cursor-pointer place-items-center rounded-xl border text-brand"
          >
            <Menu className="size-5" aria-hidden="true" />
          </SheetTrigger>
          <SheetContent side="left" className="w-[min(88vw,20rem)] bg-white p-6">
            <SheetHeader className="sr-only">
              <SheetTitle>Admin navigation</SheetTitle>
              <SheetDescription>Manage Confirm Bakery</SheetDescription>
            </SheetHeader>
            <AdminSidebarContent
              adminName={adminName}
              adminEmail={adminEmail}
              navigationLinks={navigationLinks}
            />
          </SheetContent>
        </Sheet>
      </header>
    </>
  );
}

function AdminSidebarContent({
  adminName,
  adminEmail,
  navigationLinks,
}: AdminNavigationProps & { navigationLinks: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col">
      <Link href="/admin" className="flex items-center gap-3 px-2">
        <span className="grid size-11 place-items-center rounded-xl bg-brand text-white">
          <Croissant className="size-6" aria-hidden="true" />
        </span>
        <span>
          <span className="block font-display text-2xl font-semibold text-brand">
            Confirm Bakery
          </span>
          <span className="block text-xs text-bakery-muted">Administration</span>
        </span>
      </Link>

      <nav aria-label="Admin navigation" className="mt-10 space-y-1.5">
        {navigationLinks}
      </nav>

      <div className="mt-auto border-t pt-5">
        <div className="flex items-center gap-3">
          <UserButton />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{adminName}</p>
            {adminEmail && (
              <p className="truncate text-xs text-bakery-muted">{adminEmail}</p>
            )}
          </div>
        </div>
        <Link
          href="/"
          className="mt-4 flex items-center gap-2 text-sm font-semibold text-brand hover:underline"
        >
          <Store className="size-4" aria-hidden="true" />
          View storefront
        </Link>
      </div>
    </div>
  );
}
