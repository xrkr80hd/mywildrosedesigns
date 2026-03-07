export const PRODUCT_OPTION_IDS = [
  "single-transfer",
  "gang-sheet-small",
  "gang-sheet-large",
] as const;

export type ProductOptionId = (typeof PRODUCT_OPTION_IDS)[number];

export type ProductOption = {
  id: ProductOptionId;
  name: string;
  description: string;
  amountCents: number;
};

export const PRODUCT_OPTIONS: ProductOption[] = [
  {
    id: "single-transfer",
    name: 'Single Transfer (up to 12")',
    description: "Ideal for one-off shirt prints and logos.",
    amountCents: 2500,
  },
  {
    id: "gang-sheet-small",
    name: 'Small Gang Sheet (22" x 24")',
    description: "Great for batching several designs on one sheet.",
    amountCents: 4500,
  },
  {
    id: "gang-sheet-large",
    name: 'Large Gang Sheet (22" x 60")',
    description: "Best value for higher-volume custom orders.",
    amountCents: 7500,
  },
];

const productOptionById = new Map(PRODUCT_OPTIONS.map((option) => [option.id, option]));

export function getProductOptionById(optionId: string): ProductOption | undefined {
  return productOptionById.get(optionId as ProductOptionId);
}
