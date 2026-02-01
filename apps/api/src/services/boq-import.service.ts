/**
 * BOQ Import Service
 *
 * Handles parsing of BOQ files (Excel, CSV, PDF) and converting them
 * to structured BOQ items for import.
 *
 * Uses AI (OpenAI GPT-4o) for:
 * - PDF parsing via direct vision API (no third-party PDF libraries)
 * - Excel/CSV content extraction and structure analysis
 * - Section extraction from document structure
 *
 * Uses deterministic code for:
 * - Number parsing (data integrity)
 * - Validation and confidence scoring
 *
 * File Size Limit: 10MB maximum for direct AI processing
 */

import { Readable } from 'stream';
import ExcelJS from 'exceljs';
import {
  getAIParser,
  parseFinancialNumber,
  getValidator,
  type MappedBOQItem,
} from './boq-extraction';

// ============================================
// Constants
// ============================================

// Maximum file size for AI processing (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export interface ParsedBOQItem {
  code?: string;
  boqCategoryItemId?: string; // Optional - items grouped by section instead
  description: string;
  unit: string;
  quantity: number;
  rate: number;
  sectionName?: string;
  stageId?: string;
  isReviewFlagged: boolean;
  flagReason?: string;
  fieldConfidences?: {
    description: number;
    unit: number;
    quantity: number;
    rate: number;
  };
}

export interface ParseResult {
  fileName: string;
  items: ParsedBOQItem[];
  sections: string[];
  totalItems: number;
  flaggedItems: number;
  errors: string[];
  checksumMatch: boolean;
  documentTotal?: number;
  calculatedTotal: number;
}

interface RawRowData {
  [key: string]: ExcelJS.CellValue;
}

// ============================================
// Constants
// ============================================

// Common column name variations for BOQ data
const COLUMN_MAPPINGS = {
  code: ['code', 'item code', 'item no', 'item_code', 'sr no', 'sr. no', 's.no', 'sl no', 'sl. no'],
  description: [
    'description',
    'item description',
    'particulars',
    'item',
    'work description',
    'details',
    'name',
  ],
  unit: ['unit', 'uom', 'unit of measurement', 'units'],
  quantity: ['quantity', 'qty', 'qnty', 'nos', 'no.', 'number'],
  rate: ['rate', 'unit rate', 'price', 'unit price', 'cost', 'amount per unit'],
  amount: ['amount', 'total', 'total amount', 'value', 'total cost'],
  section: ['section', 'category', 'work type', 'head', 'heading', 'group'],
};

// ============================================
// Main Parse Function (AI-Powered)
// ============================================

/**
 * Parse any document (PDF, Excel, CSV) using AI
 *
 * PDFs are sent directly to OpenAI GPT-4o Responses API (no third-party PDF libraries)
 * Excel/CSV files are converted to JSON and then parsed by AI
 *
 * Items are grouped by sections extracted from the document (no category mapping)
 */
export async function parseDocument(buffer: Buffer, fileName: string): Promise<ParseResult> {
  const extension = fileName.toLowerCase().split('.').pop();
  const aiParser = getAIParser();
  const startTime = Date.now();

  console.log(
    `[BOQImport] Starting parse for: ${fileName} (${extension}), size: ${buffer.length} bytes`
  );

  try {
    // For PDF files: Send directly to OpenAI Responses API
    if (extension === 'pdf') {
      console.log(`[BOQImport] Processing PDF file via OpenAI Responses API...`);

      const result = await aiParser.parseDocumentWithPDF(
        buffer,
        fileName,
        [], // No category mapping needed
        parseFinancialNumber
      );

      const elapsed = Date.now() - startTime;
      console.log(`[BOQImport] PDF parsing completed in ${elapsed}ms`);
      console.log(
        `[BOQImport] Extracted ${result.items.length} items, ${result.errors.length} errors`
      );

      // Transform to ParsedBOQItem format (no category fields)
      const items: ParsedBOQItem[] = result.items.map((item: MappedBOQItem) => ({
        code: item.code,
        description: item.description,
        unit: item.unit,
        quantity: item.quantity,
        rate: item.rate,
        sectionName: item.sectionName,
        isReviewFlagged: item.isReviewRequired,
        flagReason: item.reviewReason,
        fieldConfidences: item.fieldConfidences,
      }));

      return {
        fileName,
        items,
        sections: result.sections,
        totalItems: items.length,
        flaggedItems: items.filter((i) => i.isReviewFlagged).length,
        errors: result.errors,
        checksumMatch: result.checksumMatch,
        documentTotal: result.documentTotal,
        calculatedTotal: result.calculatedTotal,
      };
    }

    // For Excel/CSV files: Send directly as file to AI (like PDF)
    if (extension === 'xlsx' || extension === 'xls' || extension === 'csv') {
      console.log(`[BOQImport] Sending Excel/CSV file directly to AI...`);

      const result = await aiParser.parseDocumentWithExcel(
        buffer,
        fileName,
        extension === 'csv',
        [], // No category mapping needed
        parseFinancialNumber
      );

      const elapsed = Date.now() - startTime;
      console.log(`[BOQImport] Excel/CSV parsing completed in ${elapsed}ms`);
      console.log(
        `[BOQImport] Extracted ${result.items.length} items, ${result.errors.length} errors`
      );

      // Transform to ParsedBOQItem format (no category fields)
      const items: ParsedBOQItem[] = result.items.map((item: MappedBOQItem) => ({
        code: item.code,
        description: item.description,
        unit: item.unit,
        quantity: item.quantity,
        rate: item.rate,
        sectionName: item.sectionName,
        isReviewFlagged: item.isReviewRequired,
        flagReason: item.reviewReason,
        fieldConfidences: item.fieldConfidences,
      }));

      // Validate results
      const validator = getValidator();
      validator.validateItems(result.items, result.documentTotal);

      return {
        fileName,
        items,
        sections: result.sections,
        totalItems: items.length,
        flaggedItems: items.filter((i) => i.isReviewFlagged).length,
        errors: result.errors,
        checksumMatch: result.checksumMatch,
        documentTotal: result.documentTotal,
        calculatedTotal: result.calculatedTotal,
      };
    }

    // Unsupported file type
    console.error(`[BOQImport] Unsupported file type: ${extension}`);
    return {
      fileName,
      items: [],
      sections: [],
      totalItems: 0,
      flaggedItems: 0,
      errors: [`Unsupported file type: ${extension}`],
      checksumMatch: true,
      calculatedTotal: 0,
    };
  } catch (error) {
    const elapsed = Date.now() - startTime;
    const message = error instanceof Error ? error.message : 'Unknown error';
    const stack = error instanceof Error ? error.stack : '';

    console.error(`[BOQImport] FATAL ERROR after ${elapsed}ms: ${message}`);
    console.error(`[BOQImport] Stack trace: ${stack}`);

    return {
      fileName,
      items: [],
      sections: [],
      totalItems: 0,
      flaggedItems: 0,
      errors: [message],
      checksumMatch: true,
      calculatedTotal: 0,
    };
  }
}

// ============================================
// Legacy Excel/CSV Parser (Non-AI Fallback)
// ============================================

/**
 * Parse an Excel or CSV file buffer into BOQ items
 * This is the legacy parser - use parseDocument for AI-powered parsing
 */
export async function parseExcelBuffer(buffer: Buffer, fileName: string): Promise<ParseResult> {
  const errors: string[] = [];
  const items: ParsedBOQItem[] = [];
  const sectionsSet = new Set<string>();

  try {
    const workbook = new ExcelJS.Workbook();
    const isCSV = fileName.toLowerCase().endsWith('.csv');

    if (isCSV) {
      const csvStream = Readable.from(buffer);
      await workbook.csv.read(csvStream);
    } else {
      // @ts-expect-error - Buffer type variance between Node.js versions
      await workbook.xlsx.load(buffer);
    }

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      return {
        fileName,
        items: [],
        sections: [],
        totalItems: 0,
        flaggedItems: 0,
        errors: ['No sheets found in file'],
        checksumMatch: true,
        calculatedTotal: 0,
      };
    }

    const rawData: RawRowData[] = [];
    let headers: string[] = [];

    worksheet.eachRow((row: ExcelJS.Row, rowNumber: number) => {
      if (rowNumber === 1) {
        const values = row.values as ExcelJS.CellValue[];
        headers = values.slice(1).map((val: ExcelJS.CellValue) => String(val ?? '').trim());
      } else {
        const rowData: RawRowData = {};
        const values = row.values as ExcelJS.CellValue[];
        values.slice(1).forEach((val: ExcelJS.CellValue, index: number) => {
          if (headers[index]) {
            rowData[headers[index]] = val !== null && val !== undefined ? val : '';
          }
        });
        rawData.push(rowData);
      }
    });

    if (rawData.length === 0) {
      return {
        fileName,
        items: [],
        sections: [],
        totalItems: 0,
        flaggedItems: 0,
        errors: ['No data found in file'],
        checksumMatch: true,
        calculatedTotal: 0,
      };
    }

    const columnMap = detectColumnMappings(headers);

    if (!columnMap.description) {
      errors.push('Could not detect description column');
      return {
        fileName,
        items: [],
        sections: [],
        totalItems: 0,
        flaggedItems: 0,
        errors,
        checksumMatch: true,
        calculatedTotal: 0,
      };
    }

    let currentSection = '';

    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      const rowNum = i + 2;

      const description = getColumnValue(row, columnMap.description);
      const quantity = parseNumber(getColumnValue(row, columnMap.quantity));
      const rate = parseNumber(getColumnValue(row, columnMap.rate));
      const amount = parseNumber(getColumnValue(row, columnMap.amount));

      if (!description || description.toString().trim() === '') {
        continue;
      }

      if (
        (quantity === 0 || isNaN(quantity)) &&
        (rate === 0 || isNaN(rate)) &&
        (amount === 0 || isNaN(amount))
      ) {
        const descStr = description.toString().toUpperCase();
        if (descStr.length < 100 && !descStr.includes('TOTAL')) {
          currentSection = description.toString().trim();
          sectionsSet.add(currentSection);
          continue;
        }
      }

      const item = parseRowToItem(row, columnMap, currentSection, rowNum, errors);
      if (item) {
        items.push(item);
      }
    }

    const flaggedItems = items.filter((item) => item.isReviewFlagged).length;
    const calculatedTotal = items.reduce((sum, item) => sum + item.quantity * item.rate, 0);

    return {
      fileName,
      items,
      sections: Array.from(sectionsSet),
      totalItems: items.length,
      flaggedItems,
      errors,
      checksumMatch: true,
      calculatedTotal,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error parsing file';
    return {
      fileName,
      items: [],
      sections: [],
      totalItems: 0,
      flaggedItems: 0,
      errors: [message],
      checksumMatch: true,
      calculatedTotal: 0,
    };
  }
}

// ============================================
// Helper Functions
// ============================================

function detectColumnMappings(headers: string[]): Record<string, string | undefined> {
  const map: Record<string, string | undefined> = {};
  const normalizedHeaders = headers.map((h) => h.toLowerCase().trim());

  for (const [field, variations] of Object.entries(COLUMN_MAPPINGS)) {
    for (const variation of variations) {
      const index = normalizedHeaders.findIndex((h) => h.includes(variation));
      if (index !== -1) {
        map[field] = headers[index];
        break;
      }
    }
  }

  return map;
}

function getColumnValue(row: RawRowData, column: string | undefined): ExcelJS.CellValue {
  if (!column) return undefined;
  return row[column];
}

function parseNumber(value: ExcelJS.CellValue): number {
  if (value === undefined || value === null || value === '') return 0;
  if (typeof value === 'number') return value;

  const strValue = String(value);
  const cleaned = strValue.replace(/[₹$,\s]/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function parseRowToItem(
  row: RawRowData,
  columnMap: Record<string, string | undefined>,
  currentSection: string,
  rowNum: number,
  errors: string[]
): ParsedBOQItem | null {
  const description = getColumnValue(row, columnMap.description)?.toString().trim() || '';

  if (!description) {
    return null;
  }

  const code = getColumnValue(row, columnMap.code)?.toString().trim();
  const unit = getColumnValue(row, columnMap.unit)?.toString().trim() || 'nos';
  let quantity = parseNumber(getColumnValue(row, columnMap.quantity));
  let rate = parseNumber(getColumnValue(row, columnMap.rate));
  const amount = parseNumber(getColumnValue(row, columnMap.amount));

  if (amount > 0 && rate === 0 && quantity > 0) {
    rate = amount / quantity;
  }

  if (amount > 0 && quantity === 0 && rate > 0) {
    quantity = amount / rate;
  }

  let isReviewFlagged = false;
  let flagReason: string | undefined;

  if (quantity <= 0) {
    isReviewFlagged = true;
    flagReason = 'Quantity is zero or missing';
  } else if (rate <= 0 && amount <= 0) {
    isReviewFlagged = true;
    flagReason = 'Rate and amount are both zero or missing';
  } else if (!unit || unit === 'nos') {
    const descLower = description.toLowerCase();
    if (
      descLower.includes('sq') ||
      descLower.includes('meter') ||
      descLower.includes('kg') ||
      descLower.includes('cum')
    ) {
      isReviewFlagged = true;
      flagReason = 'Unit may need verification';
    }
  }

  return {
    code: code || undefined,
    description,
    unit,
    quantity: quantity || 1,
    rate: rate || 0,
    sectionName: currentSection || undefined,
    isReviewFlagged,
    flagReason,
  };
}

// ============================================
// Export
// ============================================

export const boqImportService = {
  parseDocument,
  parseExcelBuffer,
  parseFinancialNumber,
  MAX_FILE_SIZE,
};
