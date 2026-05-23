export function formatMoney(cents: number, currency = 'USD'): string {
  const amount = cents / 100;
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
