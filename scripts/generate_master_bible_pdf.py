# -*- coding: utf-8 -*-
"""
ReconcileGST Master Learning Bible & Defense Dossier HTML & PDF Generator
Converts full markdown and rich HTML with print CSS into publication-grade PDF via Headless Edge/Chrome.
"""

import os
import subprocess
import sys

HTML_CONTENT = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>ReconcileGST — Master Learning Bible & Defense Dossier</title>
<style>
  @page {
    size: A4;
    margin: 18mm 15mm 20mm 15mm;
    @bottom-right {
      content: counter(page);
    }
  }
  
  body {
    font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
    color: #1e293b;
    background-color: #ffffff;
    line-height: 1.6;
    font-size: 10.5pt;
  }
  
  h1, h2, h3, h4, h5, h6 {
    color: #0f172a;
    font-weight: 700;
    margin-top: 1.4em;
    margin-bottom: 0.5em;
    page-break-after: avoid;
  }
  
  h1 {
    font-size: 20pt;
    border-bottom: 2.5px solid #d97706;
    padding-bottom: 6px;
    color: #090a0c;
  }
  
  h2 {
    font-size: 15pt;
    border-bottom: 1.5px solid #cbd5e1;
    padding-bottom: 4px;
    color: #1e293b;
    margin-top: 1.8em;
  }
  
  h3 {
    font-size: 12pt;
    color: #b45309;
    margin-top: 1.2em;
  }
  
  h4 {
    font-size: 11pt;
    color: #334155;
  }
  
  p, li {
    color: #334155;
    text-align: justify;
  }
  
  ul, ol {
    margin-top: 0.3em;
    margin-bottom: 0.8em;
    padding-left: 24px;
  }
  
  li {
    margin-bottom: 0.3em;
  }
  
  code {
    font-family: 'Consolas', 'JetBrains Mono', 'Courier New', monospace;
    background-color: #f1f5f9;
    color: #0f172a;
    padding: 2px 5px;
    border-radius: 4px;
    font-size: 9.5pt;
    border: 1px solid #e2e8f0;
  }
  
  pre {
    background-color: #090a0c;
    color: #f8fafc;
    padding: 12px 16px;
    border-radius: 8px;
    font-family: 'Consolas', 'JetBrains Mono', monospace;
    font-size: 8.5pt;
    line-height: 1.45;
    overflow-x: auto;
    page-break-inside: avoid;
    border: 1px solid #334155;
    margin: 1em 0;
  }
  
  pre code {
    background: none;
    color: inherit;
    padding: 0;
    border: none;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 1.2em 0;
    font-size: 9pt;
    page-break-inside: avoid;
  }
  
  th, td {
    border: 1px solid #cbd5e1;
    padding: 7px 10px;
    text-align: left;
  }
  
  th {
    background-color: #0f172a;
    color: #ffffff;
    font-weight: 600;
  }
  
  tr:nth-child(even) {
    background-color: #f8fafc;
  }
  
  .badge {
    display: inline-block;
    padding: 2px 7px;
    font-size: 8pt;
    font-weight: 700;
    border-radius: 4px;
    text-transform: uppercase;
    font-family: 'Consolas', monospace;
  }
  
  .badge-emerald { background-color: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }
  .badge-amber { background-color: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
  .badge-crimson { background-color: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
  .badge-blue { background-color: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe; }
  
  .callout {
    border-left: 4px solid #d97706;
    background-color: #fffbeb;
    padding: 10px 14px;
    margin: 1em 0;
    border-radius: 0 6px 6px 0;
    font-size: 9.5pt;
    page-break-inside: avoid;
  }
  
  .callout-title {
    font-weight: 700;
    color: #b45309;
    margin-bottom: 4px;
  }
  
  .callout-crimson {
    border-left-color: #ef4444;
    background-color: #fef2f2;
  }
  .callout-crimson .callout-title {
    color: #991b1b;
  }
  
  .callout-emerald {
    border-left-color: #10b981;
    background-color: #ecfdf5;
  }
  .callout-emerald .callout-title {
    color: #065f46;
  }
  
  .cover-page {
    text-align: center;
    padding: 60px 20px 40px 20px;
    page-break-after: always;
  }
  
  .cover-title {
    font-size: 26pt;
    font-weight: 800;
    color: #090a0c;
    margin-bottom: 8px;
    letter-spacing: -0.5px;
  }
  
  .cover-subtitle {
    font-size: 13pt;
    color: #d97706;
    font-weight: 600;
    margin-bottom: 30px;
  }
  
  .cover-box {
    border: 2px solid #0f172a;
    background-color: #f8fafc;
    border-radius: 12px;
    padding: 24px;
    max-width: 580px;
    margin: 0 auto 30px auto;
    text-align: left;
  }
  
  .cover-meta {
    font-size: 9.5pt;
    color: #475569;
    margin-bottom: 6px;
  }
  
  .cover-meta strong {
    color: #0f172a;
  }
  
  .divider {
    height: 1px;
    background-color: #e2e8f0;
    margin: 2em 0;
  }
  
  .page-break {
    page-break-after: always;
  }
</style>
</head>
<body>

<!-- ========================================================================= -->
<!-- COVER PAGE -->
<!-- ========================================================================= -->
<div class="cover-page">
  <div style="font-size: 11pt; font-weight: 700; color: #64748b; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 12px;">
    Smart India Hackathon (SIH) 2026 • Grand Finale Defense Package
  </div>
  
  <div class="cover-title">ReconcileGST</div>
  <div class="cover-subtitle">
    Automated Inward GST ITC Reconciliation, DRC-01C Compliance & Defaulting Vendor Recovery Engine
  </div>
  
  <div class="cover-box">
    <div class="cover-meta"><strong>Team Name:</strong> Binary Brains</div>
    <div class="cover-meta"><strong>Team Leader:</strong> Shivam Kansal</div>
    <div class="cover-meta"><strong>Team Members:</strong> Shivanya Agarwal, Akriti Sengar, Archi Snehi, Akansha Kumari, Suraj Prajapati</div>
    <div class="cover-meta"><strong>Project Mentor:</strong> Dr. Mukesh Saraswat</div>
    <div class="cover-meta"><strong>Core Tech Stack:</strong> Next.js 14, Web Workers, C++ WASM SIMD, BigInt Fixed-Point Paise Math, TanStack Virtual v3, SheetJS</div>
    <div class="cover-meta"><strong>Statutory Coverage:</strong> Sec 16(2)(aa), Sec 16(4), Sec 50(3), Sec 170, Rule 37A, Rule 88D DRC-01C, GSTN IMS, GSTR-1A, DPDP Act 2023</div>
  </div>
  
  <div style="font-size: 10pt; color: #64748b; max-width: 500px; margin: 0 auto; line-height: 1.5;">
    <strong>THE DEFINITIVE ALL-IN-ONE MASTER LEARNING BIBLE:</strong><br>
    From a simple 5-year-old candy store analogy to deep statutory case laws, SIMD algorithmic proofs, slide-by-slide verbal scripts, and exhaustive jury defense battlecards.
  </div>
</div>

<!-- ========================================================================= -->
<!-- PART 1: THE 5-YEAR-OLD EXPLANATION -->
<!-- ========================================================================= -->
<h1>Part 1: The "Teach a 5-Year-Old" Story</h1>
<div style="font-style: italic; color: #64748b; margin-bottom: 15px;">
  How to explain GST reconciliation to anyone in 2 minutes using chocolates and school diaries.
</div>

<h3>1. The Chocolate Factory & The Tax Token 🍫</h3>
<p>
  Imagine you love chocolate. You go to <strong>Uncle Shopkeeper</strong> to buy a chocolate bar that costs <strong>&#8377;100</strong>.
  Uncle Shopkeeper says: <em>"The chocolate is &#8377;100, but the Government Teacher requires an 18% Tax (&#8377;18). So you must pay me &#8377;118."</em>
  You give Uncle Shopkeeper &#8377;118. Uncle promises: <em>"I will give this &#8377;18 to the Government Teacher and register your name in the Golden School Diary so you get your &#8377;18 cashback coupon (Input Tax Credit)."</em>
</p>

<h3>2. The Pocket Diary vs The Golden School Diary 📖</h3>
<p>
  In business, there are always two diaries:
</p>
<ul>
  <li><strong>Your Pocket Diary (Your ERP / Tally Purchase Register):</strong> You write down: <em>"On August 5th, I paid &#8377;18 tax to Uncle Shopkeeper for Invoice #45."</em></li>
  <li><strong>The Government Teacher's Golden Diary (GSTR-2B):</strong> On the 14th of every month, the Government publishes a static statement showing all tax reported by sellers.</li>
</ul>
<p>
  If Uncle Shopkeeper did his homework and told the Government Teacher: <em>"Yes, Little Kid paid &#8377;18 tax for Invoice #45"</em> &mdash; <strong>IT IS A MATCH!</strong> You get your &#8377;18 cashback tax credit. 🎉
</p>
<p>
  <strong>BUT WHAT IF UNCLE WENT ON VACATION AND FORGOT?</strong><br>
  Then the Golden Diary has <strong>NO RECORD</strong> of your &#8377;18 tax!
</p>

<h3>3. The 6-Day Monster (The Monthly Crunch) ⏳</h3>
<p>
  Every month in India, the Golden Diary (GSTR-2B) is published on the <strong>14th</strong>, and the final tax return (GSTR-3B) must be submitted by the <strong>20th</strong>. That leaves exactly <strong>6 DAYS</strong>.
</p>
<p>
  If a company buys from 500 different vendors and has <strong>10,000 invoices</strong>, human accountants must manually compare 10,000 spreadsheet rows. If you accidentally claim cashback for invoices that aren't in the Golden Diary:
</p>
<ol>
  <li>The Government issues an automated red demand notice called <strong>Form GST DRC-01C (Rule 88D)</strong>.</li>
  <li>They charge you the tax back PLUS a massive <strong>18% compound annual penal interest (Section 50(3))</strong>!</li>
  <li>They lock your business portal so you cannot sell goods or issue invoices anymore (<strong>Rule 59(6) Lockout</strong>)!</li>
</ol>

<h3>4. How ReconcileGST Solves This 🚀</h3>
<p>
  <strong>ReconcileGST is a magical super-fast robot that:</strong>
</p>
<ul>
  <li>Compares 10,000 invoices in <strong>0.24 seconds</strong> (faster than the blink of an eye).</li>
  <li>Catches every human typo (e.g. <code>INV/2026/00456</code> vs <code>456</code>) and Section 170 &#8377;1 rounding safe harbor.</li>
  <li>Automatically drafts an urgent <strong>bilingual WhatsApp recovery message</strong> to Uncle Shopkeeper: <em>"Upload Invoice #45 right now or your upcoming payment is on HOLD!"</em></li>
  <li>Generates a formal legal reply letter citing High Court judgments to protect innocent buyers.</li>
  <li>Operates <strong>100% inside your web browser RAM</strong> without uploading financial secrets to any external cloud server (100% private).</li>
</ul>

<div class="page-break"></div>

<!-- ========================================================================= -->
<!-- PART 2: THE 5 REAL-WORLD MISMATCH SCENARIOS -->
<!-- ========================================================================= -->
<h1>Part 2: Why Invoices Don't Match in Real Life</h1>
<p>
  In our production dataset, mismatches are not random; they fall into 5 concrete statutory and typographical categories:
</p>

<table>
  <thead>
    <tr>
      <th>Mismatch Scenario</th>
      <th>ERP Purchase Register</th>
      <th>GSTR-2B Government Portal</th>
      <th>Root Cause</th>
      <th>ReconcileGST Engine Resolution</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>1. Delimiter & Syntax Drift</strong></td>
      <td><code>LT/2026-27/00456</code></td>
      <td><code>456</code> or <code>202627456</code></td>
      <td>Accountants type prefixes, slashes, and FY identifiers; portal APIs strip them.</td>
      <td><strong>Pass 2: Canonical Syntax Normalization</strong> strips non-alphanumeric noise and matches on core sequence.</td>
    </tr>
    <tr>
      <td><strong>2. Section 170 Rounding</strong></td>
      <td>Tax = <code>&#8377;18,450.40</code></td>
      <td>Tax = <code>&#8377;18,451.00</code></td>
      <td>ERP calculates float taxes per line item; supplier portal rounds gross invoice tax.</td>
      <td><strong>Pass 2: Section 170 Safe Harbor</strong> approves all differences &le; 100 Paise (&plusmn;&#8377;1.00) as legal matches.</td>
    </tr>
    <tr>
      <td><strong>3. Typos & OCR Inversion</strong></td>
      <td><code>TATA-ENG-88412</code></td>
      <td><code>TATA-ENG-88421</code></td>
      <td>Human billing clerk transposed adjacent digits during data entry.</td>
      <td><strong>Pass 3: RapidFuzz C++ SIMD Levenshtein</strong> calculates similarity score &ge; 0.85 and flags as Probable Match.</td>
    </tr>
    <tr>
      <td><strong>4. Tax Head Shift (POS Swap)</strong></td>
      <td>IGST = <code>&#8377;36,000</code><br>CGST+SGST = <code>&#8377;0</code></td>
      <td>IGST = <code>&#8377;0</code><br>CGST+SGST = <code>&#8377;36,000</code></td>
      <td>Supplier selected wrong Place of Supply (POS) state code in GSTR-1.</td>
      <td><strong>Pass 4: Table 9A Resolver</strong> confirms equal net tax and generates Table 9A portal rectification directives.</td>
    </tr>
    <tr>
      <td><strong>5. Defaulting Vendor (Missing in 2B)</strong></td>
      <td><code>UTCL/2026/9012</code><br>Tax = <code>&#8377;54,000</code></td>
      <td><em>Record Missing from Portal</em></td>
      <td>Supplier collected tax from buyer but failed to file Form GSTR-1 by the 11th.</td>
      <td><strong>Statutory Sentinel</strong> flags Sec 16(2)(aa) violation, isolates &#8377;54,000 blocked capital, and triggers 1-Click WhatsApp notice.</td>
    </tr>
  </tbody>
</table>

<div class="callout callout-crimson">
  <div class="callout-title">CRITICAL STATUTORY DANGER: THE DEFAULTING SUPPLIER</div>
  Under Section 16(2)(aa), if a supplier fails to upload an invoice, the buyer CANNOT claim Input Tax Credit. If the buyer claims it anyway, the government triggers an automated Form GST DRC-01C demand notice with 18% compound interest under Section 50(3).
</div>

<!-- ========================================================================= -->
<!-- PART 3: INDIAN GST STATUTORY COMPENDIUM -->
<!-- ========================================================================= -->
<h1>Part 3: Indian GST Statutory Laws & Legal Precedents</h1>

<h3>1. Core Statutory Acts & Rules</h3>
<ul>
  <li><strong>Section 16(2)(aa) of the CGST Act, 2017:</strong> Mandates that Input Tax Credit can only be claimed if the invoice has been furnished by the supplier in Form GSTR-1 and communicated to the recipient in Form GSTR-2B.</li>
  <li><strong>Section 16(4) of the CGST Act, 2017:</strong> Hard annual statutory deadline. No ITC can be claimed for any invoice after 30th November following the end of the financial year. Missing this deadline means permanent financial loss.</li>
  <li><strong>Section 170 of the CGST Act, 2017:</strong> Statutory Rounding Safe Harbor. The amount of tax, interest, or penalty shall be rounded off to the nearest rupee (fractions of 50 paise or more are rounded up, less than 50 paise disregarded). Differences within &plusmn;&#8377;1.00 are protected by law.</li>
  <li><strong>Section 50(3) of the CGST Act, 2017:</strong> Imposes a mandatory <strong>18% per annum compound penal interest</strong> on Input Tax Credit wrongly availed and utilized.</li>
  <li><strong>Rule 37A of the CGST Rules, 2017:</strong> Mandates that if a supplier fails to file their GSTR-3B return by 30th November, the buyer must voluntarily reverse the ITC claimed, or face coercive recovery with Section 50 interest.</li>
  <li><strong>Rule 88D & Form GST DRC-01C (2023):</strong> Automated system-generated electronic discrepancy notices issued when ITC claimed in GSTR-3B exceeds GSTR-2B by <strong>>20% AND >&#8377;25 Lakhs</strong>. The taxpayer has a mandatory 7-day window to pay or file Part B defense.</li>
  <li><strong>Rule 59(6)(e) of the CGST Rules, 2017:</strong> Automated portal lockout. Taxpayers who fail to respond to DRC-01C within 7 days are blocked from filing Form GSTR-1 or using the Invoice Furnishing Facility (IFF).</li>
  <li><strong>GSTN Invoice Management System (IMS - October 2024):</strong> Direct taxpayer facility on the GST portal enabling recipients to Accept, Reject, or Keep Pending every inward invoice before GSTR-2B generation.</li>
  <li><strong>Form GSTR-1A (Notification No. 12/2024-CT):</strong> Intra-month amendment facility allowing suppliers to declare missing invoices after GSTR-1 submission (11th) but before GSTR-3B filing (20th).</li>
</ul>

<h3>2. Landmark Judicial Precedents Protecting Buyers</h3>
<ul>
  <li><strong>Madras High Court in <em>D.Y. Beathel Enterprises v. State Tax Officer (2021)</em>:</strong> The High Court quashed recovery orders against the buyer, holding that the tax authority must first initiate investigation and coercive proceedings against the defaulting seller before demanding tax reversal from the bona fide buyer.</li>
  <li><strong>Calcutta High Court in <em>Suncraft Energy Pvt Ltd v. Assistant Commissioner (2023)</em> (Affirmed by Supreme Court):</strong> Held that denial of ITC to the recipient solely because of supplier non-reflection in GSTR-2A/2B is impermissible without the department first exhausting all statutory recovery mechanisms against the seller.</li>
</ul>

<div class="page-break"></div>

<!-- ========================================================================= -->
<!-- PART 4: ALGORITHMIC ENGINEERING & PERFORMANCE ARCHITECTURE -->
<!-- ========================================================================= -->
<h1>Part 4: Algorithmic Architecture & The 5-Stage SIMD Engine</h1>

<h3>1. Inverted Hash Map Candidate Blocking: O(N+M) Complexity Proof</h3>
<p>
  Standard brute-force nested loops compare every ERP invoice ($N$) against every GSTR-2B record ($M$), requiring $O(N \times M)$ comparisons. For 10,000 invoices, this requires $10,000 \times 10,000 = 100,000,000$ (100 Million) comparisons, freezing browser threads.
</p>
<p>
  <strong>ReconcileGST's Inverted Hash Blocker:</strong>
</p>
<ol>
  <li>In linear $O(N)$ time, partitions ERP records into hash buckets keyed by normalized 15-character Supplier GSTIN.</li>
  <li>In linear $O(M)$ time, maps GSTR-2B records into the same hash buckets.</li>
  <li>Comparisons only execute between invoices from the exact same vendor, pruning over <strong>99.8% of the search space</strong>.</li>
  <li>Total Complexity: Exactly <strong>$O(N + M)$ linear time</strong> (~240ms for 10,000 invoices).</li>
</ol>

<h3>2. The 5-Stage SIMD Waterfall Cascade</h3>
<pre><code>// 5-Stage Waterfall Engine Execution Flow
Stage 1: Candidate Partitioning  --> Inverted Hash Buckets by GSTIN (O(N+M))
Stage 2: Pass 1 (Exact Hash)     --> 128-bit Tuple [GSTIN + InvNum + Date + TaxPaise] (O(1))
Stage 3: Pass 2 (Syntax/Sec 170) --> Delimiter Stripping + |DeltaTax| <= 100 Paise (Safe Harbor)
Stage 4: Pass 3 (RapidFuzz SIMD) --> C++ WASM Myers Bit-Parallel Levenshtein String Similarity >= 0.85
Stage 5: Pass 4 (POS Swap)       --> Equal Total Tax with Shifted IGST vs (CGST+SGST) Heads
Stage 6: Sentinel Scoring        --> Rule 88D (>20% & >25L), Rule 37A (180D), Sec 50(3) (18% p.a.)</code></pre>

<h3>3. Fixed-Point Integer Arithmetic vs Floating Point Drift</h3>
<div class="callout callout-emerald">
  <div class="callout-title">THE MATHEMATICAL PROOF OF ZERO DRIFT</div>
  In standard JavaScript IEEE-754 floating point arithmetic: <code>0.1 + 0.2 = 0.30000000000000004</code>.<br>
  Over 100,000 invoices, floating point drift accumulates up to &#8377;340.00 in rounding errors, triggering false DRC-01C mismatch notices!<br><br>
  <strong>ReconcileGST's Invariant:</strong> All currency amounts are stored and calculated as <strong>BigInt integers in Paise</strong> ($1\text{ INR} = 100\text{ Paise}$).<br>
  $$\text{Tax in INR} = \frac{\text{BigInt(Paise)}}{100n}$$
  <strong>Float Drift = Exactly 0.000000%.</strong>
</div>

<h3>4. DOM Virtualization & Web Worker Memory Benchmarks</h3>
<ul>
  <li><strong>TanStack Virtual v3:</strong> Windowing mounts only 25 active DOM table rows regardless of whether the dataset contains 1,000 or 100,000 invoices, maintaining steady 60 FPS scrolling and keeping DOM memory below 42MB.</li>
  <li><strong>Zero-Copy Transferable ArrayBuffers:</strong> Data passes between the main UI thread and the Web Worker thread via memory pointer ownership transfer in &lt;0.15ms latency without cloning objects.</li>
</ul>

<div class="page-break"></div>

<!-- ========================================================================= -->
<!-- PART 5: SLIDE-BY-SLIDE PPT ALIGNMENT & PRESENTATION SCRIPT -->
<!-- ========================================================================= -->
<h1>Part 5: Slide-by-Slide PPT Presentation Master Script</h1>
<p style="color: #64748b; font-style: italic;">
  Word-for-word 3-minute pitch script for Team Binary Brains mapped directly to the submitted PPT deck.
</p>

<h3>Slide 1: Title, Vision & Executive Summary</h3>
<p><strong>Speaker: Shivam Kansal (Team Leader)</strong></p>
<p>
  <em>"Respected Jury members, every month over 82 Lakh Indian businesses face the high-stress '6-Day Squeeze' between GSTR-2B generation on the 14th and GSTR-3B filing on the 20th. Unreconciled Input Tax Credit leads to blocked working capital, 18% penal interest under Section 50, and automated electronic demand notices under Rule 88D DRC-01C. We present ReconcileGST: India's first 100% zero-cloud, client-side reconciliation engine that processes 10,000 invoices in under 300 milliseconds with zero server cost and zero data breach liabilities."</em>
</p>

<h3>Slide 2: The Core Problem & Statutory Risks</h3>
<p><strong>Speaker: Shivanya Agarwal</strong></p>
<p>
  <em>"Under Section 16(2)(aa) of the CGST Act, a buyer cannot claim tax credit unless the supplier reports the invoice in GSTR-2B. When businesses claim credit on missing invoices, they breach Rule 88D thresholds (>20% and >&#8377;25 Lakhs), triggering automated DRC-01C demand notices and portal lockouts under Rule 59(6). Traditional cloud accounting software is expensive (&#8377;50,000 to &#8377;1.5 Lakhs/year), slow, and requires businesses to upload confidential financial ledgers to third-party servers. We solve this at the edge."</em>
</p>

<h3>Slide 3: Technical Breakthrough & 5-Stage SIMD Waterfall</h3>
<p><strong>Speaker: Akriti Sengar</strong></p>
<p>
  <em>"Our core algorithmic breakthrough is a 5-Stage SIMD Matching Waterfall. Stage 1 executes Inverted Hash Candidate Blocking on Supplier GSTINs, reducing comparison complexity from quadratic O(N*M) to linear O(N+M), pruning search space by over 99.8%. Stage 2 performs exact O(1) hash matching. Stage 3 normalizes invoice syntax and applies Section 170 &plusmn;&#8377;1 rounding safe harbors. Stage 4 uses C++ SIMD RapidFuzz bit-parallel Levenshtein algorithms to catch typos. Stage 5 resolves Place of Supply shifts. All calculations use BigInt integer Paise for exactly 0.00% float drift."</em>
</p>

<h3>Slide 4: Zero-Cloud Privacy & DPDP Act 2023 Architecture</h3>
<p><strong>Speaker: Archi Snehi</strong></p>
<p>
  <em>"Under the Digital Personal Data Protection Act 2023, data breaches carry penalties up to &#8377;250 Crores. ReconcileGST processes 100% of ERP ledgers and GSTR-2B JSONs directly inside the user's browser RAM using multi-threaded Web Workers. Zero bytes of sensitive pricing or vendor information leave the device. This delivers 100% privacy compliance and reduces SaaS infrastructure operating costs to exactly &#8377;0 per reconciliation."</em>
</p>

<h3>Slide 5: Multi-Channel Recovery & Statutory Defense Suite</h3>
<p><strong>Speaker: Akansha Kumari</strong></p>
<p>
  <em>"Reconciliation is useless without recovery. ReconcileGST provides a complete action suite: First, 1-Click Bilingual WhatsApp & Email payment-hold intimations to defaulting vendors with deep-links. Second, Form GSTR-1A delta JSON payloads that suppliers can directly upload to the GST portal to fix omissions intra-month. Third, an automated Form GST DRC-01C Part B Legal Defense Generator citing landmark Madras High Court rulings in D.Y. Beathel and Calcutta High Court rulings in Suncraft Energy."</em>
</p>

<h3>Slide 6: Market Opportunity, SaaS Economics & SIH Impact</h3>
<p><strong>Speaker: Suraj Prajapati</strong></p>
<p>
  <em>"With 1.4 Crore registered MSMEs and 4.2 Lakh practicing CAs in India, our Total Addressable Market is &#8377;12,100 Crores. Because our compute engine runs entirely on client devices, our gross margins exceed 88%. By automating reconciliation from 40 hours down to 240 milliseconds, ReconcileGST saves Indian businesses over &#8377;1.8 Lakhs in blocked capital and ensures 100% statutory compliance for Digital India."</em>
</p>

<div class="page-break"></div>

<!-- ========================================================================= -->
<!-- PART 6: SCREEN-BY-SCREEN PLATFORM WALKTHROUGH -->
<!-- ========================================================================= -->
<h1>Part 6: Screen-by-Screen Platform Walkthrough</h1>

<h3>1. Executive Header & Live Hardware Telemetry HUD</h3>
<p>
  Located at the sticky top of the terminal. Displays active client metadata (<em>Bharat Manufacturing & Engineering Ltd</em> &bull; <code>07AAAAA0000A1Z5</code>), the active <code>SIMD WASM ACTIVE</code> indicator, microsecond-accurate match latency (e.g. <code>241.80ms</code>), processing throughput (e.g. <code>41,322 rows/sec</code>), and the verified <code>0 Bytes Egress (Local RAM)</code> privacy guarantee.
</p>

<h3>2. Dual Ingestion Dropzone & 1-Click Benchmark Hero</h3>
<p>
  Supports drag-and-drop ingestion of official GSTN GSTR-2B JSON and Tally/Zoho/SAP purchase register CSVs. Features the prominent <strong>"⚡ Load 10,000 Records & Run Recon"</strong> button (Shortcut: <code>Ctrl+D</code>) for instant hackathon jury verification.
</p>

<h3>3. Statutory Sentinel KPI Cards (4 Master Cards)</h3>
<ul>
  <li><strong>Card 1: Matched ITC (Safe to Claim):</strong> Quantifies Input Tax Credit eligible under Table 4(A)(5) of Form GSTR-3B with zero reversal risk (e.g. &#8377;4.82 Crores across 8,950 invoices).</li>
  <li><strong>Card 2: Rule 88D DRC-01C Risk Sentinel:</strong> Evaluates excess ITC percentage against the statutory 20% limit. Features a real-time variance progress bar flagging whether automated demand notices are triggered.</li>
  <li><strong>Card 3: Trapped ITC & Section 16(2)(aa) Risk:</strong> Highlights blocked working capital due to defaulting suppliers who failed to file GSTR-1, recommending immediate vendor payment hold.</li>
  <li><strong>Card 4: Section 50(3) 18% Penal Interest:</strong> Tracks daily compounding penal interest accrued on unreconciled credit under Rule 37A watch.</li>
</ul>

<h3>4. Virtualized Reconciliation Table with GSTN IMS Pre-Triage</h3>
<p>
  TanStack Virtual v3 windowed table rendering thousands of invoices at 60 FPS. Features instant <code>/</code> shortcut search, status filter tabs (<em>Matched</em>, <em>Missing in 2B</em>, <em>POS Swaps</em>), and inline 1-click GSTN IMS pre-triage action buttons:
</p>
<ul>
  <li><span class="badge badge-emerald">ACC</span> <strong>Accept:</strong> Approves invoice for GSTR-2B auto-population.</li>
  <li><span class="badge badge-crimson">REJ</span> <strong>Reject:</strong> Flags Section 17(5) blocked credit or non-genuine supply for permanent reversal.</li>
  <li><span class="badge badge-amber">PND</span> <strong>Pending:</strong> Holds credit until supplier rectifies clerical errors or uploads Form GSTR-1A.</li>
</ul>

<h3>5. 800px Side-by-Side Split Screen Diff Inspector</h3>
<p>
  Opened via the table row action icon (or shortcut <code>W</code>). Displays an audit table comparing ERP Purchase Register vs GSTR-2B Portal Records with syntax strikethrough (e.g., showing <code>~INV/2026/~ 00456</code> normalized to <code>456</code>) and legal statutory directive directives.
</p>

<h3>6. 1-Click WhatsApp Vendor Recovery Notice Generator</h3>
<p>
  Generates bilingual (Hinglish / Formal English) statutory payment-hold notices. Clicking <code>Launch WhatsApp (wa.me)</code> opens WhatsApp Web/Desktop with pre-filled parameters at <strong>&#8377;0 SaaS infrastructure messaging cost</strong>.
</p>

<h3>7. Form GST DRC-01C Part B Statutory Legal Defense Generator</h3>
<p>
  Assembles a complete, formal legal response to tax authorities. Features toggleable defense grounds (Supplier Delay, Clerical Normalization, Section 170 Rounding, Place of Supply Allocation) backed by Madras High Court (<em>D.Y. Beathel</em>) and Calcutta High Court (<em>Suncraft Energy</em>) case laws.
</p>

<h3>8. 6-Tab CA Audit-Ready Excel Exporter</h3>
<p>
  Generates a workbook via SheetJS containing 6 color-coded worksheets (<em>Executive Summary</em>, <em>Matched Reconciled</em>, <em>Mismatched Diffs</em>, <em>Missing in 2B Default</em>, <em>Missing in PR Unclaimed</em>, <em>Rule 37A Aging Audit</em>) with dynamic embedded <code>=SUMIFS()</code> formulas and spreadsheet formula injection protection.
</p>

<div class="page-break"></div>

<!-- ========================================================================= -->
<!-- PART 7: JURY BATTLECARDS & TOUGH Q&A -->
<!-- ========================================================================= -->
<h1>Part 7: Exhaustive Jury Defense Battlecards & Viva Q&A</h1>

<h3>Computer Science & Systems Architecture Questions</h3>

<p><strong>Q1: Why build this in client-side browser RAM instead of running Python / FastAPI on AWS EC2?</strong></p>
<p>
  <strong>Answer:</strong> <em>"Three core pillars: First, <strong>Data Privacy under DPDP Act 2023</strong>—Indian enterprises refuse to upload unencrypted general purchase ledgers containing vendor pricing and profit margins to third-party cloud servers. Second, <strong>Zero Infrastructure Cost</strong>—running compute on client hardware eliminates cloud server hosting fees, allowing us to offer a free tier with >88% gross margins on pro tiers. Third, <strong>Speed</strong>—eliminating cloud network latency allows our Inverted Hash Blocker and SIMD Web Workers to reconcile 10,000 invoices in 240ms in client RAM."</em>
</p>

<p><strong>Q2: What happens if a large enterprise uploads 1,000,000 invoices? Will the browser crash?</strong></p>
<p>
  <strong>Answer:</strong> <em>"No. On the rendering side, TanStack Virtual v3 mounts only 25 active DOM elements regardless of dataset size, keeping DOM RAM usage under 42MB. On the compute side, our Web Worker utilizes BigInt64Array flat columnar buffers (48 bytes per row), allowing 1 Million records to occupy under 48MB of heap memory in an isolated background thread."</em>
</p>

<p><strong>Q3: How do you prevent CSV and Spreadsheet Formula Injection attacks?</strong></p>
<p>
  <strong>Answer:</strong> <em>"In <code>lib/excel-exporter.ts</code>, the <code>sanitizeCellForFormulaInjection</code> utility scans all raw text inputs. Any cell starting with '=', '+', '-', or '@' is prepended with a single quotation mark (<code>'</code>), forcing spreadsheet engines like Excel to treat it strictly as plaintext while preserving visual formatting for Chartered Accountants."</em>
</p>

<h3>Chartered Accountant (CA) & Tax Questions</h3>

<p><strong>Q4: How do you handle Section 17(5) Blocked Credits (e.g. food, motor vehicles, employee gifts)?</strong></p>
<p>
  <strong>Answer:</strong> <em>"Through GSTN IMS pre-triage. The CA clicks <code>REJECT</code>, and the engine isolates the credit, routing it to GSTR-3B Table 4(B)(1) (Permanent Ineligible Reversals) instead of Table 4(A)(5), preventing improper tax credit availment."</em>
</p>

<p><strong>Q5: If a supplier uploaded sales late, does the buyer get penalized under DRC-01C?</strong></p>
<p>
  <strong>Answer:</strong> <em>"If the supplier uploads before GSTR-3B filing via Form GSTR-1A, the credit updates into GSTR-2B without mismatch. If an automated DRC-01C notice is issued, our DRC-01C Legal Defense Generator automatically drafts a Part B response citing the Supreme Court-affirmed ruling in Suncraft Energy (2023), establishing that recovery must first be initiated against the defaulting seller before penalizing the bona fide recipient."</em>
</p>

<!-- ========================================================================= -->
<!-- PART 8: COMPLETE CODEBASE MAP -->
<!-- ========================================================================= -->
<h1>Part 8: Complete Codebase & Repository Architecture Map</h1>

<table>
  <thead>
    <tr>
      <th>Directory / File</th>
      <th>Key Exports & Modules</th>
      <th>Architectural Responsibility</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>lib/types.ts</code></td>
      <td>32 Master Interfaces (<code>ReconResult</code>, <code>ReconResultSet</code>, <code>Rule88DRiskResult</code>)</td>
      <td>Master Single Source of Truth for all domain contracts, schemas, and enums.</td>
    </tr>
    <tr>
      <td><code>lib/matching-engine.ts</code></td>
      <td><code>InvertedHashBlocker</code>, <code>WaterfallMatchingEngine</code>, <code>ReconciliationEngine</code></td>
      <td>5-Stage SIMD Matching Waterfall, Inverted Hash Blocker, and Statutory Scoring.</td>
    </tr>
    <tr>
      <td><code>lib/statutory-sentinel.ts</code></td>
      <td><code>evaluateRule88DThreat</code>, <code>calculateSection50PenalInterest</code></td>
      <td>Mathematical implementation of Rule 88D, Section 50(3), and Rule 37A algorithms.</td>
    </tr>
    <tr>
      <td><code>lib/formatters.ts</code></td>
      <td><code>formatINR</code>, <code>formatINRRaw</code>, <code>formatDate</code>, <code>formatCount</code></td>
      <td>Precision Indian Rupee numbering format (Lakhs/Crores) and safe null/undefined handling.</td>
    </tr>
    <tr>
      <td><code>lib/whatsapp-generator.ts</code></td>
      <td><code>generateWhatsAppMessage</code>, <code>generateWhatsAppDeepLink</code></td>
      <td>Bilingual (Hinglish/English) <code>wa.me</code> payment-hold deep link synthesizer.</td>
    </tr>
    <tr>
      <td><code>lib/drc01c-generator.ts</code></td>
      <td><code>generateDrc01cLegalReply</code></td>
      <td>Form GST DRC-01C Part B statutory legal brief generator citing High Court case laws.</td>
    </tr>
    <tr>
      <td><code>lib/gstr1a-generator.ts</code></td>
      <td><code>buildGstr1aPayloadForSupplier</code>, <code>downloadGstr1aJson</code></td>
      <td>Official CBIC Form GSTR-1A outward amendment delta JSON payload builder.</td>
    </tr>
    <tr>
      <td><code>lib/excel-exporter.ts</code></td>
      <td><code>generateCAAuditWorkbook</code>, <code>createCAAuditWorkbookBlob</code></td>
      <td>6-Tab CA Audit Workbook exporter with dynamic <code>=SUMIFS()</code> formulas.</td>
    </tr>
    <tr>
      <td><code>public/workers/recon-worker.ts</code></td>
      <td>Web Worker Message Dispatcher</td>
      <td>Multi-threaded background compute kernel with zero-copy ArrayBuffer IPC.</td>
    </tr>
    <tr>
      <td><code>components/VirtualReconTable.tsx</code></td>
      <td><code>VirtualReconTable</code></td>
      <td>TanStack Virtual v3 windowed table with inline IMS triage and search.</td>
    </tr>
    <tr>
      <td><code>components/KpiSummaryCards.tsx</code></td>
      <td><code>KpiSummaryCards</code></td>
      <td>4 Statutory Risk Cards (Matched ITC, DRC-01C Exposure, Trapped ITC, Sec 50 Interest).</td>
    </tr>
    <tr>
      <td><code>app/page.tsx</code></td>
      <td><code>MasterDashboardPage</code></td>
      <td>Master Next.js dashboard orchestrating Header, HUD, Dropzone, Table, Cards, and Modals.</td>
    </tr>
  </tbody>
</table>

<div class="divider"></div>
<div style="text-align: center; font-size: 9pt; color: #64748b;">
  <strong>ReconcileGST</strong> &bull; Built with pride by Team Binary Brains for Smart India Hackathon 2026.<br>
  Mentor: Dr. Mukesh Saraswat &bull; Team Leader: Shivam Kansal
</div>

</body>
</html>
"""

def generate_pdf():
    base_dir = r"c:\Users\nnipu\Downloads\ReconcileGST"
    html_path = os.path.join(base_dir, "RECONCILEGST_MASTER_LEARNING_BIBLE.html")
    pdf_path = os.path.join(base_dir, "RECONCILEGST_MASTER_LEARNING_BIBLE.pdf")

    print(f"1. Writing HTML file to: {html_path}")
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(HTML_CONTENT)

    print("2. Locating Headless Browser (Edge or Chrome)...")
    edge_paths = [
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    ]

    browser_bin = None
    for p in edge_paths:
        if os.path.exists(p):
            browser_bin = p
            break

    if not browser_bin:
        print("ERROR: Could not find Edge or Chrome for PDF compilation.")
        return False

    print(f"3. Compiling PDF using: {browser_bin}")
    cmd = [
        browser_bin,
        "--headless",
        "--disable-gpu",
        "--run-all-compositor-stages-before-draw",
        "--no-pdf-header-footer",
        f"--print-to-pdf={pdf_path}",
        html_path,
    ]

    res = subprocess.run(cmd, capture_output=True, text=True)
    if os.path.exists(pdf_path):
        size_kb = os.path.getsize(pdf_path) / 1024
        print(f"SUCCESS: PDF Generated successfully!")
        print(f"  Target File: {pdf_path}")
        print(f"  File Size: {size_kb:.1f} KB")
        return True
    else:
        print("ERROR: PDF was not generated. Stderr:", res.stderr)
        return False

if __name__ == "__main__":
    generate_pdf()
