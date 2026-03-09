import { z } from "zod";

export const checkoutRequestSchema = z.object({
  customerName: z.string().trim().min(2).max(120),
  customerEmail: z.string().trim().email(),
  customerPhone: z.string().trim().max(30).optional(),
  productOptionId: z.string().trim().min(1).max(120),
  quantity: z.coerce.number().int().min(1).max(25),
  notes: z.string().trim().max(2000).optional(),
});

export const cartCheckoutItemSchema = z.object({
  id: z.string().trim().min(1).max(120),
  variantId: z.string().trim().uuid().optional(),
  variantSize: z.string().trim().max(40).optional(),
  variantColor: z.string().trim().max(60).optional(),
  quantity: z.coerce.number().int().min(1).max(100),
});

export const cartCheckoutRequestSchema = z.object({
  customerName: z.string().trim().min(2).max(120),
  customerEmail: z.string().trim().email(),
  customerPhone: z.string().trim().max(30).optional(),
  notes: z.string().trim().max(2000).optional(),
  shippingMethod: z.enum(["shipping", "pickup"]).optional().default("shipping"),
  items: z.array(cartCheckoutItemSchema).min(1).max(100),
});

export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;
export type CartCheckoutRequest = z.infer<typeof cartCheckoutRequestSchema>;

export function normalizeOptionalText(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}
