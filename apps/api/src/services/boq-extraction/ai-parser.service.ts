/**
 * AI Parser Service
 *
 * Uses OpenAI GPT-4o for intelligent BOQ document parsing.
 *
 * SIMPLIFIED APPROACH (v2):
 * - Sections come FROM the document - extracted as-is
 * - No mapping to organization's external categories
 * - Each item belongs to the section above it in the document
 * - Focus on correctly distinguishing section headers from line items
 *
 * PDF Parsing: Uses OpenAI Responses API (not Chat Completions)
 * which supports native PDF file input via input_file type.
 */

import OpenAI from 'openai';
import { z } from 'zod';

// Timeout configuration for AI operations
const AI_TIMEOUT_MS = 120000; // 2 minutes for PDF processing

// ============================================
// Types
// ============================================

export interface OrgCategory {
  id: string;
  name: string;
}

export interface RawExtractedItem {
  code?: string;
  description: string;
  unit: string;
  quantityRaw: string; // Keep as string for integrity
  rateRaw: string; // Keep as string for integrity
  amountRaw?: string; // Keep as string for integrity
  sectionName?: string;
  confidence: number; // 0-1
  flags: string[];
}

export interface ExtractionResult {
  items: RawExtractedItem[];
  sections: string[];
  documentTotalRaw?: string;
  errors: string[];
}

export interface MappedBOQItem {
  code?: string;
  description: string;
  unit: string;
  quantity: number;
  rate: number;
  sectionName?: string;
  // Category fields kept for backwards compatibility but no longer used for external mapping
  suggestedCategoryId: string | null;
  suggestedCategoryName: string | null;
  categoryConfidence: number;
  fieldConfidences: {
    description: number;
    unit: number;
    quantity: number;
    rate: number;
  };
  isReviewRequired: boolean;
  reviewReason?: string;
}

export interface ParseDocumentResult {
  items: MappedBOQItem[];
  sections: string[];
  documentTotal?: number;
  calculatedTotal: number;
  confidenceScore: number;
  checksumMatch: boolean;
  errors: string[];
}

// ============================================
// Zod Schemas for AI Response Validation
// ============================================

const ExtractedItemSchema = z.object({
  code: z.string().optional(),
  description: z.string(),
  unit: z.string(),
  quantityRaw: z.string(),
  rateRaw: z.string(),
  amountRaw: z.string().optional(),
  sectionName: z.string().optional(),
  confidence: z.number().min(0).max(1),
  flags: z.array(z.string()).default([]),
});

const ExtractionResultSchema = z.object({
  items: z.array(ExtractedItemSchema),
  sections: z.array(z.string()),
  documentTotalRaw: z.string().optional(),
  errors: z.array(z.string()).default([]),
});

// NOTE: CategoryMappingSchema removed in v2 - no longer mapping to external categories

// ============================================
// AI Parser Service Class
// ============================================

export class AIParserService {
  private openai: OpenAI;
  private model = 'gpt-4o';

  constructor(apiKey: string) {
    this.openai = new OpenAI({
      apiKey,
      timeout: AI_TIMEOUT_MS,
      maxRetries: 2,
    });
  }

  /**
   * Main entry point: Parse document and extract BOQ items
   *
   * SIMPLIFIED (v2): No external category mapping - sections come from document
   */
  async parseDocument(
    content: string,
    contentType: 'text' | 'table_json',
    _orgCategories: OrgCategory[], // Kept for API compatibility, but not used
    parseNumber: (value: string) => number
  ): Promise<ParseDocumentResult> {
    const errors: string[] = [];

    try {
      // Step 1: Extract raw structure (AI extracts, preserves exact values as strings)
      const extracted = await this.extractStructure(content, contentType);
      errors.push(...extracted.errors);

      if (extracted.items.length === 0) {
        return {
          items: [],
          sections: [],
          calculatedTotal: 0,
          confidenceScore: 0,
          checksumMatch: true,
          errors: errors.length > 0 ? errors : ['No items found in document'],
        };
      }

      // Step 2: Process items (no external category mapping - use sections from document)
      const items: MappedBOQItem[] = extracted.items.map((item) => {
        // Parse numbers with deterministic code
        const quantity = parseNumber(item.quantityRaw);
        const rate = parseNumber(item.rateRaw);
        const amount = item.amountRaw ? parseNumber(item.amountRaw) : null;

        // Calculate field confidences
        const fieldConfidences = {
          description: item.description.length > 5 ? 0.9 : 0.5,
          unit: this.isValidUnit(item.unit) ? 0.95 : 0.6,
          quantity: quantity > 0 ? 0.9 : 0.3,
          rate: rate > 0 ? 0.9 : 0.3,
        };

        // Infer missing values if possible
        let finalQuantity = quantity;
        let finalRate = rate;
        const flags = [...item.flags];

        if (quantity === 0 && rate > 0 && amount && amount > 0) {
          finalQuantity = amount / rate;
          flags.push('Quantity calculated from amount/rate');
        }
        if (rate === 0 && quantity > 0 && amount && amount > 0) {
          finalRate = amount / quantity;
          flags.push('Rate calculated from amount/quantity');
        }

        // Determine if review is required (simplified - no category confidence)
        const isReviewRequired =
          item.confidence < 0.7 || finalQuantity <= 0 || finalRate <= 0 || flags.length > 0;

        return {
          code: item.code,
          description: item.description,
          unit: item.unit || 'nos',
          quantity: finalQuantity,
          rate: finalRate,
          sectionName: item.sectionName,
          // No external category mapping - just use null
          suggestedCategoryId: null,
          suggestedCategoryName: null,
          categoryConfidence: item.confidence, // Use extraction confidence
          fieldConfidences,
          isReviewRequired,
          reviewReason: isReviewRequired
            ? flags.filter(Boolean).join('; ') || 'Low confidence or missing values'
            : undefined,
        };
      });

      // Calculate totals and confidence
      const calculatedTotal = items.reduce((sum, i) => sum + i.quantity * i.rate, 0);
      const documentTotal = extracted.documentTotalRaw
        ? parseNumber(extracted.documentTotalRaw)
        : undefined;

      // Average confidence from extraction confidence
      const avgConfidence =
        items.length > 0
          ? items.reduce((sum, i) => sum + i.categoryConfidence, 0) / items.length
          : 0;

      // Checksum validation (allow 1% tolerance for rounding)
      const tolerance = documentTotal ? documentTotal * 0.01 : 1;
      const checksumMatch =
        documentTotal === undefined || Math.abs(documentTotal - calculatedTotal) < tolerance;

      return {
        items,
        sections: extracted.sections,
        documentTotal,
        calculatedTotal,
        confidenceScore: Math.round(avgConfidence * 100),
        checksumMatch,
        errors,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        items: [],
        sections: [],
        calculatedTotal: 0,
        confidenceScore: 0,
        checksumMatch: true,
        errors: [message],
      };
    }
  }

  /**
   * Stage 1: Extract structure from document
   * AI identifies structure and extracts EXACT values as strings
   *
   * IMPROVED: Better section header vs line item distinction
   * IMPROVED: Explicit JSON schema, increased tokens, pre-validation
   */
  private async extractStructure(
    content: string,
    contentType: 'text' | 'table_json'
  ): Promise<ExtractionResult> {
    const systemPrompt = `You are a construction BOQ (Bill of Quantities) document parser.

YOUR TASK: Extract line items from the document while PRESERVING EXACT VALUES.

=== DOCUMENT STRUCTURE (CRITICAL) ===

BOQ documents have TWO types of rows:

1. SECTION HEADERS - Group headers like "EARTH WORKS", "PCC WORK", "FINISHING"
   - Usually have a MAIN serial number (1, 2, 3...)
   - Short text, often UPPERCASE or bold
   - NO unit, quantity, rate, or amount values (or zeros/dashes)
   - Act as group labels for the items below them
   - Typical examples: "EARTH WORKS", "PCC WORK", "STEEL", "MASON WORK", "PLUMBING"

2. LINE ITEMS - Actual work items with costs
   - Have SUB-serial numbers (1.1, 1.2, a, b, etc.) OR appear under a section
   - Long description with technical details
   - HAVE unit (M3, Sqm, Nos, etc.)
   - HAVE quantity, rate, and amount values

=== CRITICAL RULES ===

1. Extract numbers EXACTLY as they appear - do NOT calculate or modify
   - "1,23,456.78" → "1,23,456.78"
   - "15000" → "15000"
   - NEVER calculate amount from rate × quantity

2. SECTION IDENTIFICATION:
   - Look for 3-10 main sections (NOT 20+)
   - If finding more than 10 sections, you're likely misidentifying items as sections
   - A section header has NO numeric values for qty/rate/amount
   - Each item belongs to the MOST RECENT section header above it

3. Skip: total rows, subtotal rows, header rows, blank rows

4. If no clear section header exists, use "General" as the section name

=== REQUIRED OUTPUT SCHEMA (MUST FOLLOW EXACTLY) ===

You MUST return a JSON object with this EXACT structure:

{
  "items": [
    {
      "code": "1.1",
      "description": "Excavation in all types of soil including disposal...",
      "unit": "cum",
      "quantityRaw": "125.50",
      "rateRaw": "450.00",
      "amountRaw": "56475.00",
      "sectionName": "EARTH WORKS",
      "confidence": 0.95,
      "flags": []
    }
  ],
  "sections": ["EARTH WORKS", "PCC WORK"],
  "documentTotalRaw": "1234567.00",
  "errors": []
}

CRITICAL RULES FOR OUTPUT:
- "items" array is REQUIRED - NEVER omit it, use [] if empty
- "sections" array is REQUIRED - NEVER omit it, use [] if empty
- "errors" array is REQUIRED - use [] if no errors
- Every item MUST have: description, unit, quantityRaw, rateRaw, confidence, flags
- If no items found, return: { "items": [], "sections": [], "errors": ["No items found"] }
- Return ONLY valid JSON - no markdown, no explanation, no text before or after`;

    try {
      console.log(`[AIParser] Starting extraction, content length: ${content.length} chars`);

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content:
              contentType === 'table_json'
                ? `Parse this table data (JSON format):\n${content}`
                : `Parse this BOQ document:\n${content.substring(0, 100000)}`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
        max_tokens: 16384,
      });

      const rawContent = response.choices[0]?.message?.content;
      if (!rawContent) {
        console.error('[AIParser] No response content from AI');
        return { items: [], sections: [], errors: ['No response from AI'] };
      }

      console.log(`[AIParser] Response length: ${rawContent.length} chars`);

      // Parse JSON first
      let parsed;
      try {
        parsed = JSON.parse(rawContent);
      } catch (e) {
        console.error('[AIParser] Invalid JSON from AI:', rawContent.substring(0, 500));
        return { items: [], sections: [], errors: ['AI returned invalid JSON. Please try again.'] };
      }

      // Pre-validate required fields exist BEFORE Zod validation
      if (!parsed.items) {
        console.error('[AIParser] Response missing items array');
        console.error('[AIParser] Keys received:', Object.keys(parsed));
        console.error('[AIParser] Raw sample:', rawContent.substring(0, 500));
        return {
          items: [],
          sections: parsed.sections || [],
          errors: [
            'AI response incomplete - items array missing. The file may be too large or complex.',
          ],
        };
      }

      if (!Array.isArray(parsed.items)) {
        console.error('[AIParser] items is not an array:', typeof parsed.items);
        return { items: [], sections: [], errors: ['AI returned items in wrong format'] };
      }

      // Ensure sections and errors are arrays
      if (!parsed.sections) {
        parsed.sections = [];
      }
      if (!parsed.errors) {
        parsed.errors = [];
      }

      // Now safe to validate with Zod
      const result = ExtractionResultSchema.safeParse(parsed);

      if (!result.success) {
        console.error('[AIParser] AI response validation failed:', result.error);
        console.error('[AIParser] Parsed keys:', Object.keys(parsed));
        console.error('[AIParser] Items count:', parsed.items?.length);
        return { items: [], sections: [], errors: ['Failed to validate AI response structure'] };
      }

      console.log(`[AIParser] Successfully extracted ${result.data.items.length} items`);
      return result.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'AI extraction failed';
      console.error('[AIParser] Extraction failed:', message);
      return { items: [], sections: [], errors: [message] };
    }
  }

  // NOTE: mapCategories method removed in v2
  // External category mapping is no longer needed - sections come from the document

  /**
   * Parse PDF document directly using GPT-4o vision
   * Sends PDF as base64 to avoid unreliable third-party parsing libraries
   *
   * SIMPLIFIED (v2): No external category mapping - sections come from document
   */
  async parseDocumentWithPDF(
    pdfBuffer: Buffer,
    fileName: string,
    _orgCategories: OrgCategory[], // Kept for API compatibility, but not used
    parseNumber: (value: string) => number
  ): Promise<ParseDocumentResult> {
    const errors: string[] = [];

    try {
      // Convert PDF to base64
      const base64PDF = pdfBuffer.toString('base64');
      const dataUrl = `data:application/pdf;base64,${base64PDF}`;

      // Step 1: Extract raw structure from PDF using vision
      const extracted = await this.extractStructureFromPDF(dataUrl, fileName);
      errors.push(...extracted.errors);

      if (extracted.items.length === 0) {
        return {
          items: [],
          sections: [],
          calculatedTotal: 0,
          confidenceScore: 0,
          checksumMatch: true,
          errors: errors.length > 0 ? errors : ['No items found in PDF document'],
        };
      }

      // Step 2: Process items (no external category mapping - use sections from document)
      const items: MappedBOQItem[] = extracted.items.map((item) => {
        // Parse numbers with deterministic code
        const quantity = parseNumber(item.quantityRaw);
        const rate = parseNumber(item.rateRaw);
        const amount = item.amountRaw ? parseNumber(item.amountRaw) : null;

        // Calculate field confidences
        const fieldConfidences = {
          description: item.description.length > 5 ? 0.9 : 0.5,
          unit: this.isValidUnit(item.unit) ? 0.95 : 0.6,
          quantity: quantity > 0 ? 0.9 : 0.3,
          rate: rate > 0 ? 0.9 : 0.3,
        };

        // Infer missing values if possible
        let finalQuantity = quantity;
        let finalRate = rate;
        const flags = [...item.flags];

        if (quantity === 0 && rate > 0 && amount && amount > 0) {
          finalQuantity = amount / rate;
          flags.push('Quantity calculated from amount/rate');
        }
        if (rate === 0 && quantity > 0 && amount && amount > 0) {
          finalRate = amount / quantity;
          flags.push('Rate calculated from amount/quantity');
        }

        // Determine if review is required (simplified - no category confidence)
        const isReviewRequired =
          item.confidence < 0.7 || finalQuantity <= 0 || finalRate <= 0 || flags.length > 0;

        return {
          code: item.code,
          description: item.description,
          unit: item.unit || 'nos',
          quantity: finalQuantity,
          rate: finalRate,
          sectionName: item.sectionName,
          // No external category mapping - just use null
          suggestedCategoryId: null,
          suggestedCategoryName: null,
          categoryConfidence: item.confidence, // Use extraction confidence
          fieldConfidences,
          isReviewRequired,
          reviewReason: isReviewRequired
            ? flags.filter(Boolean).join('; ') || 'Low confidence or missing values'
            : undefined,
        };
      });

      // Calculate totals and confidence
      const calculatedTotal = items.reduce((sum, i) => sum + i.quantity * i.rate, 0);
      const documentTotal = extracted.documentTotalRaw
        ? parseNumber(extracted.documentTotalRaw)
        : undefined;

      // Average confidence from extraction confidence
      const avgConfidence =
        items.length > 0
          ? items.reduce((sum, i) => sum + i.categoryConfidence, 0) / items.length
          : 0;

      // Checksum validation (allow 1% tolerance for rounding)
      const tolerance = documentTotal ? documentTotal * 0.01 : 1;
      const checksumMatch =
        documentTotal === undefined || Math.abs(documentTotal - calculatedTotal) < tolerance;

      return {
        items,
        sections: extracted.sections,
        documentTotal,
        calculatedTotal,
        confidenceScore: Math.round(avgConfidence * 100),
        checksumMatch,
        errors,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        items: [],
        sections: [],
        calculatedTotal: 0,
        confidenceScore: 0,
        checksumMatch: true,
        errors: [message],
      };
    }
  }

  /**
   * Extract structure directly from PDF using OpenAI Responses API
   * Uses input_file type which supports native PDF parsing (not Chat Completions)
   *
   * IMPROVED: Better section header vs line item distinction
   * IMPROVED: Explicit JSON schema, pre-validation
   */
  private async extractStructureFromPDF(
    pdfDataUrl: string,
    fileName: string
  ): Promise<ExtractionResult> {
    const extractionPrompt = `You are a construction BOQ (Bill of Quantities) document parser.

YOUR TASK: Extract line items from this PDF document while PRESERVING EXACT VALUES.

=== DOCUMENT STRUCTURE (CRITICAL) ===

BOQ documents have TWO types of rows:

1. SECTION HEADERS - Group headers like "EARTH WORKS", "PCC WORK", "FINISHING"
   - Usually have a MAIN serial number (1, 2, 3...)
   - Short text, often UPPERCASE or bold
   - NO unit, quantity, rate, or amount values (or zeros/dashes)
   - Act as group labels for the items below them
   - Typical examples: "EARTH WORKS", "PCC WORK", "STEEL", "MASON WORK", "PLUMBING"

2. LINE ITEMS - Actual work items with costs
   - Have SUB-serial numbers (1.1, 1.2, a, b, etc.) OR appear under a section
   - Long description with technical details
   - HAVE unit (M3, Sqm, Nos, etc.)
   - HAVE quantity, rate, and amount values

=== CRITICAL RULES ===

1. Extract numbers EXACTLY as they appear - do NOT calculate or modify
   - "1,23,456.78" → "1,23,456.78"
   - "15000" → "15000"
   - "₹ 50,000" → "₹ 50,000"
   - NEVER calculate amount from rate × quantity

2. SECTION IDENTIFICATION (VERY IMPORTANT):
   - Look for 3-10 main sections (NOT 20+)
   - If finding more than 10 sections, you're likely misidentifying items as sections
   - A section header has NO numeric values for qty/rate/amount
   - Each item belongs to the MOST RECENT section header above it
   - Section names are usually: UPPERCASE, bold, or visually distinct

3. Skip: total rows, subtotal rows, header rows, blank rows
4. Handle tables, multi-column layouts, and various PDF formats
5. If no clear section header exists, use "General" as the section name

=== REQUIRED OUTPUT SCHEMA (MUST FOLLOW EXACTLY) ===

You MUST return a JSON object with this EXACT structure:

{
  "items": [
    {
      "code": "1.1",
      "description": "Excavation in all types of soil including disposal...",
      "unit": "cum",
      "quantityRaw": "125.50",
      "rateRaw": "450.00",
      "amountRaw": "56475.00",
      "sectionName": "EARTH WORKS",
      "confidence": 0.95,
      "flags": []
    }
  ],
  "sections": ["EARTH WORKS", "PCC WORK"],
  "documentTotalRaw": "1234567.00",
  "errors": []
}

CRITICAL RULES FOR OUTPUT:
- "items" array is REQUIRED - NEVER omit it, use [] if empty
- "sections" array is REQUIRED - NEVER omit it, use [] if empty
- "errors" array is REQUIRED - use [] if no errors
- Every item MUST have: description, unit, quantityRaw, rateRaw, confidence, flags
- If no items found, return: { "items": [], "sections": [], "errors": ["No items found"] }
- Return ONLY valid JSON - no markdown, no explanation, no text before or after`;

    console.log(`[AIParser] Starting PDF extraction for: ${fileName}`);
    const startTime = Date.now();

    try {
      // Use Responses API which supports native PDF file input
      // Docs: https://platform.openai.com/docs/guides/pdf-files
      const response = await this.openai.responses.create({
        model: this.model,
        input: [
          {
            role: 'user',
            content: [
              {
                type: 'input_file',
                filename: fileName,
                file_data: pdfDataUrl,
              },
              {
                type: 'input_text',
                text: extractionPrompt,
              },
            ],
          },
        ],
      });

      const elapsed = Date.now() - startTime;
      console.log(`[AIParser] PDF extraction completed in ${elapsed}ms`);

      // Responses API returns output_text directly
      const rawContent = response.output_text;
      if (!rawContent) {
        console.error('[AIParser] No output_text in response:', response);
        return { items: [], sections: [], errors: ['No response from AI for PDF extraction'] };
      }

      console.log(`[AIParser] Raw response length: ${rawContent.length} chars`);

      // Parse JSON response (may be wrapped in markdown code blocks)
      let jsonContent = rawContent.trim();
      if (jsonContent.startsWith('```json')) {
        jsonContent = jsonContent.slice(7);
      }
      if (jsonContent.startsWith('```')) {
        jsonContent = jsonContent.slice(3);
      }
      if (jsonContent.endsWith('```')) {
        jsonContent = jsonContent.slice(0, -3);
      }
      jsonContent = jsonContent.trim();

      // Parse JSON first
      let parsed;
      try {
        parsed = JSON.parse(jsonContent);
      } catch (e) {
        console.error('[AIParser] Invalid JSON from PDF AI:', jsonContent.substring(0, 500));
        return {
          items: [],
          sections: [],
          errors: ['AI returned invalid JSON from PDF. Please try again.'],
        };
      }

      // Pre-validate required fields exist BEFORE Zod validation
      if (!parsed.items) {
        console.error('[AIParser] PDF response missing items array');
        console.error('[AIParser] Keys received:', Object.keys(parsed));
        return {
          items: [],
          sections: parsed.sections || [],
          errors: [
            'AI response incomplete - items array missing. The PDF may be too large or complex.',
          ],
        };
      }

      if (!Array.isArray(parsed.items)) {
        console.error('[AIParser] PDF items is not an array:', typeof parsed.items);
        return { items: [], sections: [], errors: ['AI returned items in wrong format from PDF'] };
      }

      // Ensure sections and errors are arrays
      if (!parsed.sections) {
        parsed.sections = [];
      }
      if (!parsed.errors) {
        parsed.errors = [];
      }

      const result = ExtractionResultSchema.safeParse(parsed);

      if (!result.success) {
        console.error('[AIParser] PDF AI response validation failed:', result.error);
        console.error('[AIParser] Raw content was:', rawContent.substring(0, 500));
        return { items: [], sections: [], errors: ['Failed to validate AI response from PDF'] };
      }

      console.log(`[AIParser] Successfully extracted ${result.data.items.length} items from PDF`);
      return result.data;
    } catch (error) {
      const elapsed = Date.now() - startTime;
      const message = error instanceof Error ? error.message : 'PDF AI extraction failed';
      console.error(`[AIParser] PDF extraction failed after ${elapsed}ms:`, error);
      return { items: [], sections: [], errors: [message] };
    }
  }

  /**
   * Parse Excel/CSV document
   * - For CSV: Uses Chat Completions API with text content (more reliable)
   * - For Excel: Uses Responses API (may have limitations)
   */
  async parseDocumentWithExcel(
    buffer: Buffer,
    fileName: string,
    isCSV: boolean,
    _orgCategories: OrgCategory[], // Kept for API compatibility, but not used
    parseNumber: (value: string) => number
  ): Promise<ParseDocumentResult> {
    const errors: string[] = [];

    try {
      let extracted: ExtractionResult;

      if (isCSV) {
        // For CSV: Use text-based chat completions (no file upload issues)
        const csvContent = buffer.toString('utf-8');
        console.log(`[AIParser] Processing CSV as text, length: ${csvContent.length} chars`);
        extracted = await this.extractStructure(csvContent, 'table_json');
      } else {
        // For Excel: Try Responses API with base64
        const mimeType = fileName.endsWith('.xls')
          ? 'application/vnd.ms-excel'
          : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

        const base64Data = buffer.toString('base64');
        const dataUrl = `data:${mimeType};base64,${base64Data}`;

        extracted = await this.extractStructureFromExcel(dataUrl, fileName);
      }

      errors.push(...extracted.errors);

      if (extracted.items.length === 0) {
        return {
          items: [],
          sections: [],
          calculatedTotal: 0,
          confidenceScore: 0,
          checksumMatch: true,
          errors: errors.length > 0 ? errors : ['No items found in Excel document'],
        };
      }

      // Process items (same as PDF)
      const items: MappedBOQItem[] = extracted.items.map((item) => {
        const quantity = parseNumber(item.quantityRaw);
        const rate = parseNumber(item.rateRaw);
        const amount = item.amountRaw ? parseNumber(item.amountRaw) : null;

        const fieldConfidences = {
          description: item.description.length > 5 ? 0.9 : 0.5,
          unit: this.isValidUnit(item.unit) ? 0.95 : 0.6,
          quantity: quantity > 0 ? 0.9 : 0.3,
          rate: rate > 0 ? 0.9 : 0.3,
        };

        let finalQuantity = quantity;
        let finalRate = rate;
        const flags = [...item.flags];

        if (quantity === 0 && rate > 0 && amount && amount > 0) {
          finalQuantity = amount / rate;
          flags.push('Quantity calculated from amount/rate');
        }
        if (rate === 0 && quantity > 0 && amount && amount > 0) {
          finalRate = amount / quantity;
          flags.push('Rate calculated from amount/quantity');
        }

        const isReviewRequired =
          item.confidence < 0.7 || finalQuantity <= 0 || finalRate <= 0 || flags.length > 0;

        return {
          code: item.code,
          description: item.description,
          unit: item.unit || 'nos',
          quantity: finalQuantity,
          rate: finalRate,
          sectionName: item.sectionName,
          suggestedCategoryId: null,
          suggestedCategoryName: null,
          categoryConfidence: item.confidence,
          fieldConfidences,
          isReviewRequired,
          reviewReason: isReviewRequired
            ? flags.filter(Boolean).join('; ') || 'Low confidence or missing values'
            : undefined,
        };
      });

      const calculatedTotal = items.reduce((sum, i) => sum + i.quantity * i.rate, 0);
      const documentTotal = extracted.documentTotalRaw
        ? parseNumber(extracted.documentTotalRaw)
        : undefined;

      const avgConfidence =
        items.length > 0
          ? items.reduce((sum, i) => sum + i.categoryConfidence, 0) / items.length
          : 0;

      const tolerance = documentTotal ? documentTotal * 0.01 : 1;
      const checksumMatch =
        documentTotal === undefined || Math.abs(documentTotal - calculatedTotal) < tolerance;

      return {
        items,
        sections: extracted.sections,
        documentTotal,
        calculatedTotal,
        confidenceScore: Math.round(avgConfidence * 100),
        checksumMatch,
        errors,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[AIParser] Excel extraction failed:`, error);
      return {
        items: [],
        sections: [],
        calculatedTotal: 0,
        confidenceScore: 0,
        checksumMatch: true,
        errors: [message],
      };
    }
  }

  /**
   * Extract structure from Excel file using OpenAI Responses API
   * Sends file directly to AI (same approach as PDF)
   */
  private async extractStructureFromExcel(
    dataUrl: string,
    fileName: string
  ): Promise<ExtractionResult> {
    const extractionPrompt = `You are a construction BOQ (Bill of Quantities) document parser.

YOUR TASK: Extract line items from this Excel/CSV file while PRESERVING EXACT VALUES.

=== DOCUMENT STRUCTURE (CRITICAL) ===

BOQ documents have TWO types of rows:

1. SECTION HEADERS - Group headers like "EARTH WORKS", "PCC WORK", "FINISHING"
   - Usually have a MAIN serial number (1, 2, 3...)
   - Short text, often UPPERCASE
   - NO unit, quantity, rate, or amount values (or zeros/dashes)
   - Act as group labels for the items below them

2. LINE ITEMS - Actual work items with costs
   - Have SUB-serial numbers (1.1, 1.2, a, b, etc.) OR appear under a section
   - Long description with technical details
   - HAVE unit (M3, Sqm, Nos, etc.)
   - HAVE quantity, rate, and amount values

=== CRITICAL RULES ===

1. Extract numbers EXACTLY as they appear - do NOT calculate or modify
2. SECTION IDENTIFICATION: Look for 3-10 main sections (NOT 20+)
3. Skip: total rows, subtotal rows, header rows, blank rows
4. If no clear section header exists, use "General" as the section name

=== REQUIRED OUTPUT SCHEMA (MUST FOLLOW EXACTLY) ===

{
  "items": [
    {
      "code": "1.1",
      "description": "Excavation in all types of soil...",
      "unit": "cum",
      "quantityRaw": "125.50",
      "rateRaw": "450.00",
      "amountRaw": "56475.00",
      "sectionName": "EARTH WORKS",
      "confidence": 0.95,
      "flags": []
    }
  ],
  "sections": ["EARTH WORKS", "PCC WORK"],
  "documentTotalRaw": "1234567.00",
  "errors": []
}

CRITICAL:
- "items" array is REQUIRED - NEVER omit it, use [] if empty
- "sections" array is REQUIRED - NEVER omit it, use [] if empty
- "errors" array is REQUIRED - use [] if no errors
- Return ONLY valid JSON`;

    console.log(`[AIParser] Starting Excel extraction via Responses API for: ${fileName}`);
    const startTime = Date.now();

    try {
      // Use Responses API with input_file (same as PDF)
      const response = await this.openai.responses.create({
        model: this.model,
        input: [
          {
            role: 'user',
            content: [
              {
                type: 'input_file',
                filename: fileName,
                file_data: dataUrl,
              },
              {
                type: 'input_text',
                text: extractionPrompt,
              },
            ],
          },
        ],
      });

      const elapsed = Date.now() - startTime;
      console.log(`[AIParser] Excel extraction completed in ${elapsed}ms`);

      const rawContent = response.output_text;
      if (!rawContent) {
        console.error('[AIParser] No output_text in response');
        return { items: [], sections: [], errors: ['No response from AI for Excel extraction'] };
      }

      console.log(`[AIParser] Raw response length: ${rawContent.length} chars`);

      // Parse JSON (may be wrapped in markdown)
      let jsonContent = rawContent.trim();
      if (jsonContent.startsWith('```json')) jsonContent = jsonContent.slice(7);
      if (jsonContent.startsWith('```')) jsonContent = jsonContent.slice(3);
      if (jsonContent.endsWith('```')) jsonContent = jsonContent.slice(0, -3);
      jsonContent = jsonContent.trim();

      let parsed;
      try {
        parsed = JSON.parse(jsonContent);
      } catch (e) {
        console.error('[AIParser] Invalid JSON from Excel AI:', jsonContent.substring(0, 500));
        return { items: [], sections: [], errors: ['AI returned invalid JSON'] };
      }

      if (!parsed.items) {
        console.error('[AIParser] Excel response missing items array');
        return {
          items: [],
          sections: parsed.sections || [],
          errors: ['AI response incomplete - items array missing'],
        };
      }

      if (!Array.isArray(parsed.items)) {
        return { items: [], sections: [], errors: ['AI returned items in wrong format'] };
      }

      if (!parsed.sections) parsed.sections = [];
      if (!parsed.errors) parsed.errors = [];

      const result = ExtractionResultSchema.safeParse(parsed);

      if (!result.success) {
        console.error('[AIParser] Excel AI response validation failed:', result.error);
        return { items: [], sections: [], errors: ['Failed to validate AI response'] };
      }

      console.log(`[AIParser] Successfully extracted ${result.data.items.length} items from Excel`);
      return result.data;
    } catch (error) {
      const elapsed = Date.now() - startTime;
      const message = error instanceof Error ? error.message : 'Excel AI extraction failed';
      console.error(`[AIParser] Excel extraction failed after ${elapsed}ms:`, error);
      return { items: [], sections: [], errors: [message] };
    }
  }

  /**
   * Check if a unit is valid
   */
  private isValidUnit(unit: string): boolean {
    const validUnits = [
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
    ];
    return validUnits.includes(unit.toLowerCase().trim());
  }
}

// ============================================
// Singleton Instance
// ============================================

let aiParserInstance: AIParserService | null = null;

export function getAIParser(apiKey?: string): AIParserService {
  if (!aiParserInstance) {
    const key = apiKey || process.env.OPENAI_API_KEY;
    if (!key) {
      throw new Error('OPENAI_API_KEY is required for AI parsing');
    }
    aiParserInstance = new AIParserService(key);
  }
  return aiParserInstance;
}
