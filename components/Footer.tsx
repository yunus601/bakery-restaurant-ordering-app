import Image from "next/image";
import Link from "next/link";

import { siteConfig } from "@/lib/config/site";

const footerLinks = [
  { label: "Home", href: "/" },
  { label: "Menu", href: "/menu" },
  { label: "About us", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export function Footer() {
  return (
    <footer
      id="contact"
      className="relative isolate overflow-hidden text-surface"
    >
      <Image
        src="/images/footer-background.png"
        alt=""
        fill
        sizes="100vw"
        className="-z-20 object-cover"
      />

      <div className="absolute inset-0 -z-10 bg-black/45" />

      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
        <div className="flex flex-col justify-between gap-8 border-b border-brand-accent/20 pb-10 sm:flex-row sm:items-center">
          <Link
            href="/"
            aria-label={`${siteConfig.name} home`}
            className="relative h-24 w-24"
          >
            <Image
              src="/images/confirm-bakery-logo.png"
              alt=""
              fill
              sizes="96px"
              className="object-contain"
            />
          </Link>

          <p className="font-navigation text-brand-accent">
            Freshly baked for pickup and delivery
          </p>
        </div>

        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <h2 className="font-navigation text-xl font-bold text-brand-accent">
              Contact us
            </h2>

            <address className="mt-5 space-y-3 not-italic text-surface/80">
              <p>{siteConfig.contact.address}</p>

              <p>
                <a
                  href={siteConfig.contact.phoneHref}
                  className="hover:text-brand-accent"
                >
                  {siteConfig.contact.phoneDisplay}
                </a>
              </p>

              <p>
                <a
                  href={siteConfig.contact.emailHref}
                  className="hover:text-brand-accent"
                >
                  {siteConfig.contact.email}
                </a>
              </p>
            </address>
          </div>

          <div>
            <h2 className="font-navigation text-xl font-bold text-brand-accent">
              Explore
            </h2>

            <nav aria-label="Footer navigation" className="mt-5">
              <ul className="space-y-3">
                {footerLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-surface/80 hover:text-brand-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div>
            <h2 className="font-navigation text-xl font-bold text-brand-accent">
              Ordering
            </h2>

            <div className="mt-5 space-y-3 text-surface/80">
              <p>Pickup from our bakery</p>
              <p>Delivery to your address</p>
              <p>Payment on pickup or delivery</p>
            </div>
          </div>
        </div>

        {siteConfig.isUsingPlaceholderContactDetails && (
          <p className="mb-6 rounded-lg border border-brand-accent/30 bg-black/30 p-3 text-sm text-brand-accent">
            Development notice: contact details are placeholders.
          </p>
        )}

        <p className="text-center text-sm text-subtle">
          © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
