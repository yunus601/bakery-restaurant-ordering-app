export const siteConfig = {
  name: "Confirm Bakery",
  locale: "en-GH",
  country: "Ghana",
  currency: "GHS",

  contact: {
    phoneDisplay: "+233 20 000 0000",
    phoneHref: "tel:+233200000000",
    email: "hello@confirmbakery.example",
    emailHref: "mailto:hello@confirmbakery.example",
    address: "123 Bakery Street, Accra, Ghana",
  },

  ordering: {
    supportsPickup: true,
    supportsDelivery: true,
  },

  isUsingPlaceholderContactDetails: false,
} as const;
