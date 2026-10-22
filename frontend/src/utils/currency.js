/**
 * Currency configuration & formatting helper for CampusNest (PKR / Rs.)
 */

export const CURRENCY_CODE = 'PKR';
export const CURRENCY_SYMBOL = 'Rs.';

/**
 * Format a numeric amount into Pakistani Rupees
 * Example: formatPrice(14000) => "Rs. 14,000"
 */
export function formatPrice(amount, options = {}) {
  const { includeSymbol = true, suffix = '' } = options;
  if (amount === null || amount === undefined || isNaN(amount)) {
    return includeSymbol ? 'Rs. 0' : '0';
  }

  const formatted = Math.round(Number(amount)).toLocaleString('en-PK');
  const result = includeSymbol ? `Rs. ${formatted}` : formatted;
  return suffix ? `${result}${suffix}` : result;
}

export default formatPrice;
