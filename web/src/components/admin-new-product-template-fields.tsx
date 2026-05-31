"use client";

import { useMemo, useState } from "react";
import {
  SIZE_VALUE_LABELS,
  type SizeValue,
} from "@/lib/product-variants";
import type { AdminVariantTemplate } from "@/components/admin-variant-template-panel";

type AdminNewProductTemplateFieldsProps = {
  templates: AdminVariantTemplate[];
};

function formatUsd(amountCents: number) {
  return `$${(amountCents / 100).toFixed(2)}`;
}

export function AdminNewProductTemplateFields({
  templates,
}: AdminNewProductTemplateFieldsProps) {
  const activeTemplates = templates.filter((template) => template.active);
  const [mode, setMode] = useState<"none" | "existing" | "new">("none");
  const [templateId, setTemplateId] = useState("");
  const selectedTemplate = useMemo(
    () => activeTemplates.find((template) => template.id === templateId),
    [activeTemplates, templateId],
  );
  const availableSizes = selectedTemplate?.sizes ?? [];
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [newTemplateSizes, setNewTemplateSizes] = useState<string[]>([
    "S",
    "M",
    "L",
    "XL",
  ]);

  function selectTemplate(nextTemplateId: string) {
    setTemplateId(nextTemplateId);
    const template = activeTemplates.find(
      (candidate) => candidate.id === nextTemplateId,
    );
    setSelectedSizes(template?.sizes.map((size) => size.size_label) ?? []);
  }

  function toggleSize(sizeValue: string, checked: boolean) {
    const sortedSizes = availableSizes.map((size) => size.size_label);
    const next = checked
      ? Array.from(new Set([...selectedSizes, sizeValue]))
      : selectedSizes.filter((size) => size !== sizeValue);
    setSelectedSizes(sortedSizes.filter((size) => next.includes(size)));
  }

  function toggleNewTemplateSize(sizeValue: string, checked: boolean) {
    const sortOrder = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"];
    const next = checked
      ? Array.from(new Set([...newTemplateSizes, sizeValue]))
      : newTemplateSizes.filter((size) => size !== sizeValue);
    setNewTemplateSizes(sortOrder.filter((size) => next.includes(size)));
  }

  return (
    <fieldset className="space-y-3 rounded-md border border-gold/30 bg-white/80 p-3 md:col-span-2">
      <legend className="px-1 text-xs font-semibold uppercase tracking-[0.12em] text-gold">
        Shirt Brand / Size Setup
      </legend>
      <p className="text-xs text-foreground/70">
        Pick one path: add the product only, use a saved shirt template, or
        create a new shirt template from this product.
      </p>
      <input type="hidden" name="initialTemplateMode" value={mode} />
      <div className="grid gap-2 md:grid-cols-3">
        {[
          ["none", "Add Product"],
          ["existing", "Choose Template"],
          ["new", "Create Template"],
        ].map(([value, label]) => (
          <label
            key={value}
            className="inline-flex items-center gap-2 rounded-md border border-rose/15 bg-surface/60 px-3 py-2 text-sm font-semibold"
          >
            <input
              type="radio"
              name="shirtSetupChoice"
              checked={mode === value}
              onChange={() => setMode(value as "none" | "existing" | "new")}
            />
            {label}
          </label>
        ))}
      </div>
      <input type="hidden" name="initialTemplateId" value={templateId} />
      {selectedSizes.map((size) => (
        <input key={size} type="hidden" name="initialSizeLabels" value={size} />
      ))}

      {mode === "existing" ? (
        <label className="space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gold">
            Choose Template
          </span>
          <select
            value={templateId}
            onChange={(event) => selectTemplate(event.target.value)}
            className="w-full rounded-md border border-rose/20 px-3 py-2 text-sm"
          >
            <option value="">Select saved template</option>
            {activeTemplates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {mode === "existing" && selectedTemplate ? (
        <>
          <div className="rounded-md border border-rose/15 bg-surface/70 p-3 text-xs text-foreground/80">
            <p className="font-semibold text-forest">
              Brand: {selectedTemplate.brand_name}
            </p>
            <p className="mt-1">
              Sizes:{" "}
              {availableSizes
                .map(
                  (size) =>
                    SIZE_VALUE_LABELS[size.size_label as SizeValue] ??
                    size.size_label,
                )
                .join(", ")}
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {availableSizes.map((size) => {
              const label =
                SIZE_VALUE_LABELS[size.size_label as SizeValue] ??
                size.size_label;
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
                    <span className="font-semibold">{label}</span>:{" "}
                    {formatUsd(size.price_cents)}
                  </span>
                </label>
              );
            })}
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gold">
                Colors Available
              </span>
              <input
                name="initialColorValue"
                placeholder="Blue, Pink, Black"
                className="w-full rounded-md border border-rose/20 px-3 py-2 text-sm"
              />
            </label>
            <label className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gold">
                Stock Per Size
              </span>
              <input
                name="initialStockOnHand"
                type="number"
                min={0}
                defaultValue={10}
                className="w-full rounded-md border border-rose/20 px-3 py-2 text-sm"
              />
            </label>
          </div>
        </>
      ) : null}

      {mode === "new" ? (
        <div className="space-y-3 rounded-md border border-rose/15 bg-surface/70 p-3">
          <div className="grid gap-2 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gold">
                Template Name
              </span>
              <input
                name="newTemplateName"
                placeholder="Gildan Softstyle Adult Tee"
                className="w-full rounded-md border border-rose/20 px-3 py-2 text-sm"
              />
            </label>
            <label className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gold">
                Shirt Brand
              </span>
              <input
                name="newTemplateBrandName"
                placeholder="Gildan Softstyle"
                className="w-full rounded-md border border-rose/20 px-3 py-2 text-sm"
              />
            </label>
            <label className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gold">
                Colors Available
              </span>
              <input
                name="newTemplateColorValues"
                placeholder="Blue, Pink, Black"
                className="w-full rounded-md border border-rose/20 px-3 py-2 text-sm"
              />
            </label>
            <label className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gold">
                Stock Per Size/Color
              </span>
              <input
                name="newTemplateStockOnHand"
                type="number"
                min={0}
                defaultValue={10}
                className="w-full rounded-md border border-rose/20 px-3 py-2 text-sm"
              />
            </label>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {(["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"] as const).map(
              (size) => (
                <label
                  key={size}
                  className="grid grid-cols-[1rem_minmax(0,1fr)_5.5rem] items-center gap-2 rounded-md border border-rose/15 bg-white/70 px-3 py-2 text-xs"
                >
                  <input
                    type="checkbox"
                    name="newTemplateSizeLabels"
                    value={size}
                    checked={newTemplateSizes.includes(size)}
                    onChange={(event) =>
                      toggleNewTemplateSize(size, event.target.checked)
                    }
                  />
                  <span className="font-semibold">
                    {SIZE_VALUE_LABELS[size]}
                  </span>
                  <input
                    name={`newTemplatePrice_${size}`}
                    type="number"
                    min={0.01}
                    step={0.01}
                    placeholder="18.00"
                    className="w-full rounded-md border border-rose/20 px-2 py-1 text-xs"
                  />
                </label>
              ),
            )}
          </div>
        </div>
      ) : null}
    </fieldset>
  );
}
