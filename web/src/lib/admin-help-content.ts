export type AdminHelpLink = {
  href: string;
  label: string;
};

export type AdminHelpSubsection = {
  title: string;
  items: string[];
};

export type AdminHelpSection = {
  id: string;
  title: string;
  summary: string;
  intro: string;
  routePrefixes?: string[];
  links?: AdminHelpLink[];
  subsections: AdminHelpSubsection[];
};

export const ADMIN_HELP_STORAGE_KEY = "wr_admin_help_state_v1";
export const ADMIN_HELP_LAST_SECTION_KEY = "wr_admin_help_last_section_v1";

export const ADMIN_HELP_SECTIONS: AdminHelpSection[] = [
  {
    id: "admin-overview",
    title: "Admin Overview",
    summary:
      "Start here when you need the shortest explanation of what the admin is for.",
    intro:
      "The main admin dashboard is your control center. Use it to update public content, manage products, watch orders, and keep customer requests moving without touching the public site code.",
    routePrefixes: ["/admin/help"],
    links: [
      { href: "/admin", label: "Open Main Admin" },
      { href: "/admin/content", label: "Open Content Editor" },
    ],
    subsections: [
      {
        title: "What this area controls",
        items: [
          "Homepage copy and promo content.",
          "Categories, products, variants, and inventory.",
          "Customer messages, uploads, and order status.",
        ],
      },
      {
        title: "How to use it well",
        items: [
          "Open only the section you need so the page stays easy to scan.",
          "Make one content change at a time, then confirm it on the public page.",
          "Use the help table of contents when you forget where something lives.",
        ],
      },
    ],
  },
  {
    id: "main-dashboard",
    title: "Main Admin Dashboard",
    summary:
      "Use this first for the homepage, overview controls, and main admin flow.",
    intro:
      "Most day-to-day work happens on the main dashboard. Each major block is there to keep one kind of work together instead of scattering it across many pages.",
    routePrefixes: ["/admin"],
    links: [
      { href: "/admin#product-inventory", label: "Jump to Product Inventory" },
      { href: "/admin#orders-uploads", label: "Jump to Orders and Uploads" },
    ],
    subsections: [
      {
        title: "Homepage and storefront controls",
        items: [
          "Homepage settings change hero copy, calls to action, and promo content.",
          "Welcome cards and popup content are promotional tools, not inventory controls.",
          "Use this page first when you need the fastest overview of what is live.",
        ],
      },
      {
        title: "Daily admin rhythm",
        items: [
          "Use the main dashboard to orient yourself before jumping into narrower editors.",
          "Scan alerts, then move into content, inventory, or order work in that order.",
          "Treat this page as the command surface, not the place for every detailed edit.",
        ],
      },
    ],
  },
  {
    id: "content-editor",
    title: "Content Editor",
    summary:
      "Use this when you are editing business copy, not product records.",
    intro:
      "The content editor is separate from inventory on purpose. Use it for business information, page messaging, and contact details that appear in more than one place.",
    routePrefixes: ["/admin/content"],
    links: [
      { href: "/admin/content", label: "Open Content Editor" },
      { href: "/about", label: "View About Page" },
      { href: "/contact", label: "View Contact Page" },
    ],
    subsections: [
      {
        title: "What belongs here",
        items: [
          "About page headline, intro, service details, and call-to-action text.",
          "Contact page email, phone, address, and support wording.",
          "Shared business details that also show in the footer or printouts.",
        ],
      },
      {
        title: "Safe editing habit",
        items: [
          "Save one section, then check the public page before changing the next section.",
          "If a phone number or email changes, confirm the footer updated too.",
          "Treat this page as business copy control, not product marketing control.",
        ],
      },
    ],
  },
  {
    id: "inventory-management",
    title: "Inventory",
    summary:
      "Use this for categories, products, variants, stock, and storefront records.",
    intro:
      "Inventory work should stay structured. Clean categories and consistent product records make every storefront page easier to manage and every order easier to fulfill.",
    routePrefixes: ["/admin/inventory"],
    links: [
      { href: "/admin/inventory", label: "Open Inventory Page" },
      {
        href: "/admin#product-inventory",
        label: "Jump to Inventory on Main Admin",
      },
    ],
    subsections: [
      {
        title: "Inventory basics",
        items: [
          "Use categories to control grouping before you add more products.",
          "Keep titles, pricing, stock, and active state accurate before promoting an item.",
          "Use variants only when size or color truly changes the sale record.",
        ],
      },
      {
        title: "Data quality rules",
        items: [
          "Do not leave placeholder copy or weak titles in live records.",
          "Keep active state intentional so hidden items do not confuse the storefront.",
          "Update the image, inventory, and pricing together when changing a live product.",
        ],
      },
    ],
  },
  {
    id: "orders-uploads",
    title: "Orders and Uploads",
    summary:
      "Use this when tracking live work, customer files, and fulfillment status.",
    intro:
      "Orders and uploads are operational work. Keep status current so production is visible at a glance and files are easy to find when a customer needs follow-up.",
    routePrefixes: ["/admin/orders", "/admin"],
    links: [
      { href: "/admin#orders-uploads", label: "Jump to Orders and Uploads" },
      { href: "/upload", label: "View Public Upload Page" },
    ],
    subsections: [
      {
        title: "Order flow basics",
        items: [
          "Use status updates to show where work stands instead of keeping that information in memory.",
          "Download design files from the order area, not from random browser tabs.",
          "Archive only fulfilled or resolved work so active queues stay useful.",
        ],
      },
      {
        title: "Operational discipline",
        items: [
          "Keep notes short and factual so anyone can understand the next action.",
          "Do not mark an order done early just to clear the queue visually.",
          "Use uploads and order records together so file context is never detached from the sale.",
        ],
      },
    ],
  },
  {
    id: "admin-tools",
    title: "Admin APIs and Tools",
    summary:
      "Use this for technical admin tools, API surfaces, and protected utility work.",
    intro:
      "This area is for the narrower admin tooling that supports operations but should not clutter the main editorial flow. Use it when the work is technical, controlled, or system-facing.",
    routePrefixes: ["/admin/apis"],
    links: [{ href: "/admin/apis", label: "Open Admin APIs" }],
    subsections: [
      {
        title: "What belongs here",
        items: [
          "Technical admin tools and internal utilities.",
          "API-related admin surfaces that should stay separate from content editing.",
          "Protected operational tools that regular storefront editing should not depend on.",
        ],
      },
      {
        title: "How to approach it",
        items: [
          "Use this after the main admin flow when the task is clearly technical.",
          "Keep changes controlled and documented because tool-facing changes can affect multiple workflows.",
          "Verify what the tool impacts before treating it like a simple content edit.",
        ],
      },
    ],
  },
];

export function getAdminHelpSectionById(sectionId: string | null | undefined) {
  if (!sectionId) {
    return null;
  }

  return (
    ADMIN_HELP_SECTIONS.find((section) => section.id === sectionId) ?? null
  );
}

export function getAdminHelpDefaultSectionId(
  pathname: string | null | undefined,
) {
  if (!pathname) {
    return ADMIN_HELP_SECTIONS[0]?.id ?? null;
  }

  if (pathname.startsWith("/admin/content")) {
    return "content-editor";
  }

  if (pathname.startsWith("/admin/inventory")) {
    return "inventory-management";
  }

  if (pathname.startsWith("/admin/apis")) {
    return "admin-tools";
  }

  if (
    pathname.startsWith("/admin/help") ||
    pathname.startsWith("/admin/how-to")
  ) {
    return "admin-overview";
  }

  if (pathname.startsWith("/admin")) {
    return "main-dashboard";
  }

  return ADMIN_HELP_SECTIONS[0]?.id ?? null;
}
