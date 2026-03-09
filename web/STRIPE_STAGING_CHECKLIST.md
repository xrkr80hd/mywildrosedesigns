# Stripe Staging Checklist

Use this when the Stripe account is ready and you want checkout fully live.

## 1) Add environment variables

Set these in Vercel for your production environment:

- `STRIPE_SECRET_KEY` (starts with `sk_live_` for live mode)
- `STRIPE_WEBHOOK_SECRET` (from Stripe webhook endpoint signing secret)
- `NEXT_PUBLIC_SITE_URL` (your public site URL, e.g. `https://yourdomain.com`)

Optional but recommended:

- `SUPABASE_UPLOAD_BUCKET` (defaults to `design-uploads` if omitted)

## 2) Create Stripe webhook endpoint

In Stripe dashboard:

- Endpoint URL: `https://<your-domain>/api/webhooks/stripe`
- Events to send:
  - `checkout.session.completed`
  - `checkout.session.async_payment_succeeded`
  - `checkout.session.async_payment_failed`
  - `checkout.session.expired`

Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.

## 3) Quick smoke test

1. Add a product to cart and open checkout.
2. Submit checkout details and confirm redirect to Stripe.
3. Complete payment using test card (if in test mode).
4. Confirm order status updates to `paid` in admin.
5. Test cancellation flow and verify order status can become `cancelled`.

## 4) Expected behavior before Stripe is configured

Until Stripe keys are set:

- Checkout APIs return `503` with a clear "payments are being configured" message.
- No orphan order rows or uploaded files are left behind by failed checkout starts.
