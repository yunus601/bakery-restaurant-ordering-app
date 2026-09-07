import Image from "next/image";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PromotionBanner() {
  return (
    <section
      aria-labelledby="promotion-heading"
      className="relative isolate flex min-h-96 items-center overflow-hidden"
    >
      <Image
        src="/images/promotion-background.png"
        alt=""
        fill
        sizes="100vw"
        className="-z-20 object-cover object-[20%_center] sm:object-center"
      />

      <div className="absolute inset-0 -z-10 bg-white/35" />

      <div className="mx-auto w-full max-w-7xl px-6 py-20 lg:px-10">
        <div className="mx-auto max-w-md rounded-2xl bg-white/75 p-7 text-center shadow-sm backdrop-blur-sm sm:bg-transparent sm:p-0 sm:shadow-none sm:backdrop-blur-none">
          <h2
            id="promotion-heading"
            className="font-display text-4xl font-semibold text-brand sm:text-5xl"
          >
            Freshly Baked for Every Occasion
          </h2>

          <p className="mt-5 text-base leading-7 text-bakery-muted sm:text-lg">
            Order your favourite bread and pastries for convenient pickup or
            delivery.
          </p>

          <Link
            href="/menu"
            className={cn(
              buttonVariants({ size: "lg" }),
              "mt-7 bg-brand px-7 font-navigation text-surface hover:bg-brand/90",
            )}
          >
            Explore menu
          </Link>
        </div>
      </div>
    </section>
  );
}
