# Work Completed

Purpose: record finished feature work only. Do not list planned work, setup chores, or partial implementation here.

## Bundle System

- [x] Phase 1 Bundle Maker is implemented in the existing admin Product Inventory section.
- [x] Bundle Maker now includes inventory component selection.

Completed behavior:

- Admin now has a `Bundle Maker` dropdown inside `Product Inventory`, directly after `Add New Product Card`.
- The form creates a normal product row in a `Bundles` category, creating that category automatically if it does not exist.
- The form now includes `Bundle Items From Inventory`, where each row selects an inventory product, optional variant, and quantity.
- Creating a bundle saves selected items into `bundle_components` linked to the created bundle product.
- Bundle listings support a fun bundle name, optional SKU, description, image upload, base price, stock, sale label, cart button text, Featured, Hot Item, Sale On, and Active flags.
- Because bundles are stored as normal active products, they are compatible with the existing shop and promo popup product selector path.
- The saved component list is the database foundation for later bundle checkout/component stock deduction.

Files changed:

- `web/src/app/admin/actions.ts`
- `web/src/app/admin/page.tsx`
- `web/src/components/admin-bundle-maker.tsx`
- `web/supabase/migrations/202603300002_bundle_components.sql`
- `web/src/lib/supabase/types.ts`

Database:

- Added `bundle_components`.
- Applied with `cd web && npx supabase db push`.

Verification:

- Passed: targeted ESLint for changed admin bundle/template files.
- Passed: `cd web && npm run build`
- Passed: `curl http://localhost:3000/admin` returned `200 text/html`

Known limitation:

- No live bundle record was submitted to Supabase during this pass, to avoid creating test inventory data without permission.
- Checkout/order inventory deduction still does not deduct the saved bundle components yet.
- Bundle price is still manually entered; automatic component price math is still planned work.

## Variant Template System

- [x] Variant template foundation is implemented and wired into admin Variant Inventory.

Completed behavior:

- New reusable shirt templates can be created from inside `Variant Inventory (Size/Color)`.
- A template stores template name, brand name, active flag, selected sizes, size sort order, and price per size.
- The template panel appears above manual variant entry.
- Applying a template asks for color and stock per size, then generates real `product_variants` rows.
- Generated variants store size, color, brand, SKU, price override, stock, active flag, and source template id.
- Manual one-off variant entry remains available below the template panel and now includes Brand.
- Storefront product detail can distinguish brand options so brand-specific prices can be selected.
- Cart/checkout metadata carries the selected variant brand label.

Files changed:

- `web/supabase/migrations/202603300001_variant_templates.sql`
- `web/src/app/admin/actions.ts`
- `web/src/app/admin/page.tsx`
- `web/src/components/admin-variant-template-panel.tsx`
- `web/src/lib/product-variants.ts`
- `web/src/lib/supabase/types.ts`
- `web/src/lib/storefront.ts`
- `web/src/components/product-detail-purchase.tsx`
- `web/src/components/add-to-cart-button.tsx`
- `web/src/lib/cart.ts`
- `web/src/lib/checkout-schema.ts`
- `web/src/app/api/checkout/cart/route.ts`
- `web/src/components/checkout-client.tsx`

Database:

- Added `variant_templates`.
- Added `variant_template_sizes`.
- Added `product_variants.brand_name`.
- Added `product_variants.source_template_id`.
- Replaced the old product/size/color unique variant index with product/size/color/brand uniqueness.
- Applied with `cd web && npx supabase db push`.

Verification:

- Passed: targeted ESLint for changed template, variant, storefront, cart, and checkout files.
- Passed: `cd web && npm run build`.
- Passed: `curl http://localhost:3000/admin` returned `200 text/html` and rendered the template UI text.

Known limitation:

- No live template or generated variant was submitted through the admin form during this pass, to avoid creating test inventory data without explicit approval.
- Existing older variants may have brand blank until edited or regenerated.
- There is create/apply support for templates; edit/deactivate template UI can be added next if needed.

## Variant Inventory Size Field

- [x] Existing manual variant add/edit forms now use a size dropdown instead of a plain typed size input.

Completed behavior:

- The dropdown uses the existing ordered size list from `web/src/lib/product-variants.ts`.
- Existing custom or one-off sizes still work through a `Custom / one-off` option.
- The form still submits the same `sizeValue` field expected by existing server actions.

Files changed:

- `web/src/components/admin-variant-size-field.tsx`
- `web/src/app/admin/page.tsx`

Verification:

- Passed in the same targeted lint and production build listed under Bundle System.

## Brand / Material Pricing

- [ ] No brand/material pricing implementation has been completed yet.

## Admin ADHD Helper

- [x] Admin backend now has two top-level management accordions.

Completed behavior:

- Added `Inventory Management System` as the first main admin accordion.
- Moved product inventory to the top of Inventory Management System.
- Nested Categories inside Product Inventory.
- Kept Upload Transfer Pricing after Product Inventory.
- Grouped Best Sellers and Funnel Analytics inside a nested Analytics accordion.
- Kept Orders and Uploads under Inventory Management System after Analytics.
- Reworked Orders and Uploads into its own nested admin accordion with a single command-bar layout for the current view, view filters, and cleanup actions.
- Added `Active Inventory Quick View` directly under Bundle Maker so category/product rows stay hidden until needed.
- Preserved the existing `inventory-group-*` and `product-*` anchors inside Active Inventory Quick View.
- Made the Categories area more compact with a responsive grid that can show up to four category cards per row on wide screens.
- Kept the category Active checkbox in each category card.
- Added a confirmation dialog when saving a category from active to inactive while it still has products.
- Updated category deactivation so products in that category are moved to Uncategorized, matching delete-category fallback behavior.
- Clarified that Categories is category setup only, not the place to add product inventory.
- Moved the Add New Product category selector before Title and relabeled it `Category For This Product`.
- Made Categories, Add Item or Product, and Bundle Maker appear as matching compact action cards at the top of Product Inventory.
- Renamed `Add New Product Card` to `Add Item or Product`.
- Lightened Bundle Maker styling and made it expand full-width only when opened.
- Added `Content Management System` as the second main admin accordion.
- Moved homepage hero, promotional popup, homepage feature cards, and customer messages under Content Management System.
- Added different color tones to the main accordions and nested admin accordions to create visual separation.
- Confirmed the accordions are closed by default in the rendered HTML.
- Preserved existing admin anchors and state keys, including `product-inventory`, `bundle-maker`, `orders-uploads`, and `customer-messages`.
- Added quick admin menu links for `Inventory Management` and `Content Management`.

Files changed:

- `web/src/app/admin/page.tsx`
- `WORK_PLANNED.md`
- `BUNDLE_AND_VARIANT_TODO.md`

Verification:

- Passed: `cd web && npx eslint src/app/admin/page.tsx`
- Passed: `cd web && npm run build`
- Passed: `curl http://localhost:3000/admin` returned `200 text/html` and rendered both new management system headings.
- Passed: `curl http://localhost:3000/admin` rendered the updated Orders command labels `Current View`, `Order Cleanup`, `Archive Completed Orders`, and `Clear Archived Orders`.
- Passed: `curl http://localhost:3000/admin` rendered `Bundle Maker` before `Active Inventory Quick View`.
- Passed: `cd web && npx eslint src/app/admin/page.tsx src/app/admin/actions.ts src/components/admin-category-save-button.tsx`
- Passed: `cd web && npm run build`
- Passed: `curl http://localhost:3000/admin` returned `200 text/html` and rendered category save controls.
- Passed: `curl http://localhost:3000/admin` rendered `Category setup only`, `Category For This Product`, and the category assignment helper text.
- Passed: `curl http://localhost:3000/admin` rendered `Add Item or Product`, `Bundle Maker`, and the lighter bundle helper text.

## Responsive Mobile Pass

- [x] Storefront and admin layouts now scale more cleanly on narrow screens without introducing separate mobile pages or alternate build paths.

Completed behavior:

- The shared site shell now uses tighter small-screen spacing and a fuller mobile navigation panel instead of a cramped dropdown.
- Storefront hero and key page headers use smaller mobile spacing and heading scale while preserving the same components and routes.
- Homepage featured products now render as a mobile-only swipeable carousel with automatic rotation instead of stacking cards vertically on phone widths.
- Admin banner/help behavior is more phone-friendly, including suppressing the floating desktop help launcher on narrow viewports.
- Admin alert actions, image upload controls, popup product selection, and variant template controls now stack and wrap more cleanly on phones.

Files changed:

- `web/src/app/globals.css`
- `web/src/app/page.tsx`
- `web/src/app/shop/page.tsx`
- `web/src/app/upload/page.tsx`
- `web/src/app/admin/page.tsx`
- `web/src/components/site-shell.tsx`
- `web/src/components/mobile-site-nav.tsx`
- `web/src/components/featured-products-carousel.tsx`
- `web/src/components/admin-help-shell.tsx`
- `web/src/components/admin-attention-alerts.tsx`
- `web/src/components/admin-image-upload-field.tsx`
- `web/src/components/admin-popup-product-selector.tsx`
- `web/src/components/admin-variant-template-panel.tsx`

Verification:

- Passed: `cd web && npx eslint src/components/site-shell.tsx src/components/mobile-site-nav.tsx src/components/admin-help-shell.tsx src/components/admin-attention-alerts.tsx src/components/admin-image-upload-field.tsx src/components/admin-popup-product-selector.tsx src/components/admin-variant-template-panel.tsx src/app/admin/page.tsx src/app/page.tsx src/app/shop/page.tsx src/app/upload/page.tsx`
- Passed: `cd web && npm run build`
- Passed storefront route sweep at current browser width for `/`, `/shop`, `/upload`, `/about`, `/contact`, and `/cart` with matching `window.innerWidth`, `document.documentElement.scrollWidth`, and `document.body.scrollWidth`.

Known limitation:

- This pass focused on responsive layout and interaction density, not on redesigning every storefront/admin screen. Additional page-by-page polish can still be layered on top of the same responsive code path.

## Homepage Upload Entry

- [x] The homepage now contains the primary custom-order upload flow in place of the old Home `How it works` section.

Completed behavior:

- The Home page now reuses the existing upload checkout form inside a `Custom Orders / Upload Your Design` section with a client-side open/close button.
- The old Home `How it works` promo block was replaced with concise custom-order instructions, accepted file-type guidance, and the live upload form.
- The homepage no longer promotes a separate Upload destination through the top nav, mobile nav, footer, or Home site-guide card.
- Existing storefront CTA traffic can still point directly to `/upload` where needed; the homepage section uses the same underlying checkout path without changing tables or backend flow.
- The `/upload` route still responds directly as a background route, but it is no longer the primary customer-facing entry path.

Files changed:

- `web/src/app/page.tsx`
- `web/src/components/site-shell.tsx`

Verification:

- Passed: `cd web && npx eslint src/app/page.tsx src/components/site-shell.tsx src/components/order-form.tsx src/app/upload/page.tsx`
- Passed: `cd web && npm run build`
- Passed: `curl -sS http://localhost:3000/ | grep -o 'Custom Orders\|Upload Your Design\|Open Upload\|/#custom-orders' | sort | uniq`
- Passed: `curl -sS -o /dev/null -w '%{http_code}\n' http://localhost:3000/upload` returned `200`
- Passed route reachability check: `curl -sS -o /dev/null -w '%{http_code}\n' -X POST http://localhost:3000/api/checkout` returned `503` in the current environment, confirming the endpoint is live but payments are currently unavailable without configured Stripe runtime state.

Known limitation:

- The safe checkout API verification was intentionally non-destructive, so it only confirmed route reachability and current environment status; it did not create a live order or complete a Stripe session.

## Admin Tutorial Refresh

- [x] The admin tutorial now matches the updated inventory/content workflow and is more usable on mobile.

Completed behavior:

- Rewrote the tutorial sections around Start Here, Login and Safety, Inventory Management, Products/Templates/Variants, Bundle Maker, Orders and Uploads, Content Management, and Quick Fixes.
- Added guidance for the new Inventory Management System and Content Management System grouping.
- Added practical instructions for product creation, template helpers, variant pricing, bundle creation, and mobile help use.
- Reduced the mobile help entry from a large stacked banner to a compact row so it does not take over the phone screen.
- Tightened the full help page spacing on mobile by hiding long table-of-contents summaries and reducing help section padding.

Files changed:

- `web/src/lib/admin-help-content.ts`
- `web/src/components/admin-help-content.tsx`
- `web/src/app/globals.css`

Verification:

- Passed: `cd web && npx eslint src/lib/admin-help-content.ts src/components/admin-help-content.tsx src/components/admin-help-shell.tsx src/app/admin/help/page.tsx`
- Passed: `curl -sS -b /tmp/wrd-admin-cookies.txt http://localhost:3000/admin/help -o /tmp/wrd-admin-help-updated.html -w 'GET /admin/help -> %{http_code}\n' --max-time 30` returned `200`
- Passed tutorial content checks for `Start Here`, `Products, Templates, and Variants`, `Bundle Maker`, `Login and Safety`, `Quick Fixes`, and `Content Management`.

## ADHD-Friendly Tutorial Rewrite

- [x] The admin tutorial was simplified into a shorter task guide for ADHD-friendly use.

Completed behavior:

- Reduced the tutorial to five plain-language sections: Start Here, Add or Edit Products, Sizes/Brands/Templates, Make a Bundle, and Orders/Content/Fixes.
- Replaced manual-style wording with short action instructions and three-bullet sections.
- Restyled tutorial sections into calmer step cards with less visual noise.
- Kept mobile spacing compact so the tutorial does not dominate the phone screen.

Files changed:

- `web/src/lib/admin-help-content.ts`
- `web/src/app/globals.css`

Verification:

- Passed: `cd web && npx eslint src/lib/admin-help-content.ts src/components/admin-help-content.tsx src/components/admin-help-shell.tsx src/app/admin/help/page.tsx`
- Passed: `curl -sS -b /tmp/wrd-admin-cookies.txt http://localhost:3000/admin/help -o /tmp/wrd-admin-help-adhd.html -w 'GET /admin/help -> %{http_code}\n' --max-time 30` returned `200`
- Passed initial render checks for `Start Here`, `Add or Edit Products`, `Sizes, Brands, Templates`, `Make a Bundle`, and `Orders, Content, Fixes`.

## Mobile Tutorial Layout Fix

- [x] The mobile/tablet help section picker no longer stacks as giant full-width blocks before the tutorial content.

Completed behavior:

- On phone/tablet widths, the tutorial section picker is now a compact horizontal row.
- Long section summaries are hidden in the mobile picker and closed section rows.
- Open tutorial content uses tighter spacing so the first useful instructions appear sooner.
- Restarted the local Node server so stale tutorial content was cleared.

Files changed:

- `web/src/app/globals.css`

Verification:

- Passed: `cd web && npx eslint src/lib/admin-help-content.ts src/components/admin-help-content.tsx src/components/admin-help-shell.tsx src/app/admin/help/page.tsx`
- Passed: `curl -sS -b /tmp/wrd-admin-cookies.txt http://localhost:3000/admin/help -o /tmp/wrd-admin-help-mobile-fix.html -w 'GET /admin/help -> %{http_code}\n' --max-time 30` returned `200`
- Passed content checks for `Start Here`, `Add or Edit Products`, `Sizes, Brands, Templates`, `Make a Bundle`, and `Orders, Content, Fixes`.
- Passed: `cd web && npm run build`

## First-Pass Technical SEO and Admin Footer Cleanup

- [x] First-pass technical SEO is implemented and the public storefront footer is removed from admin routes.

Completed behavior:

- Added Next.js-generated `robots.txt`.
- Added Next.js-generated `sitemap.xml` with static storefront pages and product detail URLs.
- Added `llms.txt` as a short AI-readable site summary.
- Added noindex robots metadata for admin, cart, and checkout routes.
- Strengthened page descriptions and canonical URLs for Home, Shop, Upload, About, and Contact.
- Reworked the admin header quick links into flatter grouped controls for View Site, Manage Work, and Help / Account.
- Moved the public footer into a route-aware component so `/admin` pages do not render the storefront footer.

Files changed:

- `web/src/app/layout.tsx`
- `web/src/app/robots.ts`
- `web/src/app/sitemap.ts`
- `web/public/llms.txt`
- `web/src/app/admin/layout.tsx`
- `web/src/app/cart/page.tsx`
- `web/src/app/checkout/page.tsx`
- `web/src/app/about/page.tsx`
- `web/src/app/contact/page.tsx`
- `web/src/app/shop/page.tsx`
- `web/src/app/upload/page.tsx`
- `web/src/app/admin/page.tsx`
- `web/src/components/site-shell.tsx`
- `web/src/components/site-footer.tsx`

Verification:

- Passed: `cd web && npx eslint src/app/robots.ts src/app/sitemap.ts src/app/layout.tsx src/app/admin/layout.tsx src/app/about/page.tsx src/app/contact/page.tsx src/app/shop/page.tsx src/app/upload/page.tsx src/app/cart/page.tsx src/app/checkout/page.tsx src/components/site-shell.tsx src/components/site-footer.tsx src/app/admin/page.tsx`
- Passed: `cd web && npm run build`
- Passed: `curl http://localhost:3000/robots.txt` rendered admin/api/cart/checkout disallows and a sitemap URL.
- Passed: `curl http://localhost:3000/sitemap.xml` rendered the storefront static routes and product URLs.
- Passed: `curl http://localhost:3000/llms.txt` rendered the AI-readable Wild Rose Designs summary.
- Passed: public Home route still renders the storefront footer text.
- Passed: admin route check does not render the storefront footer text.

Known limitation:

- This is SEO pass 1 only. Rich product schema, FAQ content, local business details, and deeper product/category copy can be added in a later pass.

## Completed Feature Notes

When a feature is actually finished, document it here with:

- Exact user-visible behavior completed.
- Files changed.
- Database migrations added/applied.
- Verification commands run.
- Known limitations, if any.
