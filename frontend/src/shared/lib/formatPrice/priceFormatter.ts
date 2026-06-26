export const CURRENCY_SYMBOLS: Record<string, string> = {
  RUB: '₽',
  BYN: 'Br',
  UAH: '₴',
  USD: '$',
};

export function formatPrice(price: number, currencyCode: string = 'RUB'): string {
  const symbol = CURRENCY_SYMBOLS[currencyCode.toUpperCase()] || currencyCode;
  return `${price} ${symbol}`;
}
