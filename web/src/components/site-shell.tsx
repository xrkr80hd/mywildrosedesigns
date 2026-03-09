import Image from "next/image";
import Link from "next/link";
import { MobileSiteNav } from "@/components/mobile-site-nav";
import { getSiteContentSettings } from "@/lib/site-content";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/cart", label: "Cart" },
  { href: "/upload", label: "Upload" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export async function SiteShell({ children }: { children: React.ReactNode }) {
  const content = await getSiteContentSettings();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-[80] border-b border-rose/20 bg-white/90 backdrop-blur md:static md:z-auto">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:gap-4 sm:px-6">
          <Link href="/" className="group inline-flex min-w-0 flex-1 items-center gap-3">
            <Image
              src="/assets/img/MyWRDLogo.png"
              alt="Wild Rose Designs"
              width={40}
              height={40}
              className="h-10 w-10 rounded-full border border-rose/25 bg-surface object-cover"
            />
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-forest group-hover:text-rose">
                Wild Rose Designs
              </p>
              <p className="hidden text-xs uppercase tracking-[0.14em] text-foreground/60 sm:block">
                Custom | Seasonal | School & Sports
              </p>
            </div>
          </Link>

          <nav className="hidden flex-wrap items-center gap-4 md:flex" aria-label="Primary navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="nav-underline"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <MobileSiteNav links={navLinks} />
        </div>
      </header>

      {children}

      <footer className="border-t border-rose/20 bg-white/85">
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-10 md:grid-cols-4">
          <div>
            <h3 className="text-lg text-forest">Wild Rose Designs</h3>
            <p className="mt-2 text-sm text-foreground/75">
              Handmade custom apparel, seasonal collections, and personalized products.
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
              <Link className="block hover:text-rose" href="/upload">
                Upload Design
              </Link>
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
          </div>
        </div>
      </footer>
    </div>
  );
}
