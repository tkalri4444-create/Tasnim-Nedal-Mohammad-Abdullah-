/**
 * High quality compact number formatter for idle/clicker game
 */
export function formatNumber(num: number, decimals: number = 1): string {
  if (isNaN(num) || num === null || num === undefined) return '0';
  if (num < 1000) {
    return Math.floor(num).toLocaleString();
  }

  const suffixes = [
    { value: 1e3, symbol: 'k' },
    { value: 1e6, symbol: 'M' },
    { value: 1e9, symbol: 'B' },
    { value: 1e12, symbol: 'T' },
    { value: 1e15, symbol: 'Qa' },
    { value: 1e18, symbol: 'Qi' },
    { value: 1e21, symbol: 'Sx' },
    { value: 1e24, symbol: 'Sp' },
  ];

  for (let i = suffixes.length - 1; i >= 0; i--) {
    if (num >= suffixes[i].value) {
      const formatted = (num / suffixes[i].value).toFixed(decimals);
      return `${formatted.replace(/\.0$/, '')}${suffixes[i].symbol}`;
    }
  }

  return num.toExponential(2);
}

export function formatRate(num: number): string {
  if (num < 10) return num.toFixed(1);
  return formatNumber(num, 1);
}
