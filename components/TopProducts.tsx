import { ProductCard } from "@/components/ProductCard";
import { getFeaturedProducts } from "@/lib/queries/products";

export async function TopProducts() {
  const products = await getFeaturedProducts();
  return (
    <section
      id="top-products"
      aria-labelledby="top-products-heading"
      className="bg-background py-20 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-navigation font-semibold text-brand">
            Fresh from our ovens
          </p>

          <p className="mt-4 text-bakery-muted">
            Customer favourites baked fresh for pickup and delivery.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={{
                id: product.id,
                category: product.category.name,
                name: product.name,
                slug: product.slug,
                imageUrl: product.imageUrl,
                pricePesewas: product.pricePesewas,
                isAvailable: product.isAvailable,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
