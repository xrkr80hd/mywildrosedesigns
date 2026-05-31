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
    id: "start-here",
    title: "Start Here",
    summary: "Open one section. Do one job. Close it.",
    intro:
      "Use this admin one small piece at a time. You do not need every section open.",
    routePrefixes: ["/admin/help"],
    links: [
      { href: "/admin", label: "Main Admin" },
      { href: "/admin#product-inventory", label: "Products" },
    ],
    subsections: [
      {
        title: "Quick rule",
        items: [
          "Products and bundles go under Inventory.",
          "Homepage words and popups go under Content.",
          "Orders and customer files go under Orders and Uploads.",
        ],
      },
    ],
  },
  {
    id: "products",
    title: "Add or Edit Products",
    summary: "Use this when something is for sale.",
    intro:
      "Products are the shirts, sweatshirts, designs, and bundles customers can buy.",
    routePrefixes: ["/admin", "/admin/inventory"],
    links: [
      { href: "/admin#product-create", label: "Add Item or Product" },
      { href: "/admin#product-inventory", label: "Product Inventory" },
    ],
    subsections: [
      {
        title: "Add a product",
        items: [
          "Open Inventory Management.",
          "Open Product Inventory.",
          "Open Add Item or Product and fill in the card.",
        ],
      },
      {
        title: "Before saving",
        items: [
          "Pick the category first.",
          "Add the image, price, and description.",
          "Only mark Active when it is ready for customers.",
        ],
      },
    ],
  },
  {
    id: "variants",
    title: "Sizes, Brands, Templates",
    summary: "Use this when size or shirt brand changes price.",
    intro:
      "Variants keep pricing clean. They stop size and brand choices from being random typed text.",
    routePrefixes: ["/admin"],
    links: [{ href: "/admin#product-create", label: "Product Form" }],
    subsections: [
      {
        title: "Use variants for",
        items: [
          "Sizes like Small, Medium, XL, 2XL.",
          "Colors customers can pick.",
          "Brands like Bella Canvas or Gildan Softstyle.",
        ],
      },
      {
        title: "Use templates for",
        items: [
          "Repeated shirt setups.",
          "Repeated size price lists.",
          "Speed, not every single product.",
        ],
      },
    ],
  },
  {
    id: "bundles",
    title: "Make a Bundle",
    summary: "Build bundles after the products exist.",
    intro:
      "A bundle is one offer made from existing products. Do not start here if the products are not created yet.",
    routePrefixes: ["/admin"],
    links: [
      { href: "/admin#bundle-maker", label: "Bundle Maker" },
      { href: "/admin#active-inventory-quick-view", label: "Active Inventory" },
    ],
    subsections: [
      {
        title: "Bundle steps",
        items: [
          "Name the bundle.",
          "Add items from Active Inventory.",
          "Set the bundle price.",
        ],
      },
      {
        title: "Before activating",
        items: [
          "Check every included item.",
          "Use a clear bundle image.",
          "Make sure the price matches the offer.",
        ],
      },
    ],
  },
  {
    id: "orders-content",
    title: "Orders, Content, Fixes",
    summary: "The other daily admin tasks.",
    intro:
      "Use this when you are not creating a product or bundle.",
    routePrefixes: ["/admin/content", "/admin/orders", "/admin"],
    links: [
      { href: "/admin#orders-uploads", label: "Orders" },
      { href: "/admin#content-management", label: "Content" },
      { href: "/admin/content", label: "About / Contact" },
    ],
    subsections: [
      {
        title: "Orders",
        items: [
          "Open Orders and Uploads.",
          "Update the status.",
          "Archive only finished work.",
        ],
      },
      {
        title: "Content",
        items: [
          "Use Content Management for homepage words.",
          "Use About / Contact for business info.",
          "Check the public page after saving.",
        ],
      },
      {
        title: "If stuck",
        items: [
          "Close extra sections.",
          "Go back to Start Here.",
          "Do one task at a time.",
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
    return "orders-content";
  }

  if (pathname.startsWith("/admin/inventory")) {
    return "products";
  }

  if (
    pathname.startsWith("/admin/help") ||
    pathname.startsWith("/admin/how-to")
  ) {
    return "start-here";
  }

  if (pathname.startsWith("/admin")) {
    return "start-here";
  }

  return ADMIN_HELP_SECTIONS[0]?.id ?? null;
}
