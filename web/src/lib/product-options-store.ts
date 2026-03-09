import "server-only";

import { unstable_noStore as noStore } from "next/cache";
import {
  DEFAULT_PRODUCT_OPTIONS,
  ProductOption,
} from "@/lib/product-options";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type ProductOptionRow = {
  id: string;
  sort_order: number;
  name: string;
  description: string;
  amount_cents: number;
  active: boolean;
};

export type ProductOptionAdminRow = ProductOption & {
  active: boolean;
  sortOrder: number;
};

function isMissingTableError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as { code?: string; message?: string; details?: string };
  const text = `${candidate.message ?? ""} ${candidate.details ?? ""}`.toLowerCase();
  return candidate.code === "42P01" || text.includes("upload_product_options");
}

function isValidAmountCents(value: number): boolean {
  return Number.isInteger(value) && value > 0 && value <= 1_000_000;
}

function isValidOptionId(value: string): boolean {
  return /^[a-z0-9-]{2,80}$/.test(value);
}

function defaultAdminRows(): ProductOptionAdminRow[] {
  return DEFAULT_PRODUCT_OPTIONS.map((option, index) => ({
    ...option,
    active: true,
    sortOrder: (index + 1) * 10,
  }));
}

function toPublicOption(option: ProductOptionAdminRow): ProductOption {
  return {
    id: option.id,
    name: option.name,
    description: option.description,
    amountCents: option.amountCents,
  };
}

function normalizeRow(row: ProductOptionRow): ProductOptionAdminRow | null {
  const normalizedId = String(row.id ?? "").trim().toLowerCase();
  if (!isValidOptionId(normalizedId)) {
    return null;
  }

  if (!isValidAmountCents(row.amount_cents)) {
    return null;
  }

  return {
    id: normalizedId,
    name: String(row.name ?? "").trim() || "Custom Transfer",
    description: String(row.description ?? "").trim() || "Custom transfer option.",
    amountCents: row.amount_cents,
    active: Boolean(row.active),
    sortOrder: Number.isFinite(row.sort_order) ? row.sort_order : 0,
  };
}

export async function getUploadProductOptionsForAdmin(): Promise<ProductOptionAdminRow[]> {
  try {
    noStore();
  } catch {
    // noStore is only available in request contexts.
  }

  const defaults = defaultAdminRows();
  const supabase = getSupabaseAdminClient();
  const result = await supabase
    .from("upload_product_options")
    .select("id, sort_order, name, description, amount_cents, active")
    .order("sort_order", { ascending: true });

  if (result.error) {
    if (isMissingTableError(result.error)) {
      return defaults;
    }

    throw new Error(result.error.message);
  }

  const normalized = ((result.data ?? []) as ProductOptionRow[])
    .map(normalizeRow)
    .filter((row): row is ProductOptionAdminRow => Boolean(row));

  if (normalized.length === 0) {
    return defaults;
  }

  const byId = new Map(normalized.map((row) => [row.id, row]));
  const mergedDefaults = defaults.map((fallback) => byId.get(fallback.id) ?? fallback);
  const customRows = normalized.filter(
    (row) => !defaults.some((fallback) => fallback.id === row.id),
  );
  const merged = [...mergedDefaults, ...customRows];
  merged.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
  return merged;
}

export async function getUploadProductOptions(): Promise<ProductOption[]> {
  const adminRows = await getUploadProductOptionsForAdmin();
  const activeRows = adminRows.filter((row) => row.active);
  if (activeRows.length === 0) {
    return DEFAULT_PRODUCT_OPTIONS;
  }

  return activeRows.map(toPublicOption);
}

export async function getUploadProductOptionById(
  optionId: string,
): Promise<ProductOption | undefined> {
  const normalizedId = optionId.trim().toLowerCase();
  if (!isValidOptionId(normalizedId)) {
    return undefined;
  }

  const options = await getUploadProductOptions();
  return options.find((option) => option.id === normalizedId);
}
