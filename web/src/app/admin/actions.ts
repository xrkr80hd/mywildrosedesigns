"use server";

import { appendFulfillmentNote } from "@/lib/fulfillment-notes";
import { recordSaleMovementsForOrder } from "@/lib/order-sales";
import { ORDER_STATUS_VALUES } from "@/lib/order-status";
import { DEFAULT_PRODUCT_OPTIONS } from "@/lib/product-options";
import { getSizeSortOrder } from "@/lib/product-variants";
import { isSiteSettingTitle, saveSiteContentValues } from "@/lib/site-content";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const CONTACT_STATUS_VALUES = ["new", "in_progress", "resolved"] as const;
const ARCHIVABLE_ORDER_STATUSES = [
  "fulfilled",
  "completed",
  "cancelled",
] as const;

const updateStatusSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum(ORDER_STATUS_VALUES),
  fulfillmentNote: z.string().trim().max(500).optional(),
});

const orderArchiveSchema = z.object({
  orderId: z.string().uuid(),
});

const homepageSchema = z.object({
  heroBadge: z.string().trim().min(2).max(90),
  heroTitle: z.string().trim().min(2).max(120),
  heroDescription: z.string().trim().min(20).max(400),
  primaryCtaLabel: z.string().trim().min(2).max(40),
  primaryCtaHref: z.string().trim().min(1).max(255),
  secondaryCtaLabel: z.string().trim().min(2).max(40),
  secondaryCtaHref: z.string().trim().min(1).max(255),
});

const aboutPageSchema = z.object({
  aboutBadge: z.string().trim().min(2).max(90),
  aboutTitle: z.string().trim().min(2).max(120),
  aboutIntro: z.string().trim().min(20).max(500),
  serviceOneTitle: z.string().trim().min(2).max(120),
  serviceOneDetail: z.string().trim().min(2).max(300),
  serviceTwoTitle: z.string().trim().min(2).max(120),
  serviceTwoDetail: z.string().trim().min(2).max(300),
  serviceThreeTitle: z.string().trim().min(2).max(120),
  serviceThreeDetail: z.string().trim().min(2).max(300),
  serviceFourTitle: z.string().trim().min(2).max(120),
  serviceFourDetail: z.string().trim().min(2).max(300),
  ctaTitle: z.string().trim().min(2).max(120),
  ctaDescription: z.string().trim().min(2).max(300),
  primaryCtaLabel: z.string().trim().min(2).max(60),
  primaryCtaHref: z.string().trim().min(1).max(255),
  secondaryCtaLabel: z.string().trim().min(2).max(60),
  secondaryCtaHref: z.string().trim().min(1).max(255),
});

const contactPageSchema = z.object({
  contactBadge: z.string().trim().min(2).max(90),
  contactTitle: z.string().trim().min(2).max(120),
  contactIntro: z.string().trim().min(10).max(500),
  contactEmail: z.string().trim().min(3).max(160),
  contactPhone: z.string().trim().max(80),
  contactAddress: z.string().trim().min(3).max(240),
  printLabelThankYouNote: z.string().trim().min(2).max(500),
  hoursTitle: z.string().trim().min(2).max(120),
  hoursWeekday: z.string().trim().min(2).max(120),
  hoursSaturday: z.string().trim().min(2).max(120),
  hoursSunday: z.string().trim().min(2).max(120),
});

const createCategorySchema = z.object({
  name: z.string().trim().min(2).max(100),
  sortOrder: z.coerce.number().int().min(0).max(10_000),
  imageUrl: z.string().trim().max(2048).optional(),
  active: z.boolean(),
});

const updateCategorySchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().trim().min(2).max(100),
  slug: z.string().trim().max(100).optional(),
  sortOrder: z.coerce.number().int().min(0).max(10_000),
  imageUrl: z.string().trim().max(2048).optional(),
  active: z.boolean(),
});

function parseCurrencyToCents(value: unknown): number | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  const text = String(value).trim();
  if (!text) {
    return undefined;
  }

  const normalized = text.replace(/[$,\s]/g, "");
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) {
    return Number.NaN;
  }

  return Math.round(parsed * 100);
}

const currencyCentsSchema = z.preprocess(
  (value) => parseCurrencyToCents(value),
  z.number().int().min(1).max(1_000_000),
);

const uploadOptionAmountCentsSchema = z.preprocess(
  (value) => parseCurrencyToCents(value),
  z.number().int().min(100).max(500_000),
);

const createProductSchema = z.object({
  title: z.string().trim().min(2).max(180),
  sku: z.string().trim().max(40).optional(),
  description: z.string().trim().max(2000),
  categoryId: z.string().uuid(),
  imageUrl: z.string().trim().max(2048).optional(),
  priceCents: currencyCentsSchema,
  stockOnHand: z.coerce.number().int().min(0).max(1_000_000),
  isFeatured: z.boolean(),
  isHot: z.boolean(),
  saleEnabled: z.boolean(),
  salePercentOff: z.coerce.number().int().min(0).max(90),
  saleLabel: z.string().trim().min(1).max(40),
  cartCtaText: z.string().trim().min(1).max(60),
  active: z.boolean(),
});

const createBundleProductSchema = z.object({
  title: z.string().trim().min(2).max(180),
  sku: z.string().trim().max(40).optional(),
  description: z.string().trim().max(2000),
  imageUrl: z.string().trim().max(2048).optional(),
  priceCents: currencyCentsSchema,
  stockOnHand: z.coerce.number().int().min(0).max(1_000_000),
  isFeatured: z.boolean(),
  isHot: z.boolean(),
  saleEnabled: z.boolean(),
  salePercentOff: z.coerce.number().int().min(0).max(90),
  saleLabel: z.string().trim().min(1).max(40),
  cartCtaText: z.string().trim().min(1).max(60),
  active: z.boolean(),
});

const bundleComponentInputSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional(),
  quantity: z.number().int().min(1).max(100),
});

const updateProductSchema = z.object({
  productId: z.string().uuid(),
  title: z.string().trim().min(2).max(180),
  sku: z.string().trim().max(40).optional(),
  slug: z.string().trim().max(255).optional(),
  description: z.string().trim().max(2000),
  categoryId: z.string().uuid(),
  imageUrl: z.string().trim().max(2048).optional(),
  priceCents: currencyCentsSchema,
  stockOnHand: z.coerce.number().int().min(0).max(1_000_000),
  isFeatured: z.boolean(),
  isHot: z.boolean(),
  saleEnabled: z.boolean(),
  salePercentOff: z.coerce.number().int().min(0).max(90),
  saleLabel: z.string().trim().min(1).max(40),
  cartCtaText: z.string().trim().min(1).max(60),
  active: z.boolean(),
});

const createWelcomePostSchema = z.object({
  title: z.string().trim().min(2).max(120),
  body: z.string().trim().min(2).max(1000),
  ctaLabel: z.string().trim().max(60).optional(),
  ctaHref: z.string().trim().max(255).optional(),
  sortOrder: z.coerce.number().int().min(0).max(10_000),
  active: z.boolean(),
});

const updateWelcomePostSchema = createWelcomePostSchema.extend({
  postId: z.string().uuid(),
});

const deleteWelcomePostSchema = z.object({
  postId: z.string().uuid(),
});

const deleteProductSchema = z.object({
  productId: z.string().uuid(),
});

const deleteCategorySchema = z.object({
  categoryId: z.string().uuid(),
});

const optionalPriceOverrideSchema = z.preprocess(
  (value) => parseCurrencyToCents(value),
  z.number().int().min(1).max(1_000_000).optional(),
);

const createProductVariantSchema = z.object({
  productId: z.string().uuid(),
  sizeValue: z.string().trim().max(40).optional(),
  colorValue: z.string().trim().max(60).optional(),
  brandName: z.string().trim().max(120).optional(),
  sku: z.string().trim().max(80).optional(),
  priceOverrideCents: optionalPriceOverrideSchema,
  stockOnHand: z.coerce.number().int().min(0).max(1_000_000),
  active: z.boolean(),
});

const updateProductVariantSchema = createProductVariantSchema.extend({
  variantId: z.string().uuid(),
});

const deleteProductVariantSchema = z.object({
  variantId: z.string().uuid(),
});

const createVariantTemplateSchema = z.object({
  name: z.string().trim().min(2).max(140),
  brandName: z.string().trim().min(2).max(120),
  active: z.boolean(),
});

const applyVariantTemplateSchema = z.object({
  productId: z.string().uuid(),
  templateId: z.string().uuid(),
  colorValue: z.string().trim().min(1).max(60),
  stockOnHand: z.coerce.number().int().min(0).max(1_000_000),
  sizeLabels: z.array(z.string().trim().min(1).max(40)).min(1),
});

const initialProductTemplateSchema = z.object({
  templateId: z.string().uuid(),
  colorValue: z.string().trim().min(1).max(60),
  stockOnHand: z.coerce.number().int().min(0).max(1_000_000),
  sizeLabels: z.array(z.string().trim().min(1).max(40)).min(1),
});

const POPUP_CTA_MODE_VALUES = ["slug", "inventory"] as const;

const popupSchema = z.object({
  enabled: z.boolean(),
  showCta: z.boolean(),
  promoLabel: z.string().trim().max(60).optional(),
  title: z.string().trim().max(120).optional(),
  message: z.string().trim().max(300).optional(),
  ctaText: z.string().trim().max(60).optional(),
  popupCtaMode: z.enum(POPUP_CTA_MODE_VALUES).optional(),
  ctaSlug: z.string().trim().max(255).optional(),
  ctaHref: z.string().trim().max(500).optional(),
  productId: z.string().uuid().optional(),
});

const updateMessageSchema = z.object({
  messageId: z.string().uuid(),
  status: z.enum(CONTACT_STATUS_VALUES),
  notes: z.string().trim().max(1000).optional(),
});

const transferOptionIdSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9-]{2,80}$/);

const uploadProductOptionSchema = z.object({
  id: transferOptionIdSchema,
  sortOrder: z.coerce.number().int().min(0).max(100_000),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().min(2).max(300),
  amountCents: uploadOptionAmountCentsSchema,
  active: z.boolean(),
});

const createUploadProductOptionSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().min(2).max(300),
  amountCents: uploadOptionAmountCentsSchema,
  sortOrder: z.coerce.number().int().min(0).max(100_000),
  active: z.boolean(),
});

const deleteUploadProductOptionSchema = z.object({
  optionId: transferOptionIdSchema,
});

const DEFAULT_TRANSFER_OPTION_IDS = new Set(
  DEFAULT_PRODUCT_OPTIONS.map((option) => option.id),
);

function asBool(formData: FormData, key: string): boolean {
  return formData.get(key) === "on";
}

function nullableText(value: FormDataEntryValue | null): string | null {
  const text = String(value ?? "").trim();
  return text ? text : null;
}

function normalizePopupHref(value: string | undefined): string {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) {
    return "/shop";
  }

  if (/^(https?:\/\/|mailto:|tel:)/i.test(trimmed)) {
    return trimmed;
  }

  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

function normalizePopupSlug(value: string | undefined): string | null {
  const raw = String(value ?? "").trim().toLowerCase();
  if (!raw) {
    return null;
  }

  const withoutQuery = raw.split("?")[0] ?? "";
  const withoutHash = withoutQuery.split("#")[0] ?? "";
  const withoutPrefix = withoutHash.replace(/^\/+/, "").replace(/^shop\//, "");
  const compact = withoutPrefix
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return compact || null;
}

async function resolvePopupProductTarget(input: {
  productId?: string;
  slug?: string | null;
}): Promise<{ id: string; slug: string } | null> {
  const supabase = getSupabaseAdminClient();

  if (input.productId) {
    const byIdResult = await supabase
      .from("products")
      .select("id, slug")
      .eq("id", input.productId)
      .maybeSingle();
    if (!byIdResult.error && byIdResult.data?.id && byIdResult.data.slug) {
      return {
        id: byIdResult.data.id,
        slug: String(byIdResult.data.slug),
      };
    }
  }

  if (input.slug) {
    const bySlugResult = await supabase
      .from("products")
      .select("id, slug")
      .eq("slug", input.slug)
      .maybeSingle();
    if (!bySlugResult.error && bySlugResult.data?.id && bySlugResult.data.slug) {
      return {
        id: bySlugResult.data.id,
        slug: String(bySlugResult.data.slug),
      };
    }
  }

  return null;
}

function readUploadOptionField(
  formData: FormData,
  field: string,
  optionId: string,
) {
  return formData.get(`${field}_${optionId}`);
}

function readUploadOptionIds(formData: FormData): string[] {
  const rawIds = formData
    .getAll("optionIds")
    .map((value) =>
      String(value ?? "")
        .trim()
        .toLowerCase(),
    )
    .filter(Boolean);
  return Array.from(new Set(rawIds));
}

function resolveAdminRedirectTarget(
  formData: FormData,
  fallback = "/admin",
): string {
  const requested = String(formData.get("redirectTo") ?? "").trim();
  if (requested.startsWith("/admin")) {
    const hashIndex = requested.indexOf("#");
    if (hashIndex >= 0) {
      const withoutHash = requested.slice(0, hashIndex);
      return withoutHash || fallback;
    }
    return requested;
  }

  return fallback;
}

function redirectAdmin(
  toast?: string,
  error?: string,
  basePath = "/admin",
): never {
  const params = new URLSearchParams();
  if (toast) {
    params.set("toast", toast);
  }
  if (error) {
    params.set("error", error);
  }
  const query = params.toString();
  redirect(query ? `${basePath}?${query}` : basePath);
}

function redirectAdminSuccess(toast: string, basePath = "/admin"): never {
  return redirectAdmin(toast, undefined, basePath);
}

function redirectAdminError(error = "save_failed", basePath = "/admin"): never {
  return redirectAdmin(undefined, error, basePath);
}

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return slug || "item";
}

function normalizeTransferOptionId(value: string): string {
  return slugify(value).slice(0, 80);
}

async function buildUniqueUploadOptionId(name: string): Promise<string> {
  const supabase = getSupabaseAdminClient();
  const base = normalizeTransferOptionId(name);
  const root = base.startsWith("custom-") ? base : `custom-${base}`;

  let candidate = root;
  let counter = 1;

  while (true) {
    const existingResult = await supabase
      .from("upload_product_options")
      .select("id")
      .eq("id", candidate)
      .maybeSingle();

    if (existingResult.error) {
      throw new Error(existingResult.error.message);
    }

    if (!existingResult.data?.id) {
      return candidate;
    }

    counter += 1;
    candidate = `${root}-${counter}`;
  }
}

function normalizeSku(value: string): string {
  const cleaned = value
    .toUpperCase()
    .replace(/[^A-Z0-9-]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return cleaned || "WR";
}

function normalizeOptionalSku(value?: string): string | null {
  const text = (value ?? "").trim();
  if (!text) {
    return null;
  }

  return normalizeSku(text);
}

type BundleComponentInput = z.infer<typeof bundleComponentInputSchema>;

function parseBundleComponentInputs(
  formData: FormData,
): BundleComponentInput[] | null {
  const productIds = formData
    .getAll("componentProductIds")
    .map((value) => String(value ?? "").trim());
  const variantIds = formData
    .getAll("componentVariantIds")
    .map((value) => String(value ?? "").trim());
  const quantities = formData
    .getAll("componentQuantities")
    .map((value) => Number(value));

  const rows = productIds
    .map((productId, index) => ({
      productId,
      variantId: variantIds[index] || undefined,
      quantity: quantities[index],
    }))
    .filter((row) => row.productId);

  const parsedRows: BundleComponentInput[] = [];
  for (const row of rows) {
    const parsed = bundleComponentInputSchema.safeParse(row);
    if (!parsed.success) {
      return null;
    }
    parsedRows.push(parsed.data);
  }

  return parsedRows;
}

function categoryCodeFromSlug(slug: string): string {
  const parts = slug
    .toUpperCase()
    .split(/[^A-Z0-9]+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "CAT";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 3).padEnd(3, "X");
  }

  const initials = parts.map((part) => part[0]).join("");
  return initials.slice(0, 3).padEnd(3, "X");
}

async function generateCategorySku(
  categoryId: string,
  title: string,
  ignoreId?: string,
): Promise<string> {
  const supabase = getSupabaseAdminClient();
  const categoryResult = await supabase
    .from("categories")
    .select("slug")
    .eq("id", categoryId)
    .maybeSingle();

  if (categoryResult.error || !categoryResult.data?.slug) {
    throw new Error(
      categoryResult.error?.message ?? "Unable to resolve category slug.",
    );
  }

  const categoryCode = categoryCodeFromSlug(categoryResult.data.slug);
  const titleCode =
    slugify(title).replace(/-/g, "").toUpperCase().slice(0, 4) || "ITEM";
  const baseSku = `WR-${categoryCode}-${titleCode}`;
  return ensureUniqueSku(baseSku, ignoreId);
}

async function generateProductSlug(
  categoryId: string,
  title: string,
): Promise<string> {
  const supabase = getSupabaseAdminClient();
  const categoryResult = await supabase
    .from("categories")
    .select("slug")
    .eq("id", categoryId)
    .maybeSingle();

  if (categoryResult.error || !categoryResult.data?.slug) {
    throw new Error(
      categoryResult.error?.message ?? "Unable to resolve category slug.",
    );
  }

  return ensureUniqueSlug("products", `${categoryResult.data.slug}-${title}`);
}

function isSlugConflict(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }
  const candidate = error as {
    code?: string;
    message?: string;
    details?: string;
  };
  if (
    candidate.code === "23505" &&
    (candidate.message ?? "").includes("slug")
  ) {
    return true;
  }
  return (candidate.details ?? "").includes("slug");
}

function isUniqueViolation(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as {
    code?: string;
    message?: string;
    details?: string;
  };
  const text =
    `${candidate.message ?? ""} ${candidate.details ?? ""}`.toLowerCase();
  return candidate.code === "23505" || text.includes("duplicate key value");
}

function isPopupColumnMismatch(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as {
    message?: string;
    details?: string;
    hint?: string;
  };
  const text =
    `${candidate.message ?? ""} ${candidate.details ?? ""} ${candidate.hint ?? ""}`.toLowerCase();
  return (
    text.includes("promo_label") ||
    text.includes("show_cta") ||
    text.includes("cta_href")
  );
}

function isMissingTableError(error: unknown, tableName: string): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as {
    code?: string;
    message?: string;
    details?: string;
  };
  const haystack =
    `${candidate.message ?? ""} ${candidate.details ?? ""}`.toLowerCase();
  return (
    candidate.code === "42P01" ||
    (haystack.includes(tableName.toLowerCase()) &&
      haystack.includes("does not exist"))
  );
}

function isMissingColumnError(error: unknown, columnName: string): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as {
    code?: string;
    message?: string;
    details?: string;
  };
  const haystack =
    `${candidate.message ?? ""} ${candidate.details ?? ""}`.toLowerCase();
  return (
    candidate.code === "42703" ||
    (haystack.includes(columnName.toLowerCase()) &&
      haystack.includes("does not exist"))
  );
}

function isArchivableStatus(
  status: string,
): status is (typeof ARCHIVABLE_ORDER_STATUSES)[number] {
  return (ARCHIVABLE_ORDER_STATUSES as readonly string[]).includes(status);
}

async function ensureUniqueSlug(
  table: "categories" | "products",
  baseValue: string,
  ignoreId?: string,
): Promise<string> {
  const supabase = getSupabaseAdminClient();
  const root = slugify(baseValue);
  let candidate = root;
  let counter = 1;

  while (true) {
    const existingResult = await supabase
      .from(table)
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();

    if (existingResult.error) {
      throw new Error(existingResult.error.message);
    }

    const existingId = (existingResult.data as { id: string } | null)?.id;
    if (!existingId || (ignoreId && existingId === ignoreId)) {
      return candidate;
    }

    counter += 1;
    candidate = `${root}-${counter}`;
  }
}

async function ensureUniqueSku(
  baseSku: string,
  ignoreId?: string,
): Promise<string> {
  const supabase = getSupabaseAdminClient();
  const root = normalizeSku(baseSku);
  let candidate = root;
  let counter = 1;

  while (true) {
    const existingResult = await supabase
      .from("products")
      .select("id")
      .eq("sku", candidate)
      .maybeSingle();

    if (existingResult.error) {
      throw new Error(existingResult.error.message);
    }

    const existingId = (existingResult.data as { id: string } | null)?.id;
    if (!existingId || (ignoreId && existingId === ignoreId)) {
      return candidate;
    }

    counter += 1;
    candidate = `${root}-${counter}`;
  }
}

async function ensureUniqueVariantSku(
  baseSku: string,
  ignoreId?: string,
): Promise<string> {
  const supabase = getSupabaseAdminClient();
  const root = normalizeSku(baseSku);
  let candidate = root;
  let counter = 1;

  while (true) {
    const existingResult = await supabase
      .from("product_variants")
      .select("id")
      .eq("sku", candidate)
      .maybeSingle();

    if (existingResult.error) {
      if (isMissingTableError(existingResult.error, "product_variants")) {
        throw new Error("Variant table is missing.");
      }
      throw new Error(existingResult.error.message);
    }

    const existingId = (existingResult.data as { id: string } | null)?.id;
    if (!existingId || (ignoreId && existingId === ignoreId)) {
      return candidate;
    }

    counter += 1;
    candidate = `${root}-${counter}`;
  }
}

function buildVariantSku(input: {
  productSku?: string | null;
  productTitle: string;
  brandName: string;
  colorValue: string;
  sizeValue: string;
}) {
  const productPart =
    input.productSku?.trim() || slugify(input.productTitle).toUpperCase();
  const brandPart = slugify(input.brandName).toUpperCase().slice(0, 5);
  const colorPart = slugify(input.colorValue).toUpperCase().slice(0, 5);
  const sizePart = normalizeSku(input.sizeValue);
  return normalizeSku(`${productPart}-${brandPart}-${colorPart}-${sizePart}`);
}

async function getOrCreateFallbackCategory(
  excludedCategoryId: string,
): Promise<string> {
  const supabase = getSupabaseAdminClient();
  const existingResult = await supabase
    .from("categories")
    .select("id")
    .eq("slug", "uncategorized")
    .neq("id", excludedCategoryId)
    .limit(1);

  if (existingResult.error) {
    throw new Error(existingResult.error.message);
  }

  const existingId = (existingResult.data ?? [])[0]?.id;
  if (existingId) {
    return String(existingId);
  }

  const slug = await ensureUniqueSlug("categories", "uncategorized");
  let createResult = await supabase
    .from("categories")
    .insert({
      name: "Uncategorized",
      slug,
      sort_order: 9999,
      image_url: null,
      active: true,
    })
    .select("id")
    .single();

  if (
    createResult.error &&
    isMissingColumnError(createResult.error, "image_url")
  ) {
    createResult = await supabase
      .from("categories")
      .insert({
        name: "Uncategorized",
        slug,
        sort_order: 9999,
        active: true,
      })
      .select("id")
      .single();
  }

  if (createResult.error || !createResult.data?.id) {
    throw new Error(
      createResult.error?.message ?? "Unable to create fallback category.",
    );
  }

  return String(createResult.data.id);
}

async function getOrCreateBundlesCategory(): Promise<string> {
  const supabase = getSupabaseAdminClient();
  const existingResult = await supabase
    .from("categories")
    .select("id")
    .eq("slug", "bundles")
    .maybeSingle();

  if (existingResult.error) {
    throw new Error(existingResult.error.message);
  }

  if (existingResult.data?.id) {
    return String(existingResult.data.id);
  }

  let createResult = await supabase
    .from("categories")
    .insert({
      name: "Bundles",
      slug: "bundles",
      sort_order: 15,
      image_url: null,
      active: true,
    })
    .select("id")
    .single();

  if (
    createResult.error &&
    isMissingColumnError(createResult.error, "image_url")
  ) {
    createResult = await supabase
      .from("categories")
      .insert({
        name: "Bundles",
        slug: "bundles",
        sort_order: 15,
        active: true,
      })
      .select("id")
      .single();
  }

  if (createResult.error || !createResult.data?.id) {
    throw new Error(
      createResult.error?.message ?? "Unable to create Bundles category.",
    );
  }

  return String(createResult.data.id);
}

async function createProductVariantsFromTemplate(input: {
  productId: string;
  productSku?: string | null;
  productTitle: string;
  templateId: string;
  colorValue: string;
  stockOnHand: number;
  sizeLabels: string[];
}) {
  const supabase = getSupabaseAdminClient();
  const templateResult = await supabase
    .from("variant_templates")
    .select("id, name, brand_name, active")
    .eq("id", input.templateId)
    .maybeSingle();

  if (templateResult.error || !templateResult.data?.id) {
    throw new Error(
      templateResult.error?.message ?? "Unable to resolve variant template.",
    );
  }

  const templateSizesResult = await supabase
    .from("variant_template_sizes")
    .select("size_label, size_sort_order, price_cents")
    .eq("template_id", input.templateId)
    .in("size_label", input.sizeLabels)
    .order("size_sort_order", { ascending: true });

  if (templateSizesResult.error) {
    throw new Error(templateSizesResult.error.message);
  }

  const templateSizes = templateSizesResult.data ?? [];
  if (templateSizes.length === 0) {
    throw new Error("Template has no selected sizes.");
  }

  const generatedRows = [];
  for (const size of templateSizes) {
    const sku = await ensureUniqueVariantSku(
      buildVariantSku({
        productSku: input.productSku,
        productTitle: input.productTitle,
        brandName: String(templateResult.data.brand_name),
        colorValue: input.colorValue,
        sizeValue: String(size.size_label),
      }),
    );

    generatedRows.push({
      product_id: input.productId,
      size_value: String(size.size_label),
      color_value: input.colorValue,
      brand_name: String(templateResult.data.brand_name),
      source_template_id: input.templateId,
      sku,
      price_override_cents: Number(size.price_cents),
      stock_on_hand: input.stockOnHand,
      active: true,
    });
  }

  const insertResult = await supabase.from("product_variants").insert(generatedRows);
  if (insertResult.error) {
    throw new Error(insertResult.error.message);
  }
}

export async function updateOrderStatus(formData: FormData) {
  const redirectTo = resolveAdminRedirectTarget(formData, "/admin");
  const parsed = updateStatusSchema.safeParse({
    orderId: formData.get("orderId"),
    status: formData.get("status"),
    fulfillmentNote: nullableText(formData.get("fulfillmentNote")) ?? undefined,
  });

  if (!parsed.success) {
    return redirectAdminError("invalid_payload", redirectTo);
  }

  const supabase = getSupabaseAdminClient();
  let nextNotes: string | undefined;
  if (parsed.data.fulfillmentNote) {
    const orderResult = await supabase
      .from("orders")
      .select("notes")
      .eq("id", parsed.data.orderId)
      .maybeSingle();

    if (orderResult.error) {
      return redirectAdminError("save_failed", redirectTo);
    }

    const existingNotes =
      orderResult.data && typeof orderResult.data.notes === "string"
        ? orderResult.data.notes
        : null;
    nextNotes = appendFulfillmentNote(
      existingNotes,
      parsed.data.fulfillmentNote,
    );
  }

  const baseUpdatePayload: {
    status: (typeof ORDER_STATUS_VALUES)[number];
    notes?: string;
  } = {
    status: parsed.data.status,
  };
  if (nextNotes) {
    baseUpdatePayload.notes = nextNotes;
  }

  const archiveAwarePayload =
    parsed.data.status === "fulfilled"
      ? {
          ...baseUpdatePayload,
          archived_at: new Date().toISOString(),
          archived_by: "admin_fulfilled",
        }
      : {
          ...baseUpdatePayload,
          archived_at: null,
          archived_by: null,
        };

  let updateResult = await supabase
    .from("orders")
    .update(archiveAwarePayload)
    .eq("id", parsed.data.orderId);

  if (
    updateResult.error &&
    (isMissingColumnError(updateResult.error, "archived_at") ||
      isMissingColumnError(updateResult.error, "archived_by"))
  ) {
    updateResult = await supabase
      .from("orders")
      .update(baseUpdatePayload)
      .eq("id", parsed.data.orderId);
  }

  if (updateResult.error) {
    return redirectAdminError("save_failed", redirectTo);
  }

  if (
    ["paid", "in_production", "fulfilled", "completed"].includes(
      parsed.data.status,
    )
  ) {
    try {
      await recordSaleMovementsForOrder(parsed.data.orderId, "admin_status");
    } catch {
      return redirectAdminError("save_failed", redirectTo);
    }
  }

  revalidatePath("/admin");
  return redirectAdminSuccess("order_updated", redirectTo);
}

export async function archiveOrder(formData: FormData) {
  const redirectTo = resolveAdminRedirectTarget(formData, "/admin");
  const parsed = orderArchiveSchema.safeParse({
    orderId: formData.get("orderId"),
  });

  if (!parsed.success) {
    return redirectAdminError("invalid_payload", redirectTo);
  }

  const supabase = getSupabaseAdminClient();
  const orderResult = await supabase
    .from("orders")
    .select("id, status, archived_at")
    .eq("id", parsed.data.orderId)
    .maybeSingle();

  if (orderResult.error) {
    if (isMissingColumnError(orderResult.error, "archived_at")) {
      return redirectAdminError("order_archive_schema_missing", redirectTo);
    }
    return redirectAdminError("save_failed", redirectTo);
  }

  const order = orderResult.data as {
    id: string;
    status: string;
    archived_at: string | null;
  } | null;
  if (!order) {
    return redirectAdminError("save_failed", redirectTo);
  }

  if (!isArchivableStatus(order.status)) {
    return redirectAdminError("order_archive_not_eligible", redirectTo);
  }

  if (order.archived_at) {
    return redirectAdminSuccess("order_archived", redirectTo);
  }

  const archiveResult = await supabase
    .from("orders")
    .update({
      archived_at: new Date().toISOString(),
      archived_by: "admin_ui",
    })
    .eq("id", parsed.data.orderId);

  if (archiveResult.error) {
    if (isMissingColumnError(archiveResult.error, "archived_at")) {
      return redirectAdminError("order_archive_schema_missing", redirectTo);
    }
    return redirectAdminError("save_failed", redirectTo);
  }

  revalidatePath("/admin");
  return redirectAdminSuccess("order_archived", redirectTo);
}

export async function unarchiveOrder(formData: FormData) {
  const redirectTo = resolveAdminRedirectTarget(formData, "/admin");
  const parsed = orderArchiveSchema.safeParse({
    orderId: formData.get("orderId"),
  });

  if (!parsed.success) {
    return redirectAdminError("invalid_payload", redirectTo);
  }

  const supabase = getSupabaseAdminClient();
  const updateResult = await supabase
    .from("orders")
    .update({
      archived_at: null,
      archived_by: null,
    })
    .eq("id", parsed.data.orderId);

  if (updateResult.error) {
    if (isMissingColumnError(updateResult.error, "archived_at")) {
      return redirectAdminError("order_archive_schema_missing", redirectTo);
    }
    return redirectAdminError("save_failed", redirectTo);
  }

  revalidatePath("/admin");
  return redirectAdminSuccess("order_unarchived", redirectTo);
}

export async function archiveResolvedOrders(formData: FormData) {
  const redirectTo = resolveAdminRedirectTarget(formData, "/admin");
  const supabase = getSupabaseAdminClient();
  const archiveResult = await supabase
    .from("orders")
    .update({
      archived_at: new Date().toISOString(),
      archived_by: "admin_bulk",
    })
    .in("status", [...ARCHIVABLE_ORDER_STATUSES])
    .is("archived_at", null);

  if (archiveResult.error) {
    if (isMissingColumnError(archiveResult.error, "archived_at")) {
      return redirectAdminError("order_archive_schema_missing", redirectTo);
    }
    return redirectAdminError("save_failed", redirectTo);
  }

  revalidatePath("/admin");
  return redirectAdminSuccess("orders_archived", redirectTo);
}

export async function clearArchivedOrders(formData: FormData) {
  const redirectTo = resolveAdminRedirectTarget(formData, "/admin");
  const supabase = getSupabaseAdminClient();
  const clearResult = await supabase
    .from("orders")
    .delete()
    .in("status", [...ARCHIVABLE_ORDER_STATUSES])
    .not("archived_at", "is", null);

  if (clearResult.error) {
    if (isMissingColumnError(clearResult.error, "archived_at")) {
      return redirectAdminError("order_archive_schema_missing", redirectTo);
    }
    return redirectAdminError("save_failed", redirectTo);
  }

  revalidatePath("/admin");
  return redirectAdminSuccess("archived_orders_cleared", redirectTo);
}

export async function createUploadTransferOption(formData: FormData) {
  const redirectTo = resolveAdminRedirectTarget(formData, "/admin");
  const parsed = createUploadProductOptionSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    amountCents: formData.get("amountCents"),
    sortOrder: formData.get("sortOrder"),
    active: asBool(formData, "active"),
  });

  if (!parsed.success) {
    return redirectAdminError("invalid_payload", redirectTo);
  }

  let optionId = "";
  try {
    optionId = await buildUniqueUploadOptionId(parsed.data.name);
  } catch {
    return redirectAdminError("save_failed", redirectTo);
  }

  const supabase = getSupabaseAdminClient();
  const insertResult = await supabase.from("upload_product_options").insert({
    id: optionId,
    sort_order: parsed.data.sortOrder,
    name: parsed.data.name,
    description: parsed.data.description,
    amount_cents: parsed.data.amountCents,
    active: parsed.data.active,
  });

  if (insertResult.error) {
    return redirectAdminError("save_failed", redirectTo);
  }

  revalidatePath("/upload");
  revalidatePath("/admin");
  return redirectAdminSuccess("transfer_option_created", redirectTo);
}

export async function deleteUploadTransferOption(formData: FormData) {
  const redirectTo = resolveAdminRedirectTarget(formData, "/admin");
  const parsed = deleteUploadProductOptionSchema.safeParse({
    optionId: formData.get("optionId"),
  });

  if (!parsed.success) {
    return redirectAdminError("invalid_payload", redirectTo);
  }

  if (DEFAULT_TRANSFER_OPTION_IDS.has(parsed.data.optionId)) {
    return redirectAdminError("transfer_option_default_locked", redirectTo);
  }

  const supabase = getSupabaseAdminClient();
  const deleteResult = await supabase
    .from("upload_product_options")
    .delete()
    .eq("id", parsed.data.optionId);

  if (deleteResult.error) {
    return redirectAdminError("save_failed", redirectTo);
  }

  revalidatePath("/upload");
  revalidatePath("/admin");
  return redirectAdminSuccess("transfer_option_deleted", redirectTo);
}

export async function saveUploadTransferPricing(formData: FormData) {
  const redirectTo = resolveAdminRedirectTarget(formData, "/admin");
  const optionIds = readUploadOptionIds(formData);
  if (optionIds.length === 0) {
    return redirectAdminError("invalid_payload", redirectTo);
  }

  const parsedOptions = optionIds.map((optionId, index) =>
    uploadProductOptionSchema.safeParse({
      id: optionId,
      sortOrder:
        readUploadOptionField(formData, "sortOrder", optionId) ??
        (index + 1) * 10,
      name: readUploadOptionField(formData, "name", optionId),
      description: readUploadOptionField(formData, "description", optionId),
      amountCents: readUploadOptionField(formData, "amountCents", optionId),
      active: asBool(formData, `active_${optionId}`),
    }),
  );

  if (parsedOptions.some((result) => !result.success)) {
    return redirectAdminError("invalid_payload", redirectTo);
  }

  const rows = parsedOptions.flatMap((result) =>
    result.success
      ? [
          {
            id: result.data.id,
            sort_order: result.data.sortOrder,
            name: result.data.name,
            description: result.data.description,
            amount_cents: result.data.amountCents,
            active: result.data.active,
          },
        ]
      : [],
  );

  const supabase = getSupabaseAdminClient();
  const writeResult = await supabase
    .from("upload_product_options")
    .upsert(rows, {
      onConflict: "id",
    });

  if (writeResult.error) {
    return redirectAdminError("save_failed", redirectTo);
  }

  revalidatePath("/upload");
  revalidatePath("/admin");
  return redirectAdminSuccess("transfer_pricing_saved", redirectTo);
}

export async function saveHomepageSettings(formData: FormData) {
  const parsed = homepageSchema.safeParse({
    heroBadge: formData.get("heroBadge"),
    heroTitle: formData.get("heroTitle"),
    heroDescription: formData.get("heroDescription"),
    primaryCtaLabel: formData.get("primaryCtaLabel"),
    primaryCtaHref: formData.get("primaryCtaHref"),
    secondaryCtaLabel: formData.get("secondaryCtaLabel"),
    secondaryCtaHref: formData.get("secondaryCtaHref"),
  });

  if (!parsed.success) {
    return redirectAdminError("invalid_payload");
  }

  const supabase = getSupabaseAdminClient();
  const upsertResult = await supabase.from("homepage_settings").upsert(
    {
      singleton_key: "main",
      hero_badge: parsed.data.heroBadge,
      hero_title: parsed.data.heroTitle,
      hero_description: parsed.data.heroDescription,
      primary_cta_label: parsed.data.primaryCtaLabel,
      primary_cta_href: parsed.data.primaryCtaHref,
      secondary_cta_label: parsed.data.secondaryCtaLabel,
      secondary_cta_href: parsed.data.secondaryCtaHref,
    },
    { onConflict: "singleton_key" },
  );

  if (upsertResult.error) {
    return redirectAdminError("save_failed");
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return redirectAdminSuccess("homepage_saved");
}

export async function saveAboutPageContent(formData: FormData) {
  const parsed = aboutPageSchema.safeParse({
    aboutBadge: formData.get("aboutBadge"),
    aboutTitle: formData.get("aboutTitle"),
    aboutIntro: formData.get("aboutIntro"),
    serviceOneTitle: formData.get("serviceOneTitle"),
    serviceOneDetail: formData.get("serviceOneDetail"),
    serviceTwoTitle: formData.get("serviceTwoTitle"),
    serviceTwoDetail: formData.get("serviceTwoDetail"),
    serviceThreeTitle: formData.get("serviceThreeTitle"),
    serviceThreeDetail: formData.get("serviceThreeDetail"),
    serviceFourTitle: formData.get("serviceFourTitle"),
    serviceFourDetail: formData.get("serviceFourDetail"),
    ctaTitle: formData.get("ctaTitle"),
    ctaDescription: formData.get("ctaDescription"),
    primaryCtaLabel: formData.get("primaryCtaLabel"),
    primaryCtaHref: formData.get("primaryCtaHref"),
    secondaryCtaLabel: formData.get("secondaryCtaLabel"),
    secondaryCtaHref: formData.get("secondaryCtaHref"),
  });

  if (!parsed.success) {
    return redirectAdminError("invalid_payload", "/admin/content");
  }

  try {
    await saveSiteContentValues({
      about_badge: parsed.data.aboutBadge,
      about_title: parsed.data.aboutTitle,
      about_intro: parsed.data.aboutIntro,
      about_service_1_title: parsed.data.serviceOneTitle,
      about_service_1_detail: parsed.data.serviceOneDetail,
      about_service_2_title: parsed.data.serviceTwoTitle,
      about_service_2_detail: parsed.data.serviceTwoDetail,
      about_service_3_title: parsed.data.serviceThreeTitle,
      about_service_3_detail: parsed.data.serviceThreeDetail,
      about_service_4_title: parsed.data.serviceFourTitle,
      about_service_4_detail: parsed.data.serviceFourDetail,
      about_cta_title: parsed.data.ctaTitle,
      about_cta_description: parsed.data.ctaDescription,
      about_primary_cta_label: parsed.data.primaryCtaLabel,
      about_primary_cta_href: parsed.data.primaryCtaHref,
      about_secondary_cta_label: parsed.data.secondaryCtaLabel,
      about_secondary_cta_href: parsed.data.secondaryCtaHref,
    });
  } catch {
    return redirectAdminError("save_failed", "/admin/content");
  }

  revalidatePath("/about");
  revalidatePath("/admin/content");
  return redirectAdminSuccess("about_saved", "/admin/content");
}

export async function saveContactPageContent(formData: FormData) {
  const parsed = contactPageSchema.safeParse({
    contactBadge: formData.get("contactBadge"),
    contactTitle: formData.get("contactTitle"),
    contactIntro: formData.get("contactIntro"),
    contactEmail: formData.get("contactEmail"),
    contactPhone: formData.get("contactPhone"),
    contactAddress: formData.get("contactAddress"),
    printLabelThankYouNote: formData.get("printLabelThankYouNote"),
    hoursTitle: formData.get("hoursTitle"),
    hoursWeekday: formData.get("hoursWeekday"),
    hoursSaturday: formData.get("hoursSaturday"),
    hoursSunday: formData.get("hoursSunday"),
  });

  if (!parsed.success) {
    return redirectAdminError("invalid_payload", "/admin/content");
  }

  try {
    await saveSiteContentValues({
      contact_badge: parsed.data.contactBadge,
      contact_title: parsed.data.contactTitle,
      contact_intro: parsed.data.contactIntro,
      contact_email: parsed.data.contactEmail,
      contact_phone: parsed.data.contactPhone,
      contact_address: parsed.data.contactAddress,
      contact_print_label_thank_you_note: parsed.data.printLabelThankYouNote,
      contact_hours_title: parsed.data.hoursTitle,
      contact_hours_weekday: parsed.data.hoursWeekday,
      contact_hours_saturday: parsed.data.hoursSaturday,
      contact_hours_sunday: parsed.data.hoursSunday,
    });
  } catch {
    return redirectAdminError("save_failed", "/admin/content");
  }

  revalidatePath("/contact");
  revalidatePath("/admin/content");
  revalidatePath("/", "layout");
  return redirectAdminSuccess("contact_saved", "/admin/content");
}

export async function createCategory(formData: FormData) {
  const redirectTo = resolveAdminRedirectTarget(formData, "/admin");
  const parsed = createCategorySchema.safeParse({
    name: formData.get("name"),
    sortOrder: formData.get("sortOrder"),
    imageUrl: formData.get("imageUrl") || undefined,
    active: asBool(formData, "active"),
  });

  if (!parsed.success) {
    return redirectAdminError("invalid_payload", redirectTo);
  }

  let slug = "";
  try {
    slug = await ensureUniqueSlug("categories", parsed.data.name);
  } catch {
    return redirectAdminError("save_failed", redirectTo);
  }
  const supabase = getSupabaseAdminClient();
  let insertResult = await supabase.from("categories").insert({
    name: parsed.data.name,
    slug,
    sort_order: parsed.data.sortOrder,
    image_url: parsed.data.imageUrl || null,
    active: parsed.data.active,
  });

  if (
    insertResult.error &&
    isMissingColumnError(insertResult.error, "image_url")
  ) {
    insertResult = await supabase.from("categories").insert({
      name: parsed.data.name,
      slug,
      sort_order: parsed.data.sortOrder,
      active: parsed.data.active,
    });
  }

  if (insertResult.error) {
    return redirectAdminError("save_failed", redirectTo);
  }

  revalidatePath("/shop");
  revalidatePath("/admin");
  revalidatePath("/admin/inventory");
  return redirectAdminSuccess("category_created", redirectTo);
}

export async function updateCategory(formData: FormData) {
  const redirectTo = resolveAdminRedirectTarget(formData, "/admin");
  const parsed = updateCategorySchema.safeParse({
    categoryId: formData.get("categoryId"),
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
    sortOrder: formData.get("sortOrder"),
    imageUrl: formData.get("imageUrl") || undefined,
    active: asBool(formData, "active"),
  });

  if (!parsed.success) {
    return redirectAdminError("invalid_payload", redirectTo);
  }

  let slug = "";
  try {
    slug = await ensureUniqueSlug(
      "categories",
      parsed.data.slug || parsed.data.name,
      parsed.data.categoryId,
    );
  } catch {
    return redirectAdminError("save_failed", redirectTo);
  }
  const supabase = getSupabaseAdminClient();

  if (!parsed.data.active) {
    let fallbackCategoryId = "";
    try {
      fallbackCategoryId = await getOrCreateFallbackCategory(
        parsed.data.categoryId,
      );
    } catch {
      return redirectAdminError("save_failed", redirectTo);
    }

    const moveProductsResult = await supabase
      .from("products")
      .update({ category_id: fallbackCategoryId })
      .eq("category_id", parsed.data.categoryId);

    if (moveProductsResult.error) {
      return redirectAdminError("save_failed", redirectTo);
    }
  }

  let updateResult = await supabase
    .from("categories")
    .update({
      name: parsed.data.name,
      slug,
      sort_order: parsed.data.sortOrder,
      image_url: parsed.data.imageUrl || null,
      active: parsed.data.active,
    })
    .eq("id", parsed.data.categoryId);

  if (
    updateResult.error &&
    isMissingColumnError(updateResult.error, "image_url")
  ) {
    updateResult = await supabase
      .from("categories")
      .update({
        name: parsed.data.name,
        slug,
        sort_order: parsed.data.sortOrder,
        active: parsed.data.active,
      })
      .eq("id", parsed.data.categoryId);
  }

  if (updateResult.error) {
    return redirectAdminError("save_failed", redirectTo);
  }

  revalidatePath("/shop");
  revalidatePath("/admin");
  revalidatePath("/admin/inventory");
  return redirectAdminSuccess("category_updated", redirectTo);
}

export async function deleteCategory(formData: FormData) {
  const redirectTo = resolveAdminRedirectTarget(formData, "/admin");
  const parsed = deleteCategorySchema.safeParse({
    categoryId: formData.get("categoryId"),
  });

  if (!parsed.success) {
    return redirectAdminError("invalid_payload", redirectTo);
  }

  const supabase = getSupabaseAdminClient();
  let fallbackCategoryId = "";
  try {
    fallbackCategoryId = await getOrCreateFallbackCategory(
      parsed.data.categoryId,
    );
  } catch {
    return redirectAdminError("save_failed", redirectTo);
  }

  const moveProductsResult = await supabase
    .from("products")
    .update({ category_id: fallbackCategoryId })
    .eq("category_id", parsed.data.categoryId);

  if (moveProductsResult.error) {
    return redirectAdminError("save_failed", redirectTo);
  }

  const deleteResult = await supabase
    .from("categories")
    .delete()
    .eq("id", parsed.data.categoryId);

  if (deleteResult.error) {
    return redirectAdminError("save_failed", redirectTo);
  }

  revalidatePath("/shop");
  revalidatePath("/admin");
  revalidatePath("/admin/inventory");
  return redirectAdminSuccess("category_deleted", redirectTo);
}

export async function createProduct(formData: FormData) {
  const redirectTo = resolveAdminRedirectTarget(formData, "/admin");
  const parsed = createProductSchema.safeParse({
    title: formData.get("title"),
    sku: formData.get("sku") || undefined,
    description: formData.get("description"),
    categoryId: formData.get("categoryId"),
    imageUrl: formData.get("imageUrl") || undefined,
    priceCents: formData.get("priceCents"),
    stockOnHand: formData.get("stockOnHand"),
    isFeatured: asBool(formData, "isFeatured"),
    isHot: asBool(formData, "isHot"),
    saleEnabled: asBool(formData, "saleEnabled"),
    salePercentOff: formData.get("salePercentOff"),
    saleLabel: formData.get("saleLabel"),
    cartCtaText: formData.get("cartCtaText"),
    active: asBool(formData, "active"),
  });

  if (!parsed.success) {
    return redirectAdminError("invalid_payload", redirectTo);
  }

  const initialTemplateId = String(formData.get("initialTemplateId") ?? "").trim();
  const initialTemplate = initialTemplateId
    ? initialProductTemplateSchema.safeParse({
        templateId: initialTemplateId,
        colorValue: formData.get("initialColorValue"),
        stockOnHand: formData.get("initialStockOnHand"),
        sizeLabels: formData.getAll("initialSizeLabels"),
      })
    : null;

  if (initialTemplate && !initialTemplate.success) {
    return redirectAdminError("invalid_payload", redirectTo);
  }

  let sku = "";
  try {
    sku = parsed.data.sku
      ? await ensureUniqueSku(parsed.data.sku)
      : await generateCategorySku(parsed.data.categoryId, parsed.data.title);
  } catch {
    return redirectAdminError("save_failed", redirectTo);
  }

  const supabase = getSupabaseAdminClient();
  let created = false;
  let createdProductId = "";
  for (let attempt = 0; attempt < 4; attempt += 1) {
    let slug = "";
    try {
      slug = await generateProductSlug(
        parsed.data.categoryId,
        parsed.data.title,
      );
    } catch {
      return redirectAdminError("save_failed", redirectTo);
    }

    const insertResult = await supabase
      .from("products")
      .insert({
        title: parsed.data.title,
        sku,
        slug,
        description: parsed.data.description,
        category_id: parsed.data.categoryId,
        image_url: parsed.data.imageUrl || null,
        price_cents: parsed.data.priceCents,
        stock_on_hand: parsed.data.stockOnHand,
        is_featured: parsed.data.isFeatured,
        is_hot: parsed.data.isHot,
        sale_enabled: parsed.data.saleEnabled,
        sale_percent_off: parsed.data.salePercentOff,
        sale_label: parsed.data.saleLabel,
        cart_cta_text: parsed.data.cartCtaText,
        active: parsed.data.active,
      })
      .select("id")
      .single();

    if (!insertResult.error) {
      created = true;
      createdProductId = String(insertResult.data.id);
      break;
    }

    if (!isSlugConflict(insertResult.error)) {
      return redirectAdminError("save_failed", redirectTo);
    }
  }

  if (!created) {
    return redirectAdminError("save_failed", redirectTo);
  }

  if (initialTemplate?.success) {
    try {
      await createProductVariantsFromTemplate({
        productId: createdProductId,
        productSku: sku,
        productTitle: parsed.data.title,
        templateId: initialTemplate.data.templateId,
        colorValue: initialTemplate.data.colorValue,
        stockOnHand: initialTemplate.data.stockOnHand,
        sizeLabels: initialTemplate.data.sizeLabels,
      });
    } catch {
      await supabase.from("products").delete().eq("id", createdProductId);
      return redirectAdminError("save_failed", redirectTo);
    }
  }

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin");
  return redirectAdminSuccess("product_created", redirectTo);
}

export async function createBundleProduct(formData: FormData) {
  const redirectTo = resolveAdminRedirectTarget(formData, "/admin");
  const parsed = createBundleProductSchema.safeParse({
    title: formData.get("title"),
    sku: formData.get("sku") || undefined,
    description: formData.get("description"),
    imageUrl: formData.get("imageUrl") || undefined,
    priceCents: formData.get("priceCents"),
    stockOnHand: formData.get("stockOnHand"),
    isFeatured: asBool(formData, "isFeatured"),
    isHot: asBool(formData, "isHot"),
    saleEnabled: asBool(formData, "saleEnabled"),
    salePercentOff: formData.get("salePercentOff"),
    saleLabel: formData.get("saleLabel"),
    cartCtaText: formData.get("cartCtaText"),
    active: asBool(formData, "active"),
  });

  if (!parsed.success) {
    return redirectAdminError("invalid_payload", redirectTo);
  }

  const componentInputs = parseBundleComponentInputs(formData);
  if (!componentInputs || componentInputs.length === 0) {
    return redirectAdminError("bundle_requires_components", redirectTo);
  }

  let categoryId = "";
  let sku = "";
  try {
    categoryId = await getOrCreateBundlesCategory();
    sku = parsed.data.sku
      ? await ensureUniqueSku(parsed.data.sku)
      : await generateCategorySku(categoryId, parsed.data.title);
  } catch {
    return redirectAdminError("save_failed", redirectTo);
  }

  const supabase = getSupabaseAdminClient();
  const componentProductIds = Array.from(
    new Set(componentInputs.map((component) => component.productId)),
  );
  const componentVariantIds = Array.from(
    new Set(
      componentInputs
        .map((component) => component.variantId)
        .filter((variantId): variantId is string => Boolean(variantId)),
    ),
  );

  const componentProductsResult = await supabase
    .from("products")
    .select("id")
    .in("id", componentProductIds);

  if (
    componentProductsResult.error ||
    (componentProductsResult.data ?? []).length !== componentProductIds.length
  ) {
    return redirectAdminError("invalid_payload", redirectTo);
  }

  if (componentVariantIds.length > 0) {
    const componentVariantsResult = await supabase
      .from("product_variants")
      .select("id, product_id")
      .in("id", componentVariantIds);

    if (componentVariantsResult.error) {
      return redirectAdminError("save_failed", redirectTo);
    }

    const variantProductById = new Map(
      (componentVariantsResult.data ?? []).map((variant) => [
        String(variant.id),
        String(variant.product_id),
      ]),
    );

    const variantMismatch = componentInputs.some(
      (component) =>
        component.variantId &&
        variantProductById.get(component.variantId) !== component.productId,
    );

    if (
      variantMismatch ||
      variantProductById.size !== componentVariantIds.length
    ) {
      return redirectAdminError("invalid_payload", redirectTo);
    }
  }

  let created = false;
  let createdBundleId = "";
  for (let attempt = 0; attempt < 4; attempt += 1) {
    let slug = "";
    try {
      slug = await generateProductSlug(categoryId, parsed.data.title);
    } catch {
      return redirectAdminError("save_failed", redirectTo);
    }

    const insertResult = await supabase
      .from("products")
      .insert({
        title: parsed.data.title,
        sku,
        slug,
        description: parsed.data.description,
        category_id: categoryId,
        image_url: parsed.data.imageUrl || null,
        price_cents: parsed.data.priceCents,
        stock_on_hand: parsed.data.stockOnHand,
        is_featured: parsed.data.isFeatured,
        is_hot: parsed.data.isHot,
        sale_enabled: parsed.data.saleEnabled,
        sale_percent_off: parsed.data.salePercentOff,
        sale_label: parsed.data.saleLabel,
        cart_cta_text: parsed.data.cartCtaText,
        active: parsed.data.active,
      })
      .select("id")
      .single();

    if (!insertResult.error) {
      created = true;
      createdBundleId = String(insertResult.data.id);
      break;
    }

    if (!isSlugConflict(insertResult.error)) {
      return redirectAdminError("save_failed", redirectTo);
    }
  }

  if (!created) {
    return redirectAdminError("save_failed", redirectTo);
  }

  const componentInsertResult = await supabase.from("bundle_components").insert(
    componentInputs.map((component, index) => ({
      bundle_product_id: createdBundleId,
      component_product_id: component.productId,
      component_variant_id: component.variantId ?? null,
      quantity: component.quantity,
      sort_order: (index + 1) * 10,
    })),
  );

  if (componentInsertResult.error) {
    await supabase.from("products").delete().eq("id", createdBundleId);
    if (isMissingTableError(componentInsertResult.error, "bundle_components")) {
      return redirectAdminError("bundle_schema_missing", redirectTo);
    }
    return redirectAdminError("save_failed", redirectTo);
  }

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin");
  revalidatePath("/admin/inventory");
  return redirectAdminSuccess("product_created", redirectTo);
}

export async function updateProductCard(formData: FormData) {
  const redirectTo = resolveAdminRedirectTarget(formData, "/admin");
  const parsed = updateProductSchema.safeParse({
    productId: formData.get("productId"),
    title: formData.get("title"),
    sku: formData.get("sku") || undefined,
    slug: formData.get("slug") || undefined,
    description: formData.get("description"),
    categoryId: formData.get("categoryId"),
    imageUrl: formData.get("imageUrl") || undefined,
    priceCents: formData.get("priceCents"),
    stockOnHand: formData.get("stockOnHand"),
    isFeatured: asBool(formData, "isFeatured"),
    isHot: asBool(formData, "isHot"),
    saleEnabled: asBool(formData, "saleEnabled"),
    salePercentOff: formData.get("salePercentOff"),
    saleLabel: formData.get("saleLabel"),
    cartCtaText: formData.get("cartCtaText"),
    active: asBool(formData, "active"),
  });

  if (!parsed.success) {
    return redirectAdminError("invalid_payload", redirectTo);
  }

  let sku = "";
  let slug = "";
  try {
    sku = parsed.data.sku
      ? await ensureUniqueSku(parsed.data.sku, parsed.data.productId)
      : await generateCategorySku(
          parsed.data.categoryId,
          parsed.data.title,
          parsed.data.productId,
        );
    slug = await ensureUniqueSlug(
      "products",
      parsed.data.slug || parsed.data.title,
      parsed.data.productId,
    );
  } catch {
    return redirectAdminError("save_failed", redirectTo);
  }

  const supabase = getSupabaseAdminClient();
  const currentProductResult = await supabase
    .from("products")
    .select("price_cents")
    .eq("id", parsed.data.productId)
    .maybeSingle();

  if (currentProductResult.error) {
    return redirectAdminError("save_failed", redirectTo);
  }

  const previousPriceCents = Number(
    currentProductResult.data?.price_cents ?? 0,
  );

  const updateResult = await supabase
    .from("products")
    .update({
      title: parsed.data.title,
      sku,
      slug,
      description: parsed.data.description,
      category_id: parsed.data.categoryId,
      image_url: parsed.data.imageUrl || null,
      price_cents: parsed.data.priceCents,
      stock_on_hand: parsed.data.stockOnHand,
      is_featured: parsed.data.isFeatured,
      is_hot: parsed.data.isHot,
      sale_enabled: parsed.data.saleEnabled,
      sale_percent_off: parsed.data.salePercentOff,
      sale_label: parsed.data.saleLabel,
      cart_cta_text: parsed.data.cartCtaText,
      active: parsed.data.active,
    })
    .eq("id", parsed.data.productId);

  if (updateResult.error) {
    return redirectAdminError("save_failed", redirectTo);
  }

  if (previousPriceCents > 0 && previousPriceCents !== parsed.data.priceCents) {
    const clearMirroredOverridesResult = await supabase
      .from("product_variants")
      .update({ price_override_cents: null })
      .eq("product_id", parsed.data.productId)
      .eq("price_override_cents", previousPriceCents);

    if (
      clearMirroredOverridesResult.error &&
      !isMissingTableError(
        clearMirroredOverridesResult.error,
        "product_variants",
      )
    ) {
      return redirectAdminError("save_failed", redirectTo);
    }
  }

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin");
  return redirectAdminSuccess("product_updated", redirectTo);
}

export async function deleteProductCard(formData: FormData) {
  const redirectTo = resolveAdminRedirectTarget(formData, "/admin");
  const parsed = deleteProductSchema.safeParse({
    productId: formData.get("productId"),
  });

  if (!parsed.success) {
    return redirectAdminError("invalid_payload", redirectTo);
  }

  const supabase = getSupabaseAdminClient();
  const deleteResult = await supabase
    .from("products")
    .delete()
    .eq("id", parsed.data.productId);

  if (deleteResult.error) {
    return redirectAdminError("save_failed", redirectTo);
  }

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin");
  revalidatePath("/admin/inventory");
  return redirectAdminSuccess("product_deleted", redirectTo);
}

export async function createVariantTemplate(formData: FormData) {
  const redirectTo = resolveAdminRedirectTarget(formData, "/admin");
  const parsed = createVariantTemplateSchema.safeParse({
    name: formData.get("name"),
    brandName: formData.get("brandName"),
    active: asBool(formData, "active"),
  });

  if (!parsed.success) {
    return redirectAdminError("invalid_payload", redirectTo);
  }

  const requestedSizes = formData
    .getAll("templateSizes")
    .map((value) => String(value ?? "").trim())
    .filter(Boolean);
  const uniqueSizes = Array.from(new Set(requestedSizes)).sort(
    (a, b) => getSizeSortOrder(a) - getSizeSortOrder(b),
  );

  if (uniqueSizes.length === 0) {
    return redirectAdminError("template_requires_size", redirectTo);
  }

  const sizeRows = uniqueSizes
    .map((sizeLabel) => {
      const priceCents = parseCurrencyToCents(formData.get(`price_${sizeLabel}`));
      return {
        size_label: sizeLabel,
        size_sort_order: getSizeSortOrder(sizeLabel),
        price_cents: priceCents,
      };
    })
    .filter(
      (row): row is {
        size_label: string;
        size_sort_order: number;
        price_cents: number;
      } => typeof row.price_cents === "number" && row.price_cents > 0,
    );

  if (sizeRows.length !== uniqueSizes.length) {
    return redirectAdminError("template_requires_price", redirectTo);
  }

  const supabase = getSupabaseAdminClient();
  const templateResult = await supabase
    .from("variant_templates")
    .insert({
      name: parsed.data.name,
      brand_name: parsed.data.brandName,
      active: parsed.data.active,
    })
    .select("id")
    .single();

  if (templateResult.error || !templateResult.data?.id) {
    if (isMissingTableError(templateResult.error, "variant_templates")) {
      return redirectAdminError("template_table_missing", redirectTo);
    }
    return redirectAdminError("save_failed", redirectTo);
  }

  const sizesResult = await supabase.from("variant_template_sizes").insert(
    sizeRows.map((row) => ({
      template_id: String(templateResult.data.id),
      ...row,
    })),
  );

  if (sizesResult.error) {
    return redirectAdminError("save_failed", redirectTo);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/inventory");
  return redirectAdminSuccess("template_created", redirectTo);
}

export async function applyVariantTemplate(formData: FormData) {
  const redirectTo = resolveAdminRedirectTarget(formData, "/admin");
  const parsed = applyVariantTemplateSchema.safeParse({
    productId: formData.get("productId"),
    templateId: formData.get("templateId"),
    colorValue: formData.get("colorValue"),
    stockOnHand: formData.get("stockOnHand"),
    sizeLabels: formData.getAll("sizeLabels"),
  });

  if (!parsed.success) {
    return redirectAdminError("invalid_payload", redirectTo);
  }

  const supabase = getSupabaseAdminClient();
  const templateResult = await supabase
    .from("variant_templates")
    .select("id, name, brand_name, active")
    .eq("id", parsed.data.templateId)
    .maybeSingle();

  if (templateResult.error || !templateResult.data?.id) {
    if (isMissingTableError(templateResult.error, "variant_templates")) {
      return redirectAdminError("template_table_missing", redirectTo);
    }
    return redirectAdminError("save_failed", redirectTo);
  }

  const templateSizesResult = await supabase
    .from("variant_template_sizes")
    .select("size_label, size_sort_order, price_cents")
    .eq("template_id", parsed.data.templateId)
    .in("size_label", parsed.data.sizeLabels)
    .order("size_sort_order", { ascending: true });

  if (templateSizesResult.error) {
    return redirectAdminError("save_failed", redirectTo);
  }

  const templateSizes = templateSizesResult.data ?? [];
  if (templateSizes.length === 0) {
    return redirectAdminError("template_requires_size", redirectTo);
  }

  const productResult = await supabase
    .from("products")
    .select("id, sku, title")
    .eq("id", parsed.data.productId)
    .maybeSingle();

  if (productResult.error || !productResult.data?.id) {
    return redirectAdminError("save_failed", redirectTo);
  }

  const generatedRows = [];
  for (const size of templateSizes) {
    const sku = await ensureUniqueVariantSku(
      buildVariantSku({
        productSku: productResult.data.sku,
        productTitle: productResult.data.title,
        brandName: String(templateResult.data.brand_name),
        colorValue: parsed.data.colorValue,
        sizeValue: String(size.size_label),
      }),
    );

    generatedRows.push({
      product_id: parsed.data.productId,
      size_value: String(size.size_label),
      color_value: parsed.data.colorValue,
      brand_name: String(templateResult.data.brand_name),
      source_template_id: parsed.data.templateId,
      sku,
      price_override_cents: Number(size.price_cents),
      stock_on_hand: parsed.data.stockOnHand,
      active: true,
    });
  }

  const insertResult = await supabase.from("product_variants").insert(generatedRows);

  if (insertResult.error) {
    if (isMissingTableError(insertResult.error, "product_variants")) {
      return redirectAdminError("variant_table_missing", redirectTo);
    }
    if (
      isMissingColumnError(insertResult.error, "brand_name") ||
      isMissingColumnError(insertResult.error, "source_template_id")
    ) {
      return redirectAdminError("template_schema_missing", redirectTo);
    }
    if (isUniqueViolation(insertResult.error)) {
      return redirectAdminError("variant_conflict", redirectTo);
    }
    return redirectAdminError("save_failed", redirectTo);
  }

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin");
  revalidatePath("/admin/inventory");
  return redirectAdminSuccess("variants_generated", redirectTo);
}

export async function createProductVariant(formData: FormData) {
  const redirectTo = resolveAdminRedirectTarget(formData, "/admin");
  const parsed = createProductVariantSchema.safeParse({
    productId: formData.get("productId"),
    sizeValue: formData.get("sizeValue") || undefined,
    colorValue: formData.get("colorValue") || undefined,
    brandName: formData.get("brandName") || undefined,
    sku: formData.get("sku") || undefined,
    priceOverrideCents: formData.get("priceOverrideCents") || undefined,
    stockOnHand: formData.get("stockOnHand"),
    active: asBool(formData, "active"),
  });

  if (!parsed.success) {
    return redirectAdminError("invalid_payload", redirectTo);
  }

  const sizeValue = nullableText(formData.get("sizeValue"));
  const colorValue = nullableText(formData.get("colorValue"));
  const brandName = nullableText(formData.get("brandName"));
  if (!sizeValue && !colorValue) {
    return redirectAdminError("variant_requires_option", redirectTo);
  }

  const supabase = getSupabaseAdminClient();
  const insertResult = await supabase.from("product_variants").insert({
    product_id: parsed.data.productId,
    size_value: sizeValue,
    color_value: colorValue,
    brand_name: brandName,
    sku: normalizeOptionalSku(parsed.data.sku),
    price_override_cents: parsed.data.priceOverrideCents ?? null,
    stock_on_hand: parsed.data.stockOnHand,
    active: parsed.data.active,
  });

  if (insertResult.error) {
    if (isMissingTableError(insertResult.error, "product_variants")) {
      return redirectAdminError("variant_table_missing", redirectTo);
    }
    if (isMissingColumnError(insertResult.error, "brand_name")) {
      return redirectAdminError("template_schema_missing", redirectTo);
    }
    if (isUniqueViolation(insertResult.error)) {
      return redirectAdminError("variant_conflict", redirectTo);
    }
    return redirectAdminError("save_failed", redirectTo);
  }

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin");
  revalidatePath("/admin/inventory");
  return redirectAdminSuccess("variant_created", redirectTo);
}

export async function updateProductVariant(formData: FormData) {
  const redirectTo = resolveAdminRedirectTarget(formData, "/admin");
  const parsed = updateProductVariantSchema.safeParse({
    variantId: formData.get("variantId"),
    productId: formData.get("productId"),
    sizeValue: formData.get("sizeValue") || undefined,
    colorValue: formData.get("colorValue") || undefined,
    brandName: formData.get("brandName") || undefined,
    sku: formData.get("sku") || undefined,
    priceOverrideCents: formData.get("priceOverrideCents") || undefined,
    stockOnHand: formData.get("stockOnHand"),
    active: asBool(formData, "active"),
  });

  if (!parsed.success) {
    return redirectAdminError("invalid_payload", redirectTo);
  }

  const sizeValue = nullableText(formData.get("sizeValue"));
  const colorValue = nullableText(formData.get("colorValue"));
  const brandName = nullableText(formData.get("brandName"));
  if (!sizeValue && !colorValue) {
    return redirectAdminError("variant_requires_option", redirectTo);
  }

  const supabase = getSupabaseAdminClient();
  const updateResult = await supabase
    .from("product_variants")
    .update({
      size_value: sizeValue,
      color_value: colorValue,
      brand_name: brandName,
      sku: normalizeOptionalSku(parsed.data.sku),
      price_override_cents: parsed.data.priceOverrideCents ?? null,
      stock_on_hand: parsed.data.stockOnHand,
      active: parsed.data.active,
    })
    .eq("id", parsed.data.variantId)
    .eq("product_id", parsed.data.productId);

  if (updateResult.error) {
    if (isMissingTableError(updateResult.error, "product_variants")) {
      return redirectAdminError("variant_table_missing", redirectTo);
    }
    if (isMissingColumnError(updateResult.error, "brand_name")) {
      return redirectAdminError("template_schema_missing", redirectTo);
    }
    if (isUniqueViolation(updateResult.error)) {
      return redirectAdminError("variant_conflict", redirectTo);
    }
    return redirectAdminError("save_failed", redirectTo);
  }

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin");
  revalidatePath("/admin/inventory");
  return redirectAdminSuccess("variant_updated", redirectTo);
}

export async function deleteProductVariant(formData: FormData) {
  const redirectTo = resolveAdminRedirectTarget(formData, "/admin");
  const parsed = deleteProductVariantSchema.safeParse({
    variantId: formData.get("variantId"),
  });

  if (!parsed.success) {
    return redirectAdminError("invalid_payload", redirectTo);
  }

  const supabase = getSupabaseAdminClient();
  const deleteResult = await supabase
    .from("product_variants")
    .delete()
    .eq("id", parsed.data.variantId);

  if (deleteResult.error) {
    if (isMissingTableError(deleteResult.error, "product_variants")) {
      return redirectAdminError("variant_table_missing", redirectTo);
    }
    return redirectAdminError("save_failed", redirectTo);
  }

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin");
  revalidatePath("/admin/inventory");
  return redirectAdminSuccess("variant_deleted", redirectTo);
}

export async function createWelcomePost(formData: FormData) {
  const parsed = createWelcomePostSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
    ctaLabel: formData.get("ctaLabel") || undefined,
    ctaHref: formData.get("ctaHref") || undefined,
    sortOrder: formData.get("sortOrder"),
    active: asBool(formData, "active"),
  });

  if (!parsed.success) {
    return redirectAdminError("invalid_payload");
  }

  if (isSiteSettingTitle(parsed.data.title)) {
    return redirectAdminError("invalid_payload");
  }

  const supabase = getSupabaseAdminClient();
  const insertResult = await supabase.from("welcome_posts").insert({
    title: parsed.data.title,
    body: parsed.data.body,
    cta_label: nullableText(formData.get("ctaLabel")),
    cta_href: nullableText(formData.get("ctaHref")),
    sort_order: parsed.data.sortOrder,
    active: parsed.data.active,
  });

  if (insertResult.error) {
    return redirectAdminError("save_failed");
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return redirectAdminSuccess("welcome_created");
}

export async function updateWelcomePost(formData: FormData) {
  const parsed = updateWelcomePostSchema.safeParse({
    postId: formData.get("postId"),
    title: formData.get("title"),
    body: formData.get("body"),
    ctaLabel: formData.get("ctaLabel") || undefined,
    ctaHref: formData.get("ctaHref") || undefined,
    sortOrder: formData.get("sortOrder"),
    active: asBool(formData, "active"),
  });

  if (!parsed.success) {
    return redirectAdminError("invalid_payload");
  }

  if (isSiteSettingTitle(parsed.data.title)) {
    return redirectAdminError("invalid_payload");
  }

  const supabase = getSupabaseAdminClient();
  const updateResult = await supabase
    .from("welcome_posts")
    .update({
      title: parsed.data.title,
      body: parsed.data.body,
      cta_label: nullableText(formData.get("ctaLabel")),
      cta_href: nullableText(formData.get("ctaHref")),
      sort_order: parsed.data.sortOrder,
      active: parsed.data.active,
    })
    .eq("id", parsed.data.postId);

  if (updateResult.error) {
    return redirectAdminError("save_failed");
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return redirectAdminSuccess("welcome_updated");
}

export async function deleteWelcomePost(formData: FormData) {
  const parsed = deleteWelcomePostSchema.safeParse({
    postId: formData.get("postId"),
  });

  if (!parsed.success) {
    return redirectAdminError("invalid_payload");
  }

  const supabase = getSupabaseAdminClient();
  const deleteResult = await supabase
    .from("welcome_posts")
    .delete()
    .eq("id", parsed.data.postId);

  if (deleteResult.error) {
    return redirectAdminError("save_failed");
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return redirectAdminSuccess("welcome_deleted");
}

export async function savePromoPopup(formData: FormData) {
  const parsed = popupSchema.safeParse({
    enabled: asBool(formData, "enabled"),
    showCta: asBool(formData, "showCta"),
    promoLabel: formData.get("promoLabel"),
    title: formData.get("title"),
    message: formData.get("message"),
    ctaText: formData.get("ctaText"),
    popupCtaMode: formData.get("popupCtaMode") || undefined,
    ctaSlug: formData.get("ctaSlug") || undefined,
    ctaHref: formData.get("ctaHref") || "/shop",
    productId: formData.get("productId") || undefined,
  });

  if (!parsed.success) {
    return redirectAdminError("invalid_payload");
  }

  const normalizedPromoLabel = parsed.data.promoLabel?.trim() || "Hot Item";
  const normalizedTitle = parsed.data.title?.trim() || "Get it now!";
  const normalizedMessage =
    parsed.data.message?.trim() || "Hot item just dropped.";
  const normalizedCtaText = parsed.data.ctaText?.trim() || "I gotta have it!";
  const popupMode =
    parsed.data.popupCtaMode ?? (parsed.data.productId ? "inventory" : "slug");
  const normalizedFallbackCtaHref = normalizePopupHref(parsed.data.ctaHref);
  const normalizedSlug = normalizePopupSlug(parsed.data.ctaSlug);
  let resolvedProductId: string | null = null;
  let resolvedCtaHref = normalizedFallbackCtaHref;

  if (popupMode === "inventory") {
    const target = await resolvePopupProductTarget({
      productId: parsed.data.productId,
      slug: normalizedSlug,
    });
    if (target) {
      resolvedProductId = target.id;
      resolvedCtaHref = `/shop/${target.slug}`;
    } else if (normalizedSlug) {
      resolvedCtaHref = `/shop/${normalizedSlug}`;
    }
  } else {
    if (normalizedSlug) {
      resolvedCtaHref = `/shop/${normalizedSlug}`;
    }
  }

  const supabase = getSupabaseAdminClient();
  let upsertResult = await supabase.from("promo_popups").upsert(
    {
      singleton_key: "main",
      enabled: parsed.data.enabled,
      show_cta: parsed.data.showCta,
      promo_label: normalizedPromoLabel,
      title: normalizedTitle,
      message: normalizedMessage,
      cta_text: normalizedCtaText,
      cta_href: resolvedCtaHref,
      product_id: resolvedProductId,
    },
    {
      onConflict: "singleton_key",
    },
  );

  // Backward compatibility for environments where popup table columns were not fully migrated.
  if (upsertResult.error && isPopupColumnMismatch(upsertResult.error)) {
    upsertResult = await supabase.from("promo_popups").upsert(
      {
        singleton_key: "main",
        enabled: parsed.data.enabled,
        title: normalizedTitle,
        message: normalizedMessage,
        cta_text: normalizedCtaText,
        product_id: resolvedProductId,
      },
      {
        onConflict: "singleton_key",
      },
    );
  }

  if (upsertResult.error) {
    return redirectAdminError("save_failed");
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return redirectAdminSuccess("popup_saved");
}

export async function updateContactMessage(formData: FormData) {
  const redirectTo = resolveAdminRedirectTarget(formData, "/admin");
  const parsed = updateMessageSchema.safeParse({
    messageId: formData.get("messageId"),
    status: formData.get("status"),
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return redirectAdminError("invalid_payload", redirectTo);
  }

  const supabase = getSupabaseAdminClient();
  const updateResult = await supabase
    .from("contact_messages")
    .update({
      status: parsed.data.status,
      notes: parsed.data.notes?.trim() ? parsed.data.notes.trim() : null,
    })
    .eq("id", parsed.data.messageId);

  if (updateResult.error) {
    return redirectAdminError("save_failed", redirectTo);
  }

  revalidatePath("/admin");
  return redirectAdminSuccess("message_updated", redirectTo);
}
