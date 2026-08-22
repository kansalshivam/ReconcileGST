/**
 * Universal Multi-ERP Columnar Sheet Parser & Fuzzy Auto-Mapper
 * Governed by:
 * - stage_4_documents/07_lld.md §1
 * - stage_4_documents/09_contracts_and_schemas.md §3.2
 * - stage_4_documents/11_error_catalog.md (ERR_PARSE_002, ERR_PARSE_003, ERR_PARSE_004, ERR_PARSE_005)
 * - ADR-003 (Fixed-Point BigInt Paise Arithmetic)
 *
 * Supports: Tally Prime, Tally ERP 9, Zoho Books, Busy, Marg, SAP, and Generic CSV/Excel.
 * Features: 48+ Alias Fuzzy Column Auto-Mapper and Multi-Rate Invoice Line Forward-Filling.
 */

import * as XLSX from 'xlsx';
import {
  InwardInvoice,
  SourceERP,
  Paise,
  GSTIN,
  ISODateString,
  StateCode,
  GSTIN_REGEX,
} from '@/types/recon';
import { ReconcileError } from '@/lib/errors';
import { normalizeInvoiceSyntax, sanitizeUtf8Bom } from '@/lib/parser-gstr2b';

/**
 * Result structure returned by ERP Sheet Parser
 */
export interface ParsedErpResult {
  readonly invoices: InwardInvoice[];
  readonly detectedErp: SourceERP;
  readonly headerRowIndex: number;
  readonly resolvedColumns: Record<string, string>;
  readonly totalRowsScanned: number;
  readonly consolidatedInvoicesCount: number;
  readonly totalTaxablePaise: Paise;
  readonly totalTaxPaise: Paise;
  readonly totalIgstPaise: Paise;
  readonly totalCgstPaise: Paise;
  readonly totalSgstPaise: Paise;
  readonly totalCessPaise: Paise;
  readonly totalGrossPaise: Paise;
  readonly warnings: string[];
  readonly invalidGstinRows: Array<{ rowIndex: number; gstin: string; rawInvoiceNo: string }>;
}

/**
 * Comprehensive Canonical Column Alias Dictionary (>100 aliases across Indian ERPs)
 */
export const ERP_COLUMN_ALIASES: Record<string, string[]> = {
  gstin: [
    'gstin', 'party gstin', 'supplier gstin', 'gstin/uin', 'party tax no', 'vendor gstin',
    'tax id', 'tin', 'party gstin no', 'supplier gst number', 'gst no', 'gst in', "party's gstin",
    'gstin / uin', "supplier's gstin", "vendor's gstin", 'customer/vendor gstin', 'party gst',
    'tax number', 'gst identification number', 'supplier tax no', 'vendor gstin no', 'ctin'
  ],
  invoiceNumber: [
    'invoice no', 'inv no', 'bill no', 'voucher no', 'vch no', 'doc no', 'invoice #',
    'invoice number', 'bill number', 'ref no', 'reference no', 'vch number', 'inv no.',
    'bill no.', 'document no', 'orig invoice no', 'voucher no.', 'invoice_no', 'bill_no',
    'vch_no', 'document number', 'doc number', 'bill ref', 'invoice ref', 'invoice id',
    'bill id', 'voucher id', 'inv num', 'bill num', 'ref num'
  ],
  invoiceDate: [
    'invoice date', 'inv date', 'bill date', 'date', 'vch date', 'voucher date', 'doc date',
    'bill dt', 'inv dt', 'posting date', 'document date', 'txn date', 'transaction date',
    'bill_date', 'invoice_date', 'vch_date', 'entry date', 'date of invoice', 'vch dt'
  ],
  supplierName: [
    'party name', 'supplier name', 'vendor name', 'party ledger name', 'ledger name',
    'account name', 'supplier', 'vendor', 'party', 'company name', 'particulars',
    "party's name", 'customer/vendor name', 'party_name', 'vendor_name', 'supplier_name',
    'ledger', 'account description', 'party name / ledger', 'name of supplier', 'party particulars'
  ],
  taxableValue: [
    'taxable value', 'assessable value', 'taxable amount', 'base amount', 'taxable val',
    'taxable', 'net assessable value', 'basic amount', 'taxable amt', 'assessable val',
    'taxable_val', 'taxable_amount', 'assessable amount', 'base val', 'net amount',
    'goods value', 'purchase amount', 'gross assessable value', 'taxable base'
  ],
  igst: [
    'igst', 'integrated tax', 'igst amount', 'igst amt', 'integrated goods and service tax',
    'igst (₹)', 'i-gst', 'igst payable', 'igst_amt', 'integrated tax amount', 'igst @ 18%',
    'igst @ 12%', 'igst @ 5%', 'igst @ 28%', 'integrated gst'
  ],
  cgst: [
    'cgst', 'central tax', 'cgst amount', 'cgst amt', 'central goods and service tax',
    'cgst (₹)', 'c-gst', 'cgst payable', 'cgst_amt', 'central tax amount', 'cgst @ 9%',
    'cgst @ 6%', 'cgst @ 2.5%', 'cgst @ 14%', 'central gst'
  ],
  sgst: [
    'sgst', 'state tax', 'sgst amount', 'sgst amt', 'utgst', 'state goods and service tax',
    'sgst (₹)', 's-gst', 'sgst/utgst', 'sgst payable', 'sgst_amt', 'utgst amt',
    'state tax amount', 'sgst @ 9%', 'sgst @ 6%', 'sgst @ 2.5%', 'sgst @ 14%', 'state gst'
  ],
  cess: [
    'cess', 'compensation cess', 'cess amount', 'cess amt', 'gst cess', 'cess (₹)',
    'cess payable', 'compensation cess amount', 'cess tax'
  ],
  totalValue: [
    'total value', 'invoice value', 'grand total', 'gross total', 'bill amount',
    'net amount', 'total amount', 'invoice total', 'voucher total', 'gross amt',
    'total val', 'net total', 'inv total', 'bill value', 'total', 'total (₹)',
    'final amount', 'gross amount', 'total invoice value'
  ],
  pos: [
    'pos', 'place of supply', 'state', 'pos state', 'supply state', 'state code',
    'place of supply (pos)', 'destination state', 'state name', 'pos code', 'supply place',
    'place of supply state'
  ],
  documentType: [
    'voucher type', 'vch type', 'type', 'doc type', 'document type', 'transaction type',
    'entry type', 'voucher_type', 'doc_type', 'inv type', 'nature of document'
  ],
  isReverseCharge: [
    'reverse charge', 'rcm', 'reverse charge applicable', 'is rcm', 'rcm applicable',
    'rev charge', 'reverse charge flag', 'rcm flag'
  ]
};

/**
 * Pure Levenshtein Distance similarity metric for fuzzy header resolution (0.0 to 1.0)
 */
export function stringSimilarity(s1: string, s2: string): number {
  const str1 = s1.toLowerCase().trim();
  const str2 = s2.toLowerCase().trim();
  if (str1 === str2) return 1.0;
  if (str1.length === 0 || str2.length === 0) return 0.0;

  const len1 = str1.length;
  const len2 = str2.length;
  const track = Array(len2 + 1).fill(null).map(() => Array(len1 + 1).fill(null));

  for (let i = 0; i <= len1; i += 1) track[0][i] = i;
  for (let j = 0; j <= len2; j += 1) track[j][0] = j;

  for (let j = 1; j <= len2; j += 1) {
    for (let i = 1; i <= len1; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1, // deletion
        track[j - 1][i] + 1, // insertion
        track[j - 1][i - 1] + indicator // substitution
      );
    }
  }

  const distance = track[len2][len1];
  const maxLen = Math.max(len1, len2);
  return 1.0 - distance / maxLen;
}

/**
 * Auto-detects delimiter for raw CSV/TSV text
 */
export function detectCsvDelimiter(csvText: string): string {
  const lines = csvText.split(/\r?\n/).filter(l => l.trim().length > 0).slice(0, 15);
  if (lines.length === 0) return ',';

  const delimiters = [',', '\t', ';', '|'];
  let bestDelimiter = ',';
  let maxConsistentCols = 0;

  for (const d of delimiters) {
    const counts = lines.map(line => line.split(d).length);
    const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
    if (avg > 1) {
      // Check variance
      const variance = counts.reduce((sum, c) => sum + Math.abs(c - avg), 0) / counts.length;
      if (variance < 1.0 && avg > maxConsistentCols) {
        maxConsistentCols = avg;
        bestDelimiter = d;
      }
    }
  }

  return bestDelimiter;
}

/**
 * Parses raw CSV line handling quoted entries with commas and escaped quotes
 */
export function parseCsvLine(line: string, delimiter: string = ','): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current.trim());
  return fields;
}

/**
 * Parses raw text into 2D string grid
 */
export function parseCsvToGrid(csvText: string): string[][] {
  const cleanText = sanitizeUtf8Bom(csvText);
  const delimiter = detectCsvDelimiter(cleanText);
  const lines = cleanText.split(/\r?\n/);
  const grid: string[][] = [];

  for (const line of lines) {
    if (line.trim().length === 0) continue;
    grid.push(parseCsvLine(line, delimiter));
  }

  return grid;
}

/**
 * Identifies column mapping by scanning headers against the canonical alias dictionary
 */
export function mapColumnsFromHeaderRow(headers: string[]): {
  mapping: Record<string, number>;
  resolvedCanonical: Record<string, string>;
  score: number;
} {
  const mapping: Record<string, number> = {};
  const resolvedCanonical: Record<string, string> = {};
  let score = 0;

  const cleanHeaders = headers.map(h =>
    h ? h.toString().toLowerCase().trim().replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ') : ''
  );

  const matchedCanonicals = new Set<string>();

  // 1. Exact alias match pass
  for (const [canonicalField, aliasList] of Object.entries(ERP_COLUMN_ALIASES)) {
    for (let colIdx = 0; colIdx < cleanHeaders.length; colIdx++) {
      const headerText = cleanHeaders[colIdx];
      if (!headerText) continue;

      if (aliasList.some(alias => alias === headerText || headerText === alias.toLowerCase())) {
        if (!mapping[canonicalField]) {
          mapping[canonicalField] = colIdx;
          resolvedCanonical[canonicalField] = headers[colIdx];
          matchedCanonicals.add(canonicalField);
          score += 10;
        }
      }
    }
  }

  // 2. Substring & Partial contains pass for unmatched canonical fields
  for (const [canonicalField, aliasList] of Object.entries(ERP_COLUMN_ALIASES)) {
    if (mapping[canonicalField] !== undefined) continue;

    for (let colIdx = 0; colIdx < cleanHeaders.length; colIdx++) {
      const headerText = cleanHeaders[colIdx];
      if (!headerText) continue;

      const isTaken = Object.values(mapping).includes(colIdx);
      if (isTaken) continue;

      const hasMatch = aliasList.some(alias => {
        if (alias.length >= 4 && headerText.includes(alias)) return true;
        return false;
      });

      if (hasMatch) {
        mapping[canonicalField] = colIdx;
        resolvedCanonical[canonicalField] = headers[colIdx];
        matchedCanonicals.add(canonicalField);
        score += 6;
        break;
      }
    }
  }

  // 3. Fuzzy similarity fallback (Levenshtein >= 0.82)
  for (const [canonicalField, aliasList] of Object.entries(ERP_COLUMN_ALIASES)) {
    if (mapping[canonicalField] !== undefined) continue;

    let bestSimilarity = 0;
    let bestColIdx = -1;

    for (let colIdx = 0; colIdx < cleanHeaders.length; colIdx++) {
      const headerText = cleanHeaders[colIdx];
      if (!headerText) continue;

      const isTaken = Object.values(mapping).includes(colIdx);
      if (isTaken) continue;

      for (const alias of aliasList) {
        const sim = stringSimilarity(headerText, alias);
        if (sim > bestSimilarity && sim >= 0.82) {
          bestSimilarity = sim;
          bestColIdx = colIdx;
        }
      }
    }

    if (bestColIdx !== -1) {
      mapping[canonicalField] = bestColIdx;
      resolvedCanonical[canonicalField] = headers[bestColIdx];
      matchedCanonicals.add(canonicalField);
      score += 4;
    }
  }

  return { mapping, resolvedCanonical, score };
}

/**
 * Scans first 25 rows to identify the true table header row
 */
export function findHeaderRow(grid: string[][]): {
  headerRowIndex: number;
  mapping: Record<string, number>;
  resolvedColumns: Record<string, string>;
} {
  const maxScanRows = Math.min(25, grid.length);
  let bestRowIndex = 0;
  let bestScore = -1;
  let bestMapping: Record<string, number> = {};
  let bestResolved: Record<string, string> = {};

  for (let r = 0; r < maxScanRows; r++) {
    const row = grid[r];
    if (!row || row.length === 0) continue;

    const { mapping, resolvedCanonical, score } = mapColumnsFromHeaderRow(row);

    // Boost score if mandatory fields (gstin / invoiceNumber / taxableValue / date) are found
    let mandatoryBoost = 0;
    if (mapping.gstin !== undefined) mandatoryBoost += 15;
    if (mapping.invoiceNumber !== undefined) mandatoryBoost += 15;
    if (mapping.taxableValue !== undefined || mapping.totalValue !== undefined) mandatoryBoost += 15;
    if (mapping.invoiceDate !== undefined) mandatoryBoost += 10;

    const totalScore = score + mandatoryBoost;

    if (totalScore > bestScore) {
      bestScore = totalScore;
      bestRowIndex = r;
      bestMapping = mapping;
      bestResolved = resolvedCanonical;
    }
  }

  // Ensure we resolved at least some core fields
  if (bestScore < 15) {
    // If no good header found, try row 0
    if (grid.length > 0) {
      const fallback = mapColumnsFromHeaderRow(grid[0]);
      bestMapping = fallback.mapping;
      bestResolved = fallback.resolvedCanonical;
      bestRowIndex = 0;
    }
  }

  return {
    headerRowIndex: bestRowIndex,
    mapping: bestMapping,
    resolvedColumns: bestResolved,
  };
}

/**
 * Detects Source ERP from headers, grid contents, or metadata
 */
export function detectSourceErp(grid: string[][], resolvedColumns: Record<string, string>): SourceERP {
  const sampleText = grid.slice(0, 10).map(r => r.join(' ').toLowerCase()).join(' ');

  if (sampleText.includes('tally') || (resolvedColumns.supplierName && resolvedColumns.supplierName.toLowerCase().includes('particulars'))) {
    return 'TALLY';
  }
  if (sampleText.includes('zoho') || sampleText.includes('source of supply') || sampleText.includes('vendor name')) {
    return 'ZOHO';
  }
  if (sampleText.includes('busy') || sampleText.includes('mat. center') || sampleText.includes('voucher type')) {
    return 'BUSY';
  }
  if (sampleText.includes('marg') || sampleText.includes('party balance') || sampleText.includes('marg erp')) {
    return 'MARG';
  }
  if (sampleText.includes('sap') || sampleText.includes('purchasing doc') || sampleText.includes('alv') || sampleText.includes('doc. number')) {
    return 'SAP';
  }

  return 'GENERIC_EXCEL';
}

/**
 * Parses raw cell value to integer Paise (BigInt).
 * Handles commas, parentheses for negative numbers, currency symbols, and floats.
 */
export function cellToPaise(val: unknown): Paise {
  if (val === undefined || val === null || val === '') return 0n;

  if (typeof val === 'bigint') return val;

  if (typeof val === 'number') {
    if (isNaN(val)) return 0n;
    return BigInt(Math.round(val * 100));
  }

  let str = String(val).trim();
  if (!str) return 0n;

  // Handle accounting negative parentheses: "(1,450.00)" -> -145000n
  let isNegative = false;
  if (str.startsWith('(') && str.endsWith(')')) {
    isNegative = true;
    str = str.slice(1, -1).trim();
  } else if (str.startsWith('-')) {
    isNegative = true;
    str = str.slice(1).trim();
  }

  // Remove currency symbols, commas, spaces
  const cleanNumStr = str.replace(/[^0-9.]/g, '');
  if (!cleanNumStr) return 0n;

  const num = parseFloat(cleanNumStr);
  if (isNaN(num)) return 0n;

  const paise = BigInt(Math.round(num * 100));
  return isNegative ? -paise : paise;
}

/**
 * Parses diverse date formats into ISO date string (YYYY-MM-DD)
 * Also handles Excel numerical date serials (e.g. 45500)
 */
export function parseErpDate(val: unknown): ISODateString {
  if (!val) return new Date().toISOString().split('T')[0];

  // Excel serial number (e.g. 45500 -> 2024-07-27)
  if (typeof val === 'number' && val > 20000 && val < 60000) {
    try {
      const dateObj = new Date(Math.round((val - 25569) * 86400 * 1000));
      if (!isNaN(dateObj.getTime())) {
        return dateObj.toISOString().split('T')[0];
      }
    } catch {
      // ignore
    }
  }

  const str = String(val).trim();
  if (!str) return new Date().toISOString().split('T')[0];

  // Pattern: DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const dmyMatch = str.match(/^(\d{1,2})[-\/. ](\d{1,2})[-\/. ](\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }

  // Pattern: YYYY-MM-DD or YYYY/MM/DD
  const ymdMatch = str.match(/^(\d{4})[-\/. ](\d{1,2})[-\/. ](\d{1,2})$/);
  if (ymdMatch) {
    const year = ymdMatch[1];
    const month = ymdMatch[2].padStart(2, '0');
    const day = ymdMatch[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Pattern: DD-MMM-YY or DD-MMM-YYYY (e.g. 01-Aug-2026, 15-AUG-26)
  const monthMap: Record<string, string> = {
    jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
    jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
  };
  const dMmmMatch = str.match(/^(\d{1,2})[-\/ ]([A-Za-z]{3})[-\/ ](\d{2,4})$/);
  if (dMmmMatch) {
    const day = dMmmMatch[1].padStart(2, '0');
    const month = monthMap[dMmmMatch[2].toLowerCase()] || '01';
    let year = dMmmMatch[3];
    if (year.length === 2) {
      year = `20${year}`;
    }
    return `${year}-${month}-${day}`;
  }

  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split('T')[0];
  }

  return str;
}

/**
 * Determines document classification: 'INV' | 'CRN' | 'DBN'
 */
export function determineDocumentType(
  rawDocType: string | undefined,
  totalValuePaise: Paise,
  rawInvoiceNo: string
): 'INV' | 'CRN' | 'DBN' {
  const str = (rawDocType || '').toUpperCase();
  const invStr = (rawInvoiceNo || '').toUpperCase();

  if (
    str.includes('CREDIT NOTE') ||
    str.includes('CRN') ||
    str.includes('PURCHASE RETURN') ||
    str.includes('PUR RETURN') ||
    invStr.startsWith('CRN') ||
    invStr.startsWith('CN/')
  ) {
    return 'CRN';
  }

  if (
    str.includes('DEBIT NOTE') ||
    str.includes('DBN') ||
    invStr.startsWith('DBN') ||
    invStr.startsWith('DN/')
  ) {
    return 'DBN';
  }

  if (totalValuePaise < 0n) {
    return 'CRN';
  }

  return 'INV';
}

/**
 * Cleans and sanitizes GSTIN
 */
export function cleanGstin(val: unknown): string {
  if (!val) return '';
  return String(val).trim().toUpperCase().replace(/[\s\-_]/g, '');
}

/**
 * Checks if a row is a summary / total line that should be skipped
 */
export function isSummaryOrTotalRow(row: string[]): boolean {
  const rowText = row.join(' ').toLowerCase().trim();
  if (
    rowText.startsWith('grand total') ||
    rowText.startsWith('total') ||
    rowText.startsWith('closing balance') ||
    rowText.startsWith('opening balance') ||
    rowText.includes('total amount') ||
    rowText.includes('report generated on') ||
    rowText.includes('page ') ||
    rowText === ''
  ) {
    return true;
  }
  return false;
}

/**
 * Main Multi-ERP Columnar Sheet Parser
 * Supports ArrayBuffer (.xlsx, .xls, .csv), Uint8Array, or raw CSV string
 */
export function parseErpSheet(rawInput: ArrayBuffer | Uint8Array | string): ParsedErpResult {
  const warnings: string[] = [];
  const invalidGstinRows: Array<{ rowIndex: number; gstin: string; rawInvoiceNo: string }> = [];

  let grid: string[][] = [];

  if (typeof rawInput === 'string') {
    grid = parseCsvToGrid(rawInput);
  } else {
    // Attempt SheetJS workbook parsing
    try {
      const buffer = rawInput instanceof Uint8Array ? rawInput.buffer : rawInput;
      const wb = XLSX.read(buffer, { type: 'array', cellDates: false });
      const firstSheetName = wb.SheetNames[0];
      if (!firstSheetName) {
        throw new ReconcileError('ERR_PARSE_007', 'Excel file contains no worksheets.', undefined, 'LOW');
      }

      const worksheet = wb.Sheets[firstSheetName];
      const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        raw: false,
        defval: '',
      });

      grid = rawRows.map(row => (Array.isArray(row) ? row.map(cell => (cell !== undefined && cell !== null ? String(cell).trim() : '')) : []));
    } catch (sheetJsErr) {
      // If SheetJS fails, try decoding as CSV/UTF-8 string
      try {
        const text = sanitizeUtf8Bom(rawInput);
        grid = parseCsvToGrid(text);
      } catch {
        throw new ReconcileError(
          'ERR_PARSE_002',
          `Failed to parse ERP workbook / CSV: ${(sheetJsErr as Error).message}`,
          { originalError: (sheetJsErr as Error).message },
          'HIGH'
        );
      }
    }
  }

  if (grid.length === 0) {
    throw new ReconcileError('ERR_PARSE_007', 'Uploaded file contains zero records.', undefined, 'LOW');
  }

  // Find header row and column mapping
  const { headerRowIndex, mapping, resolvedColumns } = findHeaderRow(grid);
  const detectedErp = detectSourceErp(grid, resolvedColumns);

  // Validate mandatory fields
  const hasGstin = mapping.gstin !== undefined;
  const hasInvNo = mapping.invoiceNumber !== undefined;
  const hasTaxable = mapping.taxableValue !== undefined || mapping.totalValue !== undefined;

  if (!hasGstin && !hasInvNo && !hasTaxable) {
    throw new ReconcileError(
      'ERR_PARSE_004',
      'Unresolved mandatory column headers. Could not identify GSTIN, Invoice Number, or Taxable Amount.',
      { resolvedColumns, scannedHeaderRow: grid[headerRowIndex] },
      'HIGH'
    );
  }

  const invoices: InwardInvoice[] = [];
  let totalTaxablePaise: Paise = 0n;
  let totalIgstPaise: Paise = 0n;
  let totalCgstPaise: Paise = 0n;
  let totalSgstPaise: Paise = 0n;
  let totalCessPaise: Paise = 0n;
  let totalGrossPaise: Paise = 0n;

  // -------------------------------------------------------------------------
  // Multi-Rate Forward-Filling Engine (Consolidates multi-line vouchers)
  // -------------------------------------------------------------------------
  interface ActiveInvoiceContext {
    internalId: string;
    rawRowIndex: number;
    gstin: string;
    supplierName: string;
    invoiceNumber: string;
    invoiceDate: ISODateString;
    taxableValuePaise: Paise;
    igstPaise: Paise;
    cgstPaise: Paise;
    sgstPaise: Paise;
    cessPaise: Paise;
    totalValuePaise: Paise;
    pos: StateCode;
    isReverseCharge: boolean;
    documentType: 'INV' | 'CRN' | 'DBN';
    hasExplicitTotal: boolean;
    lineCount: number;
  }

  let activeContext: ActiveInvoiceContext | null = null;

  function commitActiveInvoice() {
    if (!activeContext) return;

    // Calculate total value if not explicitly given or if multi-rate lines were added
    let finalTotalPaise = activeContext.totalValuePaise;
    const computedTotal =
      activeContext.taxableValuePaise +
      activeContext.igstPaise +
      activeContext.cgstPaise +
      activeContext.sgstPaise +
      activeContext.cessPaise;

    if (!activeContext.hasExplicitTotal || activeContext.lineCount > 1 || finalTotalPaise === 0n) {
      finalTotalPaise = computedTotal;
    }

    // Polarity handling for credit notes: keep magnitudes positive for fixed-point matching
    const absTaxable = activeContext.taxableValuePaise < 0n ? -activeContext.taxableValuePaise : activeContext.taxableValuePaise;
    const absIgst = activeContext.igstPaise < 0n ? -activeContext.igstPaise : activeContext.igstPaise;
    const absCgst = activeContext.cgstPaise < 0n ? -activeContext.cgstPaise : activeContext.cgstPaise;
    const absSgst = activeContext.sgstPaise < 0n ? -activeContext.sgstPaise : activeContext.sgstPaise;
    const absCess = activeContext.cessPaise < 0n ? -activeContext.cessPaise : activeContext.cessPaise;
    const absTotal = finalTotalPaise < 0n ? -finalTotalPaise : finalTotalPaise;

    const normalizedInvNo = normalizeInvoiceSyntax(activeContext.invoiceNumber);

    const invoice: InwardInvoice = {
      internalId: activeContext.internalId,
      gstin: activeContext.gstin,
      supplierName: activeContext.supplierName,
      invoiceNumber: activeContext.invoiceNumber,
      normalizedInvoiceNumber: normalizedInvNo,
      invoiceDate: activeContext.invoiceDate,
      taxableValuePaise: absTaxable,
      igstPaise: absIgst,
      cgstPaise: absCgst,
      sgstPaise: absSgst,
      cessPaise: absCess,
      totalValuePaise: absTotal,
      pos: activeContext.pos,
      isReverseCharge: activeContext.isReverseCharge,
      sourceErp: detectedErp,
      rawRowIndex: activeContext.rawRowIndex,
      documentType: activeContext.documentType,
    };

    invoices.push(invoice);

    totalTaxablePaise += absTaxable;
    totalIgstPaise += absIgst;
    totalCgstPaise += absCgst;
    totalSgstPaise += absSgst;
    totalCessPaise += absCess;
    totalGrossPaise += absTotal;

    activeContext = null;
  }

  const rows = grid.slice(headerRowIndex + 1);

  for (let rIdx = 0; rIdx < rows.length; rIdx++) {
    const row = rows[rIdx];
    if (!row || row.length === 0) continue;
    if (isSummaryOrTotalRow(row)) continue;

    const rawGstin = mapping.gstin !== undefined ? cleanGstin(row[mapping.gstin]) : '';
    const rawInvNo = mapping.invoiceNumber !== undefined ? (row[mapping.invoiceNumber] || '').trim() : '';
    const rawDate = mapping.invoiceDate !== undefined ? (row[mapping.invoiceDate] || '').trim() : '';
    const rawSupplier = mapping.supplierName !== undefined ? (row[mapping.supplierName] || '').trim() : '';

    const rawTaxable = mapping.taxableValue !== undefined ? cellToPaise(row[mapping.taxableValue]) : 0n;
    const rawIgst = mapping.igst !== undefined ? cellToPaise(row[mapping.igst]) : 0n;
    const rawCgst = mapping.cgst !== undefined ? cellToPaise(row[mapping.cgst]) : 0n;
    const rawSgst = mapping.sgst !== undefined ? cellToPaise(row[mapping.sgst]) : 0n;
    const rawCess = mapping.cess !== undefined ? cellToPaise(row[mapping.cess]) : 0n;
    const rawTotal = mapping.totalValue !== undefined ? cellToPaise(row[mapping.totalValue]) : 0n;

    const rawPos = mapping.pos !== undefined ? (row[mapping.pos] || '').trim() : '';
    const rawDocType = mapping.documentType !== undefined ? (row[mapping.documentType] || '').trim() : '';
    const rawRcm = mapping.isReverseCharge !== undefined ? (row[mapping.isReverseCharge] || '').trim() : '';

    const isRcm = rawRcm.toUpperCase() === 'Y' || rawRcm.toUpperCase() === 'YES' || rawRcm.toUpperCase() === 'TRUE';

    const hasAnyTaxOrValue = rawTaxable !== 0n || rawIgst !== 0n || rawCgst !== 0n || rawSgst !== 0n || rawCess !== 0n || rawTotal !== 0n;

    // Detect if this row starts a NEW invoice
    const isNewInvoice = (rawInvNo !== '' || rawGstin !== '' || (rawSupplier !== '' && rawDate !== ''));

    if (isNewInvoice) {
      // Commit previously active invoice before starting a new one
      commitActiveInvoice();

      // Validate GSTIN format
      if (rawGstin && !GSTIN_REGEX.test(rawGstin)) {
        invalidGstinRows.push({
          rowIndex: headerRowIndex + 1 + rIdx,
          gstin: rawGstin,
          rawInvoiceNo: rawInvNo,
        });
      }

      const invoiceNumber = rawInvNo || `ERP-VCH-${rIdx + 1}`;
      const gstin: GSTIN = rawGstin || '07AAAAA0000A1Z5';
      const supplierName = rawSupplier || `Vendor ${gstin.slice(0, 10)}`;
      const invoiceDate = parseErpDate(rawDate);

      let pos: StateCode = '07';
      if (rawPos) {
        const cleanPos = rawPos.replace(/[^0-9]/g, '');
        if (cleanPos.length >= 2) {
          pos = cleanPos.slice(0, 2);
        }
      } else if (gstin.length >= 2) {
        const s = gstin.slice(0, 2).replace(/[^0-9]/g, '');
        if (s.length === 2) pos = s;
      }

      const docType = determineDocumentType(rawDocType, rawTotal || rawTaxable, invoiceNumber);

      activeContext = {
        internalId: `erp_${gstin}_${normalizeInvoiceSyntax(invoiceNumber) || invoiceNumber}_${rIdx + 1}`,
        rawRowIndex: headerRowIndex + 1 + rIdx,
        gstin,
        supplierName,
        invoiceNumber,
        invoiceDate,
        taxableValuePaise: rawTaxable,
        igstPaise: rawIgst,
        cgstPaise: rawCgst,
        sgstPaise: rawSgst,
        cessPaise: rawCess,
        totalValuePaise: rawTotal,
        pos,
        isReverseCharge: isRcm,
        documentType: docType,
        hasExplicitTotal: rawTotal !== 0n,
        lineCount: 1,
      };
    } else if (activeContext && hasAnyTaxOrValue) {
      // Continuation line (Multi-Rate line item) -> Forward-fill and aggregate
      activeContext.taxableValuePaise += rawTaxable;
      activeContext.igstPaise += rawIgst;
      activeContext.cgstPaise += rawCgst;
      activeContext.sgstPaise += rawSgst;
      activeContext.cessPaise += rawCess;
      if (rawTotal !== 0n) {
        activeContext.totalValuePaise += rawTotal;
      }
      activeContext.lineCount += 1;
    }
  }

  // Commit the final active invoice
  commitActiveInvoice();

  if (invalidGstinRows.length > 0) {
    warnings.push(`Identified ${invalidGstinRows.length} rows with invalid/non-standard GSTIN formatting.`);
  }

  const totalTaxPaise: Paise = totalIgstPaise + totalCgstPaise + totalSgstPaise + totalCessPaise;

  return {
    invoices,
    detectedErp,
    headerRowIndex,
    resolvedColumns,
    totalRowsScanned: grid.length,
    consolidatedInvoicesCount: invoices.length,
    totalTaxablePaise,
    totalTaxPaise,
    totalIgstPaise,
    totalCgstPaise,
    totalSgstPaise,
    totalCessPaise,
    totalGrossPaise,
    warnings,
    invalidGstinRows,
  };
}

/**
 * Convenience wrapper to parse ERP from raw ArrayBuffer
 */
export function parseErpBuffer(buffer: ArrayBuffer): ParsedErpResult {
  return parseErpSheet(buffer);
}
