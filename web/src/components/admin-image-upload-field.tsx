"use client";

import { ChangeEvent, DragEvent, useId, useRef, useState } from "react";

type UploadResponse = {
  url?: string;
  error?: string;
};

type AdminImageUploadFieldProps = {
  name: string;
  label?: string;
  defaultValue?: string;
  recommendedSize?: string;
  helperText?: string;
  className?: string;
};

export function AdminImageUploadField({
  name,
  label = "Image URL",
  defaultValue = "",
  recommendedSize = "1200 x 1200 px square",
  helperText = "Drag and drop an image, or click to choose a file.",
  className,
}: AdminImageUploadFieldProps) {
  const [value, setValue] = useState(defaultValue);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState("");
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    setError("");
    setIsUploading(true);

    const formData = new FormData();
    formData.set("file", file);

    try {
      const response = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: formData,
      });
      const result = (await response.json().catch(() => ({}))) as UploadResponse;

      if (!response.ok || !result.url) {
        throw new Error(result.error ?? "Image upload failed.");
      }

      setValue(result.url);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Image upload failed.");
    } finally {
      setIsUploading(false);
    }
  }

  function onInputChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    uploadFile(file).catch(() => undefined);
    event.target.value = "";
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (!file) {
      return;
    }
    uploadFile(file).catch(() => undefined);
  }

  return (
    <div className={className}>
      <label className="space-y-1">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">
          {label}
        </span>
        <input
          name={name}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm"
          placeholder="https://..."
        />
      </label>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={onDrop}
        className={`mt-2 rounded-xl border border-dashed px-3 py-3 text-sm ${
          isDragOver ? "border-rose bg-rose/5" : "border-rose/30 bg-surface/70"
        }`}
      >
        <p className="font-semibold text-forest">Recommended size: {recommendedSize}</p>
        <p className="mt-1 text-foreground/70">{helperText}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="rounded-lg border border-forest/25 bg-white px-3 py-1.5 text-xs font-semibold text-forest"
          >
            {isUploading ? "Uploading..." : "Choose Image"}
          </button>
          <span className="text-xs text-foreground/65">PNG, JPG, WEBP, SVG</span>
        </div>
      </div>

      <input
        id={fileInputId}
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        aria-label="Upload product image"
        title="Upload product image"
        onChange={onInputChange}
        className="hidden"
      />

      {error ? <p className="mt-1 text-xs font-semibold text-red-700">{error}</p> : null}
    </div>
  );
}
