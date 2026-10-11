"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AddToCartButton } from "@/components/add-to-cart-button";

type HotItemPopupProps = {
  promoLabel: string;
  title: string;
  message: string;
  showCta: boolean;
  ctaText: string;
  ctaHref: string;
  product: {
    id: string;
    title: string;
    slug: string;
    effectivePriceCents: number;
    imageUrl: string;
    hasVariants: boolean;
  } | null;
};

export function HotItemPopup({
  promoLabel,
  title,
  message,
  showCta,
  ctaText,
  ctaHref,
  product,
}: HotItemPopupProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    let openTimer: number | undefined;
    function scheduleOpen() {
      openTimer = window.setTimeout(() => setIsOpen(true), 2_000);
    }
    if (document.readyState === "complete") {
      scheduleOpen();
    } else {
      window.addEventListener("load", scheduleOpen, { once: true });
    }
    return () => {
      window.removeEventListener("load", scheduleOpen);
      window.clearTimeout(openTimer);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const autoDismissTimer = window.setTimeout(() => {
      setIsOpen(false);
      setIsClosing(true);
    }, 10_000);
    return () => window.clearTimeout(autoDismissTimer);
  }, [isOpen]);

  useEffect(() => {
    if (!isClosing) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const removalTimer = window.setTimeout(() => setIsDismissed(true), reducedMotion ? 0 : 600);
    return () => window.clearTimeout(removalTimer);
  }, [isClosing]);

  function handleDismiss() {
    setIsOpen(false);
    setIsClosing(true);
  }

  if (isDismissed) {
    return null;
  }

  return (
    <aside
      aria-label={title || "Store promotion"}
      aria-hidden={!isOpen}
      inert={!isOpen}
      className={`hot-item-popup fixed bottom-4 right-4 z-40 w-[min(360px,calc(100vw-2rem))] rounded-2xl border border-rose/30 bg-white p-4 shadow-2xl ${isOpen ? "hot-item-popup-open" : "hot-item-popup-hidden"}`}
    >
      <button
        type="button"
        onClick={handleDismiss}
        className="float-right rounded-full border border-rose/30 px-2 py-0.5 text-xs font-semibold"
        aria-label="Close popup"
      >
        x
      </button>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">{promoLabel}</p>
      <h3 className="mt-1 text-2xl text-forest">{title}</h3>
      <p className="mt-1 text-sm text-foreground/80">{message}</p>
      {product ? (
        <>
          <div className="mt-3 overflow-hidden rounded-xl border border-rose/15 bg-surface p-2">
            <Image
              src={product.imageUrl}
              alt={product.title}
              width={260}
              height={260}
              className="mx-auto h-36 w-auto object-contain"
            />
          </div>
          <p className="mt-2 text-sm font-semibold text-forest">{product.title}</p>
          <p className="text-lg font-bold text-rose">
            ${(product.effectivePriceCents / 100).toFixed(2)}
          </p>
        </>
      ) : null}
      {showCta ? (
        <div className="mt-3">
          {product ? (
            product.hasVariants ? (
              <Link
                href={`/shop/${product.slug}`}
                className="inline-flex w-full items-center justify-center rounded-xl bg-rose px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose/90"
              >
                {ctaText || "Choose Options"}
              </Link>
            ) : (
              <AddToCartButton
                id={product.id}
                title={product.title}
                price={product.effectivePriceCents / 100}
                productSlug={product.slug}
                label={ctaText}
                addedLabel="In Your Cart"
                className="w-full rounded-xl bg-rose px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose/90"
              />
            )
          ) : (
            <Link
              href={ctaHref || "/shop"}
              className="inline-flex w-full items-center justify-center rounded-xl bg-rose px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose/90"
            >
              {ctaText}
            </Link>
          )}
        </div>
      ) : null}
    </aside>
  );
}
