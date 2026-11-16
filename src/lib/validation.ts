import { z } from "zod";

const name = z
  .string()
  .trim()
  .min(1, "Required")
  .max(50, "At most 50 characters")
  .regex(/^[\p{L} .'-]+$/u, "Letters only");

export const registerSchema = z.object({
  first_name: name,
  last_name: name,
  email: z.string().trim().toLowerCase().email("Enter a valid email").max(100),
  phone: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "Phone must be 10 digits")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  password: z
    .string()
    .min(8, "At least 8 characters")
    .max(72, "At most 72 characters") // bcrypt only uses the first 72 bytes
    .regex(/[A-Za-z]/, "Include a letter")
    .regex(/\d/, "Include a number"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(100),
  password: z.string().min(1).max(72),
});

export const supplierSchema = z.object({
  supplier_name: z.string().trim().min(2).max(100),
  contact_no: z.string().trim().regex(/^\d{10}$/, "10 digits").optional().or(z.literal("")),
  address: z.string().trim().max(255).optional(),
});
