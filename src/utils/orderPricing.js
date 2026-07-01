export function pickListPriceRow(prices) {
  if (!Array.isArray(prices)) return null;
  return prices.find((row) => row.productPriceTypeId === 'LIST_PRICE') ?? null;
}

export function computePriceWithGst(priceRow) {
  if (!priceRow || priceRow.price == null) return null;
  const base = Number(priceRow.price);
  if (Number.isNaN(base)) return null;

  const taxInPrice = String(priceRow.taxInPrice || 'N').toUpperCase();
  if (taxInPrice === 'Y') return roundMoney(base);

  const taxPct = Number(priceRow.taxPercentage);
  const rate = Number.isNaN(taxPct) ? 0 : taxPct;
  return roundMoney(base * (1 + rate / 100));
}

function roundMoney(amount) {
  return Math.round(amount * 100) / 100;
}

export function resolveListPriceWithGst(prices) {
  return computePriceWithGst(pickListPriceRow(prices));
}
