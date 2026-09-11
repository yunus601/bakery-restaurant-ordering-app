import assert from "node:assert/strict";
import { test } from "vitest";

import { formatPrice } from "@/lib/formatters";

test("formats Ghana cedi values from pesewas", () => {
  assert.equal(formatPrice(0), "GH₵0.00");
  assert.equal(formatPrice(12_345), "GH₵123.45");
});
