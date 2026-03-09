export type ProductOption = {
  id: string;
  name: string;
  description: string;
  amountCents: number;
};

export const DEFAULT_PRODUCT_OPTIONS: ProductOption[] = [
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
