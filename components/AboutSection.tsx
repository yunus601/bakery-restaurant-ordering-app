import Image from "next/image";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AboutSection() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="relative isolate flex min-h-[460px] items-center overflow-hidden"
    >
      <Image
        src="/images/about-background.png"
        alt=""
        fill
        sizes="100vw"
        className="-z-20 object-cover object-center"
      />

      <div className="absolute inset-0 -z-10 bg-black/55" />

      <div className="mx-auto w-full max-w-7xl px-6 py-20 lg:px-10">
        <div className="mx-auto max-w-xl text-center">
          <p className="font-navigation font-semibold text-brand-accent">
            Made with care
          </p>

          <h2
            id="about-heading"
            className="mt-2 font-display text-4xl font-semibold text-surface sm:text-5xl"
          >
            About Confirm Bakery
          </h2>

          <p className="mt-6 text-base leading-8 text-surface/80 sm:text-lg">
            From everyday loaves to celebration treats, we prepare fresh baked
            goods for customers across Ghana. Choose convenient pickup or have
            your favourites delivered to your door.
          </p>

          <Link
            href="/about"
            className={cn(
              buttonVariants({ size: "lg" }),
              "mt-8 bg-brand px-7 font-navigation text-surface hover:bg-brand/90",
            )}
          >
            Our story
          </Link>
        </div>
      </div>
    </section>
  );
}
