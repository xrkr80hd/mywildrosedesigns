import Link from "next/link";
import Image from "next/image";
import { HotItemPopup } from "@/components/hot-item-popup";
import { ProductListingCard } from "@/components/product-listing-card";
import { getStorefrontData } from "@/lib/storefront";

const steps = [
  {
    title: "Upload Your Design",
    detail:
      "Share your artwork and production notes. We support PNG, JPG, PDF, SVG, and AI files.",
  },
  {
    title: "Pay Securely",
    detail:
      "Checkout is powered by Stripe so your customer payment flow is fast and trusted.",
  },
  {
    title: "We Print and Deliver",
    detail:
      "Wild Rose Designs reviews every order and keeps you updated through production.",
  },
];

const siteGuide = [
  {
    title: "Shop",
    href: "/shop",
    description: "Browse all active categories and products, including featured and seasonal drops.",
    cta: "Open Shop",
  },
  {
    title: "Upload",
    href: "/upload",
    description: "Send your artwork and order details for custom apparel, prints, and merch runs.",
    cta: "Open Upload",
  },
  {
    title: "About",
    href: "/about",
    description: "Learn about Wild Rose Designs, the process, and what kinds of projects we take on.",
    cta: "Open About",
  },
  {
    title: "Contact",
    href: "/contact",
    description: "Reach out for quotes, team orders, timeline questions, and special requests.",
    cta: "Open Contact",
  },
  {
    title: "Cart",
    href: "/cart",
    description: "Review your selected items, quantities, and checkout before placing your order.",
    cta: "Open Cart",
  },
];

export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await getStorefrontData();
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

      <section className="mx-auto w-full max-w-5xl px-6 py-10 lg:py-12">
        <div className="rounded-3xl border border-rose/20 bg-white/80 p-6 text-center shadow-sm sm:p-8">
          <p className="hero-kicker">{data.settings.heroBadge}</p>
          <h1 className="mx-auto mt-4 max-w-3xl text-4xl leading-tight text-forest sm:text-5xl">
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

      <section className="mx-auto w-full max-w-6xl px-6 pb-12">
        <h2 className="mb-2 text-3xl text-forest">Site Guide</h2>
        <p className="mb-4 text-sm text-foreground/75">
          Quick jump into each main page.
        </p>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {siteGuide.map((item) => (
            <article
              key={item.href}
              className="rounded-2xl border border-rose/20 bg-white/90 p-5 shadow-sm"
            >
              <h3 className="text-2xl text-forest">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/80">{item.description}</p>
              <Link
                href={item.href}
                className="mt-4 inline-flex rounded-xl border border-forest/20 bg-white px-4 py-2 text-xs font-semibold text-forest hover:bg-forest hover:text-white"
              >
                {item.cta}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-16">
        <h2 className="mb-4 text-3xl text-forest">Featured Products</h2>
        <div className="grid auto-rows-fr gap-4 md:grid-cols-3">
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

      <section className="mx-auto w-full max-w-6xl px-6 pb-16">
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

      <section className="mx-auto w-full max-w-6xl px-6 pb-16">
        <div className="rose-panel rounded-3xl border border-rose/20 p-7 md:p-10">
          <h2 className="text-3xl text-forest">How it works</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <article
                key={step.title}
                className="rounded-2xl bg-white/85 p-5 shadow-sm ring-1 ring-black/5"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">
                  Step {index + 1}
                </p>
                <h3 className="mt-2 text-xl text-forest">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground/80">
                  {step.detail}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
