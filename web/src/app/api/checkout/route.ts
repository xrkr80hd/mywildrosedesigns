import { NextResponse } from "next/server";
import {
  checkoutRequestSchema,
  normalizeOptionalText,
} from "@/lib/checkout-schema";
import { getSiteUrl, getUploadBucket } from "@/lib/env";
import {
  getProductOptionById,
  PRODUCT_OPTION_IDS,
} from "@/lib/product-options";
import { getStripeServerClient } from "@/lib/stripe";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const MAX_UPLOAD_SIZE_BYTES = 50 * 1024 * 1024;

function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
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
  try {
    const formData = await request.formData();
    const parsedPayload = checkoutRequestSchema.safeParse({
      customerName: formData.get("customerName"),
      customerEmail: formData.get("customerEmail"),
      customerPhone: formData.get("customerPhone"),
      productOptionId: formData.get("productOptionId"),
      quantity: formData.get("quantity"),
      notes: formData.get("notes"),
    });

    if (!parsedPayload.success) {
      return NextResponse.json(
        { error: "Please check your form details and try again." },
        { status: 400 },
      );
    }

    const designFile = formData.get("designFile");
    if (!(designFile instanceof File)) {
      return NextResponse.json(
        { error: "Please upload a valid design file." },
        { status: 400 },
      );
    }

    if (designFile.size <= 0 || designFile.size > MAX_UPLOAD_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File size must be between 1 byte and 50MB." },
        { status: 400 },
      );
    }

    const selectedOption = getProductOptionById(parsedPayload.data.productOptionId);
    if (!selectedOption || !PRODUCT_OPTION_IDS.includes(selectedOption.id)) {
      return NextResponse.json({ error: "Invalid product option." }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
    const stripe = getStripeServerClient();
    const bucket = getUploadBucket();
    const filePath = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${sanitizeFileName(designFile.name)}`;

    const uploadResult = await supabase.storage
      .from(bucket)
      .upload(filePath, Buffer.from(await designFile.arrayBuffer()), {
        contentType: designFile.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadResult.error) {
      throw new Error(uploadResult.error.message);
    }

    const amountCents = selectedOption.amountCents * parsedPayload.data.quantity;
    const orderInsertResult = await supabase
      .from("orders")
      .insert({
        customer_name: parsedPayload.data.customerName,
        customer_email: parsedPayload.data.customerEmail,
        customer_phone: normalizeOptionalText(parsedPayload.data.customerPhone),
        notes: normalizeOptionalText(parsedPayload.data.notes),
        product_option: selectedOption.id,
        quantity: parsedPayload.data.quantity,
        amount_cents: amountCents,
        design_path: filePath,
        status: "pending_payment",
      })
      .select("id")
      .single();

    if (orderInsertResult.error || !orderInsertResult.data) {
      await supabase.storage.from(bucket).remove([filePath]);
      throw new Error(orderInsertResult.error?.message ?? "Unable to create order");
    }

    const orderId = orderInsertResult.data.id as string;
    const baseUrl = getBaseUrlFromRequest(request);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: parsedPayload.data.customerEmail,
      success_url: `${baseUrl}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cancel?order=${orderId}`,
      metadata: {
        order_id: orderId,
        product_option: selectedOption.id,
      },
      line_items: [
        {
          quantity: parsedPayload.data.quantity,
          price_data: {
            currency: "usd",
            unit_amount: selectedOption.amountCents,
            product_data: {
              name: selectedOption.name,
              description: selectedOption.description,
            },
          },
        },
      ],
      allow_promotion_codes: true,
    });

    if (!session.url) {
      throw new Error("Stripe session URL is missing.");
    }

    const orderSessionUpdate = await supabase
      .from("orders")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", orderId);

    if (orderSessionUpdate.error) {
      throw new Error(orderSessionUpdate.error.message);
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout initialization failed", error);
    return NextResponse.json(
      { error: "Unable to start checkout right now. Please try again." },
      { status: 500 },
    );
  }
}
