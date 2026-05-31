import { MobileSiteNav } from "@/components/mobile-site-nav";
import { SiteFooter } from "@/components/site-footer";
import { getSiteContentSettings } from "@/lib/site-content";
import Image from "next/image";
import Link from "next/link";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/cart", label: "Cart" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export async function SiteShell({ children }: { children: React.ReactNode }) {
  const content = await getSiteContentSettings();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-[80] border-b border-rose/20 bg-white/90 backdrop-blur md:static md:z-auto">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4">
          <Link
            href="/"
            className="group inline-flex min-w-0 flex-1 items-center gap-2 sm:gap-3"
          >
            <Image
              src="/assets/img/MyWRDLogo.png"
              alt="Wild Rose Designs"
              width={40}
              height={40}
              className="h-9 w-9 rounded-full border border-rose/25 bg-surface object-cover sm:h-10 sm:w-10"
            />
            <div className="min-w-0">
              <p className="truncate text-[0.95rem] font-semibold text-forest group-hover:text-rose sm:text-base">
                Wild Rose Designs
              </p>
              <p className="hidden text-xs uppercase tracking-[0.14em] text-foreground/60 sm:block">
                Custom | Seasonal | School & Sports
              </p>
            </div>
          </Link>

          <nav
            className="hidden flex-wrap items-center gap-4 md:flex"
            aria-label="Primary navigation"
          >
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="nav-underline">
                {link.label}
              </Link>
            ))}
          </nav>

          <MobileSiteNav links={navLinks} />
        </div>
      </header>

      {children}

      <SiteFooter content={content} />
    </div>
  );
}
