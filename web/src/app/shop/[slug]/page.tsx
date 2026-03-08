import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductDetailPurchase } from "@/components/product-detail-purchase";
import { ProductViewTracker } from "@/components/product-view-tracker";
import { getSiteUrl } from "@/lib/env";
import { getStorefrontData } from "@/lib/storefront";

type ProductDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function toAbsoluteUrl(siteUrl: string, value: string): string {
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  if (value.startsWith("/")) {
    return `${siteUrl}${value}`;
  }

  return `${siteUrl}/${value}`;
}

function summarizeDescription(text: string): string {
  const compact = text.trim().replace(/\s+/g, " ");
  if (!compact) {
    return "Shop Wild Rose Designs custom apparel and accessories.";
  }
  if (compact.length <= 160) {
    return compact;
  }
  return `${compact.slice(0, 157).trimEnd()}...`;
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const data = await getStorefrontData();
  const product = data.products.find((item) => item.slug === resolvedParams.slug);

  if (!product) {
    return {
      title: "Product Not Found",
      description: "This product is no longer available.",
    };
  }

  const title = `${product.title} | ${product.categoryName}`;
  const description = summarizeDescription(product.description);
  const canonicalPath = `/shop/${product.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: canonicalPath,
      images: [
        {
          url: product.imageUrl,
          alt: product.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [product.imageUrl],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const resolvedParams = await params;
  const data = await getStorefrontData();
  const product = data.products.find((item) => item.slug === resolvedParams.slug);

  if (!product) {
    notFound();
  }

  const siteUrl = getSiteUrl();
  const productUrl = `${siteUrl}/shop/${product.slug}`;
  const productImage = toAbsoluteUrl(siteUrl, product.imageUrl);
  const fallbackSku = product.sku || product.variants[0]?.sku || undefined;
  const variantOffers = product.variants.map((variant) => ({
    "@type": "Offer",
    priceCurrency: "USD",
    price: (variant.effectivePriceCents / 100).toFixed(2),
    availability:
      variant.stockOnHand > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    sku: variant.sku || fallbackSku,
    url: productUrl,
    itemCondition: "https://schema.org/NewCondition",
  }));

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: [productImage],
    sku: fallbackSku,
    category: product.categoryName,
    brand: {
      "@type": "Brand",
      name: "Wild Rose Designs",
    },
    url: productUrl,
    offers: product.hasVariants
      ? variantOffers
      : {
          "@type": "Offer",
          priceCurrency: "USD",
          price: (product.effectivePriceCents / 100).toFixed(2),
          availability:
            product.stockOnHand > 0
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          sku: fallbackSku,
          url: productUrl,
          itemCondition: "https://schema.org/NewCondition",
        },
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <ProductViewTracker productId={product.id} productSlug={product.slug} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />

      <Link
        href="/shop"
        className="inline-flex rounded-xl border border-rose/30 bg-white px-4 py-2 text-xs font-semibold text-forest hover:bg-surface"
      >
        Back to Shop
      </Link>

      <section className="mt-4 grid gap-6 rounded-3xl border border-rose/20 bg-white/90 p-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="rounded-2xl border border-rose/15 bg-surface p-4">
          <Image
            src={product.imageUrl}
            alt={product.title}
            width={700}
            height={700}
            className="h-auto w-full object-contain"
          />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold">
            {product.categoryName}
          </p>
          <h1 className="mt-2 text-4xl text-forest">{product.title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-foreground/80">{product.description}</p>

          <ProductDetailPurchase
            product={{
              id: product.id,
              slug: product.slug,
              title: product.title,
              cartCtaText: product.cartCtaText,
              basePriceCents: product.basePriceCents,
              effectivePriceCents: product.effectivePriceCents,
              saleEnabled: product.saleEnabled,
              salePercentOff: product.salePercentOff,
              saleLabel: product.saleLabel,
              stockOnHand: product.stockOnHand,
              variants: product.variants,
            }}
          />
        </div>
      </section>
    </main>
  );
}
