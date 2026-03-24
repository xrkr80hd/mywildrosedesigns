"use client";

import {
    ADMIN_HELP_LAST_SECTION_KEY,
    ADMIN_HELP_SECTIONS,
} from "@/lib/admin-help-content";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type AdminHelpContentProps = {
  variant: "panel" | "page";
};

function normalizeSectionId(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const match = ADMIN_HELP_SECTIONS.find((section) => section.id === value);
  return match?.id ?? null;
}

export function AdminHelpContent({ variant }: AdminHelpContentProps) {
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const [openSectionId, setOpenSectionId] = useState<string | null>(
    variant === "page" ? (ADMIN_HELP_SECTIONS[0]?.id ?? null) : null,
  );
  const [isPanelMenuOpen, setIsPanelMenuOpen] = useState(false);
  const [restoredSectionId, setRestoredSectionId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const hashId = normalizeSectionId(
      window.location.hash.replace(/^#/, "") || null,
    );
    const storedId = normalizeSectionId(
      window.localStorage.getItem(ADMIN_HELP_LAST_SECTION_KEY),
    );
    const nextId =
      hashId ??
      storedId ??
      (variant === "page" ? (ADMIN_HELP_SECTIONS[0]?.id ?? null) : null);

    if (!nextId) {
      return;
    }

    setOpenSectionId(nextId);
    if (!hashId && storedId && variant === "page") {
      setRestoredSectionId(storedId);
    }

    window.requestAnimationFrame(() => {
      const node = sectionRefs.current[nextId];
      if (hashId && node) {
        node.scrollIntoView({ block: "start", behavior: "auto" });
      }
    });
  }, [variant]);

  useEffect(() => {
    if (openSectionId) {
      window.localStorage.setItem(ADMIN_HELP_LAST_SECTION_KEY, openSectionId);
      return;
    }

    window.localStorage.removeItem(ADMIN_HELP_LAST_SECTION_KEY);
  }, [openSectionId]);

  function focusSection(sectionId: string) {
    const nextSectionId = openSectionId === sectionId ? null : sectionId;
    setOpenSectionId(nextSectionId);
    setRestoredSectionId(null);

    if (variant === "panel") {
      setIsPanelMenuOpen(false);
    }

    const node = nextSectionId ? sectionRefs.current[nextSectionId] : null;
    if (variant === "page" && node) {
      window.requestAnimationFrame(() => {
        node.scrollIntoView({ block: "start", behavior: "smooth" });
      });
    }
  }

  return (
    <div
      className={
        variant === "panel"
          ? "admin-help-panel-content"
          : "admin-help-page-content"
      }
    >
      <div
        className={
          variant === "panel"
            ? "admin-help-toc admin-help-toc-panel"
            : "admin-help-toc admin-help-toc-page"
        }
      >
        <div>
          <p className="admin-help-eyebrow">Table of Contents</p>
          <p className="admin-help-muted">
            Open the section you need and keep the rest closed.
          </p>
        </div>
        {variant === "panel" ? (
          <div className="admin-help-toc-menu-shell">
            {isPanelMenuOpen ? (
              <button
                type="button"
                onClick={() => setIsPanelMenuOpen(false)}
                className="admin-help-toc-menu-toggle"
                aria-expanded="true"
                aria-controls="admin-help-panel-menu"
              >
                <span className="admin-help-toc-menu-toggle-copy">
                  <span className="admin-help-toc-menu-toggle-title">
                    Sections
                  </span>
                  <span className="admin-help-toc-menu-toggle-subtitle">
                    {openSectionId
                      ? `Current: ${ADMIN_HELP_SECTIONS.find((section) => section.id === openSectionId)?.title ?? "None"}`
                      : "Open the section menu"}
                  </span>
                </span>
                <span
                  className="admin-help-toc-menu-toggle-icon"
                  aria-hidden="true"
                >
                  ✕
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsPanelMenuOpen(true)}
                className="admin-help-toc-menu-toggle"
                aria-expanded="false"
                aria-controls="admin-help-panel-menu"
              >
                <span className="admin-help-toc-menu-toggle-copy">
                  <span className="admin-help-toc-menu-toggle-title">
                    Sections
                  </span>
                  <span className="admin-help-toc-menu-toggle-subtitle">
                    {openSectionId
                      ? `Current: ${ADMIN_HELP_SECTIONS.find((section) => section.id === openSectionId)?.title ?? "None"}`
                      : "Open the section menu"}
                  </span>
                </span>
                <span
                  className="admin-help-toc-menu-toggle-icon"
                  aria-hidden="true"
                >
                  ☰
                </span>
              </button>
            )}

            {isPanelMenuOpen ? (
              <div
                id="admin-help-panel-menu"
                className="admin-help-toc-list"
                role="navigation"
                aria-label="Help sections"
              >
                {ADMIN_HELP_SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => focusSection(section.id)}
                    className={`admin-help-toc-list-button ${openSectionId === section.id ? "admin-help-toc-list-button-active" : ""}`}
                  >
                    <span className="admin-help-toc-list-button-title">
                      {section.title}
                    </span>
                    <span className="admin-help-toc-list-button-summary">
                      {section.summary}
                    </span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <div
            className="admin-help-toc-list"
            role="navigation"
            aria-label="Help sections"
          >
            {ADMIN_HELP_SECTIONS.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => focusSection(section.id)}
                className={`admin-help-toc-list-button ${openSectionId === section.id ? "admin-help-toc-list-button-active" : ""}`}
              >
                <span className="admin-help-toc-list-button-title">
                  {section.title}
                </span>
                <span className="admin-help-toc-list-button-summary">
                  {section.summary}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {variant === "page" && restoredSectionId ? (
        <div className="admin-help-resume-note">
          Restored your last section so you can pick up where you left off.
        </div>
      ) : null}

      <div className="admin-help-accordion-list">
        {ADMIN_HELP_SECTIONS.map((section) => {
          const isOpen = openSectionId === section.id;
          return (
            <section
              key={section.id}
              id={section.id}
              ref={(node) => {
                sectionRefs.current[section.id] = node;
              }}
              className="admin-help-section"
            >
              {isOpen ? (
                <button
                  type="button"
                  className="admin-help-accordion-trigger"
                  onClick={() => focusSection(section.id)}
                  aria-expanded="true"
                  aria-controls={`${section.id}-panel`}
                >
                  <span>
                    <span className="admin-help-section-title">
                      {section.title}
                    </span>
                    <span className="admin-help-section-summary">
                      {section.summary}
                    </span>
                  </span>
                  <span className="admin-help-section-actions">
                    <span className="admin-help-section-open-label">Close</span>
                    <span
                      className="admin-help-section-caret admin-help-section-caret-open"
                      aria-hidden="true"
                    >
                      &#9662;
                    </span>
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  className="admin-help-accordion-trigger"
                  onClick={() => focusSection(section.id)}
                  aria-expanded="false"
                  aria-controls={`${section.id}-panel`}
                >
                  <span>
                    <span className="admin-help-section-title">
                      {section.title}
                    </span>
                    <span className="admin-help-section-summary">
                      {section.summary}
                    </span>
                  </span>
                  <span className="admin-help-section-actions">
                    <span className="admin-help-section-open-label">Open</span>
                    <span
                      className="admin-help-section-caret"
                      aria-hidden="true"
                    >
                      &#9662;
                    </span>
                  </span>
                </button>
              )}

              {isOpen ? (
                <div
                  id={`${section.id}-panel`}
                  className="admin-help-accordion-panel"
                >
                  <p className="admin-help-section-intro">{section.intro}</p>

                  {section.links?.length ? (
                    <div className="admin-help-link-row">
                      {section.links.map((link) => (
                        <Link
                          key={`${section.id}-${link.href}-${link.label}`}
                          href={link.href}
                          className="admin-help-inline-link"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}

                  <div className="admin-help-subsection-list">
                    {section.subsections.map((subsection) => (
                      <div
                        key={`${section.id}-${subsection.title}`}
                        className="admin-help-subsection"
                      >
                        <h3>{subsection.title}</h3>
                        <ul>
                          {subsection.items.map((item) => (
                            <li
                              key={`${section.id}-${subsection.title}-${item}`}
                            >
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </section>
          );
        })}
      </div>
    </div>
  );
}
