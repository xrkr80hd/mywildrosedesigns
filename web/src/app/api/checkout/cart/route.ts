import { NextResponse } from "next/server";
import {
  cartCheckoutRequestSchema,
  normalizeOptionalText,
} from "@/lib/checkout-schema";
import { getSiteUrl, hasStripeSecretKey } from "@/lib/env";
import { getEffectivePriceCents } from "@/lib/pricing";
import { getStripeServerClient } from "@/lib/stripe";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const SHIPPING_CENTS = 599;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: string): boolean {
  return UUID_RE.test(value);
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

    const quantityById = new Map<string, number>();
    const invalidItemIds: string[] = [];
    for (const item of parsed.data.items) {
      if (!isUuid(item.id)) {
        invalidItemIds.push(item.id);
        continue;
      }
      const next = (quantityById.get(item.id) ?? 0) + item.quantity;
      quantityById.set(item.id, Math.min(next, 100));
    }

    if (invalidItemIds.length > 0) {
      return NextResponse.json(
        {
          error:
            "Your cart contains outdated items. Please clear cart and add products again.",
        },
        { status: 400 },
      );
    }

    const productIds = Array.from(quantityById.keys());
    if (productIds.length === 0) {
      return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
    }

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

    const missingProducts = productIds.filter((id) => !productsById.has(id));
    if (missingProducts.length > 0) {
      return NextResponse.json(
        { error: "One or more cart items are unavailable. Please refresh your cart." },
        { status: 400 },
      );
    }

    const normalizedItems = productIds.map((id) => {
      const product = productsById.get(id)!;
      const quantity = quantityById.get(id) ?? 0;
      const unitAmountCents = getEffectivePriceCents(
        product.price_cents,
        product.sale_enabled,
        product.sale_percent_off,
      );

      return {
        id,
        title: product.title,
        description: product.description,
        quantity,
        unitAmountCents,
        stockOnHand: product.stock_on_hand,
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
    const totalQuantity = normalizedItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalCents = subtotalCents + SHIPPING_CENTS;

    const cartSummary = normalizedItems.map((item) => ({
      productId: item.id,
      title: item.title,
      quantity: item.quantity,
      unitAmountCents: item.unitAmountCents,
    }));

    const noteBlocks = [
      normalizeOptionalText(parsed.data.notes),
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

    lineItems.push({
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: SHIPPING_CENTS,
        product_data: {
          name: "Shipping",
          description: "Standard shipping",
        },
      },
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: parsed.data.customerEmail,
      success_url: `${baseUrl}/thank-you?source=cart&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout?cancelled=1&source=cart`,
      metadata: {
        order_id: createdOrderId,
        checkout_type: "cart",
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
