import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  DEFAULT_APPAREL_SIZE_PROFILES,
  DEFAULT_APPAREL_SIZES,
} from "@/lib/product-variants";
import { getEffectivePriceCents } from "@/lib/pricing";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export type StorefrontVariant = {
  id: string;
  sizeValue: string | null;
  colorValue: string | null;
  label: string;
  sku: string | null;
  basePriceCents: number;
  effectivePriceCents: number;
  stockOnHand: number;
};

export type StorefrontProduct = {
  id: string;
  sku: string;
  title: string;
  description: string;
  slug: string;
  categoryName: string;
  categorySlug: string;
  imageUrl: string;
  basePriceCents: number;
  effectivePriceCents: number;
  stockOnHand: number;
  isFeatured: boolean;
  isHot: boolean;
  saleEnabled: boolean;
  salePercentOff: number;
  saleLabel: string;
  cartCtaText: string;
  productType: "apparel" | "accessory";
  sizeProfiles: string[];
  sizeValues: string[];
  hasVariants: boolean;
  variants: StorefrontVariant[];
};

export type HomepageSettings = {
  heroBadge: string;
  heroTitle: string;
  heroDescription: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
};

export type WelcomePost = {
  id: string;
  title: string;
  body: string;
  ctaLabel: string | null;
  ctaHref: string | null;
  sortOrder: number;
};

export type PromoPopup = {
  enabled: boolean;
  showCta: boolean;
  promoLabel: string;
  title: string;
  message: string;
  ctaText: string;
  ctaHref: string;
  product: StorefrontProduct | null;
};

const DEFAULT_SETTINGS: HomepageSettings = {
  heroBadge: "Custom Prints • Fast Turnaround",
  heroTitle: "Wild Rose Design LLC",
  heroDescription:
    "Custom apparel, school spirit wear, team merch, and seasonal drops. Browse products, add to cart, or upload your own design.",
  primaryCtaLabel: "Shop Collections",
  primaryCtaHref: "/shop",
  secondaryCtaLabel: "Upload a Design",
  secondaryCtaHref: "/upload",
};

const DEFAULT_POSTS: WelcomePost[] = [
  {
    id: "fallback-custom",
    title: "Custom Designs",
    body: "Upload your artwork and get high-quality prints with fast turnaround.",
    ctaLabel: "Start Custom Order",
    ctaHref: "/upload",
    sortOrder: 10,
  },
  {
    id: "fallback-school",
    title: "School & Team Spirit",
    body: "Outfit schools, teams, clubs, and organizations with quality merch.",
    ctaLabel: "Shop School Gear",
    ctaHref: "/shop?category=School",
    sortOrder: 20,
  },
  {
    id: "fallback-seasonal",
    title: "Seasonal Collections",
    body: "Run limited drops and special releases with editable sale controls.",
    ctaLabel: "View Seasonal",
    ctaHref: "/shop?category=Seasonal",
    sortOrder: 30,
  },
];

const SHOULD_USE_LOCAL_FALLBACK_PRODUCTS =
  process.env.NODE_ENV !== "production";

type LegacySampleProduct = {
  id?: string;
  title?: string;
  category?: string;
  price?: number;
  image?: string;
  description?: string;
};

function slugifyProductValue(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function toFallbackProduct(sample: LegacySampleProduct): StorefrontProduct | null {
  const title = String(sample.title ?? "").trim();
  if (!title) {
    return null;
  }

  const categoryName = String(sample.category ?? "Products").trim() || "Products";
  const categorySlug = slugifyProductValue(categoryName) || "products";
  const id = String(sample.id ?? slugifyProductValue(title)).trim() || slugifyProductValue(title);
  const slug = slugifyProductValue(title) || id;
  const imagePath = String(sample.image ?? "assets/img/product-tee.svg").trim();
  const normalizedImagePath = imagePath.startsWith("/") ? imagePath : `/${imagePath.replace(/^\.?\/?/, "")}`;
  const price = Number(sample.price ?? 0);
  const basePriceCents = Number.isFinite(price) ? Math.round(price * 100) : 0;

  return {
    id,
    sku: id.toUpperCase(),
    title,
    description: String(sample.description ?? "").trim(),
    slug,
    categoryName,
    categorySlug,
    imageUrl: normalizedImagePath,
    basePriceCents,
    effectivePriceCents: basePriceCents,
    stockOnHand: 1,
    isFeatured: true,
    isHot: false,
    saleEnabled: false,
    salePercentOff: 0,
    saleLabel: "Sale",
    cartCtaText: "Add to Cart",
    productType: "apparel",
    sizeProfiles: [...DEFAULT_APPAREL_SIZE_PROFILES],
    sizeValues: [...DEFAULT_APPAREL_SIZES],
    hasVariants: false,
    variants: [],
  };
}

async function loadLocalFallbackProducts(): Promise<StorefrontProduct[]> {
  if (!SHOULD_USE_LOCAL_FALLBACK_PRODUCTS) {
    return [];
  }

  try {
    const filePath = path.join(process.cwd(), "..", "assets", "data", "products.json");
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as LegacySampleProduct[];

    return parsed
      .map((sample) => toFallbackProduct(sample))
      .filter((product): product is StorefrontProduct => Boolean(product));
  } catch {
    return [];
  }
}

function normalizeHeroBadge(value: string): string {
  const cleaned = value.trim();
  if (!cleaned) {
    return DEFAULT_SETTINGS.heroBadge;
  }

  // Keep legacy DB values from showing on the storefront.
  if (/handmade\s+with\s+care/i.test(cleaned)) {
    return DEFAULT_SETTINGS.heroBadge;
  }

  return cleaned;
}

function isMissingTableError(error: unknown, tableName: string): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as { code?: string; message?: string; details?: string };
  const text = `${candidate.message ?? ""} ${candidate.details ?? ""}`.toLowerCase();
  return candidate.code === "42P01" || text.includes(tableName.toLowerCase());
}

export async function getStorefrontData() {
  const fallbackProducts = await loadLocalFallbackProducts();

  try {
    const supabase = getSupabaseAdminClient();

    const [categoryResult, settingsResult, welcomeResult, popupResult] =
      await Promise.all([
        supabase
          .from("categories")
          .select("id, slug, name, sort_order")
          .eq("active", true)
          .order("sort_order", { ascending: true })
          .order("name", { ascending: true }),
        supabase
          .from("homepage_settings")
          .select(
            "hero_badge, hero_title, hero_description, primary_cta_label, primary_cta_href, secondary_cta_label, secondary_cta_href",
          )
          .eq("singleton_key", "main")
          .maybeSingle(),
        supabase
          .from("welcome_posts")
          .select("id, title, body, cta_label, cta_href, sort_order")
          .eq("active", true)
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: true }),
        supabase
          .from("promo_popups")
          .select("enabled, show_cta, promo_label, title, message, cta_text, cta_href, product_id")
          .eq("singleton_key", "main")
          .maybeSingle(),
      ]);

    if (categoryResult.error) {
      throw new Error(categoryResult.error.message);
    }

    const productQuery = supabase
      .from("products")
      .select(
        "id, sku, title, description, slug, category_id, price_cents, stock_on_hand, is_featured, is_hot, sale_enabled, sale_percent_off, sale_label, cart_cta_text, product_type, size_profiles, size_values, image_url",
      )
      .eq("active", true)
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false });

    const primaryProductResult = await productQuery;
    let productRows: Array<Record<string, unknown>> = [];

    if (primaryProductResult.error) {
      const legacyProductResult = await supabase
        .from("products")
        .select(
          "id, sku, title, description, slug, category_id, price_cents, stock_on_hand, is_featured, is_hot, sale_enabled, sale_percent_off, sale_label, cart_cta_text, image_url",
        )
        .eq("active", true)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (legacyProductResult.error) {
        throw new Error(legacyProductResult.error.message);
      }

      productRows = (legacyProductResult.data ?? []) as Array<Record<string, unknown>>;
    } else {
      productRows = (primaryProductResult.data ?? []) as Array<Record<string, unknown>>;
    }

    const categoriesById = new Map(
      (categoryResult.data ?? []).map((category) => [category.id, category]),
    );
    const productIds = productRows
      .map((row) => String(row.id ?? ""))
      .filter(Boolean);
    const productRowsById = new Map(
      productRows.map((row) => [String(row.id ?? ""), row]),
    );
    const variantsByProductId = new Map<string, StorefrontVariant[]>();

    if (productIds.length > 0) {
      const variantResult = await supabase
        .from("product_variants")
        .select(
          "id, product_id, size_value, color_value, sku, price_override_cents, stock_on_hand, active",
        )
        .in("product_id", productIds)
        .eq("active", true)
        .order("created_at", { ascending: true });

      if (variantResult.error) {
        if (!isMissingTableError(variantResult.error, "product_variants")) {
          throw new Error(variantResult.error.message);
        }
      } else {
        for (const row of variantResult.data ?? []) {
          const productId = String(row.product_id ?? "");
          const parent = productRowsById.get(productId);
          if (!parent) {
            continue;
          }

          const parentBasePrice = Number(parent.price_cents ?? 0);
          const variantBasePrice =
            typeof row.price_override_cents === "number" && row.price_override_cents > 0
              ? row.price_override_cents
              : parentBasePrice;
          const variantEffectivePrice = getEffectivePriceCents(
            variantBasePrice,
            Boolean(parent.sale_enabled),
            Number(parent.sale_percent_off ?? 0),
          );
          const sizeValue = row.size_value ? String(row.size_value).trim() : null;
          const colorValue = row.color_value ? String(row.color_value).trim() : null;
          const label = [sizeValue, colorValue].filter(Boolean).join(" • ");

          const normalizedVariant: StorefrontVariant = {
            id: String(row.id ?? ""),
            sizeValue,
            colorValue,
            label,
            sku: row.sku ? String(row.sku) : null,
            basePriceCents: variantBasePrice,
            effectivePriceCents: variantEffectivePrice,
            stockOnHand: Number(row.stock_on_hand ?? 0),
          };

          const existing = variantsByProductId.get(productId) ?? [];
          existing.push(normalizedVariant);
          variantsByProductId.set(productId, existing);
        }
      }
    }

    const products: StorefrontProduct[] = productRows.map((product) => {
      const categoryId = String(product.category_id ?? "");
      const productId = String(product.id ?? "");
      const category = categoriesById.get(categoryId);
      const variants = variantsByProductId.get(productId) ?? [];
      const hasVariants = variants.length > 0;
      const basePriceCents = Number(product.price_cents ?? 0);
      const productEffectivePriceCents = getEffectivePriceCents(
        basePriceCents,
        Boolean(product.sale_enabled),
        Number(product.sale_percent_off ?? 0),
      );
      const effectivePriceCents = hasVariants
        ? Math.min(...variants.map((variant) => variant.effectivePriceCents))
        : productEffectivePriceCents;
      const displayBasePriceCents = hasVariants
        ? Math.min(...variants.map((variant) => variant.basePriceCents))
        : basePriceCents;
      const stockOnHand = hasVariants
        ? variants.reduce((sum, variant) => sum + variant.stockOnHand, 0)
        : Number(product.stock_on_hand ?? 0);

      return {
        id: productId,
        sku: String(product.sku ?? ""),
        title: String(product.title ?? ""),
        description: String(product.description ?? ""),
        slug: String(product.slug ?? ""),
        categoryName: category?.name ?? "Uncategorized",
        categorySlug: category?.slug ?? "uncategorized",
        imageUrl: String(product.image_url ?? "/assets/img/product-tee.svg"),
        basePriceCents: displayBasePriceCents,
        effectivePriceCents,
        stockOnHand,
        isFeatured: Boolean(product.is_featured),
        isHot: Boolean(product.is_hot),
        saleEnabled: Boolean(product.sale_enabled),
        salePercentOff: Number(product.sale_percent_off ?? 0),
        saleLabel: String(product.sale_label ?? "Sale"),
        cartCtaText: String(product.cart_cta_text ?? "Add to Cart"),
        productType: product.product_type === "accessory" ? "accessory" : "apparel",
        sizeProfiles: Array.isArray(product.size_profiles)
          ? (product.size_profiles as string[])
          : [...DEFAULT_APPAREL_SIZE_PROFILES],
        sizeValues: Array.isArray(product.size_values)
          ? (product.size_values as string[])
          : [...DEFAULT_APPAREL_SIZES],
        hasVariants,
        variants,
      };
    });

    const categoryNames = (categoryResult.data ?? [])
      .map((category) => category.name.trim())
      .filter(Boolean);

    const settings: HomepageSettings = settingsResult.data
      ? {
          heroBadge: normalizeHeroBadge(settingsResult.data.hero_badge),
          heroTitle: settingsResult.data.hero_title,
          heroDescription: settingsResult.data.hero_description,
          primaryCtaLabel: settingsResult.data.primary_cta_label,
          primaryCtaHref: settingsResult.data.primary_cta_href,
          secondaryCtaLabel: settingsResult.data.secondary_cta_label,
          secondaryCtaHref: settingsResult.data.secondary_cta_href,
        }
      : DEFAULT_SETTINGS;

    const welcomePosts: WelcomePost[] =
      welcomeResult.data?.map((post) => ({
        id: post.id,
        title: post.title,
        body: post.body,
        ctaLabel: post.cta_label,
        ctaHref: post.cta_href,
        sortOrder: post.sort_order,
      })) ?? DEFAULT_POSTS;

    const resolvedProducts = products.length > 0 ? products : fallbackProducts;
    const resolvedCategoryNames =
      products.length > 0
        ? Array.from(new Set(categoryNames))
        : Array.from(new Set(fallbackProducts.map((product) => product.categoryName)));

    const hotProduct = resolvedProducts.find((product) => product.isHot) ?? null;
    let popupRow = popupResult.data;

    if (popupResult.error) {
      const legacyPopupResult = await supabase
        .from("promo_popups")
        .select("enabled, title, message, cta_text, product_id")
        .eq("singleton_key", "main")
        .maybeSingle();

      if (!legacyPopupResult.error && legacyPopupResult.data) {
        popupRow = {
          enabled: legacyPopupResult.data.enabled,
          show_cta: true,
          promo_label: "Hot Item",
          title: legacyPopupResult.data.title,
          message: legacyPopupResult.data.message,
          cta_text: legacyPopupResult.data.cta_text,
          cta_href: "/shop",
          product_id: legacyPopupResult.data.product_id,
        };
      }
    }

    const selectedPopupProduct =
      popupRow?.product_id
        ? resolvedProducts.find((product) => product.id === popupRow.product_id) ?? null
        : null;
    const popupProduct = selectedPopupProduct ?? hotProduct;
    const popupEnabled = popupRow?.enabled ?? Boolean(hotProduct);

    const popup: PromoPopup = {
      enabled: popupEnabled,
      showCta: popupRow?.show_cta ?? true,
      promoLabel: popupRow?.promo_label ?? "Hot Item",
      title: popupRow?.title ?? "Get it now!",
      message: popupRow?.message ?? "Hot item just dropped.",
      ctaText: popupRow?.cta_text ?? "I gotta have it!",
      ctaHref: popupRow?.cta_href ?? "/shop",
      product: popupProduct,
    };

    return {
      products: resolvedProducts,
      featuredProducts: resolvedProducts.filter((product) => product.isFeatured).slice(0, 6),
      categoryNames: resolvedCategoryNames,
      settings,
      welcomePosts,
      popup,
    };
  } catch {
    const resolvedFallbackProducts = fallbackProducts;

    return {
      products: resolvedFallbackProducts,
      featuredProducts: resolvedFallbackProducts.filter((product) => product.isFeatured).slice(0, 6),
      categoryNames: Array.from(
        new Set(resolvedFallbackProducts.map((product) => product.categoryName)),
      ),
      settings: DEFAULT_SETTINGS,
      welcomePosts: DEFAULT_POSTS,
      popup: {
        enabled: false,
        showCta: true,
        promoLabel: "Hot Item",
        title: "Get it now!",
        message: "Hot item just dropped.",
        ctaText: "I gotta have it!",
        ctaHref: "/shop",
        product: null,
      } as PromoPopup,
    };
  }
}
