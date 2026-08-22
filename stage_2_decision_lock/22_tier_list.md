# Feature Tier List (MoSCoW Prioritization & Kano Model Alignment)

**Governing Input:** `stage_2_decision_lock/21_problem_statement.md`  
**Strategic References:** `stage_0_artifacts/03_hard_constraints.md`, `stage_0_artifacts/09_evaluator_model.md`, `stage_1_ideation/12_candidate_E_memo.md`  
**Total Features Evaluated:** 28 Core Capabilities across 8 Architectural Functional Pillars  
**Evaluation Methodology:** MoSCoW Framework cross-validated against the Kano Model (Basic / Expected, Performance / Linear, Delighter / Excitement) and 72-Hour Feasibility Constraints.

---

## Executive Summary & Tier Distribution

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                FEATURE TIER DISTRIBUTION & KANO PROFILE                                │
├─────────────────────┬───────────────┬───────────────────────────────┬──────────────────────────────────┤
│ MoSCoW Tier         │ Feature Count │ Kano Breakdown                │ Engineering Mandate              │
├─────────────────────┼───────────────┼───────────────────────────────┼──────────────────────────────────┤
│ M — Must-Have       │ 14 Features   │ 9 Basic, 5 Performance        │ In-Scope Core MVP (≤70% Capacity)│
│ S — Should-Have     │ 6 Features    │ 2 Performance, 4 Delighters   │ Sprint Stretch Goals (Float Time)│
│ C — Could-Have      │ 4 Features    │ 4 Delighters / Secondary      │ Post-Hackathon Backlog           │
│ W — Won't-Have      │ 4 Features    │ N/A (Explicit Exclusions)     │ Strict Architectural Out-of-Scope│
├─────────────────────┼───────────────┼───────────────────────────────┼──────────────────────────────────┤
│ TOTAL EVALUATED     │ 28 Features   │ 9 Basic, 7 Perf, 8 Delighters │ 100% Traceability to Problem     │
└─────────────────────┴───────────────┴───────────────────────────────┴──────────────────────────────────┘
```

---

## M — Must-Have (14 Features)

> **Definition:** Non-negotiable core capabilities. The project FAILS to solve the core problem statement or violates hard constraints without these features. All Must-Haves belong to Kano *Basic (Must-be)* or *Performance (One-dimensional)* categories.

### 1. Zero-Cloud Local In-Memory Parsing & Storage Pipeline
- **Justification:** Directly solves the DPDP Act 2023 data sovereignty problem by executing 100% of data processing in local browser RAM via the HTML5 `FileReader` API, ensuring zero network bytes egress and zero cloud hosting cost.
- **Kano Classification:** Basic (Expected baseline compliance requirement).
- **Statutory / Technical Alignment:** DPDP Act 2023 Sections 4 & 6; Constraint `CON-PRIV-01`.

### 2. Multi-Format Ingestion (GSTR-2B JSON & Heterogeneous ERP CSV/Excel)
- **Justification:** Solves the core user pain point of disparate data formats between official GSTN portal JSON downloads and heterogeneous ERP purchase registers (Tally, Zoho Books, Busy, SAP, Marg).
- **Kano Classification:** Basic (Fundamental ingestion capability).
- **Statutory / Technical Alignment:** GSTN Schema v1.0; Zod runtime schema validation.

### 3. Universal ERP Column Auto-Mapper with Fuzzy Header Normalization
- **Justification:** Eliminates manual CSV column preparation by automatically mapping vendor-specific ledger headers (e.g., "Party GSTIN", "Inv No", "Total Taxable", "CGST Rate") into a canonical schema.
- **Kano Classification:** Performance (Directly saves CA onboarding time from 15 minutes to under 5 seconds).
- **Statutory / Technical Alignment:** Dictionaries for top 5 Indian accounting packages.

### 4. Integer Paise Fixed-Point Arithmetic via `BigInt64Array`
- **Justification:** Completely eliminates floating-point representation drift (`0.1 + 0.2 != 0.3`) across thousands of aggregated ledger rows, ensuring absolute financial accuracy down to the exact Paise.
- **Kano Classification:** Basic (Non-negotiable accounting integrity).
- **Statutory / Technical Alignment:** Financial accuracy guardrail; Constraint `CON-TECH-06`.

### 5. Inverted Hash Candidate Blocking Partitioning ($O(N+M)$)
- **Justification:** Reduces algorithmic comparison complexity from $O(N \times M)$ (100,000,000 operations for 10k records) to $O(N+M)$ (<20,000 lookups) by indexing invoices on normalized GSTIN/PAN blocks, unlocking sub-300ms execution.
- **Kano Classification:** Performance (Enables lightning-fast compute without browser UI freezing).
- **Statutory / Technical Alignment:** Algorithmic optimization; Constraint `CON-PERF-01`.

### 6. 5-Stage SIMD Cascade: Pass 1 — Deterministic Exact Hash Match
- **Justification:** Instantly resolves 80%+ of compliant invoices on Exact Supplier GSTIN + Invoice Number + Date + Exact Paise Tax Value with zero overhead.
- **Kano Classification:** Basic (Core reconciliation baseline).
- **Statutory / Technical Alignment:** Section 16(2)(aa) verification.

### 7. 5-Stage SIMD Cascade: Pass 2 — Canonical Syntax & Prefix Normalizer
- **Justification:** Recovers false mismatches caused by leading zeros (e.g., `INV-0042` vs `INV-42`), forward/backward slashes, hyphens, and fiscal year prefixes (`23-24/`) introduced by ERP typists.
- **Kano Classification:** Performance (Recovers 8-12% of valid buyer ITC trapped in clerical errors).
- **Statutory / Technical Alignment:** Regular expression canonical syntax normalization.

### 8. Section 170 CGST Act Rounding Tolerance ($\pm ₹1.00$ / 100 Paise)
- **Justification:** Prevents valid invoices from being flagged as discrepancies due to legal decimal rounding variations between buyer and seller ERP software up to the statutory $\pm ₹1.00$ threshold.
- **Kano Classification:** Basic (Direct statutory compliance rule).
- **Statutory / Technical Alignment:** Section 170 CGST Act; Constraint `CON-STAT-03`.

### 9. 5-Stage SIMD Cascade: Pass 3 — SIMD Vectorized Fuzzy Matcher ($\ge 0.85$ Token Score)
- **Justification:** Catches complex typographic typos and OCR OCR errors (e.g., `MH/2026/9081` vs `MH-2026-908l`) using WebAssembly/RapidFuzz SIMD token distance algorithms while keeping false positives below 0.1%.
- **Kano Classification:** Performance (High-precision discrepancy recovery under 50ms).
- **Statutory / Technical Alignment:** RapidFuzz Token Sort / Levenshtein Distance; Constraint `CON-TECH-05`.

### 10. 5-Stage SIMD Cascade: Pass 4 — Tax Head & Place of Supply (POS) Resolver
- **Justification:** Diagnoses interstate vs. intrastate tax allocation errors (e.g., supplier incorrectly booked IGST instead of CGST+SGST), preventing statutory tax rejection under Section 12 of the IGST Act.
- **Kano Classification:** Performance (Prevents incorrect tax head utilization in Form GSTR-3B Table 4).
- **Statutory / Technical Alignment:** IGST Act Section 12; GSTR-3B Table 4(A)(5) validation.

### 11. 60 FPS Virtualized Tabular Grid (TanStack Virtual v3 / TanStack Table v8)
- **Justification:** Keeps the browser interface silky smooth at 60 FPS while displaying 10,000+ to 50,000+ line items by mounting only 25-30 active DOM rows in memory, capping RAM usage under 42MB.
- **Kano Classification:** Basic (UI responsiveness guardrail).
- **Statutory / Technical Alignment:** Constraint `CON-PERF-02` & `CON-PERF-03`.

### 12. Side-by-Side Split Difference Drawer with Character-Level Visual Diffing
- **Justification:** Provides CAs and tax accountants with instant visual inspection of character and numeric discrepancies (red/green character highlights) when investigating mismatched invoices.
- **Kano Classification:** Basic (Essential verification usability).
- **Statutory / Technical Alignment:** Nielsen Norman UX standard; Evaluation Rubric Criteria 3.

### 13. 1-Click "⚡ Load 10,000 Sample Records Demo" Instant Preload Action
- **Justification:** Guarantees an immediate, fail-safe knockout demonstration during jury evaluation by allowing anyone to test a live 10,000-invoice reconciliation with zero setup.
- **Kano Classification:** Basic (Non-negotiable hackathon demonstration requirement).
- **Statutory / Technical Alignment:** Constraint `CON-FEAT-01`; Evaluation Rubric Criteria 1.

### 14. 6-Tab CA Audit-Ready Excel Binary Generator with Embedded Dynamic `=SUMIFS`
- **Justification:** Generates client-side formatted multi-tab Excel workbooks containing live dynamic `=SUMIFS` formulas and color-coded tabs (Summary, Matched, Mismatched, Missing in 2B, Missing in PR, Rule 37A Reversals) for formal CA sign-off.
- **Kano Classification:** Performance (Replaces 40 hours of CA manual spreadsheet assembly with a 2-second download).
- **Statutory / Technical Alignment:** Constraint `CON-FEAT-04`; SheetJS binary builder.

---

## S — Should-Have (6 Features)

> **Definition:** High-value capabilities that dramatically elevate product differentiation and statutory completeness. The system remains operational without them, but they significantly enhance commercial recovery and jury appeal.

### 15. 1-Click Bilingual Hinglish/English WhatsApp Vendor Recovery Bot (`wa.me`)
- **Justification:** Bridges the operational gap between identifying a missing invoice and getting the supplier to fix it by generating deep-linked WhatsApp notices with itemized invoice lists and Section 16(2)(aa) payment-hold clauses.
- **Kano Classification:** Delighter (Transforms passive reporting into active cash-flow recovery; viral growth loop).
- **Statutory / Technical Alignment:** Section 16(2)(aa) notice protocol; Constraint `CON-FEAT-03`.

### 16. Native GSTN IMS (Invoice Management System) Pre-Triage Module
- **Justification:** Implements GSTN Advisory No. 624 & Circular 231/2024 compliance, enabling recipients to assign `ACCEPT`, `REJECT`, or `PENDING` actions before monthly GSTR-2B generation, with automated guards against unlawful Credit Note rejections.
- **Kano Classification:** Delighter (First-to-market statutory alignment with the newly launched 2024-2025 GSTN IMS portal).
- **Statutory / Technical Alignment:** GSTN Circular No. 231/2024; Constraint `CON-STAT-08`.

### 17. Form GSTR-1A Intra-Month Outward Supply Amendment Delta JSON Payload Builder
- **Justification:** Automatically compiles a GSTN-compliant Form GSTR-1A amendment JSON payload containing all missing/mismatched invoices that the defaulting supplier can upload directly to fix their filing before GSTR-3B.
- **Kano Classification:** Delighter (Empowers defaulting vendors to resolve non-compliance in 1 click).
- **Statutory / Technical Alignment:** CBIC Notification No. 12/2024-CT; Constraint `CON-FEAT-06` & `CON-STAT-07`.

### 18. Rule 88D DRC-01C Real-Time Risk & ITC Discrepancy Threat Gauge
- **Justification:** Displays an interactive statutory risk meter tracking ITC variance against the Rule 88D electronic scrutiny threshold (>20% and >₹25 Lakhs), alerting finance managers before filing GSTR-3B.
- **Kano Classification:** Performance (Proactive risk mitigation preventing tax notices and portal lockouts).
- **Statutory / Technical Alignment:** Rule 88D & Rule 59(6)(e); Constraint `CON-FEAT-05` & `CON-STAT-05`.

### 19. Section 50(3) 18% p.a. Compounding Penal Interest Calculator Engine
- **Justification:** Quantifies the exact daily financial liability of claiming ineligible or mismatched ITC, giving CFOs the economic justification to hold vendor payments until resolved.
- **Kano Classification:** Performance (Direct financial impact visibility).
- **Statutory / Technical Alignment:** Section 50(3) CGST Act; Constraint `CON-STAT-02`.

### 20. Automated Form DRC-01C Part B Legal Reply Generator (with High Court Citations)
- **Justification:** Pre-populates ready-to-file legal justification replies citing landmark jurisprudence (*D.Y. Beathel Enterprises* Madras HC 2021 & *Suncraft Energy* Calcutta HC 2023) asserting that tax authorities must pursue defaulting sellers prior to penalizing buyers.
- **Kano Classification:** Delighter (Instant legal defense shielding businesses from arbitrary tax officer recovery).
- **Statutory / Technical Alignment:** Constraint `CON-STAT-09`.

---

## C — Could-Have (4 Features)

> **Definition:** Desirable secondary enhancements. Scheduled for rapid implementation only if core sprint milestones are completed ahead of schedule with zero defect backlog.

### 21. 5-Stage SIMD Cascade: Pass 5 — Rule 37A 180-Day Reversal Ageing Watchdog
- **Justification:** Tracks purchase invoices past 180 days where the supplier has not filed GSTR-3B, warning the buyer of mandatory reversal requirements under Rule 37A.
- **Kano Classification:** Performance / Delighter (Valuable for annual compliance, secondary for intra-month 6-day sprint).
- **Statutory / Technical Alignment:** Rule 37A CGST Rules; Constraint `CON-STAT-04`.

### 22. 1-Click Email Intimation Protocol Generator (`mailto:`)
- **Justification:** Provides an alternative recovery channel for formal corporate vendors who do not use WhatsApp for official accounting correspondence.
- **Kano Classification:** Delighter (Multi-channel communication convenience).
- **Statutory / Technical Alignment:** Standard RFC 6068 `mailto:` URI builder with pre-filled subject and body.

### 23. SHA-256 Audit Trail Cryptographic Hash Fingerprint
- **Justification:** Computes a client-side SHA-256 hash of the reconciliation dataset and output workbook to establish legal tamper-proofing and evidentiary non-repudiation during tax audits.
- **Kano Classification:** Delighter (High-trust enterprise security feature).
- **Statutory / Technical Alignment:** Web Crypto API `crypto.subtle.digest('SHA-256')`.

### 24. Multi-Client CA Practice Workspace Switcher (Local Storage Profile Selector)
- **Justification:** Enables CA practitioners to maintain separate isolated client reconciliation profiles in browser IndexedDB / LocalStorage without mixing financial data.
- **Kano Classification:** Delighter (Convenience for high-volume tax consultants).
- **Statutory / Technical Alignment:** Browser Local Storage partitioning.

---

## W — Won't-Have (4 Explicit Exclusions)

> **Definition:** Explicitly excluded from the current release scope due to hard architectural constraints, data privacy laws, or latency bottlenecks.

### 25. Direct GSTN Portal Cloud Sync (GSP/ASP API Cloud Connect)
- **Justification for Exclusion:** Direct automated sync requires transmitting taxpayer GST credentials and OTPs to remote cloud backend servers. This violates the 100% Zero-Cloud data sovereignty mandate (`CON-PRIV-01`), breaches DPDP Act 2023 client-side exemptions (`CON-PRIV-02`), and incurs costly GSP API licensing fees violating `CON-PRIV-04` (₹0 hosting cost). Taxpayers instead download official JSON/Excel files and parse locally in RAM.
- **Governing Constraints:** `CON-PRIV-01`, `CON-PRIV-02`, `CON-PRIV-04`.

### 26. Centralized Multi-Tenant Cloud Database & Remote User Authentication
- **Justification for Exclusion:** Storing client purchase registers and financial invoices in a centralized cloud PostgreSQL/MongoDB database creates massive compliance liabilities under the DPDP Act 2023 and introduces network egress latency. ReconcileGST is architected as a sovereign zero-data-fiduciary edge web application.
- **Governing Constraints:** `CON-PRIV-01`, `CON-PRIV-02`.

### 27. Cloud-Based Generative AI / Heavy OCR for Scanned Physical Paper Invoices
- **Justification for Exclusion:** Running multi-modal LLMs or cloud Vision OCR (AWS Textract / Google Document AI) on scanned PDF receipts requires 3-5 seconds per page and costs ₹2-5 per invoice, which destroys the sub-300ms latency requirement (`CON-PERF-01`) and zero-cloud infrastructure mandate (`CON-PRIV-04`). ReconcileGST focuses on digital structured outputs (JSON, CSV, Excel) generated by ERPs and GSTN.
- **Governing Constraints:** `CON-PERF-01`, `CON-PRIV-04`.

### 28. Paid SMS Gateway API Integration (Twilio / Karix)
- **Justification for Exclusion:** Third-party SMS gateways require credit card billing, paid per-message fees, DLT template registration, and centralized API keys. ReconcileGST leverages the universally accessible, 100% free client-side WhatsApp `wa.me` deep-linking protocol which generates zero operational costs.
- **Governing Constraints:** `CON-PRIV-04`.

---

## MoSCoW Summary Matrix & Problem Statement Alignment

| Feature ID | Feature Name | MoSCoW Tier | Kano Category | Impact on Core Problem |
|:---|:---|:---:|:---:|:---|
| **F01** | Zero-Cloud Local RAM Pipeline | **Must** | Basic | Eliminates DPDP Act legal liability & data leaks |
| **F02** | Multi-Format Ingestion (JSON/CSV/XLSX) | **Must** | Basic | Resolves disparate portal & ERP data formats |
| **F03** | Universal ERP Column Auto-Mapper | **Must** | Performance | Slashes manual CSV preparation time by 99% |
| **F04** | BigInt64Array Integer Paise Math | **Must** | Basic | Completely eliminates float arithmetic drift |
| **F05** | Inverted Hash Candidate Blocking | **Must** | Performance | Reduces complexity from $O(NM)$ to $O(N+M)$ |
| **F06** | Pass 1: Deterministic Exact Match | **Must** | Basic | Instant sub-50ms matching for 80%+ invoices |
| **F07** | Pass 2: Syntax & Prefix Normalizer | **Must** | Performance | Recovers 10%+ trapped ITC from clerical errors |
| **F08** | Section 170 Rounding ($\pm ₹1$) | **Must** | Basic | Prevents false mismatches on legal round-offs |
| **F09** | Pass 3: SIMD RapidFuzz Vectorized | **Must** | Performance | Resolves typographic & OCR errors in $<50\text{ms}$ |
| **F10** | Pass 4: Tax Head & POS Resolver | **Must** | Performance | Prevents IGST vs CGST/SGST audit rejection |
| **F11** | 60 FPS Virtual Grid (TanStack) | **Must** | Basic | Renders 10k-50k rows with $<42\text{MB}$ RAM |
| **F12** | Side-by-Side Split Diff Drawer | **Must** | Basic | Enables character-level discrepancy inspection |
| **F13** | 1-Click "⚡ Load 10k Records" Demo | **Must** | Basic | Guarantees instant, knockout jury demonstration |
| **F14** | 6-Tab CA Excel Exporter (=SUMIFS) | **Must** | Performance | Replaces 40 hours of manual spreadsheet assembly |
| **F15** | 1-Click Bilingual WhatsApp Bot | **Should** | Delighter | Slashes vendor dispute resolution to 10 minutes |
| **F16** | Native GSTN IMS Pre-Triage Module | **Should** | Delighter | First-to-market compliance with 2024 IMS portal |
| **F17** | Form GSTR-1A Supplier Delta JSON | **Should** | Delighter | Unlocks 1-click outward correction for vendors |
| **F18** | Rule 88D DRC-01C Threat Gauge | **Should** | Performance | Alerts CAs before electronic scrutiny is triggered |
| **F19** | Section 50(3) 18% Interest Engine | **Should** | Performance | Quantifies exact rupee penalty of ineligible ITC |
| **F20** | Form DRC-01C Part B Legal Reply | **Should** | Delighter | Shields businesses with High Court precedents |
| **F21** | Pass 5: Rule 37A Ageing Watchdog | **Could** | Performance | Prevents mandatory 180-day non-filing reversals |
| **F22** | 1-Click Email Intimation (`mailto:`) | **Could** | Delighter | Provides alternative corporate vendor channel |
| **F23** | SHA-256 Audit Cryptographic Hash | **Could** | Delighter | Guarantees legal evidentiary tamper-proofing |
| **F24** | Multi-Client CA Practice Switcher | **Could** | Delighter | Multi-profile convenience for accounting firms |
| **F25** | Direct GSTN Portal Cloud Sync | **Won't** | N/A | Excluded: Violates zero-cloud DPDP mandate |
| **F26** | Cloud Multi-Tenant SQL Database | **Won't** | N/A | Excluded: Violates zero-cloud data privacy |
| **F27** | Cloud GenAI / OCR for Paper Receipts | **Won't** | N/A | Excluded: Violates <300ms & zero-cost constraints |
| **F28** | Paid SMS Gateway API | **Won't** | N/A | Excluded: Violates zero-cost infrastructure mandate |
