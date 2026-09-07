import Image from "next/image";
import Link from "next/link";

const categories = ["Cakes", "Muffins", "Croissants", "Bread", "Tarts"];

const galleryItems = [
  {
    src: "/images/gallery/gallery-1.png",
    alt: "Blueberry oat muffin",
  },
  {
    src: "/images/gallery/gallery-2.png",
    alt: "Berry crumble tart",
  },
  {
    src: "/images/gallery/gallery-6.png",
    alt: "Berry-topped cheesecake",
  },
  {
    src: "/images/gallery/gallery-3.png",
    alt: "Blueberry loaf cake",
  },
  {
    src: "/images/gallery/gallery-4.png",
    alt: "Chocolate and raspberry brownie",
  },
  {
    src: "/images/gallery/gallery-7.png",
    alt: "Chocolate cupcake with cream and cherries",
  },
];

export function ExploreGallery() {
  return (
    <section
      aria-labelledby="explore-heading"
      className="bg-background py-20 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <h2
          id="explore-heading"
          className="text-center font-display text-4xl font-semibold text-foreground sm:text-5xl"
        >
          Explore More
        </h2>

        <nav
          aria-label="Product categories"
          className="mt-8 flex gap-6 overflow-x-auto border-b border-border pb-3 font-navigation sm:justify-center"
        >
          {categories.map((category, index) => (
            <Link
              key={category}
              href={`/menu?category=${category.toLowerCase()}`}
              className={
                index === 0
                  ? "shrink-0 border-b-2 border-brand pb-3 font-semibold text-brand"
                  : "shrink-0 pb-3 text-bakery-muted transition-colors hover:text-brand"
              }
            >
              {category}
            </Link>
          ))}
        </nav>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {galleryItems.map((item) => (
            <div
              key={item.src}
              className="group relative aspect-[36/35] overflow-hidden rounded-xl"
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
