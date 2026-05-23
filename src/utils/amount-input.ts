const MAX_AMOUNT_CENTS = 99_999_999;

export function appendAmountDigit(currentCents: number, digit: number): number {
  const next = currentCents * 10 + digit;
  return Math.min(next, MAX_AMOUNT_CENTS);
}

export function backspaceAmount(currentCents: number): number {
  return Math.floor(currentCents / 10);
}

export function formatAmountDisplay(cents: number): string {
  return (cents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
