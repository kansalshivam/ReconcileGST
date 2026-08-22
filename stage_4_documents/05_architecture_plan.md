# Master Architecture Plan: ReconcileGST Edge Reconciliation Suite

**Document ID:** `stage_4_documents/05_architecture_plan.md`  
**Version:** 1.0 (BASELINED)  
**Date:** 2026-08-21  
**Author:** Principal Systems & Software Architect (Team Binary Brains)  
**Template Standard:** arc42 Architecture Template (https://arc42.org/)  
**Governing Inputs:** `stage_2_decision_lock/21_problem_statement.md`, `stage_2_decision_lock/22_tier_list.md`, `stage_2_decision_lock/23_locked_scope.md`, `stage_2_decision_lock/24_success_metrics.md`, `stage_3_research/25_stack_research.md`, `stage_3_research/28_compliance_checklist.md`, `stage_4_documents/adrs/ADR-001` through `ADR-006`  
**Cross-References:** ISO/IEC/IEEE 42010 Systems Architecture Standard, C4 Model (c4model.com)

---

## 1. Introduction & Goals

### 1.1 Business & Statutory Problem Context
In the Indian Goods and Services Tax (GST) ecosystem, Indian enterprises face a severe monthly compliance squeeze between the 14th (when official inward supplier filings are published in Form GSTR-2B) and the 20th (when monthly self-assessed tax returns must be filed in Form GSTR-3B). Under **Section 16(2)(aa) of the Central Goods and Services Tax (CGST) Act, 2017**, a taxpayer cannot claim Input Tax Credit (ITC) unless the supplier has formally uploaded the corresponding invoice in their Form GSTR-1/IFF and the details have been communicated to the buyer in Form GSTR-2B.

Furthermore, under **CGST Rule 88D (Form GST DRC-01C)**, any excess ITC claimed in GSTR-3B compared to GSTR-2B exceeding **20% and ₹25 Lakhs** triggers an automated, system-generated statutory demand notice. Failure to reconcile or pay the differential tax with **Section 50(3) 18% p.a. daily penal interest** within 7 days results in catastrophic statutory consequences: immediate billing lockout under **Rule 59(6)(e)** and summary bank account attachment under **Rule 142B**.

Existing market solutions (ClearTax, Masters India, Adaequare) rely on multi-tenant cloud architectures. These architectures upload sensitive client financial ledgers to external servers, creating massive compliance liabilities under the **Digital Personal Data Protection (DPDP) Act, 2023**, violating Chartered Accountant professional privilege under the **Chartered Accountants Act, 1949**, incurring expensive SaaS subscription fees, and introducing substantial network upload latency.

**ReconcileGST** solves this crisis through a **Zero-Cloud, 100% In-Browser Edge Computing Architecture**. It ingests heterogeneous ERP ledgers and official GSTR-2B datasets entirely within client memory, executes a 5-Stage SIMD-accelerated matching waterfall in a dedicated Web Worker in $<250\text{ms}$, visualizes discrepancies in a 60 FPS virtualized interface, isolates defaulting vendors with 1-click WhatsApp recovery, and exports audit-ready 6-tab CA workbooks with dynamic `=SUMIFS` formulas—at **₹0 hosting and infrastructure cost**.

### 1.2 Quality Goals (NFR Target Matrix)

| Quality Goal ID | Category (ISO 25010) | Quality Goal & Metric Target | Architectural Tactic & Enabler | ADR Reference |
| :--- | :--- | :--- | :--- | :--- |
| **QG-01** | Privacy & Security | **0 Network Bytes Transmitted** during active ingestion and reconciliation; 100% Client-side RAM sandbox. | Static Next.js/Vite artifact; HTML5 `FileReader`; zero external HTTP/WebSocket endpoints. | ADR-001 |
| **QG-02** | Time Behavior | **$<300\text{ms}$ End-to-End Latency** for 10,000 invoice records (Ingestion + Normalization + 5-Stage Match). | Inverted Hash Candidate Blocking ($O(N+M)$) + RapidFuzz SIMD/WASM Vectorization. | ADR-001, ADR-004 |
| **QG-03** | UI Responsiveness | **60 FPS Sustained Scrolling** ($\ge 58.5\text{ FPS}$) with zero frame drops during grid navigation. | TanStack Virtual v3 headless windowing mounting only 25–30 active DOM nodes. | ADR-002 |
| **QG-04** | Arithmetic Precision | **0.0000% Floating-Point Drift**; exact single-Paisa precision across all multi-column aggregations. | `BigInt64Array` fixed-point 64-bit integer arithmetic ($1\text{ INR} = 100\text{ Paise}$). | ADR-003 |
| **QG-05** | Memory Efficiency | **$<42\text{MB}$ Peak JavaScript Heap** for 10,000 records; $<90\text{MB}$ for 100,000 records. | Packed contiguous typed memory buffers; zero intermediate string/object allocations. | ADR-002, ADR-003 |
| **QG-06** | Audit Integrity | **100% Live Dynamic Excel Formulas**; 0 `#REF!`, `#NAME?`, or `#VALUE!` errors in exported workbooks. | SheetJS OpenXML binary engine injecting live `=SUMIFS`, `=COUNTIF`, and `=IF` formulas. | ADR-005 |
| **QG-07** | Economic TCO | **₹0 Infrastructure Cost Forever**; deployable to static edge CDNs without cloud backend servers. | Vercel Static CDN / GitHub Pages static bundle; client-side WhatsApp `wa.me` deep linking. | ADR-001, ADR-006 |

### 1.3 Primary Stakeholders

| Stakeholder Persona | Primary Needs & Business Motivations | Key Architectural Touchpoints |
| :--- | :--- | :--- |
| **Chartered Accountant (CA)** | Verifiable reconciliation summaries, complete audit trails, defense against GST scrutiny notices, multi-tab Excel workbooks. | 6-Tab CA Exporter, Section 170 Rounding Normalizer, Rule 88D Threat Gauge, DRC-01C Reply Generator. |
| **CFO / Head of Tax** | Real-time statutory risk visibility, avoidance of Rule 59(6)(e) portal lockouts, elimination of Section 50(3) interest exposure. | Real-Time Telemetry HUD, DRC-01C Risk Gauge, Executive Summary Dashboard. |
| **Accounts Payable (AP) Accountant** | Immediate vendor recovery, identification of non-compliant suppliers, payment-hold automation. | 1-Click WhatsApp Intimation Bot (`wa.me`), Form GSTR-1A Supplier Delta JSON Generator. |
| **GST Practitioner / Tax Filing Clerk** | High-speed processing, tolerance for messy ERP formats, seamless handling of Tally/Busy/Zoho/SAP exports. | Universal ERP Column Auto-Mapper, Inverted Hash Blocking, RapidFuzz Fuzzy Matcher. |

---

## 2. Constraints

### 2.1 Technical Constraints
- **`CON-PRIV-01` (Zero Network Egress):** The system must execute 100% of data parsing, candidate blocking, fuzzy matching, and report generation in client memory. No invoice data or metadata may leave the browser via HTTP, WebSocket, WebRTC, or beacon API.
- **`CON-PERF-01` (Sub-300ms Compute):** The entire ingestion, mapping, and matching pipeline for 10,000 invoice pairs must complete in $<300\text{ms}$ on a standard commodity laptop (Intel Core i5, 8GB RAM).
- **`CON-PERF-02` (60 FPS Windowing):** Grid rendering must maintain 60 FPS ($16.6\text{ms}$ frame budget) using DOM virtualization, capping mounted table row nodes to $\le 30$.
- **`CON-PERF-03` (0.00% Float Drift):** All monetary figures must be computed with 0.00% rounding drift via integer Paise ($1\text{ INR} = 100\text{ Paise}$) stored in `BigInt64Array`.
- **`CON-SEC-01` (Content Security Policy):** The production deployment must enforce `connect-src 'none'`, preventing any possibility of malicious data exfiltration.

### 2.2 Statutory & Regulatory Constraints
- **`CON-PRIV-02` (DPDP Act 2023 Exemption):** By maintaining a 100% client-side zero-egress architecture, ReconcileGST strictly avoids becoming a "Data Fiduciary" or "Data Processor" under the DPDP Act 2023, eliminating statutory liability for data breach penalties up to ₹250 Crore.
- **`CON-STAT-01` (CGST Section 170 Rounding):** Variances between ERP and GSTR-2B tax values $\le \pm ₹1.00$ ($\le \pm 100\text{ Paise}$) must be automatically accepted as statutory rounding matches.
- **`CON-STAT-02` (CGST Rule 88D DRC-01C Scrutiny):** Real-time monitoring of ITC variance against the statutory threshold ($>20\%$ and $>₹25\text{ Lakhs}$).
- **`CON-STAT-03` (GSTN IMS Advisory 624 / Circular 231/2024):** In-memory triage of inward invoices into `ACCEPT`, `REJECT`, and `PENDING`, with a mandatory 2-step confirmation guardrail for Credit Note rejections.

### 2.3 Economic & Operational Constraints
- **`CON-PRIV-04` (₹0 Hosting & Messaging Cost):** The system must operate without recurring server hosting, database subscription, or paid SMS/WhatsApp API gateway costs. All vendor recovery must utilize the open client-side `wa.me` protocol.

---

## 3. Context & Scope (C4 Model Level 1: System Context)

### 3.1 Context Description
ReconcileGST is an autonomous, client-side single-page web application running entirely within the user's browser runtime. It interfaces with external files provided locally by the user (official GSTN GSTR-2B JSON and heterogeneous ERP Excel/CSV purchase registers), interacts with the native OS file system for downloads, and delegates vendor recovery communications to the user's local WhatsApp Web or Desktop application via deep-link protocol handoff.

```puml
@startuml C4_Context_ReconcileGST
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Context.puml

LAYOUT_WITH_LEGEND()

Person(taxUser, "Tax Practitioner / CA", "Uploads purchase registers and GSTR-2B files, inspects discrepancies, triages IMS actions, and exports audit reports.")

System(reconcileGST, "ReconcileGST Suite", "Autonomous in-browser edge reconciliation engine. Parses, normalizes, matches invoices via SIMD, computes statutory risk, and builds 6-tab Excel workbooks in RAM.")

System_Ext(gstnPortal, "GSTN Portal (Official)", "Source of Form GSTR-2B JSON files downloaded manually by the taxpayer.")
System_Ext(erpSystem, "ERP System (Tally / Busy / SAP / Zoho)", "Source of enterprise purchase registers exported as XLSX or CSV.")
System_Ext(whatsAppClient, "WhatsApp Web / Desktop Client", "Local WhatsApp instance receiving deep-linked statutory recovery messages via wa.me protocol.")
System_Ext(localFileSystem, "User Local File System", "Local browser storage for reading raw input files and saving exported .xlsx and .json artifacts.")

Rel(taxUser, erpSystem, "Exports Purchase Register", "Manual Export (CSV/XLSX)")
Rel(taxUser, gstnPortal, "Downloads GSTR-2B Return", "Manual Download (JSON)")
Rel(taxUser, reconcileGST, "Drags & Drops Files / Clicks 1-Click Demo", "HTML5 Drag & Drop")
Rel(taxUser, reconcileGST, "Inspects Discrepancies & Triage Actions", "60 FPS Virtualized UI")

Rel(reconcileGST, localFileSystem, "Reads Files via FileReader (0 Net Egress)", "HTML5 FileReader API")
Rel(reconcileGST, localFileSystem, "Saves 6-Tab Audit .xlsx & GSTR-1A .json", "Blob URL / Native Download")
Rel(reconcileGST, whatsAppClient, "Dispatches Pre-Formatted Notices", "Client URI Deep-Link (wa.me)")
Rel(whatsAppClient, taxUser, "Prompts CA for Manual Send Confirmation", "Human Oversight")

@enduml
```

### 3.2 Mermaid System Context Diagram

```mermaid
graph TD
    User["👨‍💼 Tax Practitioner / Chartered Accountant"]
    
    subgraph ClientBoundary["Local Machine Runtime (Client Sandbox)"]
        ReconcileGST["⚡ ReconcileGST Edge Application (Next.js 14 Static Export)"]
        LocalFS["📁 Local File System (RAM & Browser Storage)"]
        WAClient["💬 Local WhatsApp Client (Web / Desktop)"]
    end

    subgraph ExternalSources["External Data Sources (Offline / Pre-Downloaded)"]
        ERP["🏢 ERP Systems (Tally, Busy, Zoho, SAP)"]
        GSTN["🏛️ GSTN Portal (Official GSTR-2B JSON)"]
    end

    ERP -->|1. Export Purchase Register| User
    GSTN -->|2. Download GSTR-2B JSON| User
    User -->|3. Drag & Drop Files (Local RAM)| ReconcileGST
    ReconcileGST <-->|4. Read/Write Buffers (Zero Network Egress)| LocalFS
    ReconcileGST -->|5. Hand off wa.me URI| WAClient
    WAClient -->|6. Encrypted P2P Dispatch| User
```

---

## 4. Solution Strategy

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                              RECONCILE-GST SEVEN-PILLAR SOLUTION STRATEGY                              │
├───────────────────────────────┬──────────────────────────────────────┬─────────────────────────────────┤
│ Architectural Pillar          │ Strategic Decision                   │ Key Technical Rationale         │
├───────────────────────────────┼──────────────────────────────────────┼─────────────────────────────────┤
│ 1. Execution Paradigm         │ In-Browser Zero-Cloud Edge Compute   │ Eradicates DPDP liabilities &   │
│                               │                                      │ eliminates server hosting costs.│
├───────────────────────────────┼──────────────────────────────────────┼─────────────────────────────────┤
│ 2. Concurrency Model          │ Dedicated Web Worker (`recon-worker`)│ Decouples CPU-heavy matching    │
│                               │ with Transferable `ArrayBuffer`      │ from main thread (0ms UI lag).  │
├───────────────────────────────┼──────────────────────────────────────┼─────────────────────────────────┤
│ 3. Algorithmic Optimization   │ Inverted Hash Candidate Blocking     │ Reduces quadratic comparisons   │
│                               │ + 5-Stage SIMD Matching Waterfall    │ by 99.95% ($O(N+M)$ complexity).│
├───────────────────────────────┼──────────────────────────────────────┼─────────────────────────────────┤
│ 4. Arithmetic Precision       │ Fixed-Point Integer `BigInt64Array`  │ 0.00% float drift; 8-byte cache │
│                               │ (1 INR = 100 Paise)                  │ line alignment; Sec 170 math.   │
├───────────────────────────────┼──────────────────────────────────────┼─────────────────────────────────┤
│ 5. Tabular Virtualization     │ TanStack Virtual v3 Headless Hook    │ Enforces $\le 30$ DOM nodes;    │
│                               │                                      │ sustains 60 FPS rendering.      │
├───────────────────────────────┼──────────────────────────────────────┼─────────────────────────────────┤
│ 6. Audit Spreadsheet Engine   │ SheetJS Community Edition (`xlsx`)   │ Assembles 6 tabs with dynamic   │
│                               │                                      │ `=SUMIFS` formulas in <350ms.   │
├───────────────────────────────┼──────────────────────────────────────┼─────────────────────────────────┤
│ 7. Vendor Recovery Engine     │ Client-Side `wa.me` Deep Linking     │ 100% free, zero cloud egress,   │
│                               │ with Bilingual Markdown Synthesis    │ $>90\%$ vendor response rate.   │
└───────────────────────────────┴──────────────────────────────────────┴─────────────────────────────────┘
```

---

## 5. Building Block View (C4 Model Level 2: Container Diagram)

### 5.1 Container Architecture Breakdown
ReconcileGST is architected into two primary execution containers running inside the client browser sandbox:
1. **Main UI Thread Container (React 18 / Next.js 14 SPA):** Owns UI state, view routing, user interaction, virtualized table rendering, SVG risk gauges, difference drawers, and modal workflows.
2. **Dedicated Compute Worker Container (`recon-worker.ts`):** An isolated background OS thread owning binary file decoding, JSON/XLSX streaming parsing, ERP column normalization, inverted hash indexing, 5-stage SIMD matching, statutory risk evaluation, and Excel binary assembly.

```puml
@startuml C4_Container_ReconcileGST
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Container.puml

LAYOUT_WITH_LEGEND()

Person(caUser, "Chartered Accountant / User", "Interacts with reconciliation dashboard")

System_Boundary(c1, "ReconcileGST In-Browser Application") {
    Container(mainThread, "Main UI Thread Container", "Next.js 14 / React 18 / Tailwind CSS", "Renders 60 FPS virtualized grid, split difference drawer, DRC-01C risk gauge, and manages user state.")
    Container(virtualGrid, "Virtualized Grid Subsystem", "TanStack Virtual v3", "Manages headless windowing geometry, dynamic row height measurement, and mounts 25-30 DOM nodes.")
    Container(workerThread, "Dedicated Compute Worker", "Web Worker (recon-worker.ts)", "Runs streaming ingestion, inverted hash blocking, 5-stage SIMD matching waterfall, and Excel generation.")
    Container(typedMemory, "In-Memory Typed Buffer Pool", "BigInt64Array / Uint8Array", "Contiguous linear memory holding fixed-point Paise financial tuples and matching index pointers.")
    Container(deepLinkEngine, "WhatsApp Deep-Link Synthesizer", "TypeScript URI Generator", "Synthesizes pre-formatted wa.me deep links with English and Hinglish statutory notices.")
}

System_Ext(whatsAppApp, "WhatsApp Client", "Native Web/Desktop client for vendor communications.")

Rel(caUser, mainThread, "Drags & drops files / Toggles filters / Clicks IMS actions", "DOM Events")
Rel(mainThread, virtualGrid, "Provides dataset slice & height callback", "React Props / Hooks")
Rel(virtualGrid, mainThread, "Emits active virtual rows for rendering", "DOM VNodes")

Rel(mainThread, workerThread, "Dispatches START_RECON (Raw ArrayBuffers)", "postMessage (Transferable)")
Rel(workerThread, typedMemory, "Allocates contiguous 8-byte financial buffers", "Direct Memory Write")
Rel(typedMemory, workerThread, "Reads fixed-point values for ALU matching", "Direct Memory Read")
Rel(workerThread, mainThread, "Transfers RECON_COMPLETE & Telemetry", "postMessage (Transferable Zero-Copy)")

Rel(mainThread, deepLinkEngine, "Requests recovery notice payload", "Method Call")
Rel(deepLinkEngine, whatsAppApp, "Invokes window.open('https://wa.me/...')", "Browser URI Handoff")

@enduml
```

### 5.2 Mermaid Container Diagram

```mermaid
graph TB
    subgraph BrowserSandbox["Browser Execution Sandbox (Client RAM)"]
        subgraph MainThreadContainer["Main UI Thread (Next.js 14 / React 18)"]
            Dashboard["📊 Recon Dashboard & Telemetry HUD"]
            VirtualGrid["🪟 TanStack Virtual v3 Grid (25-30 DOM Nodes)"]
            DiffDrawer["🔍 Split Difference & Character Diff Drawer"]
            RiskGauge["🚨 Rule 88D DRC-01C Risk Gauge Component"]
            ImsModal["🛡️ IMS 2-Step Credit Note Modal"]
            DeepLinkGen["📱 WhatsApp URI Synthesizer (wa.me)"]
        end

        subgraph WorkerContainer["Background Web Worker (recon-worker.ts)"]
            FileIngest["📥 Stream Ingestion & BOM Transcoder"]
            ColMapper["🗺️ Universal ERP Column Auto-Mapper"]
            HashBlocker["⚡ Inverted Hash Candidate Blocker (O(N+M))"]
            SIMDMatch["🔬 5-Stage SIMD Matching Waterfall Engine"]
            StatRisk["⚖️ Statutory Risk & Sec 50(3) Engine"]
            ExcelBuilder["📑 SheetJS 6-Tab Dynamic SUMIFS Builder"]
        end

        subgraph ContiguousRAM["Linear Typed Memory Pool"]
            PaiseBuffer["Contiguous BigInt64Array (8 Bytes per Tax Field)"]
            MatchPointers["Uint32Array Match Index Cross-References"]
        end
    end

    MainThreadContainer -->|1. postMessage: START_RECON (Raw Blobs)| FileIngest
    FileIngest --> ColMapper
    ColMapper --> HashBlocker
    HashBlocker --> PaiseBuffer
    PaiseBuffer --> SIMDMatch
    SIMDMatch --> MatchPointers
    MatchPointers --> StatRisk
    StatRisk -->|2. Zero-Copy Transfer: RECON_COMPLETE| Dashboard
    Dashboard --> VirtualGrid
    Dashboard --> DiffDrawer
    Dashboard --> RiskGauge
    VirtualGrid --> ImsModal
    Dashboard --> DeepLinkGen
    Dashboard -->|3. postMessage: EXPORT_EXCEL| ExcelBuilder
    ExcelBuilder -->|4. ArrayBuffer Blob Download| Dashboard
```

---

## 6. Component Layer Decomposition (C4 Model Level 3)

### 6.1 Main UI Thread Container Components

```puml
@startuml C4_Component_MainThread
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Component.puml

LAYOUT_WITH_LEGEND()

Container_Boundary(mainContainer, "Main UI Thread Container") {
    Component(fileDropzone, "DropzoneZone.tsx", "React / Drag & Drop", "Handles dual-source file drop, validates file extensions (.json, .xlsx, .csv), and reads ArrayBuffers via HTML5 FileReader.")
    Component(reconStore, "useReconStore.ts", "Zustand State Store", "Manages active dataset, filter states, selected dispute row, IMS action overrides, and live telemetry metrics.")
    Component(tableViewer, "VirtualReconTable.tsx", "TanStack Virtual v3", "Virtualizes 50,000+ rows, handles column sorting, search filtering, and expands dispute details.")
    Component(disputeDrawer, "DisputeDetailDrawer.tsx", "Tailwind CSS / Lucide", "Renders side-by-side character diffs between ERP and 2B fields with color-coded mismatch badges.")
    Component(statGauge, "DRC01CRiskGauge.tsx", "SVG / Framer Motion", "Visualizes percentage and absolute ITC variance against Rule 88D statutory threshold (20% and ₹25L).")
    Component(imsGuardModal, "CreditNoteSafeguardModal.tsx", "Radix Dialog", "Enforces 2-step confirmation when user attempts to reject a Credit Note under Circular 231/2024.")
    Component(waModal, "WhatsAppNoticeModal.tsx", "React / wa.me", "Allows CA to preview and toggle English vs Hinglish notice before invoking native WhatsApp deep link.")
    Component(workerBridge, "worker-bridge.ts", "Typed Worker RPC Client", "Wraps Web Worker postMessage in typed Promises with 5000ms watchdog timeout and crash recovery.")
}

Rel(fileDropzone, reconStore, "Dispatches raw file ArrayBuffers")
Rel(reconStore, workerBridge, "Invokes startReconciliation(erpBuf, gstr2bBuf)")
Rel(workerBridge, reconStore, "Resolves ReconciliationResultSet & Telemetry")
Rel(reconStore, tableViewer, "Subscribes to filtered row slices")
Rel(tableViewer, disputeDrawer, "Selects active invoice for inspection")
Rel(reconStore, statGauge, "Supplies claimed vs available ITC figures")
Rel(tableViewer, imsGuardModal, "Intercepts CRN reject actions")
Rel(tableViewer, waModal, "Opens vendor recovery drawer")

@enduml
```

### 6.2 Dedicated Compute Worker Container Components

```puml
@startuml C4_Component_Worker
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Component.puml

LAYOUT_WITH_LEGEND()

Container_Boundary(workerContainer, "Dedicated Compute Worker (recon-worker.ts)") {
    Component(msgRouter, "WorkerMessageRouter", "TypeScript RPC Dispatcher", "Parses incoming command messages (START_RECON, EXPORT_EXCEL, TRIAGE_IMS) and routes to subsystems.")
    Component(bomTranscoder, "BOMTranscoder", "TextDecoder API", "Strips UTF-8 BOM (0xEF, 0xBB, 0xBF) and transcodes CP1252/ISO-8859-1 byte streams into valid UTF-8.")
    Component(jsonParser, "GSTR2BStreamParser", "Streaming JSON Parser", "Parses official GSTN Schema v1.0 JSON payloads directly into canonical memory structs.")
    Component(xlsxParser, "ERPSpreadsheetParser", "SheetJS Parser", "Extracts raw rows from heterogeneous Excel/CSV purchase registers without main thread lag.")
    Component(columnMapper, "ColumnAutoMapper", "Fuzzy Header Dictionary", "Normalizes disparate ERP aliases (Tally, Busy, Zoho, SAP) into canonical fields via Levenshtein token match.")
    Component(candidateBlocker, "InvertedHashBlocker", "Partitioned Hash Map", "Partitions records by 15-char GSTIN into lookup buckets, reducing pairwise comparisons by 99.95%.")
    Component(waterfallEngine, "SIMDMatchingWaterfall", "5-Stage Cascade Engine", "Executes Pass 1 (Exact), Pass 2 (Syntax+Sec 170), Pass 3 (RapidFuzz), Pass 4 (POS), and Pass 5 (Rule 37A).")
    Component(paiseMath, "PaiseArithmeticEngine", "BigInt64Array Engine", "Performs 64-bit integer monetary arithmetic (1 INR = 100 Paise) with 0.00% float drift.")
    Component(statEngine, "StatutoryRiskEngine", "Rule 88D / Sec 50(3)", "Calculates Rule 88D DRC-01C triggers and Section 50(3) daily compounding penal interest.")
    Component(excelGenerator, "CAAuditExcelBuilder", "SheetJS Binary Builder", "Assembles 6-tab audit workbook injecting dynamic =SUMIFS, =COUNTIF, and =IF spreadsheet formulas.")
}

Rel(msgRouter, bomTranscoder, "Passes raw ArrayBuffers")
Rel(bomTranscoder, jsonParser, "Streams sanitized 2B JSON")
Rel(bomTranscoder, xlsxParser, "Streams sanitized ERP binary")
Rel(xlsxParser, columnMapper, "Extracts raw header rows")
Rel(jsonParser, candidateBlocker, "Emits canonical GSTR-2B items")
Rel(columnMapper, candidateBlocker, "Emits canonical ERP items")
Rel(candidateBlocker, waterfallEngine, "Provides candidate pairs per GSTIN bucket")
Rel(waterfallEngine, paiseMath, "Invokes integer difference & Section 170 checks")
Rel(waterfallEngine, statEngine, "Supplies reconciled totals")
Rel(statEngine, msgRouter, "Packages ReconciliationResultSet with Telemetry")
Rel(msgRouter, excelGenerator, "Dispatches EXPORT_EXCEL command")

@enduml
```

---

## 7. Code Layer Topology (Directory & Module Organization)

The codebase strictly enforces clean architecture, separation of concerns, and zero-cloud execution:

```
src/
├── app/                                    # Next.js 14 App Router (Static Export Target)
│   ├── layout.tsx                          # Root Layout with Tailwind & Dark Mode Providers
│   ├── page.tsx                            # Main Reconciliation Workspace & Dashboard
│   └── globals.css                         # Tailwind CSS Directives & Custom Utility Classes
├── components/                             # React 18 UI Components (Main Thread)
│   ├── dashboard/
│   │   ├── DropzoneZone.tsx                # Dual-file drag-and-drop ingestion container
│   │   ├── TelemetryHUD.tsx                # High-resolution execution ticker (<performance.now()>)
│   │   ├── DRC01CRiskGauge.tsx             # SVG animated statutory threat meter (Rule 88D)
│   │   └── MetricCardTiles.tsx             # Financial summary KPI cards (Claimable, Blocked, Mismatched)
│   ├── grid/
│   │   ├── VirtualReconTable.tsx           # TanStack Virtual v3 headless windowing grid
│   │   ├── ReconTableRow.tsx               # Individual virtual row renderer with status badges
│   │   ├── TableHeaderFilterBar.tsx        # Multi-column search, category filter, and sorting controls
│   │   └── DisputeDetailDrawer.tsx         # Side-by-side character-level discrepancy diff drawer
│   ├── modals/
│   │   ├── CreditNoteSafeguardModal.tsx    # Circular 231/2024 2-step CRN rejection safeguard dialog
│   │   ├── WhatsAppNoticeModal.tsx         # Bilingual (English/Hinglish) wa.me recovery preview modal
│   │   └── DRC01CReplyModal.tsx            # Form DRC-01C Part B legal defense template generator
│   └── ui/                                 # Radix UI Primitives (Button, Dialog, Tooltip, Badge, Dropdown)
├── workers/                                # Dedicated Web Worker Compute Subsystem
│   ├── recon-worker.ts                     # Web Worker entry point & typed RPC message dispatcher
│   ├── ingestion/
│   │   ├── bom-transcoder.ts               # UTF-8 BOM stripper & CP1252/UTF-16 transcoder
│   │   ├── gstr2b-json-parser.ts           # GSTN Schema v1.0 streaming JSON parser
│   │   ├── erp-spreadsheet-parser.ts       # Heterogeneous CSV/XLSX streaming extractor
│   │   └── erp-column-mapper.ts            # Fuzzy header alias normalizer for Tally/Busy/SAP/Zoho
│   ├── engine/
│   │   ├── candidate-blocker.ts            # Inverted hash GSTIN partitioning index (O(N+M))
│   │   ├── waterfall-engine.ts             # 5-Stage SIMD Matching Waterfall Coordinator
│   │   ├── pass1-exact-match.ts            # Pass 1: Deterministic composite exact matcher
│   │   ├── pass2-syntax-normalizer.ts      # Pass 2: Regex syntax, prefix & delimiter sanitizer
│   │   ├── pass3-rapidfuzz-matcher.ts      # Pass 3: RapidFuzz SIMD/WASM & Myers bit-parallel fuzzy matcher
│   │   ├── pass4-pos-taxhead-resolver.ts   # Pass 4: Inter-state vs Intra-state POS tax head swap resolver
│   │   └── pass5-rule37a-aging.ts          # Pass 5: Rule 37A 180-day aging watchdog & defaulter isolation
│   ├── compliance/
│   │   ├── section170-rounding.ts          # Section 170 CGST Act ±₹1.00 tolerance evaluator
│   │   ├── rule88d-risk-calculator.ts      # Rule 88D DRC-01C 20% & ₹25 Lakhs statutory gauge logic
│   │   ├── section50-interest.ts           # Section 50(3) 18% p.a. daily compounding interest calculator
│   │   └── ims-state-machine.ts            # GSTN IMS Advisory 624 Accept/Reject/Pending state machine
│   └── exporter/
│       ├── ca-excel-builder.ts             # SheetJS 6-tab CA audit workbook with dynamic =SUMIFS formulas
│       └── gstr1a-delta-builder.ts         # CBIC Notification 12/2024-CT outward amendment delta JSON builder
├── lib/                                    # Shared Core Utilities & Data Contracts
│   ├── client-guard.ts                     # Zero-cloud network egress monitor & CSP enforcer
│   ├── fixed-point-paise.ts                # BigInt / BigInt64Array currency conversions (toPaise, fromPaise)
│   ├── whatsapp-deeplink.ts                # Client-side wa.me URI builder with English/Hinglish templates
│   ├── worker-bridge.ts                    # Main-thread Promise wrapper for Web Worker RPC
│   └── synthetic-demo-data.ts              # 1-Click "⚡ Load 10,000 Live Records Demo" binary generator
└── types/                                  # Strict TypeScript Interfaces & Type Definitions
    ├── recon-types.ts                      # CanonicalInvoiceRow, MatchPassType, ReconciliationResultSet
    ├── ims-types.ts                        # ImsActionState, ImsDocumentType, ImsOverrideRecord
    ├── worker-messages.ts                  # ReconWorkerRequest, ReconWorkerResponse, WorkerTelemetry
    └── statutory-types.ts                  # Rule88DResult, Section50Result, DRC01CReplyContext
```

---

## 8. Deployment View

### 8.1 Zero-Cloud Static Edge CDN Architecture
ReconcileGST compiles into a 100% static HTML/JS/CSS bundle (`output: 'export'`) hosted on edge Content Delivery Networks (Vercel Edge Network, Cloudflare Pages, or GitHub Pages). The static bundle contains zero server-side runtimes (no Node.js backend, no serverless functions, no centralized database).

```puml
@startuml Deployment_View
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Deployment.puml

LAYOUT_WITH_LEGEND()

Deployment_Node(edgeCdn, "Edge CDN (Vercel / Cloudflare)", "Global Edge PoPs") {
    Container(staticBundle, "Static Application Bundle", "HTML5 / JS / WASM / CSS", "Pre-compiled static web application assets served via immutable HTTPS caching.")
}

Deployment_Node(clientMachine, "Client Laptop / Workstation", "Windows 10/11 / macOS / Linux") {
    Deployment_Node(browserRuntime, "Modern Web Browser", "Chrome / Edge / Firefox / Safari") {
        Container(mainThreadInstance, "Main UI Execution Thread", "JavaScript V8 Engine", "Renders UI, handles user clicks, manages TanStack Virtual grid.")
        Container(workerInstance, "Isolated Background Web Worker", "recon-worker.ts (OS Thread)", "Executes parsing, hash blocking, SIMD fuzzy matching, and Excel binary generation in RAM.")
        Container(localMemory, "Client RAM Allocation", "Contiguous BigInt64Array", "Volatile working memory (480KB per 10k items, cleared upon browser tab close).")
    }
}

Rel(clientMachine, edgeCdn, "1. Fetches Static HTML/JS Bundle (One-Time)", "HTTPS GET (Immutable 1y Cache)")
Rel(mainThreadInstance, workerInstance, "2. Spawns Worker & Posts Raw Blobs", "Web Worker API")
Rel(workerInstance, localMemory, "3. Reads/Writes Fixed-Point Paise Buffers", "Linear Memory Bus")

@enduml
```

### 8.2 Content Security Policy & Network Egress Shield
To provide mathematical and legal proof of zero network egress, the deployment artifact serves strict HTTP headers:
```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'wasm-unsafe-eval' blob:; worker-src blob:; style-src 'self' 'unsafe-inline'; connect-src 'none'; img-src 'self' data:; object-src 'none'; base-uri 'self';
```
> **Security Impact:** The `connect-src 'none'` directive instructs the browser engine to hard-block any outgoing `fetch()`, `XMLHttpRequest`, `WebSocket`, or `EventSource` connection. Even if third-party malicious code were injected, exfiltration of financial records is physically impossible at the browser kernel level.

---

## 9. Crosscutting Concepts

### 9.1 Zero-Cloud Data Sovereignty & DPDP Compliance
- **Data Lifecycle:** Input files are loaded into browser RAM via `FileReader.readAsArrayBuffer()`.
- **Zero Disk Persistence:** No financial records are written to `localStorage` or `IndexedDB` unless explicitly requested for offline session saving.
- **Session Purge:** Closing the browser tab or clicking "Clear Workspace" immediately zeroes out typed arrays (`buffer.fill(0)`), invokes `worker.terminate()`, and triggers V8 Garbage Collection, leaving 0 trace on the host machine.

### 9.2 Error Handling & Worker Heartbeat Watchdog
- **Heartbeat Protocol:** The Main UI Thread initiates an RPC watchdog timer upon sending `START_RECON`. If the worker fails to respond within **5,000ms**, the watchdog triggers an automated worker termination and restarts the worker instance with an actionable UI error alert.
- **Malformed Input Fallbacks:** Malformed CSV rows or unparseable dates are routed to a dedicated `CORRUPT_RECORDS` bucket with specific line-number diagnostics, preventing worker crashes.

### 9.3 High-Resolution Telemetry HUD
- The engine benchmarks every reconciliation pass using `performance.now()`, delivering microsecond-precision telemetry displayed directly on the UI:
  - Total Ingestion & Transcoding Time ($t_{\text{ingest}}$)
  - Inverted Hash Blocking & Bucket Allocation Time ($t_{\text{block}}$)
  - 5-Stage Waterfall Pass-by-Pass Duration ($t_{\text{pass1}}$ to $t_{\text{pass5}}$)
  - Peak Memory Utilization ($M_{\text{peak}}$)

---

## 10. Architecture Decision Summary

| ADR # | Architecture Decision Title | Selected Technical Choice | Governed NFR / Hard Constraint |
| :---: | :--- | :--- | :--- |
| **ADR-001** | Zero-Cloud Web Worker In-Memory Compute | Dedicated `recon-worker.ts` with Transferables | `CON-PRIV-01`, `CON-PRIV-02`, `CON-PERF-01` |
| **ADR-002** | TanStack Virtual v3 DOM Windowing | `@tanstack/react-virtual` Headless Virtualization | `CON-PERF-02`, `GQM-04`, `GQM-05` |
| **ADR-003** | BigInt64Array Fixed-Point Paise Precision | 64-bit Integer Paise ($1\text{ INR} = 100\text{ Paise}$) | `CON-PERF-03`, `GQM-06`, `GQM-07` |
| **ADR-004** | RapidFuzz SIMD/WASM Vectorized Matching | Myers Bit-Parallel SIMD + TS Fallback | `CON-PERF-01`, `FR-03` |
| **ADR-005** | SheetJS 6-Tab Dynamic SUMIFS Exporter | SheetJS Community (`xlsx`) with AST Formulas | `FR-05`, `FR-12`, `GQM-11` |
| **ADR-006** | Client-Side WhatsApp Deep-Link Architecture| Native `wa.me` URI Protocol with Hinglish Templates | `CON-PRIV-01`, `CON-PRIV-04`, `FR-08` |

---

## 11. Risks, Technical Debt & Mitigation Strategies

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                ARCHITECTURAL RISK & MITIGATION REGISTRY                                │
├───────────────────────────────┬────────┬────────┬──────────────────────────────────────────────────────┤
│ Risk Description              │ Impact │ Prob.  │ Architectural Mitigation Strategy                    │
├───────────────────────────────┼────────┼────────┼──────────────────────────────────────────────────────┤
│ **Low-End Client CPU**        │ Medium │ Low    │ Inverted hash blocking prunes 99.95% of comparison   │
│ Processing 100k records on    │        │        │ space; RapidFuzz WASM processes 400k ops/sec; total  │
│ dual-core Celeron machines.   │        │        │ execution stays <800ms even on low-spec hardware.    │
├───────────────────────────────┼────────┼────────┼──────────────────────────────────────────────────────┤
│ **WASM CSP Restrictions**     │ High   │ Low    │ Dual-tier fuzzy engine automatically falls back to   │
│ Corporate firewalls blocking  │        │        │ pure TypeScript Myers 64-bit parallel bit-vector     │
│ `wasm-unsafe-eval` directive. │        │        │ algorithm without breaking user reconciliation.      │
├───────────────────────────────┼────────┼────────┼──────────────────────────────────────────────────────┤
│ **Long WhatsApp URIs**        │ Low    │ Medium │ For vendors with >10 missing invoices, engine        │
│ URIs exceeding 2,048 char     │        │        │ automatically aggregates records into a consolidated │
│ browser deep-link limit.      │        │        │ financial summary with a total count of missing docs.│
├───────────────────────────────┼────────┼────────┼──────────────────────────────────────────────────────┤
│ **Credit Note Rejection Loss**│ High   │ Medium │ Mandatory Radix Dialog interceptor modal requiring   │
│ Inadvertent CA rejection      │        │        │ explicit 2-step confirmation under Circular 231/2024.│
│ increasing supplier tax.      │        │        │                                                      │
└───────────────────────────────┴────────┴────────┴──────────────────────────────────────────────────────┘
```

---

## 12. Architectural Glossary

- **GSTR-2B:** An auto-drafted, static Input Tax Credit (ITC) statement generated by the GSTN portal on the 14th of every month based on supplier GSTR-1/IFF filings.
- **GSTR-3B:** The monthly summary tax return filed by the taxpayer by the 20th of every month to pay net tax liabilities and declare ITC.
- **GSTR-1A:** An intra-month outward amendment return introduced via Notification 12/2024-CT allowing suppliers to add missing invoices before GSTR-3B filing.
- **Form GST DRC-01C:** An automated statutory notice issued under CGST Rule 88D when GSTR-3B claimed ITC exceeds GSTR-2B available credit by $>20\%$ and $>₹25\text{ Lakhs}$.
- **IMS (Invoice Management System):** The GSTN portal mechanism (Advisory 624 / Circular 231/2024) enabling recipients to `ACCEPT`, `REJECT`, or mark `PENDING` on inward invoices.
- **Section 170 (CGST Act):** The statutory rounding rule mandating rounding of tax sums to the nearest whole rupee ($\pm 100\text{ Paise}$).
- **Section 50(3) (CGST Act):** The statutory penal interest mandate levying 18% p.a. daily interest on wrongly availed and utilized ITC.
- **Rule 37A (CGST Rules):** Mandatory ITC reversal rule for supplier invoices where GSTR-1 was filed but supplier failed to file GSTR-3B.
- **Paise:** The fundamental integer currency unit in ReconcileGST ($1\text{ INR} = 100\text{ Paise}$), eradicating IEEE 754 float drift.
