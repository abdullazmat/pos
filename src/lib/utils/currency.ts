export const formatARS = (value: number) => {
  const numeric = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numeric);
};

export const formatARSWithDecimals = (value: number, decimals: number = 2) => {
  const numeric = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numeric);
};
