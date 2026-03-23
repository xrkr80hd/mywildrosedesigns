import { OrderForm } from "@/components/order-form";
import { getUploadProductOptions } from "@/lib/product-options-store";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Upload",
  description:
    "Upload your custom design and submit your Wild Rose production request.",
};

const steps = [
  "Submit your file and order details.",
  "We verify print quality and production notes.",
  "Stripe checkout secures payment.",
  "Production starts and status updates are tracked in admin.",
];

export default async function UploadPage() {
  const options = await getUploadProductOptions();

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <header className="rounded-3xl border border-rose/20 bg-white/85 p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
          Custom Orders
        </p>
        <h1 className="mt-2 text-4xl text-forest">Upload Your Design</h1>
        <p className="mt-2 text-sm text-foreground/75">
          Send artwork, choose your print option, and complete secure payment in
          one flow.
        </p>
      </header>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_420px]">
        <article className="rounded-3xl border border-rose/20 bg-white/85 p-6">
          <h2 className="text-2xl text-forest">How it works</h2>
          <ol className="mt-4 space-y-2 text-sm text-foreground/80">
            {steps.map((step, index) => (
              <li key={step}>
                <span className="mr-2 font-semibold text-rose">
                  {index + 1}.
                </span>
                {step}
              </li>
            ))}
          </ol>

          <div className="mt-6 rounded-2xl bg-surface p-4">
            <h3 className="text-lg text-forest">Accepted file types</h3>
            <p className="mt-1 text-sm text-foreground/75">
              PNG, JPG, WEBP, SVG, PDF, AI, EPS, PSD up to 50MB.
            </p>
            <p className="mt-1 text-sm text-foreground/75">
              If you are unsure on sizing, upload your largest high-resolution
              file.
            </p>
          </div>
        </article>

        <OrderForm options={options} />
      </section>
    </main>
  );
}
