import type { Metadata } from "next";
import Link from "next/link";
import { getSiteContentSettings } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about Wild Rose Designs services and turnaround process.",
};

export default async function AboutPage() {
  const content = await getSiteContentSettings();
  const services = [
    {
      title: content.about.serviceOneTitle,
      detail: content.about.serviceOneDetail,
    },
    {
      title: content.about.serviceTwoTitle,
      detail: content.about.serviceTwoDetail,
    },
    {
      title: content.about.serviceThreeTitle,
      detail: content.about.serviceThreeDetail,
    },
    {
      title: content.about.serviceFourTitle,
      detail: content.about.serviceFourDetail,
    },
  ];

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <header className="rounded-3xl border border-rose/20 bg-white/85 p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
          {content.about.badge}
        </p>
        <h1 className="mt-2 text-4xl text-forest">{content.about.title}</h1>
        <p className="mt-2 max-w-3xl text-sm text-foreground/75">
          {content.about.intro}
        </p>
      </header>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        {services.map((service) => (
          <article
            key={service.title}
            className="rounded-2xl border border-rose/20 bg-white/90 p-5 shadow-sm"
          >
            <h2 className="text-2xl text-forest">{service.title}</h2>
            <p className="mt-2 text-sm text-foreground/75">{service.detail}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 rounded-3xl border border-rose/20 bg-surface p-6">
        <h2 className="text-2xl text-forest">{content.about.ctaTitle}</h2>
        <p className="mt-2 text-sm text-foreground/75">
          {content.about.ctaDescription}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href={content.about.primaryCtaHref}
            className="rounded-xl bg-rose px-5 py-2.5 text-sm font-semibold text-white"
          >
            {content.about.primaryCtaLabel}
          </Link>
          <Link
            href={content.about.secondaryCtaHref}
            className="rounded-xl border border-forest/25 bg-white px-5 py-2.5 text-sm font-semibold text-forest"
          >
            {content.about.secondaryCtaLabel}
          </Link>
        </div>
      </section>
    </main>
  );
}

