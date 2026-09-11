ALTER TABLE "RestaurantSettings"
ADD COLUMN "contactPhone" TEXT NOT NULL DEFAULT '+233 20 000 0000',
ADD COLUMN "contactEmail" TEXT NOT NULL DEFAULT 'hello@confirmbakery.example',
ADD COLUMN "pickupAddress" TEXT NOT NULL DEFAULT '123 Bakery Street, Accra, Ghana',
ADD COLUMN "openingHours" TEXT NOT NULL DEFAULT 'Monday–Saturday: 7:00 AM–7:00 PM',
ADD COLUMN "acceptingOrders" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "pickupPreparationMinMinutes" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN "pickupPreparationMaxMinutes" INTEGER NOT NULL DEFAULT 45;
