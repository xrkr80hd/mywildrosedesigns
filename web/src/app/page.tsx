import Link from "next/link";
import Image from "next/image";
import { FeaturedProductsCarousel } from "@/components/featured-products-carousel";
import { HomepageOrderSection } from "@/components/homepage-order-section";
import { HotItemPopup } from "@/components/hot-item-popup";
import { ProductListingCard } from "@/components/product-listing-card";
import { getUploadProductOptions } from "@/lib/product-options-store";
import { getStorefrontData } from "@/lib/storefront";

const customOrderSteps = [
  "Submit your file and order details.",
  "We verify print quality and production notes.",
  "Stripe checkout secures payment.",
  "Production starts and status updates are tracked in admin.",
];

const siteGuide = [
  {
    title: "Shop",
    href: "/shop",
    tagline: "Collections and current drops.",
  },
  {
    title: "About",
    href: "/about",
    tagline: "Our story and process.",
  },
  {
    title: "Contact",
    href: "/contact",
    tagline: "Quotes, timelines, special requests.",
  },
  {
    title: "Cart",
    href: "/cart",
    tagline: "Review items and checkout.",
  },
];

export const dynamic = "force-dynamic";

export default async function Home() {
  const [data, uploadOptions] = await Promise.all([
    getStorefrontData(),
    getUploadProductOptions(),
  ]);
  const featured = data.featuredProducts.length
    ? data.featuredProducts.slice(0, 3)
    : data.products.slice(0, 3);

  return (
    <main className="hero-mesh">
      {data.popup.enabled ? (
        <HotItemPopup
          key={`${data.popup.title}:${data.popup.message}:${data.popup.product?.id ?? "none"}:${data.popup.ctaHref}`}
          promoLabel={data.popup.promoLabel}
          title={data.popup.title}
          message={data.popup.message}
          showCta={data.popup.showCta}
          ctaText={data.popup.ctaText}
          ctaHref={data.popup.ctaHref}
          product={
            data.popup.product
              ? {
                  id: data.popup.product.id,
                  title: data.popup.product.title,
                  slug: data.popup.product.slug,
                  effectivePriceCents: data.popup.product.effectivePriceCents,
                  imageUrl: data.popup.product.imageUrl,
                  hasVariants: data.popup.product.hasVariants,
                }
              : null
          }
        />
      ) : null}

      <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
        <div className="rounded-3xl border border-rose/20 bg-white/80 p-6 text-center shadow-sm sm:p-8">
          <p className="hero-kicker">{data.settings.heroBadge}</p>
          <h1 className="mx-auto mt-4 max-w-3xl text-3xl leading-tight text-forest sm:text-4xl lg:text-5xl">
            {data.settings.heroTitle}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-foreground/80 sm:text-lg">
            {data.settings.heroDescription}
          </p>
          <div className="mt-6 flex items-center justify-center overflow-hidden rounded-3xl border border-rose/25 bg-white/75 p-3">
            <Image
              src="/assets/img/MyWRDLogo.png"
              alt="Wild Rose Designs logo"
              width={560}
              height={560}
              priority
              className="h-[clamp(240px,34vh,360px)] w-auto max-w-full object-contain"
            />
          </div>
          <p className="mx-auto mt-5 max-w-3xl text-sm leading-relaxed text-foreground/80 sm:text-base">
            Explore ready-to-shop products, upload your own design for custom printing, check out
            seasonal drops, and contact us for team, school, or business orders.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-4xl px-4 pb-12 sm:px-6">
        <nav
          aria-label="Site guide"
          className="overflow-hidden rounded-2xl border border-rose/20 bg-white/90 shadow-sm"
        >
          <div className="grid gap-0 md:grid-cols-[0.82fr_1.18fr]">
            <div className="border-b border-rose/15 bg-surface/80 px-5 py-5 md:border-b-0 md:border-r md:px-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
                Explore
              </p>
              <h2 className="mt-2 text-2xl text-forest sm:text-3xl">Start Here</h2>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-foreground/70">
                Jump straight to shopping, custom orders, questions, or checkout.
              </p>
            </div>

            <ul className="grid divide-y divide-rose/15 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
              {siteGuide.map((item, index) => (
                <li
                  key={item.href}
                  className={index > 1 ? "sm:border-t sm:border-rose/15" : undefined}
                >
                  <Link
                    href={item.href}
                    className="group flex h-full min-h-20 items-center gap-3 px-4 py-4 transition hover:bg-rose/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-forest sm:px-5"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-base font-semibold text-forest">
                        {item.title}
                      </span>
                      <span className="mt-0.5 block text-xs leading-snug text-foreground/65">
                        {item.tagline}
                      </span>
                    </span>

                    <span
                      aria-hidden="true"
                      className="text-base leading-none text-forest/40 transition group-hover:translate-x-0.5 group-hover:text-forest"
                    >
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
        <h2 className="mb-4 text-3xl text-forest">Featured Products</h2>
        <FeaturedProductsCarousel products={featured} />
        <div className="hidden auto-rows-fr gap-4 md:grid md:grid-cols-3">
          {featured.map((product) => (
            <ProductListingCard
              key={product.id}
              product={product}
              showCategory
              imageHeightClassName="h-44"
              titleClassName="text-xl"
            />
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
        <h2 className="mb-4 text-3xl text-forest">Homepage Highlights</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {data.welcomePosts.slice(0, 3).map((post) => (
            <article
              key={post.id}
              className="rounded-2xl border border-rose/20 bg-white/90 p-5 shadow-sm"
            >
              <h3 className="text-2xl text-forest">{post.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/80">{post.body}</p>
              {post.ctaLabel && post.ctaHref ? (
                <Link
                  href={post.ctaHref}
                  className="mt-4 inline-flex rounded-xl border border-forest/20 bg-white px-4 py-2 text-xs font-semibold text-forest hover:bg-forest hover:text-white"
                >
                  {post.ctaLabel}
                </Link>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <HomepageOrderSection options={uploadOptions} steps={customOrderSteps} />
    </main>
  );
}
