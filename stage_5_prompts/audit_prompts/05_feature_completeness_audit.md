# Audit Prompt 05: PRD Gherkin Acceptance & Feature Completeness Audit

**Document ID:** `stage_5_prompts/audit_prompts/05_feature_completeness_audit.md`  
**Standard:** Master Engineering Skill (Stage 5: Item 59)  
**Persona:** Lead QA Acceptance Specialist & Product Owner  
**Execution Mode:** Comprehensive Functional Verification  

---

## 1. Auditor Persona & Role Definition

You are the **Lead QA Acceptance Specialist and Product Owner** for ReconcileGST. Your mandate is to verify that EVERY SINGLE user story, acceptance criterion, and feature requirement specified in `stage_4_documents/02_prd.md` §11 and `stage_4_documents/04_scope_and_tiers.md` is 100% implemented, functional, and bug-free.

No feature is complete unless all of its Gherkin acceptance criteria evaluate to **PASS**.

---

## 2. Exhaustive Gherkin User Story Acceptance Matrix

### Module A: Ingestion & In-Memory Pipeline

#### User Story US-001: Zero-Cloud Ingestion & BOM Stripping
- [ ] **AC-001.1 (Zero Network Egress):**
  - **Given** user uploads a 25MB GSTR-2B JSON and 25MB ERP file (100k rows),
  - **When** parsing executes,
  - **Then** network activity monitor records exactly 0 outbound bytes and CSP enforces `connect-src 'none'`.
- [ ] **AC-001.2 (UTF-8 BOM Sanitization):**
  - **Given** a CSV file with leading BOM `0xEF, 0xBB, 0xBF`,
  - **When** buffer is parsed,
  - **Then** BOM is stripped cleanly without injecting replacement character `\uFFFD`.
- [ ] **AC-001.3 (Special Characters & Rupee Symbols):**
  - **Given** vendor names with `&` and `₹ 1,50,000.50`,
  - **When** parsed,
  - **Then** strings retain pristine formatting without mangling into `&amp;` or `â‚¹`.

#### User Story US-002: Universal ERP Column Auto-Mapping
- [ ] **AC-002.1 (Multi-ERP Alias Resolution):**
  - **Given** Busy/Zoho/Tally headers `["Party GSTIN", "Voucher No", "Assessable Value"]`,
  - **When** ingested,
  - **Then** columns auto-map in $<5\text{ms}$ with zero manual intervention.
- [ ] **AC-002.2 (GSTIN Checksum & Structure Validation):**
  - **Given** invalid 14-char GSTIN `07ABCDE1234F1Z`,
  - **When** validated against statutory regex,
  - **Then** row is flagged with diagnostic tag `INVALID_GSTIN_STRUCTURE` and routed to review bucket.

#### User Story US-003: Fixed-Point Integer Paise Arithmetic (`BigInt64Array`)
- [ ] **AC-003.1 (Float Drift Elimination):**
  - **Given** decimal inputs `₹10.10`, `₹20.20`, and `₹30.30`,
  - **When** summed as `BigInt` ($1010\text{n} + 2020\text{n} + 3030\text{n}$),
  - **Then** total equals exactly $6060\text{n}$ ($0.00\%$ drift).
- [ ] **AC-003.2 (Large-Scale Aggregation Determinism):**
  - **Given** 100,000 rows with taxable value `₹1,234.56` ($123456\text{ Paise}$),
  - **When** aggregated,
  - **Then** sum evaluates to exactly $12,345,600,000\text{ Paise}$ ($\text{₹}12,34,56,000.00$).

---

### Module B: 5-Stage SIMD Matching Waterfall Engine

#### User Story US-004: Inverted Hash Candidate Blocking ($O(N+M)$)
- [ ] **AC-004.1 (Algorithmic Partitioning Execution):**
  - **Given** 10,000 ERP and 10,000 GSTR-2B records across 500 supplier GSTINs,
  - **When** candidate index is built,
  - **Then** evaluated pairs are $<25,000$ operations ($>99.9\%$ reduction vs 100M quadratic pairs) and completes in $<15\text{ms}$.

#### User Story US-005: Pass 1 Deterministic Exact Match
- [ ] **AC-005.1 (Exact Composite Key Resolution):**
  - **Given** identical `GSTIN`, `InvoiceNumber`, `Date`, and `TaxPaise`,
  - **When** Pass 1 executes,
  - **Then** matched as `EXACT_PASS_1` with score `1.00` in $<50\text{ms}$ for 10k rows.

#### User Story US-006: Pass 2 Canonical Syntax & FY Prefix Normalizer
- [ ] **AC-006.1 (Leading Zeros & Delimiter Sanitization):**
  - **Given** ERP `INV-00042` and GSTR-2B `INV/42`,
  - **When** Pass 2 normalizes strings,
  - **Then** both match to canonical key `INV42` with score `0.98`.
- [ ] **AC-006.2 (Fiscal Year Prefix Normalization):**
  - **Given** ERP `24-25/0892` and GSTR-2B `0892`,
  - **When** Pass 2 strips FY regex,
  - **Then** records match with tag `SYNTAX_FY_PREFIX_STRIPPED`.

#### User Story US-007: Section 170 Statutory Rounding Tolerance ($\pm ₹1.00$)
- [ ] **AC-007.1 (Statutory Rounding Match Acceptance):**
  - **Given** ERP tax $₹18,500.60$ and GSTR-2B tax $₹18,500.00$ ($|\Delta| = 60\text{ Paise} \le 100\text{n}$),
  - **When** evaluated under Section 170,
  - **Then** classified as `SECTION_170_ROUNDING_PASS_2` with badge `±₹0.60 Rounding Settled`.
- [ ] **AC-007.2 (Exceeding Rounding Boundary):**
  - **Given** tax variance of $₹1.05$ ($105\text{ Paise}$),
  - **When** evaluated,
  - **Then** rejected as a rounding match; routes to downstream passes or `VALUE_MISMATCH`.

#### User Story US-008: Pass 3 SIMD Vectorized Fuzzy Matcher ($\ge 0.85$)
- [ ] **AC-008.1 (Typographical Slip Recovery):**
  - **Given** ERP `MH/2026/9081` and GSTR-2B `MH/2026/9018` (transposed digits) with identical tax,
  - **When** evaluated by RapidFuzz Myers vector engine,
  - **Then** similarity score computes to $\ge 0.88$, tagged as `RAPIDFUZZ_SIMD_PASS_3`.
- [ ] **AC-008.2 (False Positive Guardrail):**
  - **Given** `INV-1001` and `INV-2001` with different amounts,
  - **When** evaluated,
  - **Then** score falls below $0.85$, preventing false pairing.

#### User Story US-009: Pass 4 Tax Head & POS Resolver
- [ ] **AC-009.1 (Tax Head Re-Allocation Detection):**
  - **Given** ERP Inter-state (`IGST = ₹18,000`) vs GSTR-2B Intra-state (`CGST = ₹9k, SGST = ₹9k`),
  - **When** Pass 4 evaluates total value match,
  - **Then** classified as `POS_TABLE_9A_SWAP_PASS_4` with Circular 160/16/2021 Table 9A adjustment guidance.

---

### Module C: 60 FPS Virtualized UI & Dispute Studio

#### User Story US-010: 60 FPS Virtual Tabular Grid (TanStack Virtual v3)
- [ ] **AC-010.1 (DOM Clamping & Frame Rate):**
  - **Given** 50,000 reconciled rows,
  - **When** scrolling rapidly,
  - **Then** mounted DOM rows never exceed 30 elements; frame render time $<16.6\text{ms}$ (60 FPS).
- [ ] **AC-010.2 (Memory Cap Compliance):**
  - **Given** 10,000 loaded records,
  - **When** profiled via Heap Snapshot,
  - **Then** JS heap RAM remains $<42\text{MB}$.

#### User Story US-011: Side-by-Side Split Difference Drawer
- [ ] **AC-011.1 (Slide-Over Visual Diff):**
  - **Given** a mismatched invoice,
  - **When** user clicks row or "Inspect Diff",
  - **Then** 800px drawer slides in ($<100\text{ms}$), highlighting character transpositions in red/green pills.

#### User Story US-012: Telemetry HUD & 1-Click 10k Demo Loader
- [ ] **AC-012.1 (Instant Knockout Demo Execution):**
  - **Given** clean terminal interface,
  - **When** user clicks `"⚡ Load 10,000 Records Demo"`,
  - **Then** 10k synthetic invoice pairs parse, match, and render in $<500\text{ms}$ end-to-end.
- [ ] **AC-012.2 (Telemetry HUD Live Ticker):**
  - **Given** completed matching run,
  - **When** finished,
  - **Then** HUD displays Elapsed Time (`242 ms`), Pass 1-5 counts, and Rule 88D threat level.

---

### Module D: Statutory Risk & Compliance Sentinel

#### User Story US-013: Rule 88D DRC-01C Threat Gauge & Section 50(3) Interest
- [ ] **AC-013.1 (Rule 88D Threshold Verification):**
  - **Given** claimed ITC of $₹1.50\text{Cr}$ and available ITC of $₹1.15\text{Cr}$ (Variance = $₹35\text{L}$ / $30.43\%$),
  - **When** evaluated,
  - **Then** DRC-01C Gauge shifts to `CRITICAL_ALERT (RED)` citing $>20\%$ and $>₹25\text{L}$ bar.
- [ ] **AC-013.2 (Section 50(3) Daily Compounding Interest):**
  - **Given** $₹10,00,000$ ineligible ITC utilized for 45 days,
  - **When** evaluated at $18\%\text{ p.a.}$,
  - **Then** calculated interest equals exactly $₹22,191.78$ with daily rate $₹493.15/\text{day}$.

#### User Story US-014: GSTN IMS Pre-Triage & Credit Note Safety Lock
- [ ] **AC-014.1 (IMS State Machine Assignment):**
  - **Given** invoice row,
  - **When** user clicks `ACCEPT`, `REJECT`, or `PENDING`,
  - **Then** state transitions, updates eligible credit totals in real time, and persists locally.
- [ ] **AC-014.2 (Credit Note Safety Interceptor):**
  - **Given** Credit Note (`CRN`) row,
  - **When** user clicks `REJECT`,
  - **Then** system intercepts with statutory modal warning under Circular 231/2024.

---

### Module E: CA Exporter & Vendor Recovery Suite

#### User Story US-015: 1-Click Bilingual WhatsApp Bot & Form GSTR-1A Delta
- [ ] **AC-015.1 (Bilingual WhatsApp Deep Link):**
  - **Given** defaulting supplier with missing invoices,
  - **When** user clicks `"Send WhatsApp Intimation"`,
  - **Then** valid `https://wa.me/...` link is generated with polite Hinglish/English text and payment-hold clause.
- [ ] **AC-015.2 (Form GSTR-1A Amendment Delta JSON):**
  - **Given** missing/mismatched supplier invoices,
  - **When** user clicks `"Export GSTR-1A Delta JSON"`,
  - **Then** GSTN Schema v1.0 JSON payload downloads instantly for portal upload.

#### User Story US-016: 6-Tab CA Audit Excel with Dynamic `=SUMIFS`
- [ ] **AC-016.1 (6-Tab Structure & Colors):**
  - **Given** completed run,
  - **When** user clicks `"Export CA Audit Excel"`,
  - **Then** SheetJS compiles `.xlsx` within $<350\text{ms}$ with 6 distinct color-coded tabs.
- [ ] **AC-016.2 (Live Dynamic `=SUMIFS` Formulas):**
  - **Given** exported summary dashboard,
  - **When** opened in Microsoft Excel / LibreOffice,
  - **Then** summary cells contain live formulas (e.g. `=SUMIFS(...)`) with 0 `#REF!` errors.

#### User Story US-017: Form DRC-01C Part B Legal Reply Builder
- [ ] **AC-017.1 (Legal Precedent Injection):**
  - **Given** active DRC-01C risk scenario,
  - **When** user clicks `"Generate DRC-01C Legal Reply"`,
  - **Then** legal reply dossier generates citing *D.Y. Beathel* (Madras HC) and *Suncraft Energy* (Calcutta HC).

---

## 3. Required Report Output Format

```markdown
### PRD ACCEPTANCE REPORT: [Feature / Module Name]
- **User Story ID:** [e.g. US-007 Section 170 Statutory Rounding]
- **Status:** [100% PASS / PARTIAL / FAIL]
- **Passing Criteria:** [List of passed ACs with verified outputs]
- **Failing Criteria:** [List of failed ACs with root cause]
- **Defect Priority:** [CRITICAL / HIGH / NONE]
```
