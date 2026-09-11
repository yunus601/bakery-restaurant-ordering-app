ALTER TABLE "Order" ADD COLUMN "deliveryZoneName" TEXT;

CREATE TABLE "DeliveryZone" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "deliveryFeePesewas" INTEGER NOT NULL,
    "minimumOrderPesewas" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DeliveryZone_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DeliveryZone_name_key" ON "DeliveryZone"("name");
CREATE INDEX "DeliveryZone_isActive_sortOrder_idx" ON "DeliveryZone"("isActive", "sortOrder");

INSERT INTO "DeliveryZone" (
    "id",
    "name",
    "deliveryFeePesewas",
    "minimumOrderPesewas",
    "isActive",
    "sortOrder",
    "updatedAt"
)
SELECT
    'legacy-accra-zone',
    'Accra',
    "flatDeliveryFeePesewas",
    NULL,
    "deliveryEnabled",
    0,
    CURRENT_TIMESTAMP
FROM "RestaurantSettings"
WHERE "id" = 'default';
