"use client";

import type { SiteContentSettings } from "@/lib/site-content";
import Link from "next/link";
import { usePathname } from "next/navigation";

type SiteFooterProps = {
  content: SiteContentSettings;
};

export function SiteFooter({ content }: SiteFooterProps) {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="border-t border-rose/20 bg-white/85">
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 sm:px-6 sm:py-10 md:grid-cols-4">
        <div>
          <h3 className="text-lg text-forest">Wild Rose Designs</h3>
          <p className="mt-2 text-sm text-foreground/75">
            Handmade custom apparel, seasonal collections, and personalized
            products.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-gold">
            Shop
          </h4>
          <div className="mt-3 space-y-2 text-sm">
            <Link className="block hover:text-rose" href="/shop?category=Apparel">
              Apparel
            </Link>
            <Link className="block hover:text-rose" href="/shop?category=School">
              School & Teams
            </Link>
            <Link className="block hover:text-rose" href="/shop?category=Seasonal">
              Seasonal
            </Link>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-gold">
            Custom
          </h4>
          <div className="mt-3 space-y-2 text-sm">
            <Link className="block hover:text-rose" href="/contact">
              Request Quote
            </Link>
            <Link className="block hover:text-rose" href="/about">
              About Us
            </Link>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-gold">
            Support
          </h4>
          <p className="mt-3 text-sm text-foreground/75">
            Questions? Reach out and we will get back quickly.
          </p>
          <p className="mt-1 text-sm font-semibold text-forest">
            <a href={`mailto:${content.contact.email}`} className="hover:text-rose">
              {content.contact.email}
            </a>
          </p>
          {content.contact.phone ? (
            <p className="mt-1 text-sm text-foreground/75">
              {content.contact.phone}
            </p>
          ) : null}
          <p className="mt-2 whitespace-pre-line text-sm text-foreground/75">
            {content.contact.address}
          </p>
        </div>
      </div>
    </footer>
  );
}
