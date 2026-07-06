"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const TRACKED_PATHS = new Set(["/", "/shop", "/upload", "/contact"]);

export function VisitAlertPing() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || !TRACKED_PATHS.has(pathname)) {
      return;
    }

    void fetch("/api/alerts/visit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ path: pathname }),
      keepalive: true,
    }).catch(() => {
      // Do not block UI if alerts endpoint is unavailable.
    });
  }, [pathname]);

  return null;
}
