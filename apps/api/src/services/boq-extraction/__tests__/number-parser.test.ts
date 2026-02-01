/**
 * Number Parser Tests
 *
 * Tests for deterministic financial number parsing.
 */

import { describe, it, expect } from 'vitest';
import {
  parseFinancialNumber,
  parseQuantity,
  parseRate,
  parsePercentage,
  formatIndianNumber,
  formatIndianCurrency,
  formatShortCurrency,
  isNumericString,
  extractNumbers,
} from '../number-parser';

describe('parseFinancialNumber', () => {
  describe('basic parsing', () => {
    it('parses plain integers', () => {
      expect(parseFinancialNumber('123')).toBe(123);
      expect(parseFinancialNumber('0')).toBe(0);
      expect(parseFinancialNumber('1000000')).toBe(1000000);
    });

    it('parses plain decimals', () => {
      expect(parseFinancialNumber('123.45')).toBe(123.45);
      expect(parseFinancialNumber('0.5')).toBe(0.5);
      expect(parseFinancialNumber('.75')).toBe(0.75);
    });

    it('parses numbers passed as number type', () => {
      expect(parseFinancialNumber(123)).toBe(123);
      expect(parseFinancialNumber(123.45)).toBe(123.45);
      expect(parseFinancialNumber(0)).toBe(0);
    });
  });

  describe('Indian number format', () => {
    it('parses Indian format with lakhs', () => {
      expect(parseFinancialNumber('1,23,456')).toBe(123456);
      expect(parseFinancialNumber('12,34,567')).toBe(1234567);
    });

    it('parses Indian format with crores', () => {
      expect(parseFinancialNumber('1,23,45,678')).toBe(12345678);
      expect(parseFinancialNumber('12,34,56,789')).toBe(123456789);
    });

    it('parses Indian format with decimals', () => {
      expect(parseFinancialNumber('1,23,456.78')).toBe(123456.78);
      expect(parseFinancialNumber('12,34,567.89')).toBe(1234567.89);
    });
  });

  describe('international number format', () => {
    it('parses standard format with thousands', () => {
      expect(parseFinancialNumber('1,234')).toBe(1234);
      expect(parseFinancialNumber('1,234,567')).toBe(1234567);
    });

    it('parses standard format with decimals', () => {
      expect(parseFinancialNumber('1,234.56')).toBe(1234.56);
      expect(parseFinancialNumber('1,234,567.89')).toBe(1234567.89);
    });
  });

  describe('currency symbols', () => {
    it('strips Indian Rupee symbol', () => {
      expect(parseFinancialNumber('₹1,23,456')).toBe(123456);
      expect(parseFinancialNumber('₹ 1,23,456.78')).toBe(123456.78);
    });

    it('strips Dollar symbol', () => {
      expect(parseFinancialNumber('$1,234.56')).toBe(1234.56);
      expect(parseFinancialNumber('$ 1,234.56')).toBe(1234.56);
    });

    it('strips Euro symbol', () => {
      expect(parseFinancialNumber('€1,234.56')).toBe(1234.56);
    });

    it('strips Pound symbol', () => {
      expect(parseFinancialNumber('£1,234.56')).toBe(1234.56);
    });

    it('strips Yen symbol', () => {
      expect(parseFinancialNumber('¥1234')).toBe(1234);
    });
  });

  describe('negative numbers', () => {
    it('parses negative with minus sign', () => {
      expect(parseFinancialNumber('-123')).toBe(-123);
      expect(parseFinancialNumber('-1,234.56')).toBe(-1234.56);
    });

    it('parses negative in accounting format (parentheses)', () => {
      expect(parseFinancialNumber('(123)')).toBe(-123);
      expect(parseFinancialNumber('(1,234.56)')).toBe(-1234.56);
      expect(parseFinancialNumber('(₹1,23,456)')).toBe(-123456);
    });
  });

  describe('percentages', () => {
    it('parses percentage and converts to decimal', () => {
      expect(parseFinancialNumber('15%')).toBe(0.15);
      expect(parseFinancialNumber('5.5%')).toBe(0.055);
      expect(parseFinancialNumber('100%')).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('returns 0 for null and undefined', () => {
      expect(parseFinancialNumber(null)).toBe(0);
      expect(parseFinancialNumber(undefined)).toBe(0);
    });

    it('returns 0 for empty string', () => {
      expect(parseFinancialNumber('')).toBe(0);
      expect(parseFinancialNumber('   ')).toBe(0);
    });

    it('returns 0 for N/A and similar', () => {
      expect(parseFinancialNumber('N/A')).toBe(0);
      expect(parseFinancialNumber('NA')).toBe(0);
      expect(parseFinancialNumber('nil')).toBe(0);
      expect(parseFinancialNumber('-')).toBe(0);
    });

    it('returns 0 for NaN', () => {
      expect(parseFinancialNumber(NaN)).toBe(0);
    });

    it('returns 0 for invalid strings', () => {
      expect(parseFinancialNumber('abc')).toBe(0);
      expect(parseFinancialNumber('not a number')).toBe(0);
    });

    it('handles whitespace', () => {
      expect(parseFinancialNumber('  123  ')).toBe(123);
      expect(parseFinancialNumber('1 234')).toBe(1234);
    });
  });
});

describe('parseQuantity', () => {
  it('returns absolute value', () => {
    expect(parseQuantity('100')).toBe(100);
    expect(parseQuantity('-100')).toBe(100);
    expect(parseQuantity('(100)')).toBe(100);
  });
});

describe('parseRate', () => {
  it('returns 0 for negative values', () => {
    expect(parseRate('100')).toBe(100);
    expect(parseRate('-100')).toBe(0);
  });
});

describe('parsePercentage', () => {
  it('parses string with % symbol', () => {
    expect(parsePercentage('15%')).toBe(0.15);
  });

  it('converts plain number > 1 to decimal', () => {
    expect(parsePercentage('15')).toBe(0.15);
    expect(parsePercentage(15)).toBe(0.15);
  });

  it('keeps values <= 1 as is', () => {
    expect(parsePercentage('0.15')).toBe(0.15);
    expect(parsePercentage(0.15)).toBe(0.15);
  });
});

describe('formatIndianNumber', () => {
  it('formats numbers in Indian style', () => {
    expect(formatIndianNumber(1234567)).toBe('12,34,567.00');
    expect(formatIndianNumber(123456)).toBe('1,23,456.00');
    expect(formatIndianNumber(1000)).toBe('1,000.00');
  });

  it('handles negative numbers', () => {
    expect(formatIndianNumber(-123456)).toBe('-1,23,456.00');
  });

  it('handles zero', () => {
    expect(formatIndianNumber(0)).toBe('0');
  });

  it('respects decimal places', () => {
    expect(formatIndianNumber(123456.78, 0)).toBe('1,23,457');
    expect(formatIndianNumber(123456.78, 2)).toBe('1,23,456.78');
  });
});

describe('formatIndianCurrency', () => {
  it('adds rupee symbol', () => {
    expect(formatIndianCurrency(123456)).toBe('₹1,23,456');
  });
});

describe('formatShortCurrency', () => {
  it('formats crores', () => {
    expect(formatShortCurrency(10000000)).toBe('₹1.00 Cr');
    expect(formatShortCurrency(25000000)).toBe('₹2.50 Cr');
  });

  it('formats lakhs', () => {
    expect(formatShortCurrency(100000)).toBe('₹1.00L');
    expect(formatShortCurrency(250000)).toBe('₹2.50L');
  });

  it('formats thousands', () => {
    expect(formatShortCurrency(1000)).toBe('₹1.0K');
    expect(formatShortCurrency(5000)).toBe('₹5.0K');
  });

  it('formats small numbers normally', () => {
    expect(formatShortCurrency(500)).toBe('₹500');
  });
});

describe('isNumericString', () => {
  it('returns true for numeric strings', () => {
    expect(isNumericString('123')).toBe(true);
    expect(isNumericString('123.45')).toBe(true);
    expect(isNumericString('₹1,234')).toBe(true);
    expect(isNumericString('(1000)')).toBe(true);
    expect(isNumericString('15%')).toBe(true);
  });

  it('returns false for non-numeric strings', () => {
    expect(isNumericString('abc')).toBe(false);
    expect(isNumericString('hello')).toBe(false);
    expect(isNumericString('')).toBe(false);
  });
});

describe('extractNumbers', () => {
  it('extracts numbers from text', () => {
    expect(extractNumbers('Price is 1,234.56 and qty is 100')).toEqual([1234.56, 100]);
  });

  it('returns empty array for text without numbers', () => {
    expect(extractNumbers('No numbers here')).toEqual([]);
  });

  it('filters out zero values', () => {
    expect(extractNumbers('Values: 100, 0, 200')).toEqual([100, 200]);
  });
});
