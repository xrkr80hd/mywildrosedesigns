"use client";

import { FormEvent, useState } from "react";
import type { ProductOption } from "@/lib/product-options";

type CheckoutResponse = {
  url?: string;
  error?: string;
};

type OrderFormProps = {
  options: ProductOption[];
};

export function OrderForm({ options }: OrderFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const hasAvailableOptions = options.length > 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!hasAvailableOptions) {
      setError("Upload checkout options are temporarily unavailable.");
      return;
    }
    setIsSubmitting(true);
    setError("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json().catch(() => ({}))) as CheckoutResponse;

      if (!response.ok || !payload.url) {
        throw new Error(payload.error ?? "Unable to start checkout right now.");
      }

      window.location.href = payload.url;
    } catch (submitError) {
      setIsSubmitting(false);
      setError(
        submitError instanceof Error
          ? submitError.message
          : "An unexpected error occurred. Please try again.",
      );
    }
  }

  return (
    <section className="rounded-3xl border border-rose/20 bg-surface p-6 shadow-lg shadow-black/5 md:p-7">
      <h2 className="text-3xl text-forest">Start Your Order</h2>
      <p className="mt-2 text-sm text-foreground/75">
        Upload your design and complete payment in one flow.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm font-semibold text-forest">Name</span>
            <input
              name="customerName"
              required
              minLength={2}
              className="w-full rounded-xl border border-rose/20 bg-white px-3 py-2 text-sm outline-none transition focus:border-rose"
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-semibold text-forest">Email</span>
            <input
              name="customerEmail"
              type="email"
              required
              className="w-full rounded-xl border border-rose/20 bg-white px-3 py-2 text-sm outline-none transition focus:border-rose"
            />
          </label>
        </div>

        <label className="space-y-1">
          <span className="text-sm font-semibold text-forest">Phone (optional)</span>
          <input
            name="customerPhone"
            className="w-full rounded-xl border border-rose/20 bg-white px-3 py-2 text-sm outline-none transition focus:border-rose"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
          <label className="space-y-1">
            <span className="text-sm font-semibold text-forest">Print Option</span>
            <select
              name="productOptionId"
              required
              disabled={!hasAvailableOptions}
              className="w-full rounded-xl border border-rose/20 bg-white px-3 py-2 text-sm outline-none transition focus:border-rose"
              defaultValue={options[0]?.id}
            >
              {options.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name} - ${(option.amountCents / 100).toFixed(2)}
                </option>
              ))}
            </select>
            {!hasAvailableOptions ? (
              <p className="text-xs text-red-700">
                Upload checkout options are temporarily unavailable. Please contact support.
              </p>
            ) : null}
          </label>
          <label className="space-y-1">
            <span className="text-sm font-semibold text-forest">Quantity</span>
            <input
              name="quantity"
              type="number"
              required
              defaultValue={1}
              min={1}
              max={25}
              className="w-full rounded-xl border border-rose/20 bg-white px-3 py-2 text-sm outline-none transition focus:border-rose"
            />
          </label>
        </div>

        <label className="space-y-1">
          <span className="text-sm font-semibold text-forest">Design File</span>
          <input
            name="designFile"
            type="file"
            required
            accept=".png,.jpg,.jpeg,.webp,.svg,.pdf,.ai,.eps,.psd"
            className="w-full rounded-xl border border-rose/20 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-rose file:px-3 file:py-2 file:text-white"
          />
          <p className="text-xs text-foreground/60">
            Accepted: PNG, JPG, WEBP, SVG, PDF, AI, EPS, PSD (up to 50MB)
          </p>
          <p className="text-xs text-foreground/60">
            Upload your largest high-resolution file if you are unsure about sizing.
          </p>
        </label>

        <label className="space-y-1">
          <span className="text-sm font-semibold text-forest">Order Notes (optional)</span>
          <textarea
            name="notes"
            rows={4}
            maxLength={2000}
            className="w-full rounded-xl border border-rose/20 bg-white px-3 py-2 text-sm outline-none transition focus:border-rose"
            placeholder="Shirt color, sizing, deadline, special instructions..."
          />
        </label>

        {error ? <p className="text-sm font-semibold text-red-700">{error}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting || !hasAvailableOptions}
            className="w-full rounded-xl bg-forest px-4 py-3 text-sm font-semibold text-white transition hover:bg-forest/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
          {isSubmitting ? "Redirecting to secure checkout..." : "Upload Design and Checkout"}
        </button>
      </form>
    </section>
  );
}
