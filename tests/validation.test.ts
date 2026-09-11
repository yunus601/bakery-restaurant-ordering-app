import assert from "node:assert/strict";
import { test } from "vitest";

import { addressSchema } from "@/lib/validation/address";
import { checkoutSchema } from "@/lib/validation/order";

const checkoutBase = {
  customerName: "Ama Mensah",
  customerPhone: "+233 24 123 4567",
  customerEmail: "ama@example.com",
  customerNote: "",
  items: [{ productId: "bread", quantity: 2, clientUnitPricePesewas: 1_500 }],
  idempotencyKey: "123e4567-e89b-12d3-a456-426614174000",
};

test("checkout rejects client price tampering and invalid quantities", () => {
  assert.equal(checkoutSchema.safeParse({ ...checkoutBase, fulfillmentMethod: "PICKUP", items: [{ productId: "bread", quantity: 0, clientUnitPricePesewas: -1 }] }).success, false);
});

test("delivery requires a selected zone and complete address", () => {
  assert.equal(checkoutSchema.safeParse({ ...checkoutBase, fulfillmentMethod: "DELIVERY" }).success, false);
  assert.equal(checkoutSchema.safeParse({ ...checkoutBase, fulfillmentMethod: "DELIVERY", deliveryZoneId: "accra", deliveryAddressLine: "12 Market Street", deliveryCity: "Accra" }).success, true);
});

test("saved-address validation normalizes blank optional fields", () => {
  const parsed = addressSchema.parse({ label: " ", recipient: "Ama Mensah", phone: "+233 24 123 4567", addressLine: "12 Market Street", city: "Accra", region: "", directions: "", isDefault: false });
  assert.equal(parsed.label, undefined);
  assert.equal(parsed.region, undefined);
  assert.equal(parsed.directions, undefined);
});
