/**
 * BOQ Import Service
 *
 * Handles parsing of BOQ files (Excel, CSV, PDF) and converting them
 * to structured BOQ items for import.
 */

import * as XLSX from 'xlsx';
import OpenAI from 'openai';
import type { BOQCategory } from '@prisma/client';

// ============================================
// Types
// ============================================

export interface ParsedBOQItem {
  code?: string;
  category: BOQCategory;
  description: string;
  unit: string;
  quantity: number;
  rate: number;
  sectionName?: string;
  isReviewFlagged: boolean;
  flagReason?: string;
}

export interface ParseResult {
  items: ParsedBOQItem[];
  sections: string[];
  totalItems: number;
  flaggedItems: number;
  errors: string[];
}

interface RawRowData {
  [key: string]: string | number | undefined;
}

// ============================================
// Constants
// ============================================

// Common column name variations for BOQ data
const COLUMN_MAPPINGS = {
  code: ['code', 'item code', 'item no', 'item_code', 'sr no', 'sr. no', 's.no', 'sl no', 'sl. no'],
  description: ['description', 'item description', 'particulars', 'item', 'work description', 'details', 'name'],
  unit: ['unit', 'uom', 'unit of measurement', 'units'],
  quantity: ['quantity', 'qty', 'qnty', 'nos', 'no.', 'number'],
  rate: ['rate', 'unit rate', 'price', 'unit price', 'cost', 'amount per unit'],
  amount: ['amount', 'total', 'total amount', 'value', 'total cost'],
  section: ['section', 'category', 'work type', 'head', 'heading', 'group'],
};

// Category detection keywords
const CATEGORY_KEYWORDS: Record<BOQCategory, string[]> = {
  MATERIAL: ['material', 'cement', 'steel', 'brick', 'sand', 'aggregate', 'tile', 'paint', 'pipe', 'wire', 'fitting'],
  LABOUR: ['labour', 'labor', 'mason', 'carpenter', 'plumber', 'electrician', 'worker', 'manpower', 'wages'],
  SUB_WORK: ['sub work', 'subwork', 'sub-work', 'contract', 'subcontract', 'turnkey'],
  EQUIPMENT: ['equipment', 'machinery', 'machine', 'tool', 'rental', 'hire', 'crane', 'mixer', 'scaffolding'],
  OTHER: ['other', 'misc', 'miscellaneous', 'general', 'overhead'],
};

// ============================================
// Excel/CSV Parser
// ============================================

/**
 * Parse an Excel or CSV file buffer into BOQ items
 */
export function parseExcelBuffer(buffer: Buffer, fileName: string): ParseResult {
  const errors: string[] = [];
  const items: ParsedBOQItem[] = [];
  const sectionsSet = new Set<string>();

  try {
    // Read workbook
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    
    // Get first sheet
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return { items: [], sections: [], totalItems: 0, flaggedItems: 0, errors: ['No sheets found in file'] };
    }

    const sheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json<RawRowData>(sheet, { defval: '' });

    if (rawData.length === 0) {
      return { items: [], sections: [], totalItems: 0, flaggedItems: 0, errors: ['No data found in file'] };
    }

    // Detect column mappings from headers
    const headers = Object.keys(rawData[0] || {});
    const columnMap = detectColumnMappings(headers);

    if (!columnMap.description) {
      errors.push('Could not detect description column');
      return { items: [], sections: [], totalItems: 0, flaggedItems: 0, errors };
    }

    // Parse each row
    let currentSection = '';
    
    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      const rowNum = i + 2; // Excel row number (1-indexed + header)

      // Check if this is a section header row (has description but no quantity/rate)
      const description = getColumnValue(row, columnMap.description);
      const quantity = parseNumber(getColumnValue(row, columnMap.quantity));
      const rate = parseNumber(getColumnValue(row, columnMap.rate));
      const amount = parseNumber(getColumnValue(row, columnMap.amount));

      // Skip empty rows
      if (!description || description.toString().trim() === '') {
        continue;
      }

      // Detect section headers (rows with description but no numeric values)
      if ((quantity === 0 || isNaN(quantity)) && (rate === 0 || isNaN(rate)) && (amount === 0 || isNaN(amount))) {
        // Check if it looks like a section header
        const descStr = description.toString().toUpperCase();
        if (descStr.length < 100 && !descStr.includes('TOTAL')) {
          currentSection = description.toString().trim();
          sectionsSet.add(currentSection);
          continue;
        }
      }

      // Parse as BOQ item
      const item = parseRowToItem(row, columnMap, currentSection, rowNum, errors);
      if (item) {
        items.push(item);
      }
    }

    const flaggedItems = items.filter(item => item.isReviewFlagged).length;

    return {
      items,
      sections: Array.from(sectionsSet),
      totalItems: items.length,
      flaggedItems,
      errors,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error parsing file';
    return { items: [], sections: [], totalItems: 0, flaggedItems: 0, errors: [message] };
  }
}

/**
 * Detect column mappings from headers
 */
function detectColumnMappings(headers: string[]): Record<string, string | undefined> {
  const map: Record<string, string | undefined> = {};
  const normalizedHeaders = headers.map(h => h.toLowerCase().trim());

  for (const [field, variations] of Object.entries(COLUMN_MAPPINGS)) {
    for (const variation of variations) {
      const index = normalizedHeaders.findIndex(h => h.includes(variation));
      if (index !== -1) {
        map[field] = headers[index];
        break;
      }
    }
  }

  return map;
}

/**
 * Get value from row using column mapping
 */
function getColumnValue(row: RawRowData, column: string | undefined): string | number | undefined {
  if (!column) return undefined;
  return row[column];
}

/**
 * Parse a number from various formats
 */
function parseNumber(value: string | number | undefined): number {
  if (value === undefined || value === null || value === '') return 0;
  if (typeof value === 'number') return value;
  
  // Remove currency symbols, commas, spaces
  const cleaned = value.toString().replace(/[₹$,\s]/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Parse a row into a BOQ item
 */
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

  // If we have amount but not rate, calculate rate
  if (amount > 0 && rate === 0 && quantity > 0) {
    rate = amount / quantity;
  }

  // If we have amount but not quantity, and rate exists, calculate quantity
  if (amount > 0 && quantity === 0 && rate > 0) {
    quantity = amount / rate;
  }

  // Detect category from description and section
  const category = detectCategory(description, currentSection);

  // Flag items that need review
  let isReviewFlagged = false;
  let flagReason: string | undefined;

  if (quantity <= 0) {
    isReviewFlagged = true;
    flagReason = 'Quantity is zero or missing';
  } else if (rate <= 0 && amount <= 0) {
    isReviewFlagged = true;
    flagReason = 'Rate and amount are both zero or missing';
  } else if (!unit || unit === 'nos') {
    // Only flag if unit seems important
    const descLower = description.toLowerCase();
    if (descLower.includes('sq') || descLower.includes('meter') || descLower.includes('kg') || descLower.includes('cum')) {
      isReviewFlagged = true;
      flagReason = 'Unit may need verification';
    }
  }

  return {
    code: code || undefined,
    category,
    description,
    unit,
    quantity: quantity || 1,
    rate: rate || 0,
    sectionName: currentSection || undefined,
    isReviewFlagged,
    flagReason,
  };
}

/**
 * Detect BOQ category from description and section name
 */
function detectCategory(description: string, section: string): BOQCategory {
  const text = `${description} ${section}`.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        return category as BOQCategory;
      }
    }
  }

  return 'MATERIAL'; // Default to material
}

// ============================================
// PDF Parser (AI-powered)
// ============================================

/**
 * Parse a PDF file using OpenAI GPT-4
 */
export async function parsePDFWithAI(
  pdfText: string,
  openaiApiKey: string
): Promise<ParseResult> {
  const errors: string[] = [];

  try {
    const openai = new OpenAI({ apiKey: openaiApiKey });

    const systemPrompt = `You are a construction BOQ (Bill of Quantities) parser. Extract line items from the provided BOQ document text.

For each item, extract:
- code: Item code/number if present
- description: Full description of the work/material
- unit: Unit of measurement (sqft, cum, kg, nos, etc.)
- quantity: Numeric quantity
- rate: Unit rate/price
- sectionName: The section/category this item belongs to (e.g., "EARTHWORK", "CONCRETE WORK")
- category: One of MATERIAL, LABOUR, SUB_WORK, EQUIPMENT, or OTHER

Rules:
1. Skip header rows, totals, and subtotals
2. If quantity or rate is missing, set to 0 and flag for review
3. Detect the section from context (usually bold headers or uppercase text)
4. Be conservative - if unsure about a value, flag for review

Return a JSON object with:
{
  "items": [...],
  "sections": ["section1", "section2", ...],
  "errors": ["any parsing issues"]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Parse this BOQ document:\n\n${pdfText.substring(0, 15000)}` }, // Limit text length
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1, // Low temperature for consistent parsing
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return { items: [], sections: [], totalItems: 0, flaggedItems: 0, errors: ['No response from AI'] };
    }

    const parsed = JSON.parse(content) as {
      items: Array<{
        code?: string;
        description: string;
        unit: string;
        quantity: number;
        rate: number;
        sectionName?: string;
        category: string;
        isReviewFlagged?: boolean;
        flagReason?: string;
      }>;
      sections: string[];
      errors?: string[];
    };

    // Validate and transform items
    const items: ParsedBOQItem[] = parsed.items.map((item) => ({
      code: item.code,
      category: validateCategory(item.category),
      description: item.description || '',
      unit: item.unit || 'nos',
      quantity: item.quantity || 0,
      rate: item.rate || 0,
      sectionName: item.sectionName,
      isReviewFlagged: item.isReviewFlagged || item.quantity <= 0 || item.rate <= 0,
      flagReason: item.flagReason || (item.quantity <= 0 || item.rate <= 0 ? 'AI flagged for review' : undefined),
    }));

    const flaggedItems = items.filter(item => item.isReviewFlagged).length;

    return {
      items,
      sections: parsed.sections || [],
      totalItems: items.length,
      flaggedItems,
      errors: [...errors, ...(parsed.errors || [])],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error parsing PDF';
    return { items: [], sections: [], totalItems: 0, flaggedItems: 0, errors: [message] };
  }
}

/**
 * Validate category string to enum
 */
function validateCategory(category: string): BOQCategory {
  const upper = category?.toUpperCase() || '';
  if (['MATERIAL', 'LABOUR', 'SUB_WORK', 'EQUIPMENT', 'OTHER'].includes(upper)) {
    return upper as BOQCategory;
  }
  return 'MATERIAL';
}

// ============================================
// Export
// ============================================

export const boqImportService = {
  parseExcelBuffer,
  parsePDFWithAI,
};
