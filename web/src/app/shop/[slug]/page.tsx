import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { getStorefrontData } from "@/lib/storefront";

type ProductDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const resolvedParams = await params;
  const data = await getStorefrontData();
  const product = data.products.find((item) => item.slug === resolvedParams.slug);

  if (!product) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
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

          <div className="mt-4 flex flex-wrap items-center gap-3">
            {product.saleEnabled ? (
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-rose">
                {product.saleLabel} {product.salePercentOff}% off
              </p>
            ) : null}
            <p className="text-2xl font-bold text-rose">
              ${(product.effectivePriceCents / 100).toFixed(2)}
              {product.saleEnabled ? (
                <span className="ml-2 text-sm font-medium text-foreground/55 line-through">
                  ${(product.basePriceCents / 100).toFixed(2)}
                </span>
              ) : null}
            </p>
          </div>

          <div className="mt-5">
            <AddToCartButton
              id={product.id}
              title={product.title}
              price={product.effectivePriceCents / 100}
              label={product.cartCtaText}
              className="rounded-xl bg-rose px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose/90"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
