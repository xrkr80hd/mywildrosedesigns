import { NextResponse } from "next/server";
import {
  cartCheckoutRequestSchema,
  normalizeOptionalText,
} from "@/lib/checkout-schema";
import { getSiteUrl, hasStripeSecretKey } from "@/lib/env";
import { recordFunnelEvent } from "@/lib/funnel-analytics";
import { getEffectivePriceCents } from "@/lib/pricing";
import { getStripeServerClient } from "@/lib/stripe";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const SHIPPING_CENTS = 599;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

function isMissingTableError(error: unknown, tableName: string): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as { code?: string; message?: string; details?: string };
  const haystack = `${candidate.message ?? ""} ${candidate.details ?? ""}`.toLowerCase();
  return candidate.code === "42P01" || haystack.includes(tableName.toLowerCase());
}

function buildLineKey(productId: string, variantId?: string): string {
  return variantId ? `${productId}::${variantId}` : productId;
}

function getBaseUrlFromRequest(request: Request): string {
  const origin = request.headers.get("origin");
  if (origin) {
    return origin;
  }

  const forwardedHost = request.headers.get("x-forwarded-host");
  if (forwardedHost) {
    const proto = request.headers.get("x-forwarded-proto") ?? "https";
    return `${proto}://${forwardedHost}`;
  }

  return getSiteUrl();
}

export async function POST(request: Request) {
  const supabase = getSupabaseAdminClient();
  let createdOrderId: string | null = null;

  if (!hasStripeSecretKey()) {
    return NextResponse.json(
      { error: "Checkout is temporarily unavailable while payments are being configured." },
      { status: 503 },
    );
  }

  try {
    const body = await request.json();
    const parsed = cartCheckoutRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please check your checkout details and try again." },
        { status: 400 },
      );
    }

    const lineItemsByKey = new Map<
      string,
      {
        productId: string;
        variantId?: string;
        variantSize?: string;
        variantColor?: string;
        quantity: number;
      }
    >();
    const invalidItemIds: string[] = [];
    const invalidVariantIds: string[] = [];
    for (const item of parsed.data.items) {
      if (!isUuid(item.id)) {
        invalidItemIds.push(item.id);
        continue;
      }

      const variantId = item.variantId?.trim() || undefined;
      if (variantId && !isUuid(variantId)) {
        invalidVariantIds.push(variantId);
        continue;
      }

      const lineKey = buildLineKey(item.id, variantId);
      const existing = lineItemsByKey.get(lineKey);
      if (existing) {
        existing.quantity = Math.min(existing.quantity + item.quantity, 100);
      } else {
        lineItemsByKey.set(lineKey, {
          productId: item.id,
          variantId,
          variantSize: item.variantSize?.trim() || undefined,
          variantColor: item.variantColor?.trim() || undefined,
          quantity: Math.min(item.quantity, 100),
        });
      }
    }

    if (invalidItemIds.length > 0 || invalidVariantIds.length > 0) {
      return NextResponse.json(
        {
          error:
            "Your cart contains outdated items. Please clear cart and add products again.",
        },
        { status: 400 },
      );
    }

    const requestedLines = Array.from(lineItemsByKey.values());
    const productIds = Array.from(new Set(requestedLines.map((line) => line.productId)));
    if (productIds.length === 0) {
      return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
    }

    const variantIds = Array.from(
      new Set(
        requestedLines
          .map((line) => line.variantId)
          .filter((value): value is string => Boolean(value)),
      ),
    );

    const productResult = await supabase
      .from("products")
      .select(
        "id, title, description, price_cents, stock_on_hand, sale_enabled, sale_percent_off, active",
      )
      .in("id", productIds)
      .eq("active", true);

    if (productResult.error) {
      if ((productResult.error.message ?? "").toLowerCase().includes("invalid input syntax for type uuid")) {
        return NextResponse.json(
          {
            error:
              "Your cart contains outdated items. Please clear cart and add products again.",
          },
          { status: 400 },
        );
      }
      throw new Error(productResult.error.message);
    }

    const products = productResult.data ?? [];
    const productsById = new Map(products.map((product) => [product.id, product]));
    const variantResult = await supabase
      .from("product_variants")
      .select(
        "id, product_id, size_value, color_value, sku, price_override_cents, stock_on_hand, active",
      )
      .in("product_id", productIds)
      .eq("active", true);

    if (variantResult.error) {
      if (!isMissingTableError(variantResult.error, "product_variants")) {
        throw new Error(variantResult.error.message);
      }
      if (variantIds.length > 0) {
        return NextResponse.json(
          { error: "One or more selected variants are unavailable. Please refresh your cart." },
          { status: 400 },
        );
      }
    }

    const activeVariants = variantResult.error ? [] : (variantResult.data ?? []);
    const variantsById = new Map(activeVariants.map((variant) => [variant.id, variant]));
    const variantCountByProductId = new Map<string, number>();
    for (const variant of activeVariants) {
      variantCountByProductId.set(
        variant.product_id,
        (variantCountByProductId.get(variant.product_id) ?? 0) + 1,
      );
    }

    const missingProducts = productIds.filter((id) => !productsById.has(id));
    if (missingProducts.length > 0) {
      return NextResponse.json(
        { error: "One or more cart items are unavailable. Please refresh your cart." },
        { status: 400 },
      );
    }

    const missingVariants = variantIds.filter((id) => !variantsById.has(id));
    if (missingVariants.length > 0) {
      return NextResponse.json(
        { error: "One or more selected variants are unavailable. Please refresh your cart." },
        { status: 400 },
      );
    }

    const missingVariantSelection = requestedLines.find(
      (line) => (variantCountByProductId.get(line.productId) ?? 0) > 0 && !line.variantId,
    );
    if (missingVariantSelection) {
      return NextResponse.json(
        { error: "Please choose a size/color option for every variant product in your cart." },
        { status: 400 },
      );
    }

    const normalizedItems = requestedLines.map((requestedLine) => {
      const product = productsById.get(requestedLine.productId)!;
      const variant = requestedLine.variantId
        ? variantsById.get(requestedLine.variantId) ?? null
        : null;
      if (variant && variant.product_id !== product.id) {
        throw new Error("Variant does not belong to product.");
      }

      const variantSize = variant?.size_value?.trim() || requestedLine.variantSize || undefined;
      const variantColor = variant?.color_value?.trim() || requestedLine.variantColor || undefined;
      const variantParts = [variantSize, variantColor].filter(Boolean);
      const variantLabel = variantParts.join(" • ");
      const unitBasePriceCents =
        typeof variant?.price_override_cents === "number" && variant.price_override_cents > 0
          ? variant.price_override_cents
          : product.price_cents;
      const unitAmountCents = getEffectivePriceCents(
        unitBasePriceCents,
        product.sale_enabled,
        product.sale_percent_off,
      );

      return {
        id: product.id,
        variantId: variant?.id ?? null,
        variantSku: variant?.sku ?? null,
        title: variantLabel ? `${product.title} (${variantLabel})` : product.title,
        baseTitle: product.title,
        variantLabel,
        sizeValue: variantSize ?? null,
        colorValue: variantColor ?? null,
        description: product.description,
        quantity: requestedLine.quantity,
        unitAmountCents,
        stockOnHand: variant ? variant.stock_on_hand : product.stock_on_hand,
      };
    });

    const outOfStockItem = normalizedItems.find((item) => item.quantity > item.stockOnHand);
    if (outOfStockItem) {
      return NextResponse.json(
        {
          error: `${outOfStockItem.title} does not have enough stock for quantity ${outOfStockItem.quantity}.`,
        },
        { status: 400 },
      );
    }

    const subtotalCents = normalizedItems.reduce(
      (sum, item) => sum + item.unitAmountCents * item.quantity,
      0,
    );
    const shippingMethod = parsed.data.shippingMethod === "pickup" ? "pickup" : "shipping";
    const shippingCents = shippingMethod === "shipping" ? SHIPPING_CENTS : 0;
    const totalQuantity = normalizedItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalCents = subtotalCents + shippingCents;

    const cartSummary = normalizedItems.map((item) => ({
      productId: item.id,
      variantId: item.variantId,
      variantSku: item.variantSku,
      title: item.baseTitle,
      variantLabel: item.variantLabel || null,
      sizeValue: item.sizeValue,
      colorValue: item.colorValue,
      quantity: item.quantity,
      unitAmountCents: item.unitAmountCents,
    }));

    const noteBlocks = [
      normalizeOptionalText(parsed.data.notes),
      `Fulfillment: ${shippingMethod === "pickup" ? "Local Pickup" : "Shipping"}`,
      `Cart items: ${JSON.stringify(cartSummary)}`,
    ].filter((value): value is string => Boolean(value));

    const orderInsertResult = await supabase
      .from("orders")
      .insert({
        customer_name: parsed.data.customerName,
        customer_email: parsed.data.customerEmail,
        customer_phone: normalizeOptionalText(parsed.data.customerPhone),
        notes: noteBlocks.join("\n\n"),
        product_option: "cart_checkout",
        quantity: totalQuantity,
        amount_cents: totalCents,
        design_path: "cart/no-upload",
        status: "pending_payment",
      })
      .select("id")
      .single();

    if (orderInsertResult.error || !orderInsertResult.data) {
      throw new Error(orderInsertResult.error?.message ?? "Unable to create order");
    }

    createdOrderId = orderInsertResult.data.id;

    const stripe = getStripeServerClient();
    const baseUrl = getBaseUrlFromRequest(request);
    const lineItems = normalizedItems.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: "usd",
        unit_amount: item.unitAmountCents,
        product_data: {
          name: item.title,
          description: item.description,
        },
      },
    }));

    if (shippingCents > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: shippingCents,
          product_data: {
            name: "Shipping",
            description: "Standard shipping",
          },
        },
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: parsed.data.customerEmail,
      billing_address_collection: "required",
      ...(shippingMethod === "shipping"
        ? {
            shipping_address_collection: {
              allowed_countries: ["US" as const],
            },
          }
        : {}),
      automatic_tax: {
        enabled: true,
      },
      success_url: `${baseUrl}/thank-you?source=cart&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout?cancelled=1&source=cart`,
      metadata: {
        order_id: createdOrderId,
        checkout_type: "cart",
        shipping_method: shippingMethod,
      },
      line_items: lineItems,
      allow_promotion_codes: true,
    });

    if (!session.url) {
      throw new Error("Stripe session URL is missing.");
    }

    const orderSessionUpdate = await supabase
      .from("orders")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", createdOrderId);

    if (orderSessionUpdate.error) {
      throw new Error(orderSessionUpdate.error.message);
    }

    try {
      await recordFunnelEvent({
        eventType: "start_checkout",
        sourcePath: "/checkout",
        orderId: createdOrderId,
        cartSize: totalQuantity,
        metadata: {
          lineCount: normalizedItems.length,
        },
      });
    } catch (analyticsError) {
      console.error("Unable to record start_checkout analytics event", analyticsError);
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (createdOrderId) {
      await supabase.from("orders").delete().eq("id", createdOrderId).eq("status", "pending_payment");
    }

    console.error("Cart checkout initialization failed", error);
    return NextResponse.json(
      { error: "Unable to start checkout right now. Please try again." },
      { status: 500 },
    );
  }
}
