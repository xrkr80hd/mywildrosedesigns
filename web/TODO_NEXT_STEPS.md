# Wild Rose Admin and Storefront TODO

## Rules
- [ ] Do not push to production unless user explicitly says to push.

## P0 - Must Fix First
- [ ] Convert top admin sections into stacked accordion blocks:
  - Homepage Hero
  - Promotional Popup
  - Homepage Feature Cards
  - Categories
  - Product Inventory
- [ ] Add top-of-page notification alerts for new customer messages and new orders/uploads.
- [ ] Add "click off as read" behavior for those alerts (non-pill style).
- [ ] Ensure storefront only reflects active categories and active backend products (no dummy fallback rendering).
- [ ] Verify promotional popup save/load compatibility on legacy and current DB schema.
- [ ] Show popup product image in popup content and verify visibility.

## P1 - Product Configuration (Backend Controlled)
- [ ] Add product print options in backend (front-only and front-and-back) with separate prices.
- [ ] Add product type and size settings in backend:
  - Kids boy sizes
  - Kids girl sizes
  - Adult male sizes
  - Adult female sizes
- [ ] Save those settings on product records and expose to storefront loader.
- [ ] Show selectors on product detail page when card opens:
  - Print option
  - Size profile
  - Size
- [ ] Store selected option + size in cart item payload.
- [ ] Carry selected option + size into checkout/order notes and Stripe line item metadata.

## P1 - Admin Inventory UX
- [ ] Group product cards by category at the bottom of admin inventory section.
- [ ] Add dedicated manage inventory page for categories (create/update/delete).
- [ ] Add category delete action with guardrails (block delete if products still assigned).
- [ ] Keep compact row summaries with expandable detail editor.

## P1 - Uploaded Design Review
- [ ] Keep admin "Orders and Uploads" as primary review queue with signed download links.
- [ ] Add explicit quick link in admin header to jump directly to upload review section.
- [ ] Optional: add dedicated "Upload Review" admin page if needed.

## P2 - Data and Migration Hygiene
- [ ] Apply pending migrations in Supabase:
  - 202603050001_product_types_and_sizes.sql
  - 202603050002_category_images.sql
- [ ] Backfill existing products with sane defaults for new product type/size fields.
- [ ] Validate category image column fallback behavior after migrations are applied.

## P2 - QA and Cleanup
- [ ] Manual QA pass for admin save flows and storefront display.
- [ ] Manual QA pass for cart/checkout option pricing combinations.
- [ ] Remove screenshot artifact files from `web/` before final push.
- [ ] Final pre-push checks:
  - npm run lint
  - npx tsc --noEmit
