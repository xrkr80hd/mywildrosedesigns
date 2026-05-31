# Bundle And Variant System TODO

Design guardrails:
- Keep the admin workflow calm, compact, and step-by-step.
- Do not use rounded bubble-style buttons for new UI. Prefer restrained rectangular controls with small radius.
- Preserve manual variant entry for one-off products.
- Add template speed paths inside the existing Variant Inventory (Size/Color) container.
- Do not replace current product, checkout, cart, or popup behavior without checking all dependents.

## Current Understanding

- Product inventory lives on the main admin dashboard in `web/src/app/admin/page.tsx`.
- `/admin/inventory` is only a shortcut back to `/admin#product-inventory`.
- Product variants currently support size, color, SKU, price override, stock, and active status.
- Checkout already uses variant stock and variant price override when variants exist.
- Promo popup currently links to one inventory product or a custom slug.
- The corrected workflow starts in Add Product, not inside existing product cards.
- Shirt brand/style, colors, sizes, and price-per-size must be visible while creating a new product.
- Templates are optional speed helpers. They must never replace one-off product creation.

## Phase 1: Add Product Shirt Setup

- [ ] Put Category first, then Title.
- [ ] Add one optional `Choose saved shirt setup` dropdown near the top.
- [ ] Remove any radio/checkbox mode selector for choosing templates.
- [ ] Show shirt brand/style directly in Add Product.
- [ ] Show colors available directly in Add Product.
- [ ] Show ordered size checkboxes directly in Add Product.
- [ ] Show editable price per selected size directly in Add Product.
- [ ] Allow Add Product with no saved template selected.
- [ ] Allow Add Product with a saved template applied.
- [ ] Allow Add Product from fresh manual brand/color/size/price settings.
- [ ] Add a secondary `Create Template From These Settings` action.
- [ ] Template snapshot must save brand/style, selected sizes, size order, and size prices only.
- [ ] Template snapshot must not save product title or product SKU.
- [ ] Hide product-level stock from the Add Product UI and use a backend-safe default for custom-order availability.
- [ ] Replace always-visible sale fields with a simple sale toggle and conditional sale fields.

## Phase 2: Variant Template Foundation

- [x] Add reusable template tables for named templates.
- [x] Add template item/size price rows so size and brand/material can change price.
- [x] Support user-defined template names such as `Gildan Blue Face Banana`.
- [x] Store template size order so selected sizes always display consistently.
- [x] Keep templates as helpers that generate product-owned variants, not live-linked rules that unexpectedly change old products.
- [ ] Wire Add Product so it can create a template from the current shirt setup.
- [ ] Wire Add Product so selecting a template generates variants for every selected size/color/brand combination.
- [ ] Pre-check duplicates where practical before insert while preserving database conflict fallback.

## Phase 3: Admin Variant Workflow

- [x] Place template picker inside `Variant Inventory (Size/Color)` above manual variant choices.
- [x] Add dropdown to select a named template.
- [x] Replace single manual size typing with an ordered size dropdown plus a custom one-off option.
- [x] Add ordered size multi-select with checkboxes.
- [x] Sort selected sizes into the saved size order no matter what order they were clicked.
- [x] Generate variant rows from selected template, sizes, colors, and stock defaults.
- [x] Keep manual variant creation visible and available for special one-off items.
- [x] Allow manual price/stock/SKU edits after generated variants are created.
- [ ] Remove redundant template creation UI from existing product cards once Add Product template snapshot exists.

## Phase 4: Brand/Material Pricing

- [x] Add brand/material field to generated variants or template source records.
- [x] Support different pricing by brand and size through variant price overrides.
- [x] Example: `Gildan Softstyle` small shirt is `$18.00`.
- [x] Example: `Bella+Canvas` small shirt is `$20.00`.
- [ ] Make brand/material templates manageable from Add Product without overwhelming the user.
- [ ] Default storefront brand/style to `Bella+Canvas` when available, otherwise first active brand/style.
- [ ] Confirm newly added admin shirt brands appear automatically on customer product cards after variants are generated.

## Phase 5: Bundle Maker

- [x] Add a bundle product/category concept that can appear in storefront categories.
- [x] Add admin Bundle Maker.
- [x] Allow a bundle to contain multiple items, such as two short sleeve shirts and one sweatshirt.
- [x] Let bundle components use existing inventory/template choices.
- [x] Let admin set one bundle price manually.
- [ ] Make the Bundle Maker wording/workflow calmer: name bundle, set price, add inventory items.
- [ ] Let bundle price adjust based on selected size, brand/material, and component type.
- [x] Support fun, engaging bundle names.
- [x] Keep one-off/custom bundle creation possible.

## Phase 6: Popup Bundle Support

- [x] Update popup admin selection so it can feature bundles by storing bundles as normal products.
- [ ] Let popup title, promo label, CTA text, and message use fun custom naming.
- [ ] Preserve current popup fallback behavior for hot products.
- [ ] Verify homepage popup renders bundle image, title, price, and CTA correctly.

## Phase 7: ADHD Backend Grouping

- [x] Create top-level `Inventory Management System` accordion.
- [x] Put product management, category management, shirt setup/templates, bundle maker, and order work under Inventory Management System.
- [x] Put Product Inventory at the top of Inventory Management System.
- [x] Nest Categories under Product Inventory.
- [x] Put Upload Transfer Pricing after Product Inventory.
- [x] Group Best Sellers and Funnel Analytics under an Analytics accordion.
- [x] Create top-level `Content Management System` accordion.
- [x] Put promotional popup, welcome posts, about/contact content, and customer messages under Content Management System.
- [x] Keep nested labels short and concrete.
- [x] Keep sections collapsed by default where possible.
- [x] Use different color tones to separate accordion groups visually.
- [ ] Replace new bubble-like controls with cleaner rectangular controls.
- [ ] Use collapsed sections and short helper copy to reduce overwhelm.
- [ ] Keep labels plain and concrete.
- [ ] Avoid giant walls of fields.
- [ ] Verify mobile admin layout does not create cramped or overlapping text.

## Phase 8: Verification

- [ ] Run lint/build checks.
- [ ] Verify admin product save.
- [ ] Verify manual variant create/update/delete.
- [ ] Verify template-generated variants.
- [ ] Verify product detail selection and price changes.
- [ ] Verify cart and checkout pricing.
- [ ] Verify popup with a normal product.
- [ ] Verify popup with a bundle.
