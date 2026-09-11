import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../lib/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const categories = [
  {
    name: "Bread",
    slug: "bread",
    description: "Freshly baked loaves and rolls.",
    sortOrder: 1,
  },
  {
    name: "Pastries",
    slug: "pastries",
    description: "Sweet and savoury pastries.",
    sortOrder: 2,
  },
  {
    name: "Cakes",
    slug: "cakes",
    description: "Cakes for everyday treats and celebrations.",
    sortOrder: 3,
  },
];

const products = [
  {
    name: "Fruit Danish",
    slug: "fruit-danish",
    description: "A flaky Danish pastry finished with a sweet fruit topping.",
    categorySlug: "pastries",
    pricePesewas: 2500,
    imageUrl: "/images/products/asset-7.png",
    isFeatured: true,
    sortOrder: 1,
  },
  {
    name: "Seeded Loaf",
    slug: "seeded-loaf",
    description: "A hearty artisan loaf topped with a blend of seeds.",
    categorySlug: "bread",
    pricePesewas: 4000,
    imageUrl: "/images/products/asset-8.png",
    isFeatured: true,
    sortOrder: 2,
  },
  {
    name: "Artisan Boule",
    slug: "artisan-boule",
    description: "A rustic round loaf with a crisp crust and soft centre.",
    categorySlug: "bread",
    pricePesewas: 3500,
    imageUrl: "/images/products/asset-3.png",
    isFeatured: true,
    sortOrder: 3,
  },
  {
    name: "Sesame Roll",
    slug: "sesame-roll",
    description: "A soft golden bread roll topped with toasted sesame seeds.",
    categorySlug: "bread",
    pricePesewas: 1800,
    imageUrl: "/images/products/asset-6.png",
    isFeatured: true,
    sortOrder: 4,
  },
  {
    name: "Layered Pastry",
    slug: "layered-pastry",
    description: "A light, buttery pastry baked into crisp, delicate layers.",
    categorySlug: "pastries",
    pricePesewas: 3000,
    imageUrl: "/images/products/asset-4.png",
    isFeatured: true,
    sortOrder: 5,
  },
  {
    name: "Lattice Pastry",
    slug: "lattice-pastry",
    description: "A golden lattice pastry with a sweet baked filling.",
    categorySlug: "pastries",
    pricePesewas: 2200,
    imageUrl: "/images/products/asset-5.png",
    isFeatured: true,
    sortOrder: 6,
  },
];

async function main() {
  await prisma.restaurantSettings.upsert({
    where: { id: "default" },
    update: {
      businessName: "Confirm Bakery",
      currency: "GHS",
      contactPhone: "+233 20 000 0000",
      contactEmail: "hello@confirmbakery.example",
      pickupAddress: "123 Bakery Street, Accra, Ghana",
      openingHours: "Monday–Saturday: 7:00 AM–7:00 PM",
      acceptingOrders: true,
      pickupEnabled: true,
      deliveryEnabled: true,
      pickupPreparationMinMinutes: 30,
      pickupPreparationMaxMinutes: 45,
      flatDeliveryFeePesewas: 2000,
      minimumOrderPesewas: 0,
    },
    create: {
      id: "default",
      businessName: "Confirm Bakery",
      currency: "GHS",
      contactPhone: "+233 20 000 0000",
      contactEmail: "hello@confirmbakery.example",
      pickupAddress: "123 Bakery Street, Accra, Ghana",
      openingHours: "Monday–Saturday: 7:00 AM–7:00 PM",
      acceptingOrders: true,
      pickupEnabled: true,
      deliveryEnabled: true,
      pickupPreparationMinMinutes: 30,
      pickupPreparationMaxMinutes: 45,
      flatDeliveryFeePesewas: 2000,
      minimumOrderPesewas: 0,
    },
  });

  await prisma.deliveryZone.upsert({
    where: { name: "Accra" },
    update: {
      deliveryFeePesewas: 2000,
      isActive: true,
      sortOrder: 0,
    },
    create: {
      name: "Accra",
      deliveryFeePesewas: 2000,
      isActive: true,
      sortOrder: 0,
    },
  });

  const categoryIds = new Map<string, string>();

  for (const category of categories) {
    const savedCategory = await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });

    categoryIds.set(savedCategory.slug, savedCategory.id);
  }

  for (const product of products) {
    const categoryId = categoryIds.get(product.categorySlug);

    if (!categoryId) {
      throw new Error(`Category not found for product: ${product.name}`);
    }

    const productData = {
      name: product.name,
      slug: product.slug,
      description: product.description,
      pricePesewas: product.pricePesewas,
      imageUrl: product.imageUrl,
      isFeatured: product.isFeatured,
      sortOrder: product.sortOrder,
    };

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        ...productData,
        categoryId,
        isAvailable: true,
        archivedAt: null,
      },
      create: {
        ...productData,
        categoryId,
        isAvailable: true,
      },
    });
  }

  console.log(
    `Seeded restaurant settings, ${categories.length} categories, and ${products.length} products.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
