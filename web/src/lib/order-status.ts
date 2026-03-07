export const ORDER_STATUS_VALUES = [
  "pending_payment",
  "paid",
  "in_production",
  "completed",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUS_VALUES)[number];
