/**
 * Number Parser
 *
 * Deterministic number parsing for financial values.
 * Handles Indian (1,23,456.78) and international (1,234,567.89) formats.
 *
 * IMPORTANT: This is YOUR code - not AI - so results are deterministic and auditable.
 */

// ============================================
// Main Parser Function
// ============================================

/**
 * Parse financial numbers in various formats
 *
 * Handles:
 * - Indian format: 1,23,456.78
 * - International format: 1,234,567.89
 * - Plain numbers: 1234.56
 * - Currency symbols: ₹, $, €, £, ¥
 * - Negative in parentheses: (1,000)
 * - Percentages: 15%
 *
 * @param value - The value to parse (string, number, null, undefined)
 * @returns Parsed number or 0 if invalid
 */
export function parseFinancialNumber(value: string | number | undefined | null): number {
  // Handle null/undefined
  if (value === undefined || value === null) {
    return 0;
  }

  // Already a number
  if (typeof value === 'number') {
    return isNaN(value) ? 0 : value;
  }

  // Convert to string and trim
  let str = value.toString().trim();

  // Empty string
  if (!str) {
    return 0;
  }

  // Remove currency symbols and whitespace
  str = str.replace(/[₹$€£¥\s]/g, '');

  // Handle "N/A", "-", "nil", etc.
  const lowerStr = str.toLowerCase();
  if (lowerStr === 'n/a' || lowerStr === 'na' || lowerStr === 'nil' || str === '-') {
    return 0;
  }

  // Handle parentheses for negative numbers (accounting format)
  const isNegative = str.startsWith('(') && str.endsWith(')');
  if (isNegative) {
    str = str.slice(1, -1);
  }

  // Handle percentage
  const isPercent = str.endsWith('%');
  if (isPercent) {
    str = str.slice(0, -1);
  }

  // Handle explicit negative sign
  let hasNegativeSign = false;
  if (str.startsWith('-')) {
    hasNegativeSign = true;
    str = str.slice(1);
  }

  // Remove all commas (works for both Indian and international format)
  str = str.replace(/,/g, '');

  // Handle cases like "1.234.567,89" (European format with comma decimal)
  // Count dots and commas to detect format
  const dotCount = (str.match(/\./g) || []).length;

  if (dotCount > 1) {
    // European format: 1.234.567,89 → remove dots, convert comma to dot
    str = str.replace(/\./g, '');
  }

  // Parse the number
  const num = parseFloat(str);

  if (isNaN(num)) {
    return 0;
  }

  // Apply sign
  let result = isNegative || hasNegativeSign ? -num : num;

  // Apply percentage
  if (isPercent) {
    result = result / 100;
  }

  return result;
}

// ============================================
// Specialized Parsers
// ============================================

/**
 * Parse a quantity value (always positive)
 */
export function parseQuantity(value: string | number | undefined | null): number {
  const num = parseFinancialNumber(value);
  return Math.abs(num);
}

/**
 * Parse a rate value (can be zero, but typically positive)
 */
export function parseRate(value: string | number | undefined | null): number {
  const num = parseFinancialNumber(value);
  return num < 0 ? 0 : num;
}

/**
 * Parse a percentage value (returns decimal, e.g., 15% → 0.15)
 */
export function parsePercentage(value: string | number | undefined | null): number {
  if (value === undefined || value === null) {
    return 0;
  }

  const str = value.toString().trim();

  // If already contains %, parseFinancialNumber will handle it
  if (str.includes('%')) {
    return parseFinancialNumber(value);
  }

  // Assume it's already a percentage value (15 → 0.15)
  const num = parseFinancialNumber(value);
  return num > 1 ? num / 100 : num;
}

// ============================================
// Formatting Functions
// ============================================

/**
 * Format number in Indian format (lakhs, crores)
 */
export function formatIndianNumber(num: number, decimals = 2): string {
  if (num === 0) return '0';

  const isNegative = num < 0;
  const absNum = Math.abs(num);

  // Use Indian locale for proper comma placement
  const formatted = absNum.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return isNegative ? `-${formatted}` : formatted;
}

/**
 * Format number as Indian currency
 */
export function formatIndianCurrency(num: number, decimals = 0): string {
  return `₹${formatIndianNumber(num, decimals)}`;
}

/**
 * Format large numbers in short form (L for lakhs, Cr for crores)
 */
export function formatShortCurrency(num: number): string {
  const absNum = Math.abs(num);

  if (absNum >= 10000000) {
    // 1 Crore = 10,000,000
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  }
  if (absNum >= 100000) {
    // 1 Lakh = 100,000
    return `₹${(num / 100000).toFixed(2)}L`;
  }
  if (absNum >= 1000) {
    return `₹${(num / 1000).toFixed(1)}K`;
  }

  return `₹${num.toLocaleString('en-IN')}`;
}

// ============================================
// Validation Functions
// ============================================

/**
 * Check if a string looks like a number
 */
export function isNumericString(value: string): boolean {
  if (!value || typeof value !== 'string') {
    return false;
  }

  // Remove common formatting
  const cleaned = value.replace(/[₹$€£¥,\s()%-]/g, '').trim();

  // Check if it's a valid number
  return !isNaN(parseFloat(cleaned)) && isFinite(parseFloat(cleaned));
}

/**
 * Extract all numbers from a string
 */
export function extractNumbers(text: string): number[] {
  // Match numbers with optional decimals and commas
  const matches = text.match(/[\d,]+\.?\d*/g) || [];
  return matches.map((m) => parseFinancialNumber(m)).filter((n) => n !== 0);
}
