/**
 * Master Error Catalog & ReconcileError Definition
 * Governed by stage_4_documents/11_error_catalog.md
 */

export type ErrorSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface ErrorMetadata {
  errorCode: string;
  errorMessage: string;
  severity: ErrorSeverity;
  timestamp: string;
  technicalDetails?: Record<string, unknown>;
}

export class ReconcileError extends Error {
  public readonly metadata: ErrorMetadata;

  constructor(
    public readonly code: string,
    message: string,
    details?: Record<string, unknown>,
    severity: ErrorSeverity = 'MEDIUM'
  ) {
    super(message);
    this.name = 'ReconcileError';
    this.metadata = {
      errorCode: code,
      errorMessage: message,
      severity,
      timestamp: new Date().toISOString(),
      technicalDetails: details,
    };
    Object.setPrototypeOf(this, ReconcileError.prototype);
  }
}

/**
 * Standard Error Codes mapped to User Guidance
 */
export const ERROR_CATALOG: Record<string, { title: string; defaultMessage: string; severity: ErrorSeverity; remediation: string }> = {
  ERR_PARSE_001: {
    title: 'Corrupted or Truncated JSON File',
    defaultMessage: 'The uploaded GSTR-2B JSON file appears incomplete or corrupted.',
    severity: 'HIGH',
    remediation: 'Please verify the download from the GST portal and try again (Returns Dashboard -> GSTR-2B -> Download JSON).'
  },
  ERR_PARSE_002: {
    title: 'Malformed CSV / Delimiter Confusion',
    defaultMessage: 'The CSV structure could not be parsed due to ambiguous delimiters.',
    severity: 'MEDIUM',
    remediation: 'Ensure the file uses standard commas, tabs, or semicolons without unescaped line breaks.'
  },
  ERR_PARSE_003: {
    title: 'UTF-8 BOM / Non-UTF-8 Encoding Anomaly',
    defaultMessage: 'Legacy file encoding or Byte Order Mark detected.',
    severity: 'LOW',
    remediation: 'Automatically transcoding to standard UTF-8.'
  },
  ERR_PARSE_004: {
    title: 'Unresolved Mandatory Column Header',
    defaultMessage: 'Could not automatically identify mandatory columns (GSTIN, Invoice No, Taxable Value, etc.).',
    severity: 'HIGH',
    remediation: 'Please ensure column headers match standard ERP exports or map headers in the column mapper drawer.'
  },
  ERR_PARSE_005: {
    title: 'Invalid GSTIN Structural Checksum Failure',
    defaultMessage: 'Found invoices with invalid GSTIN structure.',
    severity: 'MEDIUM',
    remediation: 'Review flagged GSTINs in the audit report; check for typos or incorrect 15-character formats.'
  },
  ERR_PARSE_006: {
    title: 'File Size Limit Exceeded (>100MB)',
    defaultMessage: 'File size exceeds the 100MB recommended browser limit.',
    severity: 'MEDIUM',
    remediation: 'Please export a specific financial year or split the purchase register month-wise.'
  },
  ERR_PARSE_007: {
    title: 'Empty File Ingestion',
    defaultMessage: 'The selected file is empty (0 bytes).',
    severity: 'LOW',
    remediation: 'Please select a valid non-empty GSTR-2B JSON or ERP purchase register file.'
  },
  ERR_PARSE_008: {
    title: 'Unsupported File Extension',
    defaultMessage: 'Unsupported file format.',
    severity: 'LOW',
    remediation: 'ReconcileGST operates on structured Excel (.xlsx, .xls), CSV (.csv), or JSON (.json) files.'
  },
  ERR_MEM_001: {
    title: 'Heap Exhaustion / Out of Memory',
    defaultMessage: 'Browser memory limit reached.',
    severity: 'CRITICAL',
    remediation: 'ReconcileGST is clearing cache and optimizing memory. Please process in smaller date windows if persistent.'
  },
  ERR_MEM_003: {
    title: 'Financial Buffer Boundary Violation',
    defaultMessage: 'Memory index boundary violation during financial vector unpacking.',
    severity: 'HIGH',
    remediation: 'Internal memory guard prevented invalid buffer read.'
  },
  ERR_CALC_001: {
    title: 'Section 170 CGST Act Rounding Delta',
    defaultMessage: 'Statutory rounding difference detected within Section 170 CGST Act parameters.',
    severity: 'LOW',
    remediation: 'Automatically reconciled under Section 170 tolerance (+-Rs 1.00).'
  },
  ERR_CALC_002: {
    title: 'Place of Supply (POS) State Code Inconsistency',
    defaultMessage: 'Place of Supply mismatch detected between ERP and GSTR-2B.',
    severity: 'MEDIUM',
    remediation: 'Recommend Table 9A return amendment as per CBIC Circular No. 160/16/2021-GST.'
  },
  ERR_CALC_003: {
    title: 'Rule 88D DRC-01C Division by Zero',
    defaultMessage: 'Available GSTR-2B ITC is zero while claimed ITC is positive.',
    severity: 'LOW',
    remediation: 'Evaluated excess percentage as 100% and flagged for DRC-01C review.'
  },
  ERR_CALC_004: {
    title: 'Paise Arithmetic Polarity Inversion',
    defaultMessage: 'Document sign inconsistency detected between document type and monetary values.',
    severity: 'MEDIUM',
    remediation: 'Document polarity normalized based on statutory invoice vs credit note classification.'
  }
};
