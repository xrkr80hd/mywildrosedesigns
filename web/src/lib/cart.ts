export const CART_KEY = "wild-rose-cart";
export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type CartItem = {
  lineId: string;
  id: string;
  variantId?: string;
  variantSize?: string;
  variantColor?: string;
  productSlug?: string;
  title: string;
  price: number;
  quantity: number;
};

function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

function cleanOptionalText(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  return trimmed.slice(0, maxLength);
}

export function buildCartLineId(productId: string, variantId?: string): string {
  return variantId ? `${productId}::${variantId}` : productId;
}

export function formatVariantLabel(item: Pick<CartItem, "variantSize" | "variantColor">): string {
  const parts = [item.variantSize, item.variantColor].filter(Boolean);
  return parts.join(" • ");
}

export function sanitizeCartItems(rawValue: unknown): CartItem[] {
  if (!Array.isArray(rawValue)) {
    return [];
  }

  const sanitized: CartItem[] = [];
  for (const candidate of rawValue) {
    if (!candidate || typeof candidate !== "object") {
      continue;
    }

    const productId = typeof (candidate as { id?: unknown }).id === "string"
      ? (candidate as { id: string }).id
      : "";
    if (!isUuid(productId)) {
      continue;
    }

    const variantIdRaw =
      typeof (candidate as { variantId?: unknown }).variantId === "string"
        ? (candidate as { variantId: string }).variantId
        : "";
    const variantId = variantIdRaw && isUuid(variantIdRaw) ? variantIdRaw : undefined;

    const title =
      typeof (candidate as { title?: unknown }).title === "string"
        ? (candidate as { title: string }).title.trim()
        : "";
    const price = Number((candidate as { price?: unknown }).price);
    const quantity = Number((candidate as { quantity?: unknown }).quantity);
    if (!title || !Number.isFinite(price) || price <= 0 || !Number.isInteger(quantity) || quantity <= 0) {
      continue;
    }

    const explicitLineId =
      typeof (candidate as { lineId?: unknown }).lineId === "string"
        ? (candidate as { lineId: string }).lineId.trim()
        : "";
    const lineId = explicitLineId || buildCartLineId(productId, variantId);

    sanitized.push({
      lineId,
      id: productId,
      variantId,
      variantSize: cleanOptionalText((candidate as { variantSize?: unknown }).variantSize, 40),
      variantColor: cleanOptionalText((candidate as { variantColor?: unknown }).variantColor, 60),
      productSlug: cleanOptionalText((candidate as { productSlug?: unknown }).productSlug, 180),
      title,
      price,
      quantity,
    });
  }

  return sanitized;
}
