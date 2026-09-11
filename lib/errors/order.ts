export type OrderItemIssue = {
  productId: string;
  productName: string;
  reason: "unavailable" | "price_changed";
  previousPricePesewas?: number;
  currentPricePesewas?: number;
};

export class OrderError extends Error {
  constructor(
    message: string,
    readonly itemIssues: OrderItemIssue[] = [],
  ) {
    super(message);
    this.name = "OrderError";
  }
}
