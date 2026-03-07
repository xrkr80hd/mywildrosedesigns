export function getEffectivePriceCents(
  basePriceCents: number,
  saleEnabled: boolean,
  salePercentOff: number,
): number {
  if (!saleEnabled || salePercentOff <= 0) {
    return basePriceCents;
  }

  const discount = Math.round((basePriceCents * salePercentOff) / 100);
  return Math.max(basePriceCents - discount, 1);
}

