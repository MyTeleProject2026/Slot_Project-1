export const DEFAULT_COUNTRY = 'MM';
export const DEFAULT_CURRENCY = 'MMK';
export const DEFAULT_TIMEZONE = 'Asia/Yangon';

export function formatCurrency(value, currency = DEFAULT_CURRENCY) {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat('en-MM', {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'MMK' ? 0 : 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}
