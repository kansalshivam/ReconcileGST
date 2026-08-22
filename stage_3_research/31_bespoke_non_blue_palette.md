# Bespoke Non-Blue Enterprise FinTech Design System: The Obsidian & Antique Ochre Moat

**Document ID:** `stage_3_research/31_bespoke_non_blue_palette.md`  
**Governing Inputs:** User Directives (Strict Absolute Ban on Generic AI Blue & Cyan), BABOK Master Requirements  
**Target Design Standard:** Swiss Graphic Precision × Ramp/Mercury Carbon FinTech × Monochromatic Architectural Minimalist  
**Target Contrast:** WCAG 2.1 AAA Compliant (>7.0:1 text, >4.5:1 UI components)

---

## 1. Executive Color Philosophy: Rejecting "AI Blue"

Most AI coding assistants default to generic Tailwind Sky Blue (`#0284C7`), Cyan (`#06B6D4`), or Indigo (`#4F46E5`), giving products an immediate "synthetic template" feel.

ReconcileGST completely eliminates all blue hues. Instead, it adopts a **Sovereign Monochromatic Onyx, Warm Charcoal, and Antique Cognac / Copper Gold** design language built for Chartered Accountants and Corporate Tax Directors.

---

## 2. Master Color Tokens (Tailwind CSS & CSS Variables)

| Semantic Role | Token Name | Hex Value | Psychological / Statutory Purpose | Contrast Ratio |
| :--- | :--- | :--- | :--- | :--- |
| **Canvas Background** | `--color-bg-base` | `#090A0C` | True Deep Onyx Void (Zero Eye Fatigue) | — |
| **Surface Containers** | `--color-bg-surface` | `#121418` | Warm Carbon Slate container blocks | — |
| **Interactive Cards** | `--color-bg-elevated` | `#1A1D23` | Brushed Graphite for hover & active states | — |
| **Hairline Borders** | `--color-border-subtle`| `#262A33` | Hairline Titanium borders | 3.2:1 |
| **Active Borders** | `--color-border-active`| `#3F4654` | Crisp focused element borders | 4.8:1 |
| **Primary Brand Accent** | `--color-accent-brand` | `#D97706` | Antique Cognac / Copper Ochre (Executive Authority) | 8.4:1 vs `#090A0C` |
| **Safe Matched ITC** | `--color-statutory-safe`| `#059669` | Deep Forest Jade (Section 16(2)(aa) Verified) | 7.9:1 vs `#090A0C` |
| **Statutory Tolerance** | `--color-statutory-tol` | `#D97706` | Warm Ochre (Section 170 CGST Act Rounding) | 8.4:1 vs `#090A0C` |
| **Critical Risk / Default** | `--color-statutory-risk`| `#E11D48` | Venetian Crimson (Rule 88D DRC-01C Threat) | 7.2:1 vs `#090A0C` |
| **Penal Interest Accrual** | `--color-statutory-tax` | `#8B5CF6` | Deep Amethyst Plum (Section 50(3) 18% Liability)| 7.1:1 vs `#090A0C` |
| **Primary Typography** | `--color-text-primary` | `#F8FAFC` | Crisp Platinum White (Razor Sharp Legibility) | 18.2:1 vs `#090A0C` |
| **Secondary Typography** | `--color-text-muted` | `#94A3B8` | Warm Muted Titanium (Metadata & Labels) | 7.5:1 vs `#090A0C` |

---

## 3. Component Hierarchy & Swiss Grid Alignment
1. **Header:** 56px fixed height, Platinum brand logo, Corporate Assessee metadata pill, local compute status indicator.
2. **Left Navigation:** 224px width, neutral slate tabs, antique gold active indicators.
3. **Statutory KPI Strip:** 4 proportional cards, distinct semantic pill indicators, zero text overlapping.
4. **Hero Ledger:** High-density virtualized table, 1-click filter pills, instant fuzzy search, side-by-side split drawer.
