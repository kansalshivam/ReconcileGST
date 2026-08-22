# ReconcileGST Master Design System & UI Token Specification

**Document ID:** `stage_4_documents/12_design_system.md`  
**Version:** 3.0.0 (Production Release — Onyx & Antique Ochre Edition)  
**Date:** 2026-08-22  
**Author:** Principal Product Designer & UI Systems Architect (Binary Brains — Team Leader: Shivam Kansal)  
**Governing Inputs:** `stage_3_research/29_visual_inspiration.md`, `stage_3_research/31_bespoke_non_blue_palette.md`, `stage_2_decision_lock/23_locked_scope.md`  
**Target Tech Stack:** Next.js 14 (App Router) / Tailwind CSS v3.4+ / Shadcn UI / Radix Primitives / Lucide React / TanStack Virtual v3  
**Design Persona:** Bespoke Onyx & Antique Ochre High-Contrast Financial Terminal (Linear × Bloomberg Hybrid)  

---

## 1. Executive Summary & Design Philosophy

The **ReconcileGST Executive Terminal** is an enterprise-grade financial interface built specifically for Chartered Accountants (CAs), CFOs, and MSME tax practitioners navigating the intense monthly 144-hour "6-Day Squeeze" (14th to 20th of every month).

### 1.1 Core Design Pillars

1. **Extreme Information Density with Zero Clutter:** Financial auditors require tabular data density comparable to a Bloomberg Terminal, yet modern navigation ergonomics inspired by Linear.app. Generous padding and decorative illustrations are replaced with precise 1px hairline borders, monospaced numeric alignments, and tight 40px table rows.
2. **Bespoke Non-Blue Color Palette:** Eliminates generic AI blue/cyan in favor of **Deep Onyx (`#090A0C`), Dark Zinc (`#121418`/`#1A1D23`), and Warm Antique Ochre (`#D97706`/`#F59E0B`)**, giving the application an executive, institutional financial posture.
3. **Statutory High-Contrast Chromatic Semantics:** Colors convey legal and financial meaning strictly:
   * **Emerald Green (`#10B981`):** Safe eligible Input Tax Credit (ITC) ready for GSTR-3B Table 4(A)(5).
   * **Crimson Red (`#EF4444`):** Section 16(2)(aa) Trapped ITC, Rule 88D DRC-01C statutory liability, or Section 17(5) blocked credit.
   * **Amber / Gold (`#F59E0B`):** Section 170 ₹1.00 rounding tolerance, IMS Pending status, or Section 50(3) 18% interest accrual.
   * **Amethyst Violet (`#8B5CF6`):** Place of Supply (POS) swaps (IGST vs CGST+SGST) for Form GSTR-1A/Table 9A amendment.
4. **Fluid Zoom-Safe Responsive Grid:** Avoids viewport squishing and absolute pixel translation jitter. The grid maintains crisp font rendering and flawless column alignment across **80%, 100%, and 125% browser zoom levels**.

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 RECONCILEGST VISUAL PARADIGM                                           │
├────────────────────────────────┬────────────────────────────────┬──────────────────────────────────────┤
│ 1. LINEAR.APP ERGONOMICS       │ 2. ONYX & ANTIQUE OCHRE THEME  │ 3. BLOOMBERG DENSITY                 │
├────────────────────────────────┼────────────────────────────────┼──────────────────────────────────────┤
│ • Micro-interactions & hotkeys │ • Deep Onyx base (#090A0C)     │ • Dense tabular financial structures │
│ • Glassmorphic deep zinc cards │ • Antique Ochre accent (#D97706│ • Pinned summary & audit formulas    │
│ • Hairline borders (`1px`)     │ • Emerald/Crimson/Amber badges │ • Token-level character diffing      │
│ • Slide-over inspect drawers   │ • High-contrast financial font │ • Fluid zoom-safe CSS grid windowing │
└────────────────────────────────┴────────────────────────────────┴──────────────────────────────────────┘
```

---

## 2. Master Design Tokens & CSS Custom Properties

All design tokens are defined as CSS custom properties in `:root` inside `app/globals.css`:

```css
:root {
  /* Base Viewport & Background Layers (True Onyx & Dark Zinc Architecture) */
  --color-bg-base: #090A0C;           /* Deep Onyx - Zero Blue/Slate */
  --color-bg-surface-1: #121418;      /* Container cards & grid backdrops */
  --color-bg-surface-2: #1A1D23;      /* Elevated cards, headers, hover rows */
  --color-bg-surface-3: #262A32;      /* Active selections, dropdown menus */
  --color-bg-glass: rgba(18, 20, 24, 0.90); /* Glassmorphic header & sticky HUD */
  --color-bg-overlay: rgba(9, 10, 12, 0.88); /* Modal & backdrop scrim */

  /* Hairline Border & Outline Tokens */
  --color-border-subtle: rgba(45, 49, 58, 0.70); /* Subtle grid hairlines */
  --color-border-default: #2A2E37;                /* Card boundaries */
  --color-border-strong: #3D4350;                 /* Hover borders & inputs */
  --color-border-glow: #D97706;                   /* Warm Ochre Focus Ring */

  /* Brand & Accent: Warm Antique Ochre / Gold */
  --color-brand-base: #D97706;
  --color-brand-surface: rgba(217, 119, 6, 0.14);
  --color-brand-border: rgba(217, 119, 6, 0.40);
  --color-brand-glow: rgba(217, 119, 6, 0.55);
  --color-brand-text: #F59E0B;

  /* High-Contrast Semantic Palette */
  --color-emerald-base: #10B981;
  --color-emerald-surface: rgba(16, 185, 129, 0.12);
  --color-emerald-border: rgba(16, 185, 129, 0.35);
  --color-emerald-glow: rgba(16, 185, 129, 0.50);
  --color-emerald-text: #34D399;

  --color-crimson-base: #EF4444;
  --color-crimson-surface: rgba(239, 68, 68, 0.14);
  --color-crimson-border: rgba(239, 68, 68, 0.40);
  --color-crimson-glow: rgba(239, 68, 68, 0.60);
  --color-crimson-text: #F87171;

  --color-amber-base: #F59E0B;
  --color-amber-surface: rgba(245, 158, 11, 0.12);
  --color-amber-border: rgba(245, 158, 11, 0.35);
  --color-amber-glow: rgba(245, 158, 11, 0.50);
  --color-amber-text: #FBBF24;

  --color-violet-base: #8B5CF6;
  --color-violet-surface: rgba(139, 92, 246, 0.12);
  --color-violet-border: rgba(139, 92, 246, 0.35);
  --color-violet-text: #A78BFA;
}
```

---

## 3. Component Hierarchy & UX Layout

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ HEADER TOOLBAR: RECONCILE.GST | Client: Bharat Mfg Ltd (07AAAAA0000A1Z5) | [Tour] [⚡ 10k Demo] [Reset] │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ TELEMETRY HUD: ⚡ 248.40ms Latency | 41,200 rows/sec | 0 Bytes Cloud Egress | 10,000 Reconciled         │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ KPI SUMMARY HUD:                                                                                       │
│ ┌──────────────────────┬──────────────────────┬──────────────────────┬───────────────────────────────┐ │
│ │ Matched ITC (Safe)   │ Rule 88D DRC-01C     │ Trapped ITC Risk     │ Sec 50(3) Interest            │ │
│ │ ₹38,42,190.00        │ ₹5,41,800.00         │ ₹3,88,400.00         │ ₹69,912.00                    │ │
│ │ 8,500 Invoices (85%) │ 14.1% Variance (Safe)│ 1,000 Missing in 2B  │ 500 POS Swaps / Rule 37A      │ │
│ └──────────────────────┴──────────────────────┴──────────────────────┴───────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ VIRTUALIZED RECON TABLE: Multi-Facet Filter [All | Matched | Missing 2B | POS Swaps] | Search (/)     │
│ [Status] [Invoice No & Date] [Supplier GSTIN & Name] [ERP Tax] [2B Tax] [Variance] [IMS Action] [Act] │
│ • EXACT   UTCL/MUM/00456     24AAACU8989M1ZU UltraTech  ₹15,000   ₹15,000    ₹0.00    [ACC][REJ][PND]  │
│ • MISSING LT/26-27/09501     07AAACL0303P1ZH L&T Heavy  ₹18,000        —   ₹18,000    [ACC][REJ][PND]  │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ AUDIT & EXPORT TOOLBAR: [DRC-01C Part B Legal Defense] [Export 6-Tab CA Audit Workbook (.xlsx)]        │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Modal Specifications

1. **Guided CA & Jury Tour Modal (`components/GuidedTourModal.tsx`):**
   - Interactive 4-step walkthrough explaining:
     * Step 1: The Monthly "6-Day Squeeze" & DRC-01C 18% Penalty Risk.
     * Step 2: The 5-Stage SIMD Matching Waterfall (<300ms compute in local RAM).
     * Step 3: GSTN IMS Pre-Triage & GSTR-1A Supplier Payloads.
     * Step 4: 1-Click WhatsApp Recovery & High Court Precedent DRC-01C Legal Defense.
2. **WhatsApp Vendor Dispute Recovery Modal (`components/WhatsAppModal.tsx`):**
   - 1-Click generation of bilingual Hinglish & Formal English payment-hold notices with itemized invoice breakdowns and Section 16(2)(aa) statutory warnings.
3. **Form GST DRC-01C Part B Automated Legal Defense Modal (`components/Drc01cLegalModal.tsx`):**
   - Automated legal reply cite-checking Madras High Court (*D.Y. Beathel*) and Calcutta High Court (*Suncraft Energy*) precedents, Section 170 CGST Act rounding protection, and Section 16(2) bona fide recipient declarations.
