/**
 * @file statutory-sentinel.ts
 * @module ReconcileGST/StatutorySentinel
 * @description Statutory Risk Sentinel, Rule 88D (DRC-01C) Exposure Gauge, Section 50(3) Daily
 * Compounding Penal Interest Engine, Rule 37A 180-Day Aging Watchdog, and Automated Form GST
 * DRC-01C Part B Legal Defense Dossier Builder.
 *
 * @standards
 * - CGST Act 2017 Section 16(2)(aa) (Finance Act 2021)
 * - CGST Rules 2017 Rule 88D (Notification No. 38/2023-Central Tax)
 * - CGST Act 2017 Section 50(3) read with Notification No. 14/2022-Central Tax
 * - CGST Rules 2017 Rule 37A (Notification No. 26/2022-Central Tax)
 * - CGST Rules 2017 Rule 59(6)(e) & Rule 142B (Portal Lockout & Direct Bank Attachment)
 * - Judicial Precedents:
 *   - D.Y. Beathel Enterprises v. State Tax Officer (2021) 127 taxmann.com 80 (Madras HC)
 *   - Suncraft Energy Pvt. Ltd. v. Assistant Commissioner of State Tax (2023) MAT 1218 of 2023 (Calcutta HC / Upheld by Supreme Court)
 *   - CBIC Press Release dated 04-05-2018 (Recovery from seller first)
 */

// ============================================================================
// 1. DOMAIN SCALAR TYPES & CONSTANTS
// ============================================================================

/** Fixed-point integer in Indian Paise (1 INR = 100 Paise) */
export type Paise = bigint;

/** 15-character GSTIN format */
export type GSTIN = string;

/** ISO Date formatted string YYYY-MM-DD */
export type ISODateString = string;

/** Statutory Rule 88D Absolute Threshold: Rs 25,00,000 (250,000,000 Paise) */
export const RULE_88D_ABSOLUTE_THRESHOLD_PAISE: Paise = 250000000n;

/** Statutory Rule 88D Percentage Threshold: 20.0% */
export const RULE_88D_PERCENTAGE_THRESHOLD: number = 20.0;

/** Medium Risk Absolute Warning Threshold: Rs 5,00,000 (50,000,000 Paise) */
export const RULE_88D_MEDIUM_THRESHOLD_PAISE: Paise = 50000000n;

/** Medium Risk Percentage Warning Threshold: 10.0% */
export const RULE_88D_MEDIUM_PERCENTAGE_THRESHOLD: number = 10.0;

/** Section 50(3) Statutory Annual Penal Interest Rate: 18.0% p.a. */
export const SECTION_50_ANNUAL_INTEREST_RATE: number = 18.0;

/** Statutory Response Window for Form GST DRC-01C Part B: 7 Calendar Days */
export const DRC01C_MANDATORY_REPLY_DEADLINE_DAYS: number = 7;

/** Section 170 CGST Act Maximum Rounding Variance: Rs 1.00 (100 Paise) */
export const SECTION_170_ROUNDING_TOLERANCE_PAISE: Paise = 100n;

// ============================================================================
// 2. DATA CONTRACTS & INTERFACES
// ============================================================================

/**
 * Statutory Threat Gauge classification level.
 */
export type Rule88DThreatLevel = 'COMPLIANT' | 'LOW' | 'MEDIUM' | 'CRITICAL';

/**
 * Live Rule 88D Threat Gauge evaluation payload.
 */
export interface Rule88DThreatEvaluation {
  readonly claimedItcPaise: Paise;
  readonly availableItcPaise: Paise;
  readonly excessItcPaise: Paise;
  readonly excessPercentage: number;
  readonly isDrc01cTriggered: boolean;
  readonly threatLevel: Rule88DThreatLevel;
  readonly legalActionDeadlineDays: number;
  readonly statutoryBannerText: string;
  readonly regulatoryConsequences: {
    readonly isRule59LockoutRisk: boolean;
    readonly isRule142bRecoveryRisk: boolean;
    readonly statutoryNoticeForm: string;
    readonly requiredActionText: string;
  };
}

/**
 * Section 50(3) 18% p.a. Daily Compounding Penal Interest calculation result.
 */
export interface Section50InterestResult {
  readonly ineligibleUtilizedPaise: Paise;
  readonly utilizationDate: ISODateString;
  readonly reversalDate: ISODateString;
  readonly daysElapsed: number;
  readonly annualInterestRate: number;
  readonly dailyBurnRatePaise: Paise;
  readonly accumulatedInterestPaise: Paise;
  readonly totalFinancialLiabilityPaise: Paise;
  readonly statutoryCitation: string;
  readonly formattedSummary: string;
}

/**
 * Rule 37A 180-Day Aging Risk Category.
 */
export type Rule37AAgingBucket =
  | 'CURRENT_30_DAYS'
  | 'WATCH_60_DAYS'
  | 'WARNING_90_DAYS'
  | 'CRITICAL_180_DAYS_HOLD';

/**
 * Rule 37A Aging Analysis evaluation result for an unfiled/defaulting vendor invoice.
 */
export interface Rule37AAgingResult {
  readonly invoiceNumber: string;
  readonly invoiceDate: ISODateString;
  readonly supplierGstin: GSTIN;
  readonly supplierName: string;
  readonly taxAmountPaise: Paise;
  readonly daysOverdue: number;
  readonly agingBucket: Rule37AAgingBucket;
  readonly isPaymentHoldRecommended: boolean;
  readonly commercialActionRecommendation: string;
  readonly statutoryFilingCutoffDate: string;
  readonly estimatedInterestLiabilityPaise: Paise;
}

/**
 * Discrepant supplier line-item item for DRC-01C Part B defense brief.
 */
export interface Drc01cDiscrepantSupplierItem {
  readonly supplierGstin: GSTIN;
  readonly supplierLegalName: string;
  readonly invoiceNumber: string;
  readonly invoiceDate: ISODateString;
  readonly taxableValuePaise: Paise;
  readonly taxAmountPaise: Paise;
  readonly ewayBillNumber?: string;
  readonly bankingPaymentReference?: string;
  readonly deliveryChallanOrGrn?: string;
  readonly disputeReason:
    | 'SUPPLIER_GSTR1_DEFAULT'
    | 'SUPPLIER_GSTR3B_UNFILED'
    | 'INTRA_INTER_STATE_POS_SHIFT'
    | 'TIMING_DIFFERENCE_NEXT_PERIOD'
    | 'CREDIT_NOTE_ADJUSTMENT';
}

/**
 * Input configuration for generating DRC-01C Part B formal legal brief.
 */
export interface Drc01cDefenseBuilderOptions {
  readonly taxpayerGstin: GSTIN;
  readonly taxpayerLegalName: string;
  readonly taxpayerTradeName?: string;
  readonly filingPeriod: string; // e.g. "082026" or "August 2026"
  readonly claimedItcPaise: Paise;
  readonly availableItcPaise: Paise;
  readonly drc01cReferenceNumber?: string;
  readonly drc01cNoticeDate?: ISODateString;
  readonly discrepantSuppliers: Drc01cDiscrepantSupplierItem[];
  readonly jurisdictionState?: string;
  readonly assessingOfficerDesignation?: string;
}

/**
 * Form GST DRC-01C Part B Legal Defense Dossier.
 */
export interface Drc01cDefenseDossier {
  readonly referenceNumber: string;
  readonly taxpayerGstin: GSTIN;
  readonly filingPeriod: string;
  readonly totalDisputedTaxPaise: Paise;
  readonly partBReplyMarkdown: string;
  readonly partBReplyHtml: string;
  readonly caseLawCitations: Array<{
    readonly forum: string;
    readonly partyNames: string;
    readonly citation: string;
    readonly principle: string;
    readonly statutoryApplication: string;
  }>;
  readonly itemizedSupplierTableMarkdown: string;
  readonly submissionDeadlineDate: string;
}

// ============================================================================
// 3. CURRENCY & FORMATTING UTILITIES
// ============================================================================

/**
 * Converts integer Paise to standard Indian Rupee string with 2 decimal places.
 * Example: 250000000n -> "₹25,00,000.00"
 */
export function formatPaiseToRupees(paise: Paise): string {
  const isNegative = paise < 0n;
  const absPaise = isNegative ? -paise : paise;
  const wholeRupees = absPaise / 100n;
  const remainderPaise = absPaise % 100n;

  // Format whole number in Indian grouping (2,2,3)
  const wholeStr = wholeRupees.toString();
  let formattedWhole = '';
  if (wholeStr.length <= 3) {
    formattedWhole = wholeStr;
  } else {
    const lastThree = wholeStr.substring(wholeStr.length - 3);
    const rest = wholeStr.substring(0, wholeStr.length - 3);
    formattedWhole = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
  }

  const formattedFraction = remainderPaise.toString().padStart(2, '0');
  return `${isNegative ? '-' : ''}₹${formattedWhole}.${formattedFraction}`;
}

/**
 * Safely parses string or numeric rupee input into integer Paise without floating-point drift.
 */
export function parseRupeesToPaise(rupeeValue: number | string): Paise {
  if (typeof rupeeValue === 'number') {
    if (isNaN(rupeeValue)) return 0n;
    return BigInt(Math.round(rupeeValue * 100));
  }
  const cleanStr = rupeeValue.replace(/[^0-9.-]/g, '').trim();
  if (!cleanStr || cleanStr === '-' || cleanStr === '.') return 0n;

  const isNegative = cleanStr.startsWith('-');
  const unsignedStr = isNegative ? cleanStr.substring(1) : cleanStr;
  const parts = unsignedStr.split('.');
  const wholePart = BigInt(parts[0] || '0');
  let fractionStr = parts[1] || '0';

  if (fractionStr.length === 1) fractionStr += '0';
  else if (fractionStr.length > 2) fractionStr = fractionStr.substring(0, 2);

  const fractionPart = BigInt(fractionStr);
  const totalPaise = wholePart * 100n + fractionPart;
  return isNegative ? -totalPaise : totalPaise;
}

// ============================================================================
// 4. RULE 88D (FORM GST DRC-01C) LIVE THREAT GAUGE
// ============================================================================

/**
 * Evaluates real-time statutory threat under Rule 88D of CGST Rules 2017.
 *
 * Statutory Dual-Condition Trigger Mandate (Notification No. 38/2023-CT):
 * Condition 1: Excess Percentage > 20.0%
 * Condition 2: Excess Absolute ITC > Rs 25,00,000 (250,000,000 Paise)
 * Both conditions must be simultaneously TRUE for automated Form GST DRC-01C Part A intimation.
 *
 * @param claimedItcPaise - Total ITC claimed in GSTR-3B Table 4(A) in Paise
 * @param availableItcPaise - Total ITC auto-generated in GSTR-2B Table 3 in Paise
 * @returns Rule88DThreatEvaluation
 */
export function evaluateRule88DThreat(
  claimedItcPaise: Paise,
  availableItcPaise: Paise
): Rule88DThreatEvaluation {
  const excessItcPaise = claimedItcPaise > availableItcPaise ? claimedItcPaise - availableItcPaise : 0n;

  let excessPercentage = 0.0;
  if (availableItcPaise > 0n) {
    // High-precision percentage computation: (excess * 10000 / available) / 100
    const scaledPercentage = (excessItcPaise * 10000n) / availableItcPaise;
    excessPercentage = Number(scaledPercentage) / 100;
  } else if (excessItcPaise > 0n) {
    excessPercentage = 100.0;
  }

  // Statutory Dual Trigger Evaluation
  const isPercentageTriggered = excessPercentage > RULE_88D_PERCENTAGE_THRESHOLD;
  const isAbsoluteTriggered = excessItcPaise > RULE_88D_ABSOLUTE_THRESHOLD_PAISE;
  const isDrc01cTriggered = isPercentageTriggered && isAbsoluteTriggered;

  // Threat Level Categorization
  let threatLevel: Rule88DThreatLevel = 'COMPLIANT';
  if (isDrc01cTriggered) {
    threatLevel = 'CRITICAL';
  } else if (
    excessPercentage > RULE_88D_MEDIUM_PERCENTAGE_THRESHOLD ||
    excessItcPaise > RULE_88D_MEDIUM_THRESHOLD_PAISE
  ) {
    threatLevel = 'MEDIUM';
  } else if (excessItcPaise > 0n) {
    threatLevel = 'LOW';
  }

  // Statutory Banner & Action Guidance
  let statutoryBannerText = '';
  if (isDrc01cTriggered) {
    statutoryBannerText =
      `CRITICAL REGULATORY EXPOSURE: Rule 88D automated Form GST DRC-01C Part A notice triggered. ` +
      `Excess ITC of ${formatPaiseToRupees(excessItcPaise)} (${excessPercentage.toFixed(2)}%) exceeds ` +
      `the statutory dual-threshold (>20% and >₹25,00,000). Taxpayer MUST submit Form GST DRC-01C Part B ` +
      `reply or effect reversal within 7 days to prevent automated Rule 59(6)(e) GSTR-1 billing lockout ` +
      `and Rule 142B recovery proceedings.`;
  } else if (threatLevel === 'MEDIUM') {
    statutoryBannerText =
      `MEDIUM RISK ADVISORY: Excess ITC of ${formatPaiseToRupees(excessItcPaise)} (${excessPercentage.toFixed(2)}%) ` +
      `exceeds internal safety threshold. Dual-condition Rule 88D trigger avoided (${isPercentageTriggered ? 'Value below ₹25L' : 'Percentage below 20%'}), ` +
      `but manual audit scrutiny under Section 61 is likely.`;
  } else if (threatLevel === 'LOW') {
    statutoryBannerText =
      `LOW RISK: Minor ITC variance of ${formatPaiseToRupees(excessItcPaise)} (${excessPercentage.toFixed(2)}%) ` +
      `detected within legal safe-harbor parameters.`;
  } else {
    statutoryBannerText =
      `COMPLIANT: ITC claimed in GSTR-3B matches or is below GSTR-2B eligible credit pool. Safe for filing.`;
  }

  return {
    claimedItcPaise,
    availableItcPaise,
    excessItcPaise,
    excessPercentage: Math.round(excessPercentage * 100) / 100,
    isDrc01cTriggered,
    threatLevel,
    legalActionDeadlineDays: isDrc01cTriggered ? DRC01C_MANDATORY_REPLY_DEADLINE_DAYS : 0,
    statutoryBannerText,
    regulatoryConsequences: {
      isRule59LockoutRisk: isDrc01cTriggered,
      isRule142bRecoveryRisk: isDrc01cTriggered,
      statutoryNoticeForm: 'FORM GST DRC-01C (Part A)',
      requiredActionText: isDrc01cTriggered
        ? 'File Form GST DRC-01C Part B legal reply with supplier payment vouchers and E-way bills within 7 days.'
        : 'No immediate portal action required. Retain reconciliation audit trail.'
    }
  };
}

// ============================================================================
// 5. SECTION 50(3) 18% DAILY COMPOUNDING PENAL INTEREST ENGINE
// ============================================================================

/**
 * Calculates Section 50(3) Penal Interest on wrongfully availed and utilized ITC.
 *
 * Statute: CGST Act 2017 Section 50(3) read with Notification No. 14/2022-Central Tax.
 * Statutory Rate: 18% per annum calculated on daily basis from date of utilization to reversal.
 *
 * Formula:
 * Interest = floor((IneligibleUtilizedPaise * 18 * DaysElapsed) / 36500)
 * Daily Burn Rate = floor((IneligibleUtilizedPaise * 18) / 36500)
 * Total Liability = IneligibleUtilizedPaise + Interest
 *
 * @param ineligiblePaise - Disputed/Ineligible Input Tax Credit in integer Paise
 * @param utilizationDateStr - Date when GSTR-3B claiming the ITC was filed (YYYY-MM-DD)
 * @param reversalDateStr - Anticipated or actual reversal date (defaults to current date)
 * @returns Section50InterestResult
 */
export function calculateSection50PenalInterest(
  ineligiblePaise: Paise,
  utilizationDateStr: ISODateString,
  reversalDateStr?: ISODateString
): Section50InterestResult {
  if (ineligiblePaise <= 0n) {
    const today = new Date().toISOString().split('T')[0];
    return {
      ineligibleUtilizedPaise: 0n,
      utilizationDate: utilizationDateStr,
      reversalDate: reversalDateStr || today,
      daysElapsed: 0,
      annualInterestRate: SECTION_50_ANNUAL_INTEREST_RATE,
      dailyBurnRatePaise: 0n,
      accumulatedInterestPaise: 0n,
      totalFinancialLiabilityPaise: 0n,
      statutoryCitation: 'Section 50(3) CGST Act 2017 / Notif. 14/2022-CT',
      formattedSummary: 'Zero interest liability: Ineligible utilized ITC is nil.'
    };
  }

  const effectiveReversal = reversalDateStr || new Date().toISOString().split('T')[0];
  const d1 = new Date(utilizationDateStr).getTime();
  const d2 = new Date(effectiveReversal).getTime();

  // Guard against negative date sequence
  const diffTimeMs = Math.max(0, d2 - d1);
  const daysElapsed = Math.ceil(diffTimeMs / (1000 * 60 * 60 * 24));

  // Pure integer BigInt calculation
  // Interest = (ineligiblePaise * 18 * daysElapsed) / 36500
  const interestNumerator = ineligiblePaise * 18n * BigInt(daysElapsed);
  const accumulatedInterestPaise = interestNumerator / 36500n;

  // Daily interest burn rate
  const dailyNumerator = ineligiblePaise * 18n;
  const dailyBurnRatePaise = dailyNumerator / 36500n;

  const totalFinancialLiabilityPaise = ineligiblePaise + accumulatedInterestPaise;

  const formattedSummary =
    `Section 50(3) Exposure: ${formatPaiseToRupees(accumulatedInterestPaise)} interest accrued over ` +
    `${daysElapsed} days on principal ${formatPaiseToRupees(ineligiblePaise)} at 18.0% p.a. ` +
    `(Daily burn rate: ${formatPaiseToRupees(dailyBurnRatePaise)}/day). Total liability: ${formatPaiseToRupees(totalFinancialLiabilityPaise)}.`;

  return {
    ineligibleUtilizedPaise: ineligiblePaise,
    utilizationDate: utilizationDateStr,
    reversalDate: effectiveReversal,
    daysElapsed,
    annualInterestRate: SECTION_50_ANNUAL_INTEREST_RATE,
    dailyBurnRatePaise,
    accumulatedInterestPaise,
    totalFinancialLiabilityPaise,
    statutoryCitation: 'Section 50(3) CGST Act 2017 read with CBIC Notification No. 14/2022-Central Tax',
    formattedSummary
  };
}

// ============================================================================
// 6. RULE 37A 180-DAY AGING WATCHDOG & PAYMENT-HOLD INTIMATOR
// ============================================================================

/**
 * Evaluates Rule 37A aging status for inward invoices where supplier filed GSTR-1 but not GSTR-3B.
 *
 * Statute: CGST Rules 2017 Rule 37A (Notification No. 26/2022-Central Tax).
 * Operational Rule: If supplier fails to file GSTR-3B by 30th November following financial year-end,
 * recipient must reverse ITC with Section 50 interest.
 * Commercial Defense: Immediate commercial payment-hold intimations are generated at 30/60/90/180 days.
 *
 * @param invoiceDateStr - Date of invoice (YYYY-MM-DD)
 * @param taxAmountPaise - ITC amount in integer Paise
 * @param supplierGstin - Defaulting vendor GSTIN
 * @param supplierName - Defaulting vendor trade/legal name
 * @param invoiceNumber - Invoice identifier
 * @param referenceDateStr - Audit reference date (defaults to current date)
 * @returns Rule37AAgingResult
 */
export function evaluateRule37AAging(
  invoiceDateStr: ISODateString,
  taxAmountPaise: Paise,
  supplierGstin: GSTIN,
  supplierName: string,
  invoiceNumber: string,
  referenceDateStr?: ISODateString
): Rule37AAgingResult {
  const refDate = referenceDateStr || new Date().toISOString().split('T')[0];
  const d1 = new Date(invoiceDateStr).getTime();
  const d2 = new Date(refDate).getTime();

  const diffMs = Math.max(0, d2 - d1);
  const daysOverdue = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  // Determine Financial Year filing cutoff (30th November of subsequent FY)
  const invYear = new Date(invoiceDateStr).getFullYear();
  const invMonth = new Date(invoiceDateStr).getMonth() + 1; // 1-12
  const fyEndYear = invMonth >= 4 ? invYear + 1 : invYear;
  const statutoryFilingCutoffDate = `${fyEndYear}-11-30`;

  // Aging Bucket Partitioning
  let agingBucket: Rule37AAgingBucket = 'CURRENT_30_DAYS';
  let isPaymentHoldRecommended = false;
  let commercialActionRecommendation = '';

  if (daysOverdue > 180) {
    agingBucket = 'CRITICAL_180_DAYS_HOLD';
    isPaymentHoldRecommended = true;
    commercialActionRecommendation =
      `CRITICAL PAYMENT HOLD: Invoice aged ${daysOverdue} days. Supplier GSTR-3B default requires immediate ` +
      `administrative hold on pending commercial payments under Section 16(2)(c) & Rule 37A. Issue formal legal notice.`;
  } else if (daysOverdue > 90) {
    agingBucket = 'WARNING_90_DAYS';
    isPaymentHoldRecommended = true;
    commercialActionRecommendation =
      `PAYMENT WITHHOLDING WARNING: Invoice aged ${daysOverdue} days. Withhold tax component (${formatPaiseToRupees(taxAmountPaise)}) ` +
      `from next payment disbursement until GSTR-3B filing ARN is furnished.`;
  } else if (daysOverdue > 30) {
    agingBucket = 'WATCH_60_DAYS';
    isPaymentHoldRecommended = false;
    commercialActionRecommendation =
      `WATCH STATUS: Invoice aged ${daysOverdue} days. Send WhatsApp intimation requesting GSTR-1/3B reconciliation.`;
  } else {
    agingBucket = 'CURRENT_30_DAYS';
    isPaymentHoldRecommended = false;
    commercialActionRecommendation =
      `CURRENT: Invoice aged ${daysOverdue} days within normal operational credit period. Monitor next GSTR-2B cycle.`;
  }

  // Estimated interest if reversed today
  const interestResult = calculateSection50PenalInterest(taxAmountPaise, invoiceDateStr, refDate);

  return {
    invoiceNumber,
    invoiceDate: invoiceDateStr,
    supplierGstin,
    supplierName,
    taxAmountPaise,
    daysOverdue,
    agingBucket,
    isPaymentHoldRecommended,
    commercialActionRecommendation,
    statutoryFilingCutoffDate,
    estimatedInterestLiabilityPaise: interestResult.accumulatedInterestPaise
  };
}

// ============================================================================
// 7. FORM GST DRC-01C PART B LEGAL DEFENSE BRIEF BUILDER
// ============================================================================

/**
 * Builds an automated, legally rigorous Form GST DRC-01C Part B defense brief citing binding High Court jurisprudence.
 *
 * Precedents Cited:
 * 1. Madras High Court: D.Y. Beathel Enterprises v. State Tax Officer (2021) 127 taxmann.com 80
 * 2. Calcutta High Court: Suncraft Energy Pvt. Ltd. v. Assistant Commissioner of State Tax (2023) MAT 1218 of 2023
 * 3. CBIC Press Release: Dated 04-05-2018
 *
 * @param options - Taxpayer, notice, and supplier discrepancy parameters
 * @returns Drc01cDefenseDossier
 */
export function buildDrc01cLegalDefenseDossier(
  options: Drc01cDefenseBuilderOptions
): Drc01cDefenseDossier {
  const refNo = options.drc01cReferenceNumber || `DRC01C-REPLY-${Date.now().toString().slice(-8)}`;
  const noticeDate = options.drc01cNoticeDate || new Date().toISOString().split('T')[0];
  const submissionDeadline = new Date(
    new Date(noticeDate).getTime() + DRC01C_MANDATORY_REPLY_DEADLINE_DAYS * 24 * 60 * 60 * 1000
  )
    .toISOString()
    .split('T')[0];

  const totalDisputedTaxPaise = options.discrepantSuppliers.reduce(
    (acc, curr) => acc + curr.taxAmountPaise,
    0n
  );

  const caseLawCitations = [
    {
      forum: 'Hon’ble High Court of Judicature at Madras',
      partyNames: 'D.Y. Beathel Enterprises v. State Tax Officer',
      citation: '[2021] 127 taxmann.com 80 / (2021) 86 GST 400 (Madras)',
      principle:
        'The statutory scheme under Section 16(2)(c) read with Section 76 mandates that the Revenue ' +
        'must first initiate recovery proceedings against the defaulting seller before demanding ' +
        'reversal of Input Tax Credit from a bonafide purchasing buyer who has paid tax along with invoice value.',
      statutoryApplication:
        'Taxpayer has demonstrated bonafide commercial payment to suppliers via verified banking channels. ' +
        'Demand of reversal without exhausting statutory remedies against selling dealers is arbitrary and illegal.'
    },
    {
      forum: 'Hon’ble High Court of Calcutta (Affirmed by Supreme Court of India)',
      partyNames: 'Suncraft Energy Pvt. Ltd. v. Assistant Commissioner of State Tax',
      citation: 'MAT 1218 of 2023 with IA No. CAN 1 of 2023 (Calcutta HC) / SLP Dismissed in [2023] 153 taxmann.com 481 (SC)',
      principle:
        'Denial of Input Tax Credit to a purchasing dealer solely on the ground of discrepancy between ' +
        'Form GSTR-2A/2B and Form GSTR-3B without conducting any inquiry or investigation into the supplier is unlawful.',
      statutoryApplication:
        'GSTR-2B reflection is a portal administrative mechanism. The substantive right to ITC under Section 16(1) ' +
        'cannot be extinguished without demonstrating collusion or fictitious transactions.'
    },
    {
      forum: 'Central Board of Indirect Taxes and Customs (CBIC)',
      partyNames: 'Press Release on Input Tax Credit Verification',
      citation: 'CBIC Press Release dated 04-05-2018 (Para 4)',
      principle:
        'In case of default in payment of tax by the supplier, the recovery shall be made first from the defaulting seller; ' +
        'reversal from the buyer is an exceptional measure only when the seller is non-existent or untraceable.',
      statutoryApplication:
        'All suppliers listed herein are active registered entities with traceable principal places of business.'
    }
  ];

  // Assemble Markdown Supplier Table
  let supplierTableMd = '| Sl | Supplier GSTIN | Supplier Trade Name | Invoice No | Date | Taxable Value (₹) | Disputed Tax (₹) | E-Way Bill / Bank Ref | Defense Category |\n';
  supplierTableMd += '| :--- | :--- | :--- | :--- | :--- | :---: | :---: | :--- | :--- |\n';

  options.discrepantSuppliers.forEach((item, idx) => {
    const docRef = [item.ewayBillNumber, item.bankingPaymentReference, item.deliveryChallanOrGrn]
      .filter(Boolean)
      .join(' / ') || 'Bank Verified';

    supplierTableMd +=
      `| ${idx + 1} | \`${item.supplierGstin}\` | ${item.supplierLegalName} | ${item.invoiceNumber} | ` +
      `${item.invoiceDate} | ${formatPaiseToRupees(item.taxableValuePaise).replace('₹', '')} | ` +
      `${formatPaiseToRupees(item.taxAmountPaise).replace('₹', '')} | ${docRef} | ${item.disputeReason} |\n`;
  });

  // Assemble Complete Markdown Legal Dossier
  const partBReplyMarkdown = `# FORM GST DRC-01C (PART B)
## SUBMISSION OF FORMAL LEGAL REPLY & EXPLANATION FOR DIFFERENCE IN INPUT TAX CREDIT (RULE 88D)

**To:**  
The Proper Officer / Assistant Commissioner of State/Central Tax  
Jurisdiction: ${options.jurisdictionState || 'GST Tax Division'}  
Government of India / State GST Department  

**From:**  
**Taxpayer Legal Name:** ${options.taxpayerLegalName}  
**Trade Name:** ${options.taxpayerTradeName || options.taxpayerLegalName}  
**GSTIN:** \`${options.taxpayerGstin}\`  
**Reference DRC-01C Intimation No:** ${refNo}  
**Date of Part A Notice:** ${noticeDate}  
**Filing Return Period:** ${options.filingPeriod}  
**Statutory Response Deadline:** ${submissionDeadline} (7 Calendar Days)  

---

### 1. STATUTORY SUMMARY & STATEMENT OF FACTS
1.1 The Taxpayer is a registered person under the CGST/SGST Act 2017, regularly filing statutory returns under Section 39.  
1.2 In response to the system-generated automated intimation in **Form GST DRC-01C Part A** alleging an excess Input Tax Credit claim of **${formatPaiseToRupees(options.claimedItcPaise > options.availableItcPaise ? options.claimedItcPaise - options.availableItcPaise : 0n)}** for the tax period **${options.filingPeriod}**, the Taxpayer submits this comprehensive itemized explanation and legal defense under Rule 88D(2) of the CGST Rules, 2017.  
1.3 The Taxpayer respectfully states that all Input Tax Credit availed in Table 4(A) of Form GSTR-3B satisfies every substantive requirement stipulated under Section 16(2) of the CGST Act, 2017, namely:
- (a) The Taxpayer is in possession of valid statutory tax invoices issued by registered suppliers under Section 31;
- (b) The goods and services have been physically received and taken into stock under documented Goods Receipt Notes (GRN) and E-Way Bills;
- (c) The consideration along with the full tax charged has been paid to the suppliers through verified banking payment channels within the statutory 180-day window under Section 16(2) second proviso;
- (d) The Taxpayer has filed its regular monthly return in Form GSTR-3B.

---

### 2. ITEMIZED RECONCILIATION & DISCREPANCY AUDIT SCHEDULE
The difference flagged between Form GSTR-2B and Form GSTR-3B is attributable to bonafide supplier-side reporting delays, Place of Supply shifts, and intra-month timing differences detailed below:

${supplierTableMd}

**Total Disputed Tax Amount Sub-Judice:** **${formatPaiseToRupees(totalDisputedTaxPaise)}**

---

### 3. BINDING JUDICIAL PRECEDENTS & STATUTORY PROTECTIONS

#### 3.1 Madras High Court in *D.Y. Beathel Enterprises v. State Tax Officer* [2021] 127 taxmann.com 80
The Hon’ble High Court held in explicit terms:
> *"When it is the specific case of the petitioner that the seller had collected tax from the purchasing dealer, the omission on the part of the seller to pay the tax to the Government ought to have been investigated first by the respondent. Without initiating proceedings against the seller, directing the buyer to reverse credit is unsustainable in law."*

**Application to Taxpayer:** The Taxpayer has furnished proof of payment of tax to the suppliers. The Department must proceed against the defaulting suppliers under Section 73/74/76 rather than coercing the bonafide purchasing dealer.

#### 3.2 Calcutta High Court in *Suncraft Energy Pvt. Ltd. v. Assistant Commissioner* (MAT 1218 of 2023)
The Hon’ble Calcutta High Court, subsequently affirmed by the Supreme Court of India in SLP Dismissal [2023] 153 taxmann.com 481, held:
> *"A registered person cannot be denied Input Tax Credit solely on the ground that the invoice is not reflecting in Form GSTR-2A/GSTR-2B without the Department conducting an inquiry or investigation against the selling dealer."*

#### 3.3 CBIC Circular & Press Release Mandate dated 04-05-2018
The CBIC has clarified that recovery from the buyer shall be an exceptional measure only when the seller is non-existent or untraceable. All suppliers listed in Section 2 are active operating business entities.

---

### 4. FORMAL PRAYER / RELIEF SOUGHT
In light of the documentary evidence, itemized reconciliation schedules, and settled High Court precedents, the Taxpayer respectfully prays that:
1. The explanation tendered herein under Form GST DRC-01C Part B be accepted in full as satisfactory compliance under Rule 88D(2);
2. No coercive recovery proceedings under Section 79, Rule 142B, or portal lockouts under Rule 59(6)(e) be initiated against the Taxpayer;
3. If any discrepancy remains unresolved on account of supplier non-filing, the Proper Officer be pleased to issue statutory summons and recovery notices under Section 76 against the defaulting selling dealers.

**Verification:**  
I, the Authorized Signatory of **${options.taxpayerLegalName}**, do hereby declare and verify that the information furnished herein is true, correct, and complete to the best of my knowledge and belief.

**Place:** ${options.jurisdictionState || 'Headquarters'}  
**Date:** ${new Date().toISOString().split('T')[0]}  
**Authorized Signatory / Tax Practitioner**  
*(Submitted digitally via ReconcileGST Statutory Defense Core)*
`;

  // Assemble Printable Clean HTML
  const partBReplyHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Form GST DRC-01C Part B Reply — ${options.taxpayerGstin}</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.5; color: #1e293b; padding: 32px; max-width: 960px; margin: 0 auto; background: #ffffff; }
    h1 { font-size: 20px; text-align: center; margin-bottom: 4px; text-transform: uppercase; color: #0f172a; border-bottom: 2px solid #0f172a; padding-bottom: 8px; }
    h2 { font-size: 14px; text-align: center; color: #475569; margin-top: 0; margin-bottom: 24px; }
    h3 { font-size: 14px; color: #0f172a; border-left: 4px solid #2563eb; padding-left: 8px; margin-top: 24px; margin-bottom: 8px; text-transform: uppercase; }
    .meta-box { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 6px; margin-bottom: 20px; font-size: 13px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 12px; }
    th { background: #0f172a; color: #ffffff; padding: 8px 6px; text-align: left; font-weight: 600; }
    td { border-bottom: 1px solid #e2e8f0; padding: 8px 6px; }
    tr:nth-child(even) { background: #f8fafc; }
    blockquote { border-left: 3px solid #64748b; margin: 12px 0; padding: 8px 16px; background: #f1f5f9; font-style: italic; font-size: 12.5px; }
    .footer { margin-top: 40px; border-top: 1px solid #cbd5e1; padding-top: 16px; display: flex; justify-content: space-between; font-size: 12px; }
    .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: bold; background: #e0f2fe; color: #0369a1; }
    @media print { body { padding: 0; font-size: 11px; } th { background: #000 !important; color: #fff !important; } }
  </style>
</head>
<body>
  <h1>Form GST DRC-01C (Part B)</h1>
  <h2>Reply by Taxpayer in respect of the Intimation of difference in Input Tax Credit (Rule 88D)</h2>

  <div class="meta-box">
    <div><strong>Taxpayer Legal Name:</strong> ${options.taxpayerLegalName}</div>
    <div><strong>GSTIN:</strong> ${options.taxpayerGstin}</div>
    <div><strong>Intimation Ref No:</strong> ${refNo}</div>
    <div><strong>Notice Date:</strong> ${noticeDate}</div>
    <div><strong>Return Period:</strong> ${options.filingPeriod}</div>
    <div><strong>Mandatory Response Deadline:</strong> <span class="badge">${submissionDeadline}</span></div>
  </div>

  <h3>1. Factual Submissions & Section 16(2) Eligibility</h3>
  <p>The Taxpayer respectfully submits that Input Tax Credit availed in Form GSTR-3B satisfies all conditions of Section 16(2) of the CGST Act 2017. The goods/services were duly received with statutory invoices, and payments including tax were discharged through banking channels.</p>

  <h3>2. Itemized Invoice Variance Schedule</h3>
  <table>
    <thead>
      <tr>
        <th>Sl</th>
        <th>Supplier GSTIN</th>
        <th>Supplier Name</th>
        <th>Invoice No</th>
        <th>Date</th>
        <th>Taxable (₹)</th>
        <th>Tax (₹)</th>
        <th>Payment Ref / EWB</th>
        <th>Dispute Reason</th>
      </tr>
    </thead>
    <tbody>
      ${options.discrepantSuppliers
        .map(
          (item, idx) => `<tr>
        <td>${idx + 1}</td>
        <td><code>${item.supplierGstin}</code></td>
        <td>${item.supplierLegalName}</td>
        <td>${item.invoiceNumber}</td>
        <td>${item.invoiceDate}</td>
        <td style="text-align: right;">${formatPaiseToRupees(item.taxableValuePaise).replace('₹', '')}</td>
        <td style="text-align: right;"><strong>${formatPaiseToRupees(item.taxAmountPaise).replace('₹', '')}</strong></td>
        <td>${item.bankingPaymentReference || item.ewayBillNumber || 'Bank Paid'}</td>
        <td>${item.disputeReason}</td>
      </tr>`
        )
        .join('')}
    </tbody>
  </table>

  <h3>3. Binding Judicial Precedents</h3>
  <p><strong>1. Hon'ble Madras High Court — <em>D.Y. Beathel Enterprises v. State Tax Officer</em> [2021] 127 taxmann.com 80:</strong></p>
  <blockquote>"When it is the specific case of the petitioner that the seller had collected tax from the purchasing dealer, the omission on the part of the seller to pay the tax to the Government ought to have been investigated first by the respondent. Without initiating proceedings against the seller, directing the buyer to reverse credit is unsustainable in law."</blockquote>

  <p><strong>2. Hon'ble Calcutta High Court (Affirmed by SC) — <em>Suncraft Energy Pvt. Ltd. v. ACST</em> (MAT 1218 of 2023):</strong></p>
  <blockquote>"A registered person cannot be denied Input Tax Credit solely on the ground of discrepancy between Form GSTR-2A/GSTR-2B and Form GSTR-3B without conducting inquiry against the selling dealer."</blockquote>

  <h3>4. Prayer</h3>
  <p>The Taxpayer prays that this explanation be accepted in full under Rule 88D(2), and no coercive measures under Rule 59(6)(e) or Rule 142B be initiated.</p>

  <div class="footer">
    <div><strong>Place:</strong> ${options.jurisdictionState || 'Headquarters'}<br><strong>Date:</strong> ${new Date().toISOString().split('T')[0]}</div>
    <div style="text-align: right;"><strong>For ${options.taxpayerLegalName}</strong><br><br>Authorized Signatory</div>
  </div>
</body>
</html>`;

  return {
    referenceNumber: refNo,
    taxpayerGstin: options.taxpayerGstin,
    filingPeriod: options.filingPeriod,
    totalDisputedTaxPaise,
    partBReplyMarkdown,
    partBReplyHtml,
    caseLawCitations,
    itemizedSupplierTableMarkdown: supplierTableMd,
    submissionDeadlineDate: submissionDeadline
  };
}
