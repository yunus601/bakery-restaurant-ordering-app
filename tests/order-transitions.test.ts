import assert from "node:assert/strict";
import { test } from "vitest";

import { canTransitionPaymentStatus, getAllowedPaymentStatuses } from "@/lib/orders/payment-transition";
import { canTransitionOrderStatus, getAllowedOrderStatuses } from "@/lib/orders/status-transition";

test("order transitions allow only the expected pickup workflow", () => {
  assert.deepEqual(getAllowedOrderStatuses("PLACED", "PICKUP"), ["CONFIRMED", "CANCELLED"]);
  assert.equal(canTransitionOrderStatus("PLACED", "PREPARING", "PICKUP"), false);
  assert.equal(canTransitionOrderStatus("READY", "COMPLETED", "PICKUP"), true);
  assert.equal(canTransitionOrderStatus("READY", "OUT_FOR_DELIVERY", "PICKUP"), false);
});

test("delivery orders must leave the bakery before completion", () => {
  assert.deepEqual(getAllowedOrderStatuses("READY", "DELIVERY"), ["OUT_FOR_DELIVERY", "CANCELLED"]);
  assert.equal(canTransitionOrderStatus("OUT_FOR_DELIVERY", "COMPLETED", "DELIVERY"), true);
  assert.equal(canTransitionOrderStatus("COMPLETED", "CANCELLED", "DELIVERY"), false);
});

test("payment transitions do not permit invalid reversals", () => {
  assert.deepEqual(getAllowedPaymentStatuses("PENDING"), ["PAID"]);
  assert.equal(canTransitionPaymentStatus("PAID", "REFUNDED"), true);
  assert.equal(canTransitionPaymentStatus("REFUNDED", "PAID"), false);
  assert.equal(canTransitionPaymentStatus("FAILED", "PENDING"), true);
});
