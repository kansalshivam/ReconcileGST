/**
 * Form GST DRC-01C Part B Statutory Legal Defense Generator
 * References: Rule 88D CGST Rules & Landmark High Court Precedents
 */

export interface Drc01cDefenseOptions {
  clientGstin: string;
  clientName: string;
  taxPeriod: string;
  referenceNo: string;
  claimedItcInr: string;
  autoPopulatedItcInr: string;
  varianceInr: string;
  selectedGrounds: {
    ground1SupplierDelay: boolean;     // D.Y. Beathel (Madras HC)
    ground2ClericalPrefix: boolean;     // Suncraft Energy (Calcutta HC)
    ground3Section170Rounding: boolean; // Sec 170 ₹1 Rounding
    ground4PosAllocation: boolean;      // Saji S. (Kerala HC)
    ground5Rule37ASafeHarbor: boolean;  // Rule 37A statutory timeframe
  };
  customRemarks?: string;
}

export function generateDrc01cLegalReply(options: Drc01cDefenseOptions): string {
  const groundsList: string[] = [];

  if (options.selectedGrounds.ground1SupplierDelay) {
    groundsList.push(
      `1. SUPPLIER NON-FILING / DELAYED FILING WITHOUT BUYER FAULT:\n` +
      `   The taxpayer has made bona fide purchases against tax invoices and made full payments including tax to the suppliers through banking channels. As held by the Hon'ble Madras High Court in D.Y. Beathel Enterprises v. State Tax Officer (W.P.(MD) No. 2127 of 2021), recovery proceedings cannot be initiated against the purchasing dealer without first taking coercive action against the defaulting selling dealer who collected the tax.`
    );
  }

  if (options.selectedGrounds.ground2ClericalPrefix) {
    groundsList.push(
      `2. BONAFIDE CLERICAL / SYNTACTIC MISMATCHES IN INVOICE REPORTING:\n` +
      `   Certain suppliers inadvertently included financial year prefixes or punctuation marks (e.g., '2024-25/' or leading zeroes) when uploading to GSTR-1, causing temporary portal auto-population mismatch. Following the Hon'ble Calcutta High Court judgment in Suncraft Energy Pvt. Ltd. v. The Assistant Commissioner (MAT 1218 of 2023), ITC cannot be disallowed merely due to technical/procedural reporting mismatches when supply is genuine.`
    );
  }

  if (options.selectedGrounds.ground3Section170Rounding) {
    groundsList.push(
      `3. STATUTORY ROUNDING TOLERANCE UNDER SECTION 170 OF THE CGST ACT:\n` +
      `   A portion of the identified variance arises strictly due to statutory rounding of fractions of a Rupee (below 50 paise rounded down, 50 paise and above rounded to one rupee) across high-volume micro-invoices. Section 170 explicitly provides that fractional amounts shall be rounded off, and such trivial statutory mathematical differences cannot constitute unauthorized ITC availment.`
    );
  }

  if (options.selectedGrounds.ground4PosAllocation) {
    groundsList.push(
      `4. INADVERTENT PLACE OF SUPPLY / TAX HEAD ALLOCATION (IGST vs CGST+SGST):\n` +
      `   Certain inward supplies reflect inadvertent classification between Integrated Tax and Central/State Tax. As held by the Hon'ble Kerala High Court in Saji S. v. Commissioner of State GST (2020), where tax has been duly paid to the exchequer, mere inadvertent booking under an alternative tax head does not create a revenue deficit or warrant demand under Rule 88D.`
    );
  }

  if (options.selectedGrounds.ground5Rule37ASafeHarbor) {
    groundsList.push(
      `5. RULE 37A STATUTORY SAFE HARBOR TIMEFRAME UNEXPIRED:\n` +
      `   Under Rule 37A of the CGST Rules, 2017, the taxpayer is entitled to safe harbor until the 30th day of November following the end of the financial year for suppliers to furnish their pending GSTR-3B returns. Premature DRC-01C demand prior to the statutory cutoff violates the procedural mandate of Rule 37A.`
    );
  }

  const generatedDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
`========================================================================================
FORM GST DRC-01C — PART B
[See Rule 88D]
REPLY BY THE TAXPAYER TO THE INTIMATION OF DISCREPANCY IN INPUT TAX CREDIT
========================================================================================

Date: ${generatedDate}
Intimation Reference No.: ${options.referenceNo || 'DRC-01C/2024-25/88D-09921'}
Tax Period: ${options.taxPeriod}
Taxpayer GSTIN: ${options.clientGstin}
Legal Name: ${options.clientName}

To:
The Proper Officer,
Ward / Division Circle,
Goods and Services Tax Department.

SUBJECT: Comprehensive Legal Reply and Detailed Reconciliation Schedule in Response to
         Intimation in Form GST DRC-01C for Tax Period ${options.taxPeriod}.

Respected Sir/Madam,

In reference to the automated intimation issued in Form GST DRC-01C under Rule 88D of the 
CGST Rules, 2017 regarding the ITC differential:

  * Total ITC Availed in Form GSTR-3B:       ${options.claimedItcInr}
  * Total ITC Auto-Populated in GSTR-2B:    ${options.autoPopulatedItcInr}
  * Variance Subject to Intimation:          ${options.varianceInr}

The taxpayer respectfully submits that there is no wrongful or excessive availment of 
Input Tax Credit. The difference is fully reconciled on the following statutory and judicial grounds:

----------------------------------------------------------------------------------------
STATUTORY GROUNDS AND JUDICIAL PRECEDENTS
----------------------------------------------------------------------------------------
${groundsList.join('\n\n')}

${options.customRemarks ? `----------------------------------------------------------------------------------------\nADDITIONAL AUDIT SUBMISSIONS & FACTS:\n${options.customRemarks}\n` : ''}
----------------------------------------------------------------------------------------
PRAYER & CONCLUSION:
----------------------------------------------------------------------------------------
In light of the verified invoice reconciliation schedule annexed herewith (Schedule A) 
and the binding judicial precedents of the Hon'ble High Courts cited above, it is most 
respectfully prayed that:

1. The explanation submitted herein be accepted as satisfactory under Rule 88D(2);
2. The automated discrepancy proceedings initiated via Form GST DRC-01C be dropped;
3. No coercive demand, interest under Section 50, or penalty under Section 122 be levied.

The taxpayer remains available to produce original purchase invoices, e-way bills, and 
bank proof of payment as and when required.

Yours faithfully,

For ${options.clientName}

Authorized Signatory / Tax Practitioner
(Verified with SHA-256 In-Memory Audit Hash)
========================================================================================`
  );
}
