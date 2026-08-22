/**
 * Master Data Contracts, Schemas & Domain Types
 * Re-exported from @/lib/types (Single Source of Truth)
 * Governed by stage_4_documents/09_contracts_and_schemas.md
 */

export type {
  Paise,
  GSTIN,
  ISODateString,
  FilingPeriod,
  StateCode,
  SourceERP,
  InwardInvoice,
  Gstr2bInvoiceType,
  ItcAvailability,
  Gstr2bRecord,
  ReconStatus,
  MatchStatus,
  MatchStage,
  MatchSubCategory,
  Rule37AAgingBucket,
  ThreatLevel,
  ImsActionState,
  ImsActionPayload,
  ReconResult,
  Rule88DRiskResult,
  Rule88DDiscrepancyEvaluation,
  WorkerExecutionTelemetry,
  ReconciliationSummaryMetrics,
  ReconResultSet,
  ReconciliationResultSet,
  VendorNoticeParams,
  Gstr1aItemDetail,
  Gstr1aInvoiceEntry,
  Gstr1aB2BGroup,
  Gstr1aDeltaPayload,
} from '../lib/types';

export {
  GSTIN_REGEX,
  isValidGSTIN,
  SECTION_170_TOLERANCE_PAISE,
  FUZZY_VALUE_PROXIMITY_PAISE,
  DRC01C_STATUTORY_THRESHOLD_PAISE,
  DRC01C_STATUTORY_PERCENTAGE_THRESHOLD,
  SECTION_50_ANNUAL_INTEREST_RATE,
  RULE_37A_180_DAYS_MS,
  FINANCIAL_BUFFER_STRIDE,
  FinancialBufferOffset,
} from '../lib/types';
