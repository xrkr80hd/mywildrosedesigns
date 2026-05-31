"use client";

import { useState } from "react";
import { OrderForm } from "@/components/order-form";
import type { ProductOption } from "@/lib/product-options";

type HomepageOrderSectionProps = {
  options: ProductOption[];
  steps: string[];
};

export function HomepageOrderSection({
  options,
  steps,
}: HomepageOrderSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);

  return (
    <section id="custom-orders" className="mx-auto w-full max-w-6xl px-3 pb-12 sm:px-4 sm:pb-14 md:px-6 md:pb-16">
      <div className="rose-panel overflow-hidden rounded-3xl border border-rose/20">
        <div className="px-4 py-4 sm:px-5 sm:py-5 md:px-8 md:py-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
            Custom Orders
          </p>
          <h2 className="mt-2 text-2xl text-forest sm:text-3xl md:text-4xl">
            Upload Your Design
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-foreground/80 md:text-base">
            Send artwork, choose your print option, and complete secure payment in one flow.
          </p>
        </div>

        <div className="border-t border-rose/20 px-4 py-4 sm:px-5 sm:py-5 md:px-8 md:py-8">
          <div className="w-full rounded-3xl border border-rose/20 bg-white/85 p-4 shadow-sm sm:p-5 md:p-6">
            <button
              type="button"
              onClick={() => setIsHowItWorksOpen((current) => !current)}
              className="flex w-full items-center justify-between gap-4 text-left text-sm font-semibold uppercase tracking-[0.18em] text-forest"
              aria-expanded={isHowItWorksOpen}
              aria-controls="homepage-how-it-works"
            >
              <span>HOW IT WORKS</span>
              <span className="text-lg leading-none text-forest" aria-hidden="true">
                {isHowItWorksOpen ? "↑" : "↓"}
              </span>
            </button>

            {isHowItWorksOpen ? (
              <div
                id="homepage-how-it-works"
                className="mt-4 grid gap-5 md:grid-cols-[minmax(0,1.45fr)_minmax(16rem,0.85fr)] md:items-start"
              >
              <ol className="space-y-2.5 text-sm text-foreground/80 sm:space-y-3">
                {steps.map((step, index) => (
                  <li key={step} className="flex gap-3">
                    <span className="font-semibold text-rose">{index + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>

              <div className="rounded-2xl bg-surface p-3 sm:p-4">
                <h4 className="text-base text-forest sm:text-lg">Accepted file types</h4>
                <p className="mt-1 text-sm text-foreground/75">
                  PNG, JPG, WEBP, SVG, PDF, AI, EPS, PSD up to 50MB.
                </p>
                <p className="mt-1 text-sm text-foreground/75">
                  If you are unsure on sizing, upload your largest high-resolution file.
                </p>
              </div>
              </div>
            ) : null}
          </div>

          <div className="mt-5 flex justify-center">
            <button
              type="button"
              onClick={() => setIsOpen((current) => !current)}
              className="flex w-full max-w-md items-center justify-center rounded-md border border-forest/20 bg-forest px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-forest/90"
              aria-expanded={isOpen}
              aria-controls="homepage-order-form"
            >
              {isOpen
                ? "Click Here to Close the Order Form"
                : "Click Here to Open the Order Form"}
            </button>
          </div>

          {isOpen ? (
            <div id="homepage-order-form" className="mt-6">
              <OrderForm options={options} />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}