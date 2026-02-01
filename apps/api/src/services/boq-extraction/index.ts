/**
 * BOQ Extraction Services
 *
 * Barrel export for all BOQ document parsing services.
 */

// AI Parser
export {
  AIParserService,
  getAIParser,
  type OrgCategory,
  type RawExtractedItem,
  type ExtractionResult,
  type MappedBOQItem,
  type ParseDocumentResult,
} from './ai-parser.service';

// Number Parser
export {
  parseFinancialNumber,
  parseQuantity,
  parseRate,
  parsePercentage,
  formatIndianNumber,
  formatIndianCurrency,
  formatShortCurrency,
  isNumericString,
  extractNumbers,
} from './number-parser';

// Validator
export {
  getValidator,
  type ValidationResult,
  type ValidationFlag,
  type ItemValidationResult,
  type SuggestedFix,
} from './validator.service';
export { ValidatorService } from './validator.service';
