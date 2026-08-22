# Master Architectural Data Flow & Interaction Sequences

**Document ID:** `stage_4_documents/08_data_flow_sequences.md`  
**Version:** 1.0 (BASELINED)  
**Date:** 2026-08-21  
**Author:** Principal Systems & Software Architect (Team Binary Brains)  
**Parent Blueprints:** `stage_4_documents/05_architecture_plan.md`, `stage_4_documents/06_hld.md`, `stage_4_documents/07_lld.md`  
**Governing Inputs:** `stage_2_decision_lock/23_locked_scope.md`, `stage_3_research/25_stack_research.md`, `stage_4_documents/adrs/ADR-001` through `ADR-006`  
**Target Scope:** Comprehensive Mermaid Sequence Diagrams modeling the 5 primary runtime flows of the ReconcileGST edge suite

---

## 1. Sequence 1: Dual-Source Ingestion & Zero-Copy Worker Parsing Flow

This sequence models the zero-cloud file ingestion workflow where raw GSTR-2B JSON and heterogeneous ERP Excel/CSV registers are read into browser memory via HTML5 `FileReader` and transferred to the background Web Worker for UTF-8 BOM transcoding, fuzzy column normalization, and contiguous typed memory buffer allocation.

```mermaid
sequenceDiagram
    autonumber
    actor CA as Chartered Accountant / User
    participant Dropzone as DropzoneZone.tsx (UI)
    participant Reader as HTML5 FileReader API
    participant Bridge as worker-bridge.ts
    participant Worker as recon-worker.ts (OS Thread)
    participant Transcoder as BOMTranscoder
    participant Parser as GSTR2B / ERP Stream Parser
    participant Mapper as ColumnAutoMapper
    participant RAM as In-Memory BigInt64Array

    CA->>Dropzone: Drags & drops GSTR-2B JSON and ERP Excel/CSV
    Dropzone->>Dropzone: Validate file extensions (.json, .xlsx, .csv)
    Dropzone->>Reader: readAsArrayBuffer(erpFile), readAsArrayBuffer(gstr2bFile)
    Reader-->>Dropzone: Return raw ArrayBuffers (Local RAM only)
    
    Dropzone->>Bridge: startReconciliation(erpBuf, gstr2bBuf, { period: '082026' })
    Note over Bridge,Worker: Zero-Copy Transferable Buffer Passing (<0.15ms)
    Bridge->>Worker: postMessage({ type: 'START_RECON', erpBuf, gstr2bBuf }, [erpBuf, gstr2bBuf])
    
    Worker->>Transcoder: sanitizeAndDecode(erpBuf), sanitizeAndDecode(gstr2bBuf)
    Note over Transcoder: Strip UTF-8 BOM (0xEF, 0xBB, 0xBF) & transcode CP1252 to UTF-8
    Transcoder-->>Worker: Clean UTF-8 Byte Streams
    
    Worker->>Parser: Stream parse GSTR-2B JSON (Schema v1.0)
    Parser-->>Worker: Emit GSTR2B Canonical Invoices
    
    Worker->>Parser: Stream parse ERP Spreadsheet rows
    Parser->>Mapper: normalizeHeaders(rawHeaderRow)
    Note over Mapper: Levenshtein token match across Tally, Busy, Zoho, SAP aliases
    Mapper-->>Parser: Resolved Canonical Header Map
    Parser-->>Worker: Emit ERP Canonical Invoices
    
    Worker->>RAM: Allocate contiguous 48-byte BigInt64Array tuples
    Note over RAM: Pack Taxable, IGST, CGST, SGST, Cess, Total into 64-bit Paise
    RAM-->>Worker: Memory Buffers Ready
    
    Worker-->>Bridge: postMessage({ type: 'INGESTION_COMPLETE', recordCount: 10000, durationMs: 42.5 })
    Bridge-->>Dropzone: Update Telemetry HUD with Ingestion Metrics
```

---

## 2. Sequence 2: 5-Stage SIMD Matching Waterfall Execution Pipeline

This sequence illustrates the end-to-end execution of the multi-pass reconciliation waterfall inside `recon-worker.ts`, including inverted hash candidate blocking ($O(N+M)$), exact composite matching, syntax & Section 170 statutory rounding normalization, SIMD RapidFuzz fuzzy scoring, Place of Supply (POS) tax head resolution, and zero-copy transfer of the result payload to the main UI thread.

```mermaid
sequenceDiagram
    autonumber
    participant Worker as recon-worker.ts
    participant Blocker as InvertedHashBlocker
    participant RAM as In-Memory BigInt64Array
    participant Pass1 as Pass 1: Exact Match
    participant Pass2 as Pass 2: Syntax & Sec 170
    participant Pass3 as Pass 3: RapidFuzz SIMD
    participant Pass4 as Pass 4: POS Resolver
    participant Pass5 as Pass 5: Rule 37A Aging
    participant Bridge as worker-bridge.ts
    participant Grid as TanStack Virtual v3 Grid

    Worker->>Blocker: partitionCandidates(erpRecords, gstr2bRecords)
    Note over Blocker: Inverted Hash Map Partitioning: O(N+M)<br/>Prunes 99.80% of quadratic comparisons
    Blocker-->>Worker: Return Disjoint GSTIN Candidate Buckets

    loop For Each Disjoint GSTIN Bucket
        Worker->>Pass1: executePass1ExactMatch(bucket)
        Pass1->>RAM: Direct 64-bit ALU comparison
        Pass1-->>Worker: Mark Exact Matches (Score: 1.0, Delta: 0)

        Worker->>Pass2: executePass2SyntaxAndRounding(remainingRecords)
        Note over Pass2: Regex strip prefixes/delimiters + Sec 170 (<= 100 Paise / ₹1.00)
        Pass2-->>Worker: Mark Syntax & Rounding Matches

        Worker->>Pass3: executePass3RapidFuzz(remainingRecords)
        Note over Pass3: Vectorized Myers 64-bit Bit-Parallel Score >= 0.85 (±31 days window)
        Pass3-->>Worker: Mark Fuzzy Typo / OCR Matches

        Worker->>Pass4: executePass4PosResolver(remainingRecords)
        Note over Pass4: Total Match + IGST vs CGST/SGST Swap (Table 9A Adjustment)
        Pass4-->>Worker: Mark POS Tax Head Swap Matches

        Worker->>Pass5: executePass5Rule37aAging(unmatchedRecords)
        Note over Pass5: Partition Unmatched ERP (Defaulters) and Unmatched 2B (Unclaimed)
        Pass5-->>Worker: Mark Defaulters with 30d/60d/90d/180d+ Aging
    end

    Worker->>Worker: Compile ReconciliationResultSet & Execution Telemetry
    Worker-->>Bridge: postMessage({ type: 'RECON_COMPLETE', results, telemetry }, [results.buffer])
    Note over Bridge,Grid: Zero-Copy Transfer (<0.15ms)
    Bridge->>Grid: Set reconciled dataset (50,000 rows)
    Note over Grid: Mount 25-30 active DOM nodes. Render 60 FPS Table!
```

---

## 3. Sequence 3: GSTN IMS Action Triage & Credit Note Safety Interceptor

This sequence models the user interaction flow for GSTN Invoice Management System (IMS) action declarations (`ACCEPT`, `REJECT`, `PENDING`) under GSTN Advisory No. 624 / Circular 231/2024, demonstrating the mandatory two-step confirmation interceptor whenever a user attempts to reject a Credit Note (`documentType === 'CRN'`).

```mermaid
sequenceDiagram
    autonumber
    actor CA as Chartered Accountant / User
    participant Row as ReconTableRow.tsx (UI)
    participant Store as useReconStore.ts (Zustand)
    participant FSM as ImsStateMachine
    participant Modal as CreditNoteSafeguardModal.tsx
    participant Worker as recon-worker.ts
    participant HUD as TelemetryHUD.tsx

    CA->>Row: Clicks "Reject" action button on invoice row
    Row->>Store: setImsAction(invoiceId, 'REJECT')
    Store->>FSM: transition(currentInvoice, 'REJECT', explicitCrnOverride = false)

    alt Document is Standard Invoice (documentType === 'INV')
        FSM-->>Store: { success: true, newState: 'REJECT' }
        Store->>Worker: postMessage({ type: 'UPDATE_IMS_STATE', invoiceId, state: 'REJECT' })
        Worker-->>Store: Return updated net claimable ITC metrics
        Store->>HUD: Update Live Eligible ITC & DRC-01C Threat Gauge
        Store->>Row: Re-render row with Amber "REJECTED" badge
    else Document is Credit Note (documentType === 'CRN')
        FSM-->>Store: { success: false, requiresModalWarning: true, error: 'Circular 231/2024 Alert' }
        Store->>Modal: Open 2-Step Credit Note Safeguard Dialog
        Modal-->>CA: Display Warning: "Rejecting this Credit Note increases supplier tax liability. Confirm legal dispute."
        
        alt CA Cancels / Aborts
            CA->>Modal: Clicks "Cancel"
            Modal->>Store: Abort transition
            Store->>Row: Maintain existing state ('NONE')
        else CA Confirms Explicitly
            CA->>Modal: Checks "[X] Confirm Legal Dispute" & clicks "Confirm Rejection"
            Modal->>Store: forceImsAction(invoiceId, 'REJECT', explicitCrnOverride = true)
            Store->>FSM: transition(currentInvoice, 'REJECT', explicitCrnOverride = true)
            FSM-->>Store: { success: true, newState: 'REJECT' }
            Store->>Worker: postMessage({ type: 'UPDATE_IMS_STATE', invoiceId, state: 'REJECT' })
            Worker-->>Store: Return updated net claimable ITC metrics
            Store->>HUD: Update Live Eligible ITC & DRC-01C Threat Gauge
            Store->>Row: Re-render row with Red "CRN REJECTED" badge
        end
    end
```

---

## 4. Sequence 4: 1-Click WhatsApp Vendor Recovery Deep-Link Generation

This sequence details the vendor intimation workflow where a CA initiates communication with a defaulting supplier whose invoices are missing from Form GSTR-2B. The client-side deep link engine synthesizes pre-formatted bilingual (English/Hinglish) statutory recovery notices and hands off execution to the native WhatsApp client via `wa.me` URI protocols with zero cloud data egress and ₹0 operational cost.

```mermaid
sequenceDiagram
    autonumber
    actor CA as Chartered Accountant / User
    participant Row as ReconTableRow.tsx (UI)
    participant Engine as whatsapp-deeplink.ts
    participant Modal as WhatsAppNoticeModal.tsx
    participant Browser as Browser Window (Client Runtime)
    participant WA as WhatsApp Web / Desktop Client
    actor Vendor as Defaulting Supplier

    CA->>Row: Clicks "📱 WhatsApp Intimate" on defaulting supplier row
    Row->>Modal: openNoticePreview(supplierGstin, invoiceNumber, taxAmount, supplierPhone)
    
    Modal->>Engine: synthesizeWhatsAppDeepLink({ language: 'HINGLISH', ...params })
    Note over Engine: Synthesize URL-encoded Markdown notice in local RAM (0 Net Egress)
    Engine-->>Modal: Return generated wa.me URI string
    
    Modal-->>CA: Render Live Interactive Notice Preview Modal
    
    opt CA Toggles Language to English
        CA->>Modal: Clicks "English Formal Notice" Toggle
        Modal->>Engine: synthesizeWhatsAppDeepLink({ language: 'EN', ...params })
        Engine-->>Modal: Return English wa.me URI string
        Modal-->>CA: Update live preview text with Section 16(2)(aa) statutory notice
    end

    CA->>Modal: Clicks "Open WhatsApp & Send"
    Modal->>Browser: window.open('https://wa.me/919876543210?text=...', '_blank')
    Browser->>WA: Launch native WhatsApp Web or Desktop application
    
    Note over WA: WhatsApp opens chat with pre-populated statutory notice
    CA->>WA: Presses "Send" (Human-in-the-loop statutory verification)
    WA->>Vendor: Dispatches end-to-end encrypted GST discrepancy notice
```

---

## 5. Sequence 5: 6-Tab CA Audit-Ready Excel Binary Construction & Download

This sequence shows the generation of the standardized 6-tab CA Audit Workbook containing live, dynamic `=SUMIFS`, `=COUNTIF`, and `=IF` formulas. The workbook binary is compiled in Web Worker RAM using SheetJS, packaged into an OpenXML `.xlsx` byte buffer, and saved directly to the local filesystem via HTML5 Blob URL without touching an external server.

```mermaid
sequenceDiagram
    autonumber
    actor CA as Chartered Accountant / User
    participant Header as DashboardHeader.tsx (UI)
    participant Bridge as worker-bridge.ts
    participant Worker as recon-worker.ts
    participant SheetJS as CAAuditExcelBuilder (xlsx)
    participant BlobEngine as HTML5 Blob & URL API
    participant FS as Local File System (OS Save Dialog)

    CA->>Header: Clicks "📥 Export CA Audit Excel (.xlsx)"
    Header->>Bridge: exportCAAuditWorkbook(reconciliationId, { dynamicFormulas: true })
    
    Bridge->>Worker: postMessage({ type: 'EXPORT_EXCEL', dynamicFormulas: true })
    Note over Worker: Execute in dedicated background OS thread (0ms UI freeze)
    
    Worker->>SheetJS: book_new()
    
    Worker->>SheetJS: Build Tab 1: Executive_Summary
    Note over SheetJS: Inject dynamic formulas: =SUMIFS(Matched!H:H, ...), =IF(...)
    
    Worker->>SheetJS: Build Tab 2: Matched_Reconciled (Exact, Sec 170, RapidFuzz)
    Worker->>SheetJS: Build Tab 3: Missing_in_2B_Default (Blocked ITC, Defaulters)
    Worker->>SheetJS: Build Tab 4: Missing_in_PR_Unclaimed (Unclaimed Portal ITC)
    Worker->>SheetJS: Build Tab 5: Tax_Head_Mismatches (POS & Table 9A Reallocations)
    Worker->>SheetJS: Build Tab 6: DRC_01C_Audit_Trail (Rule 88D Working Sheet)
    
    Worker->>SheetJS: XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    Note over SheetJS: OpenXML ZIP binary compilation (<350ms for 10k rows)
    SheetJS-->>Worker: Return compiled Uint8Array binary buffer
    
    Worker-->>Bridge: postMessage({ type: 'EXPORT_COMPLETE', excelBuffer }, [excelBuffer.buffer])
    Note over Bridge: Zero-copy ArrayBuffer transfer (<0.15ms)
    
    Bridge->>BlobEngine: new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    BlobEngine-->>Bridge: Return local Blob instance
    Bridge->>BlobEngine: URL.createObjectURL(blob)
    BlobEngine-->>Bridge: Return blob:http://localhost/... URL
    
    Bridge->>FS: Trigger synthetic <a download="ReconcileGST_Audit_Report.xlsx"> click
    FS-->>CA: Browser prompts native file save / Downloads to local drive
    Bridge->>BlobEngine: URL.revokeObjectURL(url) (Immediate RAM cleanup)
```
