# Master Structured Brief — Stage 0 Final Synthesis (ReconcileGST)

**Document ID:** `stage_0_artifacts/11_structured_brief.md`  
**Compilation Date:** 2026-08-21T21:06:50+05:30  
**Project Title:** ReconcileGST — Automated Inward GST Input Tax Credit (ITC) Reconciliation, DRC-01C Compliance & Defaulting Vendor Recovery Engine  
**Team Name:** Binary Brains  
**Team Leader:** Shivam Kansal  
**Team Members:** Shivam Kansal (TL), Shivanya Agarwal, Akriti Sengar, Archi Snehi, Akansha Kumari, Suraj Prajapati  
**Project Mentor:** Dr. / Prof. Mukesh Saraswat  
**Hackathon:** Smart India Hackathon (SIH) 2026 — Software Track (Internal Selection Date: August 24, 2026)  
**Governing Documents (The Immutable Bible):** `ReconcileGST SIH2026.pptx`, `ReconcileGST SIH2026.pdf`, `RECONCILEGST_MASTER_BLUEPRINT.md`  

---

## 1. Executive Problem Dossier & The "6-Day Squeeze"

Every month across India, **1.45 Crore registered GST taxpayers** (including **82 Lakh active B2B MSMEs**) and **4.2 Lakh Chartered Accountant (CA) firms** face an intense operational bottleneck between the 14th (GSTR-2B generation) and the 20th (GSTR-3B self-assessment filing) known as the **"6-Day Squeeze"**:

```
 ┌───────────────────────────────────────────────────────────────────────────────────────┐
 │                               THE MONTHLY TAX CALENDAR CRUNCH                         │
 ├───────────────────┬───────────────────────────────────┬───────────────────────────────┤
 │ 11th of the Month │ 14th of the Month                 │ 20th of the Month             │
 ├───────────────────┼───────────────────────────────────┼───────────────────────────────┤
 │ Suppliers file    │ GST Portal auto-generates         │ Taxpayers MUST file GSTR-3B   │
 │ Form GSTR-1       │ Form GSTR-2B (Static Inward ITC)  │ (Self-Assessment & Tax Pay)   │
 └───────────────────┴───────────────────────────────────┴───────────────────────────────┘
                     ▲                                   ▲
                     └────── 6-DAY SQUEEZE WINDOW ───────┘
                         • 40+ hours manual Excel VLOOKUP
                         • ₹45,000 Cr trapped ITC across India
                         • Automated Rule 88D DRC-01C notices
                         • 18% p.a. penal interest risk
```

### Statutory Ground Reality:
1. **Section 16(2)(aa) of the CGST Act (effective 01-Jan-2022):** A buyer *cannot legally claim* Input Tax Credit unless the supplier has uploaded the invoice in their GSTR-1 and it appears in the buyer's auto-drafted **GSTR-2B**. Provisional credit is **0%**.
2. **Rule 88D & Form GST DRC-01C:** The GST portal algorithmically issues electronic scrutiny notices if ITC claimed in GSTR-3B exceeds GSTR-2B. Unanswered notices within 7 days trigger **Rule 59(6)(e) outbound GSTR-1 billing lockouts**, halting all business sales.
3. **Section 50(3) & Rule 142B:** Unpaid discrepancies face **18% compounding interest** and summary bank attachments in **Form GST DRC-01D** without a prior Show Cause Notice.
4. **Rule 37A:** If a supplier fails to file GSTR-3B by Sept 30/Nov 30, the buyer must reverse claimed ITC with interest.

---

## 2. The Solution: ReconcileGST Core Value Proposition

**ReconcileGST** is a zero-cloud, client-side web application and automation engine engineered for Indian MSMEs, Chartered Accountants, and tax practitioners that:
1. **Local Memory Ingestion:** Ingests government GSTR-2B JSON and ERP purchase registers (Tally, Zoho Books, Busy, SAP, Marg) directly into browser RAM via the HTML5 `FileReader` API.
2. **Sub-300ms 5-Stage SIMD Matching Waterfall:** Executes candidate blocking ($O(N+M)$) and multi-pass matching for 10,000+ invoices in <300ms using multi-threaded Web Workers and flat `BigInt64Array` buffers in integer Paise precision.
3. **Native GSTN IMS Pre-Triage:** Allows recipients to Accept, Reject, or Keep Pending inward supplies before monthly GSTR-2B generation, with strict credit note rejection safeguards.
4. **1-Click Multi-Channel Dispute Intimation:** Deep-links pre-formatted bilingual Hinglish/English notices via WhatsApp and Email directly to defaulting vendors, achieving a **90%+ response rate within 10 minutes**.
5. **Closed-Loop Statutory Compliance:** Auto-generates Form GSTR-1A delta JSON payloads for suppliers and 6-tab color-coded CA Audit-Ready Excel workbooks with embedded `=SUMIFS` formulas.

---

## 3. Comprehensive Synthesis of Stage 0 Artifacts

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                STAGE 0 ARTIFACT KNOWLEDGE GRAPH                                  │
├────────────────────────────────┬────────────────────────────────┬────────────────────────────────┤
│ Artifact                       │ Canonical Findings & Contents  │ Downstream Impact              │
├────────────────────────────────┼────────────────────────────────┼────────────────────────────────┤
│ 00_raw_input_consolidated.md   │ Verbatim PPTX deck + Blueprint │ 100% Truth Source (The Bible)  │
│ 01_explicit_requirements.md    │ 41 Traced Requirements (FR/NFR)│ Drives System Architecture     │
│ 02_implicit_requirements.md    │ 22 Derived QA/DevOps Specs     │ Eliminates Failure Modes       │
│ 03_hard_constraints.md         │ DPDP Act Zero-Cloud & 60 FPS   │ Non-Negotiable Boundaries      │
│ 04_organizational_context.md   │ SIH 2026, AICTE, Viksit Bharat │ National Vision Alignment      │
│ 05_historical_analysis.md      │ GST Compliance Shifts 2020-26  │ Explains "Why Now" Urgency     │
│ 06_winner_analysis.md          │ National Winner Teardowns      │ 1-Click Demo "X-Factor"        │
│ 07_judging_rubric.md           │ 100-Mark Rubric Breakdown      │ Scoring Optimization           │
│ 08_evaluator_profiles.md       │ Mendelow's Power/Interest Grid │ Defense & Jury Tactics         │
│ 09_evaluator_model.md          │ Empirical Shadow Rubric        │ True Scoring Predictor         │
│ 10_flags_and_contradictions.md │ 18 Resolved Failure Modes      │ Zero-Drift Engineering Quality │
└────────────────────────────────┴────────────────────────────────┴────────────────────────────────┘
```

---

## 4. The 5-Stage Cascade Matching Algorithm & Mathematical Design

```
                     ┌────────────────────────────────────────────────────────┐
                     │ DUAL INGESTION: GSTR-2B JSON + Tally Purchase Register │
                     └───────────────────────────┬────────────────────────────┘
                                                 │
                                                 ▼
                     ┌────────────────────────────────────────────────────────┐
                     │ STAGE 1: Candidate Blocking via GSTIN Hash Partitioning│
                     └───────────────────────────┬────────────────────────────┘
                                                 │
      ┌──────────────────────────────────────────┴──────────────────────────────────────────┐
      │                                                                                     │
      ▼                                                                                     ▼
┌───────────────┐                                                                     ┌───────────┐
│ Pass 1: Exact │ ──[ Match Found (Exact Inv# + Value + Date) ]──────────────────────►│  MATCHED  │
└───────┬───────┘                                                                     │   (100%)  │
        │ No Match                                                                    └───────────┘
        ▼
┌───────────────┐
│ Pass 2: Regex │ ──[ Match Found (Strip Prefix/Delimiters + Sec 170 ±₹1.00) ]───────►│  MATCHED  │
└───────┬───────┘                                                                     │  (SYNTAX) │
        │ No Match                                                                    └───────────┘
        ▼
┌───────────────┐
│ Pass 3: SIMD  │ ──[ Match Found (Damerau-Levenshtein / Jaro-Winkler ≥ 0.85) ]──────►│   FUZZY   │
└───────┬───────┘                                                                     │  MATCHED  │
        │ No Match                                                                    └───────────┘
        ▼
┌───────────────┐
│ Pass 4: POS   │ ──[ Same Value, Swapped Tax Heads (IGST vs CGST+SGST) ]────────────►│ POS SWAP  │
└───────┬───────┘                                                                     │  (TAB 9A) │
        │ No Match                                                                    └───────────┘
        ▼
┌───────────────┐
│ Pass 5: Rule  │ ──[ Missing in GSTR-2B / Unfiled > 180 Days ]──────────────────────►│  BLOCKED  │
│  37A Watchdog │                                                                     │ DEFAULTER │
└───────────────┘                                                                     └───────────┘
```

### Algorithmic Pass Details:
1. **Stage 1 (Inverted Index Candidate Blocking):** Invoices partitioned into hash maps keyed by Normalized Supplier GSTIN/PAN: $\text{Index}(\text{GSTIN}) \to [\text{Inv}_1, \dots]$. Reduces search space by **99.95%**, dropping execution time to **<25ms**.
2. **Pass 1 (Deterministic Exact Match):** $O(1)$ match on $\text{GSTIN} \land \text{InvNum} \land \text{Paise}(V) \land \text{Date}$.
3. **Pass 2 (Canonical Syntax Normalization & Section 170 Tolerance):** Strips prefixes (`INV/`, `BILL-`, `TAX-`, `VCH-`, `PUR/`), delimiters (`/`, `-`, `_`, space), FY tokens (`2024-25`, `26-27`), removes leading zeroes (`0089` $\to$ `89`), with Section 170 $\pm ₹1.00$ tolerance.
4. **Pass 3 (SIMD-Accelerated Fuzzy String Matching):** RapidFuzz Damerau-Levenshtein & Jaro-Winkler similarity ($\ge 0.85$) within sliding date window ($\pm 31\text{ to }\pm 90\text{ days}$).
5. **Pass 4 (Tax Head & Place of Supply Resolution):** Identifies $\text{IGST} \leftrightarrow (\text{CGST} + \text{SGST})$ swaps and flags for Form GSTR-1 Table 9A amendment without credit reversal.
6. **Pass 5 (Rule 37A Ageing & Defaulter Isolation):** Sorts missing invoices into 30d/60d/90d/180d buckets to trigger commercial payment-holds before statutory credit reversal.

---

## 5. Technical Architecture & Tech Stack Matrix

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                     TECHNICAL STACK MATRIX                                       │
├──────────────────────┬──────────────────────────────────────────┬────────────────────────────────┤
│ Layer                │ Technology Choice                        │ Architectural Purpose          │
├──────────────────────┼──────────────────────────────────────────┼────────────────────────────────┤
│ UI Framework         │ Next.js 14 (App Router), React 18, TS    │ Fast SSR shell, CSR Worker host│
│ Styling & UI         │ Tailwind CSS, Shadcn UI, Lucide Icons    │ High-contrast dark/fintech UI  │
│ Grid Virtualization  │ TanStack Virtual v3 & TanStack Table v8  │ 60 FPS smooth for 100,000 rows │
│ Heavy Computation    │ Web Workers + WASM / RapidFuzz           │ Multi-threaded non-blocking CPU│
│ Binary Data Engines  │ SheetJS (xlsx) + Flat BigInt64Array      │ Zero float drift (Paise level) │
└──────────────────────┴──────────────────────────────────────────┴────────────────────────────────┘
```

### Complete Target File Structure:
```
c:\Users\nnipu\Downloads\ReconcileGST\
├── app/
│   ├── layout.tsx                # App shell, fonts, metadata
│   ├── page.tsx                  # Master Dashboard (Dropzone, KPIs, Grid, Action Suite)
│   └── globals.css               # Tailwind CSS & theme tokens
├── components/
│   ├── ui/                       # Shadcn UI primitives (Button, Card, Badge, Modal, Tabs)
│   ├── DropzoneZone.tsx          # Dual drag-and-drop ingestion container + 1-Click Demo button
│   ├── KpiSummaryCards.tsx       # Live KPI cards (Matched ITC, Risk, DRC-01C Gauge)
│   ├── VirtualReconTable.tsx     # TanStack Virtual v3 virtualized data grid with status chips
│   ├── SideBySideInspector.tsx   # Split difference drawer (Tally vs 2B)
│   ├── WhatsAppModal.tsx         # 1-Click WhatsApp notice preview & deep-link launcher
│   └── ExportToolbar.tsx         # Download CA Audit Excel & Form GSTR-1A Delta JSON
├── lib/
│   ├── types.ts                  # Inward invoice, 2B JSON schema, and Recon result types
│   ├── parser-gstr2b.ts          # Streaming GSTR-2B JSON schema parser
│   ├── parser-tally.ts           # Universal ERP columnar parser (Tally/Zoho/Busy/SAP)
│   ├── matching-engine.ts        # 5-Stage Cascade Waterfall Algorithm
│   ├── excel-exporter.ts         # 6-Tab CA Audit Workbook Generator
│   ├── gstr1a-generator.ts       # Supplier GSTR-1A Delta JSON payload builder
│   └── sample-data.ts            # Preloaded 10,000-invoice demo dataset for instant demo
└── public/
    └── workers/
        └── recon-worker.ts       # Web Worker multi-threaded execution thread
```

---

## 6. Business Impact, TAM & Market Sizing

* **Total Addressable Market (TAM):** **₹12,100 Crore ($1.45B)** in India across 1.45 Crore registered taxpayers (82 Lakh B2B MSMEs) and 4.2 Lakh CA firms.
* **Quantified ROI per MSME:** Unlocks average **₹1.8 Lakhs working capital** annually; prevents sudden bank attachments under Rule 142B and 18% penal interest.
* **Quantified Efficiency for CAs:** Slashes monthly reconciliation audit time from **40 hours to under 5 minutes** (>95% time reduction).
* **Freemium B2B Open-Core Model:** Free offline local reconciler $\to$ ₹999/mo SME Pro $\to$ ₹4,999/mo CA Multi-Client Bureau Vault, delivering **LTV:CAC of 57:1** with **85%+ gross margins** due to zero server compute costs.

---

## 7. Stage 0 Verification & Final Validation Sign-Off

<VALIDATION>
- [x] `00_raw_input_consolidated.md` exists and contains 47.2k characters of unaltered verbatim canonical source text.
- [x] `01_explicit_requirements.md` exists with 41 traced requirements and exact source quotes.
- [x] `02_implicit_requirements.md` exists with 22 derived requirements across QA/DevOps/PM personas.
- [x] `03_hard_constraints.md` exists with high-visibility non-negotiable project boundaries.
- [x] `04_organizational_context.md` to `08_evaluator_profiles.md` exist and provide comprehensive context intelligence.
- [x] `09_evaluator_model.md` exists with empirical Shadow Rubric and psychological defense scripts.
- [x] `10_flags_and_contradictions.md` exists with 18 cataloged and architecturally resolved risks.
- [x] `11_structured_brief.md` exists as the authoritative single entry point.
- [x] `BUILD_LOG.md` and `HANDOFF.md` updated and synchronized.
</VALIDATION>

Stage 0 is **100% COMPLETE, VERIFIED, AND FINALIZED**.
