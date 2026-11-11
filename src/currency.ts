export type TargetCurrency = 'none' | 'CNY' | 'USD' | 'HKD';

// 基准汇率（日元 -> 外币）
export const DEFAULT_RATES: Record<Exclude<TargetCurrency, 'none'>, { rate: number; symbol: string }> = {
  CNY: { rate: 0.047, symbol: '¥' },
  USD: { rate: 0.0065, symbol: '$' },
  HKD: { rate: 0.051, symbol: 'HK$' },
};

export function formatForeignCurrency(jpyAmount: number, currency: TargetCurrency): string | null {
  if (currency === 'none' || !DEFAULT_RATES[currency]) return null;
  const { rate, symbol } = DEFAULT_RATES[currency];
  const converted = Math.round(jpyAmount * rate);
  return `≈ ${symbol}${converted.toLocaleString('en-US')} ${currency}`;
}
