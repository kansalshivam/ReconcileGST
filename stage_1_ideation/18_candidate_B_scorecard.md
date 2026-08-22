# Shadow Rubric Scorecard & Competitive Jury Defense — Candidate B: GST-ClosedLoop Compliance Hub

**Document Code:** `STAGE_1_SCORECARD_CANDIDATE_B`  
**Date:** 2026-08-21T21:18:00+05:30  
**Candidate Identity:** Candidate B — GST-ClosedLoop Compliance Hub (The Pragmatic Product Manager)  
**Author:** Principal VC Due Diligence Analyst & Systems Architect (Binary Brains)  
**Target Milestone:** Smart India Hackathon (SIH) 2026 — Software Track (Internal Selection: August 24, 2026)  
**Governing Inputs:** `stage_0_artifacts/09_evaluator_model.md`, `stage_0_artifacts/07_judging_rubric.md`, `stage_1_ideation/11_candidate_directions.md`

---

## 1. Shadow Rubric Scoring Overview

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                             CANDIDATE B SHADOW RUBRIC EVALUATION SUMMARY                         │
├──────────────────────────────────────┬───────────────┬─────────────────┬─────────────────────────┤
│ Evaluation Dimension                 │ Max Marks     │ Candidate B     │ Performance Tier        │
│                                      │ (Shadow)      │ Awarded Score   │                         │
├──────────────────────────────────────┼───────────────┼─────────────────┼─────────────────────────┤
│ 1. Technical Excellence & Arch.      │ 35 Marks      │ 29.0 / 35 Marks │ High Silver Tier (83%)  │
│ 2. Algorithmic Depth & Innovation    │ 20 Marks      │ 16.0 / 20 Marks │ Solid Silver Tier (80%) │
│ 3. Practical Regulatory & Viability  │ 25 Marks      │ 25.0 / 25 Marks │ PERFECT GOLD TIER (100%)│
│ 4. User Experience & Live Demo Exec  │ 20 Marks      │ 19.0 / 20 Marks │ Near-Perfect Gold (95%) │
├──────────────────────────────────────┼───────────────┼─────────────────┼─────────────────────────┤
│ TOTAL COMPOSITE SHADOW SCORE         │ 100 Marks     │ 89.0 / 100 Marks│ HIGH SILVER / LOW GOLD  │
└──────────────────────────────────────┴───────────────┴─────────────────┴─────────────────────────┘
```

```mermaid
pie title Candidate B Score Distribution (89/100 Marks)
    "Technical Architecture (29/35)" : 29
    "Practical Regulatory Impact (25/25)" : 25
    "UX & Live Demo Execution (19/20)" : 19
    "Algorithmic Depth (16/20)" : 16
    "Deducted Marks (11/100)" : 11
```

---

## 2. Granular Dimension-by-Dimension Scoring Breakdown

### 2.1 Dimension 1: Technical Excellence & Architecture
* **Maximum Weight:** 35 Marks
* **Candidate B Score:** **29.0 / 35.0 Marks**
* **Score Realization:** 82.9%

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Dimension 1 Evaluation Matrix                                                                    │
├───────────────────────────────┬──────────────┬───────────────┬───────────────────────────────────┤
│ Specific Criterion            │ Max Marks    │ Awarded Score │ Verified Evidence & Rationale     │
├───────────────────────────────┼──────────────┼───────────────────────────────────────────────────┤
│ • Zero-Cloud Edge Ingest      │ 10 Marks     │ 10 / 10 Marks │ 100% in-browser HTML5 FileReader; │
│   & DPDP Act Immunity         │              │               │ 0 remote network bytes sent.      │
│ • Paise Math (`BigInt64Array`)│ 10 Marks     │ 8 / 10 Marks  │ Uses integer Paise math, but lacks│
│   & Float Drift Elimination   │              │               │ zero-copy SharedArrayBuffer.      │
│ • Multithreaded Concurrency   │ 10 Marks     │ 8 / 10 Marks  │ Web Workers for ingestion, but    │
│   & Web Worker Architecture   │              │               │ SheetJS requires heavy Worker sync│
│ • Memory Cap (<88MB RAM)      │ 5 Marks      │ 3 / 5 Marks   │ Peaks at ~75MB during 6-tab build;│
│   & DOM Virtualization (60 FPS│              │               │ close to upper guardrail boundary │
└───────────────────────────────┴──────────────┴───────────────┴───────────────────────────────────┘
```

---

### 2.2 Dimension 2: Algorithmic Depth & Innovation
* **Maximum Weight:** 20 Marks
* **Candidate B Score:** **16.0 / 20.0 Marks**
* **Score Realization:** 80.0%

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Dimension 2 Evaluation Matrix                                                                    │
├───────────────────────────────┬──────────────┬───────────────┬───────────────────────────────────┤
│ Specific Criterion            │ Max Marks    │ Awarded Score │ Verified Evidence & Rationale     │
├───────────────────────────────┼──────────────┼───────────────────────────────────────────────────┤
│ • Candidate Hash Blocking     │ 6 Marks      │ 6 / 6 Marks   │ Inverted hash index on GSTIN/PAN  │
│   ($O(N+M)$ Complexity)       │              │               │ collapses search space by 99.95%. │
│ • 5-Stage Matching Cascade    │ 8 Marks      │ 6 / 8 Marks   │ Fully functional cascade, but uses│
│   (Exact, Syntax, Fuzzy, POS) │              │               │ JS string math instead of SIMD C++│
│ • Section 170 Statutory Math  │ 6 Marks      │ 4 / 6 Marks   │ Implements $\pm ₹1.00$ tolerance; │
│   & POS Swap Resolution       │              │               │ basic POS swap classification.    │
└───────────────────────────────┴──────────────┴───────────────┴───────────────────────────────────┘
```

---

### 2.3 Dimension 3: Practical Regulatory Impact & Viability
* **Maximum Weight:** 25 Marks
* **Candidate B Score:** **25.0 / 25.0 Marks (MAXIMUM GOLD SCORE)**
* **Score Realization:** 100.0%

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Dimension 3 Evaluation Matrix                                                                    │
├───────────────────────────────┬──────────────┬───────────────┬───────────────────────────────────┤
│ Specific Criterion            │ Max Marks    │ Awarded Score │ Verified Evidence & Rationale     │
├───────────────────────────────┼──────────────┼───────────────────────────────────────────────────┤
│ • GSTN IMS Pre-Triage Module  │ 7 Marks      │ 7 / 7 Marks   │ Full Advisory 624 compliance;     │
│   (Advisory 624 / Circ 231)   │              │               │ includes credit note safety lock. │
│ • Form GSTR-1A Delta JSON     │ 6 Marks      │ 6 / 6 Marks   │ 1-Click CBIC Notif 12/2024-CT JSON│
│   Outward Supply Generator    │              │               │ outward amendment exporter.       │
│ • 6-Tab CA Audit Workbook     │ 6 Marks      │ 6 / 6 Marks   │ Client-side SheetJS with dynamic  │
│   with Dynamic `=SUMIFS`      │              │               │ `=SUMIFS` formulas and colors.    │
│ • Rule 88D DRC-01C Threat     │ 6 Marks      │ 6 / 6 Marks   │ Real-time discrepancy gauge with  │
│   Gauge & Legal Annexures     │              │               │ High Court judicial citations.    │
└───────────────────────────────┴──────────────┴───────────────┴───────────────────────────────────┘
```

---

### 2.4 Dimension 4: User Experience & Live Demo Execution
* **Maximum Weight:** 20 Marks
* **Candidate B Score:** **19.0 / 20.0 Marks**
* **Score Realization:** 95.0%

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Dimension 4 Evaluation Matrix                                                                    │
├───────────────────────────────┬──────────────┬───────────────┬───────────────────────────────────┤
│ Specific Criterion            │ Max Marks    │ Awarded Score │ Verified Evidence & Rationale     │
├───────────────────────────────┼──────────────┼───────────────────────────────────────────────────┤
│ • 1-Click 10k Sample Record   │ 6 Marks      │ 6 / 6 Marks   │ Instant synthetic demo loading    │
│   Demo Button (<100ms)        │              │               │ pre-populated with messy datasets.│
│ • Virtualized Data Grid       │ 6 Marks      │ 6 / 6 Marks   │ TanStack Virtual v3 rendering at  │
│   (TanStack Virtual v3 60 FPS)│              │               │ 60 FPS with 25 mounted DOM nodes. │
│ • Universal ERP Auto-Mapper   │ 4 Marks      │ 4 / 4 Marks   │ Auto-maps 40+ Indian ERP headers  │
│   (Tally, Zoho, Busy, SAP)    │              │               │ without manual mapping wizards.   │
│ • Visual Dispute Resolution   │ 4 Marks      │ 3 / 4 Marks   │ Status chips and action triggers; │
│   & Split-Difference Drawer   │              │               │ lacks character-level split diff. │
└───────────────────────────────┴──────────────┴───────────────┴───────────────────────────────────┘
```

---

## 3. Comparative Benchmarking Across All Stage 1 Candidates

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   CANDIDATE DIRECTION SCORECARD MATRIX                                 │
├──────────────────────────┬─────────────────┬─────────────────┬─────────────────┬───────────────────────┤
│ Dimension (Shadow Weight)│ Candidate A     │ Candidate B     │ Candidate C     │ Candidate E           │
│                          │ (Visionary Eng) │ (Pragmatic PM)  │ (Creative UX)   │ (Master Suite)        │
├──────────────────────────┼─────────────────┼─────────────────┼─────────────────┼───────────────────────┤
│ 1. Technical Arch. (35M) │ 34.0 / 35 Marks │ 29.0 / 35 Marks │ 27.0 / 35 Marks │ 35.0 / 35 Marks (MAX) │
│ 2. Algorithmic Depth(20M)│ 20.0 / 20 Marks │ 16.0 / 20 Marks │ 15.0 / 20 Marks │ 20.0 / 20 Marks (MAX) │
│ 3. Practical Reg. (25M)  │ 18.0 / 25 Marks │ 25.0 / 25 Marks │ 22.0 / 25 Marks │ 25.0 / 25 Marks (MAX) │
│ 4. UX & Live Demo (20M)  │ 16.0 / 20 Marks │ 19.0 / 20 Marks │ 20.0 / 20 Marks │ 18.0 / 20 Marks       │
├──────────────────────────┼─────────────────┼─────────────────┼─────────────────┼───────────────────────┤
│ COMPOSITE SHADOW SCORE   │ 88.0 / 100 (Sil)│ 89.0 / 100 (Sil)│ 84.0 / 100 (Sil)│ 98.0 / 100 (GOLD 1)   │
└──────────────────────────┴─────────────────┴─────────────────┴─────────────────┴───────────────────────┘
```

---

## 4. Final Strategic Guidance & Synthesis Directive

Candidate B represents the **definitive gold standard for practical regulatory and workflow completeness** (achieving a perfect **25 / 25 Marks** in Dimension 3). 

However, because the Shadow Rubric heavily rewards low-level systems engineering (35 Marks for Technical Architecture), relying solely on Candidate B leaves 6 marks on the table in raw SIMD compute performance and typed buffer optimizations.

### Binding Directive for Stage 1 Final Synthesis:
To achieve the target **98.0 / 100 Gold Tier Consensus Score (Rank 1)** on August 24:
* Candidate B’s **entire regulatory engine** (GSTN IMS Pre-Triage, Form GSTR-1A Delta JSON, 6-Tab Dynamic `=SUMIFS` CA Excel) must be adopted as the foundational core of **Candidate E (Master Unified Architectural Suite)**.
* It must be supercharged with **Candidate A’s** C++/Wasm SIMD-128 RapidFuzz vectorization and `BigInt64Array` typed memory layout, and paired with **Candidate C’s** 1-Click Hinglish WhatsApp recovery bot.

---
*Authored by Principal VC Due Diligence Analyst & Systems Architect under the Master Engineering Skill.*  
*Canonical Reference for ReconcileGST SIH 2026 Internal Defense.*
