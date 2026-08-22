# Master Adversarial Audit Plan: BRUTAL_AUDITS.md

**Document ID:** `stage_5_prompts/BRUTAL_AUDITS.md`  
**Standard:** Master Engineering Skill (Stage 5: Item 59)  
**Status:** PRODUCTION LOCKED  
**Version:** 1.0.0  
**Author:** Principal Quality & Adversarial Security Architect  
**Governing Inputs:** `stage_4_documents/10_stride_threat_model.md`, `stage_4_documents/03_nfr.md`, `stage_4_documents/02_prd.md`, `stage_4_documents/07_lld.md`  

---

## 1. Adversarial Audit Philosophy & Anti-Pattern Elimination

Traditional automated reviews suffer from **"The Friendly Auditor" anti-pattern**: polite, superficial reviews that output generic praise ("looks good!") while missing memory leaks, floating-point drift, XSS vulnerabilities, and WCAG contrast failures.

The **ReconcileGST Brutal Audit Framework** enforces ruthless, adversarial scrutiny. Every auditor persona acts as a hostile interrogator, red-team penetration tester, or strict tax court judge whose explicit goal is to **break the application**, uncover hidden flaws, and prevent any substandard code from entering production.

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   BRUTAL AUDIT EXECUTION MATRIX                                        │
├──────┬───────────────────────────────┬───────────────────────────────┬─────────────────────────────────┤
│ #    │ Audit Domain & Scope          │ Milestone Trigger Point       │ Governing Specification         │
├──────┼───────────────────────────────┼───────────────────────────────┼─────────────────────────────────┤
│ **1**│ TypeScript Type Safety & SOLID│ Post-Phase 1 & Post-Phase 2   │ `01_code_quality_audit.md`      │
│ **2**│ Red Team Security & DPDP Act  │ Post-Phase 2 & Post-Phase 6   │ `02_security_audit.md`          │
│ **3**│ Sub-300ms Performance & Memory│ Post-Phase 2 & Post-Phase 6   │ `03_performance_audit.md`       │
│ **4**│ WCAG 2.1 AA/AAA Accessibility │ Post-Phase 4 & Release Gate   │ `04_accessibility_audit.md`     │
│ **5**│ PRD Gherkin Feature Acceptance│ Post-Phase 5 & Release Gate   │ `05_feature_completeness_audit` │
└──────┴───────────────────────────────┴───────────────────────────────┴─────────────────────────────────┘
```

---

## 2. Milestone-Triggered Audit Deployment Plan

### Audit 1: Ingestion & Memory Buffer Integrity Sweep
- **Milestone Trigger:** Immediately after completing Phase 1 (Core Ingestion & Memory Structs, Checkpoint C-001).
- **Executing Auditor:** Senior Data Quality & Memory Systems Auditor.
- **Audit Focus:**
  - Verify 48-byte `BigInt64Array` stride allocation and zero floating-point arithmetic across 100k random rows.
  - Verify UTF-8 BOM stripping (`0xEF, 0xBB, 0xBF`) on corrupted Tally CSV files without glyph destruction.
  - Verify fuzzy header auto-mapping across Tally, Zoho, Busy, SAP, and Marg exports.
- **Pass Gate:** 0 floating-point operations in currency routines; 0 memory buffer overruns; 100% alias resolution.

---

### Audit 2: Web Worker, SIMD Engine & IPC Threading Audit
- **Milestone Trigger:** Immediately after completing Phase 2 (5-Stage SIMD Matching Engine & Worker IPC, Checkpoint C-002).
- **Executing Auditor:** Principal High-Performance Systems Reviewer.
- **Audit Focus:**
  - Audit candidate blocking index: verify $O(N+M)$ complexity and $>99.9\%$ comparison space reduction.
  - Audit Pass 1 through Pass 5 waterfall: verify deterministic match scoring and Section 170 $\pm ₹1.00$ boundaries.
  - Intercept `postMessage` calls: assert zero-copy `ArrayBuffer` transfer detachment (`buffer.byteLength === 0` in worker).
  - Verify 5,000ms watchdog timeout terminates runaway worker matching loops gracefully.
- **Pass Gate:** 10,000 records matched in $<300\text{ms}$; 0 unhandled WASM traps; zero main-thread blocking ($0.0\text{ms}$ Long Tasks).

---

### Audit 3: Statutory Compliance & Legal Jurisprudence Audit
- **Milestone Trigger:** Immediately after completing Phase 3 (Statutory Sentinel & IMS Pre-Triage, Checkpoint C-003).
- **Executing Auditor:** Statutory Tax Court Assessor & Jurisprudence Auditor.
- **Audit Focus:**
  - Rule 88D DRC-01C Exposure Gauge: verify dual-condition trigger ($>20\%$ variance AND $>₹25\text{ Lakhs}$).
  - Section 50(3) Interest Engine: assert 18% p.a. daily compounding formula against actuarial tables.
  - GSTN IMS State Machine: attempt direct one-click rejection of a Credit Note (`documentType === 'CRN'`); verify mandatory Circular 231/2024 2-step confirmation modal blocks action.
  - Form DRC-01C Part B Legal Reply: verify accurate citations to *D.Y. Beathel* (Madras HC) and *Suncraft Energy* (Calcutta HC).
- **Pass Gate:** 100.0% compliance on statutory rules; 0 false DRC-01C triggers on sub-₹25L variances.

---

### Audit 4: Virtual Data Grid 60 FPS & Visual Dispute Studio Audit
- **Milestone Trigger:** Immediately after completing Phase 4 (Virtual Data Grid & Split Diff Drawer, Checkpoint C-004).
- **Executing Auditor:** UI Performance & Accessibility Auditor.
- **Audit Focus:**
  - TanStack Virtual v3 Grid: measure active mounted DOM nodes during continuous scroll on 50,000 rows (must stay $\le 30$ elements).
  - Frame Render Budget: verify frame times remain strictly $<16.6\text{ms}$ (60 FPS sustained).
  - Split Difference Drawer: verify character-level red/green diffing renders in $<100\text{ms}$.
  - WhatsApp Deep-Link Builder: verify URL encoding and 2,000-character URI overflow auto-truncation.
- **Pass Gate:** 60.0 FPS locked grid scrolling; $<42\text{MB}$ JS heap memory; zero DOM node leaks.

---

### Audit 5: CA Multi-Tab Exporter & GSTR-1A Builder Audit
- **Milestone Trigger:** Immediately after completing Phase 5 (CA Multi-Tab Exporter, Checkpoint C-005).
- **Executing Auditor:** Financial Spreadsheet & Schema Integrity Auditor.
- **Audit Focus:**
  - SheetJS 6-Tab Workbook: open in Excel 365, LibreOffice, and Apple Numbers; assert all 6 color-coded tabs exist.
  - Live Dynamic Formulas: inspect summary cells; verify live `=SUMIFS(...)` and `=COUNTIF(...)` formulas calculate dynamically with 0 `#REF!` or `#VALUE!` errors.
  - Anti-CSV Injection: inject formula payloads (`=cmd|'/C calc'!A0`, `+12345`, `-9999`, `@SUM(...)`); verify exporter prefixes with single quote (`'`).
  - Form GSTR-1A JSON: validate exported delta JSON against CBIC Notification 12/2024-CT schema (`DD-MM-YYYY` dates, 2-decimal floats).
- **Pass Gate:** 100% working formulas; 0 CSV injection vectors; valid GSTN JSON.

---

### Audit 6: Red Team Security & DPDP Act Zero-Egress Penetration Audit
- **Milestone Trigger:** Release Gate (Checkpoint C-006 & C-008).
- **Executing Auditor:** Red Team Penetration Tester & DPDP Compliance Officer (`02_security_audit.md`).
- **Audit Focus:**
  - Network Egress Interception: monitor all network traffic via Chrome DevTools Network Panel, WireShark, and `PerformanceObserver`; assert EXACTLY 0 bytes transmitted.
  - Content Security Policy (CSP): verify `connect-src 'none'`, `frame-ancestors 'none'`, and `object-src 'none'` headers.
  - Ephemeral Memory Sanitization: assert `BigInt64Array.fill(0n)` and worker termination upon session reset.
  - Untrusted Event Injection: inject synthetic drag events (`isTrusted: false`); verify rejection.
- **Pass Gate:** Exactly 0 network bytes egress; 100% DPDP Act zero-fiduciary client-side exemption.

---

### Audit 7: High-Volume Performance & Memory Stress Gauntlet
- **Milestone Trigger:** Release Gate (Checkpoint C-006).
- **Executing Auditor:** Performance & Load Stress Engineer (`03_performance_audit.md`).
- **Audit Focus:**
  - 10,000-Row Standard Benchmark: assert ingestion + matching executes in $<300\text{ms}$ (target: $\sim 242\text{ms}$).
  - 50,000-Row Stress Benchmark: assert execution completes in $<350\text{ms}$ with peak RAM $<88\text{MB}$.
  - 1-Click Demo Trigger: assert click-to-rendered-UI completes in $<500\text{ms}$.
  - Main Thread Blocking: assert $0.0\text{ms}$ Long Tasks ($>50\text{ms}$).
- **Pass Gate:** Sub-300ms 10k execution; $<42\text{MB}$ peak heap on 10k; 60 FPS scrolling.

---

### Audit 8: WCAG 2.1 Level AA/AAA Accessibility & Ergonomics Audit
- **Milestone Trigger:** Release Gate (Checkpoint C-007).
- **Executing Auditor:** Certified Accessibility Auditor (`04_accessibility_audit.md`).
- **Audit Focus:**
  - Automated Scan: run `axe-core` across all views and drawers (assert 0 violations).
  - Contrast Ratios: verify all text elements against dark slate backgrounds (`#020617` / `#0F172A`) achieve $\ge 4.5:1$ (AA) and financial cells achieve $\ge 7.0:1$ (AAA).
  - Multi-Sensory Indicators: verify no status is indicated by color alone (must combine icon + text + border).
  - Full Keyboard Drill: complete full workflow (dropzone $\to$ table navigation $\to$ open drawer $\to$ IMS action $\to$ export) using only `Tab`, `Enter`, `Escape`, `Arrow Keys`, `Space`.
- **Pass Gate:** 0 axe-core errors; 100% keyboard navigable; WCAG 2.1 AA/AAA certified.

---

### Audit 9: Full PRD Gherkin Feature Acceptance Audit
- **Milestone Trigger:** Final Release Sign-Off (Checkpoint C-008).
- **Executing Auditor:** Lead QA Acceptance Specialist (`05_feature_completeness_audit.md`).
- **Audit Focus:**
  - Validate all 17 User Stories (US-001 through US-017) and 34 Acceptance Criteria from `stage_4_documents/02_prd.md`.
  - Verify every Must-Have and Should-Have feature is 100% functional.
  - Verify 0.00% floating-point drift across all aggregated totals.
- **Pass Gate:** 100% acceptance criteria pass. Zero open critical or high defects.

---

## 3. Standardized Defect Reporting Format

Every audit finding must be reported using this exact template. Vague or diplomatic suggestions are strictly forbidden:

```markdown
### [DEFECT-ID]: [Concise Defect Title]
- **Audit Type:** [Code Quality / Security / Performance / Accessibility / Feature Completeness]
- **Severity:** [CRITICAL / HIGH / MEDIUM / LOW]
- **Location:** `path/to/file.ts:LineNumber`
- **Statutory / NFR Violation:** [e.g. Rule 88D / DPDP Act / CON-PERF-01 / WCAG 2.1 AA]
- **Observed Behavior:** [Exact technical flaw observed with reproduction steps]
- **Expected Behavior:** [What the specification strictly requires]
- **Brutal Remediation Code:**
```typescript
// Exact drop-in replacement code to resolve the defect
```
```

---

## 4. Defect Severity Classification & SLA

| Severity Level | Definition | Release Impact | Resolution SLA |
|:---|:---|:---|:---|
| **CRITICAL** | Data corruption, float drift, network data egress (DPDP breach), crash on 10k dataset, or Rule 88D logic flaw. | **HARD BLOCKER** — Zero release until fixed. | Immediate (<2 hours). |
| **HIGH** | Performance breach (>300ms), virtual grid DOM leak (>35 rows), missing dynamic `=SUMIFS`, or unescaped CSV cell. | **BLOCKER** — Blocks tier promotion. | <4 hours. |
| **MEDIUM** | Minor syntax normalization edge case, WCAG contrast $<4.5:1$, or missing fallback banner. | Must be fixed before final presentation. | <8 hours. |
| **LOW** | Minor code duplication or non-standard variable naming outside hot loops. | Fix during polish phase. | <12 hours. |
