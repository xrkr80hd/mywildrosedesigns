"use server";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ADMIN_SESSION_COOKIE, encodeAdminSession } from "@/lib/admin-session";
import { getAdminCredentials, isAdminAuthBypassed } from "@/lib/env";
import { getWebsiteDiscounts } from "@/lib/checkout-discounts";
import { resolveStripeDiscount } from "@/lib/discount-policy";
import { getStripeServerClient } from "@/lib/stripe";
import { saveSiteContentValues } from "@/lib/site-content";

export async function saveDiscountCode(form: FormData) {
  const { username, password } = getAdminCredentials();
  const expected = username && password ? encodeAdminSession(username, password) : null;
  const cookie = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  const authorization = (await headers()).get("authorization");
  if (!isAdminAuthBypassed() && (!expected || (cookie !== expected && authorization !== `Basic ${expected}`))) {
    redirect("/admin/login");
  }
  const code = String(form.get("code") ?? "").trim();
  let message = "saved";
  try {
    if (code.length > 200) throw new Error("Invalid code");
    if (!code) throw new Error("Enter a code");
    const codes = (await getWebsiteDiscounts()) ?? [];
    if (form.get("operation") === "delete") {
      await saveSiteContentValues({ checkout_discount: JSON.stringify({ codes: codes.filter((item) => item.code.toLowerCase() !== code.toLowerCase()) }) });
    } else {
      const promotion = await resolveStripeDiscount(getStripeServerClient(), code);
      if (!promotion) redirect("/admin/discounts?result=invalid");
      await saveSiteContentValues({ checkout_discount: JSON.stringify({ codes: [
        ...codes.filter((item) => item.code.toLowerCase() !== promotion.code.toLowerCase()),
        promotion,
      ] }) });
    }
  } catch (error) {
    // Redirects are control flow and must not be swallowed.
    if (error instanceof Error && error.message === "NEXT_REDIRECT") throw error;
    console.error("Unable to save checkout discount", error);
    message = "error";
  }
  revalidatePath("/admin/discounts");
  redirect(`/admin/discounts?result=${message}`);
}
