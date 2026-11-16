import { z } from "zod";

export const addressSchema = z.object({
  street: z.string().trim().min(2, "Enter your street address").max(255),
  city: z.string().trim().min(2, "Enter your city").max(100),
  country: z.string().trim().min(2, "Enter your country").max(100),
  postal_code: z.string().trim().max(20, "Postal code is too long").optional(),
  is_default: z.boolean().optional(),
});
