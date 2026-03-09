"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type MobileSiteNavProps = {
  links: Array<{
    href: string;
    label: string;
  }>;
};

export function MobileSiteNav({ links }: MobileSiteNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const shellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function closeMenu() {
      setOpen(false);
    }

    function onPointerDown(event: PointerEvent) {
      if (!shellRef.current) {
        return;
      }

      if (!shellRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeMenu();
      }
    }

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", closeMenu, { passive: true });

    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", closeMenu);
    };
  }, [open]);

  return (
    <div ref={shellRef} className="relative ml-auto md:hidden">
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-expanded={open}
        aria-controls="mobile-site-nav"
        className="flex shrink-0 items-center gap-2 rounded-xl border border-rose/25 bg-white px-3 py-2 text-sm font-semibold text-forest shadow-sm"
      >
        Menu
        <span aria-hidden>{open ? "✕" : "☰"}</span>
      </button>

      {open ? (
        <nav
          id="mobile-site-nav"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-[90] w-[min(14rem,calc(100vw-2rem))] rounded-2xl border border-rose/20 bg-white p-2 shadow-xl"
          aria-label="Mobile navigation"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg border-l-2 border-transparent px-3 py-2 text-sm font-semibold text-forest hover:border-rose hover:bg-surface-strong"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </div>
  );
}
