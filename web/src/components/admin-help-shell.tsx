"use client";

import { AdminHelpContent } from "@/components/admin-help-content";
import {
    ADMIN_HELP_STORAGE_KEY,
    getAdminHelpSectionById,
} from "@/lib/admin-help-content";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type HelpPanelState = {
  isOpen: boolean;
  isMinimized: boolean;
  x: number | null;
  y: number | null;
};

const DEFAULT_PANEL_STATE: HelpPanelState = {
  isOpen: false,
  isMinimized: false,
  x: null,
  y: null,
};

function clampPosition(x: number, y: number, width: number, height: number) {
  const margin = 16;
  return {
    x: Math.max(margin, Math.min(x, window.innerWidth - width - margin)),
    y: Math.max(margin, Math.min(y, window.innerHeight - height - margin)),
  };
}

export function AdminHelpShell() {
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const draggingRef = useRef(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [panelState, setPanelState] =
    useState<HelpPanelState>(DEFAULT_PANEL_STATE);
  const [ready, setReady] = useState(false);

  const hideShell =
    pathname === "/admin/login" ||
    pathname === "/admin/help" ||
    pathname === "/admin/how-to";

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const applyMatch = () => setIsDesktop(media.matches);
    applyMatch();
    media.addEventListener("change", applyMatch);
    return () => {
      media.removeEventListener("change", applyMatch);
    };
  }, []);

  useEffect(() => {
    const raw = window.localStorage.getItem(ADMIN_HELP_STORAGE_KEY);
    if (!raw) {
      setReady(true);
      return;
    }

    try {
      const parsed = JSON.parse(raw) as HelpPanelState;
      setPanelState({
        isOpen: Boolean(parsed?.isOpen),
        isMinimized: Boolean(parsed?.isMinimized),
        x: typeof parsed?.x === "number" ? parsed.x : null,
        y: typeof parsed?.y === "number" ? parsed.y : null,
      });
    } catch {
      setPanelState(DEFAULT_PANEL_STATE);
    }

    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) {
      return;
    }

    window.localStorage.setItem(
      ADMIN_HELP_STORAGE_KEY,
      JSON.stringify(panelState),
    );
  }, [panelState, ready]);

  useEffect(() => {
    if (!isDesktop || !panelState.isOpen || !panelRef.current) {
      return;
    }

    const rect = panelRef.current.getBoundingClientRect();
    const next = clampPosition(
      panelState.x ?? window.innerWidth - rect.width - 24,
      panelState.y ?? window.innerHeight - rect.height - 24,
      rect.width,
      rect.height,
    );

    if (next.x !== panelState.x || next.y !== panelState.y) {
      setPanelState((current) => ({ ...current, ...next }));
    }
  }, [
    isDesktop,
    panelState.isOpen,
    panelState.isMinimized,
    panelState.x,
    panelState.y,
  ]);

  useEffect(() => {
    if (!panelRef.current) {
      return;
    }

    if (typeof panelState.x === "number") {
      panelRef.current.style.left = `${panelState.x}px`;
    } else {
      panelRef.current.style.removeProperty("left");
    }

    if (typeof panelState.y === "number") {
      panelRef.current.style.top = `${panelState.y}px`;
    } else {
      panelRef.current.style.removeProperty("top");
    }
  }, [panelState.x, panelState.y, panelState.isOpen]);

  useEffect(() => {
    function onPointerMove(event: PointerEvent) {
      if (!draggingRef.current || !panelRef.current) {
        return;
      }

      const rect = panelRef.current.getBoundingClientRect();
      const next = clampPosition(
        event.clientX - dragOffsetRef.current.x,
        event.clientY - dragOffsetRef.current.y,
        rect.width,
        rect.height,
      );
      setPanelState((current) => ({ ...current, ...next }));
    }

    function stopDragging() {
      draggingRef.current = false;
    }

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", stopDragging);
    window.addEventListener("pointercancel", stopDragging);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", stopDragging);
      window.removeEventListener("pointercancel", stopDragging);
    };
  }, []);

  useEffect(() => {
    function handleResize() {
      if (!panelRef.current || !panelState.isOpen) {
        return;
      }

      const rect = panelRef.current.getBoundingClientRect();
      const next = clampPosition(
        panelState.x ?? window.innerWidth - rect.width - 24,
        panelState.y ?? window.innerHeight - rect.height - 24,
        rect.width,
        rect.height,
      );
      setPanelState((current) => ({ ...current, ...next }));
    }

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [panelState.isOpen, panelState.x, panelState.y]);

  function startDragging(event: React.PointerEvent<HTMLDivElement>) {
    if (!panelRef.current) {
      return;
    }

    const target = event.target as HTMLElement;
    if (target.closest("button") || target.closest("a")) {
      return;
    }

    const rect = panelRef.current.getBoundingClientRect();
    dragOffsetRef.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    draggingRef.current = true;
  }

  function openPanel() {
    setPanelState((current) => ({
      ...current,
      isOpen: true,
      isMinimized: false,
    }));
  }

  function toggleMinimized() {
    setPanelState((current) => ({
      ...current,
      isMinimized: !current.isMinimized,
      isOpen: true,
    }));
  }

  function closePanel() {
    setPanelState((current) => ({
      ...current,
      isOpen: false,
      isMinimized: false,
    }));
  }

  const lastSection = ready
    ? getAdminHelpSectionById(
        window.localStorage.getItem("wr_admin_help_last_section_v1"),
      )
    : null;

  if (!ready || hideShell) {
    return null;
  }

  return (
    <>
      {!isDesktop ? (
        <div className="admin-help-mobile-entry md:hidden">
          <div>
            <p className="admin-help-mobile-title">Help Guide</p>
            <p className="admin-help-mobile-text">
              Open the full help page for admin walkthroughs, VS Code notes, and
              agent reminders.
            </p>
          </div>
          <Link href="/admin/help" className="admin-help-mobile-link">
            Open Help Page
          </Link>
        </div>
      ) : null}

      {isDesktop && !panelState.isOpen ? (
        <button
          type="button"
          className="admin-help-launcher"
          onClick={openPanel}
        >
          <span className="admin-help-launcher-title">Help Guide</span>
          <span className="admin-help-launcher-text">
            {lastSection
              ? `Resume: ${lastSection.title}`
              : "Open the admin help panel"}
          </span>
        </button>
      ) : null}

      {isDesktop && panelState.isOpen ? (
        <div
          ref={panelRef}
          className={`admin-help-panel ${panelState.isMinimized ? "admin-help-panel-minimized" : ""}`}
        >
          <div
            className="admin-help-panel-header"
            onPointerDown={startDragging}
          >
            <div>
              <p className="admin-help-eyebrow">Admin Help</p>
              <h2>
                {panelState.isMinimized ? "Quick Help" : "Floating Help Panel"}
              </h2>
            </div>
            <div className="admin-help-panel-actions">
              <Link href="/admin/help" className="admin-help-header-link">
                Page
              </Link>
              <button
                type="button"
                onClick={toggleMinimized}
                className="admin-help-header-button"
              >
                {panelState.isMinimized ? "Expand" : "Minimize"}
              </button>
              <button
                type="button"
                onClick={closePanel}
                className="admin-help-header-button admin-help-close-button"
                aria-label="Close help panel"
              >
                X
              </button>
            </div>
          </div>

          {panelState.isMinimized ? (
            <div className="admin-help-panel-minimized-body">
              <p>
                {lastSection
                  ? `Last section: ${lastSection.title}`
                  : "Help is ready when you need it."}
              </p>
            </div>
          ) : (
            <AdminHelpContent variant="panel" />
          )}
        </div>
      ) : null}
    </>
  );
}
