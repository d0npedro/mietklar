const currencyFormatter = new Intl.NumberFormat("de-DE", {
  currency: "EUR",
  maximumFractionDigits: 0,
  style: "currency",
});

export function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

export function formatDelta(value: number) {
  const prefix = value > 0 ? "+" : value < 0 ? "-" : "+/-";
  return `${prefix}${formatCurrency(Math.abs(value))}`;
}
