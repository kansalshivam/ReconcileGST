# ⚠️ HARD CONSTRAINTS — Non-Negotiable Project Boundaries

> **GOVERNANCE DIRECTIVE:** These constraints govern **ALL** subsequent architectural, design, engineering, and implementation decisions. Any proposed design, tech choice, data flow, or implementation that violates even a single hard constraint is **automatically rejected**.

**Project Title:** ReconcileGST — Automated Inward GST ITC Reconciliation, DRC-01C Compliance & Defaulting Vendor Recovery Engine  
**Extraction Date:** 2026-08-21T20:50:00+05:30  
**Source Document:** `stage_0_artifacts/00_raw_input_consolidated.md`  
**Classification:** Canonical & Non-Negotiable Reference  

---

## 1. Executive Constraint Governance Framework

ReconcileGST operates under strict regulatory, architectural, and operational guardrails. Every constraint documented herein is derived directly from verified source materials (SIH 2026 Submission Deck, Master Architecture Blueprint, Conversation Directives, and Statutory Dossiers).

```
   ┌─────────────────────────────────────────────────────────────────────────┐
   │                       HARD CONSTRAINT HIERARCHY                         │
   ├─────────────────────────────────────────────────────────────────────────┤
   │  LEVEL 1: STATUTORY & LEGAL MANDATES (DPDP Act 2023, CGST Act & Rules)  │
   │  LEVEL 2: PROJECT SUBMISSION & BLUEPRINT BIBLE (SIH Deck, Team Identity)│
   │  LEVEL 3: HARDWARE & EXECUTION TIMELINE (Aug 24 2026, Browser RAM Exec) │
   │  LEVEL 4: TECHNOLOGY STACK MANDATES (Next.js 14, Web Workers, RapidFuzz)│
   │  LEVEL 5: DATA SCHEMAS & INTEROPERABILITY (GSTN v1.0, Tally/Zoho/SAP)   │
   └─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Category 1: Deadlines, Schedule & Performance Constraints

| Constraint ID | Constraint Definition | Exact Source Quote | Architectural & System Impact |
|:---|:---|:---|:---|
| **CON-SCHED-01** | **Internal Hackathon Milestone Date:** August 24, 2026 | `"Presentation / Submission Date: August 24, 2026"`<br>`"Target internal hackathon demonstration on August 24, 2026."` | All functional modules, UI, demo data, and verification suites must be complete, tested, and demo-ready before August 24, 2026. |
| **CON-SCHED-02** | **48-Hour Implementation Plan Execution** | `"48-Hour Implementation Plan"` | Development stages must adhere strictly to the phased 48-hour build pipeline without scope inflation. |
| **CON-PERF-01** | **Deterministic Algorithmic Execution Speed (<300ms for 10k Invoices)** | `"Executes a 5-stage cascade matching algorithm in <300ms for 10,000 invoices using Web Workers and SIMD string algorithms."`<br>`"Benchmarked at 0.24s for 10,000 invoices and 0.34s for 50,000 invoices with zero GPU or costly third-party API dependencies."` | Compute operations cannot execute on the main thread. Ingestion, candidate blocking, and string comparisons must run in background Web Workers utilizing flat typed buffers. |
| **CON-PERF-02** | **60 FPS Virtualized Grid Rendering** | `"TanStack Virtual v3 & TanStack Table v8 (rendering 100,000+ rows smoothly at 60 FPS via DOM windowing, mounting only 25 elements)."` | Absolute requirement to virtualize large tabular datasets. The DOM must never render raw array maps exceeding the viewport buffer (cap at ~25-30 mounted DOM nodes). |
| **CON-PERF-03** | **Peak Client Memory Footprint (<88MB RAM)** | `"Multi-threaded Web Workers with flat TypedArrays and TanStack DOM virtualization mount only 25 elements, maintaining 60 FPS under <88MB peak RAM."` | Memory allocations must use flat columnar `BigInt64Array` / `Float64Array` buffers in Paise to eliminate V8 GC pauses and memory bloat. |

---

## 3. Category 2: Technology Stack & Architectural Tooling Mandates

| Constraint ID | Constraint Definition | Exact Source Quote | Architectural & System Impact |
|:---|:---|:---|:---|
| **CON-TECH-01** | **Frontend Application Framework:** Next.js 14 (App Router) + React 18 | `"Frontend & UI Layer: Next.js 14 (App Router), React 18, Tailwind CSS, Shadcn UI, Lucide Icons."` | Strict ban on Pages Router or alternative SPA frameworks (Vue, Angular, Svelte, Remix). Must use Next.js 14 App Router conventions. |
| **CON-TECH-02** | **Styling & Design System:** Tailwind CSS + Shadcn UI + Lucide Icons | `"Tailwind CSS, Shadcn UI, Lucide Icons."` | UI components must strictly use Tailwind utility styling, Radix-based Shadcn primitives, and Lucide React icons. No external heavy CSS frameworks. |
| **CON-TECH-03** | **Type Safety:** TypeScript Strict Mode | `"TypeScript"` | TypeScript is required across all modules with strict type checking enabled; no implicit `any` in core financial/matching engines. |
| **CON-TECH-04** | **Virtualized Grid Engine:** TanStack Virtual v3 & TanStack Table v8 | `"Virtualized Data Grid: TanStack Virtual v3 & TanStack Table v8"` | All data tables for ERP purchase registers, GSTR-2B records, and reconciliation outputs must use `@tanstack/react-table` v8 and `@tanstack/react-virtual` v3. |
| **CON-TECH-05** | **Multi-Threaded In-Browser Engine:** Web Workers + WASM / RapidFuzz | `"High-Speed Matching Engine: Web Workers + WebAssembly (WASM) / Python with RapidFuzz (C++ SIMD-accelerated Levenshtein, Jaro-Winkler, Token Sort Ratio)."` | Heavy reconciliation computation must be isolated inside dedicated Web Workers with WebAssembly/RapidFuzz SIMD algorithms. Main thread remains 100% responsive. |
| **CON-TECH-06** | **Fixed-Point Precision Engine (Paise Representation):** BigInt64Array | `"In-Memory Ingestion: Streaming JSON/CSV tokenization into flat columnar TypedArrays (BigInt64Array in Paise precision to eliminate float drift)."` | Floating-point financial arithmetic is strictly forbidden in reconciliation calculations. All monetary values must be stored and computed as integer Paise (1 INR = 100 Paise). |
| **CON-TECH-07** | **In-Memory Partitioning Engine:** GSTIN Candidate Blocking Map | `"Candidate Blocking: Inverted hash map partitioned by Supplier GSTIN/PAN, reducing comparison complexity by 99.95%."` | Direct $O(N \times M)$ cross-product searches are prohibited. Reconciliation must first partition records into an inverted hash table keyed by normalized Supplier GSTIN/PAN. |
| **CON-TECH-08** | **Excel Generation Engine:** SheetJS (`xlsx`) / ExcelJS Binary Generator | `"Multi-Tab Excel Exporter: SheetJS / ExcelJS binary generator creating 6-tab color-coded CA audit-ready workbooks with embedded SUMIFS formulas."` | Excel export must generate binary `.xlsx` files client-side with 6 color-coded tabs and native formulas without backend roundtrips. |

---

## 4. Category 3: Data Privacy, Sovereignty & Zero-Cloud Mandate

| Constraint ID | Constraint Definition | Exact Source Quote | Architectural & System Impact |
|:---|:---|:---|:---|
| **CON-PRIV-01** | **Zero Cloud Transmission (0 Bytes Financial Data on Remote Servers)** | `"Zero-Cloud Local Compute Engine: 100% in-browser processing via WebAssembly/Web Workers; 0 bytes of sensitive ledger data uploaded to remote servers, ensuring full DPDP Act 2023 compliance."` | Absolute prohibition against sending invoice payloads, GSTINs, vendor names, or ledger records to any cloud API or database. Zero backend storage of user financial data. |
| **CON-PRIV-02** | **Digital Personal Data Protection (DPDP) Act 2023 Compliance (Sec 4 & 6)** | `"Digital Personal Data Protection (DPDP) Act, 2023: Sections 4 & 6 data fiduciary privacy exemptions for client-side edge computation."` | Architecture must qualify as a Zero-Data-Fiduciary client tool; all processing occurs locally on user hardware. |
| **CON-PRIV-03** | **Local In-Memory File Processing via HTML5 FileReader API** | `"Processes files in local browser RAM via HTML5 FileReader API; zero bytes transmitted to external clouds."` | File parsing must occur strictly via browser FileReader / Stream APIs into ephemeral RAM buffers. |
| **CON-PRIV-04** | **Zero-Infrastructure Cloud Cost Footprint** | `"Because 99% of compute executes in the user's browser, server hosting costs are virtually ₹0/user"` | System architecture cannot rely on paid cloud worker clusters or scalable GPU backends for processing user reconciliations. |

---

## 5. Category 4: PPT & Blueprint Alignment & Project Identity

| Constraint ID | Constraint Definition | Exact Source Quote | Architectural & System Impact |
|:---|:---|:---|:---|
| **CON-DOC-01** | **Canonical Reference Status of PPT & Blueprint (The Bible)** | `"Status: Canonical & Non-Negotiable Reference"`<br>`"Stick strictly to the PPT and Blueprint as the immutable Bible."` | Every feature, terminology, formula, algorithm stage, and UI element described in the PPT deck and Master Blueprint is mandatory. No arbitrary scope modifications. |
| **CON-ID-01** | **Official Problem Statement Title & Track** | `"Problem Statement Title: ReconcileGST – Automated Inward GST Input Tax Credit (ITC) Reconciliation, DRC-01C Compliance & Defaulting Vendor Recovery Engine for MSMEs and CAs"`<br>`"PS Category: Software Track"` | UI header, documentation, metadata, and export artifacts must display the exact official Problem Statement title and Software Track classification. |
| **CON-ID-02** | **Canonical Team Identity & Roster** | `"Team Name: Binary Brains"`<br>`"Project Mentor: Dr. / Prof. Mukesh Saraswat"`<br>`"Team Members: 1. Shivam Kansal (Team Leader), 2. Shivanya Agarwal, 3. Akriti Sengar, 4. Archi Snehi, 5. Akansha Kumari, 6. Suraj Prajapati"` | All presentation screens, about modals, metadata headers, and generated audit dossiers must attribute project ownership accurately to Binary Brains and its registered members. |
| **CON-FEAT-01** | **1-Click Live Demo Dataset Button** | `"Provide a 1-click live demo dataset button so the jury sees instantaneous execution."` | UI must include a prominent one-click action that instantly loads a realistic pre-configured dataset (GSTR-2B + Purchase Register) and triggers immediate reconciliation. |
| **CON-FEAT-02** | **5-Stage Cascade Waterfall Algorithm** | `"5-Stage SIMD Matching Waterfall: Exact Hash Join -> Canonical Syntax Normalization -> SIMD Fuzzy Matching -> POS Tax Head Resolution -> Rule 37A Ageing Watchdog with Section 170 ₹1.00 tolerance."` | The core reconciliation engine must strictly implement all 5 discrete stages in sequential order with status classification tags. |
| **CON-FEAT-03** | **1-Click WhatsApp & Email Vendor Intimation Engine** | `"Generates 1-Click WhatsApp & Email Recovery Intimations in bilingual Hinglish/English to defaulting vendors, achieving a 90%+ response rate within 10 minutes."` | UI must generate deep-linked WhatsApp web links (`https://wa.me/...?text=...`) and `mailto:` links with pre-filled bilingual Hinglish/English itemized notice templates. |
| **CON-FEAT-04** | **6-Tab CA Audit-Ready Excel Workbook Generation** | `"SheetJS / ExcelJS binary generator creating 6-tab color-coded CA audit-ready workbooks with embedded SUMIFS formulas."` | Output Excel workbook must contain exactly 6 standardized, color-coded tabs (e.g., Executive Summary, Full Matches, Value Mismatches, Missing in 2B, Missing in PR, Rule 37A Reversals) with dynamic SUMIFS formulas. |
| **CON-FEAT-05** | **Live DRC-01C Risk Gauge & Part B Justification Annexure** | `"Step 4 (Dispatch & Export): Live DRC-01C Risk Gauge + 1-Click WhatsApp intimation + 6-tab CA Audit Excel download."`<br>`"automated DRC-01C Part B legal justification annexures."` | Dashboard must feature an interactive DRC-01C risk meter displaying ITC variance against threshold triggers and export ready-to-file Form DRC-01C Part B legal replies. |
| **CON-FEAT-06** | **Form GSTR-1A Supplier Delta JSON Generator** | `"Auto-generates Form GSTR-1A Delta JSON for suppliers"` | Engine must generate valid GSTN-compliant Form GSTR-1A amendment JSON payloads for missing/mismatched supplier invoices. |

---

## 6. Category 5: Statutory Rules, Tax Acts & Financial Mathematics Formulas

| Constraint ID | Statutory Reference & Rule | Exact Source Quote | Mathematical / Algorithmic Hard Rule | Architectural Impact |
|:---|:---|:---|:---|:---|
| **CON-STAT-01** | **CGST Act Sec 16(2)(aa)** | `"Section 16(2)(aa) (Mandatory GSTR-2B reflection)"` | $\text{Eligible\_ITC} = \begin{cases} \text{Claimable} & \text{if Invoice} \in \text{GSTR-2B}_{\text{itcavl}=\text{'Y'}} \\ 0 & \text{if Invoice} \notin \text{GSTR-2B} \end{cases}$ | ITC claim eligibility is strictly contingent on vendor GSTR-1 filing reflected in GSTR-2B. Invoices in Purchase Register but missing in GSTR-2B must be flagged as "Supplier Default / Blocked ITC". |
| **CON-STAT-02** | **CGST Act Sec 50(3)** | `"Section 50(3) (18% interest on utilized ITC)"`<br>`"Prevention of 18% Penalties: Eliminates statutory compounding interest demands under Section 50(3)"` | $\text{Interest Liability} = \text{Ineligible\_ITC} \times 18\% \times \left(\frac{\text{Days}}{365}\right)$ | Ineligible or mismatched ITC that is claimed in GSTR-3B incurs 18% per annum statutory interest; engine must display potential compounding penalty exposure. |
| **CON-STAT-03** | **CGST Act Sec 170** | `"Section 170 (Rounding of tax to nearest Rupee)"`<br>`"±₹1.00 roundoff"` | $|\Delta\text{Tax}| = |\text{Tax}_{\text{PR}} - \text{Tax}_{\text{2B}}| \le ₹1.00 \ (100\text{ Paise}) \implies \text{Match}$ | Pass 2 matching must treat tax amount differences $\le 100\text{ Paise}$ as valid matches with a round-off flag rather than an amount mismatch error. |
| **CON-STAT-04** | **CGST Rules Rule 37A** | `"Rule 37A (Reversal of ITC for supplier non-filing)"`<br>`"Pass 5 (Rule 37A Watchdog): Ageing tracker identifying invoices pending > 180 days at risk of mandatory reversal."` | $\text{Ageing Days} = \text{Current Date} - \text{Invoice Date}$<br>$\text{If } \text{Ageing Days} > 180 \land \text{Supplier Unpaid/Unfiled} \implies \text{Mandatory Reversal}$ | Pass 5 Ageing Watchdog must flag purchase invoices older than 180 days as mandatory reversals under Rule 37A with statutory reversal tax computation. |
| **CON-STAT-05** | **CGST Rules Rule 88D & Form DRC-01C** | `"Rule 88D & Form GST DRC-01C (Automated ITC discrepancy notice)"` | $\text{Discrepancy} = \text{ITC}_{\text{Claimed(3B)}} - \text{ITC}_{\text{Available(2B)}}$<br>$\text{If } \text{Discrepancy} > \text{Threshold } (20\% \text{ and } > ₹25\text{ Lakhs}) \implies \text{DRC-01C High Risk}$ | Real-time gauge must track variance against Rule 88D risk thresholds and generate DRC-01C Part B legal justification annexure with standardized reason codes. |
| **CON-STAT-06** | **CGST Rules Rule 59(6)(e) & Rule 142B** | `"Rule 59(6)(e) (GSTR-1 portal lockout), Rule 142B & Form GST DRC-01D (Direct summary recovery without SCN)."` | $\text{Non-Compliance Severity} \ge \text{Threshold} \implies \text{Vendor GSTR-1 Lockout Risk}$ | Risk engine must flag chronic defaulting vendors whose non-compliance risks immediate GSTR-1 outward filing suspension and direct recovery under DRC-01D. |
| **CON-STAT-07** | **CBIC Notif. 12/2024-CT (Form GSTR-1A)** | `"CBIC Notification No. 12/2024-CT (July 2024): Notification of Form GSTR-1A intra-month outward supply amendment facility."` | $\text{Payload} = \text{Schema}_{\text{GSTR-1A}}(\text{Missing / Mismatched Invoices})$ | System must produce standard GSTR-1A amendment payloads allowing suppliers to amend their GSTR-1 before filing GSTR-3B within the same tax period. |
| **CON-STAT-08** | **GSTN IMS Advisory No. 624 & Circular 231/2024** | `"GSTN Advisory No. 624 / Circular No. 231/2024: Architecture and business rules of the Invoice Management System (IMS)."`<br>`"Features native pre-triage for the government's Invoice Management System (IMS) (Accept, Reject, Keep Pending)."` | $\text{Action} \in \{\text{ACCEPT}, \text{REJECT}, \text{PENDING}\}$ | Every matched or mismatched invoice must maintain an immutable IMS action status conforming to GSTN IMS workflow rules and exportable as an IMS action batch file. |
| **CON-STAT-09** | **Judicial Precedents (D.Y. Beathel & Suncraft)** | `"Madras High Court in D.Y. Beathel Enterprises (2021) & Calcutta High Court in Suncraft Energy (2023) on recipient ITC protection and mandatory investigation of defaulting suppliers before recipient recovery."` | $\text{Legal Defense} = \text{Citation}(\text{D.Y. Beathel, Suncraft}) \to \text{Demand Supplier Action First}$ | DRC-01C reply annexure generator and legal notice builder must incorporate statutory defense citations establishing that tax authorities must initiate recovery against defaulting suppliers prior to recipient reversal. |

---

## 7. Category 6: Input Data Schemas & Interoperability Boundaries

| Constraint ID | Constraint Definition | Exact Source Quote | Architectural & System Impact |
|:---|:---|:---|:---|
| **CON-SCHEMA-01** | **GSTN Official GSTR-2B JSON API Schema v1.0** | `"Official GSTR-2B JSON API Schema v1.0 (b2b, b2ba, cdnr, cdnra, itcavl)."` | Ingestion parser must natively parse the official GSTN GSTR-2B JSON schema arrays: `b2b` (B2B invoices), `b2ba` (amendments), `cdnr` (credit/debit notes), `cdnra` (note amendments), and validate `itcavl` ('Y'/'N') and `rsn` (reason codes). |
| **CON-SCHEMA-02** | **Universal ERP Ingestion (Tally, Zoho Books, Busy, SAP, Marg)** | `"Universal ERP Compatibility: Natively parses standard exports from Tally Prime, Tally ERP 9, Busy, Zoho Books, Marg, and SAP without requiring manual column remapping."` | Ingestion engine must provide an automated fuzzy column header mapper recognizing standard header aliases (e.g. `Vch No`, `Invoice No`, `Bill No`, `Party GSTIN`, `Taxable Value`, `Integrated Tax Amount`, `Central Tax Amount`, `State Tax Amount`). |
| **CON-SCHEMA-03** | **Dual Drag-and-Drop Ingestion Interface** | `"Step 1 (Ingestion): Dual drag-and-drop ingestion of GSTR-2B JSON + Tally/Zoho/Busy/SAP Purchase Register CSV/Excel."` | The UI must provide a dual drag-and-drop dropzone supporting direct drop of GSTR-2B JSON/ZIP and ERP Purchase Register CSV/XLSX. |

---

## 8. Summary Traceability Matrix

```
┌──────────────┬───────────────────────────────┬───────────────────────────────┬───────────────────────────────┐
│ Category     │ Total Constraints Identified  │ Governing Standard / Source   │ Enforcement Mechanism         │
├──────────────┼───────────────────────────────┼───────────────────────────────┼───────────────────────────────┤
│ Schedule     │ 5 (Milestones & Latency)      │ SIH 2026 Submission Date      │ Performance benchmarks & timer│
│ Tech Stack   │ 8 (Frameworks & Libraries)    │ Slide 3 Tech Approach         │ Package.json & TypeScript AST │
│ Data Privacy │ 4 (Zero-Cloud & DPDP)         │ DPDP Act 2023 Sec 4 & 6       │ Network request monitor & CSP │
│ Presentation │ 6 (Team, Roster & Features)   │ Slide 1-2 & Master Blueprint  │ UI Metadata & Component Audit │
│ Statutory    │ 9 (Acts, Rules, Court Rulings)│ CGST Act 2017 & Rules 2017    │ Fixed-point unit math tests   │
│ Schemas      │ 3 (GSTN & ERP Models)         │ GSTN API v1.0 & TDL Schemas   │ Zod schema validation suite   │
└──────────────┴───────────────────────────────┴───────────────────────────────┴───────────────────────────────┘
```

---

## 9. Architectural Guardrails & Enforcement Directives

1. **Client-Side Sandbox Rule:**
   - Any code introducing an HTTP endpoint that forwards parsed purchase register rows or GSTR-2B raw tables to a remote server is a **P0 Critical Defect** and violates `CON-PRIV-01`.
2. **Integer Arithmetic Rule:**
   - All tax math and invoice aggregations must use integer Paise (`BigInt` / Paise arithmetic). Division or float calculations must only occur at the final display formatting boundary (`Paise / 100`).
3. **No Unvirtualized Large Lists:**
   - Rendering purchase registers or reconciliation matches via standard `.map()` over large arrays without TanStack Virtual is strictly prohibited (`CON-PERF-02`).
4. **Deterministic Cascading:**
   - The 5-stage waterfall must execute in strict sequence: Stage 1 (Exact Match) $\to$ Stage 2 (Canonical Syntax Normalization) $\to$ Stage 3 (SIMD Fuzzy Matching) $\to$ Stage 4 (POS / Tax Head Resolution) $\to$ Stage 5 (Rule 37A Ageing Watchdog).
5. **Team & Submission Immutability:**
   - The project title, team name (**Binary Brains**), leader (**Shivam Kansal**), mentor (**Dr. Mukesh Saraswat**), and presentation date (**August 24, 2026**) are permanently locked into project metadata.
