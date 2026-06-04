# Work Planned

Purpose: preserve the plan clearly enough that another agent or Copilot can continue without guessing.

Project: Wild Rose Designs admin/inventory system

Current priority: correct the Add Product workflow so brand/size/color pricing is visible and usable on the first product card, then finish bundle item selection and only after that do the broader ADHD/calm admin grouping pass.

Responsive baseline note: a focused storefront/admin mobile responsiveness pass has been completed in the existing Next app without changing routes, data flow, or build architecture. Any further mobile polish should build on that responsive layer rather than introducing separate mobile views.

## Ground Rules

- Use the existing agent system when building pages or features.
- Be surgical. Do not replace working admin, storefront, cart, checkout, or Supabase flows.
- Do not commit secrets. `web/.env.local` is local-only and ignored.
- Do not create live Supabase test inventory, bundle, product, order, or customer data without explicit user approval.
- Keep manual product/variant entry. Templates and bundles must speed things up, not remove one-off flexibility.
- Variant brand/size template pricing is the algebra foundation for true bundle pricing.
- New UI should avoid rounded bubble-style buttons.
- Keep the admin usable for someone with ADHD: progressive disclosure, short labels, clear next actions, no giant walls of fields.

## Corrected Add Product Workflow Plan

This is the current source of truth for the inventory workflow.

- [ ] Add Product must be the main path. A user should be able to create a normal one-off product without choosing or creating a template.
- [ ] The Add Product form order should be:
  - [ ] Category dropdown.
  - [ ] Title.
  - [ ] Optional saved shirt setup dropdown.
  - [ ] Product basics: SKU, description, image, base/fallback price.
  - [ ] Shirt setup: brand/style, colors, ordered sizes, and price per size.
  - [ ] Sale toggle and sale fields only when sale is relevant.
  - [ ] Featured / Hot Item / Active.
  - [ ] Primary action: Add Product.
  - [ ] Secondary action: Create Template From These Settings.
- [ ] There must not be a “choose template” checkbox/radio mode selector.
- [ ] Saved templates should be selected from one dropdown populated by existing `variant_templates`.
- [ ] If a saved template is selected, applying it should fill/use brand and size prices for the current product while still allowing product-specific colors.
- [ ] If no template exists or the item is special, the admin can type brand/style, choose sizes, enter prices, enter colors, and add the product directly.
- [ ] Create Template From These Settings should snapshot only reusable shirt setup data:
  - [ ] template name
  - [ ] brand/style
  - [ ] selected sizes
  - [ ] size sort order
  - [ ] price per size
- [ ] Create Template From These Settings must not save the product title or product SKU into the template.
- [ ] Product-level stock should not be a visible required field in Add Product because this is custom-order work. Keep backend stock safe with a hidden/default availability value until a richer custom-order availability model is added.
- [ ] Sale should be presented as “Is this item on sale?” with sale percent/label tucked behind that choice.
- [ ] Generated product variants must represent every selected size/color/brand combination with the right price override.
- [ ] Manual one-off variant creation/editing must remain available on existing product cards.

## Customer Product Selection Plan

- [ ] Customer product detail pages should let the shopper choose:
  - [ ] design/product
  - [ ] size
  - [ ] color
  - [ ] shirt brand/style
- [ ] Price should update from the selected variant's brand/size price override.
- [ ] If the customer does not pick a brand/style, default to `Bella+Canvas` when available; otherwise use the first active available brand/style.
- [ ] If the admin later adds a new shirt brand/style and applies it to a product, the customer-facing selector should show that option without hard-coded brand names.

## Corrected Bundle Maker Plan

- [x] Bundle Maker exists inside Product Inventory.
- [x] Bundle Maker can create a bundle product row.
- [x] Bundle Maker can save selected inventory product/variant/quantity rows into `bundle_components`.
- [ ] Make the bundle picking workflow feel like: name the bundle, set one bundle price, then click/select inventory items into the bundle.
- [ ] Keep bundle price as one admin-entered set price for this phase, matching the spirit bundle example.
- [ ] Do not build automatic bundle algebra until Add Product variant brand/size pricing is stable.
- [ ] Later bundle checkout work should use saved component rows plus customer-selected size/brand/color choices.

## Admin ADHD Grouping Plan

- [x] Create a top-level `Inventory Management System` accordion.
- [x] Put product/category/template/bundle/order work under Inventory Management System as short labeled sub-accordions.
- [x] Put Product Inventory first inside Inventory Management System.
- [x] Nest Categories inside Product Inventory.
- [x] Put Upload Transfer Pricing after Product Inventory.
- [x] Put Best Sellers and Funnel Analytics under one Analytics accordion.
- [x] Create a top-level `Content Management System` accordion.
- [x] Put promotional popup, welcome posts, about/contact content, and customer messages under Content Management System as short labeled sub-accordions.
- [x] Keep copy short and action-focused.
- [x] Keep defaults collapsed so the backend does not read as one giant wall.
- [x] Add different color tones to break apart accordion groups visually.
- [x] Avoid rounded bubble-style buttons in new grouping UI.

## Current Known State

- Main admin route: `/admin`
- Homepage custom-order entry is now on `/` in a `#custom-orders` section using the existing upload checkout flow with a client-side open/close toggle.
- `/upload` still works, but it is no longer intended to be the primary customer entry point.
- Homepage featured products now need to preserve the mobile carousel behavior during future homepage edits; do not revert it back to stacked mobile cards.
- Product inventory section anchor: `/admin#product-inventory`
- Product inventory UI is in `web/src/app/admin/page.tsx`.
- Product/admin server actions are in `web/src/app/admin/actions.ts`.
- Product variants table already exists as `product_variants`.
- Promo popup can already feature any active product row selected by `promo_popups.product_id`.
- Variant template schema now exists for reusable shirt brand/size pricing.
- There is no true bundle component schema yet.
- Safest first bundle approach: create bundles as normal product rows in a `Bundles` category, then improve into true component-level bundle inventory later.

## Existing Relevant Files

- `web/src/app/admin/page.tsx`
  - Admin dashboard UI.
  - Product Inventory section.
  - Variant Inventory `(Size/Color)` container.
  - Promo Popup section.
- `web/src/app/admin/actions.ts`
  - `createProduct`
  - `updateProductCard`
  - `createProductVariant`
  - `updateProductVariant`
  - `deleteProductVariant`
  - `savePromoPopup`
- `web/src/components/admin-variant-size-field.tsx`
  - New size dropdown component with custom one-off option.
- `web/src/lib/storefront.ts`
  - Storefront product/category/popup loading.
- `web/src/components/hot-item-popup.tsx`
  - Homepage popup rendering.
- `web/src/components/product-detail-purchase.tsx`
  - Variant selection and pricing on product detail page.
- `web/src/app/api/checkout/cart/route.ts`
  - Server-side cart validation and variant price/stock enforcement.
- `web/src/lib/order-sales.ts`
  - Paid order inventory movement creation.
- `web/supabase/migrations/202603080004_product_variants_and_funnel_events.sql`
  - Existing `product_variants` table and inventory movement trigger.

## Bundle Implementation Plan

### Phase 1: Make Bundles Visible And Usable With Existing Product System

- [x] Ensure a `Bundles` category can exist in admin.
- [x] Add a visible `Bundle Maker` area inside the existing `Product Inventory` section.
- [x] Place `Bundle Maker` after `Add New Product Card` and before category/product rows.
- [x] Let admin create a bundle product row using existing products table.
- [x] Bundle form should include:
  - [x] Fun bundle name/title.
  - [x] Category defaulted to `Bundles`.
  - [x] Description.
  - [x] Image upload.
  - [x] Base bundle price.
  - [x] Stock.
  - [x] Sale label / cart button text.
  - [x] Featured / Hot Item / Active flags.
- [x] Make bundle product compatible with existing popup selection by storing it as a normal active product row.
- [x] Do not introduce true component inventory deduction yet in Phase 1.
- [x] Label Phase 1 clearly in admin copy as “bundle listing” and note that component-level bundle inventory comes next.

Phase 1 known limitation: no real bundle product was submitted against production Supabase during this pass, to avoid creating test inventory data without permission. Lint and production build passed.

### Phase 2: Quick Variant Builder Inside Variant Inventory

- [x] Add template builder/apply panel inside each product’s `Variant Inventory (Size/Color)` container.
- [x] Put it above the current manual one-off variant form.
- [x] Keep the existing manual one-off variant form.
- [x] Use an ordered size selector for the existing manual add/edit variant size field.
- [x] Support multi-size selection with checkboxes when creating/applying templates.
- [x] Sort selected sizes by the existing size order from `web/src/lib/product-variants.ts`.
- [x] Allow color entry when applying a template.
- [x] Allow stock default when applying a template.
- [x] Use template size pricing as generated variant price overrides.
- [x] Batch-create variant rows from selected template sizes.
- [ ] Prevent duplicate size/color/brand rows before insert where possible.
- [ ] Preserve existing `variant_conflict` behavior for database unique conflicts.

### Phase 3: Brand / Material Template Foundation

- [x] Add database migration for reusable template records.
- [ ] Proposed tables:
  - [x] `variant_templates`
  - [x] `variant_template_sizes`
- [ ] Templates need:
  - [x] Custom template name, e.g. `Gildan Blue Face Banana`.
  - [x] Brand/material name, e.g. `Gildan Softstyle`, `Bella+Canvas`.
  - [x] Size labels.
  - [x] Size sort order.
  - [x] Price per size.
  - [x] Active flag.
- [x] Add admin section for creating templates inside Variant Inventory.
- [x] Use template as generator/helper only.
- [x] Once generated, product owns its variants so old products do not unexpectedly change when template prices change.
- [ ] Add edit/deactivate UI for existing templates if needed.

### Phase 4: Bundle Component Model

- [ ] Decide whether bundle inventory is independent stock or derived from component stock during checkout.
- [x] Add bundle component schema.
- [ ] Likely tables:
  - [x] `bundle_components`
  - [ ] optional `bundle_component_options`
- [ ] A bundle can contain multiple items:
  - [x] Example: 2 short sleeve shirts.
  - [x] Example: 1 long sleeve shirt.
  - [x] Example: 1 sweatshirt.
- [ ] Bundle price must adjust by:
  - [ ] selected size
  - [ ] selected brand/material
  - [ ] component type
- [ ] Store selected component/variant details in cart/order metadata.
- [ ] Deduct component stock correctly after payment.
- [ ] Show clear bundle selection UI on storefront product detail page.
- [x] Let admin pick inventory products/variants/quantities while creating a bundle listing.
- [x] Save selected bundle components linked to the created bundle product.

### Phase 5: Popup Bundle Support

- [ ] Phase 1 bundle-as-product should already work with popup inventory selection.
- [ ] Verify popup can feature a bundle product row.
- [ ] Verify popup CTA goes to `/shop/[bundle-slug]`.
- [ ] Verify fun popup names and bundle promo labels display cleanly.
- [ ] Later, if true bundle type is added, update popup product option search to show bundle labels.

## Admin ADHD Helper Plan

Deferred until bundle workflow is functional.

- [ ] Add this as separate implementation after bundle work.
- [ ] Reduce top admin navigation density.
- [ ] Add quick-start cards:
  - [ ] Review orders.
  - [ ] Read messages.
  - [ ] Manage products.
- [ ] Move urgent work queues higher if needed.
- [ ] Make section descriptions shorter and more action-oriented.
- [ ] Keep major sections collapsed.
- [ ] Convert messages/orders wrappers to consistent dropdown sections if it does not disrupt workflow.
- [ ] Keep all features available.

## Verification Checklist

- [x] `npm run build`
- [x] Targeted lint for changed files.
- [x] Confirm `/admin` loads real admin, not Local Preview Mode.
- [x] Confirm Variant Inventory template UI renders in admin.
- [ ] Confirm a real template can be created with a live admin form submission.
- [x] Investigate why uploaded customer design files are not appearing in the expected Supabase storage bucket, without creating live test data unless explicitly approved.
- [x] Add paid-order email notification for Johanna through the existing Stripe webhook without changing checkout behavior.
- [x] Add an ADHD-friendly Customer Uploads inbox inside admin Orders and Uploads so Johanna can quickly find and download uploaded designs.
- [ ] Confirm a real template can generate product variants with a live admin form submission.
- [ ] Confirm bundle product can be created with a real admin form submission.
- [ ] Confirm bundle product appears in Product Inventory.
- [ ] Confirm bundle product appears in Shop.
- [x] Confirm Bundle Maker item picker renders in admin.
- [ ] Confirm bundle product can be selected in Promo Popup admin.
- [ ] Confirm popup can link to bundle product.
- [ ] Confirm manual variant create/update/delete still works.
- [ ] Confirm size dropdown custom one-off still works.
- [ ] Confirm cart/checkout still works for normal products.
- [ ] Clean external-drive `._*` sidecar files before git operations.

## Handoff Notes

- Supabase project linked with CLI to project ref `ahanzigwiclxzplgojeq`.
- Local dev env is in `web/.env.local`.
- `web/.env.local` contains secrets and must not be committed.
- Admin bypass is enabled locally with `ADMIN_BYPASS_AUTH=true`.
- Dev server command: `cd web && npm run dev`.
- Admin URL: `http://localhost:3000/admin`.
