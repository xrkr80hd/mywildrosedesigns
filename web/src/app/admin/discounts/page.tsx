import Link from "next/link";
import { getWebsiteDiscounts, type WebsiteDiscount } from "@/lib/checkout-discounts";
import { saveDiscountCode } from "./actions";
export const dynamic = "force-dynamic";
export default async function DiscountsPage({ searchParams }: { searchParams: Promise<{ result?: string }> }) {
  const { result } = await searchParams;
  let codes: WebsiteDiscount[] = [];
  let unavailable = false;
  try { codes = (await getWebsiteDiscounts()) ?? []; } catch { unavailable = true; }
  return <main className="admin-content mx-auto w-full max-w-3xl px-6 py-10">
    <Link href="/admin" className="underline">Back to admin</Link>
    <h1 className="mt-6 text-4xl text-forest">Discount Codes</h1>
    <p className="mt-3">Add existing Stripe codes for customers to use on this website.</p>
    {result && <p role="status" className="mt-4 border p-4">{result === "saved" ? "Discount codes updated." : result === "invalid" ? "No active Stripe code or uniquely named coupon was found." : "Unable to save. Check payment and database configuration, then try again."}</p>}
    {unavailable ? <p role="alert" className="mt-4">Discount settings are temporarily unavailable.</p> : <>
      <details open className="mt-6 border border-rose/20 bg-white p-6">
        <summary className="cursor-pointer font-semibold">Add a discount code</summary>
        <form action={saveDiscountCode} className="mt-5 space-y-4">
          <input type="hidden" name="operation" value="add" />
          <label className="block">Existing Stripe code or coupon name<input name="code" required maxLength={200} autoComplete="off" placeholder="treatyourself" className="mt-2 block w-full border p-3" /></label>
          <p className="text-sm">Stripe supplies the amount and redemption rules.</p>
          <button className="border bg-forest px-5 py-3 text-white" type="submit">Add code</button>
        </form>
      </details>
      <details open className="mt-6 border border-rose/20 bg-white p-6">
        <summary className="cursor-pointer font-semibold">Website codes ({codes.length})</summary>
        <div className="mt-4 space-y-3">{codes.length === 0 && <p>No website codes added yet.</p>}{codes.map((item) => <article key={item.code} className="flex flex-wrap items-center justify-between gap-3 border p-4">
          <div><strong>{item.code}</strong><p>{item.label}</p></div>
          <form action={saveDiscountCode}><input type="hidden" name="operation" value="delete" /><input type="hidden" name="code" value={item.code} /><button className="border px-4 py-2" type="submit">Remove from website</button></form>
        </article>)}</div>
        <p className="mt-4 text-sm">Removing a code blocks it on new website checkouts. It stays in Stripe. Already-open payment sessions keep their discount.</p>
      </details>
    </>}
  </main>;
}
