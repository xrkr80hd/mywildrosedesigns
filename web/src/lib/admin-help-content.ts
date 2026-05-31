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
    title: "Start Here",
    summary:
      "The fastest way to understand the updated admin without getting buried.",
    intro:
      "The admin is now split into two big work zones: Inventory Management System and Content Management System. Keep most sections closed, open only the card you need, do the one job, then close it again.",
    routePrefixes: ["/admin/help"],
    links: [
      { href: "/admin", label: "Open Main Admin" },
      { href: "/admin#inventory-management", label: "Inventory Management" },
      { href: "/admin#content-management", label: "Content Management" },
    ],
    subsections: [
      {
        title: "What changed",
        items: [
          "Product work is grouped under Inventory Management System.",
          "Homepage, popup, welcome, about, and contact content are grouped under Content Management System.",
          "Most cards are closed by default so the screen is less overwhelming.",
        ],
      },
      {
        title: "Best habit",
        items: [
          "Open Product Inventory first if you are adding or changing anything for sale.",
          "Use Bundle Maker only after the products or variants exist.",
          "Use the full Help page on mobile; the floating panel is desktop-only.",
        ],
      },
    ],
  },
  {
    id: "login-safety",
    title: "Login and Safety",
    summary:
      "How to get in, and why the admin is not wide open anymore.",
    intro:
      "The admin login uses the local admin username and password from the environment file. Supabase is connected for data, but this dashboard login is protected by the app admin credentials.",
    routePrefixes: ["/admin/login"],
    links: [
      { href: "/admin/login", label: "Open Login" },
      { href: "/admin", label: "Open Admin" },
    ],
    subsections: [
      {
        title: "What to know",
        items: [
          "If you are not logged in, /admin sends you to /admin/login.",
          "Local credentials live in web/.env.local as ADMIN_USERNAME and ADMIN_PASSWORD.",
          "ADMIN_BYPASS_AUTH is ignored in production so it cannot accidentally open the live admin.",
        ],
      },
      {
        title: "If login does not work",
        items: [
          "Restart the Node server after changing .env.local.",
          "Confirm ADMIN_USERNAME and ADMIN_PASSWORD are filled in.",
          "If you are already logged in with an old cookie, sign out and sign in again.",
        ],
      },
    ],
  },
  {
    id: "inventory-management",
    title: "Inventory Management",
    summary:
      "The main area for products, categories, variants, bundles, pricing, and orders.",
    intro:
      "Start in Inventory Management when you are working with anything customers can buy. Product Inventory is first because bundles and checkout pricing depend on product records being right.",
    routePrefixes: ["/admin", "/admin/inventory"],
    links: [
      { href: "/admin#inventory-management", label: "Open Inventory System" },
      { href: "/admin#product-inventory", label: "Open Product Inventory" },
      { href: "/admin#orders-uploads", label: "Open Orders and Uploads" },
    ],
    subsections: [
      {
        title: "Order of work",
        items: [
          "Categories: create or rename the bucket the product belongs in.",
          "Add Item or Product: create the product, pick the category, set pricing, images, and active state.",
          "Variants: add size, color, brand, and price override when those choices affect checkout.",
        ],
      },
      {
        title: "What not to do",
        items: [
          "Do not build a bundle before the product choices inside it exist.",
          "Do not deactivate a category casually; items in it move to Uncategorized.",
          "Do not use stock as the main workflow for custom-order shirts unless you truly track inventory.",
        ],
      },
    ],
  },
  {
    id: "product-variants",
    title: "Products, Templates, and Variants",
    summary:
      "How to add one product, use a saved template, or create size/brand price variants.",
    intro:
      "A template is a speed helper, not a requirement. You can still make a one-off product manually. Templates should capture repeated size, brand, and price patterns without forcing every item into the same setup.",
    routePrefixes: ["/admin"],
    links: [
      { href: "/admin#product-create", label: "Add Item or Product" },
      { href: "/admin#product-inventory", label: "Product Inventory" },
    ],
    subsections: [
      {
        title: "Add a normal product",
        items: [
          "Pick the Category For This Product first.",
          "Add the title, image, description, base price, sale settings, and active state.",
          "Use Add Product when it is a simple one-off item.",
        ],
      },
      {
        title: "Use or create a template",
        items: [
          "Choose an existing template only when it saves time for this product.",
          "Create Template should snapshot the repeated size, brand, and price setup, not the product title or SKU.",
          "After applying a template, review the generated variants before saving or selling.",
        ],
      },
      {
        title: "Variant pricing",
        items: [
          "Use variants when size, color, or shirt brand changes the checkout price.",
          "Brand examples are Bella Canvas, Gildan Softstyle, Comfort Colors, or any future shirt brand.",
          "Each variant can carry its own price override so checkout does not trust typed customer text.",
        ],
      },
    ],
  },
  {
    id: "bundle-maker",
    title: "Bundle Maker",
    summary:
      "How to build a bundle from existing inventory without losing your mind.",
    intro:
      "Bundles are products made from other products. Build the products first, then open Bundle Maker, name the bundle, add the included inventory items, and set the bundle price.",
    routePrefixes: ["/admin"],
    links: [
      { href: "/admin#bundle-maker", label: "Open Bundle Maker" },
      { href: "/admin#active-inventory-quick-view", label: "Active Inventory Quick View" },
    ],
    subsections: [
      {
        title: "Bundle order",
        items: [
          "Give the bundle a clear, fun name.",
          "Add products from the Active Inventory Quick View so the bundle has real components.",
          "Set one bundle price, then check that size and brand choices still make sense for the included products.",
        ],
      },
      {
        title: "Good bundle habits",
        items: [
          "Use short bundle names that are easy to recognize later.",
          "Keep the bundle image or collage simple enough that customers understand the offer.",
          "Only mark the bundle active when every included item is ready to sell.",
        ],
      },
    ],
  },
  {
    id: "orders-uploads",
    title: "Orders and Uploads",
    summary:
      "Where customer work, uploads, order status, and cleanup live.",
    intro:
      "Orders and uploads are operational work. Use this area to see what needs attention, update status, print labels, and archive completed work.",
    routePrefixes: ["/admin/orders", "/admin"],
    links: [
      { href: "/admin#orders-uploads", label: "Open Orders and Uploads" },
      { href: "/upload", label: "View Public Upload Page" },
    ],
    subsections: [
      {
        title: "Daily flow",
        items: [
          "Use Active for current work, Archived for hidden old work, and All when you need to find something.",
          "Archive fulfilled, completed, or cancelled work to keep the active view calm.",
          "Use Clear Archived Orders only when you are sure old archived records are no longer needed.",
        ],
      },
      {
        title: "Customer files",
        items: [
          "Download design files from the order row so the file stays attached to the customer.",
          "Keep order notes short and factual.",
          "Do not mark work complete until the production task is actually complete.",
        ],
      },
    ],
  },
  {
    id: "content-management",
    title: "Content Management",
    summary:
      "Use this for homepage, popup, welcome cards, about, contact, and public copy.",
    intro:
      "Content Management is for words and promotional content. It is not where you build product records or bundle pricing.",
    routePrefixes: ["/admin/content", "/admin"],
    links: [
      { href: "/admin#content-management", label: "Open Content Management" },
      { href: "/admin/content", label: "Open About and Contact Editor" },
      { href: "/", label: "View Homepage" },
    ],
    subsections: [
      {
        title: "What belongs here",
        items: [
          "Homepage settings, welcome posts, and promotional popup content.",
          "About page and contact page wording.",
          "Business details that appear in more than one public place.",
        ],
      },
      {
        title: "Safe editing habit",
        items: [
          "Save one content section, then check the public page.",
          "If phone, email, or address changes, confirm the footer and print labels still make sense.",
          "Keep product descriptions with products, not in the content editor.",
        ],
      },
    ],
  },
  {
    id: "quick-fixes",
    title: "Quick Fixes",
    summary:
      "Fast answers for the most common admin confusion points.",
    intro:
      "Use this when something feels stuck or you cannot remember where a setting lives.",
    routePrefixes: ["/admin/help"],
    links: [
      { href: "/admin#product-inventory", label: "Product Inventory" },
      { href: "/admin#upload-transfer-pricing", label: "Upload Transfer Pricing" },
      { href: "/admin/apis", label: "Admin APIs" },
    ],
    subsections: [
      {
        title: "I need to add something to sell",
        items: [
          "Go to Inventory Management System.",
          "Open Product Inventory.",
          "Open Add Item or Product, pick a category, then create the product.",
        ],
      },
      {
        title: "I need to change a page's words",
        items: [
          "Go to Content Management System.",
          "Use Homepage, Welcome Posts, Promotional Popup, or About / Contact Content.",
          "Check the public page after saving.",
        ],
      },
      {
        title: "I am on my phone",
        items: [
          "Use the full Help page instead of the floating desktop panel.",
          "Open one help section at a time.",
          "Use the Back to Main Admin button when finished reading.",
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
