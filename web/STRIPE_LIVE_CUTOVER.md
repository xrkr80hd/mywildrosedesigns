# Stripe Live Cutover (Wild Rose Designs)

## 1) Vercel environment variables (Production)

Set these in the `web` project:

- `STRIPE_SECRET_KEY` = your live secret key (`sk_live_...`)
- `STRIPE_WEBHOOK_SECRET` = webhook signing secret for your live endpoint (`whsec_...`)
- `NEXT_PUBLIC_SITE_URL` = your live domain (for example `https://wildrosedesigns.com`)

Keep existing Supabase vars in place:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_UPLOAD_BUCKET` (optional, default is `design-uploads`)

## 2) Stripe Dashboard webhook (Live mode)

Create endpoint:

- URL: `https://<your-live-domain>/api/webhooks/stripe`

Subscribe events:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `checkout.session.expired`

Copy endpoint signing secret into `STRIPE_WEBHOOK_SECRET`.

## 3) Domain + payment method checks

- Enable your production domain in Stripe settings where required.
- Confirm enabled payment methods for live mode.
- Keep Stripe dashboard in **Live mode** while creating products/webhooks.

## 4) Live smoke test

1. Place a real low-amount order through `/checkout`.
2. Confirm redirect to Stripe hosted checkout.
3. Complete payment.
4. Verify order row status becomes `paid` in Supabase `orders`.
5. Confirm `stripe_payment_intent_id` is populated.
6. Test an abandoned/expired session and confirm status moves to `cancelled`.

## 5) Rollback safety

If anything is wrong, temporarily unset `STRIPE_SECRET_KEY` in production env.
Checkout APIs will return `503` and block new payment attempts until fixed.
