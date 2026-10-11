export type PopupTiming = { delaySeconds: number; fadeSeconds: number };
export const DEFAULT_POPUP_TIMING: PopupTiming = { delaySeconds: 5, fadeSeconds: 2 };
export function parsePopupTiming(value: unknown): PopupTiming {
  const item = value && typeof value === "object" ? value as Partial<PopupTiming> : {};
  const bounded = (value: unknown, fallback: number, min: number, max: number) => typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
  return { delaySeconds: bounded(item.delaySeconds, 5, 2, 20), fadeSeconds: bounded(item.fadeSeconds, 2, .8, 5) };
}
