/**
 * @file lib/memory-buffer.ts
 * @summary Fixed-Point Integer Paise Memory Allocator & BigInt64Array Vector Operations
 * @version 2.4.0
 * @author Senior Data & Memory Systems Architect (Pod 1 - Shivam Kansal lead)
 * 
 * Standards Compliance:
 * - Master Engineering Skill (Stage 4C: ADR-003, ADR-001; Stage 5: Task 002)
 * - Hard Constraints: CON-PERF-03 (0.00% Float Drift), GQM-06 (Exact Integer Balance), Section 170 CGST Act
 * - Memory Layout: 48-byte linear contiguous 64-bit aligned financial tuple stride
 */

import {
  Paise,
  FinancialBufferOffset,
  FINANCIAL_BUFFER_STRIDE,
  FinancialTuple,
  InwardInvoice,
  Gstr2bRecord,
  ReconcileError,
} from './types';

// ============================================================================
// 1. DETERMINISTIC FIXED-POINT CURRENCY PARSER & FORMATTERS
// ============================================================================

/**
 * Converts any currency representation (string, number, BigInt, accounting notation)
 * into exact statutory integer Paise (1 INR = 100 Paise).
 * 
 * Guarantees 0.00% floating-point drift by avoiding IEEE-754 binary arithmetic on floats.
 * Handles Indian commas (1,45,200.50), currency symbols (₹, Rs, $), negative accounting
 * brackets `(100.50)`, trailing `CR`/`DR`, and arbitrary whitespace.
 * 
 * @param value - Raw currency value to parse
 * @returns Fixed-point integer in Paise (BigInt)
 */
export function toPaise(value: string | number | bigint | null | undefined): Paise {
  if (value === null || value === undefined) {
    return 0n;
  }

  if (typeof value === 'bigint') {
    return value;
  }

  let str = String(value).trim();
  if (str === '' || str === '-' || str === '.') {
    return 0n;
  }

  // Detect negative accounting notation: e.g. "(1,234.50)" or "-1,234.50" or "1,234.50 CR"
  let isNegative = false;
  if (str.startsWith('(') && str.endsWith(')')) {
    isNegative = true;
    str = str.slice(1, -1).trim();
  } else if (str.startsWith('-')) {
    isNegative = true;
    str = str.slice(1).trim();
  } else if (/[\s\-_]CR$/i.test(str)) {
    isNegative = true;
    str = str.replace(/[\s\-_]CR$/i, '').trim();
  } else if (/[\s\-_]DR$/i.test(str)) {
    str = str.replace(/[\s\-_]DR$/i, '').trim();
  }

  // Strip currency symbols (₹, Rs, Rs., $, €, etc.), commas, and whitespace
  str = str.replace(/[\u20B9\$\u20AC\u00A3]|Rs\.?|INR|,|\s/gi, '');

  if (str === '' || str === '.') {
    return 0n;
  }

  // Split into whole integer and decimal parts
  const parts = str.split('.');
  const integerPartRaw = parts[0] ? parts[0].replace(/[^0-9]/g, '') : '';
  const decimalPartRaw = parts[1] ? parts[1].replace(/[^0-9]/g, '') : '';

  if (integerPartRaw === '' && decimalPartRaw === '') {
    return 0n;
  }

  const integerBigInt = integerPartRaw === '' ? 0n : BigInt(integerPartRaw);

  // Normalize decimal part to exactly 2 digits (Paise)
  // e.g. "" -> "00", "5" -> "50", "75" -> "75", "758" -> "75" (sub-paise truncated or rounded)
  let paddedDecimal = (decimalPartRaw + '00').slice(0, 2);
  let decimalBigInt = BigInt(paddedDecimal);

  // Optional 3rd decimal rounding check (e.g. .758 -> round up to .76)
  if (decimalPartRaw.length >= 3) {
    const thirdDigit = parseInt(decimalPartRaw.charAt(2), 10);
    if (!isNaN(thirdDigit) && thirdDigit >= 5) {
      decimalBigInt += 1n;
    }
  }

  const totalPaise = integerBigInt * 100n + decimalBigInt;
  return isNegative ? -totalPaise : totalPaise;
}

/**
 * Converts integer Paise into a standard floating-point Rupee number for JSON/Excel exports.
 * 
 * @param paise - Integer amount in Paise
 * @returns Rupee value with 2 decimal precision
 */
export function paiseToRupees(paise: Paise): number {
  return Number(paise) / 100;
}

/**
 * Formats integer Paise to statutory Indian Currency String notation (e.g. ₹ 1,45,200.50).
 * Implements the official Indian lakh/crore numbering system grouping (3 digits lowest, 2 digits thereafter).
 * 
 * @param paise - Integer amount in Paise
 * @param includeSymbol - Whether to prefix with Indian Rupee symbol '₹'
 * @returns Formatted currency string
 */
export function formatINR(paise: Paise, includeSymbol: boolean = true): string {
  const isNegative = paise < 0n;
  const absPaise = isNegative ? -paise : paise;

  const wholeRupees = absPaise / 100n;
  const remainderPaise = absPaise % 100n;

  const paiseStr = remainderPaise.toString().padStart(2, '0');
  const rupeeStr = wholeRupees.toString();

  let formattedRupees = '';
  if (rupeeStr.length <= 3) {
    formattedRupees = rupeeStr;
  } else {
    // Last 3 digits (hundreds)
    const lastThree = rupeeStr.slice(-3);
    const remaining = rupeeStr.slice(0, -3);
    
    // Group remaining into pairs of 2 (thousands, lakhs, crores)
    const chunks: string[] = [];
    let rem = remaining;
    while (rem.length > 0) {
      if (rem.length <= 2) {
        chunks.unshift(rem);
        break;
      } else {
        chunks.unshift(rem.slice(-2));
        rem = rem.slice(0, -2);
      }
    }
    formattedRupees = chunks.join(',') + ',' + lastThree;
  }

  const sign = isNegative ? '-' : '';
  const symbol = includeSymbol ? '₹ ' : '';
  return `${sign}${symbol}${formattedRupees}.${paiseStr}`;
}

/**
 * Converts integer Paise into statutory Indian English words for formal DRC-01C legal replies and notices.
 * 
 * @example
 * formatPaiseToWords(14520050n)
 * // "Rupees One Lakh Forty-Five Thousand Two Hundred and Fifty Paise Only"
 */
export function formatPaiseToWords(paise: Paise): string {
  if (paise === 0n) {
    return 'Rupees Zero Only';
  }

  const isNegative = paise < 0n;
  const absPaise = isNegative ? -paise : paise;
  const wholeRupees = absPaise / 100n;
  const remainderPaise = Number(absPaise % 100n);

  const units = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];

  const tens = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ];

  function convertTwoDigits(n: number): string {
    if (n === 0) return '';
    if (n < 20) return units[n];
    const t = Math.floor(n / 10);
    const u = n % 10;
    return u === 0 ? tens[t] : `${tens[t]}-${units[u]}`;
  }

  function convertThreeDigits(n: number): string {
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    let res = '';
    if (hundred > 0) {
      res += `${units[hundred]} Hundred`;
      if (rest > 0) res += ' ';
    }
    if (rest > 0) {
      res += convertTwoDigits(rest);
    }
    return res;
  }

  let num = Number(wholeRupees);
  if (wholeRupees > BigInt(Number.MAX_SAFE_INTEGER)) {
    return `Rupees ${formatINR(paise, false)} Only`;
  }

  let words = '';

  const crore = Math.floor(num / 10000000);
  num %= 10000000;

  const lakh = Math.floor(num / 100000);
  num %= 100000;

  const thousand = Math.floor(num / 1000);
  num %= 1000;

  const hundredAndBelow = num;

  if (crore > 0) {
    words += `${convertThreeDigits(crore)} Crore `;
  }
  if (lakh > 0) {
    words += `${convertTwoDigits(lakh)} Lakh `;
  }
  if (thousand > 0) {
    words += `${convertTwoDigits(thousand)} Thousand `;
  }
  if (hundredAndBelow > 0) {
    words += `${convertThreeDigits(hundredAndBelow)} `;
  }

  words = words.trim();
  let result = `Rupees ${words}`;

  if (remainderPaise > 0) {
    result += ` and ${convertTwoDigits(remainderPaise)} Paise`;
  }

  result += ' Only';
  return isNegative ? `Negative ${result}` : result;
}

// ============================================================================
// 2. BIGINT64ARRAY VECTOR MEMORY ALLOCATOR & STRIDE OPERATORS
// ============================================================================

/**
 * Verifies that the requested index and stride fall within the buffer boundaries.
 * Throws ReconcileError('ERR_MEM_003') if boundary is violated.
 */
export function assertBufferOffset(index: number, stride: number, length: number): void {
  if (index < 0 || (index * stride + stride) > length) {
    throw new ReconcileError(
      'ERR_MEM_003',
      `Financial buffer stride boundary overflow: Row index ${index} with stride ${stride} exceeds buffer length ${length}`,
      { index, stride, length }
    );
  }
}

/**
 * Allocates a contiguous 64-bit integer memory buffer for recordCount invoices.
 * Each invoice occupies a 48-byte segment (6 BigInt64 elements x 8 bytes).
 * 
 * @param recordCount - Number of invoice records to allocate for
 * @returns Initialized BigInt64Array memory buffer
 */
export function allocateFinancialBuffer(recordCount: number): BigInt64Array {
  if (recordCount < 0) {
    throw new ReconcileError('ERR_MEM_002', `Cannot allocate negative buffer length: ${recordCount}`);
  }
  if (recordCount > 10_000_000) {
    throw new ReconcileError('ERR_MEM_002', `Buffer capacity exceeds 10M record ceiling: ${recordCount}`);
  }
  return new BigInt64Array(recordCount * FINANCIAL_BUFFER_STRIDE);
}

/**
 * Vectorizes an array of InwardPurchase invoices into a contiguous BigInt64Array buffer.
 * 
 * Memory Layout per Row:
 * - Offset 0: Taxable Value in Paise (8 Bytes)
 * - Offset 1: IGST Amount in Paise (8 Bytes)
 * - Offset 2: CGST Amount in Paise (8 Bytes)
 * - Offset 3: SGST Amount in Paise (8 Bytes)
 * - Offset 4: Cess Amount in Paise (8 Bytes)
 * - Offset 5: Total Invoice Value in Paise (8 Bytes)
 */
export function packInvoicesToBuffer(invoices: InwardInvoice[]): BigInt64Array {
  const count = invoices.length;
  const buffer = allocateFinancialBuffer(count);

  for (let i = 0; i < count; i++) {
    const inv = invoices[i];
    const base = i * FINANCIAL_BUFFER_STRIDE;
    buffer[base + FinancialBufferOffset.TAXABLE_VAL_PAISE] = inv.taxableValuePaise;
    buffer[base + FinancialBufferOffset.IGST_PAISE] = inv.igstPaise;
    buffer[base + FinancialBufferOffset.CGST_PAISE] = inv.cgstPaise;
    buffer[base + FinancialBufferOffset.SGST_PAISE] = inv.sgstPaise;
    buffer[base + FinancialBufferOffset.CESS_PAISE] = inv.cessPaise;
    buffer[base + FinancialBufferOffset.TOTAL_VAL_PAISE] = inv.totalValuePaise;
  }

  return buffer;
}

/**
 * Vectorizes an array of Gstr2bRecord portal records into a contiguous BigInt64Array buffer.
 */
export function packGstr2bToBuffer(records: Gstr2bRecord[]): BigInt64Array {
  const count = records.length;
  const buffer = allocateFinancialBuffer(count);

  for (let i = 0; i < count; i++) {
    const rec = records[i];
    const base = i * FINANCIAL_BUFFER_STRIDE;
    buffer[base + FinancialBufferOffset.TAXABLE_VAL_PAISE] = rec.taxableValuePaise;
    buffer[base + FinancialBufferOffset.IGST_PAISE] = rec.igstPaise;
    buffer[base + FinancialBufferOffset.CGST_PAISE] = rec.cgstPaise;
    buffer[base + FinancialBufferOffset.SGST_PAISE] = rec.sgstPaise;
    buffer[base + FinancialBufferOffset.CESS_PAISE] = rec.cessPaise;
    buffer[base + FinancialBufferOffset.TOTAL_VAL_PAISE] = rec.totalValuePaise;
  }

  return buffer;
}

/**
 * Extracts the 6-field financial tuple from a contiguous BigInt64Array at a specified row index.
 */
export function unpackFinancialTuple(buffer: BigInt64Array, rowIndex: number): FinancialTuple {
  assertBufferOffset(rowIndex, FINANCIAL_BUFFER_STRIDE, buffer.length);
  const base = rowIndex * FINANCIAL_BUFFER_STRIDE;

  return {
    taxableValuePaise: buffer[base + FinancialBufferOffset.TAXABLE_VAL_PAISE],
    igstPaise: buffer[base + FinancialBufferOffset.IGST_PAISE],
    cgstPaise: buffer[base + FinancialBufferOffset.CGST_PAISE],
    sgstPaise: buffer[base + FinancialBufferOffset.SGST_PAISE],
    cessPaise: buffer[base + FinancialBufferOffset.CESS_PAISE],
    totalValuePaise: buffer[base + FinancialBufferOffset.TOTAL_VAL_PAISE],
  };
}

/**
 * Writes a 6-field financial tuple into the BigInt64Array buffer at a specified row index.
 */
export function writeFinancialTuple(
  buffer: BigInt64Array,
  rowIndex: number,
  tuple: FinancialTuple
): void {
  assertBufferOffset(rowIndex, FINANCIAL_BUFFER_STRIDE, buffer.length);
  const base = rowIndex * FINANCIAL_BUFFER_STRIDE;

  buffer[base + FinancialBufferOffset.TAXABLE_VAL_PAISE] = tuple.taxableValuePaise;
  buffer[base + FinancialBufferOffset.IGST_PAISE] = tuple.igstPaise;
  buffer[base + FinancialBufferOffset.CGST_PAISE] = tuple.cgstPaise;
  buffer[base + FinancialBufferOffset.SGST_PAISE] = tuple.sgstPaise;
  buffer[base + FinancialBufferOffset.CESS_PAISE] = tuple.cessPaise;
  buffer[base + FinancialBufferOffset.TOTAL_VAL_PAISE] = tuple.totalValuePaise;
}

/**
 * High-speed ALU arithmetic aggregation across all rows in a packed buffer.
 * Performs direct 64-bit integer addition with 0 heap object allocations.
 */
export function computeBufferAggregate(buffer: BigInt64Array, recordCount: number): FinancialTuple {
  let sumTaxable = 0n;
  let sumIgst = 0n;
  let sumCgst = 0n;
  let sumSgst = 0n;
  let sumCess = 0n;
  let sumTotal = 0n;

  const totalLen = Math.min(buffer.length, recordCount * FINANCIAL_BUFFER_STRIDE);

  for (let base = 0; base < totalLen; base += FINANCIAL_BUFFER_STRIDE) {
    sumTaxable += buffer[base + FinancialBufferOffset.TAXABLE_VAL_PAISE];
    sumIgst += buffer[base + FinancialBufferOffset.IGST_PAISE];
    sumCgst += buffer[base + FinancialBufferOffset.CGST_PAISE];
    sumSgst += buffer[base + FinancialBufferOffset.SGST_PAISE];
    sumCess += buffer[base + FinancialBufferOffset.CESS_PAISE];
    sumTotal += buffer[base + FinancialBufferOffset.TOTAL_VAL_PAISE];
  }

  return {
    taxableValuePaise: sumTaxable,
    igstPaise: sumIgst,
    cgstPaise: sumCgst,
    sgstPaise: sumSgst,
    cessPaise: sumCess,
    totalValuePaise: sumTotal,
  };
}

/**
 * Creates a sub-slice copy of the financial buffer between row indices.
 */
export function sliceFinancialBuffer(
  buffer: BigInt64Array,
  startRow: number,
  endRow: number
): BigInt64Array {
  const startOffset = startRow * FINANCIAL_BUFFER_STRIDE;
  const endOffset = endRow * FINANCIAL_BUFFER_STRIDE;
  return buffer.slice(startOffset, endOffset);
}

/**
 * Fast block copy of rows between two financial buffers.
 */
export function copyFinancialBuffer(
  source: BigInt64Array,
  target: BigInt64Array,
  sourceRow: number,
  targetRow: number,
  rowCount: number
): void {
  const srcStart = sourceRow * FINANCIAL_BUFFER_STRIDE;
  const srcEnd = srcStart + rowCount * FINANCIAL_BUFFER_STRIDE;
  const tgtStart = targetRow * FINANCIAL_BUFFER_STRIDE;

  const slice = source.subarray(srcStart, srcEnd);
  target.set(slice, tgtStart);
}

/**
 * Calculates raw memory consumed in bytes for a given invoice record count.
 */
export function getBufferMemoryBytes(recordCount: number): number {
  return recordCount * FINANCIAL_BUFFER_STRIDE * 8;
}

/**
 * Calculates raw memory consumed in megabytes (MB) for a given invoice record count.
 */
export function getBufferMemoryMB(recordCount: number): number {
  return getBufferMemoryBytes(recordCount) / (1024 * 1024);
}
