import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
  getStripeServerEnv,
  hasStripeSecretKey,
  hasStripeWebhookSecret,
} from "@/lib/env";
import { recordFunnelEvent } from "@/lib/funnel-analytics";
import { recordSaleMovementsForOrder } from "@/lib/order-sales";
import { getStripeServerClient } from "@/lib/stripe";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

async function getOrderIdForSession(session: Stripe.Checkout.Session): Promise<string | null> {
  const metadataOrderId = session.metadata?.order_id;
  if (metadataOrderId) {
    return metadataOrderId;
  }

  if (!session.id) {
    return null;
  }

  const supabase = getSupabaseAdminClient();
  const lookup = await supabase
    .from("orders")
    .select("id")
    .eq("stripe_checkout_session_id", session.id)
    .maybeSingle();

  if (lookup.error) {
    throw new Error(lookup.error.message);
  }

  return lookup.data?.id ?? null;
}

async function markOrderPaid(session: Stripe.Checkout.Session) {
  const orderId = await getOrderIdForSession(session);
  if (!orderId) {
    return;
  }

  if (session.payment_status !== "paid") {
    return;
  }

  const supabase = getSupabaseAdminClient();
  const existingResult = await supabase
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .maybeSingle();

  if (existingResult.error) {
    throw new Error(existingResult.error.message);
  }

  const isAlreadyPaid = existingResult.data?.status === "paid";

  if (!isAlreadyPaid) {
    const updateResult = await supabase
      .from("orders")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        stripe_payment_intent_id:
          typeof session.payment_intent === "string" ? session.payment_intent : null,
      })
      .eq("id", orderId);

    if (updateResult.error) {
      throw new Error(updateResult.error.message);
    }
  }

  await recordSaleMovementsForOrder(orderId, "stripe_webhook");

  try {
    await recordFunnelEvent({
      eventType: "paid",
      sourcePath: "/api/webhooks/stripe",
      orderId,
      metadata: {
        checkoutType: session.metadata?.checkout_type ?? null,
      },
    });
  } catch (analyticsError) {
    console.error("Unable to record paid analytics event", analyticsError);
  }
}

async function markOrderCancelled(session: Stripe.Checkout.Session) {
  const orderId = await getOrderIdForSession(session);
  if (!orderId) {
    return;
  }

  const supabase = getSupabaseAdminClient();
  const updateResult = await supabase
    .from("orders")
    .update({
      status: "cancelled",
    })
    .eq("id", orderId)
    .eq("status", "pending_payment");

  if (updateResult.error) {
    throw new Error(updateResult.error.message);
  }
}

export async function POST(request: Request) {
  if (!hasStripeSecretKey() || !hasStripeWebhookSecret()) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured yet." },
      { status: 503 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  try {
    const payload = await request.text();
    const stripe = getStripeServerClient();
    const { stripeWebhookSecret } = getStripeServerEnv();
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      stripeWebhookSecret,
    );

    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        await markOrderPaid(event.data.object as Stripe.Checkout.Session);
        break;
      case "checkout.session.async_payment_failed":
      case "checkout.session.expired":
        await markOrderCancelled(event.data.object as Stripe.Checkout.Session);
        break;
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error", error);
    return NextResponse.json({ error: "Webhook handler failed." }, { status: 400 });
  }
}
