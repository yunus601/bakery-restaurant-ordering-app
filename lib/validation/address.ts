import { z } from "zod";

export const MAX_SAVED_ADDRESSES = 10;

const optionalText = (maxLength: number) =>
  z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().trim().max(maxLength).optional(),
  );

export const addressSchema = z.object({
  label: optionalText(40),

  recipient: z
    .string()
    .trim()
    .min(2, "Recipient name is required.")
    .max(100, "Recipient name is too long."),

  phone: z
    .string()
    .trim()
    .min(9, "Enter a valid phone number.")
    .max(20, "Phone number is too long.")
    .regex(/^[0-9+()\-\s]+$/, "Phone number contains invalid characters."),

  addressLine: z
    .string()
    .trim()
    .min(5, "Enter a complete delivery address.")
    .max(200, "Delivery address is too long."),

  city: z
    .string()
    .trim()
    .min(2, "City is required.")
    .max(100, "City is too long."),

  region: optionalText(100),
  directions: optionalText(300),
  isDefault: z.boolean(),
});

export type AddressInput = z.infer<typeof addressSchema>;
