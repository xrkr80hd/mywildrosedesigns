import type Stripe from "stripe";

export type WebsiteDiscount = { code: string; promotionCodeId?: string; couponId?: string; label: string };
export class DiscountCodeError extends Error {}

export async function resolveStripeDiscount(stripe: Stripe, code: string): Promise<WebsiteDiscount | null> {
  const promotions = await stripe.promotionCodes.list({ code: code.trim(), active: true, limit: 100 });
  const promotion = promotions.data.find((item) => !item.customer && (!item.expires_at || item.expires_at > Date.now() / 1000));
  let coupon: Stripe.Coupon | null = null;
  if (promotion) {
    const ref = promotion.promotion.coupon;
    coupon = typeof ref === "string" ? await stripe.coupons.retrieve(ref) : ref;
  } else {
    // Some owners created a named coupon without a customer-facing promotion code.
    // Match its exact name (case-insensitive); never guess a discount amount.
    const matches: Stripe.Coupon[] = [];
    for await (const candidate of stripe.coupons.list({ limit: 100 })) {
      if (candidate.valid && (candidate.name?.toLowerCase() === code.trim().toLowerCase() || candidate.id === code.trim())) matches.push(candidate);
    }
    if (matches.length !== 1) return null;
    coupon = matches[0];
  }
  if (!coupon?.valid) return null;
  const label = coupon.percent_off !== null ? `${coupon.percent_off}% off` : `${new Intl.NumberFormat("en-US", { style: "currency", currency: coupon.currency ?? "usd" }).format((coupon.amount_off ?? 0) / 100)} off`;
  return promotion
    ? { code: promotion.code, promotionCodeId: promotion.id, label }
    : { code: code.trim(), couponId: coupon.id, label };
}

export async function buildDiscountOptions(stripe: Stripe, codes: WebsiteDiscount[] | null, enteredCode = ""): Promise<Pick<Stripe.Checkout.SessionCreateParams, "discounts" | "allow_promotion_codes">> {
  const entered = enteredCode.trim();
  if (!entered) return codes === null ? { allow_promotion_codes: true } : {};
  const linked = codes?.find((item) => item.code.toLowerCase() === entered.toLowerCase());
  if (codes !== null && !linked) throw new DiscountCodeError("This discount code is not available on this website.");
  if (linked?.couponId) {
    const coupon = await stripe.coupons.retrieve(linked.couponId);
    if (!coupon.valid) throw new DiscountCodeError("This discount code is invalid or expired.");
    return { discounts: [{ coupon: coupon.id }] };
  }
  const result = await stripe.promotionCodes.list({ code: entered, active: true, limit: 100 });
  const active = result.data.find((item) => !item.customer && (!item.expires_at || item.expires_at > Date.now() / 1000));
  if (!active || (linked?.promotionCodeId && active.id !== linked.promotionCodeId)) throw new DiscountCodeError("This discount code is invalid or expired.");
  return { discounts: [{ promotion_code: active.id }] };
}
