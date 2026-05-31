"use client";

import { useEffect, useRef, useState } from "react";
import { ProductListingCard } from "@/components/product-listing-card";

type FeaturedProduct = {
  id: string;
  sku: string;
  title: string;
  description: string;
  slug: string;
  categoryName: string;
  categorySlug: string;
  imageUrl: string;
  basePriceCents: number;
  effectivePriceCents: number;
  stockOnHand: number;
  isFeatured: boolean;
  isHot: boolean;
  saleEnabled: boolean;
  salePercentOff: number;
  saleLabel: string;
  cartCtaText: string;
  productType: "apparel" | "accessory";
  sizeProfiles: string[];
  sizeValues: string[];
  hasVariants: boolean;
  variants: Array<{
    id: string;
    sizeValue: string | null;
    colorValue: string | null;
    brandName: string | null;
    label: string;
    sku: string | null;
    basePriceCents: number;
    effectivePriceCents: number;
    stockOnHand: number;
  }>;
};

type FeaturedProductsCarouselProps = {
  products: FeaturedProduct[];
};

const AUTO_ROTATE_MS = 12000;

export function FeaturedProductsCarousel({
  products,
}: FeaturedProductsCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || products.length < 2) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => {
        const next = (current + 1) % products.length;
        track.scrollTo({
          left: track.clientWidth * next,
          behavior: "smooth",
        });
        return next;
      });
    }, AUTO_ROTATE_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [products.length]);

  function jumpTo(index: number) {
    const track = trackRef.current;
    if (!track) {
      return;
    }

    track.scrollTo({
      left: track.clientWidth * index,
      behavior: "smooth",
    });
    setActiveIndex(index);
  }

  function handleScroll() {
    const track = trackRef.current;
    if (!track) {
      return;
    }

    const width = track.clientWidth || 1;
    const nextIndex = Math.round(track.scrollLeft / width);
    if (nextIndex !== activeIndex) {
      setActiveIndex(nextIndex);
    }
  }

  return (
    <div className="md:hidden">
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product) => (
          <div key={product.id} className="min-w-full snap-center">
            <ProductListingCard
              product={product}
              showCategory
              imageHeightClassName="h-44"
              titleClassName="text-xl"
            />
          </div>
        ))}
      </div>

      {products.length > 1 ? (
        <div className="mt-3 flex items-center justify-center gap-2">
          {products.map((product, index) => (
            <button
              key={product.id}
              type="button"
              aria-label={`Show featured product ${index + 1}`}
              aria-pressed={activeIndex === index}
              onClick={() => jumpTo(index)}
              className={`h-2.5 rounded-full transition ${
                activeIndex === index
                  ? "w-8 bg-rose"
                  : "w-2.5 bg-forest/25"
              }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}