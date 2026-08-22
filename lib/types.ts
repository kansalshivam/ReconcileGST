/**
 * @file lib/types.ts
 * @summary Core TypeScript Domain Types, Data Contracts & Web Worker IPC Protocol
 * @version 2.4.0
 * @author Principal Data Contracts & Systems Performance Architect (Pod 1 - Shivam Kansal lead)
 * 
 * Standards Compliance:
 * - Master Engineering Skill (Stage 4C: Items 46 & 47; Stage 5: Tasks 001-009)
 * - CBIC Form GSTR-2B v1.0 & Form GSTR-1A v1.0 Schemas
 * - CGST Act 2017: Section 16(2)(aa), Section 50(3), Section 170
 * - CGST Rules 2017: Rule 37A, Rule 88D (DRC-01C), Rule 59(6)(e)
 * - GSTN IMS Advisory No. 624 / Circular 231/2024
 */

// ============================================================================
// 1. SCALAR FINANCIAL & STATUTORY PRIMITIVES
// ============================================================================

/**
 * Fixed-point integer representing monetary currency in Indian Paise (1 INR = 100 Paise).
 * Invariant: Must always be an exact whole integer (BigInt). Negative values represent Credit Notes.
 * Completely eliminates IEEE-754 binary floating-point rounding drift.
 */
export type Paise = bigint;

/**
 * 15-character statutory Goods and Services Tax Identification Number.
 * Format: 2 numeric state digits + 5 alpha PAN + 4 numeric PAN + 1 alpha entity + 1 checksum + 'Z' + 1 checksum.
 * Regex: ^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$
 */
export type GSTIN = string;

/**
 * 10-character Permanent Account Number (PAN) used for cross-state entity aggregation.
 * Format: 5 alpha + 4 numeric + 1 alpha.
 */
export type PAN = string;

/**
 * Standardized ISO Date string representation: YYYY-MM-DD.
 */
export type ISODateString = string;

/**
 * Standard GST return filing period in MMYYYY format (e.g., "082026" for August 2026).
 */
export type FilingPeriod = string;

/**
 * 2-digit Indian State / Union Territory Code (e.g., "07" for Delhi, "27" for Maharashtra).
 */
export type StateCode = string;

// ============================================================================
// 2. INWARD PURCHASE REGISTER (ERP) DOMAIN ENTITIES
// ============================================================================

/**
 * Supported enterprise accounting and ERP ledger source systems.
 */
export type SourceERP = 
  | 'TALLY' 
  | 'ZOHO' 
  | 'BUSY' 
  | 'MARG' 
  | 'SAP' 
  | 'GENERIC_CSV' 
  | 'GENERIC_EXCEL';

/**
 * Statutory commercial document classification.
 */
export type DocumentType = 'INV' | 'CRN' | 'DBN';

/**
 * Represents a single normalized invoice record ingested from the buyer's internal Purchase Register.
 */
export interface InwardInvoice {
  /** Unique client-side generated UUID identifying this ERP entry */
  readonly internalId: string;

  /** Supplier GSTIN parsed, trimmed, and validated */
  readonly gstin: GSTIN;

  /** Trade name or legal entity name from ERP vendor master */
  readonly supplierName: string;

  /** Raw invoice number as entered by accountant */
  readonly invoiceNumber: string;

  /** Canonical normalized invoice number (delimiters, prefixes, FY, and leading zeros stripped) */
  readonly normalizedInvoiceNumber: string;

  /** Invoice date in ISO format YYYY-MM-DD */
  readonly invoiceDate: ISODateString;

  /** Net taxable assessable value in integer Paise */
  readonly taxableValuePaise: Paise;

  /** Integrated Goods and Services Tax (IGST) in integer Paise */
  readonly igstPaise: Paise;

  /** Central Goods and Services Tax (CGST) in integer Paise */
  readonly cgstPaise: Paise;

  /** State / Union Territory Goods and Services Tax (SGST) in integer Paise */
  readonly sgstPaise: Paise;

  /** GST Compensation Cess in integer Paise */
  readonly cessPaise: Paise;

  /** Total invoice value (Taxable + Taxes + Cess) in integer Paise */
  readonly totalValuePaise: Paise;

  /** 2-digit Place of Supply (POS) state code */
  readonly pos: StateCode;

  /** Reverse charge applicability indicator under Section 9(3)/9(4) */
  readonly isReverseCharge: boolean;

  /** Detected ERP source system */
  readonly sourceErp: SourceERP;

  /** Zero-indexed row number in the original uploaded purchase register */
  readonly rawRowIndex: number;

  /** Document type: standard invoice (INV), credit note (CRN), debit note (DBN) */
  readonly documentType: DocumentType;
}

// ============================================================================
// 3. OFFICIAL GSTN GSTR-2B AUTO-DRAFTED ENTITIES
// ============================================================================

/**
 * Official GSTR-2B invoice classification code from GSTN portal.
 */
export type Gstr2bInvoiceType = 
  | 'R'      // Regular B2B Invoices
  | 'SEZWP'  // SEZ supplies with tax payment
  | 'SEZWOP' // SEZ supplies without tax payment
  | 'DE'     // Deemed exports
  | 'CBW'    // Custom bonded warehouse
  | 'CRN'    // Credit Note
  | 'DBN';   // Debit Note

/**
 * ITC eligibility flag reported in GSTR-2B ('Y' = Available, 'N' = Ineligible under Section 17(5)).
 */
export type ItcAvailability = 'Y' | 'N';

/**
 * Represents a single auto-drafted invoice record parsed from official GSTN GSTR-2B JSON.
 */
export interface Gstr2bRecord {
  /** Unique client-side generated UUID identifying this GSTR-2B entry */
  readonly gstr2bId: string;

  /** Supplier GSTIN as filed on the official GSTN portal */
  readonly supplierGstin: GSTIN;

  /** Supplier trade or legal name auto-drafted from portal master */
  readonly supplierTradeName: string;

  /** Invoice number as reported by supplier in Form GSTR-1 / GSTR-1A / IFF */
  readonly invoiceNumber: string;

  /** Canonical normalized invoice number */
  readonly normalizedInvoiceNumber: string;

  /** Invoice date in ISO format YYYY-MM-DD */
  readonly invoiceDate: ISODateString;

  /** Invoice classification type */
  readonly invoiceType: Gstr2bInvoiceType;

  /** Net taxable assessable value in integer Paise */
  readonly taxableValuePaise: Paise;

  /** Integrated Tax in integer Paise */
  readonly igstPaise: Paise;

  /** Central Tax in integer Paise */
  readonly cgstPaise: Paise;

  /** State / UT Tax in integer Paise */
  readonly sgstPaise: Paise;

  /** Compensation Cess in integer Paise */
  readonly cessPaise: Paise;

  /** Gross invoice value in integer Paise */
  readonly totalValuePaise: Paise;

  /** 2-digit Place of Supply (POS) reported on portal */
  readonly placeOfSupply: StateCode;

  /** Reverse charge flag reported by supplier */
  readonly reverseCharge: boolean;

  /** ITC eligibility indicator under Section 16(2) */
  readonly itcAvailability: ItcAvailability;

  /** Return period when supplier uploaded document (e.g. "082026") */
  readonly filingPeriod: FilingPeriod;

  /** Date supplier filed GSTR-1 return (ISO YYYY-MM-DD) */
  readonly filingDate: ISODateString;

  /** Whether supplier's GSTR-3B return is confirmed filed (Rule 37A tracking) */
  readonly supplierGstr3bFiled: boolean;
}

// ============================================================================
// 4. RECONCILIATION WATERFALL & STATUTORY STATUS TYPES
// ============================================================================

/**
 * High-level statutory reconciliation status classification.
 */
export type ReconStatus = 
  | 'MATCHED'              // Matched within legal statutory tolerance
  | 'PROBABLE_MATCH'       // High-confidence fuzzy candidate requiring CA confirmation
  | 'MISMATCHED_VALUE'     // Identical invoice number/GSTIN, but tax delta > Section 170 limit
  | 'MISSING_IN_GSTR2B'    // Inward ledger invoice not found in GSTR-2B (Defaulting Supplier)
  | 'MISSING_IN_PR'        // Portal credit available but omitted from inward purchase ledger
  | 'TAX_HEAD_MISMATCH';   // POS or Inter/Intra tax allocation mismatch (Table 9A)

/**
 * Backward-compatible alias for ReconStatus.
 */
export type MatchStatus = ReconStatus;

/**
 * Granular waterfall pass subcategory detailing the exact matching heuristic applied.
 */
export type MatchStage = 
  | 'EXACT_PASS_1'                  // 100% identical GSTIN, Invoice #, Date, and Values
  | 'CANONICAL_SYNTAX_PASS_2'       // Matches after delimiter, FY, and leading zero normalization
  | 'SECTION_170_ROUNDING_PASS_2'   // Matches with |Delta| <= 100 Paise (+-Rs 1.00)
  | 'RAPIDFUZZ_SIMD_PASS_3'         // RapidFuzz Levenshtein similarity score >= 0.85
  | 'POS_TABLE_9A_SWAP_PASS_4'      // Equal total tax but IGST vs (CGST+SGST) shifted
  | 'DEF_NO_FILING_RECORD'          // Supplier never uploaded to GSTR-1 (Missing in 2B)
  | 'DEF_UNCLAIMED_IN_BOOKS'        // GSTR-2B record has no buyer purchase voucher (Missing in PR)
  | 'DEF_VALUE_DISCREPANCY';        // Difference > Rs 1.00

/**
 * Backward-compatible alias for MatchStage.
 */
export type MatchSubCategory = MatchStage;

/**
 * Rule 37A statutory risk bucket categorized by days elapsed since invoice date.
 */
export type Rule37AAgingBucket = 
  | 'CURRENT_30_DAYS'
  | 'WATCH_60_DAYS'
  | 'WARNING_90_DAYS'
  | 'CRITICAL_180_DAYS_HOLD';

/**
 * Represents a single reconciled pair or unmatched record produced by the matching engine.
 */
export interface ReconResult {
  /** Unique reconciliation match ID */
  readonly matchId: string;

  /** Reference to ERP Purchase Register Invoice (if present) */
  readonly erpInvoice?: InwardInvoice;

  /** Reference to GSTR-2B Portal Record (if present) */
  readonly gstr2bRecord?: Gstr2bRecord;

  /** Primary statutory match status classification */
  readonly status: ReconStatus;

  /** Granular waterfall pass subcategory */
  readonly subCategory: MatchStage;

  /** RapidFuzz string confidence score (0.00 to 1.00) */
  readonly similarityScore: number;

  /** Delta in tax amount: ERP Total Tax - GSTR-2B Total Tax in integer Paise */
  readonly taxDifferencePaise: Paise;

  /** Delta in taxable base value: ERP Taxable - GSTR-2B Taxable in integer Paise */
  readonly taxableDifferencePaise: Paise;

  /** Detailed human-readable explanation of match or discrepancy */
  readonly discrepancyExplanation: string;

  /** Days elapsed since invoice date (for Rule 37A tracking) */
  readonly daysOverdue: number;

  /** Rule 37A statutory risk bucket */
  readonly agingBucket: Rule37AAgingBucket;

  /** Estimated Section 50(3) 18% p.a. daily penal interest in integer Paise */
  readonly potentialInterestPaise: Paise;

  /** Current GSTN IMS pre-triage action status */
  imsActionState: ImsActionState;

  /** Backward-compatible alias for imsActionState */
  imsAction?: ImsActionState;

  /** Backward-compatible alias for similarityScore */
  readonly confidenceScore?: number;

  /** Backward-compatible alias for taxableDifferencePaise */
  readonly deltaTaxablePaise?: Paise;

  /** Optional audit tracing identifier tag */
  readonly auditTag?: string;
}


// ============================================================================
// 5. STATUTORY SENTINEL CONTRACTS (RULE 88D, SECTION 50, IMS, GSTR-1A)
// ============================================================================

/**
 * Threat level classifications for Rule 88D (Form GST DRC-01C) Sentinel.
 */
export type ThreatLevel = 'COMPLIANT' | 'LOW' | 'MEDIUM' | 'CRITICAL';

/**
 * Output structure from Rule 88D statutory risk evaluation engine.
 */
export interface Rule88DRiskResult {
  /** Total ITC claimed in purchase register in integer Paise */
  readonly claimedItcPaise: Paise;

  /** Total ITC available in GSTR-2B in integer Paise */
  readonly availableItcPaise: Paise;

  /** Absolute excess ITC claimed in integer Paise */
  readonly excessItcPaise: Paise;

  /** Percentage discrepancy: ((Claimed - Available) / Available) * 100 */
  readonly excessPercentage: number;

  /** Whether both statutory conditions (>20% AND >Rs 25 Lakhs) are breached */
  readonly isDrc01cTriggered: boolean;

  /** Evaluated threat level */
  readonly threatLevel: ThreatLevel;

  /** Statutory deadline in days to respond to Part A notice (7 days if triggered) */
  readonly legalActionDeadlineDays: number;

  /** Legal explanation banner text citing Rule 88D and Rule 59(6)(e) */
  readonly statutoryWarningText: string;
}

/**
 * Section 50(3) daily compounding penal interest calculation result.
 */
export interface Section50InterestResult {
  readonly ineligibleUtilizedPaise: Paise;
  readonly utilizationDate: ISODateString;
  readonly reversalDate: ISODateString;
  readonly daysElapsed: number;
  readonly annualInterestRate: number; // 18.0%
  readonly dailyInterestPaise: Paise;
  readonly accumulatedInterestPaise: Paise;
  readonly totalFinancialLiabilityPaise: Paise;
}

/**
 * GSTN IMS Action States under Circular 231/2024.
 */
export type ImsActionState = 'NONE' | 'ACCEPT' | 'REJECT' | 'PENDING';
export type ImsAction = ImsActionState;

/**
 * Payload dispatched when a user applies an IMS action to an invoice.
 */
export interface ImsActionPayload {
  readonly matchId: string;
  readonly previousState: ImsActionState;
  readonly newState: ImsActionState;
  readonly documentType: DocumentType;
  readonly isCreditNoteTwoStepConfirmed?: boolean;
  readonly remarks?: string;
  readonly timestamp: ISODateString;
}

/**
 * Form GSTR-1A Outward Supply Item Detail.
 */
export interface Gstr1aItemDetail {
  readonly num: number;
  readonly txval: number; // Float representation for portal JSON export
  readonly iamt: number;
  readonly camt: number;
  readonly samt: number;
  readonly csamt: number;
}

/**
 * Form GSTR-1A Invoice Entry.
 */
export interface Gstr1aInvoiceEntry {
  readonly inum: string;
  readonly idt: string; // DD-MM-YYYY format mandated by GSTN
  readonly val: number;
  readonly pos: StateCode;
  readonly rchrg: 'Y' | 'N';
  readonly inv_typ: 'R' | 'DE' | 'SEZWP' | 'SEZWOP';
  readonly itcavl: 'Y' | 'N';
  readonly items: Gstr1aItemDetail[];
}

/**
 * Form GSTR-1A B2B Grouping per supplier GSTIN.
 */
export interface Gstr1aB2BGroup {
  readonly ctin: GSTIN;
  readonly cfs: 'Y' | 'N';
  readonly inv: Gstr1aInvoiceEntry[];
}

/**
 * Full Form GSTR-1A Supplier Outward Supply Amendment Delta Payload.
 */
export interface Gstr1aDeltaPayload {
  readonly gstin: GSTIN;
  readonly fp: FilingPeriod;
  readonly version: 'GSTR1A_v1.0';
  readonly b2b: Gstr1aB2BGroup[];
}

/**
 * Parameters for generating WhatsApp wa.me vendor intimation deep links.
 */
export interface VendorNoticeParams {
  readonly phoneNumber: string; // e.g. "919876543210"
  readonly supplierGstin: GSTIN;
  readonly supplierName: string;
  readonly invoiceNumber: string;
  readonly invoiceDate: string;
  readonly taxAmountInr: string;
  readonly language: 'EN' | 'HINGLISH';
  readonly filingPeriod: string;
  readonly deepLinkUrl?: string;
}

// ============================================================================
// 6. CANDIDATE BLOCKING & FINANCIAL MEMORY BUFFER CONTRACTS
// ============================================================================

/**
 * Disjoint candidate bucket partitioned on Supplier GSTIN for O(N+M) matching.
 */
export interface CandidateBucket {
  readonly gstin: GSTIN;
  readonly erpRecords: InwardInvoice[];
  readonly gstr2bRecords: Gstr2bRecord[];
}

/**
 * 6-element stride constants for packed BigInt64Array memory buffers (48 bytes per row).
 */
export const FINANCIAL_BUFFER_STRIDE = 6;

export enum FinancialBufferOffset {
  TAXABLE_VAL_PAISE = 0,
  IGST_PAISE = 1,
  CGST_PAISE = 2,
  SGST_PAISE = 3,
  CESS_PAISE = 4,
  TOTAL_VAL_PAISE = 5,
}

/**
 * Decoded financial tuple extracted from packed BigInt64Array buffer.
 */
export interface FinancialTuple {
  readonly taxableValuePaise: Paise;
  readonly igstPaise: Paise;
  readonly cgstPaise: Paise;
  readonly sgstPaise: Paise;
  readonly cessPaise: Paise;
  readonly totalValuePaise: Paise;
}

// ============================================================================
// 7. SUMMARY METRICS & RECONCILIATION RESULT SET
// ============================================================================

/**
 * High-precision aggregate reconciliation summary metrics.
 */
export interface ReconciliationSummaryMetrics {
  readonly totalErpInvoices: number;
  readonly totalGstr2bRecords: number;
  readonly matchedCount: number;
  readonly mismatchedCount: number;
  readonly missingIn2bCount: number;
  readonly missingInPrCount: number;
  readonly taxHeadMismatchCount: number;
  readonly section170ToleranceCount?: number;
  readonly section170?: number;
  readonly blocked17_5Count?: number;
  readonly totalClaimableItcPaise: Paise;
  readonly totalBlockedItcPaise: Paise;
  readonly totalUnclaimedItcPaise: Paise;
  readonly totalSection50InterestPaise: Paise;
  readonly rule88DRisk: Rule88DRiskResult;
  readonly telemetry: WorkerExecutionTelemetry;
}


/**
 * Complete reconciliation session payload returned from compute engine / worker.
 */
export interface ReconResultSet {
  readonly sessionId: string;
  readonly createdAt: ISODateString;
  readonly records: ReconResult[];
  readonly summary: ReconciliationSummaryMetrics;
  readonly clientGstin?: GSTIN;
  readonly clientTradeName?: string;
  readonly filingPeriod?: FilingPeriod;
}

export type ReconciliationResultSet = ReconResultSet;
export type Rule88DDiscrepancyEvaluation = Rule88DRiskResult;



// ============================================================================
// 8. WEB WORKER INTER-PROCESS COMMUNICATION (IPC) PROTOCOL
// ============================================================================

/**
 * Enumeration of all IPC command types (UI -> Worker) and event types (Worker -> UI).
 */
export type WorkerMessageType =
  // Commands (UI -> Worker)
  | 'CMD_INIT_WORKER'
  | 'CMD_START_RECONCILIATION'
  | 'CMD_APPLY_IMS_ACTION'
  | 'CMD_GENERATE_EXCEL_EXPORT'
  | 'CMD_GENERATE_GSTR1A_DELTA'
  | 'CMD_LOAD_MOCK_DATASET'
  | 'CMD_TERMINATE_WORKER'
  
  // Events (Worker -> UI)
  | 'EVT_WORKER_READY'
  | 'EVT_PROGRESS_UPDATE'
  | 'EVT_RECONCILIATION_COMPLETE'
  | 'EVT_IMS_ACTION_APPLIED'
  | 'EVT_EXCEL_EXPORT_READY'
  | 'EVT_GSTR1A_DELTA_READY'
  | 'EVT_MOCK_DATASET_LOADED'
  | 'EVT_WORKER_ERROR';

/**
 * Granular pipeline stage identifiers for live telemetry tracking.
 */
export type ReconStage = 
  | 'IDLE'
  | 'SANITIZING_INPUTS'
  | 'PARSING_GSTR2B_JSON'
  | 'PARSING_ERP_REGISTER'
  | 'BUILDING_INVERTED_HASH_INDEX'
  | 'EXECUTING_EXACT_PASS_1'
  | 'EXECUTING_SYNTAX_PASS_2'
  | 'EXECUTING_RAPIDFUZZ_PASS_3'
  | 'EXECUTING_POS_RESOLVER_PASS_4'
  | 'EVALUATING_STATUTORY_METRICS'
  | 'ASSEMBLING_RESULTS';

/**
 * Microsecond-accurate telemetry timings for each reconciliation stage.
 */
export interface WorkerExecutionTelemetry {
  readonly totalExecutionTimeMs: number;
  readonly parsingDurationMs: number;
  readonly hashIndexingDurationMs: number;
  readonly pass1ExactDurationMs: number;
  readonly pass2SyntaxDurationMs: number;
  readonly pass3RapidFuzzDurationMs: number;
  readonly pass4PosDurationMs: number;
  readonly metricsAssemblyDurationMs: number;
  readonly peakWorkerMemoryMb: number;
  readonly rapidFuzzWasmAccelerated: boolean;
  readonly rowsPerSecond?: number;
}


// UI -> Worker Command Payloads

export interface InitWorkerCommand {
  readonly type: 'CMD_INIT_WORKER';
  readonly correlationId: string;
}

export interface StartReconciliationCommand {
  readonly type: 'CMD_START_RECONCILIATION';
  readonly correlationId: string;
  readonly payload: {
    readonly gstr2bFileBuffer?: ArrayBuffer;
    readonly gstr2bFileName?: string;
    readonly gstr2bRecords?: Gstr2bRecord[];
    readonly erpFileBuffer?: ArrayBuffer;
    readonly erpFileName?: string;
    readonly erpRecords?: InwardInvoice[];
    readonly clientGstin: GSTIN;
    readonly filingPeriod: FilingPeriod;
    readonly fuzzyThreshold?: number; // Defaults to 0.85
    readonly dateWindowDays?: number; // Defaults to 31
  };
}

export interface ApplyImsActionCommand {
  readonly type: 'CMD_APPLY_IMS_ACTION';
  readonly correlationId: string;
  readonly payload: ImsActionPayload;
}

export interface GenerateExcelExportCommand {
  readonly type: 'CMD_GENERATE_EXCEL_EXPORT';
  readonly correlationId: string;
  readonly payload: {
    readonly sessionId: string;
  };
}

export interface GenerateGstr1aDeltaCommand {
  readonly type: 'CMD_GENERATE_GSTR1A_DELTA';
  readonly correlationId: string;
  readonly payload: {
    readonly supplierGstin: GSTIN;
    readonly filingPeriod: FilingPeriod;
  };
}

export interface LoadMockDatasetCommand {
  readonly type: 'CMD_LOAD_MOCK_DATASET';
  readonly correlationId: string;
  readonly payload: {
    readonly recordCount: 1000 | 5000 | 10000;
  };
}

export interface TerminateWorkerCommand {
  readonly type: 'CMD_TERMINATE_WORKER';
  readonly correlationId: string;
}

export type ReconWorkerCommand =
  | InitWorkerCommand
  | StartReconciliationCommand
  | ApplyImsActionCommand
  | GenerateExcelExportCommand
  | GenerateGstr1aDeltaCommand
  | LoadMockDatasetCommand
  | TerminateWorkerCommand;

// Worker -> UI Event Payloads

export interface WorkerReadyEvent {
  readonly type: 'EVT_WORKER_READY';
  readonly correlationId: string;
  readonly payload: {
    readonly wasmSupported: boolean;
    readonly maxConcurrency: number;
  };
}

export interface ProgressUpdateEvent {
  readonly type: 'EVT_PROGRESS_UPDATE';
  readonly correlationId: string;
  readonly payload: {
    readonly stage: ReconStage;
    readonly progressPercentage: number; // 0 to 100
    readonly itemsProcessed: number;
    readonly totalItems: number;
    readonly elapsedMs: number;
  };
}

export interface ReconciliationCompleteEvent {
  readonly type: 'EVT_RECONCILIATION_COMPLETE';
  readonly correlationId: string;
  readonly payload: {
    readonly results: ReconResultSet;
    readonly packedFinancialBuffer: BigInt64Array;
  };
}

export interface ImsActionAppliedEvent {
  readonly type: 'EVT_IMS_ACTION_APPLIED';
  readonly correlationId: string;
  readonly payload: {
    readonly matchId: string;
    readonly updatedAction: ImsActionPayload;
    readonly updatedSummary: ReconciliationSummaryMetrics;
  };
}

export interface ExcelExportReadyEvent {
  readonly type: 'EVT_EXCEL_EXPORT_READY';
  readonly correlationId: string;
  readonly payload: {
    readonly excelBinaryBlob: Blob;
    readonly filename: string;
    readonly byteSize: number;
  };
}

export interface Gstr1aDeltaReadyEvent {
  readonly type: 'EVT_GSTR1A_DELTA_READY';
  readonly correlationId: string;
  readonly payload: {
    readonly jsonString: string;
    readonly filename: string;
    readonly missingInvoiceCount: number;
    readonly totalDeltaTaxPaise: Paise;
  };
}

export interface MockDatasetLoadedEvent {
  readonly type: 'EVT_MOCK_DATASET_LOADED';
  readonly correlationId: string;
  readonly payload: {
    readonly results: ReconResultSet;
    readonly packedFinancialBuffer: BigInt64Array;
  };
}

export interface WorkerErrorEvent {
  readonly type: 'EVT_WORKER_ERROR';
  readonly correlationId: string;
  readonly payload: {
    readonly errorCode: ErrorCode;
    readonly errorMessage: string;
    readonly errorStack?: string;
    readonly stage: ReconStage;
    readonly technicalDetails?: Record<string, unknown>;
  };
}

export type ReconWorkerEvent =
  | WorkerReadyEvent
  | ProgressUpdateEvent
  | ReconciliationCompleteEvent
  | ImsActionAppliedEvent
  | ExcelExportReadyEvent
  | Gstr1aDeltaReadyEvent
  | MockDatasetLoadedEvent
  | WorkerErrorEvent;

/**
 * Union type for all worker message traffic.
 */
export type WorkerMessage = ReconWorkerCommand | ReconWorkerEvent;

// ============================================================================
// 9. ERROR HANDLING & ERROR CODES (34 STANDARDIZED CODES)
// ============================================================================

export type ParserErrorCode = 
  | 'ERR_PARSE_001'  // Corrupted or Truncated JSON
  | 'ERR_PARSE_002'  // Malformed CSV / Delimiter Confusion
  | 'ERR_PARSE_003'  // UTF-8 BOM / Non-UTF-8 Encoding Anomaly
  | 'ERR_PARSE_004'  // Unresolved Mandatory Column Header
  | 'ERR_PARSE_005'  // Invalid GSTIN Structural Checksum Failure
  | 'ERR_PARSE_006'  // File Size Limit Exceeded (>100MB)
  | 'ERR_PARSE_007'  // Untrusted Drag Event / Empty File Ingestion
  | 'ERR_PARSE_008'; // Unsupported File Extension / MIME Type

export type WorkerErrorCode = 
  | 'ERR_WORKER_001' // Web Worker Spawn Failure
  | 'ERR_WORKER_002' // Transferable ArrayBuffer Detachment Violation
  | 'ERR_WORKER_003' // Worker Execution Heartbeat Timeout (5s Guard)
  | 'ERR_WORKER_004' // RapidFuzz WASM Module Initialization Trap
  | 'ERR_WORKER_005' // TypeScript Myers Fallback Execution Fault
  | 'ERR_WORKER_006' // Unhandled Exception in Worker Matching Thread
  | 'ERR_WORKER_007' // Message Serialization / Unknown IPC Command
  | 'ERR_WORKER_008';// Correlation ID Mismatch / Out-of-Order Message

export type MemoryErrorCode = 
  | 'ERR_MEM_001'    // Heap Exhaustion / Out of Memory (OOM)
  | 'ERR_MEM_002'    // TypedArray BigInt64Array Allocation Overflow
  | 'ERR_MEM_003'    // Financial Buffer Stride Boundary Violation
  | 'ERR_MEM_004'    // BigInt Monetary Arithmetic Integer Overflow
  | 'ERR_MEM_005'    // Garbage Collection Starvation
  | 'ERR_MEM_006';   // Buffer Detachment Access Attempt

export type CalculationErrorCode = 
  | 'ERR_CALC_001'   // Section 170 Tolerance Underflow / Invariant Breach
  | 'ERR_CALC_002'   // Negative Monetary Quantity in Standard Invoice
  | 'ERR_CALC_003'   // Division by Zero in Rule 88D Percentage
  | 'ERR_CALC_004'   // Place of Supply State Code Inconsistency
  | 'ERR_CALC_005'   // Negative Date Elapsed in Section 50 Interest
  | 'ERR_CALC_006';  // Credit Note Without CA Confirmation Guard

export type ExportErrorCode = 
  | 'ERR_EXT_001'    // WhatsApp URL Text Exceeds 2000 Char Limit
  | 'ERR_EXT_002'    // Invalid Indian Phone Number
  | 'ERR_EXT_003'    // SheetJS Workbook Generation Fault
  | 'ERR_EXT_004'    // GSTR-1A JSON Schema Validation Violation
  | 'ERR_EXT_005'    // Browser Download Blob URL Revocation
  | 'ERR_EXT_006';   // CSP Network Egress Violation

export type ErrorCode = 
  | ParserErrorCode 
  | WorkerErrorCode 
  | MemoryErrorCode 
  | CalculationErrorCode 
  | ExportErrorCode;

export interface ReconcileErrorPayload {
  readonly code: ErrorCode;
  readonly message: string;
  readonly stage?: ReconStage;
  readonly details?: Record<string, unknown>;
}

export class ReconcileError extends Error {
  public readonly code: ErrorCode;
  public readonly stage?: ReconStage;
  public readonly details?: Record<string, unknown>;

  constructor(code: ErrorCode, message: string, details?: Record<string, unknown>, stage?: ReconStage) {
    super(`[${code}] ${message}`);
    this.name = 'ReconcileError';
    this.code = code;
    this.stage = stage;
    this.details = details;
    Object.setPrototypeOf(this, ReconcileError.prototype);
  }
}

// ============================================================================
// 10. TYPE GUARDS & RUNTIME VALIDATORS
// ============================================================================

export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
export const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
export const FILING_PERIOD_REGEX = /^(0[1-9]|1[0-2])(20\d{2})$/;

/**
 * Validates whether a value conforms to the statutory 15-character GSTIN schema.
 */
export function isValidGSTIN(value: unknown): value is GSTIN {
  return typeof value === 'string' && GSTIN_REGEX.test(value.trim().toUpperCase());
}

/**
 * Validates whether a value is a valid ISO date string (YYYY-MM-DD).
 */
export function isValidISODate(value: unknown): value is ISODateString {
  if (typeof value !== 'string') return false;
  if (!ISO_DATE_REGEX.test(value)) return false;
  const d = new Date(value);
  return !isNaN(d.getTime());
}

/**
 * Type guard for worker event messages dispatched to main UI thread.
 */
export function isReconWorkerEvent(msg: unknown): msg is ReconWorkerEvent {
  if (typeof msg !== 'object' || msg === null) return false;
  const m = msg as Partial<ReconWorkerEvent>;
  return typeof m.type === 'string' && m.type.startsWith('EVT_') && typeof m.correlationId === 'string';
}

/**
 * Type guard for worker command messages dispatched to background worker.
 */
export function isReconWorkerCommand(msg: unknown): msg is ReconWorkerCommand {
  if (typeof msg !== 'object' || msg === null) return false;
  const m = msg as Partial<ReconWorkerCommand>;
  return typeof m.type === 'string' && m.type.startsWith('CMD_') && typeof m.correlationId === 'string';
}
