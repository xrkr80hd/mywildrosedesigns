"use client";

import { useMemo, useState } from "react";
import { SIZE_VALUE_OPTIONS } from "@/lib/product-variants";

type AdminVariantSizeFieldProps = {
  defaultValue?: string | null;
  labelClassName?: string;
  controlClassName?: string;
};

const CUSTOM_VALUE = "__custom__";

function normalizeSize(value: string | null | undefined) {
  return value?.trim() ?? "";
}

export function AdminVariantSizeField({
  defaultValue,
  labelClassName = "text-[11px] font-semibold uppercase tracking-[0.12em] text-gold",
  controlClassName = "w-full rounded-md border border-rose/20 px-3 py-2 text-sm",
}: AdminVariantSizeFieldProps) {
  const initialSize = normalizeSize(defaultValue);
  const initialPreset = SIZE_VALUE_OPTIONS.includes(
    initialSize as (typeof SIZE_VALUE_OPTIONS)[number],
  )
    ? initialSize
    : initialSize
      ? CUSTOM_VALUE
      : "";
  const [preset, setPreset] = useState(initialPreset);
  const [customSize, setCustomSize] = useState(
    initialPreset === CUSTOM_VALUE ? initialSize : "",
  );

  const sizeValue = useMemo(() => {
    if (preset === CUSTOM_VALUE) {
      return customSize.trim();
    }

    return preset;
  }, [customSize, preset]);

  return (
    <label className="space-y-1">
      <span className={labelClassName}>Size</span>
      <input type="hidden" name="sizeValue" value={sizeValue} />
      <select
        value={preset}
        onChange={(event) => setPreset(event.target.value)}
        className={controlClassName}
      >
        <option value="">No size</option>
        {SIZE_VALUE_OPTIONS.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
        <option value={CUSTOM_VALUE}>Custom / one-off</option>
      </select>
      {preset === CUSTOM_VALUE ? (
        <input
          value={customSize}
          onChange={(event) => setCustomSize(event.target.value)}
          placeholder="Custom size"
          className={`${controlClassName} mt-2`}
        />
      ) : null}
    </label>
  );
}
