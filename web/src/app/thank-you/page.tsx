import Link from "next/link";
import { ClearCartOnSuccess } from "@/components/clear-cart-on-success";

export default function ThankYouPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-6 py-10">
      <ClearCartOnSuccess />
      <section className="w-full rounded-3xl border border-rose/20 bg-surface p-8 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          Payment Successful
        </p>
        <h1 className="mt-3 text-4xl text-forest">Thank you for your order.</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm text-foreground/75">
          We received your design and payment. Wild Rose Designs will review your
          order and follow up if any details are needed before printing.
        </p>

        <Link
          href="/"
          className="mt-7 inline-flex rounded-xl bg-forest px-5 py-3 text-sm font-semibold text-white hover:bg-forest/90"
        >
          Back to Home
        </Link>
      </section>
    </main>
  );
}
