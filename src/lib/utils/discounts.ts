export const MAX_DISCOUNT_PERCENT = 5;

export const normalizeDiscountLimit = (
  limit: number | null | undefined,
): number | null => {
  if (typeof limit !== "number" || Number.isNaN(limit)) return null;
  if (limit > 0 && limit < 1) return limit * 100;
  return limit;
};

export const clampDiscountLimit = (
  limit: number | null | undefined,
): number | null => {
  const normalized = normalizeDiscountLimit(limit);
  if (normalized === null) return null;
  return Math.min(MAX_DISCOUNT_PERCENT, Math.max(0, normalized));
};

export const getMaxDiscountByLimit = (
  subtotal: number,
  limit: number | null | undefined,
): number => {
  const safeSubtotal = Number.isFinite(subtotal) ? subtotal : 0;
  const normalizedLimit = clampDiscountLimit(limit);
  if (normalizedLimit === null) return Math.max(0, safeSubtotal);
  return Math.max(0, (normalizedLimit / 100) * safeSubtotal);
};
