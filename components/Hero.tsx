import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative isolate flex min-h-[720px] items-center overflow-hidden">
      <Image
        src="/images/hero-bakery.png"
        alt="Fresh artisan bread surrounded by baking ingredients"
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover object-[68%_center] md:object-center"
      />

      <div className="absolute inset-0 -z-10 bg-black/45" />

      <div className="mx-auto w-full max-w-7xl px-6 pb-20 pt-36 lg:px-10">
        <div className="max-w-xl">
          <p className="font-navigation text-lg font-semibold text-brand-accent sm:text-xl">
            Delicious bakery
          </p>

          <h1 className="mt-3 font-display text-5xl font-semibold leading-tight text-surface sm:text-6xl lg:text-7xl">
            Sweet Treats,
            <span className="block">Perfect Eats</span>
          </h1>

          <p className="mt-6  text-base leading-7 text-surface/85 sm:text-lg max-w-xs sm:max-w-lg">
            Freshly baked bread, cakes, and pastries prepared for pickup or
            delivery across Ghana.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-6">
            <Link
              href="/menu"
              className="rounded-lg bg-brand px-7 py-4 font-navigation font-semibold text-surface transition-colors hover:bg-brand/90"
            >
              Shop now
            </Link>

            <Link
              href="#about"
              className="font-navigation font-semibold text-brand-accent underline-offset-8 hover:underline"
            >
              Learn more
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
