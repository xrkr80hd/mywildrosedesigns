import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { ShareProductButton } from "@/components/share-product-button";
import type { StorefrontProduct } from "@/lib/storefront";

type ProductListingCardProps = {
  product: StorefrontProduct;
  showCategory?: boolean;
  imageHeightClassName?: string;
  titleClassName?: string;
};

export function ProductListingCard({
  product,
  showCategory = false,
  imageHeightClassName = "h-48",
  titleClassName = "text-lg",
}: ProductListingCardProps) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-rose/20 bg-white/90 p-4 shadow-sm">
      <Link href={`/shop/${product.slug}`} aria-label={`View ${product.title}`}>
        <Image
          src={product.imageUrl}
          alt={product.title}
          width={400}
          height={400}
          className={`${imageHeightClassName} w-full rounded-xl border border-rose/15 bg-surface object-contain p-4`}
        />
      </Link>

      {showCategory ? (
        <p className="mt-3 text-sm font-semibold uppercase tracking-[0.12em] text-gold">
          {product.categoryName}
        </p>
      ) : null}

      <h3 className={`product-card-title mt-3 break-words leading-snug text-forest ${titleClassName}`}>
        {product.title}
      </h3>

      <div className="mt-2">
        {product.saleEnabled ? (
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-rose">
            {product.saleLabel} {product.salePercentOff}% off
          </p>
        ) : null}
        <p className="text-lg font-bold text-rose">
          {product.hasVariants ? "From " : ""}
          ${(product.effectivePriceCents / 100).toFixed(2)}
          {product.saleEnabled ? (
            <span className="ml-2 text-xs font-medium text-foreground/55 line-through">
              ${(product.basePriceCents / 100).toFixed(2)}
            </span>
          ) : null}
        </p>
      </div>

      <div className="mt-auto pt-3">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/shop/${product.slug}`}
            className="rounded-xl border border-forest/20 bg-white px-4 py-2 text-xs font-semibold text-forest hover:bg-forest hover:text-white"
          >
            View Item
          </Link>
          {product.hasVariants ? (
            <Link
              href={`/shop/${product.slug}`}
              className="rounded-xl bg-rose px-4 py-2 text-xs font-semibold text-white hover:bg-rose/90"
            >
              {product.cartCtaText || "Add to Cart"}
            </Link>
          ) : (
            <AddToCartButton
              id={product.id}
              title={product.title}
              price={product.effectivePriceCents / 100}
              productSlug={product.slug}
              label={product.cartCtaText}
              className="rounded-xl bg-rose px-4 py-2 text-xs font-semibold text-white hover:bg-rose/90"
              showViewCartAfterAdd={false}
            />
          )}
          <ShareProductButton
            path={`/shop/${product.slug}`}
            title={product.title}
            showStatusText={false}
          />
        </div>
      </div>
    </article>
  );
}
