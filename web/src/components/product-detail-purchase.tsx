"use client";

import { useEffect, useMemo, useState } from "react";
import { AddToCartButton } from "@/components/add-to-cart-button";

type ProductVariantOption = {
  id: string;
  sizeValue: string | null;
  colorValue: string | null;
  label: string;
  sku: string | null;
  basePriceCents: number;
  effectivePriceCents: number;
  stockOnHand: number;
};

type ProductDetailPurchaseProps = {
  product: {
    id: string;
    slug: string;
    title: string;
    cartCtaText: string;
    basePriceCents: number;
    effectivePriceCents: number;
    saleEnabled: boolean;
    salePercentOff: number;
    saleLabel: string;
    stockOnHand: number;
    variants: ProductVariantOption[];
  };
};

function formatUsd(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function uniqueNonEmpty(values: Array<string | null>): string[] {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value))));
}

export function ProductDetailPurchase({ product }: ProductDetailPurchaseProps) {
  const hasVariants = product.variants.length > 0;
  const sizeOptions = useMemo(
    () => uniqueNonEmpty(product.variants.map((variant) => variant.sizeValue)),
    [product.variants],
  );
  const colorOptions = useMemo(
    () => uniqueNonEmpty(product.variants.map((variant) => variant.colorValue)),
    [product.variants],
  );

  const [selectedSize, setSelectedSize] = useState<string>(sizeOptions[0] ?? "");
  const [selectedColor, setSelectedColor] = useState<string>(
    hasVariants ? (product.variants[0]?.colorValue ?? "") : "",
  );

  const availableColors = useMemo(() => {
    if (!hasVariants) {
      return [];
    }
    const scoped = selectedSize
      ? product.variants.filter((variant) => variant.sizeValue === selectedSize)
      : product.variants;
    return uniqueNonEmpty(scoped.map((variant) => variant.colorValue));
  }, [hasVariants, product.variants, selectedSize]);

  useEffect(() => {
    if (!selectedColor) {
      return;
    }
    if (!availableColors.includes(selectedColor)) {
      setSelectedColor(availableColors[0] ?? "");
    }
  }, [availableColors, selectedColor]);

  const selectedVariant = useMemo(() => {
    if (!hasVariants) {
      return null;
    }

    const exactMatch = product.variants.find((variant) => {
      const matchesSize = selectedSize ? variant.sizeValue === selectedSize : true;
      const matchesColor = selectedColor ? variant.colorValue === selectedColor : true;
      return matchesSize && matchesColor;
    });

    if (exactMatch) {
      return exactMatch;
    }

    return (
      product.variants.find((variant) =>
        selectedSize ? variant.sizeValue === selectedSize : true,
      ) ?? product.variants[0]
    );
  }, [hasVariants, product.variants, selectedColor, selectedSize]);

  const displayBasePriceCents = selectedVariant?.basePriceCents ?? product.basePriceCents;
  const displayEffectivePriceCents =
    selectedVariant?.effectivePriceCents ?? product.effectivePriceCents;
  const displayStock = selectedVariant?.stockOnHand ?? product.stockOnHand;
  const isOutOfStock = displayStock <= 0;

  return (
    <div className="mt-5 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        {product.saleEnabled ? (
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-rose">
            {product.saleLabel} {product.salePercentOff}% off
          </p>
        ) : null}
        <p className="text-2xl font-bold text-rose">
          {formatUsd(displayEffectivePriceCents)}
          {product.saleEnabled ? (
            <span className="ml-2 text-sm font-medium text-foreground/55 line-through">
              {formatUsd(displayBasePriceCents)}
            </span>
          ) : null}
        </p>
      </div>

      {hasVariants ? (
        <div className="grid gap-3 rounded-2xl border border-rose/20 bg-surface/60 p-4 sm:grid-cols-2">
          {sizeOptions.length > 0 ? (
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">
                Size
              </span>
              <select
                value={selectedSize}
                onChange={(event) => setSelectedSize(event.currentTarget.value)}
                className="w-full rounded-xl border border-rose/20 bg-white px-3 py-2 text-sm"
              >
                {sizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {colorOptions.length > 0 ? (
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">
                Color
              </span>
              <select
                value={selectedColor}
                onChange={(event) => setSelectedColor(event.currentTarget.value)}
                className="w-full rounded-xl border border-rose/20 bg-white px-3 py-2 text-sm"
              >
                {(availableColors.length > 0 ? availableColors : colorOptions).map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {selectedVariant ? (
            <p className="text-xs text-foreground/75 sm:col-span-2">
              Selected:{" "}
              <span className="font-semibold text-forest">
                {selectedVariant.label || "Default option"}
              </span>
              {selectedVariant.sku ? ` • SKU ${selectedVariant.sku}` : ""}
            </p>
          ) : null}
        </div>
      ) : null}

      <p className={`text-xs ${isOutOfStock ? "text-red-700" : "text-foreground/75"}`}>
        {isOutOfStock
          ? "Out of stock right now."
          : `${displayStock} in stock${hasVariants ? " for this option" : ""}.`}
      </p>

      <AddToCartButton
        id={product.id}
        title={product.title}
        price={displayEffectivePriceCents / 100}
        productSlug={product.slug}
        variantId={selectedVariant?.id}
        variantSize={selectedVariant?.sizeValue ?? undefined}
        variantColor={selectedVariant?.colorValue ?? undefined}
        label={isOutOfStock ? "Out of Stock" : product.cartCtaText}
        className="rounded-xl bg-rose px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose/90"
        disabled={isOutOfStock || (hasVariants && !selectedVariant)}
      />
    </div>
  );
}
