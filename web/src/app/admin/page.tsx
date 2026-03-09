
import Link from "next/link";
import type { ReactNode } from "react";
import { AdminAttentionAlerts } from "@/components/admin-attention-alerts";
import { AdminConfirmSubmitButton } from "@/components/admin-confirm-submit-button";
import { AdminImageUploadField } from "@/components/admin-image-upload-field";
import { ShareProductButton } from "@/components/share-product-button";
import { ORDER_STATUS_VALUES } from "@/lib/order-status";
import type { ProductOptionAdminRow } from "@/lib/product-options-store";
import { getUploadProductOptionsForAdmin } from "@/lib/product-options-store";
import { getUploadBucket } from "@/lib/env";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  archiveOrder,
  archiveResolvedOrders,
  clearArchivedOrders,
  createUploadTransferOption,
  createCategory,
  createProduct,
  createProductVariant,
  deleteUploadTransferOption,
  createWelcomePost,
  deleteCategory,
  deleteProductCard,
  deleteProductVariant,
  deleteWelcomePost,
  saveHomepageSettings,
  saveUploadTransferPricing,
  savePromoPopup,
  unarchiveOrder,
  updateCategory,
  updateContactMessage,
  updateOrderStatus,
  updateProductCard,
  updateProductVariant,
  updateWelcomePost,
} from "./actions";

export const dynamic = "force-dynamic";

const CONTACT_STATUS_VALUES = ["new", "in_progress", "resolved"] as const;
type OrderView = "active" | "archived" | "all";

type AdminPageProps = {
  searchParams?: Promise<{
    orderView?: string | string[];
  }>;
};

type OrderRow = {
  id: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  product_option: string;
  quantity: number;
  amount_cents: number;
  status: string;
  notes: string | null;
  design_path: string;
  paid_at: string | null;
  archived_at: string | null;
  archived_by: string | null;
};

type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  sort_order: number;
  active: boolean;
  image_url: string | null;
};

type ProductRow = {
  id: string;
  title: string;
  sku: string;
  slug: string;
  description: string;
  category_id: string;
  image_url: string | null;
  price_cents: number;
  stock_on_hand: number;
  is_featured: boolean;
  is_hot: boolean;
  sale_enabled: boolean;
  sale_percent_off: number;
  sale_label: string;
  cart_cta_text: string;
  active: boolean;
};

type ProductVariantRow = {
  id: string;
  product_id: string;
  size_value: string | null;
  color_value: string | null;
  sku: string | null;
  price_override_cents: number | null;
  stock_on_hand: number;
  active: boolean;
};

type HomepageRow = {
  hero_badge: string;
  hero_title: string;
  hero_description: string;
  primary_cta_label: string;
  primary_cta_href: string;
  secondary_cta_label: string;
  secondary_cta_href: string;
};

type PopupRow = {
  enabled: boolean;
  show_cta: boolean;
  promo_label: string;
  title: string;
  message: string;
  cta_text: string;
  cta_href: string;
  product_id: string | null;
};

type WelcomePostRow = {
  id: string;
  title: string;
  body: string;
  cta_label: string | null;
  cta_href: string | null;
  sort_order: number;
  active: boolean;
};

type ContactMessageRow = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "new" | "in_progress" | "resolved";
  notes: string | null;
};

type OrderWithFileLink = OrderRow & {
  fileLink: string | null;
};

type InventoryGroup = {
  id: string;
  label: string;
  items: ProductRow[];
};

type InventoryMovementRow = {
  product_id: string;
  quantity_delta: number;
  reference_order_id: string | null;
};

type BestSellerRow = {
  productId: string;
  title: string;
  sku: string;
  unitsSold: number;
  orderCount: number;
};

type FunnelEventRow = {
  event_type: "view_product" | "add_to_cart" | "start_checkout" | "paid";
  created_at: string;
};

const DEFAULT_HOMEPAGE: HomepageRow = {
  hero_badge: "Custom Prints • Fast Turnaround",
  hero_title: "Wild Rose Design LLC",
  hero_description:
    "Custom apparel, school spirit wear, team merch, and seasonal drops. Browse products, add to cart, or upload your own design.",
  primary_cta_label: "Shop Collections",
  primary_cta_href: "/shop",
  secondary_cta_label: "Upload a Design",
  secondary_cta_href: "/upload",
};

const DEFAULT_POPUP: PopupRow = {
  enabled: false,
  show_cta: true,
  promo_label: "Hot Item",
  title: "Get it now!",
  message: "Hot item just dropped.",
  cta_text: "I gotta have it!",
  cta_href: "/shop",
  product_id: null,
};

const ADMIN_NAV_GROUPS = [
  {
    title: "Storefront",
    links: [
      { href: "/", label: "Open Home" },
      { href: "/shop", label: "Open Shop" },
      { href: "/upload", label: "Open Upload" },
      { href: "/about", label: "Open About" },
      { href: "/contact", label: "Open Contact" },
    ],
  },
  {
    title: "Editor Tools",
    links: [
      { href: "/admin/content", label: "Edit About/Contact Content" },
      { href: "/admin#product-inventory", label: "Manage Inventory" },
      { href: "/admin/how-to", label: "How To Edit Pages" },
    ],
  },
  {
    title: "Session",
    links: [{ href: "/logout", label: "Admin Sign Out" }],
  },
] as const;

function formatUsd(amountCents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amountCents / 100);
}

function formatUsdInput(amountCents: number) {
  return (amountCents / 100).toFixed(2);
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString();
}

function orderStatusBadgeClass(status: string): string {
  switch (status) {
    case "pending_payment":
      return "bg-amber-50 text-amber-700";
    case "paid":
      return "bg-emerald-50 text-emerald-700";
    case "in_production":
      return "bg-blue-50 text-blue-700";
    case "completed":
      return "bg-zinc-100 text-zinc-700";
    case "cancelled":
      return "bg-rose-50 text-rose-700";
    default:
      return "bg-zinc-100 text-zinc-700";
  }
}

function messageStatusBadgeClass(status: ContactMessageRow["status"]): string {
  switch (status) {
    case "new":
      return "bg-amber-50 text-amber-700";
    case "in_progress":
      return "bg-blue-50 text-blue-700";
    case "resolved":
      return "bg-emerald-50 text-emerald-700";
    default:
      return "bg-zinc-100 text-zinc-700";
  }
}

function isArchivableOrderStatus(status: string): boolean {
  return status === "completed" || status === "cancelled";
}

function isMissingTableError(error: unknown, tableName: string): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as { code?: string; message?: string; details?: string };
  const text = `${candidate.message ?? ""} ${candidate.details ?? ""}`.toLowerCase();
  return candidate.code === "42P01" || text.includes(tableName.toLowerCase());
}

function isMissingColumnError(error: unknown, columnName: string): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as { code?: string; message?: string; details?: string };
  const text = `${candidate.message ?? ""} ${candidate.details ?? ""}`.toLowerCase();
  return candidate.code === "42703" ||
    (text.includes(columnName.toLowerCase()) && text.includes("does not exist"));
}

function formatVariantLabel(variant: ProductVariantRow): string {
  const parts = [variant.size_value, variant.color_value].filter(Boolean);
  return parts.join(" • ") || "Default option";
}

async function getOrders(orderView: OrderView): Promise<OrderWithFileLink[]> {
  const supabase = getSupabaseAdminClient();
  let includeArchiveColumns = true;
  let orderRows: Array<Partial<OrderRow>> = [];

  const primaryResult = await supabase
    .from("orders")
    .select(
      "id, created_at, customer_name, customer_email, customer_phone, product_option, quantity, amount_cents, status, notes, design_path, paid_at, archived_at, archived_by",
    )
    .order("created_at", { ascending: false })
    .limit(400);

  if (primaryResult.error && isMissingColumnError(primaryResult.error, "archived_at")) {
    includeArchiveColumns = false;
    const fallbackResult = await supabase
      .from("orders")
      .select(
        "id, created_at, customer_name, customer_email, customer_phone, product_option, quantity, amount_cents, status, notes, design_path, paid_at",
      )
      .order("created_at", { ascending: false })
      .limit(400);

    if (fallbackResult.error) {
      return [];
    }
    orderRows = (fallbackResult.data ?? []) as Array<Partial<OrderRow>>;
  } else {
    if (primaryResult.error) {
      return [];
    }
    orderRows = (primaryResult.data ?? []) as Array<Partial<OrderRow>>;
  }

  const rows = orderRows.map((order) => ({
    id: String(order.id ?? ""),
    created_at: String(order.created_at ?? ""),
    customer_name: String(order.customer_name ?? ""),
    customer_email: String(order.customer_email ?? ""),
    customer_phone: order.customer_phone ? String(order.customer_phone) : null,
    product_option: String(order.product_option ?? ""),
    quantity: Number(order.quantity ?? 0),
    amount_cents: Number(order.amount_cents ?? 0),
    status: String(order.status ?? ""),
    notes: order.notes ? String(order.notes) : null,
    design_path: String(order.design_path ?? ""),
    paid_at: order.paid_at ? String(order.paid_at) : null,
    archived_at:
      includeArchiveColumns && order.archived_at ? String(order.archived_at) : null,
    archived_by:
      includeArchiveColumns && order.archived_by ? String(order.archived_by) : null,
  })) as OrderRow[];

  const filteredRows =
    orderView === "archived"
      ? rows.filter((order) => Boolean(order.archived_at))
      : orderView === "active"
        ? rows.filter((order) => !order.archived_at)
        : rows;

  const bucket = getUploadBucket();

  return Promise.all(
    filteredRows.map(async (order) => {
      const signedResult = await supabase.storage
        .from(bucket)
        .createSignedUrl(order.design_path, 60 * 60 * 24);

      return {
        ...order,
        fileLink: signedResult.data?.signedUrl ?? null,
      };
    }),
  );
}

async function getOrderAttentionSummary() {
  const supabase = getSupabaseAdminClient();
  let rows: Array<{ id: string }> = [];

  const primaryResult = await supabase
    .from("orders")
    .select("id, status, archived_at, created_at")
    .in("status", ["pending_payment", "paid"])
    .is("archived_at", null)
    .order("created_at", { ascending: false })
    .limit(500);

  if (primaryResult.error && isMissingColumnError(primaryResult.error, "archived_at")) {
    const fallbackResult = await supabase
      .from("orders")
      .select("id, status, created_at")
      .in("status", ["pending_payment", "paid"])
      .order("created_at", { ascending: false })
      .limit(500);

    if (fallbackResult.error) {
      return { newOrderCount: 0, latestOrderId: null as string | null };
    }
    rows = (fallbackResult.data ?? []) as Array<{ id: string }>;
  } else {
    if (primaryResult.error) {
      return { newOrderCount: 0, latestOrderId: null as string | null };
    }
    rows = (primaryResult.data ?? []) as Array<{ id: string }>;
  }

  return {
    newOrderCount: rows.length,
    latestOrderId: rows[0]?.id ?? null,
  };
}

async function getCategories() {
  const supabase = getSupabaseAdminClient();
  const result = await supabase
    .from("categories")
    .select("id, slug, name, sort_order, active, image_url")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (result.error) {
    const fallbackResult = await supabase
      .from("categories")
      .select("id, slug, name, sort_order, active")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    return ((fallbackResult.data ?? []) as Array<Omit<CategoryRow, "image_url">>).map(
      (category) => ({
        ...category,
        image_url: null,
      }),
    );
  }

  return (result.data ?? []) as CategoryRow[];
}

async function getProducts() {
  const supabase = getSupabaseAdminClient();
  const result = await supabase
    .from("products")
    .select(
      "id, title, sku, slug, description, category_id, image_url, price_cents, stock_on_hand, is_featured, is_hot, sale_enabled, sale_percent_off, sale_label, cart_cta_text, active",
    )
    .order("created_at", { ascending: false });

  return (result.data ?? []) as ProductRow[];
}

async function getSaleMovements() {
  const supabase = getSupabaseAdminClient();
  const result = await supabase
    .from("inventory_movements")
    .select("product_id, quantity_delta, reference_order_id")
    .eq("movement_type", "sale")
    .limit(4000);

  return (result.data ?? []) as InventoryMovementRow[];
}

async function getProductVariants() {
  const supabase = getSupabaseAdminClient();
  const result = await supabase
    .from("product_variants")
    .select(
      "id, product_id, size_value, color_value, sku, price_override_cents, stock_on_hand, active",
    )
    .order("created_at", { ascending: true });

  if (result.error) {
    if (isMissingTableError(result.error, "product_variants")) {
      return [];
    }
    return [];
  }

  return (result.data ?? []) as ProductVariantRow[];
}

async function getFunnelEvents() {
  const supabase = getSupabaseAdminClient();
  const thirtyDaysAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString();
  const result = await supabase
    .from("funnel_events")
    .select("event_type, created_at")
    .gte("created_at", thirtyDaysAgo)
    .limit(20000);

  if (result.error) {
    if (isMissingTableError(result.error, "funnel_events")) {
      return [];
    }
    return [];
  }

  return (result.data ?? []) as FunnelEventRow[];
}

function buildFunnelSummary(events: FunnelEventRow[]) {
  const counts = {
    view_product: 0,
    add_to_cart: 0,
    start_checkout: 0,
    paid: 0,
  };

  for (const event of events) {
    if (event.event_type in counts) {
      counts[event.event_type] += 1;
    }
  }

  function rate(numerator: number, denominator: number): string {
    if (denominator <= 0) {
      return "0.0%";
    }
    return `${((numerator / denominator) * 100).toFixed(1)}%`;
  }

  return {
    counts,
    addRate: rate(counts.add_to_cart, counts.view_product),
    checkoutRate: rate(counts.start_checkout, counts.add_to_cart),
    paidRate: rate(counts.paid, counts.start_checkout),
  };
}

function buildBestSellerRows(
  products: ProductRow[],
  movements: InventoryMovementRow[],
): BestSellerRow[] {
  const productById = new Map(products.map((product) => [product.id, product]));
  const aggregates = new Map<
    string,
    {
      unitsSold: number;
      orderIds: Set<string>;
    }
  >();

  for (const movement of movements) {
    const product = productById.get(movement.product_id);
    if (!product) {
      continue;
    }

    const soldUnits = Math.max(0, -Number(movement.quantity_delta ?? 0));
    if (soldUnits <= 0) {
      continue;
    }

    const entry = aggregates.get(movement.product_id) ?? {
      unitsSold: 0,
      orderIds: new Set<string>(),
    };
    entry.unitsSold += soldUnits;
    if (movement.reference_order_id) {
      entry.orderIds.add(movement.reference_order_id);
    }
    aggregates.set(movement.product_id, entry);
  }

  return Array.from(aggregates.entries())
    .map(([productId, aggregate]) => {
      const product = productById.get(productId)!;
      return {
        productId,
        title: product.title,
        sku: product.sku,
        unitsSold: aggregate.unitsSold,
        orderCount: aggregate.orderIds.size,
      };
    })
    .sort((a, b) => b.unitsSold - a.unitsSold || b.orderCount - a.orderCount)
    .slice(0, 15);
}

async function getHomepageSettings() {
  const supabase = getSupabaseAdminClient();
  const result = await supabase
    .from("homepage_settings")
    .select(
      "hero_badge, hero_title, hero_description, primary_cta_label, primary_cta_href, secondary_cta_label, secondary_cta_href",
    )
    .eq("singleton_key", "main")
    .maybeSingle();

  return (result.data as HomepageRow | null) ?? DEFAULT_HOMEPAGE;
}

async function getPopup() {
  const supabase = getSupabaseAdminClient();
  const result = await supabase
    .from("promo_popups")
    .select("enabled, show_cta, promo_label, title, message, cta_text, cta_href, product_id")
    .eq("singleton_key", "main")
    .maybeSingle();

  if (!result.error) {
    return (result.data as PopupRow | null) ?? DEFAULT_POPUP;
  }

  const legacyResult = await supabase
    .from("promo_popups")
    .select("enabled, title, message, cta_text, product_id")
    .eq("singleton_key", "main")
    .maybeSingle();

  if (legacyResult.error || !legacyResult.data) {
    return DEFAULT_POPUP;
  }

  return {
    enabled: legacyResult.data.enabled,
    show_cta: true,
    promo_label: "Hot Item",
    title: legacyResult.data.title,
    message: legacyResult.data.message,
    cta_text: legacyResult.data.cta_text,
    cta_href: "/shop",
    product_id: legacyResult.data.product_id,
  } as PopupRow;
}

async function getWelcomePosts() {
  const supabase = getSupabaseAdminClient();
  const result = await supabase
    .from("welcome_posts")
    .select("id, title, body, cta_label, cta_href, sort_order, active")
    .not("title", "like", "site-setting::%")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  return (result.data ?? []) as WelcomePostRow[];
}

async function getContactMessages() {
  const supabase = getSupabaseAdminClient();
  const result = await supabase
    .from("contact_messages")
    .select("id, created_at, name, email, subject, message, status, notes")
    .order("created_at", { ascending: false })
    .limit(300);

  return (result.data ?? []) as ContactMessageRow[];
}

function AdminDropdownSection({
  id,
  persistKey,
  title,
  description,
  children,
}: {
  id?: string;
  persistKey: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <details
      id={id}
      data-admin-key={persistKey}
      className="mt-7 rounded-2xl border border-rose/20 bg-white/85 p-5"
    >
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl text-forest">{title}</h2>
          <p className="mt-1 text-sm text-foreground/70">{description}</p>
        </div>
        <span className="mt-1 rounded-full bg-rose/10 px-2 py-0.5 text-[11px] font-semibold text-rose-900">
          &#9662;
        </span>
      </summary>
      <div className="mt-4">{children}</div>
    </details>
  );
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const resolvedSearchParams = await searchParams;
  const viewParam = resolvedSearchParams?.orderView;
  const rawOrderView = Array.isArray(viewParam) ? viewParam[0] : viewParam;
  const normalizedOrderView = (rawOrderView ?? "").trim().toLowerCase();
  const orderView: OrderView =
    normalizedOrderView === "archived"
      ? "archived"
      : normalizedOrderView === "all"
        ? "all"
        : "active";

  const [
    orders,
    orderAttention,
    categories,
    products,
    productVariants,
    homepage,
    popup,
    welcomePosts,
    messages,
    uploadOptions,
    saleMovements,
    funnelEvents,
  ] =
    await Promise.all([
      getOrders(orderView),
      getOrderAttentionSummary(),
      getCategories(),
      getProducts(),
      getProductVariants(),
      getHomepageSettings(),
      getPopup(),
      getWelcomePosts(),
      getContactMessages(),
      getUploadProductOptionsForAdmin(),
      getSaleMovements(),
      getFunnelEvents(),
    ]);

  const categoryNameById = new Map(categories.map((category) => [category.id, category.name]));
  const inventoryGroups: InventoryGroup[] = categories.map((category) => ({
    id: category.id,
    label: category.name,
    items: products.filter((product) => product.category_id === category.id),
  }));
  const uncategorizedProducts = products.filter(
    (product) => !categoryNameById.has(product.category_id),
  );

  if (uncategorizedProducts.length > 0) {
    inventoryGroups.push({
      id: "uncategorized",
      label: "Uncategorized",
      items: uncategorizedProducts,
    });
  }

  const newMessageCount = messages.filter((message) => message.status === "new").length;
  const latestMessageId = messages.find((message) => message.status === "new")?.id ?? null;
  const newOrderCount = orderAttention.newOrderCount;
  const latestOrderId = orderAttention.latestOrderId;
  const bestSellerRows = buildBestSellerRows(products, saleMovements);
  const funnelSummary = buildFunnelSummary(funnelEvents);
  const variantsByProductId = new Map<string, ProductVariantRow[]>();
  for (const variant of productVariants) {
    const existing = variantsByProductId.get(variant.product_id) ?? [];
    existing.push(variant);
    variantsByProductId.set(variant.product_id, existing);
  }
  const orderViewBasePath =
    orderView === "active" ? "/admin" : `/admin?orderView=${orderView}`;
  const ordersViewHref = (nextView: OrderView) =>
    nextView === "active"
      ? "/admin#orders-uploads"
      : `/admin?orderView=${nextView}#orders-uploads`;
  const orderRedirectTo = (orderId?: string) =>
    `${orderViewBasePath}${orderId ? `#order-${orderId}` : "#orders-uploads"}`;

  return (
    <main className="admin-content mx-auto min-h-screen w-full max-w-7xl px-6 py-10">
      <header className="rounded-3xl border border-rose/20 bg-surface p-7 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
          Wild Rose Admin
        </p>
        <h1 className="mt-2 text-4xl text-forest">Full Site Control Center</h1>
        <p className="mt-2 text-sm text-foreground/75">
          Manage homepage copy, categories, products, welcome cards, customer
          messages, uploads, and orders from one dashboard.
        </p>

        <details className="mt-5 rounded-2xl border border-rose/20 bg-white/70 p-3 md:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
            <span className="text-sm font-semibold text-forest">Admin Menu</span>
            <span aria-hidden="true" className="inline-flex flex-col gap-1">
              <span className="h-[2px] w-5 bg-forest" />
              <span className="h-[2px] w-5 bg-forest" />
              <span className="h-[2px] w-5 bg-forest" />
            </span>
          </summary>
          <div className="mt-3 space-y-4">
            {ADMIN_NAV_GROUPS.map((group) => (
              <section key={group.title}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">
                  {group.title}
                </p>
                <div className="mt-2 space-y-1.5">
                  {group.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block text-sm font-semibold text-forest hover:text-rose"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </details>

        <div className="mt-5 hidden gap-3 md:grid md:grid-cols-3">
          {ADMIN_NAV_GROUPS.map((group) => (
            <section key={group.title} className="rounded-2xl border border-rose/20 bg-white/70 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">
                {group.title}
              </p>
              <div className="mt-2 space-y-1.5">
                {group.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block text-sm font-semibold text-forest hover:text-rose"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </header>

      <AdminAttentionAlerts
        newMessageCount={newMessageCount}
        newOrderCount={newOrderCount}
        latestMessageId={latestMessageId}
        latestOrderId={latestOrderId}
      />

      <AdminDropdownSection
        persistKey="homepage-hero"
        title="Homepage Hero"
        description="This controls the top-left copy block on the home page."
      >
        <form action={saveHomepageSettings} className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">Badge</span>
            <input name="heroBadge" defaultValue={homepage.hero_badge} className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">Title</span>
            <input name="heroTitle" defaultValue={homepage.hero_title} className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm" />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">Description</span>
            <textarea name="heroDescription" rows={3} defaultValue={homepage.hero_description} className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">Primary CTA Label</span>
            <input name="primaryCtaLabel" defaultValue={homepage.primary_cta_label} className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">Primary CTA Link</span>
            <input name="primaryCtaHref" defaultValue={homepage.primary_cta_href} className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">Secondary CTA Label</span>
            <input name="secondaryCtaLabel" defaultValue={homepage.secondary_cta_label} className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">Secondary CTA Link</span>
            <input name="secondaryCtaHref" defaultValue={homepage.secondary_cta_href} className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm" />
          </label>
          <div className="md:col-span-2">
            <button type="submit" className="rounded-xl bg-forest px-4 py-2 text-sm font-semibold text-white">Save Homepage Hero</button>
          </div>
        </form>
      </AdminDropdownSection>

      <AdminDropdownSection
        persistKey="promo-popup"
        title="Promotional Popup"
        description="This controls the popup modal only. It is separate from featured products and homepage feature cards."
      >
        <form action={savePromoPopup} className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">Popup Label</span>
            <input name="promoLabel" defaultValue={popup.promo_label} className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">Title</span>
            <input name="title" defaultValue={popup.title} className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">CTA Text</span>
            <input name="ctaText" defaultValue={popup.cta_text} className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">CTA Link</span>
            <input name="ctaHref" defaultValue={popup.cta_href} className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm" />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">Message</span>
            <textarea name="message" rows={2} defaultValue={popup.message} className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">Product</span>
            <select name="productId" defaultValue={popup.product_id ?? ""} className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm">
              <option value="">No product selected</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>{product.title}</option>
              ))}
            </select>
          </label>
          <label className="mt-6 inline-flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" name="enabled" defaultChecked={popup.enabled} /> Popup enabled
          </label>
          <label className="mt-6 inline-flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" name="showCta" defaultChecked={popup.show_cta} /> Show CTA button
          </label>
          <div className="md:col-span-2">
            <button type="submit" className="rounded-xl bg-rose px-4 py-2 text-sm font-semibold text-white">Save Popup</button>
          </div>
        </form>
      </AdminDropdownSection>

      <AdminDropdownSection
        persistKey="homepage-feature-cards"
        title="Homepage Feature Cards"
        description="Edit cards shown on Home under Homepage Highlights (not the popup modal)."
      >

        <form action={createWelcomePost} className="mt-4 grid gap-3 rounded-2xl border border-rose/15 bg-surface p-4 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">Title</span>
            <input name="title" className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">Sort Order</span>
            <input name="sortOrder" type="number" defaultValue={10} className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm" />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">Body</span>
            <textarea name="body" rows={2} className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">CTA Label</span>
            <input name="ctaLabel" className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">CTA Link</span>
            <input name="ctaHref" defaultValue="/shop" className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm" />
          </label>
          <label className="inline-flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" name="active" defaultChecked /> Active
          </label>
          <div className="md:col-span-2">
            <button type="submit" className="rounded-xl bg-forest px-4 py-2 text-sm font-semibold text-white">Add Welcome Card</button>
          </div>
        </form>

        <div className="mt-4 space-y-3">
          {welcomePosts.map((post) => (
            <article key={post.id} className="rounded-2xl border border-rose/20 bg-white p-4">
              <form action={updateWelcomePost} className="grid gap-3 md:grid-cols-2">
                <input type="hidden" name="postId" value={post.id} />
                <label className="space-y-1"><span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">Title</span><input name="title" defaultValue={post.title} className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm" /></label>
                <label className="space-y-1"><span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">Sort Order</span><input name="sortOrder" type="number" defaultValue={post.sort_order} className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm" /></label>
                <label className="space-y-1 md:col-span-2"><span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">Body</span><textarea name="body" rows={2} defaultValue={post.body} className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm" /></label>
                <label className="space-y-1"><span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">CTA Label</span><input name="ctaLabel" defaultValue={post.cta_label ?? ""} className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm" /></label>
                <label className="space-y-1"><span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">CTA Link</span><input name="ctaHref" defaultValue={post.cta_href ?? ""} className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm" /></label>
                <label className="inline-flex items-center gap-2 text-sm font-semibold"><input type="checkbox" name="active" defaultChecked={post.active} /> Active</label>
                <div className="md:col-span-2"><button type="submit" className="rounded-xl bg-forest px-4 py-2 text-sm font-semibold text-white">Save Card</button></div>
              </form>
              <form action={deleteWelcomePost} className="mt-2">
                <input type="hidden" name="postId" value={post.id} />
                <button type="submit" className="rounded-xl border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50">Delete Card</button>
              </form>
            </article>
          ))}
        </div>
      </AdminDropdownSection>

      <AdminDropdownSection
        id="upload-transfer-pricing"
        persistKey="upload-transfer-pricing"
        title="Upload Transfer Pricing"
        description="Edit custom upload transfer names, descriptions, pricing, and availability."
      >
        <form
          action={createUploadTransferOption}
          className="mt-4 grid gap-3 rounded-2xl border border-rose/20 bg-white p-4 md:grid-cols-2"
        >
          <input type="hidden" name="redirectTo" value="/admin#upload-transfer-pricing" />
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">New Option Name</span>
            <input
              name="name"
              placeholder="Custom Transfer"
              className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">Price (cents)</span>
            <input
              name="amountCents"
              type="number"
              min={100}
              defaultValue={2500}
              className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm"
            />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">Description</span>
            <textarea
              name="description"
              rows={2}
              placeholder="Describe this transfer option."
              className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">Sort Order</span>
            <input
              name="sortOrder"
              type="number"
              defaultValue={100}
              className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm"
            />
          </label>
          <label className="inline-flex items-center gap-2 text-sm font-semibold md:mt-7">
            <input type="checkbox" name="active" defaultChecked />
            Option active
          </label>
          <div className="md:col-span-2">
            <button type="submit" className="rounded-xl bg-rose px-4 py-2 text-sm font-semibold text-white">
              Add Custom Transfer
            </button>
          </div>
        </form>

        <form action={saveUploadTransferPricing} className="mt-4 space-y-3">
          <input type="hidden" name="redirectTo" value="/admin#upload-transfer-pricing" />
          {uploadOptions.map((option: ProductOptionAdminRow) => (
            <article key={option.id} className="rounded-2xl border border-rose/20 bg-white p-4">
              <input type="hidden" name="optionIds" value={option.id} />
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">
                {option.id}
              </p>
              <div className="mt-2 grid gap-3 md:grid-cols-2">
                <label className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">Sort Order</span>
                  <input
                    name={`sortOrder_${option.id}`}
                    type="number"
                    defaultValue={option.sortOrder}
                    className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">Name</span>
                  <input
                    name={`name_${option.id}`}
                    defaultValue={option.name}
                    className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">Price (cents)</span>
                  <input
                    name={`amountCents_${option.id}`}
                    type="number"
                    min={100}
                    defaultValue={option.amountCents}
                    className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm"
                  />
                </label>
                <label className="space-y-1 md:col-span-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">Description</span>
                  <textarea
                    name={`description_${option.id}`}
                    rows={2}
                    defaultValue={option.description}
                    className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm"
                  />
                </label>
                <label className="inline-flex items-center gap-2 text-sm font-semibold">
                  <input type="checkbox" name={`active_${option.id}`} defaultChecked={option.active} />
                  Option active
                </label>
                {option.id.startsWith("custom-") ? (
                  <div className="flex items-center justify-between gap-2 md:col-span-2">
                    <p className="text-xs font-semibold text-foreground/70">Custom option</p>
                    <button
                      type="submit"
                      name="optionId"
                      value={option.id}
                      formAction={deleteUploadTransferOption}
                      className="rounded-lg border border-rose/35 px-3 py-1.5 text-xs font-semibold text-rose hover:bg-rose/10"
                    >
                      Delete option
                    </button>
                  </div>
                ) : null}
              </div>
            </article>
          ))}
          <div>
            <button type="submit" className="rounded-xl bg-forest px-4 py-2 text-sm font-semibold text-white">
              Save Transfer Pricing
            </button>
          </div>
        </form>
      </AdminDropdownSection>

      <AdminDropdownSection
        persistKey="best-sellers"
        title="Best Sellers (Internal Tracking)"
        description="Top sellers based on paid cart orders recorded in your inventory movement logs."
      >
        {bestSellerRows.length === 0 ? (
          <p className="rounded-2xl border border-rose/20 bg-white/75 px-4 py-6 text-sm text-foreground/75">
            No paid cart sales recorded yet. As paid orders come in, this list will populate automatically.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-rose/20 bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-surface">
                <tr>
                  <th className="px-4 py-3 font-semibold text-forest">Product</th>
                  <th className="px-4 py-3 font-semibold text-forest">SKU</th>
                  <th className="px-4 py-3 font-semibold text-forest">Units Sold</th>
                  <th className="px-4 py-3 font-semibold text-forest">Paid Orders</th>
                </tr>
              </thead>
              <tbody>
                {bestSellerRows.map((row) => (
                  <tr key={row.productId} className="border-t border-rose/15">
                    <td className="px-4 py-3">{row.title}</td>
                    <td className="px-4 py-3">{row.sku}</td>
                    <td className="px-4 py-3 font-semibold text-forest">{row.unitsSold}</td>
                    <td className="px-4 py-3">{row.orderCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminDropdownSection>

      <AdminDropdownSection
        persistKey="funnel-analytics"
        title="Funnel Analytics (Last 30 Days)"
        description="Basic storefront funnel counts for product views, add-to-cart, checkout starts, and paid orders."
      >
        <div className="grid gap-3 md:grid-cols-4">
          <article className="rounded-2xl border border-rose/20 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">View Product</p>
            <p className="mt-1 text-2xl font-bold text-forest">{funnelSummary.counts.view_product}</p>
          </article>
          <article className="rounded-2xl border border-rose/20 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">Add to Cart</p>
            <p className="mt-1 text-2xl font-bold text-forest">{funnelSummary.counts.add_to_cart}</p>
            <p className="mt-1 text-xs text-foreground/70">
              {funnelSummary.addRate} from views
            </p>
          </article>
          <article className="rounded-2xl border border-rose/20 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">Start Checkout</p>
            <p className="mt-1 text-2xl font-bold text-forest">{funnelSummary.counts.start_checkout}</p>
            <p className="mt-1 text-xs text-foreground/70">
              {funnelSummary.checkoutRate} from add-to-cart
            </p>
          </article>
          <article className="rounded-2xl border border-rose/20 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">Paid</p>
            <p className="mt-1 text-2xl font-bold text-forest">{funnelSummary.counts.paid}</p>
            <p className="mt-1 text-xs text-foreground/70">
              {funnelSummary.paidRate} from checkout starts
            </p>
          </article>
        </div>
      </AdminDropdownSection>

      <AdminDropdownSection
        persistKey="categories"
        title="Categories"
        description="Keep this compact by editing categories in dropdown rows."
      >
        <details
          id="category-create"
          data-admin-key="category-create"
          className="mt-4 rounded-xl border border-rose/20 bg-surface/70 p-3"
        >
          <summary className="cursor-pointer list-none text-sm font-semibold text-forest">
            Add Category
          </summary>
          <form action={createCategory} className="mt-3 grid gap-3 md:grid-cols-2">
            <input type="hidden" name="redirectTo" value="/admin#category-create" />
            <label className="space-y-1"><span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">Name</span><input name="name" className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm" /></label>
            <label className="space-y-1"><span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">Sort Order</span><input name="sortOrder" type="number" defaultValue={100} className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm" /></label>
            <AdminImageUploadField
              name="imageUrl"
              className="md:col-span-2"
              recommendedSize="1200 x 800 px"
              helperText="Optional category image. This image URL is stored on the category record."
            />
            <label className="inline-flex items-center gap-2 text-sm font-semibold"><input type="checkbox" name="active" defaultChecked /> Active</label>
            <div className="md:col-span-2"><button type="submit" className="rounded-xl bg-forest px-4 py-2 text-sm font-semibold text-white">Add Category</button></div>
          </form>
        </details>

        <div className="mt-3 space-y-2">
          {categories.map((category) => (
            <details
              key={category.id}
              id={`category-${category.id}`}
              data-admin-key={`category-${category.id}`}
              className="rounded-xl border border-rose/20 bg-white/95 p-3"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-forest">{category.name}</p>
                  <p className="text-xs text-foreground/70">/{category.slug} | Sort {category.sort_order}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${category.active ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-600"}`}>
                  {category.active ? "Active" : "Hidden"}
                </span>
              </summary>

              <form action={updateCategory} className="mt-3 grid gap-3 md:grid-cols-2">
                <input type="hidden" name="categoryId" value={category.id} />
                <input type="hidden" name="redirectTo" value={`/admin#category-${category.id}`} />
                <label className="space-y-1"><span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">Name</span><input name="name" defaultValue={category.name} className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm" /></label>
                <label className="space-y-1"><span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">Slug</span><input name="slug" defaultValue={category.slug} className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm" /></label>
                <label className="space-y-1"><span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">Sort Order</span><input name="sortOrder" type="number" defaultValue={category.sort_order} className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm" /></label>
                <label className="inline-flex items-center gap-2 text-sm font-semibold md:mt-7"><input type="checkbox" name="active" defaultChecked={category.active} /> Active</label>
                <AdminImageUploadField
                  name="imageUrl"
                  defaultValue={category.image_url ?? ""}
                  className="md:col-span-2"
                  recommendedSize="1200 x 800 px"
                  helperText="Optional category image. Upload a new one to replace the current URL."
                />
                <div className="md:col-span-2">
                  <button type="submit" className="rounded-xl bg-rose px-4 py-2 text-sm font-semibold text-white">
                    Save Category
                  </button>
                </div>
              </form>

              <form action={deleteCategory} className="mt-2">
                <input type="hidden" name="categoryId" value={category.id} />
                <input type="hidden" name="redirectTo" value={`/admin#category-${category.id}`} />
                <AdminConfirmSubmitButton
                  buttonLabel="Delete Category (Keep Items)"
                  confirmMessage="Are you sure you'd like to delete this category? Items will be kept and moved to Uncategorized."
                  idleClassName="rounded-xl border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                />
              </form>
            </details>
          ))}
        </div>
      </AdminDropdownSection>

      <AdminDropdownSection
        id="product-inventory"
        persistKey="product-inventory"
        title="Product Inventory"
        description="Product cards are collapsed by default to keep the backend concise and scannable."
      >
        <details
          id="product-create"
          data-admin-key="product-create"
          className="mt-4 rounded-xl border border-rose/20 bg-surface/70 p-3"
        >
          <summary className="cursor-pointer list-none text-sm font-semibold text-forest">
            Add New Product Card
          </summary>
          <form action={createProduct} className="mt-3 grid gap-3 md:grid-cols-2">
            <input type="hidden" name="redirectTo" value="/admin#product-create" />
            <label className="space-y-1"><span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">Title</span><input name="title" required className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm" /></label>
            <label className="space-y-1"><span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">Category</span><select name="categoryId" required className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm">{categories.map((category) => (<option key={category.id} value={category.id}>{category.name}</option>))}</select></label>
            <label className="space-y-1"><span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">SKU (optional override)</span><input name="sku" placeholder="Leave blank to auto-generate from category" className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm" /></label>
            <label className="space-y-1 md:col-span-2"><span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">Description</span><textarea name="description" required rows={2} className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm" /></label>
            <AdminImageUploadField
              name="imageUrl"
              defaultValue="/assets/img/product-tee.svg"
              className="md:col-span-2"
              recommendedSize="1200 x 1200 px"
              helperText="Drag and drop a product image, or click Choose Image to upload."
            />
            <label className="space-y-1"><span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">Price (USD)</span><input name="priceCents" required type="number" min={0.01} step={0.01} defaultValue="25.00" className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm" /></label>
            <label className="space-y-1"><span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">Stock</span><input name="stockOnHand" required type="number" defaultValue={25} className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm" /></label>
            <label className="space-y-1"><span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">Sale Percent Off</span><input name="salePercentOff" type="number" min={0} max={90} defaultValue={0} className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm" /></label>
            <label className="space-y-1"><span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">Sale Label</span><input name="saleLabel" required defaultValue="Sale" className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm" /></label>
            <label className="space-y-1 md:col-span-2"><span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">Cart Button Text</span><input name="cartCtaText" required defaultValue="Add to Cart" className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm" /></label>
            <div className="flex flex-wrap gap-4 md:col-span-2">
              <label className="inline-flex items-center gap-2 text-sm font-semibold"><input type="checkbox" name="isFeatured" /> Featured</label>
              <label className="inline-flex items-center gap-2 text-sm font-semibold"><input type="checkbox" name="isHot" /> Hot Item</label>
              <label className="inline-flex items-center gap-2 text-sm font-semibold"><input type="checkbox" name="saleEnabled" /> Sale On</label>
              <label className="inline-flex items-center gap-2 text-sm font-semibold"><input type="checkbox" name="active" defaultChecked /> Active</label>
            </div>
            <div className="md:col-span-2"><button type="submit" className="rounded-xl bg-forest px-4 py-2 text-sm font-semibold text-white">Add Product</button></div>
          </form>
        </details>

        <div className="mt-3 space-y-2">
          {inventoryGroups.map((group) => (
            <details
              key={group.id}
              id={`inventory-group-${group.id}`}
              data-admin-key={`inventory-group-${group.id}`}
              className="rounded-xl border border-rose/20 bg-white/95 p-3"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-forest">{group.label}</p>
                  <p className="text-xs text-foreground/70">
                    {group.items.length} item{group.items.length === 1 ? "" : "s"}
                  </p>
                </div>
                <span className="rounded-full bg-rose/10 px-2 py-0.5 text-[11px] font-semibold text-rose-900">
                  &#9662;
                </span>
              </summary>

              {group.items.length === 0 ? (
                <p className="mt-3 rounded-xl border border-dashed border-rose/30 bg-rose/5 px-3 py-2 text-sm text-foreground/75">
                  No products in this category yet.
                </p>
              ) : (
                <div className="mt-3 space-y-2">
                  {group.items.map((product) => {
                    const productVariantsForProduct = variantsByProductId.get(product.id) ?? [];

                    return (
                      <details
                        key={product.id}
                        id={`product-${product.id}`}
                        data-admin-key={`product-${product.id}`}
                        className="rounded-xl border border-rose/20 bg-white p-3"
                      >
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-forest">{product.title}</p>
                            <p className="text-xs text-foreground/70">
                              {formatUsd(product.price_cents)} | Stock {product.stock_on_hand}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-1 text-[11px] font-semibold">
                            <span className={`rounded-full px-2 py-0.5 ${product.active ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-600"}`}>
                              {product.active ? "Active" : "Hidden"}
                            </span>
                            {product.is_featured ? <span className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-700">Featured</span> : null}
                            {product.is_hot ? <span className="rounded-full bg-rose-50 px-2 py-0.5 text-rose-700">Hot</span> : null}
                          </div>
                        </summary>

                        <div className="mt-2 flex justify-end">
                          <ShareProductButton
                            path={`/shop/${product.slug}`}
                            title={product.title}
                            label="Share Item Link"
                            className="rounded-xl border border-forest/20 bg-white px-3 py-1.5 text-xs font-semibold text-forest hover:bg-forest hover:text-white"
                          />
                        </div>

                        <form action={updateProductCard} className="mt-3 grid gap-3 md:grid-cols-2">
                          <input type="hidden" name="productId" value={product.id} />
                          <input type="hidden" name="redirectTo" value={`/admin#product-${product.id}`} />
                          <label className="space-y-1"><span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">Title</span><input name="title" defaultValue={product.title} className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm" /></label>
                          <label className="space-y-1"><span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">Category</span><select name="categoryId" defaultValue={product.category_id} className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm">{categories.map((category) => (<option key={category.id} value={category.id}>{category.name}</option>))}</select></label>
                          <label className="space-y-1"><span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">SKU</span><input name="sku" defaultValue={product.sku} className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm" /></label>
                          <label className="space-y-1"><span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">Slug</span><input name="slug" defaultValue={product.slug} className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm" /></label>
                          <label className="space-y-1 md:col-span-2"><span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">Description</span><textarea name="description" rows={2} defaultValue={product.description} className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm" /></label>
                          <AdminImageUploadField
                            name="imageUrl"
                            defaultValue={product.image_url ?? ""}
                            className="md:col-span-2"
                            recommendedSize="1200 x 1200 px"
                            helperText="Drop a replacement image here or upload one, then save this card."
                          />
                          <label className="space-y-1"><span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">Price (USD)</span><input name="priceCents" type="number" min={0.01} step={0.01} defaultValue={formatUsdInput(product.price_cents)} className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm" /></label>
                          <label className="space-y-1"><span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">Stock</span><input name="stockOnHand" type="number" defaultValue={product.stock_on_hand} className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm" /></label>
                          <p className="md:col-span-2 text-[11px] text-foreground/70">
                            Note: Variant price overrides can override base product price on storefront.
                          </p>
                          <label className="space-y-1"><span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">Sale Percent Off</span><input name="salePercentOff" type="number" min={0} max={90} defaultValue={product.sale_percent_off} className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm" /></label>
                          <label className="space-y-1"><span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">Sale Label</span><input name="saleLabel" defaultValue={product.sale_label} className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm" /></label>
                          <label className="space-y-1 md:col-span-2"><span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">Cart Button Text</span><input name="cartCtaText" defaultValue={product.cart_cta_text} className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm" /></label>
                          <div className="flex flex-wrap gap-4 md:col-span-2">
                            <label className="inline-flex items-center gap-2 text-sm font-semibold"><input type="checkbox" name="isFeatured" defaultChecked={product.is_featured} /> Featured</label>
                            <label className="inline-flex items-center gap-2 text-sm font-semibold"><input type="checkbox" name="isHot" defaultChecked={product.is_hot} /> Hot Item</label>
                            <label className="inline-flex items-center gap-2 text-sm font-semibold"><input type="checkbox" name="saleEnabled" defaultChecked={product.sale_enabled} /> Sale On</label>
                            <label className="inline-flex items-center gap-2 text-sm font-semibold"><input type="checkbox" name="active" defaultChecked={product.active} /> Active</label>
                          </div>
                          <div className="md:col-span-2 flex items-center justify-between">
                            <p className="text-xs text-foreground/70">Price preview: <span className="font-semibold text-forest">{formatUsd(product.price_cents)}</span></p>
                            <button type="submit" className="rounded-xl bg-forest px-4 py-2 text-sm font-semibold text-white">Save Product</button>
                          </div>
                        </form>

                        <div className="mt-3 rounded-xl border border-rose/20 bg-surface/60 p-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">
                            Variant Inventory (Size/Color)
                          </p>
                          <p className="mt-1 text-xs text-foreground/75">
                            Add and maintain stock by size/color here. If variants exist, checkout uses variant stock.
                          </p>

                          <form action={createProductVariant} className="mt-3 grid gap-2 md:grid-cols-3">
                            <input type="hidden" name="productId" value={product.id} />
                            <input type="hidden" name="redirectTo" value={`/admin#product-${product.id}`} />
                            <label className="space-y-1">
                              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gold">Size</span>
                              <input name="sizeValue" placeholder="S, M, L" className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm" />
                            </label>
                            <label className="space-y-1">
                              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gold">Color</span>
                              <input name="colorValue" placeholder="Black, Red" className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm" />
                            </label>
                            <label className="space-y-1">
                              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gold">Variant SKU</span>
                              <input name="sku" placeholder="WR-TSHIRT-BLK-M" className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm" />
                            </label>
                            <label className="space-y-1">
                              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gold">Price Override (USD)</span>
                              <input name="priceOverrideCents" type="number" min={0.01} step={0.01} placeholder="Optional (e.g. 22.00)" className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm" />
                            </label>
                            <label className="space-y-1">
                              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gold">Stock</span>
                              <input name="stockOnHand" type="number" min={0} defaultValue={0} className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm" />
                            </label>
                            <label className="inline-flex items-center gap-2 text-sm font-semibold md:mt-7">
                              <input type="checkbox" name="active" defaultChecked />
                              Active
                            </label>
                            <div className="md:col-span-3">
                              <button type="submit" className="rounded-xl bg-forest px-3 py-2 text-xs font-semibold text-white">
                                Add Variant
                              </button>
                            </div>
                          </form>

                          {productVariantsForProduct.length === 0 ? (
                            <p className="mt-3 rounded-xl border border-dashed border-rose/30 bg-white/80 px-3 py-2 text-xs text-foreground/75">
                              No variants yet for this product.
                            </p>
                          ) : (
                            <div className="mt-3 space-y-2">
                              {productVariantsForProduct.map((variant) => (
                                <article key={variant.id} className="rounded-xl border border-rose/15 bg-white p-3">
                                  <p className="text-xs font-semibold text-forest">
                                    {formatVariantLabel(variant)}
                                  </p>
                                  <form action={updateProductVariant} className="mt-2 grid gap-2 md:grid-cols-3">
                                    <input type="hidden" name="variantId" value={variant.id} />
                                    <input type="hidden" name="productId" value={product.id} />
                                    <input type="hidden" name="redirectTo" value={`/admin#product-${product.id}`} />
                                    <label className="space-y-1">
                                      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gold">Size</span>
                                      <input name="sizeValue" defaultValue={variant.size_value ?? ""} className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm" />
                                    </label>
                                    <label className="space-y-1">
                                      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gold">Color</span>
                                      <input name="colorValue" defaultValue={variant.color_value ?? ""} className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm" />
                                    </label>
                                    <label className="space-y-1">
                                      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gold">Variant SKU</span>
                                      <input name="sku" defaultValue={variant.sku ?? ""} className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm" />
                                    </label>
                                    <label className="space-y-1">
                                      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gold">Price Override (USD)</span>
                                      <input name="priceOverrideCents" type="number" min={0.01} step={0.01} defaultValue={variant.price_override_cents != null ? formatUsdInput(variant.price_override_cents) : ""} className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm" />
                                    </label>
                                    <label className="space-y-1">
                                      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gold">Stock</span>
                                      <input name="stockOnHand" type="number" min={0} defaultValue={variant.stock_on_hand} className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm" />
                                    </label>
                                    <label className="inline-flex items-center gap-2 text-sm font-semibold md:mt-7">
                                      <input type="checkbox" name="active" defaultChecked={variant.active} />
                                      Active
                                    </label>
                                    <div className="md:col-span-3">
                                      <button type="submit" className="rounded-xl bg-forest px-3 py-2 text-xs font-semibold text-white">
                                        Save Variant
                                      </button>
                                    </div>
                                  </form>
                                  <form action={deleteProductVariant} className="mt-2">
                                    <input type="hidden" name="variantId" value={variant.id} />
                                    <input type="hidden" name="redirectTo" value={`/admin#product-${product.id}`} />
                                    <AdminConfirmSubmitButton
                                      buttonLabel="Delete Variant"
                                      confirmMessage="Are you sure you'd like to delete this variant?"
                                      idleClassName="rounded-xl border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                                    />
                                  </form>
                                </article>
                              ))}
                            </div>
                          )}
                        </div>

                        <form action={deleteProductCard} className="mt-2 flex justify-end">
                          <input type="hidden" name="productId" value={product.id} />
                          <input type="hidden" name="redirectTo" value={`/admin#inventory-group-${group.id}`} />
                          <AdminConfirmSubmitButton
                            buttonLabel="Delete Product"
                            confirmMessage="Are you sure you'd like to delete this item?"
                            idleClassName="rounded-xl border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                          />
                        </form>
                      </details>
                    );
                  })}
                </div>
              )}
            </details>
          ))}
        </div>
      </AdminDropdownSection>

      <section id="customer-messages" className="mt-8 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl text-forest">Customer Messages</h2>
          <p className="text-xs text-foreground/70">{messages.length} total</p>
        </div>
        {messages.length === 0 ? (
          <p className="rounded-2xl border border-rose/20 bg-white/75 px-4 py-6 text-sm">No messages yet.</p>
        ) : null}
        <div className="space-y-2">
          {messages.map((message) => (
            <details
              key={message.id}
              id={`message-${message.id}`}
              data-admin-key={`message-${message.id}`}
              className="rounded-2xl border border-rose/20 bg-white/85 p-4 shadow-sm"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-forest">{message.subject}</p>
                  <p className="text-xs text-foreground/70">
                    {message.name} ({message.email}) • {formatDateTime(message.created_at)}
                  </p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${messageStatusBadgeClass(message.status)}`}>
                  {message.status}
                </span>
              </summary>

              <div className="mt-3 space-y-2 text-sm">
                <p className="rounded-xl bg-surface p-3 text-foreground/85">{message.message}</p>
              </div>
              <form action={updateContactMessage} className="mt-3 grid gap-2 md:grid-cols-[220px_1fr_auto]">
                <input type="hidden" name="messageId" value={message.id} />
                <input type="hidden" name="redirectTo" value={`${orderViewBasePath}#message-${message.id}`} />
                <select
                  name="status"
                  title="Message status"
                  aria-label="Message status"
                  defaultValue={message.status}
                  className="rounded-xl border border-rose/30 bg-white px-3 py-2 text-sm"
                >
                  {CONTACT_STATUS_VALUES.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <input
                  name="notes"
                  defaultValue={message.notes ?? ""}
                  placeholder="Internal notes"
                  className="rounded-xl border border-rose/30 bg-white px-3 py-2 text-sm"
                />
                <button type="submit" className="rounded-xl bg-rose px-3 py-2 text-sm font-semibold text-white">Save</button>
              </form>
            </details>
          ))}
        </div>
      </section>

      <section id="orders-uploads" className="mt-8 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl text-forest">Orders and Uploads</h2>
            <p className="text-xs text-foreground/70">
              {orders.length} shown ({orderView})
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <Link
              href={ordersViewHref("active")}
              className={`rounded-xl border px-3 py-1.5 ${
                orderView === "active"
                  ? "border-forest bg-forest text-white"
                  : "border-forest/20 bg-white text-forest"
              }`}
            >
              Active
            </Link>
            <Link
              href={ordersViewHref("archived")}
              className={`rounded-xl border px-3 py-1.5 ${
                orderView === "archived"
                  ? "border-forest bg-forest text-white"
                  : "border-forest/20 bg-white text-forest"
              }`}
            >
              Archived
            </Link>
            <Link
              href={ordersViewHref("all")}
              className={`rounded-xl border px-3 py-1.5 ${
                orderView === "all"
                  ? "border-forest bg-forest text-white"
                  : "border-forest/20 bg-white text-forest"
              }`}
            >
              All
            </Link>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <form action={archiveResolvedOrders}>
            <input type="hidden" name="redirectTo" value={`${orderViewBasePath}#orders-uploads`} />
            <AdminConfirmSubmitButton
              buttonLabel="Archive Completed/Cancelled"
              confirmMessage="Archive all completed and cancelled orders from the active list?"
              idleClassName="rounded-xl border border-forest/30 bg-white px-3 py-1.5 text-xs font-semibold text-forest hover:bg-surface"
            />
          </form>
          <form action={clearArchivedOrders}>
            <input type="hidden" name="redirectTo" value={`${orderViewBasePath}#orders-uploads`} />
            <AdminConfirmSubmitButton
              buttonLabel="Clear Archived Orders"
              confirmMessage="Permanently delete archived completed/cancelled orders? This cannot be undone."
              idleClassName="rounded-xl border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
            />
          </form>
        </div>
        {orders.length === 0 ? (
          <p className="rounded-2xl border border-rose/20 bg-white/75 px-4 py-6 text-sm">
            No orders in this view yet.
          </p>
        ) : null}
        <div className="space-y-2">
          {orders.map((order) => (
            <details
              key={order.id}
              id={`order-${order.id}`}
              data-admin-key={`order-${order.id}`}
              className="rounded-2xl border border-rose/20 bg-white/85 p-4 shadow-sm"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-forest">
                    {order.customer_name} • {formatUsd(order.amount_cents)}
                  </p>
                  <p className="text-xs text-foreground/70">
                    {order.customer_email} • {formatDateTime(order.created_at)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${orderStatusBadgeClass(order.status)}`}>
                    {order.status}
                  </span>
                  {order.archived_at ? (
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold text-zinc-700">
                      archived
                    </span>
                  ) : null}
                </div>
              </summary>

              <div className="mt-3 grid gap-4 md:grid-cols-[1fr_auto] md:items-start">
                <div className="space-y-2 text-sm">
                  <p><span className="font-semibold">Phone:</span> {order.customer_phone ?? "N/A"}</p>
                  <p><span className="font-semibold">Option:</span> {order.product_option}</p>
                  <p><span className="font-semibold">Qty:</span> {order.quantity}</p>
                  <p><span className="font-semibold">File:</span> {order.design_path}</p>
                  <p><span className="font-semibold">Placed:</span> {formatDateTime(order.created_at)}</p>
                  <p><span className="font-semibold">Paid:</span> {formatDateTime(order.paid_at)}</p>
                  {order.archived_at ? (
                    <p>
                      <span className="font-semibold">Archived:</span> {formatDateTime(order.archived_at)}
                    </p>
                  ) : null}
                  {order.notes ? (<p><span className="font-semibold">Notes:</span> {order.notes}</p>) : null}
                </div>
                <div className="space-y-3 md:text-right">
                  {order.fileLink ? (
                    <a href={order.fileLink} target="_blank" rel="noreferrer" className="inline-flex rounded-xl border border-forest/25 px-3 py-2 text-xs font-semibold text-forest hover:bg-forest hover:text-white">Download Upload</a>
                  ) : (<p className="text-xs text-red-700">Upload link unavailable</p>)}
                  <form action={updateOrderStatus} className="flex gap-2 md:justify-end">
                    <input type="hidden" name="orderId" value={order.id} />
                    <input type="hidden" name="redirectTo" value={orderRedirectTo(order.id)} />
                    <select
                      name="status"
                      title="Order status"
                      aria-label="Order status"
                      defaultValue={order.status}
                      className="rounded-xl border border-rose/30 bg-white px-3 py-2 text-xs"
                    >
                      {ORDER_STATUS_VALUES.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                    <button type="submit" className="rounded-xl bg-rose px-3 py-2 text-xs font-semibold text-white">Save</button>
                  </form>
                  {order.archived_at ? (
                    <form action={unarchiveOrder} className="md:ml-auto md:w-fit">
                      <input type="hidden" name="orderId" value={order.id} />
                      <input type="hidden" name="redirectTo" value={orderRedirectTo(order.id)} />
                      <button
                        type="submit"
                        className="rounded-xl border border-forest/30 bg-white px-3 py-2 text-xs font-semibold text-forest hover:bg-surface"
                      >
                        Unarchive
                      </button>
                    </form>
                  ) : isArchivableOrderStatus(order.status) ? (
                    <form action={archiveOrder} className="md:ml-auto md:w-fit">
                      <input type="hidden" name="orderId" value={order.id} />
                      <input type="hidden" name="redirectTo" value={orderRedirectTo(order.id)} />
                      <AdminConfirmSubmitButton
                        buttonLabel="Archive Order"
                        confirmMessage="Archive this completed/cancelled order?"
                        idleClassName="rounded-xl border border-forest/30 bg-white px-3 py-2 text-xs font-semibold text-forest hover:bg-surface"
                      />
                    </form>
                  ) : null}
                </div>
              </div>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
