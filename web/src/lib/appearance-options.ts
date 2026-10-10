export const FONT_CHOICES = {
  original: { label: "Wild Rose original", body: "var(--font-body), sans-serif", heading: "var(--font-heading), serif" },
  modern: { label: "Modern sans", body: 'Arial, Helvetica, sans-serif', heading: 'Arial, Helvetica, sans-serif' },
  classic: { label: "Classic serif", body: 'Georgia, "Times New Roman", serif', heading: 'Georgia, "Times New Roman", serif' },
  friendly: { label: "Friendly rounded", body: '"Trebuchet MS", Arial, sans-serif', heading: '"Trebuchet MS", Arial, sans-serif' },
  editorial: { label: "Editorial", body: 'Verdana, Geneva, sans-serif', heading: 'Georgia, "Times New Roman", serif' },
} as const;
export type Appearance = { bodyFont: keyof typeof FONT_CHOICES; headingFont: keyof typeof FONT_CHOICES; bodySize: number; headingScale: number };
export const DEFAULT_APPEARANCE: Appearance = { bodyFont: "original", headingFont: "original", bodySize: 16, headingScale: 1 };
export function parseAppearance(value: unknown): Appearance {
  const item = value && typeof value === "object" ? value as Partial<Appearance> : {};
  return {
    bodyFont: item.bodyFont && Object.hasOwn(FONT_CHOICES, item.bodyFont) ? item.bodyFont : "original",
    headingFont: item.headingFont && Object.hasOwn(FONT_CHOICES, item.headingFont) ? item.headingFont : "original",
    bodySize: typeof item.bodySize === "number" && Number.isFinite(item.bodySize) ? Math.min(20, Math.max(14, item.bodySize)) : 16,
    headingScale: typeof item.headingScale === "number" && Number.isFinite(item.headingScale) ? Math.min(1.2, Math.max(0.9, item.headingScale)) : 1,
  };
}
