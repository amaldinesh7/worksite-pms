/**
 * Validator Service
 *
 * Provides confidence scoring, checksum validation, and flag generation
 * for BOQ import items.
 */

import type { MappedBOQItem } from './ai-parser.service';

// ============================================
// Types
// ============================================

export interface ValidationResult {
  isValid: boolean;
  overallConfidence: number;
  checksumMatch: boolean;
  checksumDifference?: number;
  flaggedItems: number;
  flags: ValidationFlag[];
}

export interface ValidationFlag {
  type: 'error' | 'warning' | 'info';
  itemIndex?: number;
  field?: string;
  message: string;
  code: string;
}

export interface ItemValidationResult {
  isValid: boolean;
  confidence: number;
  flags: ValidationFlag[];
  suggestedFixes?: SuggestedFix[];
}

export interface SuggestedFix {
  field: string;
  currentValue: unknown;
  suggestedValue: unknown;
  reason: string;
}

// ============================================
// Constants
// ============================================

const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.8,
  MEDIUM: 0.6,
  LOW: 0.4,
};

const VALID_UNITS = new Set([
  'nos',
  'no',
  'sqm',
  'sqft',
  'sft',
  'cum',
  'cft',
  'rmt',
  'rm',
  'kg',
  'mt',
  'ton',
  'ltr',
  'lit',
  'bag',
  'bags',
  'set',
  'pair',
  'each',
  'lot',
  'ls',
  'job',
  'day',
  'hr',
  'month',
  'm',
  'cm',
  'mm',
  'inch',
  'ft',
]);

// ============================================
// Validator Service Class
// ============================================

export class ValidatorService {
  /**
   * Validate all items and calculate overall metrics
   */
  validateItems(items: MappedBOQItem[], documentTotal?: number): ValidationResult {
    const flags: ValidationFlag[] = [];
    let totalConfidence = 0;
    let flaggedCount = 0;

    // Validate each item
    items.forEach((item, index) => {
      const itemResult = this.validateItem(item, index);
      totalConfidence += itemResult.confidence;

      if (itemResult.flags.length > 0) {
        flaggedCount++;
        flags.push(...itemResult.flags);
      }
    });

    // Calculate overall confidence
    const overallConfidence = items.length > 0 ? totalConfidence / items.length : 0;

    // Calculate totals and checksum
    const calculatedTotal = items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
    const checksumMatch = this.validateChecksum(calculatedTotal, documentTotal);
    const checksumDifference =
      documentTotal !== undefined ? Math.abs(documentTotal - calculatedTotal) : undefined;

    if (!checksumMatch && checksumDifference !== undefined) {
      flags.push({
        type: 'warning',
        code: 'CHECKSUM_MISMATCH',
        message: `Document total (₹${documentTotal?.toLocaleString('en-IN')}) differs from calculated total (₹${calculatedTotal.toLocaleString('en-IN')}) by ₹${checksumDifference.toLocaleString('en-IN')}`,
      });
    }

    // Add summary flags
    if (flaggedCount > 0) {
      flags.unshift({
        type: 'info',
        code: 'ITEMS_FLAGGED',
        message: `${flaggedCount} of ${items.length} items need review`,
      });
    }

    if (overallConfidence < CONFIDENCE_THRESHOLDS.MEDIUM) {
      flags.unshift({
        type: 'warning',
        code: 'LOW_CONFIDENCE',
        message: `Overall confidence is ${Math.round(overallConfidence * 100)}% - manual review recommended`,
      });
    }

    return {
      isValid: overallConfidence >= CONFIDENCE_THRESHOLDS.LOW && flaggedCount < items.length * 0.5,
      overallConfidence,
      checksumMatch,
      checksumDifference,
      flaggedItems: flaggedCount,
      flags,
    };
  }

  /**
   * Validate a single item
   */
  validateItem(item: MappedBOQItem, index: number): ItemValidationResult {
    const flags: ValidationFlag[] = [];
    const suggestedFixes: SuggestedFix[] = [];
    let confidence = 0;
    let factors = 0;

    // Validate description
    const descResult = this.validateDescription(item.description, index);
    confidence += descResult.confidence;
    factors++;
    flags.push(...descResult.flags);

    // Validate unit
    const unitResult = this.validateUnit(item.unit, index);
    confidence += unitResult.confidence;
    factors++;
    flags.push(...unitResult.flags);
    if (unitResult.suggestedFix) {
      suggestedFixes.push(unitResult.suggestedFix);
    }

    // Validate quantity
    const qtyResult = this.validateQuantity(item.quantity, index);
    confidence += qtyResult.confidence;
    factors++;
    flags.push(...qtyResult.flags);

    // Validate rate
    const rateResult = this.validateRate(item.rate, item.description, index);
    confidence += rateResult.confidence;
    factors++;
    flags.push(...rateResult.flags);

    // Validate category mapping
    if (item.suggestedCategoryId) {
      confidence += item.categoryConfidence;
      factors++;
    } else {
      flags.push({
        type: 'warning',
        itemIndex: index,
        field: 'category',
        code: 'NO_CATEGORY',
        message: 'No matching category found',
      });
      confidence += 0.3;
      factors++;
    }

    // Add existing review reason as flag
    if (item.isReviewRequired && item.reviewReason) {
      flags.push({
        type: 'info',
        itemIndex: index,
        code: 'AI_FLAG',
        message: item.reviewReason,
      });
    }

    const avgConfidence = factors > 0 ? confidence / factors : 0;

    return {
      isValid:
        avgConfidence >= CONFIDENCE_THRESHOLDS.LOW &&
        flags.filter((f) => f.type === 'error').length === 0,
      confidence: avgConfidence,
      flags,
      suggestedFixes: suggestedFixes.length > 0 ? suggestedFixes : undefined,
    };
  }

  /**
   * Validate checksum (document total vs calculated)
   */
  validateChecksum(calculatedTotal: number, documentTotal?: number): boolean {
    if (documentTotal === undefined) {
      return true; // No document total to compare
    }

    // Allow 1% tolerance or ₹100, whichever is greater
    const tolerance = Math.max(documentTotal * 0.01, 100);
    return Math.abs(documentTotal - calculatedTotal) <= tolerance;
  }

  /**
   * Calculate confidence level category
   */
  getConfidenceLevel(confidence: number): 'high' | 'medium' | 'low' {
    if (confidence >= CONFIDENCE_THRESHOLDS.HIGH) return 'high';
    if (confidence >= CONFIDENCE_THRESHOLDS.MEDIUM) return 'medium';
    return 'low';
  }

  // ============================================
  // Private Validation Methods
  // ============================================

  private validateDescription(
    description: string,
    index: number
  ): { confidence: number; flags: ValidationFlag[] } {
    const flags: ValidationFlag[] = [];
    let confidence = 0.9;

    if (!description || description.trim().length === 0) {
      flags.push({
        type: 'error',
        itemIndex: index,
        field: 'description',
        code: 'EMPTY_DESCRIPTION',
        message: 'Description is empty',
      });
      confidence = 0;
    } else if (description.length < 10) {
      flags.push({
        type: 'warning',
        itemIndex: index,
        field: 'description',
        code: 'SHORT_DESCRIPTION',
        message: 'Description seems too short',
      });
      confidence = 0.6;
    } else if (description.length > 500) {
      flags.push({
        type: 'info',
        itemIndex: index,
        field: 'description',
        code: 'LONG_DESCRIPTION',
        message: 'Description is very long',
      });
      confidence = 0.8;
    }

    // Check for suspicious patterns
    if (/^[0-9\s.,]+$/.test(description)) {
      flags.push({
        type: 'error',
        itemIndex: index,
        field: 'description',
        code: 'NUMERIC_DESCRIPTION',
        message: 'Description appears to be only numbers',
      });
      confidence = 0.2;
    }

    return { confidence, flags };
  }

  private validateUnit(
    unit: string,
    index: number
  ): { confidence: number; flags: ValidationFlag[]; suggestedFix?: SuggestedFix } {
    const flags: ValidationFlag[] = [];
    let confidence = 0.9;
    let suggestedFix: SuggestedFix | undefined;

    const normalizedUnit = unit?.toLowerCase().trim();

    if (!normalizedUnit) {
      flags.push({
        type: 'warning',
        itemIndex: index,
        field: 'unit',
        code: 'MISSING_UNIT',
        message: 'Unit is missing, defaulting to "nos"',
      });
      confidence = 0.5;
      suggestedFix = {
        field: 'unit',
        currentValue: unit,
        suggestedValue: 'nos',
        reason: 'Default unit for missing values',
      };
    } else if (!VALID_UNITS.has(normalizedUnit)) {
      // Try to find a close match
      const suggestion = this.suggestUnit(normalizedUnit);
      if (suggestion) {
        flags.push({
          type: 'info',
          itemIndex: index,
          field: 'unit',
          code: 'UNKNOWN_UNIT',
          message: `Unknown unit "${unit}", did you mean "${suggestion}"?`,
        });
        confidence = 0.7;
        suggestedFix = {
          field: 'unit',
          currentValue: unit,
          suggestedValue: suggestion,
          reason: 'Similar valid unit found',
        };
      } else {
        flags.push({
          type: 'warning',
          itemIndex: index,
          field: 'unit',
          code: 'UNKNOWN_UNIT',
          message: `Unknown unit "${unit}"`,
        });
        confidence = 0.5;
      }
    }

    return { confidence, flags, suggestedFix };
  }

  private validateQuantity(
    quantity: number,
    index: number
  ): { confidence: number; flags: ValidationFlag[] } {
    const flags: ValidationFlag[] = [];
    let confidence = 0.9;

    if (quantity === 0) {
      flags.push({
        type: 'warning',
        itemIndex: index,
        field: 'quantity',
        code: 'ZERO_QUANTITY',
        message: 'Quantity is zero',
      });
      confidence = 0.3;
    } else if (quantity < 0) {
      flags.push({
        type: 'error',
        itemIndex: index,
        field: 'quantity',
        code: 'NEGATIVE_QUANTITY',
        message: 'Quantity is negative',
      });
      confidence = 0.1;
    } else if (quantity > 1000000) {
      flags.push({
        type: 'info',
        itemIndex: index,
        field: 'quantity',
        code: 'LARGE_QUANTITY',
        message: 'Quantity is unusually large',
      });
      confidence = 0.7;
    }

    return { confidence, flags };
  }

  private validateRate(
    rate: number,
    description: string,
    index: number
  ): { confidence: number; flags: ValidationFlag[] } {
    const flags: ValidationFlag[] = [];
    let confidence = 0.9;

    if (rate === 0) {
      flags.push({
        type: 'warning',
        itemIndex: index,
        field: 'rate',
        code: 'ZERO_RATE',
        message: 'Rate is zero',
      });
      confidence = 0.3;
    } else if (rate < 0) {
      flags.push({
        type: 'error',
        itemIndex: index,
        field: 'rate',
        code: 'NEGATIVE_RATE',
        message: 'Rate is negative',
      });
      confidence = 0.1;
    } else if (rate > 10000000) {
      // > 1 Crore
      flags.push({
        type: 'info',
        itemIndex: index,
        field: 'rate',
        code: 'LARGE_RATE',
        message: 'Rate is unusually large (>₹1 Cr)',
      });
      confidence = 0.6;
    } else if (rate < 1) {
      // Very small rate (might be in lakhs/crores)
      flags.push({
        type: 'info',
        itemIndex: index,
        field: 'rate',
        code: 'SMALL_RATE',
        message: 'Rate seems very small - verify units',
      });
      confidence = 0.7;
    }

    return { confidence, flags };
  }

  private suggestUnit(unit: string): string | null {
    const unitMap: Record<string, string> = {
      number: 'nos',
      numbers: 'nos',
      pieces: 'nos',
      pcs: 'nos',
      units: 'nos',
      'sq.m': 'sqm',
      'sq m': 'sqm',
      m2: 'sqm',
      'sq.ft': 'sqft',
      'sq ft': 'sqft',
      'cu.m': 'cum',
      'cu m': 'cum',
      m3: 'cum',
      'cu.ft': 'cft',
      'cu ft': 'cft',
      running: 'rmt',
      'running meter': 'rmt',
      'r.m': 'rmt',
      kilogram: 'kg',
      kgs: 'kg',
      quintal: 'mt',
      tonne: 'ton',
      litre: 'ltr',
      liters: 'ltr',
      meter: 'm',
      meters: 'm',
      feet: 'ft',
    };

    return unitMap[unit.toLowerCase()] || null;
  }
}

// ============================================
// Singleton Instance
// ============================================

let validatorInstance: ValidatorService | null = null;

export function getValidator(): ValidatorService {
  if (!validatorInstance) {
    validatorInstance = new ValidatorService();
  }
  return validatorInstance;
}
