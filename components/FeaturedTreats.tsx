import Image from "next/image";

import { formatPrice } from "@/lib/formatters";

const featuredTreats = [
  {
    name: "Puff Pastry",
    pricePesewas: 800,
    imageUrl: "/images/featured/puff-pastry.png",
  },
  {
    name: "Doughnuts",
    pricePesewas: 800,
    imageUrl: "/images/featured/doughnuts.png",
  },
  {
    name: "Brownies",
    pricePesewas: 800,
    imageUrl: "/images/featured/brownies.png",
  },
];

export function FeaturedTreats() {
  return (
    <section
      aria-labelledby="featured-treats-heading"
      className="bg-background py-20 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <h2
          id="featured-treats-heading"
          className="text-center font-display text-4xl font-semibold text-foreground sm:text-5xl"
        >
          Featured Treats
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {featuredTreats.map((treat) => (
            <article key={treat.name}>
              <div className="relative aspect-[360/356] overflow-hidden rounded-xl">
                <Image
                  src={treat.imageUrl}
                  alt={treat.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>

              <div className="mt-5 flex items-center justify-between gap-4 font-navigation">
                <h3 className="text-xl font-semibold text-foreground sm:text-2xl">
                  {treat.name}
                </h3>

                <p className="text-xl font-semibold text-brand">
                  {formatPrice(treat.pricePesewas)}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
