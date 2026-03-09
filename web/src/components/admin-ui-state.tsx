"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const STORAGE_KEY = "wr_admin_ui_state_v1";

type AdminUiState = {
  pathname: string;
  scrollY: number;
  openKeys: string[];
};

function collectOpenKeys(): string[] {
  const nodes = Array.from(
    document.querySelectorAll("details[data-admin-key]"),
  ) as HTMLDetailsElement[];
  return nodes
    .filter((node) => node.open)
    .map((node) => node.dataset.adminKey ?? "")
    .filter(Boolean);
}

function captureState(pathname: string) {
  const snapshot: AdminUiState = {
    pathname,
    scrollY: window.scrollY,
    openKeys: collectOpenKeys(),
  };
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}

function restoreOpenKeys(pathname: string) {
  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return;
  }

  try {
    const parsed = JSON.parse(raw) as AdminUiState;
    if (!parsed || parsed.pathname !== pathname) {
      return;
    }

    const allowed = new Set(parsed.openKeys ?? []);
    const nodes = Array.from(
      document.querySelectorAll("details[data-admin-key]"),
    ) as HTMLDetailsElement[];
    for (const node of nodes) {
      const key = node.dataset.adminKey ?? "";
      if (allowed.has(key)) {
        node.open = true;
      }
    }

    if (!window.location.hash && Number.isFinite(parsed.scrollY)) {
      window.scrollTo({ top: parsed.scrollY, behavior: "auto" });
    }
  } catch {
    // Ignore malformed stored state.
  }
}

function openHashAncestors() {
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash) {
    return;
  }

  const target = document.getElementById(decodeURIComponent(hash));
  if (!target) {
    return;
  }

  let cursor: HTMLElement | null = target;
  while (cursor) {
    const detailsEl = cursor.closest("details") as HTMLDetailsElement | null;
    if (!detailsEl) {
      break;
    }
    detailsEl.open = true;
    cursor = detailsEl.parentElement;
  }

  target.scrollIntoView({ block: "center", behavior: "auto" });
}

export function AdminUiState() {
  const pathname = usePathname();

  useEffect(() => {
    const restore = () => {
      restoreOpenKeys(pathname);
      openHashAncestors();
    };

    // Wait for server-rendered details tree to mount.
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(restore);
    });

    const onSubmit = () => {
      captureState(pathname);
    };

    const onBeforeUnload = () => {
      captureState(pathname);
    };

    const onHashChange = () => {
      openHashAncestors();
    };

    document.addEventListener("submit", onSubmit, true);
    window.addEventListener("beforeunload", onBeforeUnload);
    window.addEventListener("hashchange", onHashChange);
    return () => {
      document.removeEventListener("submit", onSubmit, true);
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.removeEventListener("hashchange", onHashChange);
    };
  }, [pathname]);

  return null;
}
