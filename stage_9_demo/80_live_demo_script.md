# Stage 9: Live Demo Script & 3-Minute Presentation Blueprint

**Project:** ReconcileGST — Automated Inward GST ITC Reconciliation & Defaulting Vendor Recovery Engine  
**Team:** Binary Brains  
**Presenter / Team Leader:** Shivam Kansal  
**Team Members:** Shivam Kansal (TL), Shivanya Agarwal, Akriti Sengar, Archi Snehi, Akansha Kumari, Suraj Prajapati  
**Project Mentor:** Dr. / Prof. Mukesh Saraswat  
**Hackathon Event:** Smart India Hackathon (SIH) 2026 — Software Track  
**Duration:** Exactly 3 Minutes (180 Seconds) + 2 Minutes Jury Q&A  

---

## 1. 180-Second Minute-by-Minute Live Execution Script

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                               3-MINUTE SIH 2026 LIVE DEMO TIMELINE                      │
├─────────┬───────────────────────────────────┬───────────────────────────────────────────┤
│ Seconds │ Segment Title                     │ Live Screen Action & Verbal Narrative     │
├─────────┼───────────────────────────────────┼───────────────────────────────────────────┤
│ 00–30s  │ The "6-Day Squeeze" & 1-Click Load│ Click "⚡ 1-Click 10k Demo" Instant Demo  │
│ 30–75s  │ 5-Stage SIMD Matching Engine      │ Point to Microsecond HUD (242ms / 60 FPS) │
│ 75–120s │ Split Difference Drawer & IMS     │ Open Invoice Drawer; Trigger IMS Triage   │
│ 120–150s│ 1-Click WhatsApp Vendor Recovery  │ Launch Bilingual WhatsApp Recovery Modal  │
│ 150–180s│ 6-Tab CA Audit Excel & DRC-01C    │ Download 6-Tab .xlsx & Open Part B Defense│
└─────────┴───────────────────────────────────┴───────────────────────────────────────────┘
```

---

### Segment 1: The "6-Day Squeeze" & Onyx UI (00:00 – 00:30)
* **Visual on Screen:** Clean, high-density **Onyx & Antique Ochre UI** showing empty dual dropzones. The **Guided Tour modal** subtly prompts the user.
* **Speaker (Shivam Kansal - TL):**
  > "Respected Jury and Mentors, welcome. Every month between the 14th and 20th, 82 Lakh Indian B2B taxpayers face the intense '6-Day Squeeze'. Under Section 16(2)(aa), if a supplier fails to upload an invoice, your Input Tax Credit is locked. Legacy tools upload sensitive ledgers to third-party clouds, violating the DPDP Act 2023. Watch ReconcileGST solve this entirely in-browser."
* **Speaker (Shivanya Agarwal):**
  > "Notice our executive Onyx & Antique Ochre interface. I will click the **1-Click 10k Demo** button to instantly ingest and reconcile 10,000 live messy B2B invoices."
* **Action:** Click `[ ⚡ Load 10,000 Sample Records ]`.

---

### Segment 2: SIMD Cascade Matching (00:30 – 01:15)
* **Visual on Screen:** Screen renders reconciled dashboard. Telemetry HUD updates (242ms / 60 FPS).
* **Speaker (Suraj Prajapati):**
  > "In just 242 milliseconds, our 5-Stage SIMD Cascade Matching Engine reconciled 10,000 dirty invoices across 500 Indian vendors. 
  > We skip Python backend delays entirely. Our Web Workers and WebAssembly (WASM) implementation handles multi-pass deduplication, Section 170 ₹1.00 rounding, and fuzzy Myers string matching instantly."
* **Speaker (Akansha Kumari):**
  > "Even while processing, our UI maintains a locked 60 FPS thanks to TanStack Virtual windowing, utilizing less than 38MB of browser heap memory."

---

### Segment 3: Split Difference Drawer & IMS Pre-Triage (01:15 – 02:00)
* **Visual on Screen:** Click a mismatched row. The Split Difference Drawer slides in.
* **Speaker (Akriti Sengar):**
  > "When we click a mismatch, our Split Difference Drawer highlights token-by-token discrepancies. 
  > With GSTN IMS integration, we can directly set this to `ACCEPT`, `REJECT`, or `KEEP PENDING` with an immutable audit trail."

---

### Segment 4: WhatsApp Vendor Recovery (02:00 – 02:30)
* **Visual on Screen:** Click WhatsApp Recovery button on a missing invoice.
* **Speaker (Archi Snehi):**
  > "To recover blocked working capital, we feature 1-Click Bilingual WhatsApp Recovery. It generates an itemized notice citing Section 16(2)(aa) and Section 50(3) penal interest, complete with the Form GSTR-1A outward amendment payload the supplier needs to file."

---

### Segment 5: CA Audit Excel & DRC-01C Legal Defense (02:30 – 03:00)
* **Visual on Screen:** Export 6-Tab Excel and open DRC-01C defense modal.
* **Speaker (Shivam Kansal):**
  > "Finally, we export an audit-ready 6-Tab Excel workbook with embedded dynamic `=SUMIFS()` formulas. If faced with a Rule 88D DRC-01C notice, our Legal Defense Engine drafts a High Court-backed Part B reply citing D.Y. Beathel and Suncraft Energy precedents.
  > Zero cloud cost. 100% DPDP Act compliance. Team Binary Brains under Dr. Mukesh Saraswat is ready for Q&A!"
