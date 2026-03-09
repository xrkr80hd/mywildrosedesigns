import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { ShareProductButton } from "@/components/share-product-button";
import { getStorefrontData } from "@/lib/storefront";

type ShopPageProps = {
  searchParams?: Promise<{
    category?: string | string[];
  }>;
};

export const metadata: Metadata = {
  title: "Shop Custom Apparel & Accessories",
  description:
    "Browse Wild Rose Designs categories, compare pricing, and choose product options before secure checkout.",
};

export const dynamic = "force-dynamic";

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const data = await getStorefrontData();
  const resolvedSearchParams = await searchParams;
  const categoryParam = resolvedSearchParams?.category;
  const rawCategory = Array.isArray(categoryParam) ? categoryParam[0] : categoryParam;
  const normalizedCategory = rawCategory?.trim().toLowerCase() ?? "";

  const products = normalizedCategory
    ? data.products.filter((product) => {
        const normalizedName = product.categoryName.trim().toLowerCase();
        const normalizedSlug = product.categorySlug.trim().toLowerCase();
        return normalizedName === normalizedCategory || normalizedSlug === normalizedCategory;
      })
    : data.products;
  const grouped = data.categoryNames
    .map((categoryName) => ({
      categoryName,
      items: products.filter((product) => product.categoryName === categoryName),
    }))
    .filter((group) => group.items.length > 0);

  if (!normalizedCategory && grouped.length === 0 && products.length > 0) {
    grouped.push({
      categoryName: "Products",
      items: products,
    });
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <header className="rounded-3xl border border-rose/20 bg-white/85 p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
          Wild Rose Shop
        </p>
        <h1 className="mt-2 text-4xl text-forest">Shop by Category</h1>
        <p className="mt-2 text-sm text-foreground/75">
          Choose a category to see only matching products.
        </p>
      </header>

      <section className="mt-5 flex flex-wrap gap-2">
        <Link
          href="/shop"
          className={`filter-tab ${!normalizedCategory ? "filter-tab-active" : ""}`}
        >
          All Products
        </Link>
        {data.categoryNames.map((item) => {
          const normalizedItem = item.trim().toLowerCase();

          return (
            <Link
              key={item}
              href={`/shop?category=${encodeURIComponent(item)}`}
              className={`filter-tab ${
                normalizedCategory === normalizedItem ? "filter-tab-active" : ""
              }`}
            >
              {item}
            </Link>
          );
        })}
      </section>

      <section className="mt-6 space-y-8">
        {grouped.map((group) => (
          <div key={group.categoryName} className="space-y-3">
            <h2 className="text-2xl text-forest">{group.categoryName}</h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {group.items.map((product) => (
                <article
                  key={product.id}
                  className="rounded-2xl border border-rose/20 bg-white/90 p-4 shadow-sm"
                >
                  <Image
                    src={product.imageUrl}
                    alt={product.title}
                    width={400}
                    height={400}
                    className="h-48 w-full rounded-xl border border-rose/15 bg-surface object-contain p-4"
                  />
                  <h3 className="mt-3 text-lg text-forest">{product.title}</h3>
                  <div className="mt-2">
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
                  <div className="mt-3 flex flex-wrap items-center gap-2">
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
                      />
                    )}
                    <ShareProductButton path={`/shop/${product.slug}`} title={product.title} />
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </section>
      {products.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-rose/20 bg-white/90 px-4 py-6 text-sm text-foreground/75">
          No products are available in this category yet.
        </p>
      ) : null}
    </main>
  );
}
