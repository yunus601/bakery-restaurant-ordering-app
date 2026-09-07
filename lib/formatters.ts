const ghanaCediFormatter = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: "GHS",
});

export const formatPrice = (pricePesewa: number) => {
  return ghanaCediFormatter.format(pricePesewa / 100);
};
