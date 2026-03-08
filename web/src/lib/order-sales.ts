import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const CART_ITEMS_LABEL = "Cart items:";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type OrderSnapshot = {
  id: string;
  product_option: string;
  notes: string | null;
};

type ParsedCartItem = {
  productId: string;
  variantId: string | null;
  quantity: number;
};

function isUniqueViolation(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as { code?: string; message?: string; details?: string };
  const text = `${candidate.message ?? ""} ${candidate.details ?? ""}`.toLowerCase();
  return candidate.code === "23505" || text.includes("duplicate key value");
}

function parseCartItemsFromNotes(notes: string | null): ParsedCartItem[] {
  if (!notes) {
    return [];
  }

  const markerIndex = notes.lastIndexOf(CART_ITEMS_LABEL);
  if (markerIndex < 0) {
    return [];
  }

  const payloadText = notes.slice(markerIndex + CART_ITEMS_LABEL.length).trim();
  if (!payloadText) {
    return [];
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(payloadText);
  } catch {
    return [];
  }

  if (!Array.isArray(parsed)) {
    return [];
  }

  const quantityByLineKey = new Map<string, ParsedCartItem>();
  for (const entry of parsed) {
    if (!entry || typeof entry !== "object") {
      continue;
    }

    const candidateId =
      typeof (entry as { productId?: unknown }).productId === "string"
        ? (entry as { productId: string }).productId
        : typeof (entry as { id?: unknown }).id === "string"
          ? (entry as { id: string }).id
          : "";

    if (!UUID_RE.test(candidateId)) {
      continue;
    }

    const variantIdCandidate =
      typeof (entry as { variantId?: unknown }).variantId === "string"
        ? (entry as { variantId: string }).variantId
        : "";
    const variantId = UUID_RE.test(variantIdCandidate) ? variantIdCandidate : null;

    const quantity = Number((entry as { quantity?: unknown }).quantity);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      continue;
    }

    const lineKey = variantId ? `${candidateId}::${variantId}` : candidateId;
    const existing = quantityByLineKey.get(lineKey);
    if (existing) {
      existing.quantity = Math.min(existing.quantity + quantity, 1000);
    } else {
      quantityByLineKey.set(lineKey, {
        productId: candidateId,
        variantId,
        quantity: Math.min(quantity, 1000),
      });
    }
  }

  return Array.from(quantityByLineKey.values());
}

async function getOrderSnapshot(orderId: string): Promise<OrderSnapshot | null> {
  const supabase = getSupabaseAdminClient();
  const result = await supabase
    .from("orders")
    .select("id, product_option, notes")
    .eq("id", orderId)
    .maybeSingle();

  if (result.error) {
    throw new Error(result.error.message);
  }

  return (result.data as OrderSnapshot | null) ?? null;
}

export async function recordSaleMovementsForOrder(
  orderId: string,
  createdBy: string,
): Promise<void> {
  const order = await getOrderSnapshot(orderId);
  if (!order || order.product_option !== "cart_checkout") {
    return;
  }

  const saleItems = parseCartItemsFromNotes(order.notes);
  if (saleItems.length === 0) {
    return;
  }

  const supabase = getSupabaseAdminClient();
  const existingResult = await supabase
    .from("inventory_movements")
    .select("id")
    .eq("reference_order_id", order.id)
    .eq("movement_type", "sale")
    .limit(200);

  if (existingResult.error) {
    throw new Error(existingResult.error.message);
  }

  if ((existingResult.data ?? []).length > 0) {
    return;
  }

  const movementRows = saleItems.map((item) => ({
    product_id: item.productId,
    variant_id: item.variantId,
    movement_type: "sale" as const,
    quantity_delta: -item.quantity,
    reason: "Sale captured from checkout payment",
    reference_order_id: order.id,
    created_by: createdBy,
  }));

  const insertResult = await supabase.from("inventory_movements").insert(movementRows);
  if (insertResult.error && !isUniqueViolation(insertResult.error)) {
    throw new Error(insertResult.error.message);
  }
}
