"use client";
import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { MobileNavigation } from "./MobileNavigation";
import { CartButton } from "./CartButton";
import { CartSheet } from "./CartSheet";
import { usePathname } from "next/navigation";
import { AccountUserButton } from "./AccountUserButton";

const navigation = [
  { label: "Home", href: "/" },
  { label: "Menu", href: "/menu" },
  { label: "About us", href: "/#about" },
  { label: "Contact", href: "/#contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-foreground/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-6 lg:px-10">
        <Link
          href="/"
          aria-label="Confirm Bakery home"
          className="relative h-20 w-20 shrink-0"
        >
          <Image
            src="/images/confirm-bakery-logo.png"
            alt=""
            fill
            priority
            sizes="80px"
            className="object-contain"
          />
        </Link>

        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-8 font-navigation font-semibold md:flex"
        >
          {navigation.map((item) => {
            const isActive =
              (item.href === "/" && pathname === "/") ||
              (item.href === "/menu" && pathname.startsWith("/menu"));

            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={
                  isActive
                    ? "text-brand-accent"
                    : "text-surface transition-colors hover:text-brand-accent"
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 md:flex">
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button
                  type="button"
                  className="cursor-pointer rounded-lg px-3 py-2 font-navigation text-sm font-semibold text-surface transition-colors hover:text-brand-accent"
                >
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button
                  type="button"
                  className="cursor-pointer rounded-lg bg-brand px-4 py-2 font-navigation text-sm font-semibold text-surface transition-colors hover:bg-brand/90"
                >
                  Sign up
                </button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <AccountUserButton />
            </Show>
          </div>

          <MobileNavigation items={navigation} />
          {pathname !== "/cart" && <CartButton />}

          <CartSheet />
        </div>
      </div>
    </header>
  );
}
