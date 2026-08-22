# Problem Statement: ReconcileGST

## 1. The User and Their Need (Point of View)
- **User:** Indian MSME finance controllers and Chartered Accountants (CAs) managing monthly B2B inward purchase registers across disparate ERPs (Tally, Zoho Books, Busy, SAP, Marg).
- **Need:** Deterministically reconcile messy purchase invoices against government Form GSTR-2B in milliseconds, resolve statutory discrepancies, and trigger instant vendor recovery actions before monthly tax filing.
- **Insight:** Under Section 16(2)(aa) and Rule 88D of the CGST Act, provisional credit is 0%. Even trivial vendor non-filing or typographical mismatches during the high-pressure 6-day window (14th to 20th) freeze buyer working capital, trigger 18% p.a. penal interest under Section 50(3), and incur automated Form GST DRC-01C scrutiny notices.
- **User-Need Statement:** "Indian MSME finance controllers and Chartered Accountants need to deterministically reconcile monthly purchase registers against Form GSTR-2B in seconds and trigger immediate vendor recovery actions, because statutory 0% provisional credit rules under Section 16(2)(aa) and automated Rule 88D DRC-01C notices penalize innocent buyers with frozen cash flows and compounding 18% penal interest when suppliers fail to report invoices correctly."

## 2. The Broader Problem (Context → Problem → Impact)
- **Context (Situation):** Every month between the 14th (GSTR-2B release) and 20th (GSTR-3B deadline), 1.45 Crore Indian GST taxpayers and 4.2 Lakh CA firms face the 144-hour "6-Day Squeeze." CAs manually cross-reference messy ERP purchase ledgers against portal JSON data using fragile Excel VLOOKUP formulas.
- **Problem (Complication):** Typographical anomalies (leading zeros, prefixes), ₹1 rounding differences, tax head splits (IGST vs. CGST/SGST), and supplier non-filing create massive reconciliation backlogs. Existing cloud tax tools take 30–90 seconds to process files, cost up to ₹50,000 annually, upload sensitive financial ledgers to remote servers in violation of the DPDP Act 2023, and lack closed-loop vendor dispute resolution workflows.
- **Impact (Consequences):** Over ₹45,000 Crore in legitimate buyer Input Tax Credit is trapped nationwide annually, averaging ₹1.80 Lakhs per MSME. Taxpayers face automated Rule 88D DRC-01C demands, mandatory 18% interest under Section 50(3), billing lockouts under Rule 59(6)(e), and direct bank attachments under Rule 142B (DRC-01D). CAs lose 40+ billable hours per client monthly on manual reconciliation.

## 3. The Goal
Deliver a 100% zero-cloud, client-side web application that reconciles 10,000+ invoices in under 300 milliseconds using SIMD-accelerated Web Workers, provides GSTN IMS pre-triage and DRC-01C risk defense, and automates 1-click bilingual Hinglish WhatsApp recovery to eliminate ITC leakage in minutes.
