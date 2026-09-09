import type { Metadata } from "next";

import { CustomerOrderPagination } from "@/components/account/orders/CustomerOrderPagination";
import { CustomerOrdersList } from "@/components/account/orders/CustomerOrdersList";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/Header";
import { getCustomerOrders } from "@/lib/queries/customer-orders";

export const metadata: Metadata = {
  title: "My orders",
  description: "Review and track your Confirm Bakery orders.",
};

type CustomerOrdersPageProps = {
  searchParams: Promise<{ page?: string | string[] }>;
};

export default async function CustomerOrdersPage({
  searchParams,
}: CustomerOrdersPageProps) {
  const params = await searchParams;
  const page = Array.isArray(params.page) ? params.page[0] : params.page;
  const result = await getCustomerOrders(page);

  return (
    <main className="min-h-screen bg-background">
      <div className="relative h-24 bg-foreground">
        <SiteHeader />
      </div>

      <section className="min-h-[60vh] px-6 py-14 lg:px-10 lg:py-16">
        <div className="mx-auto max-w-5xl">
          <p className="font-navigation text-sm font-semibold uppercase tracking-[0.18em] text-brand">
            Your account
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">
            My orders
          </h1>
          <p className="mt-3 text-sm text-bakery-muted">
            Track active orders and revisit your previous purchases.
          </p>

          <div className="mt-9">
            <CustomerOrdersList orders={result.orders} />
            <CustomerOrderPagination
              currentPage={result.pagination.page}
              totalPages={result.pagination.totalPages}
            />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
