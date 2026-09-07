import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type {
  AvailabilityFilter,
  ProductVisibilityFilter,
} from "@/lib/queries/admin-product";
import { cn } from "@/lib/utils";

type ProductPaginationProps = {
  currentPage: number;
  totalPages: number;
  search?: string;
  categoryId?: string;
  availability: AvailabilityFilter;
  visibility: ProductVisibilityFilter;
};

export function ProductPagination({
  currentPage,
  totalPages,
  search,
  categoryId,
  availability,
  visibility,
}: ProductPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <Pagination className="mt-6">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={buildProductsHref(
              currentPage - 1,
              search,
              categoryId,
              availability,
              visibility,
            )}
            aria-disabled={currentPage <= 1}
            tabIndex={currentPage <= 1 ? -1 : undefined}
            className={cn(
              currentPage <= 1 && "pointer-events-none opacity-50",
            )}
          />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink
            href={buildProductsHref(
              currentPage,
              search,
              categoryId,
              availability,
              visibility,
            )}
            isActive
            aria-label={`Page ${currentPage}`}
          >
            {currentPage}
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext
            href={buildProductsHref(
              currentPage + 1,
              search,
              categoryId,
              availability,
              visibility,
            )}
            aria-disabled={currentPage >= totalPages}
            tabIndex={currentPage >= totalPages ? -1 : undefined}
            className={cn(
              currentPage >= totalPages && "pointer-events-none opacity-50",
            )}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

function buildProductsHref(
  page: number,
  search?: string,
  categoryId?: string,
  availability: AvailabilityFilter = "all",
  visibility: ProductVisibilityFilter = "active",
) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  if (search) params.set("q", search);
  if (categoryId) params.set("category", categoryId);
  if (availability !== "all") params.set("availability", availability);
  if (visibility !== "active") params.set("visibility", visibility);
  return `/admin/products?${params.toString()}`;
}
