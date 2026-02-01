/**
 * Validator Service Tests
 *
 * Tests for BOQ item validation and confidence scoring.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ValidatorService, type ValidationResult } from '../validator.service';
import type { MappedBOQItem } from '../ai-parser.service';

describe('ValidatorService', () => {
  let validator: ValidatorService;

  beforeEach(() => {
    validator = new ValidatorService();
  });

  // Helper to create a valid item
  const createValidItem = (overrides: Partial<MappedBOQItem> = {}): MappedBOQItem => ({
    description: 'RCC for foundation work including formwork',
    unit: 'cum',
    quantity: 100,
    rate: 5000,
    suggestedCategoryId: 'cat-1',
    suggestedCategoryName: 'Concrete Work',
    categoryConfidence: 0.9,
    fieldConfidences: {
      description: 0.9,
      unit: 0.9,
      quantity: 0.9,
      rate: 0.9,
    },
    isReviewRequired: false,
    ...overrides,
  });

  describe('validateItems', () => {
    it('validates a set of valid items', () => {
      const items: MappedBOQItem[] = [
        createValidItem({ quantity: 100, rate: 5000 }),
        createValidItem({ quantity: 50, rate: 8000 }),
      ];

      const result = validator.validateItems(items);

      expect(result.isValid).toBe(true);
      expect(result.flaggedItems).toBe(0);
      expect(result.overallConfidence).toBeGreaterThan(0.8);
    });

    it('flags items with zero quantity', () => {
      const items: MappedBOQItem[] = [
        createValidItem({ quantity: 0 }),
        createValidItem({ quantity: 100 }),
      ];

      const result = validator.validateItems(items);

      expect(result.flaggedItems).toBe(1);
      expect(result.flags.some((f) => f.code === 'ZERO_QUANTITY')).toBe(true);
    });

    it('flags items with zero rate', () => {
      const items: MappedBOQItem[] = [createValidItem({ rate: 0 })];

      const result = validator.validateItems(items);

      expect(result.flaggedItems).toBe(1);
      expect(result.flags.some((f) => f.code === 'ZERO_RATE')).toBe(true);
    });

    it('flags items with missing category', () => {
      const items: MappedBOQItem[] = [
        createValidItem({ suggestedCategoryId: null, suggestedCategoryName: null }),
      ];

      const result = validator.validateItems(items);

      expect(result.flags.some((f) => f.code === 'NO_CATEGORY')).toBe(true);
    });

    it('adds summary flags for flagged items', () => {
      const items: MappedBOQItem[] = [
        createValidItem({ quantity: 0 }),
        createValidItem({ rate: 0 }),
        createValidItem(),
      ];

      const result = validator.validateItems(items);

      expect(result.flags.some((f) => f.code === 'ITEMS_FLAGGED')).toBe(true);
    });
  });

  describe('validateChecksum', () => {
    it('returns true when totals match exactly', () => {
      const result = validator.validateChecksum(100000, 100000);
      expect(result).toBe(true);
    });

    it('returns true when totals match within tolerance', () => {
      // 1% tolerance or ₹100
      const result = validator.validateChecksum(100050, 100000);
      expect(result).toBe(true);
    });

    it('returns false when totals differ significantly', () => {
      const result = validator.validateChecksum(110000, 100000);
      expect(result).toBe(false);
    });

    it('returns true when no document total provided', () => {
      const result = validator.validateChecksum(100000, undefined);
      expect(result).toBe(true);
    });

    it('adds checksum mismatch flag', () => {
      const items: MappedBOQItem[] = [createValidItem({ quantity: 100, rate: 5000 })];

      // Document total doesn't match calculated total (100 * 5000 = 500000)
      const result = validator.validateItems(items, 600000);

      expect(result.checksumMatch).toBe(false);
      expect(result.flags.some((f) => f.code === 'CHECKSUM_MISMATCH')).toBe(true);
    });
  });

  describe('validateItem', () => {
    it('validates a fully valid item', () => {
      const item = createValidItem();
      const result = validator.validateItem(item, 0);

      expect(result.isValid).toBe(true);
      expect(result.flags.length).toBe(0);
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it('flags empty description', () => {
      const item = createValidItem({ description: '' });
      const result = validator.validateItem(item, 0);

      expect(result.isValid).toBe(false);
      expect(result.flags.some((f) => f.code === 'EMPTY_DESCRIPTION')).toBe(true);
    });

    it('flags short description', () => {
      const item = createValidItem({ description: 'short' });
      const result = validator.validateItem(item, 0);

      expect(result.flags.some((f) => f.code === 'SHORT_DESCRIPTION')).toBe(true);
    });

    it('flags numeric-only description', () => {
      const item = createValidItem({ description: '123456' });
      const result = validator.validateItem(item, 0);

      expect(result.flags.some((f) => f.code === 'NUMERIC_DESCRIPTION')).toBe(true);
    });

    it('flags missing unit', () => {
      const item = createValidItem({ unit: '' });
      const result = validator.validateItem(item, 0);

      expect(result.flags.some((f) => f.code === 'MISSING_UNIT')).toBe(true);
    });

    it('flags unknown unit', () => {
      const item = createValidItem({ unit: 'xyz' });
      const result = validator.validateItem(item, 0);

      expect(result.flags.some((f) => f.code === 'UNKNOWN_UNIT')).toBe(true);
    });

    it('suggests valid unit for close matches', () => {
      const item = createValidItem({ unit: 'sq.m' });
      const result = validator.validateItem(item, 0);

      expect(result.suggestedFixes?.some((f) => f.suggestedValue === 'sqm')).toBe(true);
    });

    it('flags negative quantity', () => {
      const item = createValidItem({ quantity: -100 });
      const result = validator.validateItem(item, 0);

      expect(result.flags.some((f) => f.code === 'NEGATIVE_QUANTITY')).toBe(true);
    });

    it('flags negative rate', () => {
      const item = createValidItem({ rate: -5000 });
      const result = validator.validateItem(item, 0);

      expect(result.flags.some((f) => f.code === 'NEGATIVE_RATE')).toBe(true);
    });

    it('flags unusually large quantity', () => {
      const item = createValidItem({ quantity: 5000000 });
      const result = validator.validateItem(item, 0);

      expect(result.flags.some((f) => f.code === 'LARGE_QUANTITY')).toBe(true);
    });

    it('flags unusually large rate', () => {
      const item = createValidItem({ rate: 50000000 });
      const result = validator.validateItem(item, 0);

      expect(result.flags.some((f) => f.code === 'LARGE_RATE')).toBe(true);
    });
  });

  describe('getConfidenceLevel', () => {
    it('returns high for confidence >= 0.8', () => {
      expect(validator.getConfidenceLevel(0.8)).toBe('high');
      expect(validator.getConfidenceLevel(0.9)).toBe('high');
      expect(validator.getConfidenceLevel(1)).toBe('high');
    });

    it('returns medium for confidence >= 0.6', () => {
      expect(validator.getConfidenceLevel(0.6)).toBe('medium');
      expect(validator.getConfidenceLevel(0.7)).toBe('medium');
    });

    it('returns low for confidence < 0.6', () => {
      expect(validator.getConfidenceLevel(0.5)).toBe('low');
      expect(validator.getConfidenceLevel(0.3)).toBe('low');
      expect(validator.getConfidenceLevel(0)).toBe('low');
    });
  });
});
