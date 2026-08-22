# ReconcileGST 72-Hour Sprint Implementation Roadmap & WBS

**Document ID:** `stage_4_documents/14_implementation_roadmap_wbs.md`  
**Version:** 2.0.0 (Production Master)  
**Date:** 2026-08-21  
**Author:** Principal Operations Architect & Sprint Planning Lead (Binary Brains)  
**Governing Inputs:** `stage_2_decision_lock/23_locked_scope.md`, `stage_2_decision_lock/24_success_metrics.md`, `stage_4_documents/adrs/`  
**Total Sprint Capacity:** 144 Engineering Hours (6 Engineers × 24 Productive Hours over 72 Elapsed Hours)  
**Committed In-Scope Effort:** 98 Hours (68.1% Capacity)  
**Safety Float & Buffer:** 46 Hours (31.9% Capacity)  

---

## 1. Team Organization, Roles & Capability Matrix

The **Binary Brains** development team consists of 6 specialized software engineers with clearly demarcated module ownership, avoiding merge conflicts and blocking dependencies.

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 BINARY BRAINS ENGINEERING POD STRUCTURE                                │
├─────────────────────────┬───────────────────────────────┬──────────────────────────────────────────────┤
│ Team Member             │ Primary Engineering Pod       │ Specialized Domain & Technical Ownership     │
├─────────────────────────┼───────────────────────────────┼──────────────────────────────────────────────┤
│ **Shivam Kansal**       │ Core Algorithm Pod Lead       │ Web Worker, SIMD WASM, RapidFuzz, BigInt64  │
│ **Shivanya Agarwal**    │ Frontend & UI/UX Pod Lead     │ TanStack Virtual v3, Tailwind Tokens, Drawers│
│ **Akriti Sengar**       │ Ingestion & Data Pipeline Lead│ JSON/XLSX Parsers, Fuzzy Column Auto-Mapper  │
│ **Archi Snehi**         │ Statutory Sentinel Pod Lead   │ Rule 88D DRC-01C, IMS Triage, Part B Defense │
│ **Akansha Kumari**      │ CA Exporter & Integration Lead│ SheetJS 6-Tab Excel, SUMIFS, GSTR-1A Payload │
│ **Suraj Pratap**        │ QA, Benchmark & Telemetry Lead│ 10k Synthetic Dataset, Microsecond HUD, E2E  │
└─────────────────────────┴───────────────────────────────┴──────────────────────────────────────────────┘
```

---

## 2. Work Breakdown Structure (WBS)

The implementation is structured across 5 core functional modules, broken down into fine-grained tasks with explicit hourly estimates, assigned engineers, and predecessor dependencies.

### 2.1 Module A: Ingestion & In-Memory Pipeline (Lead: Akriti Sengar • 22 Hours)

| WBS Code | Work Package / Task Description | Lead | Est. Hours | Predecessors | Deliverable Artifact |
|:---|:---|:---|:---:|:---:|:---|
| **A.1.1** | HTML5 `FileReader` & Streaming Buffer Allocator | Akriti | 4h | None | `src/workers/parsers/file-reader.ts` |
| **A.1.2** | GSTN Form GSTR-2B JSON Streaming Parser (v1.0 schema) | Akriti | 5h | A.1.1 | `src/workers/parsers/gstr2b-json-parser.ts` |
| **A.1.3** | Heterogeneous ERP XLSX / CSV / Tally XML Ingestion | Akriti | 5h | A.1.1 | `src/workers/parsers/erp-sheet-parser.ts` |
| **A.1.4** | Fuzzy Column Auto-Mapper with Levenshtein Aliases | Akriti | 4h | A.1.3 | `src/workers/mappers/column-automapper.ts` |
| **A.1.5** | `BigInt64Array` Fixed-Point Integer Paise Allocator | Akriti | 4h | A.1.2, A.1.3 | `src/workers/memory/paise-buffer.ts` |

---

### 2.2 Module B: 5-Stage SIMD Matching Waterfall Engine (Lead: Shivam Kansal • 24 Hours)

| WBS Code | Work Package / Task Description | Lead | Est. Hours | Predecessors | Deliverable Artifact |
|:---|:---|:---|:---:|:---:|:---|
| **B.1.1** | Inverted Hash Candidate Blocking Index ($O(N+M)$) | Shivam | 4h | A.1.5 | `src/workers/engine/inverted-index.ts` |
| **B.1.2** | Pass 1: Deterministic Composite Key Exact Matcher | Shivam | 4h | B.1.1 | `src/workers/engine/pass1-exact.ts` |
| **B.1.3** | Pass 2: Syntax Normalizer & Regex FY Prefix Stripper | Shivam | 4h | B.1.2 | `src/workers/engine/pass2-syntax.ts` |
| **B.1.4** | Pass 3: Section 170 Statutory ±₹1 Rounding Normalizer| Shivam | 3h | B.1.3 | `src/workers/engine/pass3-rounding.ts` |
| **B.1.5** | Pass 4: RapidFuzz SIMD WASM String Vector Matcher | Shivam | 5h | B.1.4 | `src/workers/engine/pass4-rapidfuzz.ts` |
| **B.1.6** | Pass 5: Place of Supply (POS) & Tax Head Resolver | Shivam | 4h | B.1.5 | `src/workers/engine/pass5-pos-resolver.ts` |

---

### 2.3 Module C: 60 FPS Virtualized UI & Dispute Studio (Lead: Shivanya Agarwal • 20 Hours)

| WBS Code | Work Package / Task Description | Lead | Est. Hours | Predecessors | Deliverable Artifact |
|:---|:---|:---|:---:|:---:|:---|
| **C.1.1** | Tailwind Theme Tokens, CSS Variables & Layout Shell | Shivanya| 3h | None | `src/styles/globals.css`, `tailwind.config.js` |
| **C.1.2** | Executive Terminal Shell & Sticky Header (`App.tsx`)| Shivanya| 3h | C.1.1 | `src/components/layout/ExecutiveTerminal.tsx` |
| **C.1.3** | TanStack Virtual v3 DOM Windowing Data Grid (60 FPS)| Shivanya| 6h | C.1.2, B.1.6 | `src/components/grid/VirtualizedReconGrid.tsx` |
| **C.1.4** | Side-by-Side Split Difference Drawer with Token Diff| Shivanya| 5h | C.1.3 | `src/components/drawer/SplitDiffDrawer.tsx` |
| **C.1.5** | Triage Segmented Tabs & Inverted Multi-Column Filter| Shivanya| 3h | C.1.3 | `src/components/grid/TriageToolbar.tsx` |

---

### 2.4 Module D: Statutory Risk & Compliance Sentinel (Lead: Archi Snehi • 14 Hours)

| WBS Code | Work Package / Task Description | Lead | Est. Hours | Predecessors | Deliverable Artifact |
|:---|:---|:---|:---:|:---:|:---|
| **D.1.1** | Rule 88D DRC-01C Exposure Gauge & 20%/₹25L Trigger | Archi | 4h | B.1.6 | `src/components/statutory/DRC01CRiskGauge.tsx` |
| **D.1.2** | Section 17(5) Ineligible ITC Detection & Reverse Tax| Archi | 3h | B.1.6 | `src/workers/statutory/blocked-credit-filter.ts` |
| **D.1.3** | GSTN IMS Interactive Pre-Triage (Accept/Reject/Pend)| Archi | 3h | C.1.4 | `src/components/statutory/IMSTriageControls.tsx` |
| **D.1.4** | DRC-01C Part B Legal Defense Auto-Dossier Generator | Archi | 4h | D.1.1 | `src/components/statutory/DRC01CDefenseModal.tsx` |

---

### 2.5 Module E: CA Multi-Tab Exporter & Knockout Demo Suite (Lead: Akansha Kumari / Suraj Pratap • 18 Hours)

| WBS Code | Work Package / Task Description | Lead | Est. Hours | Predecessors | Deliverable Artifact |
|:---|:---|:---|:---:|:---:|:---|
| **E.1.1** | SheetJS 6-Tab Color-Coded CA Audit Workbook Builder| Akansha| 6h | B.1.6 | `src/exporters/sheetjs-ca-workbook.ts` |
| **E.1.2** | Dynamic Excel `=SUMIFS` Audit Formula Embedder | Akansha| 4h | E.1.1 | `src/exporters/excel-formula-injector.ts` |
| **E.1.3** | Form GSTR-1A Supplier Intra-Month Delta JSON Builder| Akansha| 3h | B.1.6 | `src/exporters/gstr1a-delta-builder.ts` |
| **E.1.4** | 1-Click Bilingual WhatsApp Deep-Link Generator (`wa.me`)| Akansha| 2h | C.1.4 | `src/components/dispute/WhatsAppRecoveryModal.tsx` |
| **E.1.5** | 10,000 Dirty Invoice Benchmark Dataset Generator | Suraj | 3h | None | `src/benchmarks/sample-10k-dataset.json` |

---

## 3. Critical Path Method (CPM) Network Analysis

The Critical Path defines the longest sequence of dependent activities that dictates the minimum possible time to complete the core functional engine.

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   CRITICAL PATH DIAGRAM (Total: 41 Hours)                              │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘

 [A.1.1: File Reader] (4h)
          │
          ▼
 [A.1.2 / A.1.3: Parsers] (5h)
          │
          ▼
 [A.1.5: BigInt64Array Memory Allocator] (4h)
          │
          ▼
 [B.1.1: Inverted Hash Indexer] (4h)
          │
          ▼
 [B.1.2: Pass 1 Exact Matching] (4h)
          │
          ▼
 [B.1.5: Pass 4 RapidFuzz SIMD WASM] (5h)
          │
          ▼
 [B.1.6: Pass 5 POS & Tax Resolver] (4h)
          │
          ▼
 [C.1.3: TanStack Virtual v3 Grid Integration] (6h)
          │
          ▼
 [E.1.1: SheetJS 6-Tab CA Excel Exporter] (6h)
          │
          ▼
 [COMPLETE PRODUCTION SYSTEM: 41h CPM vs. 72h Sprint Float]
```

---

## 4. 72-Hour Sprint Schedule & Milestone Gantt

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                  72-HOUR SPRINT MILESTONE GANTT                                        │
├──────┬───────┬───────────────────────────────────────────────┬─────────────────────────────────────────┤
│ Hour │ Phase │ Milestone Target                              │ Primary Responsible Engineers           │
├──────┼───────┼───────────────────────────────────────────────┼─────────────────────────────────────────┤
│ 00-12│ M1    │ Ingestion, Parsers & In-Memory BigInt64 Buffer│ Akriti Sengar, Suraj Pratap             │
│ 12-24│ M2    │ 5-Stage SIMD Matching Waterfall Engine Ready  │ Shivam Kansal, Akriti Sengar            │
│ 24-36│ M3    │ 60 FPS Virtualized Grid & Split Diff Drawer   │ Shivanya Agarwal, Shivam Kansal         │
│ 36-48│ M4    │ Statutory Sentinel (DRC-01C) & CA Exporters   │ Archi Snehi, Akansha Kumari             │
│ 48-60│ M5    │ Full UI/Worker Wiring & WhatsApp Bot Linked   │ Entire Team (Binary Brains)             │
│ 60-72│ M6    │ E2E Benchmark Testing, Polish & Freeze        │ Suraj Pratap (QA Lead) + All Members    │
└──────┴───────┴───────────────────────────────────────────────┴─────────────────────────────────────────┘
```

### Detailed Hour-by-Hour Timeline:

```
Hour 00 - 12: Ingestion & Pipeline Foundations (Milestone 1)
├── Shivam: Environment setup, Vite/Next.js worker configurations, WASM RapidFuzz bindings.
├── Akriti: Build GSTR-2B streaming JSON parser and Excel purchase register parser.
├── Shivanya: Define Tailwind design tokens, CSS variables, base shell, and Radix primitives.
├── Archi: Construct statutory rule definitions (Rule 88D, Section 16(2)(aa), Section 170).
├── Akansha: Set up SheetJS template formats for 6-tab audit workbook structure.
└── Suraj: Generate 10,000 synthetic dirty B2B invoices with verified mathematical ground truth.

Hour 13 - 24: Matching Engine & Algorithmic Core (Milestone 2)
├── Shivam: Complete Inverted Hash Candidate Blocking, Pass 1 Exact, Pass 2 Syntax, Pass 3 Sec 170.
├── Akriti: Implement Fuzzy Column Auto-Mapper and verify heterogeneous ERP schemas.
├── Shivanya: Scaffold Virtualized Grid layout, table headers, and mock row renderers.
├── Archi: Build Section 17(5) blocked credit rules engine and IMS triage schema.
├── Akansha: Construct dynamic Excel SUMIFS formulas for workbook summary calculations.
└── Suraj: Author automated unit test suites for floating-point drift and SIMD accuracy.

Hour 25 - 36: Virtualization & Visual Dispute Studio (Milestone 3)
├── Shivam: Integrate RapidFuzz SIMD WASM string matcher and POS tax head resolver.
├── Akriti: Wire `BigInt64Array` zero-copy transferable memory between worker and main thread.
├── Shivanya: Implement TanStack Virtual v3 windowing with 60 FPS scrolling lock.
├── Archi: Construct Rule 88D DRC-01C risk gauge cards and visual threshold meters.
├── Akansha: Author client-side GSTR-1A supplier amendment delta JSON generator.
└── Suraj: Measure Web Worker execution latency and render live Telemetry HUD tickers.

Hour 37 - 48: Statutory Sentinel & Exporters (Milestone 4)
├── Shivam: Tune memory allocation and benchmark 50k invoice stress tests (<800ms).
├── Akriti: Handle malformed Excel rows and edge cases in Tally XML exports.
├── Shivanya: Build 800px Slide-over Side-by-Side Split Difference Drawer with token diff.
├── Archi: Construct DRC-01C Part B legal defense modal citing High Court precedents.
├── Akansha: Complete 6-Tab CA Audit-Ready Excel generator with cell styling and formulas.
└── Suraj: Execute cross-browser verification (Chrome, Firefox, Safari, Edge).

Hour 49 - 60: End-to-End Integration & WhatsApp Engine (Milestone 5)
├── Shivam: Optimize transfer buffer serialization and worker lifecycle guards.
├── Akriti: Finalize universal drag-and-drop dual dropzone with format auto-detection.
├── Shivanya: Connect 1-Click "⚡ Load 10k Records" demo trigger in executive header.
├── Archi: Integrate IMS Accept/Reject/Pending state persistence in local session.
├── Akansha: Build 1-Click WhatsApp bilingual vendor recovery modal with `wa.me` links.
└── Suraj: Run comprehensive Lighthouse audit (PWA, Performance, Accessibility, Best Practices).

Hour 61 - 72: Quality Assurance, Presentation Polish & Production Freeze (Milestone 6)
├── Entire Team: Execute complete SIH presentation rehearsal on 1080p display mode.
├── Suraj: Verify zero network bytes egress in Chrome Network DevTools.
├── Shivam & Shivanya: Eliminate all UI janks; guarantee 60.0 FPS locked grid scrolling.
└── Lead Architect: Execute formal Stage 4 sign-off and lock production code repository.
```

---

## 5. Risk Management & Float Allocation Strategy

| Risk ID | Potential Risk Event | Probability | Impact | Mitigation Strategy | Float Buffer |
|:---|:---|:---:|:---:|:---|:---:|
| **RSK-01** | RapidFuzz WASM SIMD initialization failure on older browsers | Low | High | Fallback to pure TS Bitap Levenshtein matcher embedded in worker | 6 Hours |
| **RSK-02** | Large 50,000-row Excel parsing memory spikes | Med | Med | Chunked streaming parsing via SheetJS `readAsArrayBuffer` | 8 Hours |
| **RSK-03** | TanStack Virtual v3 dynamic row height measurement jank | Low | High | Enforce fixed 34px row height with strict CSS containment | 4 Hours |
| **RSK-04** | Excel formula corruption in legacy MS Office 2010 | Low | Med | Standardize on universal uppercase `=SUMIFS(...)` without dynamic arrays | 4 Hours |
| **RSK-05** | Complex edge-case POS tax head misclassifications | Med | Low | Fallback to user-guided manual POS toggle in split diff drawer | 4 Hours |

> **Float Summary:** Out of 144 available engineer-hours, 98 hours are scheduled for In-Scope tasks. The remaining **46 hours (31.9%)** serve as uncommitted float to absorb any unexpected technical hurdles or implement Should-Have stretch goals.
