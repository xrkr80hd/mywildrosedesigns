import "server-only";
import { z } from "zod";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStripeServerClient } from "@/lib/stripe";
import { buildDiscountOptions, type WebsiteDiscount } from "@/lib/discount-policy";
export { DiscountCodeError, type WebsiteDiscount } from "@/lib/discount-policy";
const registrySchema = z.object({ codes: z.array(z.object({
  code: z.string().min(1).max(200), promotionCodeId: z.string().optional(), couponId: z.string().optional(), label: z.string(),
}).refine((item) => Boolean(item.promotionCodeId || item.couponId))) });
export async function getWebsiteDiscounts(): Promise<WebsiteDiscount[] | null> {
  const result = await getSupabaseAdminClient().from("welcome_posts")
    .select("body").eq("title", "site-setting::checkout_discount").eq("active", false).maybeSingle();
  if (result.error) throw new Error(result.error.message);
  if (!result.data) return null;
  return registrySchema.parse(JSON.parse(result.data.body)).codes;
}
export async function getCheckoutDiscountOptions(code = "") {
  return buildDiscountOptions(getStripeServerClient(), await getWebsiteDiscounts(), code);
}
