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
  const pathname = usePathname();
  const shellRef = useRef<HTMLDivElement>(null);
  const [openPathname, setOpenPathname] = useState<string | null>(null);
  const open = openPathname === pathname;

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function closeMenu() {
      setOpenPathname(null);
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

    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={shellRef} className="ml-auto md:hidden">
      <button
        type="button"
        onClick={() => setOpenPathname(open ? null : pathname)}
        aria-expanded={open}
        aria-controls="mobile-site-nav"
        className="flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-rose/25 bg-white px-3 py-2 text-sm font-semibold text-forest shadow-sm"
      >
        Menu
        <span aria-hidden>{open ? "✕" : "☰"}</span>
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-label="Close mobile navigation"
            className="fixed inset-0 z-[88] bg-foreground/15 backdrop-blur-[1px]"
            onClick={() => setOpenPathname(null)}
          />
          <nav
            id="mobile-site-nav"
            className="fixed inset-x-4 top-[4.75rem] z-[90] max-h-[calc(100dvh-5.75rem)] overflow-y-auto rounded-2xl border border-rose/20 bg-white p-3 shadow-xl"
            aria-label="Mobile navigation"
          >
            <div className="space-y-1">
              {links.map((link) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname === link.href || pathname.startsWith(`${link.href}/`);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpenPathname(null)}
                    className={`block rounded-lg border px-3 py-3 text-sm font-semibold transition ${
                      isActive
                        ? "border-rose/45 bg-surface-strong text-rose"
                        : "border-transparent text-forest hover:border-rose/25 hover:bg-surface-strong"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </>
      ) : null}
    </div>
  );
}
