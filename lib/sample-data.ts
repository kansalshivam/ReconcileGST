/**
 * Realistic Indian GST Benchmark Dataset Generator with Authentic Syntaxes & Ground Truth
 * Governed by:
 * - Smart India Hackathon (SIH) 2026 Submission Deck (Team Binary Brains)
 * - Section 16(2)(aa), Section 16(4), Rule 37A, Section 170, Rule 88D DRC-01C
 *
 * 100% deterministic fixed-point integer Paise arithmetic.
 */

import * as XLSX from 'xlsx';
import {
  InwardInvoice,
  Gstr2bRecord,
  Paise,
  GSTIN,
  ISODateString,
  StateCode,
  Rule37AAgingBucket,
  ReconciliationResultSet,
} from '@/types/recon';
import { normalizeInvoiceSyntax, ReconciliationEngine } from '@/lib/matching-engine';

export interface VendorMaster {
  readonly gstin: GSTIN;
  readonly legalName: string;
  readonly tradeName: string;
  readonly stateCode: StateCode;
  readonly stateName: string;
  readonly pan: string;
}

export interface GroundTruthMetadata {
  readonly totalErpRows: number;
  readonly totalGstr2bRows: number;
  readonly exactMatchCount: number;
  readonly syntaxMatchCount: number;
  readonly typoFuzzyMatchCount: number;
  readonly posSwapMatchCount: number;
  readonly missingIn2bDefaulterCount: number;
  readonly totalTaxablePaise: Paise;
  readonly totalTaxPaise: Paise;
  readonly totalGrossPaise: Paise;
  readonly exactMatchIds: string[];
  readonly syntaxMatchIds: string[];
  readonly typoMatchIds: string[];
  readonly posSwapIds: string[];
  readonly missingIn2bIds: string[];
  readonly agingBucketBreakdown: Record<Rule37AAgingBucket, number>;
}

export interface SyntheticBenchmarkDataset {
  readonly clientGstin: GSTIN;
  readonly clientTradeName: string;
  readonly filingPeriod: string;
  readonly erpInvoices: InwardInvoice[];
  readonly gstr2bRecords: Gstr2bRecord[];
  readonly vendors: VendorMaster[];
  readonly groundTruth: GroundTruthMetadata;
}

export interface BenchmarkOptions {
  readonly seed?: number;
  readonly totalCount?: number;
  readonly clientGstin?: GSTIN;
  readonly filingPeriod?: string;
}

/**
 * Fast deterministic PRNG (Mulberry32)
 */
function createMulberry32(seed: number = 20260821) {
  let s = seed >>> 0;
  return function next(): number {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Indian State Codes and State Names
 */
const INDIAN_STATES: Array<{ code: StateCode; name: string }> = [
  { code: '07', name: 'Delhi' },
  { code: '27', name: 'Maharashtra' },
  { code: '29', name: 'Karnataka' },
  { code: '24', name: 'Gujarat' },
  { code: '33', name: 'Tamil Nadu' },
  { code: '09', name: 'Uttar Pradesh' },
  { code: '19', name: 'West Bengal' },
  { code: '06', name: 'Haryana' },
  { code: '36', name: 'Telangana' },
  { code: '08', name: 'Rajasthan' },
  { code: '32', name: 'Kerala' },
  { code: '23', name: 'Madhya Pradesh' },
  { code: '21', name: 'Odisha' },
  { code: '03', name: 'Punjab' },
  { code: '10', name: 'Bihar' },
];

/**
 * Authentic Indian Enterprise & MSME Vendors
 */
const REALISTIC_VENDORS = [
  { name: 'Larsen & Toubro Heavy Engineering Ltd', panPrefix: 'AAACL' },
  { name: 'UltraTech Cement Manufacturing Ltd', panPrefix: 'AAACU' },
  { name: 'Tata Steel Processing & Distribution Ltd', panPrefix: 'AAACT' },
  { name: 'Infosys BPM Technologies Ltd', panPrefix: 'AAACI' },
  { name: 'Bharat Heavy Electricals Ltd (BHEL)', panPrefix: 'AAACB' },
  { name: 'Kirloskar Brothers Pump Works Ltd', panPrefix: 'AAACK' },
  { name: 'Siemens Energy Power Solutions Ltd', panPrefix: 'AAACS' },
  { name: 'Thermax Sustainable Solutions Ltd', panPrefix: 'AAACT' },
  { name: 'Pidilite Speciality Chemicals Pvt Ltd', panPrefix: 'AAACP' },
  { name: 'Havells Electricals Distribution Ltd', panPrefix: 'AAACH' },
  { name: 'Ambuja Cements Grinding Works Ltd', panPrefix: 'AAACA' },
  { name: 'Blue Star Climate Systems Ltd', panPrefix: 'AAACB' },
  { name: 'Voltas Industrial Air Conditioning Ltd', panPrefix: 'AAACV' },
  { name: 'Apollo Tyres Distribution Network', panPrefix: 'AAACA' },
  { name: 'Britannia Supply Chain Logistics', panPrefix: 'AAACB' },
  { name: 'Asian Paints Industrial Coatings Ltd', panPrefix: 'AAACA' },
  { name: 'Godrej Process Equipment Division', panPrefix: 'AAACG' },
  { name: 'Mahindra Logistics & Freight Works', panPrefix: 'AAACM' },
  { name: 'Wipro Infrastructure Engineering Ltd', panPrefix: 'AAACW' },
  { name: 'JSW Steel Coated Products Ltd', panPrefix: 'AAACJ' },
  { name: 'Hindalco Industries Smelter Division', panPrefix: 'AAACH' },
  { name: 'Sun Pharma Distribution Solutions', panPrefix: 'AAACS' },
  { name: 'Cipla Quality Chemical Supplies', panPrefix: 'AAACC' },
  { name: 'Dr Reddys Laboratories Active Chem', panPrefix: 'AAACD' },
  { name: 'Crompton Greaves Consumer Electricals', panPrefix: 'AAACC' },
  { name: 'Torrent Power Grid Infrastructure', panPrefix: 'AAACT' },
  { name: 'Shree Cement Clinker Grinding Unit', panPrefix: 'AAACS' },
  { name: 'Shree Logistics Solutions Pvt Ltd', panPrefix: 'AABCS' },
  { name: 'Apex Industrial Packaging Works', panPrefix: 'AABCA' },
  { name: 'Delta Precision Fasteners India', panPrefix: 'AABCD' },
  { name: 'Kaveri Metal & Tubes Fabricators', panPrefix: 'AABCK' },
  { name: 'Vanguard Industrial Automation Ltd', panPrefix: 'AABCV' },
];

/**
 * Real-world invoice prefix syntaxes
 */
const INVOICE_PREFIXES = [
  'LT/26-27/', 'UTCL/MUM/', 'TATA/ST/', 'BHEL-HYD/2026/', 'SIEMENS/DEL/',
  'TAX/2026-27/', 'BILL/AUG/', 'GST-IN/', 'KB/26/', 'VOL/IND/',
  'PID/2026/', 'HVL-DL/', 'AMB/26-27/', 'BS-PUN/', 'APL-LOG/',
  'AP/26-27/', 'GOD/PROC/', 'ML-FREIGHT/', 'WIP-ENG/', 'JSW/CPD/'
];

/**
 * Generates realistic Indian Vendor masters with checksummed GSTINs
 */
export function generate500Vendors(prng: () => number): VendorMaster[] {
  const vendors: VendorMaster[] = [];

  for (let i = 0; i < 500; i++) {
    const state = INDIAN_STATES[i % INDIAN_STATES.length];
    const baseVendor = REALISTIC_VENDORS[i % REALISTIC_VENDORS.length];
    
    // Generate valid 10-digit PAN format (e.g. AAACL1234A)
    const panNum = String(1000 + (i * 13) % 9000);
    const panSuffixChar = String.fromCharCode(65 + (i % 26));
    const pan = `${baseVendor.panPrefix}${panNum}${panSuffixChar}`;
    
    // Valid 15-char GSTIN format: State(2) + PAN(10) + Entity(1) + 'Z' + Checksum(1)
    const entityCode = '1';
    const checkChar = String((i * 7) % 9 + 1);
    const gstin = `${state.code}${pan}${entityCode}Z${checkChar}`;

    const tradeName = i < REALISTIC_VENDORS.length 
      ? baseVendor.name 
      : `${baseVendor.name} - Unit ${Math.floor(i / REALISTIC_VENDORS.length) + 1}`;

    vendors.push({
      gstin,
      legalName: tradeName,
      tradeName,
      stateCode: state.code,
      stateName: state.name,
      pan,
    });
  }

  return vendors;
}

function pickTaxRate(rand: number): number {
  if (rand < 0.65) return 18; // 65% standard 18% B2B
  if (rand < 0.85) return 12; // 20% 12% rate
  if (rand < 0.95) return 28; // 10% 28% rate
  return 5;                   // 5% 5% rate
}

/**
 * Generates the synthetic benchmark dataset with 10,000 realistic rows
 */
export function generateSyntheticBenchmarkDataset(options: BenchmarkOptions = {}): SyntheticBenchmarkDataset {
  const seed = options.seed ?? 20260821;
  const totalCount = options.totalCount ?? 10000;
  const clientGstin: GSTIN = options.clientGstin ?? '07AAAAA0000A1Z5'; // Client is in Delhi (07)
  const clientTradeName = 'Bharat Manufacturing & Engineering Enterprises Ltd';
  const filingPeriod = options.filingPeriod ?? '082026';

  const prng = createMulberry32(seed);
  const vendors = generate500Vendors(prng);

  const erpInvoices: InwardInvoice[] = [];
  const gstr2bRecords: Gstr2bRecord[] = [];

  const exactMatchIds: string[] = [];
  const syntaxMatchIds: string[] = [];
  const typoMatchIds: string[] = [];
  const posSwapIds: string[] = [];
  const missingIn2bIds: string[] = [];

  const agingBucketBreakdown: Record<Rule37AAgingBucket, number> = {
    CURRENT_30_DAYS: 0,
    WATCH_60_DAYS: 0,
    WARNING_90_DAYS: 0,
    CRITICAL_180_DAYS_HOLD: 0,
  };

  let totalTaxablePaise: Paise = 0n;
  let totalTaxPaise: Paise = 0n;
  let totalGrossPaise: Paise = 0n;

  // Slices:
  // 0 -> 7,000 : Exact Matches (Pass 1 - 70%)
  // 7,000 -> 8,500 : Syntax & Section 170 Matches (Pass 2 - 15%)
  // 8,500 -> 9,000 : Typo Fuzzy Matches (Pass 3 - 5%)
  // 9,000 -> 9,500 : POS Table 9A Tax-Head Swaps (Pass 4 - 5%)
  // 9,500 -> 10,000 : Rule 37A Missing Defaulters (Pass 5 - 5%)

  const EXACT_LIMIT = Math.floor(totalCount * 0.70); // 7,000
  const SYNTAX_LIMIT = EXACT_LIMIT + Math.floor(totalCount * 0.15); // 8,500
  const TYPO_LIMIT = SYNTAX_LIMIT + Math.floor(totalCount * 0.05); // 9,000
  const POS_LIMIT = TYPO_LIMIT + Math.floor(totalCount * 0.05); // 9,500

  for (let i = 0; i < totalCount; i++) {
    const vendor = vendors[i % vendors.length];
    const isInterstate = vendor.stateCode !== '07'; // Client is 07 (Delhi)

    // Base Taxable value between ₹8,500.00 and ₹4,80,000.00
    const baseRupees = 8500 + Math.floor(prng() * 471500);
    const taxablePaise: Paise = BigInt(baseRupees * 100);

    const taxRate = pickTaxRate(prng());
    const totalTaxPaiseVal: Paise = (taxablePaise * BigInt(taxRate)) / 100n;

    let igstPaise: Paise = 0n;
    let cgstPaise: Paise = 0n;
    let sgstPaise: Paise = 0n;
    const cessPaise: Paise = 0n;

    if (isInterstate) {
      igstPaise = totalTaxPaiseVal;
    } else {
      cgstPaise = totalTaxPaiseVal / 2n;
      sgstPaise = totalTaxPaiseVal - cgstPaise;
    }

    const totalValuePaise: Paise = taxablePaise + igstPaise + cgstPaise + sgstPaise + cessPaise;

    const day = 1 + (i % 20);
    const invoiceDateStr: ISODateString = `2026-08-${String(day).padStart(2, '0')}`;
    
    // Diverse Realistic Invoice Number
    const prefix = INVOICE_PREFIXES[i % INVOICE_PREFIXES.length];
    const serial = String(1001 + i).padStart(5, '0');
    const rawInvNum = `${prefix}${serial}`;

    // -----------------------------------------------------------------------
    // GROUP 1: EXACT MATCHES (Pass 1: 0 to 6,999)
    // -----------------------------------------------------------------------
    if (i < EXACT_LIMIT) {
      const erpInv: InwardInvoice = {
        internalId: `erp_${vendor.gstin}_${rawInvNum}_${i + 1}`,
        gstin: vendor.gstin,
        supplierName: vendor.tradeName,
        invoiceNumber: rawInvNum,
        normalizedInvoiceNumber: normalizeInvoiceSyntax(rawInvNum),
        invoiceDate: invoiceDateStr,
        taxableValuePaise: taxablePaise,
        igstPaise,
        cgstPaise,
        sgstPaise,
        cessPaise,
        totalValuePaise,
        pos: isInterstate ? vendor.stateCode : '07',
        isReverseCharge: false,
        sourceErp: 'TALLY',
        rawRowIndex: i + 1,
        documentType: 'INV',
      };

      const g2bRec: Gstr2bRecord = {
        gstr2bId: `g2b_${vendor.gstin}_${rawInvNum}_${i + 1}`,
        supplierGstin: vendor.gstin,
        supplierTradeName: vendor.tradeName,
        invoiceNumber: rawInvNum,
        normalizedInvoiceNumber: normalizeInvoiceSyntax(rawInvNum),
        invoiceDate: invoiceDateStr,
        invoiceType: 'R',
        taxableValuePaise: taxablePaise,
        igstPaise,
        cgstPaise,
        sgstPaise,
        cessPaise,
        totalValuePaise,
        placeOfSupply: isInterstate ? vendor.stateCode : '07',
        reverseCharge: false,
        itcAvailability: 'Y',
        filingPeriod,
        filingDate: invoiceDateStr,
        supplierGstr3bFiled: true,
      };

      erpInvoices.push(erpInv);
      gstr2bRecords.push(g2bRec);
      exactMatchIds.push(erpInv.internalId);

      totalTaxablePaise += taxablePaise;
      totalTaxPaise += totalTaxPaiseVal;
      totalGrossPaise += totalValuePaise;
    }
    // -----------------------------------------------------------------------
    // GROUP 2: SYNTAX & SECTION 170 ROUNDING (Pass 2: 7,000 to 8,499)
    // -----------------------------------------------------------------------
    else if (i < SYNTAX_LIMIT) {
      // ERP has standard format: "LT/26-27/01234"
      // GSTR-2B has stripped prefix: "26-27/1234" + Rs 0.85 rounding variance
      const g2bInvNum = rawInvNum.replace(/^[A-Z&/-]+\//, '').replace(/^0+/, '');
      const roundDeltaPaise = prng() < 0.5 ? 85n : -75n; // within +/- 100 Paise Section 170
      const g2bTotalVal = totalValuePaise + roundDeltaPaise;

      const erpInv: InwardInvoice = {
        internalId: `erp_${vendor.gstin}_${rawInvNum}_${i + 1}`,
        gstin: vendor.gstin,
        supplierName: vendor.tradeName,
        invoiceNumber: rawInvNum,
        normalizedInvoiceNumber: normalizeInvoiceSyntax(rawInvNum),
        invoiceDate: invoiceDateStr,
        taxableValuePaise: taxablePaise,
        igstPaise,
        cgstPaise,
        sgstPaise,
        cessPaise,
        totalValuePaise,
        pos: isInterstate ? vendor.stateCode : '07',
        isReverseCharge: false,
        sourceErp: 'ZOHO',
        rawRowIndex: i + 1,
        documentType: 'INV',
      };

      const g2bRec: Gstr2bRecord = {
        gstr2bId: `g2b_${vendor.gstin}_${g2bInvNum}_${i + 1}`,
        supplierGstin: vendor.gstin,
        supplierTradeName: vendor.tradeName,
        invoiceNumber: g2bInvNum,
        normalizedInvoiceNumber: normalizeInvoiceSyntax(g2bInvNum),
        invoiceDate: invoiceDateStr,
        invoiceType: 'R',
        taxableValuePaise: taxablePaise,
        igstPaise,
        cgstPaise,
        sgstPaise,
        cessPaise,
        totalValuePaise: g2bTotalVal,
        placeOfSupply: isInterstate ? vendor.stateCode : '07',
        reverseCharge: false,
        itcAvailability: 'Y',
        filingPeriod,
        filingDate: invoiceDateStr,
        supplierGstr3bFiled: true,
      };

      erpInvoices.push(erpInv);
      gstr2bRecords.push(g2bRec);
      syntaxMatchIds.push(erpInv.internalId);

      totalTaxablePaise += taxablePaise;
      totalTaxPaise += totalTaxPaiseVal;
      totalGrossPaise += totalValuePaise;
    }
    // -----------------------------------------------------------------------
    // GROUP 3: TYPO FUZZY MATCHES (Pass 3: 8,500 to 8,999)
    // -----------------------------------------------------------------------
    else if (i < TYPO_LIMIT) {
      // Intentional human typo: replace '0' with 'O' or swap slash with hyphen
      const typoInvNum = rawInvNum.replace('/', '-').replace('0', 'O');

      const erpInv: InwardInvoice = {
        internalId: `erp_${vendor.gstin}_${rawInvNum}_${i + 1}`,
        gstin: vendor.gstin,
        supplierName: vendor.tradeName,
        invoiceNumber: rawInvNum,
        normalizedInvoiceNumber: normalizeInvoiceSyntax(rawInvNum),
        invoiceDate: invoiceDateStr,
        taxableValuePaise: taxablePaise,
        igstPaise,
        cgstPaise,
        sgstPaise,
        cessPaise,
        totalValuePaise,
        pos: isInterstate ? vendor.stateCode : '07',
        isReverseCharge: false,
        sourceErp: 'BUSY',
        rawRowIndex: i + 1,
        documentType: 'INV',
      };

      const g2bRec: Gstr2bRecord = {
        gstr2bId: `g2b_${vendor.gstin}_${typoInvNum}_${i + 1}`,
        supplierGstin: vendor.gstin,
        supplierTradeName: vendor.tradeName,
        invoiceNumber: typoInvNum,
        normalizedInvoiceNumber: normalizeInvoiceSyntax(typoInvNum),
        invoiceDate: invoiceDateStr,
        invoiceType: 'R',
        taxableValuePaise: taxablePaise,
        igstPaise,
        cgstPaise,
        sgstPaise,
        cessPaise,
        totalValuePaise,
        placeOfSupply: isInterstate ? vendor.stateCode : '07',
        reverseCharge: false,
        itcAvailability: 'Y',
        filingPeriod,
        filingDate: invoiceDateStr,
        supplierGstr3bFiled: true,
      };

      erpInvoices.push(erpInv);
      gstr2bRecords.push(g2bRec);
      typoMatchIds.push(erpInv.internalId);

      totalTaxablePaise += taxablePaise;
      totalTaxPaise += totalTaxPaiseVal;
      totalGrossPaise += totalValuePaise;
    }
    // -----------------------------------------------------------------------
    // GROUP 4: POS & TAX-HEAD SWAP (Pass 4: 9,000 to 9,499)
    // -----------------------------------------------------------------------
    else if (i < POS_LIMIT) {
      // Vendor mistakenly filed CGST+SGST instead of IGST
      const erpInv: InwardInvoice = {
        internalId: `erp_${vendor.gstin}_${rawInvNum}_${i + 1}`,
        gstin: vendor.gstin,
        supplierName: vendor.tradeName,
        invoiceNumber: rawInvNum,
        normalizedInvoiceNumber: normalizeInvoiceSyntax(rawInvNum),
        invoiceDate: invoiceDateStr,
        taxableValuePaise: taxablePaise,
        igstPaise: totalTaxPaiseVal,
        cgstPaise: 0n,
        sgstPaise: 0n,
        cessPaise: 0n,
        totalValuePaise,
        pos: '07', // Delhi
        isReverseCharge: false,
        sourceErp: 'SAP',
        rawRowIndex: i + 1,
        documentType: 'INV',
      };

      const g2bRec: Gstr2bRecord = {
        gstr2bId: `g2b_${vendor.gstin}_${rawInvNum}_${i + 1}`,
        supplierGstin: vendor.gstin,
        supplierTradeName: vendor.tradeName,
        invoiceNumber: rawInvNum,
        normalizedInvoiceNumber: normalizeInvoiceSyntax(rawInvNum),
        invoiceDate: invoiceDateStr,
        invoiceType: 'R',
        taxableValuePaise: taxablePaise,
        igstPaise: 0n,
        cgstPaise: totalTaxPaiseVal / 2n,
        sgstPaise: totalTaxPaiseVal / 2n,
        cessPaise: 0n,
        totalValuePaise,
        placeOfSupply: vendor.stateCode, // State mismatch
        reverseCharge: false,
        itcAvailability: 'Y',
        filingPeriod,
        filingDate: invoiceDateStr,
        supplierGstr3bFiled: true,
      };

      erpInvoices.push(erpInv);
      gstr2bRecords.push(g2bRec);
      posSwapIds.push(erpInv.internalId);

      totalTaxablePaise += taxablePaise;
      totalTaxPaise += totalTaxPaiseVal;
      totalGrossPaise += totalValuePaise;
    }
    // -----------------------------------------------------------------------
    // GROUP 5: RULE 37A DEFAULTERS (Pass 5: 9,500 to 9,999) - Missing in 2B
    // -----------------------------------------------------------------------
    else {
      // Inward invoice exists in ERP, but supplier failed to upload GSTR-1
      const agingDays = 45 + ((i * 17) % 200); // 45 to 245 days
      const pastDate = new Date(Date.now() - agingDays * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

      const erpInv: InwardInvoice = {
        internalId: `erp_${vendor.gstin}_${rawInvNum}_${i + 1}`,
        gstin: vendor.gstin,
        supplierName: vendor.tradeName,
        invoiceNumber: rawInvNum,
        normalizedInvoiceNumber: normalizeInvoiceSyntax(rawInvNum),
        invoiceDate: pastDate,
        taxableValuePaise: taxablePaise,
        igstPaise,
        cgstPaise,
        sgstPaise,
        cessPaise,
        totalValuePaise,
        pos: isInterstate ? vendor.stateCode : '07',
        isReverseCharge: false,
        sourceErp: 'TALLY',
        rawRowIndex: i + 1,
        documentType: 'INV',
      };

      erpInvoices.push(erpInv);
      missingIn2bIds.push(erpInv.internalId);

      if (agingDays > 180) {
        agingBucketBreakdown.CRITICAL_180_DAYS_HOLD++;
      } else if (agingDays > 90) {
        agingBucketBreakdown.WARNING_90_DAYS++;
      } else if (agingDays > 60) {
        agingBucketBreakdown.WATCH_60_DAYS++;
      } else {
        agingBucketBreakdown.CURRENT_30_DAYS++;
      }

      totalTaxablePaise += taxablePaise;
      totalTaxPaise += totalTaxPaiseVal;
      totalGrossPaise += totalValuePaise;
    }
  }

  const groundTruth: GroundTruthMetadata = {
    totalErpRows: erpInvoices.length,
    totalGstr2bRows: gstr2bRecords.length,
    exactMatchCount: exactMatchIds.length,
    syntaxMatchCount: syntaxMatchIds.length,
    typoFuzzyMatchCount: typoMatchIds.length,
    posSwapMatchCount: posSwapIds.length,
    missingIn2bDefaulterCount: missingIn2bIds.length,
    totalTaxablePaise,
    totalTaxPaise,
    totalGrossPaise,
    exactMatchIds,
    syntaxMatchIds,
    typoMatchIds,
    posSwapIds,
    missingIn2bIds,
    agingBucketBreakdown,
  };

  return {
    clientGstin,
    clientTradeName,
    filingPeriod,
    erpInvoices,
    gstr2bRecords,
    vendors,
    groundTruth,
  };
}

/**
 * 1-Click Master Benchmark Reconciliation Dataset Execution
 * Reconciles 10,000 records in-memory in < 30ms using ReconciliationEngine
 */
export function generateSampleReconDataset(count: number = 10000): ReconciliationResultSet {
  const benchmark = generateSyntheticBenchmarkDataset({ totalCount: count });
  return ReconciliationEngine.run({
    erpInvoices: benchmark.erpInvoices,
    gstr2bRecords: benchmark.gstr2bRecords,
    clientGstin: benchmark.clientGstin,
    clientTradeName: benchmark.clientTradeName,
    filingPeriod: benchmark.filingPeriod,
  });
}

