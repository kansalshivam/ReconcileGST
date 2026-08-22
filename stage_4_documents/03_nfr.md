# Non-Functional Requirements (NFR) Document

**Document ID:** `stage_4_documents/03_nfr.md`  
**Version:** 1.0  
**Date:** 2026-08-21  
**Status:** APPROVED & BASELINED  
**Author:** AI Agent (Chief Architect & Systems Analyst persona)  
**Standard:** ISO/IEC 25010 Systems and Software Quality Requirements and Evaluation (SQuaRE)  
**Governing Inputs:** 
- `stage_4_documents/02_prd.md` (Product Requirements Document v2.0)
- `stage_0_artifacts/03_hard_constraints.md` (Statutory & Technical Constraints)
- `stage_2_decision_lock/24_success_metrics.md` (GQM Framework & OKRs)
- `stage_3_research/25_stack_research.md` (Technology Stack & Benchmarks)
- `stage_3_research/28_compliance_checklist.md` (Compliance Verification Matrix)

---

## Executive Quality Architecture

The Non-Functional Requirements for **ReconcileGST** are structured according to the international **ISO/IEC 25010** software quality model. Every requirement adheres to the **SMART** framework (Specific, Measurable, Achievable, Relevant, Time-bound) and is accompanied by a concrete verification protocol, tooling specification, and empirical engineering justification.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                             ISO/IEC 25010 SOFTWARE QUALITY MODEL                                 │
├───────────────────────────────┬──────────────────────────────────┬───────────────────────────────┤
│ 1. PERFORMANCE EFFICIENCY     │ 2. RELIABILITY & AVAILABILITY    │ 3. SECURITY & DATA PRIVACY    │
│ • Sub-300ms 10k Worker Match  │ • 99.99% Static Edge Uptime      │ • Zero-Cloud (0 Bytes Egress) │
│ • 60 FPS Virtualized Grid     │ • Zero Runtime Exception Rate    │ • DPDP Act 2023 Exemption     │
│ • <42MB Peak JS Heap Memory   │ • Deterministic Idempotency      │ • Strict CSP connect-src none │
├───────────────────────────────┼──────────────────────────────────┼───────────────────────────────┤
│ 4. USABILITY & ACCESSIBILITY  │ 5. MAINTAINABILITY & QUALITY     │ 6. PORTABILITY & STATUTORY    │
│ • WCAG 2.2 Level AA Contrast  │ • 100% Strict TypeScript Mode    │ • Evergreen Browser Agnostic  │
│ • Full Keyboard Navigation    │ • Zero Implicit 'any' Types      │ • 0.00% Paise Arithmetic Drift│
│ • <500ms 1-Click Demo Launch  │ • ≥90% Automated Test Coverage   │ • Section 170 Rounding Settle │
└───────────────────────────────┴──────────────────────────────────┴───────────────────────────────┘
```

---

## 1. Performance Efficiency (ISO/IEC 25010 §4.2)

### 1.1 Requirements Specification Table

| ID | Requirement Statement | Quantitative Target | Measurement Method | Verification Tooling | Priority |
|:---|:---|:---|:---|:---|:---:|
| **PERF-01** | **Standard Ingestion & Matching Latency** | **$< 300\text{ ms}$** (Typical: $\sim 242\text{ms}$) for 10,000 messy records | Time from worker message post to response event (`performance.now()`) | Web Worker Execution Timer & UI HUD | **Must-Have** |
| **PERF-02** | **Stress Ingestion & Matching Latency** | **$< 350\text{ ms}$** for 50,000 enterprise records | High-resolution timestamp differential | Playwright Stress Test Suite | **Must-Have** |
| **PERF-03** | **Tabular Rendering Frame Rate** | **$60\text{ FPS}$ sustained** (Frame budget $\le 16.6\text{ms}$; 0 dropped frames during rapid scroll) | Chrome DevTools Frame Rate Profiler during continuous mouse-wheel drag | Chrome DevTools Performance Profiler | **Must-Have** |
| **PERF-04** | **DOM Element Clamping** | **$\le 30\text{ active DOM rows}$** rendered regardless of dataset size (up to 100k rows) | Count of rendered `<tr>` / `<div>` elements in table container | TanStack Virtual DOM Inspector | **Must-Have** |
| **PERF-05** | **Client Heap Memory Footprint** | **$< 42\text{ MB}$ peak RAM** for 10,000 records; Hard ceiling: **$< 88\text{ MB}$** for 50,000 records | `performance.memory.usedJSHeapSize` delta before vs. after run | Chrome Heap Snapshot & Allocation Timeline | **Must-Have** |
| **PERF-06** | **Main Thread Blocking Duration** | **$0.0\text{ ms}$ Long Tasks** on main thread ($>50\text{ms}$) during matching execution | Long Tasks API (`PerformanceObserver`) recording task durations | Chrome Performance Panel Audit | **Must-Have** |
| **PERF-07** | **Initial Page Load & TTI** | **Largest Contentful Paint (LCP) $< 1.2\text{s}$**; Time to Interactive (TTI) $< 1.5\text{s}$ on 4G Fast | Lighthouse Mobile/Desktop Audit on cold cache | Google Lighthouse CI v11+ | **Must-Have** |
| **PERF-08** | **1-Click Demo Execution Time** | **$< 500\text{ ms}$ end-to-end** from button click to fully interactive UI render | Total wall-clock time from click event to table paint | Playwright E2E Timestamp Assertion | **Must-Have** |
| **PERF-09** | **Excel Binary Assembly Latency** | **$< 350\text{ ms}$** to generate 6-tab OpenXML `.xlsx` with dynamic `=SUMIFS` | High-resolution timer across SheetJS binary compilation | Jest Benchmark Suite | **Must-Have** |

---

## 2. Reliability & Availability (ISO/IEC 25010 §4.3)

### 2.1 Requirements Specification Table

| ID | Requirement Statement | Quantitative Target | Measurement Method | Verification Tooling | Priority |
|:---|:---|:---|:---|:---|:---:|
| **REL-01** | **Static Web Hosting Availability** | **$\ge 99.99\%$ Uptime** (Max allowable downtime $< 52.6\text{ min/year}$) | Continuous HTTP 200 health probe on edge CDN endpoints | UptimeRobot / Pingdom Edge Monitor | **Must-Have** |
| **REL-02** | **Runtime Unhandled Exception Rate** | **$0.00\%$ unhandled crashes** (`window.onerror` event count = 0 across all runs) | Sentry / Browser global error handler trap during stress testing | Automated Playwright Fuzzing Test Suite | **Must-Have** |
| **REL-03** | **Execution Idempotency** | **$100.0\%$ deterministic output** (identical output hash on re-running identical input) | SHA-256 hash comparison across 1,000 repeated runs of identical file | Jest Idempotency Test Suite | **Must-Have** |
| **REL-04** | **Web Worker Fault Isolation & Fallback**| **Graceful degradation**; if Web Worker fails to spawn, execute on main thread with warning | Worker error event trap & synthetic worker failure test | Unit Test Worker Fallback Harness | **Should-Have** |
| **REL-05** | **State Resilience across Tab Navigation**| **Zero state loss** when navigating across tabs or switching OS windows | Session state persistence check in browser memory | Playwright Multi-Tab Scenario Suite | **Must-Have** |

---

## 3. Security & Data Privacy (ISO/IEC 25010 §4.4)

### 3.1 Requirements Specification Table

| ID | Requirement Statement | Quantitative Target | Measurement Method | Verification Tooling | Priority |
|:---|:---|:---|:---|:---|:---:|
| **SEC-01** | **Zero Network Data Egress** | **EXACTLY $0\text{ Bytes}$** of invoice or financial ledger data transmitted over network | Outbound HTTP/WebSocket/WebRTC packet interceptor | Chrome DevTools Network Panel / WireShark | **Must-Have** |
| **SEC-02** | **DPDP Act 2023 Compliance** | **$100\%$ Client-Side Exemption**; platform does not act as Data Fiduciary under Sec 4/6 | Statutory compliance legal audit and zero data storage audit | Legal Compliance Checklist (`28_compliance_checklist.md`) | **Must-Have** |
| **SEC-03** | **Content Security Policy (CSP)** | **Strict CSP Level 3**: `connect-src 'none'`; `script-src 'self' blob:; worker-src blob:;` | HTTP response header verification & CSP violation listener | SecurityHeaders.com / CSP Evaluator | **Must-Have** |
| **SEC-04** | **Ephemeral Memory Sanitization** | **Immediate zeroing of TypedArrays** upon session reset / window unload | Assert `BigInt64Array.fill(0)` and worker termination on reset | Jest Memory Cleanup Unit Test | **Must-Have** |
| **SEC-05** | **Zero Third-Party Tracking / Adware** | **0 external tracking scripts** (no Google Analytics, Mixpanel, or Facebook Pixel) | Sub-resource integrity and script audit in production bundle | Bundle Visualizer & Network Profiler | **Must-Have** |
| **SEC-06** | **XSS & Injection Protection** | **100% string sanitization**; zero executable script execution from CSV/JSON inputs | OWASP Top 10 XSS payload injection test into vendor names | DOMPurify / React JSX auto-escaping test | **Must-Have** |

---

## 4. Usability & Accessibility (ISO/IEC 25010 §4.5)

### 4.1 Requirements Specification Table

| ID | Requirement Statement | Quantitative Target | Measurement Method | Verification Tooling | Priority |
|:---|:---|:---|:---|:---|:---:|
| **USE-01** | **WCAG 2.2 Level AA Contrast Ratio** | **$\ge 4.5:1$ contrast ratio** for normal text; $\ge 3.0:1$ for large text and UI badges | Color contrast analysis across all dark theme chromatic tokens | axe-core v4.9+ / Chrome Lighthouse Audit | **Must-Have** |
| **USE-02** | **Full Keyboard Navigation (A11y)** | **$100\%$ operable via keyboard** (`Tab`, `Enter`, `Escape`, `Arrow Keys`, `Space`) | Keyboard-only complete workflow audit from ingestion to export | Manual Keyboard Navigation Drill | **Must-Have** |
| **USE-03** | **Screen Reader ARIA Semantics** | **$100\%$ compliance**; all interactive elements have valid `aria-label` / `role` | Automated accessibility tree inspection | NVDA / VoiceOver / axe-core audit | **Must-Have** |
| **USE-04** | **Cognitive FinTech Visual Hierarchy** | **$< 3\text{ seconds}$ Time-to-Understanding** of reconciliation state and risk | User eye-tracking / cognitive walkthrough usability test | System Usability Scale (SUS $\ge 85$) | **Must-Have** |
| **USE-05** | **Mobile / Tablet Responsive Layout** | **100% viewport responsiveness** from $375\text{px}$ (mobile) to $3840\text{px}$ (4K) | Viewport resize visual regression tests | Playwright Visual Screenshot Matrix | **Must-Have** |
| **USE-06** | **Vendor Intimation Dispatch Velocity** | **$\le 2\text{ clicks}$ ($< 5\text{ seconds}$)** to generate deep-linked WhatsApp notice | Time-and-motion interaction measurement | User Interaction Telemetry Log | **Should-Have** |

---

## 5. Maintainability & Code Quality (ISO/IEC 25010 §4.6)

### 5.1 Requirements Specification Table

| ID | Requirement Statement | Quantitative Target | Measurement Method | Verification Tooling | Priority |
|:---|:---|:---|:---|:---|:---:|
| **MAINT-01**| **Strict TypeScript Type Safety** | **$100\%$ Strict Mode** (`strict: true`); **0 implicit or explicit `any` types** | `tsc --noEmit` compiler static analysis pass | TypeScript 5.4+ Compiler CLI | **Must-Have** |
| **MAINT-02**| **Automated Test Coverage** | **$\ge 90\%$ line coverage** on core matching algorithms and math modules | Jest / Vitest Istanbul code coverage report | Vitest Coverage Report (`--coverage`) | **Must-Have** |
| **MAINT-03**| **Cyclomatic Complexity Control** | **Max Cyclomatic Complexity $\le 10$** per function; $\le 15$ for matching cascade | ESLint `complexity` rule enforcement in CI pipeline | ESLint v8+ Static Code Analyzer | **Must-Have** |
| **MAINT-04**| **Zero Dead Code & Tree-Shaking** | **Zero unused imports or exports**; 100% ESM tree-shakeable library imports | Rollup / Webpack bundle analysis | `@next/bundle-analyzer` | **Must-Have** |
| **MAINT-05**| **Modular Component Decoupling** | **Zero circular dependencies**; strict unidirectional data flow architecture | `madge --circular` dependency graph analyzer | Madge CLI Dependency Analyzer | **Must-Have** |

---

## 6. Portability & Compatibility (ISO/IEC 25010 §4.7)

### 6.1 Requirements Specification Table

| ID | Requirement Statement | Quantitative Target | Measurement Method | Verification Tooling | Priority |
|:---|:---|:---|:---|:---|:---:|
| **PORT-01** | **Evergreen Cross-Browser Compatibility**| **100% functional compatibility** on Chrome 100+, Edge 100+, Firefox 100+, Safari 16+ | Cross-browser automated end-to-end execution | BrowserStack / Playwright Matrix | **Must-Have** |
| **PORT-02** | **Cross-Operating System Portability** | **Identical performance** on Windows 10/11, macOS (Intel & Apple Silicon), Linux, Android | Multi-OS client benchmark suite | Cross-OS Device Lab Testing | **Must-Have** |
| **PORT-03** | **Zero Backend Infrastructure Dependency**| **Pure static bundle**; deployable to any static host (Vercel, Netlify, GitHub Pages, S3)| Production build verification with disabled Node runtime | Static File Server (`npx serve out`) | **Must-Have** |
| **PORT-04** | **Offline Operation Capability** | **100% functional offline**; operates in airplane mode after initial asset load | Network interface disabled during full reconciliation cycle | DevTools Offline Throttling Simulation | **Must-Have** |

---

## 7. Statutory & Accounting Precision Compatibility (ISO/IEC 25010 §4.1)

### 7.1 Requirements Specification Table

| ID | Requirement Statement | Quantitative Target | Measurement Method | Verification Tooling | Priority |
|:---|:---|:---|:---|:---|:---:|
| **STAT-01** | **Floating-Point Arithmetic Drift** | **EXACTLY $0.00\text{ Paise drift}$** ($0.000000\%$ error across all ledger aggregations) | Assert `Sum(Paise) === ExpectedBigInt` on 100k randomized sums | Jest Fixed-Point Arithmetic Test | **Must-Have** |
| **STAT-02** | **Section 170 Statutory Rounding Window**| **$100.0\%$ compliance**; exact settlement of variances within $\le \pm 100\text{ Paise}$ ($\pm ₹1.00$) | Reconciled count on boundary rounding test dataset | Jest Section 170 Unit Test Suite | **Must-Have** |
| **STAT-03** | **Rule 88D DRC-01C Mathematical Trigger**| **$100.0\%$ precision**; alerts trigger if and only if $\Delta > 20\%$ AND $\Delta > ₹25,00,000$ | Unit test on 20 synthetic boundary variance cases | Jest Boundary Condition Test Suite | **Must-Have** |
| **STAT-04** | **Section 50(3) 18% Compounding Interest**| **Accurate to the exact Paise** ($₹ \times 0.18 \times \text{days} / 365$) | Precision comparison against manual actuarial tables | Financial Math Assertion Suite | **Must-Have** |
| **STAT-05** | **GSTN Schema v1.0 Compatibility** | **$100\%$ schema validity** on official GSTR-2B JSON and GSTR-1A amendment payloads | Zod runtime schema validation against official GSTN XSD | Zod Schema Validator Suite | **Must-Have** |

---

## 8. Summary Governance & Priority Distribution

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 NFR DISTRIBUTION & PRIORITIZATION                                │
├───────────────────────────────────────────┬──────────────┬───────────────┬───────────────────────┤
│ ISO/IEC 25010 Quality Category            │ Must-Have    │ Should-Have   │ Total Requirements    │
├───────────────────────────────────────────┼──────────────┼───────────────┼───────────────────────┤
│ 1. Performance Efficiency                 │ 9            │ 0             │ 9                     │
│ 2. Reliability & Availability             │ 4            │ 1             │ 5                     │
│ 3. Security & Data Privacy (DPDP Act)     │ 6            │ 0             │ 6                     │
│ 4. Usability & Accessibility (WCAG 2.2 AA)│ 5            │ 1             │ 6                     │
│ 5. Maintainability & Code Quality         │ 5            │ 0             │ 5                     │
│ 6. Portability & Compatibility            │ 4            │ 0             │ 4                     │
│ 7. Statutory & Accounting Precision       │ 5            │ 0             │ 5                     │
├───────────────────────────────────────────┼──────────────┼───────────────┼───────────────────────┤
│ **TOTAL NON-FUNCTIONAL REQUIREMENTS**     │ **38**       │ **2**         │ **40 Requirements**   │
└───────────────────────────────────────────┴──────────────┴───────────────┴───────────────────────┘
```

---

## 9. Appendix: Technical Justification for Quality Targets

To safeguard against the *"Aspirational NFR"* anti-pattern, every target in this document is grounded in verified empirical benchmarks, architectural profiling, and regulatory constraints:

1. **Sub-300ms 10k Matching (`PERF-01`):** Grounded in synthetic benchmarks (`stage_3_research/27_comparison_rapidfuzz_vs_js_levenshtein.md`) where $O(N+M)$ candidate blocking reduces 10k comparisons to $<25,000$ operations, and RapidFuzz Myers bit-parallel algorithm executes in $18\text{--}24\text{ms}$. Adding JSON streaming parse ($120\text{ms}$) and typed array allocation ($25\text{ms}$) yields a realistic total of $\sim 242\text{ms}$, well within the $<300\text{ms}$ budget.
2. **60 FPS Tabular Windowing (`PERF-03`, `PERF-04`):** Grounded in TanStack Virtual v3 benchmarks (`stage_3_research/27_comparison_tanstack_virtual_vs_react_window.md`) demonstrating that capping DOM nodes to 25–30 keeps frame render times under $4.2\text{ms}$ (far below the $16.6\text{ms}$ 60 FPS ceiling).
3. **<42MB Peak Heap Memory (`PERF-05`):** Profiling confirms `BigInt64Array` packs 10,000 invoice rows into contiguous 8-byte typed memory buffers requiring only $800\text{KB}$ of raw memory. The remaining $\sim 35\text{MB}$ accommodates React 18 component state and DOM nodes, strictly satisfying the $<42\text{MB}$ constraint.
4. **0.00% Floating-Point Drift (`STAT-01`):** Proven mathematically in `stage_3_research/28_compliance_checklist.md`. Storing all currency values in integer Paise ($100\text{ Paise} = ₹1.00$) executes all operations via the CPU's native integer ALU, eliminating IEEE-754 mantissa approximation errors.
5. **0 Network Bytes Egress (`SEC-01`, `SEC-02`):** Direct statutory mandate under DPDP Act 2023 Sections 4 & 6. Operating 100% in client-side RAM (`FileReader` and Web Workers) prevents the application from becoming a Data Fiduciary, eliminating compliance liabilities up to ₹250 Crore.
6. **99.99% Edge Uptime (`REL-01`):** Achievable because ReconcileGST is compiled as a static bundle (`output: 'export'`) served over global Anycast edge networks (Vercel CDN / GitHub Pages) with zero server-side databases, API gateways, or container instances that could crash or experience outages.
