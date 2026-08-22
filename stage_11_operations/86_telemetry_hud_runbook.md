# Stage 11: Microsecond Telemetry HUD Operations & Monitoring Runbook

**Project:** ReconcileGST (SIH 2026)  
**Team:** Binary Brains  
**Scope:** Real-Time Client Telemetry, Performance Gauges & Heap RAM Management  

---

## 1. Microsecond Telemetry Architecture

ReconcileGST integrates a dedicated client-side Telemetry HUD (`components/HeaderToolbar.tsx`) measuring sub-millisecond execution times via the High-Resolution Time API (`performance.now()`).

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              TELEMETRY HUD KPI STRIP FORMAT                            │
├───────────────────┬───────────────────┬───────────────────┬────────────────────────────┤
│ Matching Latency  │ Active Throughput │ Peak Heap RAM     │ Network Egress             │
│ [ 242.10 ms ]     │ [ 110,253 rec/s ] │ [ 38.40 MB ]      │ [ 0 Bytes (Air-Gapped) ]   │
└───────────────────┴───────────────────┴───────────────────┴────────────────────────────┘
```

---

## 2. Telemetry Gauges & Operational Thresholds

| Telemetry Metric | Normal Baseline | Warning Threshold | Critical Action |
|:---|:---:|:---:|:---|
| **10k Ingestion Latency** | $< 40\text{ ms}$ | $> 100\text{ ms}$ | Check for unstripped UTF-8 BOM or delimiter sniffing failure. |
| **5-Stage SIMD Matching** | $80 - 120\text{ ms}$ | $> 250\text{ ms}$ | Check if candidate blocking is falling back to quadratic scan. |
| **JS Heap Memory Allocation** | $30 - 40\text{ MB}$ | $> 70\text{ MB}$ | Trigger `memory-buffer.ts` zero-sanitization and GC release. |
| **DOM Active Mounted Rows** | $25 - 30\text{ rows}$ | $> 50\text{ rows}$ | Verify TanStack Virtual `overscan` buffer setting. |
| **UI Frame Render Duration** | $0.10 - 0.25\text{ ms}$ | $> 16.6\text{ ms}$ (Drop 60 FPS) | Ensure matching computations remain strictly in Web Worker. |
| **Monetary Float Drift** | **$0.000000\text{ Paise}$** | $\ne 0.00\text{ Paise}$ | **HALT:** Schema lock violation; revert to `BigInt64Array`. |

---

## 3. Telemetry Event Dispatch Protocol

The Web Worker dispatches structured telemetry events via standard RPC messages:
```typescript
interface ReconTelemetryEvent {
  type: 'EVT_TELEMETRY_SAMPLE';
  payload: {
    ingestionDurationMs: number;
    matchingDurationMs: number;
    passBreakdown: {
      invertedHashMs: number;
      pass1ExactMs: number;
      pass2SyntaxMs: number;
      pass3SimdMyersMs: number;
      pass4PosSwapMs: number;
      pass5DefaultersMs: number;
    };
    totalRecords: number;
    throughputPerSecond: number;
    peakHeapBytes: number;
  };
}
```
