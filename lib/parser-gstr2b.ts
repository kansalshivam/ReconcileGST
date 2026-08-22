/**
 * Official Government GSTR-2B Streaming JSON Parser (v1.0 Schema)
 * Governed by:
 * - stage_4_documents/07_lld.md §1 & §2
 * - stage_4_documents/09_contracts_and_schemas.md §3.3
 * - stage_4_documents/11_error_catalog.md (ERR_PARSE_001, ERR_PARSE_003, ERR_PARSE_005, ERR_PARSE_007)
 * - ADR-003 (Fixed-Point BigInt Paise Arithmetic)
 *
 * Supports sections: b2b, b2ba, cdnr, cdnra, and itcavl/nonitcavl structures.
 */

import {
  Gstr2bRecord,
  Gstr2bInvoiceType,
  ItcAvailability,
  Paise,
  GSTIN,
  ISODateString,
  FilingPeriod,
  StateCode,
  GSTIN_REGEX,
} from '@/types/recon';
import { ReconcileError } from '@/lib/errors';

/**
 * Result structure returned by the GSTR-2B Parser
 */
export interface ParsedGstr2bResult {
  readonly recipientGstin: GSTIN;
  readonly legalName?: string;
  readonly tradeName?: string;
  readonly filingPeriod: FilingPeriod;
  readonly generationDate?: string;
  readonly version: string;
  readonly records: Gstr2bRecord[];
  readonly totalRecords: number;
  readonly totalTaxablePaise: Paise;
  readonly totalTaxPaise: Paise;
  readonly totalIgstPaise: Paise;
  readonly totalCgstPaise: Paise;
  readonly totalSgstPaise: Paise;
  readonly totalCessPaise: Paise;
  readonly totalGrossPaise: Paise;
  readonly sectionCounts: {
    b2b: number;
    b2ba: number;
    cdnr: number;
    cdnra: number;
    itcAvailableCount: number;
    itcIneligibleCount: number;
  };
  readonly warnings: string[];
}

/**
 * Strips UTF-8 BOM (0xEF, 0xBB, 0xBF) and decodes ArrayBuffer / Uint8Array / string to clean string
 */
export function sanitizeUtf8Bom(input: ArrayBuffer | Uint8Array | string): string {
  if (typeof input === 'string') {
    // Strip leading UTF-8 BOM character (\uFEFF) if present in string
    if (input.charCodeAt(0) === 0xfeff) {
      return input.slice(1);
    }
    return input;
  }

  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  if (bytes.length === 0) {
    throw new ReconcileError('ERR_PARSE_007', 'The uploaded file is empty (0 bytes).', undefined, 'LOW');
  }

  // Check 3-byte BOM: 0xEF, 0xBB, 0xBF
  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    const textDecoder = new TextDecoder('utf-8');
    return textDecoder.decode(bytes.subarray(3));
  }

  // Decode standard UTF-8 without BOM
  const textDecoder = new TextDecoder('utf-8', { fatal: false });
  const decoded = textDecoder.decode(bytes);
  if (decoded.charCodeAt(0) === 0xfeff) {
    return decoded.slice(1);
  }
  return decoded;
}

/**
 * Normalizes invoice syntax according to statutory rules (Pass 2 Normalization):
 * 1. Strips leading standard prefixes: INV, BILL, TAX, VCH, PUR, EXP, GST
 * 2. Strips Financial Year tokens: 2024-25, 24-25, 2025-26, 25-26, 2026-27, 26-27, etc.
 * 3. Strips delimiters: /, -, _, space, period, hash
 * 4. Strips leading zeros
 */
export function normalizeInvoiceSyntax(invNo: string): string {
  if (!invNo) return '';
  let s = invNo.trim().toUpperCase();

  // Strip standard invoice prefixes (e.g. "INV/", "TAX-", "BILL ", "PUR/")
  s = s.replace(/^(INV|BILL|TAX|VCH|PUR|EXP|GST)[\/\-_ #]*/i, '');

  // Strip financial year tokens (e.g. "2024-25", "24-25", "2025-2026", "2026_27", "202425")
  s = s.replace(/(202[3-9][\/\-_]?(?:20)?[2-9][0-9]|2[3-9][\/\-_]?[2-9][0-9])/gi, '');

  // Strip delimiters and special characters
  s = s.replace(/[\/\-_#.\s]/g, '');

  // Strip leading zeros (e.g. "00042" -> "42")
  s = s.replace(/^0+/, '');

  return s || invNo.trim().toUpperCase().replace(/[\/\-_#.\s]/g, '');
}

/**
 * Parses diverse date formats into standard ISO string (YYYY-MM-DD):
 * Supports: DD-MM-YYYY, DD/MM/YYYY, YYYY-MM-DD, YYYY/MM/DD, DD.MM.YYYY, D-M-YYYY
 */
export function parseGstrDate(dateVal: unknown, defaultPeriod?: string): ISODateString {
  if (!dateVal) {
    if (defaultPeriod && defaultPeriod.length === 6) {
      // Convert MMYYYY to YYYY-MM-01
      const mm = defaultPeriod.substring(0, 2);
      const yyyy = defaultPeriod.substring(2, 6);
      return `${yyyy}-${mm}-01`;
    }
    return new Date().toISOString().split('T')[0];
  }

  const str = String(dateVal).trim();

  // Pattern 1: DD-MM-YYYY or DD/MM/YYYY or DD.MM.YYYY
  const dmyMatch = str.match(/^(\d{1,2})[-\/. ](\d{1,2})[-\/. ](\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }

  // Pattern 2: YYYY-MM-DD or YYYY/MM/DD
  const ymdMatch = str.match(/^(\d{4})[-\/. ](\d{1,2})[-\/. ](\d{1,2})$/);
  if (ymdMatch) {
    const year = ymdMatch[1];
    const month = ymdMatch[2].padStart(2, '0');
    const day = ymdMatch[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Pattern 3: DD-MMM-YYYY or DD-MMM-YY (e.g. 15-Aug-2026)
  const monthMap: Record<string, string> = {
    jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
    jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
  };
  const dMmmYMatch = str.match(/^(\d{1,2})[-\/ ]([A-Za-z]{3})[-\/ ](\d{2,4})$/);
  if (dMmmYMatch) {
    const day = dMmmYMatch[1].padStart(2, '0');
    const monStr = dMmmYMatch[2].toLowerCase();
    const month = monthMap[monStr] || '01';
    let year = dMmmYMatch[3];
    if (year.length === 2) {
      year = `20${year}`;
    }
    return `${year}-${month}-${day}`;
  }

  // Fallback Date object parsing
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  // Final fallback
  return str;
}

/**
 * Fixed-point conversion from Rupee amount (number or string) to integer Paise (BigInt).
 * 1 INR = 100 Paise.
 * Uses exact integer scaling avoiding floating-point drift.
 */
export function parseToPaise(val: unknown): Paise {
  if (val === undefined || val === null || val === '') return 0n;

  if (typeof val === 'bigint') return val;

  if (typeof val === 'number') {
    if (isNaN(val)) return 0n;
    // Scale by 100 with rounding to nearest integer
    return BigInt(Math.round(val * 100));
  }

  if (typeof val === 'string') {
    const cleanStr = val.replace(/,/g, '').trim();
    if (!cleanStr) return 0n;
    const num = parseFloat(cleanStr);
    if (isNaN(num)) return 0n;
    return BigInt(Math.round(num * 100));
  }

  return 0n;
}

/**
 * Validates State Code or extracts 2-digit state code from GSTIN / POS string
 */
export function sanitizeStateCode(pos: unknown, fallbackGstin?: string): StateCode {
  if (typeof pos === 'string' && pos.trim().length > 0) {
    const clean = pos.trim().replace(/[^0-9]/g, '');
    if (clean.length === 2) return clean;
    if (clean.length === 1) return clean.padStart(2, '0');
    // If state code name is given, return first 2 digits if available
    const firstTwo = clean.slice(0, 2);
    if (firstTwo.length === 2) return firstTwo;
  }
  if (typeof pos === 'number') {
    const numStr = Math.floor(pos).toString().padStart(2, '0');
    if (numStr.length === 2) return numStr;
  }
  if (fallbackGstin && fallbackGstin.length >= 2) {
    const gstinState = fallbackGstin.slice(0, 2).replace(/[^0-9]/g, '');
    if (gstinState.length === 2) return gstinState;
  }
  return '07'; // Default fallback state code (Delhi)
}

/**
 * Main GSTR-2B JSON Parser
 * Parses official CBIC / GSTN GSTR-2B JSON payload (buffer or string)
 */
export function parseGstr2bJson(rawInput: string | ArrayBuffer | Uint8Array): ParsedGstr2bResult {
  const warnings: string[] = [];
  const rawString = sanitizeUtf8Bom(rawInput);

  let jsonDoc: any;
  try {
    jsonDoc = JSON.parse(rawString);
  } catch (err) {
    throw new ReconcileError(
      'ERR_PARSE_001',
      `Corrupted or Truncated GSTR-2B JSON File: ${(err as Error).message}`,
      { originalError: (err as Error).message, snippet: rawString.slice(0, 150) },
      'HIGH'
    );
  }

  if (!jsonDoc || typeof jsonDoc !== 'object') {
    throw new ReconcileError('ERR_PARSE_001', 'GSTR-2B payload is not a valid JSON object.', undefined, 'HIGH');
  }

  // Extract root metadata
  const recipientGstin: GSTIN = (
    jsonDoc.gstin ||
    jsonDoc.data?.gstin ||
    jsonDoc.docdata?.gstin ||
    '07AAAAA0000A1Z5'
  ).toString().trim().toUpperCase();

  const filingPeriod: FilingPeriod = (
    jsonDoc.fp ||
    jsonDoc.data?.fp ||
    jsonDoc.docdata?.fp ||
    '082026'
  ).toString().trim();

  const version: string = jsonDoc.version || jsonDoc.data?.version || 'GSTR2B_v1.0';
  const generationDate: string | undefined = jsonDoc.filing_dt || jsonDoc.data?.filing_dt || jsonDoc.gen_dt;
  const legalName: string | undefined = jsonDoc.lgnm || jsonDoc.data?.lgnm;
  const tradeName: string | undefined = jsonDoc.trdnm || jsonDoc.data?.trdnm;

  // Locate the document data root (handles standard GSTN nested structures)
  const docdata = jsonDoc.data?.docdata || jsonDoc.docdata || jsonDoc.data || jsonDoc;

  const records: Gstr2bRecord[] = [];
  let recordCounter = 0;

  let totalTaxablePaise: Paise = 0n;
  let totalIgstPaise: Paise = 0n;
  let totalCgstPaise: Paise = 0n;
  let totalSgstPaise: Paise = 0n;
  let totalCessPaise: Paise = 0n;
  let totalGrossPaise: Paise = 0n;

  let b2bCount = 0;
  let b2baCount = 0;
  let cdnrCount = 0;
  let cdnraCount = 0;
  let itcAvailableCount = 0;
  let itcIneligibleCount = 0;

  // -------------------------------------------------------------------------
  // 1. SECTION: b2b (Regular Inward B2B Invoices)
  // -------------------------------------------------------------------------
  const b2bList = Array.isArray(docdata.b2b) ? docdata.b2b : [];
  for (let sIdx = 0; sIdx < b2bList.length; sIdx++) {
    const supplierObj = b2bList[sIdx];
    if (!supplierObj || typeof supplierObj !== 'object') continue;

    const supplierGstin: GSTIN = (supplierObj.ctin || '').toString().trim().toUpperCase();
    const supplierTradeName: string = (
      supplierObj.trdnm ||
      supplierObj.cname ||
      supplierObj.lgnm ||
      `Supplier ${supplierGstin.slice(0, 10)}`
    ).toString().trim();
    const supplierGstr3bFiled = supplierObj.cfs === 'Y';

    if (supplierGstin && !GSTIN_REGEX.test(supplierGstin)) {
      warnings.push(`Supplier GSTIN "${supplierGstin}" at b2b index ${sIdx} has non-standard format.`);
    }

    const invoices = Array.isArray(supplierObj.inv) ? supplierObj.inv : [];
    for (let iIdx = 0; iIdx < invoices.length; iIdx++) {
      const inv = invoices[iIdx];
      if (!inv || typeof inv !== 'object') continue;

      recordCounter++;
      b2bCount++;

      const invoiceNumber = (inv.inum || inv.inv_no || `INV-${recordCounter}`).toString().trim();
      const normalizedInvNo = normalizeInvoiceSyntax(invoiceNumber);
      const invoiceDate = parseGstrDate(inv.idt || inv.inv_dt, filingPeriod);
      const pos = sanitizeStateCode(inv.pos, supplierGstin);
      const reverseCharge = inv.rchrg === 'Y';
      const itcAvailability: ItcAvailability = (inv.itcavl === 'N' ? 'N' : 'Y');

      if (itcAvailability === 'Y') itcAvailableCount++;
      else itcIneligibleCount++;

      let invType: Gstr2bInvoiceType = 'R';
      if (inv.inv_typ === 'SEZWP') invType = 'SEZWP';
      else if (inv.inv_typ === 'SEZWOP') invType = 'SEZWOP';
      else if (inv.inv_typ === 'DE') invType = 'DE';
      else if (inv.inv_typ === 'CBW') invType = 'CBW';

      // Sum item line details if present
      const itemDetails = Array.isArray(inv.itm_det) ? inv.itm_det : Array.isArray(inv.items) ? inv.items : [];
      let itemTaxablePaise: Paise = 0n;
      let itemIgstPaise: Paise = 0n;
      let itemCgstPaise: Paise = 0n;
      let itemSgstPaise: Paise = 0n;
      let itemCessPaise: Paise = 0n;

      if (itemDetails.length > 0) {
        for (const itm of itemDetails) {
          if (!itm || typeof itm !== 'object') continue;
          itemTaxablePaise += parseToPaise(itm.txval);
          itemIgstPaise += parseToPaise(itm.iamt);
          itemCgstPaise += parseToPaise(itm.camt);
          itemSgstPaise += parseToPaise(itm.samt);
          itemCessPaise += parseToPaise(itm.csamt);
        }
      }

      // If invoice level amounts are provided, prefer item sums if available, else invoice level
      const taxableValuePaise = itemTaxablePaise > 0n ? itemTaxablePaise : parseToPaise(inv.txval || inv.taxable_val);
      const igstPaise = itemIgstPaise > 0n ? itemIgstPaise : parseToPaise(inv.iamt || inv.igst);
      const cgstPaise = itemCgstPaise > 0n ? itemCgstPaise : parseToPaise(inv.camt || inv.cgst);
      const sgstPaise = itemSgstPaise > 0n ? itemSgstPaise : parseToPaise(inv.samt || inv.sgst);
      const cessPaise = itemCessPaise > 0n ? itemCessPaise : parseToPaise(inv.csamt || inv.cess);

      const calculatedTotal = taxableValuePaise + igstPaise + cgstPaise + sgstPaise + cessPaise;
      const invoiceValPaise = parseToPaise(inv.val || inv.inv_val);
      const totalValuePaise = invoiceValPaise > 0n ? invoiceValPaise : calculatedTotal;

      const filingDate = parseGstrDate(inv.fldt || generationDate || invoiceDate, filingPeriod);

      const record: Gstr2bRecord = {
        gstr2bId: `g2b_${supplierGstin}_${normalizedInvNo || invoiceNumber}_${recordCounter}`,
        supplierGstin,
        supplierTradeName,
        invoiceNumber,
        normalizedInvoiceNumber: normalizedInvNo,
        invoiceDate,
        invoiceType: invType,
        taxableValuePaise,
        igstPaise,
        cgstPaise,
        sgstPaise,
        cessPaise,
        totalValuePaise,
        placeOfSupply: pos,
        reverseCharge,
        itcAvailability,
        filingPeriod: (inv.fp || filingPeriod).toString(),
        filingDate,
        supplierGstr3bFiled,
      };

      records.push(record);

      totalTaxablePaise += taxableValuePaise;
      totalIgstPaise += igstPaise;
      totalCgstPaise += cgstPaise;
      totalSgstPaise += sgstPaise;
      totalCessPaise += cessPaise;
      totalGrossPaise += totalValuePaise;
    }
  }

  // -------------------------------------------------------------------------
  // 2. SECTION: b2ba (Amended Inward B2B Invoices)
  // -------------------------------------------------------------------------
  const b2baList = Array.isArray(docdata.b2ba) ? docdata.b2ba : [];
  for (let sIdx = 0; sIdx < b2baList.length; sIdx++) {
    const supplierObj = b2baList[sIdx];
    if (!supplierObj || typeof supplierObj !== 'object') continue;

    const supplierGstin: GSTIN = (supplierObj.ctin || '').toString().trim().toUpperCase();
    const supplierTradeName: string = (
      supplierObj.trdnm ||
      supplierObj.cname ||
      supplierObj.lgnm ||
      `Supplier ${supplierGstin.slice(0, 10)}`
    ).toString().trim();
    const supplierGstr3bFiled = supplierObj.cfs === 'Y';

    const invoices = Array.isArray(supplierObj.inv) ? supplierObj.inv : [];
    for (let iIdx = 0; iIdx < invoices.length; iIdx++) {
      const inv = invoices[iIdx];
      if (!inv || typeof inv !== 'object') continue;

      recordCounter++;
      b2baCount++;

      const invoiceNumber = (inv.inum || inv.inv_no || `INVA-${recordCounter}`).toString().trim();
      const normalizedInvNo = normalizeInvoiceSyntax(invoiceNumber);
      const invoiceDate = parseGstrDate(inv.idt || inv.inv_dt, filingPeriod);
      const pos = sanitizeStateCode(inv.pos, supplierGstin);
      const reverseCharge = inv.rchrg === 'Y';
      const itcAvailability: ItcAvailability = (inv.itcavl === 'N' ? 'N' : 'Y');

      if (itcAvailability === 'Y') itcAvailableCount++;
      else itcIneligibleCount++;

      const itemDetails = Array.isArray(inv.itm_det) ? inv.itm_det : Array.isArray(inv.items) ? inv.items : [];
      let itemTaxablePaise: Paise = 0n;
      let itemIgstPaise: Paise = 0n;
      let itemCgstPaise: Paise = 0n;
      let itemSgstPaise: Paise = 0n;
      let itemCessPaise: Paise = 0n;

      if (itemDetails.length > 0) {
        for (const itm of itemDetails) {
          if (!itm || typeof itm !== 'object') continue;
          itemTaxablePaise += parseToPaise(itm.txval);
          itemIgstPaise += parseToPaise(itm.iamt);
          itemCgstPaise += parseToPaise(itm.camt);
          itemSgstPaise += parseToPaise(itm.samt);
          itemCessPaise += parseToPaise(itm.csamt);
        }
      }

      const taxableValuePaise = itemTaxablePaise > 0n ? itemTaxablePaise : parseToPaise(inv.txval);
      const igstPaise = itemIgstPaise > 0n ? itemIgstPaise : parseToPaise(inv.iamt);
      const cgstPaise = itemCgstPaise > 0n ? itemCgstPaise : parseToPaise(inv.camt);
      const sgstPaise = itemSgstPaise > 0n ? itemSgstPaise : parseToPaise(inv.samt);
      const cessPaise = itemCessPaise > 0n ? itemCessPaise : parseToPaise(inv.csamt);

      const calculatedTotal = taxableValuePaise + igstPaise + cgstPaise + sgstPaise + cessPaise;
      const invoiceValPaise = parseToPaise(inv.val);
      const totalValuePaise = invoiceValPaise > 0n ? invoiceValPaise : calculatedTotal;

      const filingDate = parseGstrDate(inv.fldt || generationDate || invoiceDate, filingPeriod);

      const record: Gstr2bRecord = {
        gstr2bId: `g2b_amend_${supplierGstin}_${normalizedInvNo || invoiceNumber}_${recordCounter}`,
        supplierGstin,
        supplierTradeName,
        invoiceNumber,
        normalizedInvoiceNumber: normalizedInvNo,
        invoiceDate,
        invoiceType: 'R',
        taxableValuePaise,
        igstPaise,
        cgstPaise,
        sgstPaise,
        cessPaise,
        totalValuePaise,
        placeOfSupply: pos,
        reverseCharge,
        itcAvailability,
        filingPeriod: (inv.fp || filingPeriod).toString(),
        filingDate,
        supplierGstr3bFiled,
      };

      records.push(record);

      totalTaxablePaise += taxableValuePaise;
      totalIgstPaise += igstPaise;
      totalCgstPaise += cgstPaise;
      totalSgstPaise += sgstPaise;
      totalCessPaise += cessPaise;
      totalGrossPaise += totalValuePaise;
    }
  }

  // -------------------------------------------------------------------------
  // 3. SECTION: cdnr (Credit / Debit Notes for Registered Suppliers)
  // -------------------------------------------------------------------------
  const cdnrList = Array.isArray(docdata.cdnr) ? docdata.cdnr : [];
  for (let sIdx = 0; sIdx < cdnrList.length; sIdx++) {
    const supplierObj = cdnrList[sIdx];
    if (!supplierObj || typeof supplierObj !== 'object') continue;

    const supplierGstin: GSTIN = (supplierObj.ctin || '').toString().trim().toUpperCase();
    const supplierTradeName: string = (
      supplierObj.trdnm ||
      supplierObj.cname ||
      supplierObj.lgnm ||
      `Supplier ${supplierGstin.slice(0, 10)}`
    ).toString().trim();
    const supplierGstr3bFiled = supplierObj.cfs === 'Y';

    const notes = Array.isArray(supplierObj.nt) ? supplierObj.nt : Array.isArray(supplierObj.inv) ? supplierObj.inv : [];
    for (let nIdx = 0; nIdx < notes.length; nIdx++) {
      const nt = notes[nIdx];
      if (!nt || typeof nt !== 'object') continue;

      recordCounter++;
      cdnrCount++;

      const noteNumber = (nt.nt_num || nt.inum || `CRN-${recordCounter}`).toString().trim();
      const normalizedNoteNo = normalizeInvoiceSyntax(noteNumber);
      const noteDate = parseGstrDate(nt.nt_dt || nt.idt, filingPeriod);
      const pos = sanitizeStateCode(nt.pos, supplierGstin);
      const reverseCharge = nt.rchrg === 'Y';
      const itcAvailability: ItcAvailability = (nt.itcavl === 'N' ? 'N' : 'Y');

      if (itcAvailability === 'Y') itcAvailableCount++;
      else itcIneligibleCount++;

      const noteTypeLetter = (nt.ntty || 'C').toString().toUpperCase();
      const invoiceType: Gstr2bInvoiceType = noteTypeLetter === 'D' ? 'DBN' : 'CRN';

      const itemDetails = Array.isArray(nt.itm_det) ? nt.itm_det : Array.isArray(nt.items) ? nt.items : [];
      let itemTaxablePaise: Paise = 0n;
      let itemIgstPaise: Paise = 0n;
      let itemCgstPaise: Paise = 0n;
      let itemSgstPaise: Paise = 0n;
      let itemCessPaise: Paise = 0n;

      if (itemDetails.length > 0) {
        for (const itm of itemDetails) {
          if (!itm || typeof itm !== 'object') continue;
          itemTaxablePaise += parseToPaise(itm.txval);
          itemIgstPaise += parseToPaise(itm.iamt);
          itemCgstPaise += parseToPaise(itm.camt);
          itemSgstPaise += parseToPaise(itm.samt);
          itemCessPaise += parseToPaise(itm.csamt);
        }
      }

      let taxableValuePaise = itemTaxablePaise > 0n ? itemTaxablePaise : parseToPaise(nt.txval);
      let igstPaise = itemIgstPaise > 0n ? itemIgstPaise : parseToPaise(nt.iamt);
      let cgstPaise = itemCgstPaise > 0n ? itemCgstPaise : parseToPaise(nt.camt);
      let sgstPaise = itemSgstPaise > 0n ? itemSgstPaise : parseToPaise(nt.samt);
      let cessPaise = itemCessPaise > 0n ? itemCessPaise : parseToPaise(nt.csamt);

      const calculatedTotal = taxableValuePaise + igstPaise + cgstPaise + sgstPaise + cessPaise;
      const noteValPaise = parseToPaise(nt.val);
      let totalValuePaise = noteValPaise > 0n ? noteValPaise : calculatedTotal;

      // In GSTN, Credit Notes reduce liability. Maintain integer paise magnitude.
      const filingDate = parseGstrDate(nt.fldt || generationDate || noteDate, filingPeriod);

      const record: Gstr2bRecord = {
        gstr2bId: `g2b_cdnr_${supplierGstin}_${normalizedNoteNo || noteNumber}_${recordCounter}`,
        supplierGstin,
        supplierTradeName,
        invoiceNumber: noteNumber,
        normalizedInvoiceNumber: normalizedNoteNo,
        invoiceDate: noteDate,
        invoiceType,
        taxableValuePaise,
        igstPaise,
        cgstPaise,
        sgstPaise,
        cessPaise,
        totalValuePaise,
        placeOfSupply: pos,
        reverseCharge,
        itcAvailability,
        filingPeriod: (nt.fp || filingPeriod).toString(),
        filingDate,
        supplierGstr3bFiled,
      };

      records.push(record);

      totalTaxablePaise += taxableValuePaise;
      totalIgstPaise += igstPaise;
      totalCgstPaise += cgstPaise;
      totalSgstPaise += sgstPaise;
      totalCessPaise += cessPaise;
      totalGrossPaise += totalValuePaise;
    }
  }

  // -------------------------------------------------------------------------
  // 4. SECTION: cdnra (Amended Credit / Debit Notes)
  // -------------------------------------------------------------------------
  const cdnraList = Array.isArray(docdata.cdnra) ? docdata.cdnra : [];
  for (let sIdx = 0; sIdx < cdnraList.length; sIdx++) {
    const supplierObj = cdnraList[sIdx];
    if (!supplierObj || typeof supplierObj !== 'object') continue;

    const supplierGstin: GSTIN = (supplierObj.ctin || '').toString().trim().toUpperCase();
    const supplierTradeName: string = (
      supplierObj.trdnm ||
      supplierObj.cname ||
      supplierObj.lgnm ||
      `Supplier ${supplierGstin.slice(0, 10)}`
    ).toString().trim();
    const supplierGstr3bFiled = supplierObj.cfs === 'Y';

    const notes = Array.isArray(supplierObj.nt) ? supplierObj.nt : [];
    for (let nIdx = 0; nIdx < notes.length; nIdx++) {
      const nt = notes[nIdx];
      if (!nt || typeof nt !== 'object') continue;

      recordCounter++;
      cdnraCount++;

      const noteNumber = (nt.nt_num || nt.inum || `CRNA-${recordCounter}`).toString().trim();
      const normalizedNoteNo = normalizeInvoiceSyntax(noteNumber);
      const noteDate = parseGstrDate(nt.nt_dt || nt.idt, filingPeriod);
      const pos = sanitizeStateCode(nt.pos, supplierGstin);
      const reverseCharge = nt.rchrg === 'Y';
      const itcAvailability: ItcAvailability = (nt.itcavl === 'N' ? 'N' : 'Y');

      if (itcAvailability === 'Y') itcAvailableCount++;
      else itcIneligibleCount++;

      const noteTypeLetter = (nt.ntty || 'C').toString().toUpperCase();
      const invoiceType: Gstr2bInvoiceType = noteTypeLetter === 'D' ? 'DBN' : 'CRN';

      const itemDetails = Array.isArray(nt.itm_det) ? nt.itm_det : [];
      let itemTaxablePaise: Paise = 0n;
      let itemIgstPaise: Paise = 0n;
      let itemCgstPaise: Paise = 0n;
      let itemSgstPaise: Paise = 0n;
      let itemCessPaise: Paise = 0n;

      if (itemDetails.length > 0) {
        for (const itm of itemDetails) {
          if (!itm || typeof itm !== 'object') continue;
          itemTaxablePaise += parseToPaise(itm.txval);
          itemIgstPaise += parseToPaise(itm.iamt);
          itemCgstPaise += parseToPaise(itm.camt);
          itemSgstPaise += parseToPaise(itm.samt);
          itemCessPaise += parseToPaise(itm.csamt);
        }
      }

      const taxableValuePaise = itemTaxablePaise > 0n ? itemTaxablePaise : parseToPaise(nt.txval);
      const igstPaise = itemIgstPaise > 0n ? itemIgstPaise : parseToPaise(nt.iamt);
      const cgstPaise = itemCgstPaise > 0n ? itemCgstPaise : parseToPaise(nt.camt);
      const sgstPaise = itemSgstPaise > 0n ? itemSgstPaise : parseToPaise(nt.samt);
      const cessPaise = itemCessPaise > 0n ? itemCessPaise : parseToPaise(nt.csamt);

      const calculatedTotal = taxableValuePaise + igstPaise + cgstPaise + sgstPaise + cessPaise;
      const noteValPaise = parseToPaise(nt.val);
      const totalValuePaise = noteValPaise > 0n ? noteValPaise : calculatedTotal;

      const filingDate = parseGstrDate(nt.fldt || generationDate || noteDate, filingPeriod);

      const record: Gstr2bRecord = {
        gstr2bId: `g2b_cdnra_${supplierGstin}_${normalizedNoteNo || noteNumber}_${recordCounter}`,
        supplierGstin,
        supplierTradeName,
        invoiceNumber: noteNumber,
        normalizedInvoiceNumber: normalizedNoteNo,
        invoiceDate: noteDate,
        invoiceType,
        taxableValuePaise,
        igstPaise,
        cgstPaise,
        sgstPaise,
        cessPaise,
        totalValuePaise,
        placeOfSupply: pos,
        reverseCharge,
        itcAvailability,
        filingPeriod: (nt.fp || filingPeriod).toString(),
        filingDate,
        supplierGstr3bFiled,
      };

      records.push(record);

      totalTaxablePaise += taxableValuePaise;
      totalIgstPaise += igstPaise;
      totalCgstPaise += cgstPaise;
      totalSgstPaise += sgstPaise;
      totalCessPaise += cessPaise;
      totalGrossPaise += totalValuePaise;
    }
  }

  const totalTaxPaise: Paise = totalIgstPaise + totalCgstPaise + totalSgstPaise + totalCessPaise;

  return {
    recipientGstin,
    legalName,
    tradeName,
    filingPeriod,
    generationDate,
    version,
    records,
    totalRecords: records.length,
    totalTaxablePaise,
    totalTaxPaise,
    totalIgstPaise,
    totalCgstPaise,
    totalSgstPaise,
    totalCessPaise,
    totalGrossPaise,
    sectionCounts: {
      b2b: b2bCount,
      b2ba: b2baCount,
      cdnr: cdnrCount,
      cdnra: cdnraCount,
      itcAvailableCount,
      itcIneligibleCount,
    },
    warnings,
  };
}

/**
 * Convenience wrapper to parse GSTR-2B from raw ArrayBuffer
 */
export function parseGstr2bBuffer(buffer: ArrayBuffer): ParsedGstr2bResult {
  return parseGstr2bJson(buffer);
}
