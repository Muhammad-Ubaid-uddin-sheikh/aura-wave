export function formatCurrency(amount: number, maxDigits: number = 2, currency: string = "PKR"): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency,
    maximumFractionDigits: maxDigits,
  }).format(amount);
}