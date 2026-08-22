# Stage 12: Offline Air-Gap Packaging & Standalone Bundle Architecture

**Project:** ReconcileGST (SIH 2026)  
**Team:** Binary Brains  
**Packaging Format:** Zero-Dependency Static SPA Bundle / Offline Progressive Web App (PWA) / Desktop Wrapper  

---

## 1. Offline Standalone Distribution Architecture

ReconcileGST is designed to operate completely offline in low-connectivity or zero-trust air-gapped corporate environments.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                          OFFLINE AIR-GAP RUNTIME PACKAGING                             │
├─────────────────────────┬──────────────────────────────────┬───────────────────────────┤
│ Distribution Target     │ Packaging Technique              │ Deployment Footprint      │
├─────────────────────────┼──────────────────────────────────┼───────────────────────────┤
│ **Static Web Edge**     │ Single static directory (`out/`) │ Static CDN / GitHub Pages │
│ **Offline PWA**         │ Service Worker cache-first cache │ In-browser installation   │
│ **Air-Gapped CA USB**   │ Local static HTML/JS folder      │ Open `index.html` locally │
│ **Tauri / Electron**    │ Native Rust / Chromium shell     │ 15 MB standalone `.exe`   │
└─────────────────────────┴──────────────────────────────────┴───────────────────────────┘
```

---

## 2. Air-Gapped Operation Verification

When running completely disconnected from the Internet:
1. All fonts (`Inter`, `JetBrains Mono`) are locally bundled within `app/globals.css` and Next.js asset bundles.
2. The Web Worker (`public/workers/recon-worker.ts`) initializes via relative local origin Blob/URL.
3. SheetJS Excel generation and parsing operate with embedded local binary codecs.
4. WhatsApp recovery links format as native OS protocol handlers (`wa.me`) passed to the operating system's registered WhatsApp application.
