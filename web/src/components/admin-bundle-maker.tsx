"use client";

import { useMemo, useState } from "react";
import { AdminImageUploadField } from "@/components/admin-image-upload-field";

type BundleProductOption = {
  id: string;
  title: string;
  sku: string | null;
  price_cents: number;
};

type BundleVariantOption = {
  id: string;
  product_id: string;
  size_value: string | null;
  color_value: string | null;
  brand_name: string | null;
  sku: string | null;
  price_override_cents: number | null;
};

type BundleComponentRow = {
  rowId: number;
  productId: string;
  variantId: string;
  quantity: number;
};

type AdminBundleMakerProps = {
  action: (formData: FormData) => void | Promise<void>;
  products: BundleProductOption[];
  variants: BundleVariantOption[];
};

function formatUsd(amountCents: number) {
  return `$${(amountCents / 100).toFixed(2)}`;
}

function variantLabel(variant: BundleVariantOption) {
  const parts = [
    variant.size_value,
    variant.color_value,
    variant.brand_name,
    variant.sku ? `SKU ${variant.sku}` : null,
  ].filter(Boolean);
  return parts.join(" / ") || "Default variant";
}

export function AdminBundleMaker({
  action,
  products,
  variants,
}: AdminBundleMakerProps) {
  const selectableProducts = products.filter((product) => product.id);
  const [rows, setRows] = useState<BundleComponentRow[]>([
    {
      rowId: 1,
      productId: selectableProducts[0]?.id ?? "",
      variantId: "",
      quantity: 1,
    },
  ]);

  const variantsByProductId = useMemo(() => {
    const map = new Map<string, BundleVariantOption[]>();
    variants.forEach((variant) => {
      const current = map.get(variant.product_id) ?? [];
      current.push(variant);
      map.set(variant.product_id, current);
    });
    return map;
  }, [variants]);

  function updateRow(rowId: number, patch: Partial<BundleComponentRow>) {
    setRows((current) =>
      current.map((row) =>
        row.rowId === rowId
          ? {
              ...row,
              ...patch,
              variantId:
                patch.productId && patch.productId !== row.productId
                  ? ""
                  : (patch.variantId ?? row.variantId),
            }
          : row,
      ),
    );
  }

  function addRow() {
    setRows((current) => [
      ...current,
      {
        rowId: Date.now(),
        productId: selectableProducts[0]?.id ?? "",
        variantId: "",
        quantity: 1,
      },
    ]);
  }

  function removeRow(rowId: number) {
    setRows((current) =>
      current.length === 1
        ? current
        : current.filter((row) => row.rowId !== rowId),
    );
  }

  return (
    <form action={action} className="mt-3 grid gap-3 md:grid-cols-2">
      <input type="hidden" name="redirectTo" value="/admin#bundle-maker" />
      <label className="space-y-1">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">
          Bundle Name
        </span>
        <input
          name="title"
          required
          placeholder="Spirit Bundle Option 3"
          className="w-full rounded-md border border-rose/20 px-3 py-2 text-sm"
        />
      </label>
      <label className="space-y-1">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">
          SKU (optional)
        </span>
        <input
          name="sku"
          placeholder="Leave blank to auto-generate"
          className="w-full rounded-md border border-rose/20 px-3 py-2 text-sm"
        />
      </label>
      <label className="space-y-1 md:col-span-2">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">
          What is included
        </span>
        <textarea
          name="description"
          required
          rows={3}
          defaultValue={
            "Includes multiple apparel items. Final size/brand choices may change price for 2XL+ or premium brands."
          }
          className="w-full rounded-md border border-rose/20 px-3 py-2 text-sm"
        />
      </label>
      <AdminImageUploadField
        name="imageUrl"
        defaultValue="/assets/img/product-tee.svg"
        className="md:col-span-2"
        recommendedSize="1200 x 1200 px"
        helperText="Upload a bundle graphic or product collage."
      />

      <fieldset className="space-y-3 rounded-md border border-forest/15 bg-white/75 p-3 md:col-span-2">
        <legend className="px-1 text-xs font-semibold uppercase tracking-[0.12em] text-gold">
          Bundle Items From Inventory
        </legend>
        <p className="text-xs text-foreground/70">
          Pick the inventory items that make up this bundle. Use variant when
          the bundle must point at a specific size, color, or brand.
        </p>
        {rows.map((row, index) => {
          const productVariants = variantsByProductId.get(row.productId) ?? [];
          return (
            <div
              key={row.rowId}
              className="grid gap-2 rounded-md border border-rose/15 bg-surface/60 p-2 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1.4fr)_6rem_auto]"
            >
              <input
                type="hidden"
                name="componentProductIds"
                value={row.productId}
              />
              <input
                type="hidden"
                name="componentVariantIds"
                value={row.variantId}
              />
              <input
                type="hidden"
                name="componentQuantities"
                value={row.quantity}
              />
              <label className="space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gold">
                  Item {index + 1}
                </span>
                <select
                  value={row.productId}
                  onChange={(event) =>
                    updateRow(row.rowId, { productId: event.target.value })
                  }
                  className="w-full rounded-md border border-rose/20 px-3 py-2 text-sm"
                >
                  {selectableProducts.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.title} ({formatUsd(product.price_cents)})
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gold">
                  Variant
                </span>
                <select
                  value={row.variantId}
                  onChange={(event) =>
                    updateRow(row.rowId, { variantId: event.target.value })
                  }
                  className="w-full rounded-md border border-rose/20 px-3 py-2 text-sm"
                >
                  <option value="">Any / customer chooses later</option>
                  {productVariants.map((variant) => (
                    <option key={variant.id} value={variant.id}>
                      {variantLabel(variant)}
                      {variant.price_override_cents
                        ? ` (${formatUsd(variant.price_override_cents)})`
                        : ""}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gold">
                  Qty
                </span>
                <input
                  type="number"
                  min={1}
                  value={row.quantity}
                  onChange={(event) =>
                    updateRow(row.rowId, {
                      quantity: Math.max(1, Number(event.target.value) || 1),
                    })
                  }
                  className="w-full rounded-md border border-rose/20 px-3 py-2 text-sm"
                />
              </label>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => removeRow(row.rowId)}
                  className="rounded-md border border-red-300 px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-40"
                  disabled={rows.length === 1}
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
        <button
          type="button"
          onClick={addRow}
          className="rounded-md border border-forest/25 px-3 py-2 text-xs font-semibold text-forest"
        >
          Add Inventory Item
        </button>
      </fieldset>

      <label className="space-y-1">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">
          Base Bundle Price (USD)
        </span>
        <input
          name="priceCents"
          required
          type="number"
          min={0.01}
          step={0.01}
          defaultValue="70.00"
          className="w-full rounded-md border border-rose/20 px-3 py-2 text-sm"
        />
      </label>
      <label className="space-y-1">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">
          Available Bundles
        </span>
        <input
          name="stockOnHand"
          required
          type="number"
          min={0}
          defaultValue={10}
          className="w-full rounded-md border border-rose/20 px-3 py-2 text-sm"
        />
      </label>
      <label className="space-y-1">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">
          Sale Percent Off
        </span>
        <input
          name="salePercentOff"
          type="number"
          min={0}
          max={90}
          defaultValue={0}
          className="w-full rounded-md border border-rose/20 px-3 py-2 text-sm"
        />
      </label>
      <label className="space-y-1">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">
          Sale Label
        </span>
        <input
          name="saleLabel"
          required
          defaultValue="Bundle Deal"
          className="w-full rounded-md border border-rose/20 px-3 py-2 text-sm"
        />
      </label>
      <label className="space-y-1 md:col-span-2">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">
          Cart Button Text
        </span>
        <input
          name="cartCtaText"
          required
          defaultValue="Choose Bundle"
          className="w-full rounded-md border border-rose/20 px-3 py-2 text-sm"
        />
      </label>
      <div className="flex flex-wrap gap-4 md:col-span-2">
        <label className="inline-flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" name="isFeatured" defaultChecked /> Featured
        </label>
        <label className="inline-flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" name="isHot" /> Hot Item
        </label>
        <label className="inline-flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" name="saleEnabled" /> Sale On
        </label>
        <label className="inline-flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" name="active" defaultChecked /> Active
        </label>
      </div>
      <div className="md:col-span-2">
        <button
          type="submit"
          className="rounded-md bg-forest px-4 py-2 text-sm font-semibold text-white"
        >
          Create Bundle Listing
        </button>
      </div>
    </form>
  );
}
