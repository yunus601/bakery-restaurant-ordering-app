"use client";

import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useState } from "react";

import { useHasHydrated } from "@/hooks/use-has-hydrated";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type NavigationItem = {
  label: string;
  href: string;
};

type MobileNavigationProps = {
  items: NavigationItem[];
};

export function MobileNavigation({ items }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hasHydrated = useHasHydrated();

  return (
    <div className="md:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger className="cursor-pointer hover:bg-brand-accent hover:text-black rounded-lg border border-brand-accent px-3 py-2 font-navigation font-semibold text-brand-accent">
          Menu
        </SheetTrigger>

        <SheetContent
          side="right"
          className="w-full border-brand/30 bg-foreground text-surface sm:max-w-sm"
        >
          <SheetHeader className="border-b border-brand-accent/20 p-6">
            <SheetTitle className="font-display text-3xl text-brand-accent">
              Confirm Bakery
            </SheetTitle>

            <SheetDescription className="text-surface/70">
              Browse our bakery and ordering pages.
            </SheetDescription>
          </SheetHeader>

          <nav
            aria-label="Mobile navigation"
            className="flex flex-col gap-2 px-4 py-6"
          >
            {items.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="cursor-pointer rounded-xl px-5 py-4 font-navigation text-lg font-semibold text-surface transition-colors hover:bg-brand hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="min-h-17 border-t border-brand-accent/20 px-6 py-5">
            {hasHydrated && (
              <>
                <Show when="signed-out">
                  <div className="grid grid-cols-2 gap-3">
                    <SignInButton mode="modal">
                      <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="cursor-pointer rounded-lg border border-brand-accent px-4 py-3 font-navigation font-semibold text-brand-accent transition-colors hover:bg-brand-accent hover:text-foreground"
                      >
                        Sign in
                      </button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="cursor-pointer rounded-lg bg-brand px-4 py-3 font-navigation font-semibold text-surface transition-colors hover:bg-brand/90"
                      >
                        Sign up
                      </button>
                    </SignUpButton>
                  </div>
                </Show>
                <Show when="signed-in">
                  <div className="flex items-center gap-3 font-navigation font-semibold">
                    <UserButton />
                    <span>My account</span>
                  </div>
                </Show>
              </>
            )}
          </div>

          <div className="mt-auto border-t border-brand-accent/20 p-6 text-sm text-surface/65">
            Pickup and delivery available
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
