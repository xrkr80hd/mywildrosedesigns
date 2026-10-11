"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import { AddToCartButton } from "@/components/add-to-cart-button";

import { DEFAULT_POPUP_TIMING, parsePopupTiming, type PopupTiming } from "@/lib/popup-timing-options";

type HotItemPopupProps = {
  timing?: PopupTiming;
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
  timing = DEFAULT_POPUP_TIMING,
  promoLabel,
  title,
  message,
  showCta,
  ctaText,
  ctaHref,
  product,
}: HotItemPopupProps) {
  const { delaySeconds, fadeSeconds } = parsePopupTiming(timing);
  const [hasEntered, setHasEntered] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    let openTimer: number | undefined;
    function scheduleOpen() {
      openTimer = window.setTimeout(() => setIsOpen(true), delaySeconds * 1000);
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
  }, [delaySeconds]);

  useEffect(() => {
    if (!isOpen) return;
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : fadeSeconds * 1000;
    const enteredTimer = window.setTimeout(() => setHasEntered(true), duration);
    return () => window.clearTimeout(enteredTimer);
  }, [isOpen, fadeSeconds]);

  useEffect(() => {
    if (!isOpen || !hasEntered || isHovered || isFocused) return;
    const autoDismissTimer = window.setTimeout(() => {
      setIsOpen(false);
      setIsClosing(true);
    }, 10_000);
    return () => window.clearTimeout(autoDismissTimer);
  }, [isOpen, hasEntered, isHovered, isFocused]);

  useEffect(() => {
    if (!isClosing) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const removalTimer = window.setTimeout(() => setIsDismissed(true), reducedMotion ? 0 : fadeSeconds * 1000);
    return () => window.clearTimeout(removalTimer);
  }, [isClosing, fadeSeconds]);

  function handleDismiss() {
    setIsOpen(false);
    setIsClosing(true);
  }

  if (isDismissed) {
    return null;
  }

  return (
    <aside
      style={{ "--popup-fade-duration": `${fadeSeconds}s` } as CSSProperties}
      aria-label={title || "Store promotion"}
      aria-hidden={!isOpen}
      inert={!isOpen}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocusCapture={() => setIsFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsFocused(false);
      }}
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
