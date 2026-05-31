"use client";

import { useMemo, useState } from "react";
import {
  ADULT_APPAREL_SIZE_OPTIONS,
  SIZE_VALUE_LABELS,
  type SizeValue,
} from "@/lib/product-variants";

export type AdminVariantTemplateSize = {
  id: string;
  size_label: string;
  size_sort_order: number;
  price_cents: number;
};

export type AdminVariantTemplate = {
  id: string;
  name: string;
  brand_name: string;
  active: boolean;
  sizes: AdminVariantTemplateSize[];
};

type AdminVariantTemplatePanelProps = {
  productId: string;
  templates: AdminVariantTemplate[];
  createTemplateAction: (formData: FormData) => void | Promise<void>;
  applyTemplateAction: (formData: FormData) => void | Promise<void>;
};

function formatUsd(amountCents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amountCents / 100);
}

function groupPriceSummary(sizes: AdminVariantTemplateSize[]) {
  const groups = new Map<number, string[]>();
  sizes.forEach((size) => {
    const labels = groups.get(size.price_cents) ?? [];
    labels.push(SIZE_VALUE_LABELS[size.size_label as SizeValue] ?? size.size_label);
    groups.set(size.price_cents, labels);
  });

  return Array.from(groups.entries())
    .map(([priceCents, labels]) => `${labels.join(", ")} ${formatUsd(priceCents)}`)
    .join("; ");
}

export function AdminVariantTemplatePanel({
  productId,
  templates,
  createTemplateAction,
  applyTemplateAction,
}: AdminVariantTemplatePanelProps) {
  const activeTemplates = templates.filter((template) => template.active);
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    activeTemplates[0]?.id ?? "",
  );
  const selectedTemplate = useMemo(
    () => activeTemplates.find((template) => template.id === selectedTemplateId),
    [activeTemplates, selectedTemplateId],
  );
  const availableSizes = selectedTemplate?.sizes ?? [];
  const [selectedSizes, setSelectedSizes] = useState<string[]>(
    availableSizes.map((size) => size.size_label),
  );

  function syncTemplate(templateId: string) {
    setSelectedTemplateId(templateId);
    const template = activeTemplates.find((candidate) => candidate.id === templateId);
    setSelectedSizes(template?.sizes.map((size) => size.size_label) ?? []);
  }

  function toggleSize(sizeValue: string, checked: boolean) {
    const sortedSizes = availableSizes.map((size) => size.size_label);
    const next = checked
      ? Array.from(new Set([...selectedSizes, sizeValue]))
      : selectedSizes.filter((size) => size !== sizeValue);
    setSelectedSizes(
      sortedSizes.filter((size) => next.includes(size)),
    );
  }

  return (
    <section className="mt-3 rounded-md border border-gold/30 bg-white/85 p-3">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(14rem,18rem)]">
        <div>
          <label className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gold">
              Template
            </span>
            <select
              value={selectedTemplateId}
              onChange={(event) => syncTemplate(event.target.value)}
              className="w-full rounded-md border border-rose/20 px-3 py-2 text-sm"
            >
              <option value="">Select template</option>
              {activeTemplates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </label>

          <div className="mt-3 rounded-md border border-rose/15 bg-surface/70 p-3 text-xs text-foreground/80">
            <p className="font-semibold text-forest">Template Preview</p>
            {selectedTemplate ? (
              <div className="mt-2 space-y-1">
                <p>
                  Brand:{" "}
                  <span className="font-semibold">
                    {selectedTemplate.brand_name}
                  </span>
                </p>
                <p>
                  Sizes:{" "}
                  {availableSizes
                    .map(
                      (size) =>
                        SIZE_VALUE_LABELS[size.size_label as SizeValue] ??
                        size.size_label,
                    )
                    .join(", ")}
                </p>
                <p>Base prices: {groupPriceSummary(availableSizes)}</p>
              </div>
            ) : (
              <p className="mt-2">
                Create a shirt brand template below, then select it here.
              </p>
            )}
          </div>
        </div>

        <details className="rounded-md border border-rose/15 bg-surface/70 p-3">
          <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.12em] text-gold">
            Build New Template
          </summary>
          <form action={createTemplateAction} className="mt-3 space-y-3">
            <input
              type="hidden"
              name="redirectTo"
              value={`/admin#product-${productId}`}
            />
            <label className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gold">
                Template Name
              </span>
              <input
                name="name"
                required
                placeholder="Gildan Softstyle Adult Tee"
                className="w-full rounded-md border border-rose/20 px-3 py-2 text-sm"
              />
            </label>
            <label className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gold">
                Brand
              </span>
              <input
                name="brandName"
                required
                placeholder="Gildan Softstyle"
                className="w-full rounded-md border border-rose/20 px-3 py-2 text-sm"
              />
            </label>
            <div className="space-y-2">
              {ADULT_APPAREL_SIZE_OPTIONS.map((size) => (
                <label
                  key={size}
                  className="grid gap-2 text-xs sm:grid-cols-[1rem_minmax(4rem,1fr)_5.5rem] sm:items-center"
                >
                  <input type="checkbox" name="templateSizes" value={size} />
                  <span className="font-semibold">
                    {SIZE_VALUE_LABELS[size]}
                  </span>
                  <input
                    name={`price_${size}`}
                    type="number"
                    min={0.01}
                    step={0.01}
                    placeholder="18.00"
                    className="w-full rounded-md border border-rose/20 px-2 py-1 text-xs"
                  />
                </label>
              ))}
            </div>
            <label className="inline-flex items-center gap-2 text-xs font-semibold">
              <input type="checkbox" name="active" defaultChecked /> Active
            </label>
            <button
              type="submit"
              className="w-full rounded-md bg-forest px-3 py-2 text-xs font-semibold text-white"
            >
              Save Template
            </button>
          </form>
        </details>
      </div>

      {selectedTemplate ? (
        <form action={applyTemplateAction} className="mt-3 space-y-3">
          <input type="hidden" name="productId" value={productId} />
          <input type="hidden" name="templateId" value={selectedTemplate.id} />
          <input
            type="hidden"
            name="redirectTo"
            value={`/admin#product-${productId}`}
          />
          {selectedSizes.map((size) => (
            <input key={size} type="hidden" name="sizeLabels" value={size} />
          ))}

          <div>
            <p className="text-xs font-semibold text-forest">
              Template: {selectedTemplate.name}
            </p>
            <p className="text-xs text-foreground/75">
              Brand: {selectedTemplate.brand_name}
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {availableSizes.map((size) => {
              const sizeLabel =
                SIZE_VALUE_LABELS[size.size_label as SizeValue] ?? size.size_label;
              return (
                <label
                  key={size.id}
                  className="grid grid-cols-[1rem_minmax(0,1fr)] items-center gap-2 rounded-md border border-rose/15 bg-surface/60 px-3 py-2 text-xs"
                >
                  <input
                    type="checkbox"
                    checked={selectedSizes.includes(size.size_label)}
                    onChange={(event) =>
                      toggleSize(size.size_label, event.target.checked)
                    }
                  />
                  <span>
                    <span className="font-semibold">{sizeLabel}</span>:{" "}
                    {formatUsd(size.price_cents)}
                  </span>
                </label>
              );
            })}
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <label className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gold">
                Color
              </span>
              <input
                name="colorValue"
                required
                placeholder="Blue"
                className="w-full rounded-md border border-rose/20 px-3 py-2 text-sm"
              />
            </label>
            <label className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gold">
                Stock Per Size
              </span>
              <input
                name="stockOnHand"
                type="number"
                min={0}
                defaultValue={10}
                className="w-full rounded-md border border-rose/20 px-3 py-2 text-sm"
              />
            </label>
            <div className="flex items-end sm:col-span-2 lg:col-span-1">
              <button
                type="submit"
                className="w-full rounded-md bg-forest px-3 py-2 text-sm font-semibold text-white"
              >
                Apply Template
              </button>
            </div>
          </div>
        </form>
      ) : null}
    </section>
  );
}
