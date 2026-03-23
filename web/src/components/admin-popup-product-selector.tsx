"use client";

import { useMemo, useState } from "react";

type PopupProductOption = {
  id: string;
  title: string;
  slug: string;
  sku: string;
  active: boolean;
};

type AdminPopupProductSelectorProps = {
  products: PopupProductOption[];
  defaultProductId?: string | null;
};

export function AdminPopupProductSelector({
  products,
  defaultProductId,
}: AdminPopupProductSelectorProps) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(defaultProductId ?? "");

  const filteredProducts = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return products;
    }

    return products.filter((product) => {
      const haystack =
        `${product.title} ${product.slug} ${product.sku} ${product.id}`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [products, query]);

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedId) ?? null,
    [products, selectedId],
  );

  return (
    <div className="space-y-2">
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.currentTarget.value)}
        placeholder="Search by product title, slug, SKU, or ID"
        className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm"
      />

      <select
        name="productId"
        value={selectedId}
        onChange={(event) => setSelectedId(event.currentTarget.value)}
        className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm"
      >
        <option value="">No product selected</option>
        {filteredProducts.map((product) => (
          <option key={product.id} value={product.id}>
            {product.title} ({product.slug}){product.sku ? ` • ${product.sku}` : ""}
            {product.active ? "" : " • inactive"}
          </option>
        ))}
      </select>

      <p className="text-xs text-foreground/70">
        {selectedProduct
          ? `Selected: ${selectedProduct.title} (${selectedProduct.slug})`
          : "No product selected."}
      </p>
    </div>
  );
}
