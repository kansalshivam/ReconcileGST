/**
 * @file ims-triage.ts
 * @module ReconcileGST/ImsTriage
 * @description GSTN Invoice Management System (IMS) Advisory No. 624 / CBIC Circular No. 231/2024
 * Pre-Triage State Machine, Batch Action Engine, and Mandatory Two-Step Credit Note Rejection
 * Safety Interceptor.
 *
 * @statutory_rules
 * - GSTN IMS Advisory No. 624 (Invoice Management System Implementation)
 * - CBIC Circular No. 231/2024-GST (IMS Pre-Triage & Outward Tax Liability Impact)
 * - Two-Step Credit Note Safety Lock: Rejecting a Credit Note (CRN/CDNR) inflates the supplier's
 *   outward tax liability in GSTR-1B/3B. Direct unconfirmed rejection is blocked at engine level.
 */

import { Paise, GSTIN, formatPaiseToRupees } from './statutory-sentinel';

// ============================================================================
// 1. DOMAIN ENUMS & TYPES
// ============================================================================

/**
 * GSTN IMS Action States mandated by Advisory 624.
 */
export type ImsAction = 'NONE' | 'ACCEPT' | 'REJECT' | 'PENDING';

/**
 * GST Inward Document Classifications.
 */
export type DocumentType = 'INV' | 'CRN' | 'DBN' | 'CDNR' | 'CDNUR';

/**
 * Rejection reason code for CA audit trail.
 */
export type ImsRejectionReasonCode =
  | 'SUPPLIER_INVOICE_NOT_RECEIVED'
  | 'WRONG_GSTIN_BILLED'
  | 'DUPLICATE_INVOICE_REPORTED'
  | 'COMMERCIAL_PRICE_DISPUTE'
  | 'GOODS_REJECTED_QUALITY'
  | 'TAX_RATE_MISMATCH'
  | 'CREDIT_NOTE_UNAUTHORIZED'
  | 'OTHER_CA_REASON';

/**
 * Immutable entity representing the IMS action state of an inward invoice.
 */
export interface ImsInvoiceState {
  readonly invoiceId: string;
  readonly invoiceNumber: string;
  readonly documentType: DocumentType;
  readonly supplierGstin: GSTIN;
  readonly supplierName: string;
  readonly invoiceDate: string; // YYYY-MM-DD
  readonly taxableValuePaise: Paise;
  readonly taxPaise: Paise;
  readonly igstPaise: Paise;
  readonly cgstPaise: Paise;
  readonly sgstPaise: Paise;
  readonly cessPaise: Paise;
  readonly currentState: ImsAction;
  readonly previousState?: ImsAction;
  readonly updatedAt: number; // Unix Epoch Milliseconds
  readonly rejectionReasonCode?: ImsRejectionReasonCode;
  readonly rejectionRemarks?: string;
  readonly caRemarks?: string;
  readonly isCreditNoteOverrideConfirmed?: boolean;
  readonly auditHistory: Array<{
    readonly timestamp: number;
    readonly fromState: ImsAction;
    readonly toState: ImsAction;
    readonly actorRemarks?: string;
  }>;
}

/**
 * Result payload returned from state transition attempts.
 */
export interface ImsTransitionResult {
  readonly success: boolean;
  readonly newState: ImsInvoiceState;
  readonly requiresModalWarning: boolean;
  readonly warningType?: 'CREDIT_NOTE_REJECTION_HAZARD' | 'ALREADY_ACCEPTED' | 'INVALID_ACTION';
  readonly errorMessage?: string;
  readonly statutoryAdvisory?: string;
}

/**
 * Aggregated summary metrics for active IMS triage session.
 */
export interface ImsTriageSummary {
  readonly totalDocumentsCount: number;
  readonly acceptedCount: number;
  readonly rejectedCount: number;
  readonly pendingCount: number;
  readonly unactionedCount: number;

  // Financial aggregates in integer Paise
  readonly acceptedTaxPaise: Paise;
  readonly rejectedTaxPaise: Paise;
  readonly pendingTaxPaise: Paise;
  readonly unactionedTaxPaise: Paise;
  readonly netEligibleGstr2bItcPaise: Paise;

  // Credit Note safety statistics
  readonly creditNotesTotalCount: number;
  readonly creditNotesRejectedCount: number;
  readonly creditNotesAcceptedCount: number;
  readonly supplierLiabilityInflationExposurePaise: Paise;
}

// ============================================================================
// 2. IMS STATE MACHINE & CREDIT NOTE SAFETY GUARD
// ============================================================================

export class ImsStateMachine {
  /**
   * Identifies whether a document classification represents a Credit Note.
   */
  public static isCreditNote(docType: DocumentType): boolean {
    return docType === 'CRN' || docType === 'CDNR';
  }

  /**
   * Applies an IMS state transition with strict statutory invariant validation.
   *
   * Statutory Rule (Circular 231/2024):
   * Rejecting a Credit Note increases the supplier's outward tax liability.
   * If documentType is CRN/CDNR and targetAction is REJECT, explicit confirmation
   * (explicitCrnOverride === true) is strictly required.
   *
   * @param current - Current invoice IMS state
   * @param targetAction - Desired IMS target state (ACCEPT | REJECT | PENDING | NONE)
   * @param explicitCrnOverride - Secondary confirmation token for Credit Note rejections
   * @param remarks - Optional CA remarks or audit justification
   * @param rejectionReasonCode - Required statutory rejection code if action is REJECT
   * @returns ImsTransitionResult
   */
  public static transition(
    current: ImsInvoiceState,
    targetAction: ImsAction,
    explicitCrnOverride = false,
    remarks?: string,
    rejectionReasonCode?: ImsRejectionReasonCode
  ): ImsTransitionResult {
    // 1. Idempotency Check
    if (current.currentState === targetAction) {
      return {
        success: true,
        newState: current,
        requiresModalWarning: false,
        statutoryAdvisory: `Document ${current.invoiceNumber} is already in ${targetAction} state.`
      };
    }

    // 2. Mandatory Two-Step Credit Note Rejection Safety Interceptor
    const isCn = this.isCreditNote(current.documentType);
    if (isCn && targetAction === 'REJECT' && !explicitCrnOverride) {
      return {
        success: false,
        newState: current,
        requiresModalWarning: true,
        warningType: 'CREDIT_NOTE_REJECTION_HAZARD',
        errorMessage:
          `GSTN Circular 231/2024 Safety Intercept: Rejecting Credit Note '${current.invoiceNumber}' ` +
          `(${formatPaiseToRupees(current.taxPaise)}) will automatically INCREASE supplier (${current.supplierGstin}) ` +
          `outward tax liability in GSTR-1B/3B. Two-step Chartered Accountant confirmation is mandatory.`,
        statutoryAdvisory:
          `Statutory Impact: Rejection disallows the supplier's outward tax reduction. Confirm if goods were NOT returned ` +
          `or if the credit note was erroneously issued.`
      };
    }

    // 3. Compile New State with Full Audit Trail
    const now = Date.now();
    const updatedHistory = [
      ...current.auditHistory,
      {
        timestamp: now,
        fromState: current.currentState,
        toState: targetAction,
        actorRemarks: remarks || (isCn && explicitCrnOverride ? 'Confirmed via 2-Step CA Safety Override' : undefined)
      }
    ];

    const updatedState: ImsInvoiceState = {
      ...current,
      previousState: current.currentState,
      currentState: targetAction,
      updatedAt: now,
      caRemarks: remarks || current.caRemarks,
      rejectionReasonCode: targetAction === 'REJECT' ? rejectionReasonCode : undefined,
      rejectionRemarks: targetAction === 'REJECT' ? remarks : undefined,
      isCreditNoteOverrideConfirmed: isCn && targetAction === 'REJECT' ? explicitCrnOverride : current.isCreditNoteOverrideConfirmed,
      auditHistory: updatedHistory
    };

    let advisory = '';
    if (targetAction === 'ACCEPT') {
      advisory = `Accepted: Credit of ${formatPaiseToRupees(current.taxPaise)} will flow directly into Form GSTR-2B Table 3.`;
    } else if (targetAction === 'REJECT') {
      advisory = isCn
        ? `Warning: Credit Note rejected with 2-step override. Supplier outward tax liability increased by ${formatPaiseToRupees(current.taxPaise)}.`
        : `Rejected: Inward credit disallowed. Tax liability retained with supplier ${current.supplierGstin}.`;
    } else if (targetAction === 'PENDING') {
      advisory = `Pending: Document held in staging area; credit deferred to next monthly GSTR-2B filing cycle.`;
    } else {
      advisory = `Reset: Document restored to default unactioned staging state.`;
    }

    return {
      success: true,
      newState: updatedState,
      requiresModalWarning: false,
      statutoryAdvisory: advisory
    };
  }
}

// ============================================================================
// 3. IMS IN-MEMORY SESSION STORE & RECONCILIATION INTEGRATOR
// ============================================================================

export class ImsSessionStore {
  private items: Map<string, ImsInvoiceState> = new Map();

  /**
   * Initializes or loads a collection of inward invoices into the IMS staging store.
   */
  public loadInvoices(invoices: ImsInvoiceState[]): void {
    this.items.clear();
    for (const inv of invoices) {
      this.items.set(inv.invoiceId, inv);
    }
  }

  /**
   * Adds or updates a single invoice in the IMS session store.
   */
  public upsertInvoice(invoice: ImsInvoiceState): void {
    this.items.set(invoice.invoiceId, invoice);
  }

  /**
   * Retrieves an invoice by its unique identifier.
   */
  public getInvoice(invoiceId: string): ImsInvoiceState | undefined {
    return this.items.get(invoiceId);
  }

  /**
   * Returns all items currently in the IMS triage staging registry.
   */
  public getAllInvoices(): ImsInvoiceState[] {
    return Array.from(this.items.values());
  }

  /**
   * Applies an action to a specific invoice ID.
   */
  public applyAction(
    invoiceId: string,
    action: ImsAction,
    explicitCrnOverride = false,
    remarks?: string,
    reasonCode?: ImsRejectionReasonCode
  ): ImsTransitionResult {
    const existing = this.items.get(invoiceId);
    if (!existing) {
      return {
        success: false,
        newState: {
          invoiceId,
          invoiceNumber: 'UNKNOWN',
          documentType: 'INV',
          supplierGstin: '',
          supplierName: '',
          invoiceDate: '',
          taxableValuePaise: 0n,
          taxPaise: 0n,
          igstPaise: 0n,
          cgstPaise: 0n,
          sgstPaise: 0n,
          cessPaise: 0n,
          currentState: 'NONE',
          updatedAt: Date.now(),
          auditHistory: []
        },
        requiresModalWarning: false,
        errorMessage: `Invoice ID '${invoiceId}' not found in IMS active session.`
      };
    }

    const result = ImsStateMachine.transition(existing, action, explicitCrnOverride, remarks, reasonCode);
    if (result.success) {
      this.items.set(invoiceId, result.newState);
    }
    return result;
  }

  /**
   * Applies a batch action across multiple invoices. Automatically intercepts and skips
   * Credit Notes when attempting batch rejection without explicit override.
   *
   * @returns Array of transition results and a summary of actions executed
   */
  public batchApplyAction(
    invoiceIds: string[],
    action: ImsAction,
    explicitCrnOverride = false,
    remarks?: string
  ): {
    results: Map<string, ImsTransitionResult>;
    totalProcessed: number;
    totalSuccess: number;
    blockedCreditNotesCount: number;
  } {
    const results = new Map<string, ImsTransitionResult>();
    let totalSuccess = 0;
    let blockedCreditNotesCount = 0;

    for (const id of invoiceIds) {
      const existing = this.items.get(id);
      if (!existing) continue;

      // Check if it's a blocked Credit Note rejection
      if (ImsStateMachine.isCreditNote(existing.documentType) && action === 'REJECT' && !explicitCrnOverride) {
        blockedCreditNotesCount++;
      }

      const res = this.applyAction(id, action, explicitCrnOverride, remarks);
      results.set(id, res);
      if (res.success) {
        totalSuccess++;
      }
    }

    return {
      results,
      totalProcessed: invoiceIds.length,
      totalSuccess,
      blockedCreditNotesCount
    };
  }

  /**
   * Computes live aggregated financial summary metrics across all IMS records.
   */
  public getSummary(): ImsTriageSummary {
    let totalCount = 0;
    let acceptedCount = 0;
    let rejectedCount = 0;
    let pendingCount = 0;
    let unactionedCount = 0;

    let acceptedTaxPaise = 0n;
    let rejectedTaxPaise = 0n;
    let pendingTaxPaise = 0n;
    let unactionedTaxPaise = 0n;

    let creditNotesTotalCount = 0;
    let creditNotesRejectedCount = 0;
    let creditNotesAcceptedCount = 0;
    let supplierLiabilityInflationExposurePaise = 0n;

    for (const inv of this.items.values()) {
      totalCount++;
      const isCn = ImsStateMachine.isCreditNote(inv.documentType);
      if (isCn) {
        creditNotesTotalCount++;
      }

      switch (inv.currentState) {
        case 'ACCEPT':
          acceptedCount++;
          // Credit notes reduce tax, standard invoices add tax
          if (isCn) {
            creditNotesAcceptedCount++;
            acceptedTaxPaise -= inv.taxPaise;
          } else {
            acceptedTaxPaise += inv.taxPaise;
          }
          break;

        case 'REJECT':
          rejectedCount++;
          rejectedTaxPaise += inv.taxPaise;
          if (isCn) {
            creditNotesRejectedCount++;
            supplierLiabilityInflationExposurePaise += inv.taxPaise;
          }
          break;

        case 'PENDING':
          pendingCount++;
          pendingTaxPaise += inv.taxPaise;
          break;

        case 'NONE':
        default:
          unactionedCount++;
          unactionedTaxPaise += inv.taxPaise;
          break;
      }
    }

    const netEligibleGstr2bItcPaise = acceptedTaxPaise > 0n ? acceptedTaxPaise : 0n;

    return {
      totalDocumentsCount: totalCount,
      acceptedCount,
      rejectedCount,
      pendingCount,
      unactionedCount,
      acceptedTaxPaise,
      rejectedTaxPaise,
      pendingTaxPaise,
      unactionedTaxPaise,
      netEligibleGstr2bItcPaise,
      creditNotesTotalCount,
      creditNotesRejectedCount,
      creditNotesAcceptedCount,
      supplierLiabilityInflationExposurePaise
    };
  }

  /**
   * Filters the session store by specific action state.
   */
  public filterByState(state: ImsAction): ImsInvoiceState[] {
    return Array.from(this.items.values()).filter((inv) => inv.currentState === state);
  }

  /**
   * Serializes the current IMS triage session into JSON for local export / audit checkpoint.
   */
  public exportStateJson(): string {
    const list = Array.from(this.items.values()).map((item) => ({
      ...item,
      taxableValuePaise: item.taxableValuePaise.toString(),
      taxPaise: item.taxPaise.toString(),
      igstPaise: item.igstPaise.toString(),
      cgstPaise: item.cgstPaise.toString(),
      sgstPaise: item.sgstPaise.toString(),
      cessPaise: item.cessPaise.toString()
    }));
    return JSON.stringify({ version: 'IMS_SESSION_v1.0', exportedAt: Date.now(), items: list }, null, 2);
  }

  /**
   * Deserializes and loads an IMS triage state JSON.
   */
  public importStateJson(jsonStr: string): void {
    const parsed = JSON.parse(jsonStr);
    if (!parsed.items || !Array.isArray(parsed.items)) {
      throw new Error('Invalid IMS session JSON payload.');
    }
    this.items.clear();
    for (const raw of parsed.items) {
      const inv: ImsInvoiceState = {
        ...raw,
        taxableValuePaise: BigInt(raw.taxableValuePaise || '0'),
        taxPaise: BigInt(raw.taxPaise || '0'),
        igstPaise: BigInt(raw.igstPaise || '0'),
        cgstPaise: BigInt(raw.cgstPaise || '0'),
        sgstPaise: BigInt(raw.sgstPaise || '0'),
        cessPaise: BigInt(raw.cessPaise || '0')
      };
      this.items.set(inv.invoiceId, inv);
    }
  }
}
