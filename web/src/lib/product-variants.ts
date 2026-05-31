export const PRODUCT_TYPE_VALUES = ["apparel", "accessory"] as const;
export type ProductType = (typeof PRODUCT_TYPE_VALUES)[number];

export const SIZE_PROFILE_VALUES = [
  "kids_boy",
  "kids_girl",
  "adult_male",
  "adult_female",
] as const;
export type SizeProfile = (typeof SIZE_PROFILE_VALUES)[number];

export const SIZE_PROFILE_LABELS: Record<SizeProfile, string> = {
  kids_boy: "Kids - Boy",
  kids_girl: "Kids - Girl",
  adult_male: "Adult - Male",
  adult_female: "Adult - Female",
};

export const SIZE_VALUE_OPTIONS = [
  "2T",
  "3T",
  "4T",
  "5T",
  "YS",
  "YM",
  "YL",
  "YXL",
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "2XL",
  "3XL",
  "4XL",
  "One Size",
] as const;
export type SizeValue = (typeof SIZE_VALUE_OPTIONS)[number];

export const SIZE_VALUE_LABELS: Record<SizeValue, string> = {
  "2T": "2T",
  "3T": "3T",
  "4T": "4T",
  "5T": "5T",
  YS: "Youth Small",
  YM: "Youth Medium",
  YL: "Youth Large",
  YXL: "Youth XL",
  XS: "XS",
  S: "Small",
  M: "Medium",
  L: "Large",
  XL: "XL",
  "2XL": "2XL",
  "3XL": "3XL",
  "4XL": "4XL",
  "One Size": "One Size",
};

export const ADULT_APPAREL_SIZE_OPTIONS: SizeValue[] = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "2XL",
  "3XL",
  "4XL",
];

export function getSizeSortOrder(sizeValue: string): number {
  const index = SIZE_VALUE_OPTIONS.findIndex((size) => size === sizeValue);
  return index >= 0 ? index : SIZE_VALUE_OPTIONS.length + 100;
}

export function formatSizeValue(sizeValue: string | null | undefined): string {
  if (!sizeValue) {
    return "";
  }

  return SIZE_VALUE_LABELS[sizeValue as SizeValue] ?? sizeValue;
}

export const DEFAULT_APPAREL_SIZE_PROFILES: SizeProfile[] = [
  "kids_boy",
  "kids_girl",
  "adult_male",
  "adult_female",
];

export const DEFAULT_APPAREL_SIZES: SizeValue[] = [
  "YS",
  "YM",
  "YL",
  "YXL",
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "2XL",
  "3XL",
];
