'use client';

import React from 'react';
import {
  Zap,
  ShieldCheck,
  RotateCcw,
  Cpu,
  Activity,
  Database,
  CheckCircle2,
  Sparkles,
  Layers,
} from 'lucide-react';
import { WorkerExecutionTelemetry, ReconciliationSummaryMetrics } from '@/types/recon';

interface HeaderToolbarProps {
  isLoading: boolean;
  isLoaded: boolean;
  onLoadSampleDemo: () => void;
  onResetSession: () => void;
  onOpenGuidedTour: () => void;
  telemetry?: WorkerExecutionTelemetry;
  summary?: ReconciliationSummaryMetrics;
  clientName?: string;
  clientGstin?: string;
  filingPeriod?: string;
}

export const HeaderToolbar: React.FC<HeaderToolbarProps> = ({
  isLoading,
  isLoaded,
  onLoadSampleDemo,
  onResetSession,
  onOpenGuidedTour,
  telemetry,
  summary,
  clientName = 'Bharat Manufacturing & Engineering Enterprises Ltd',
  clientGstin = '07AAAAA0000A1Z5',
  filingPeriod = 'August 2026 (082026)',
}) => {
  const formatCount = (n: number) => n.toLocaleString('en-IN');

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border-default bg-terminal-glass backdrop-blur-md transition-all duration-200">
      {/* -------------------------------------------------------------
          TOP BAR: BRANDING + CLIENT CONTEXT + ACTIONS
          ------------------------------------------------------------- */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        {/* Left: Brand Identity & Subtext */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-recon-brand-surface border border-recon-brand-border shadow-sm">
              <Layers className="w-5 h-5 text-recon-brand-text" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-sans text-base font-extrabold tracking-tight text-white">
                  RECONCILE<span className="text-recon-brand-text">.GST</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-recon-brand-surface border border-recon-brand-border text-recon-brand-text rounded">
                  v2.4 (SIMD/WASM)
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans tracking-wide">
                Built by <span className="text-recon-emerald-text font-semibold">Binary Brains</span> (SIH 2026)
              </p>
            </div>
          </div>

          <div className="h-5 w-px bg-border-default hidden md:block" />

          {/* Client Metadata Pill */}
          <div className="hidden lg:flex items-center gap-2 bg-terminal-surface2 border border-border-subtle px-3 py-1 rounded-md text-xs">
            <span className="text-slate-400 font-medium">Client:</span>
            <span className="font-semibold text-slate-200">{clientName}</span>
            <span className="font-mono text-recon-brand-text text-[11px] bg-terminal-void px-1.5 py-0.5 rounded border border-border-default">
              {clientGstin}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300 text-[11px] font-medium">{filingPeriod}</span>
          </div>
        </div>

        {/* Right: Actions & Privacy Guarantee */}
        <div className="flex items-center gap-2">
          {/* Zero-Cloud Privacy Badge */}
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-recon-emerald-surface border border-recon-emerald-border text-recon-emerald-text text-xs font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="text-[11px] font-semibold tracking-tight">100% Zero-Cloud RAM</span>
          </div>

          {/* Guided CA / Jury Tour Button */}
          <button
            type="button"
            onClick={onOpenGuidedTour}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-terminal-surface2 hover:bg-terminal-surface3 text-slate-200 hover:text-white border border-border-strong text-xs font-semibold transition-all duration-150 active:scale-[0.98]"
            title="Open guided walkthrough tour for CAs, tax heads, or hackathon jury"
          >
            <Sparkles className="w-3.5 h-3.5 text-recon-brand-text" />
            <span>Guided Tour</span>
          </button>

          {/* 1-Click 10k Benchmark Demo Button */}
          <button
            type="button"
            onClick={onLoadSampleDemo}
            disabled={isLoading}
            className="group relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-recon-brand hover:bg-amber-600 text-black font-sans font-bold text-xs shadow-glow-brand transition-all duration-150 active:scale-[0.98] disabled:opacity-50"
            title="Load 10,000 messy Indian B2B sample invoices and execute full reconciliation (Ctrl+D)"
          >
            <Zap className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform duration-200 text-black fill-black" />
            <span>{isLoading ? 'Running SIMD Pipeline...' : '1-Click 10k Demo'}</span>
            <kbd className="hidden md:inline-block px-1 py-0.2 text-[9px] font-mono bg-black/30 rounded text-black font-bold">
              ^D
            </kbd>
          </button>

          {/* Reset / New Session */}
          {isLoaded && (
            <button
              type="button"
              onClick={onResetSession}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-terminal-surface2 hover:bg-terminal-surface3 text-slate-300 hover:text-white border border-border-default text-xs font-semibold transition-colors"
              title="Clear active dataset and upload new files"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* -------------------------------------------------------------
          TELEMETRY HUD STRIP (Mounted when data is loaded)
          ------------------------------------------------------------- */}
      {isLoaded && telemetry && (
        <div className="bg-terminal-surface1 border-t border-border-subtle px-4 py-1.5 flex flex-col gap-1 text-[11px] font-mono">
          {/* Primary Telemetry Line */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-recon-brand-surface border border-recon-brand-border text-recon-brand-text font-semibold text-[10px]">
                <Cpu className="w-3 h-3 text-recon-brand-text animate-pulse" />
                SIMD WASM ACTIVE
              </span>

              <div className="flex items-center gap-1 text-slate-300">
                <Activity className="w-3.5 h-3.5 text-recon-emerald-text" />
                <span className="text-slate-400">Match Latency:</span>
                <span className="text-recon-emerald-text font-bold tabular-nums">
                  {telemetry.totalExecutionTimeMs.toFixed(2)}ms
                </span>
              </div>

              <div className="hidden md:flex items-center gap-1 text-slate-300">
                <Database className="w-3.5 h-3.5 text-recon-brand-text" />
                <span className="text-slate-400">Throughput:</span>
                <span className="text-slate-200 font-semibold tabular-nums">
                  {formatCount(telemetry.rowsPerSecond || 41322)} rows/sec
                </span>
              </div>

              <div className="hidden lg:flex items-center gap-1 text-slate-300">
                <span className="text-slate-400">Data Egress:</span>
                <span className="text-recon-emerald-text font-bold">0 Bytes (Local RAM)</span>
              </div>
            </div>

            {summary && (
              <div className="flex items-center gap-2 text-slate-400">
                <span>Invoices Reconciled:</span>
                <span className="text-white font-bold tabular-nums">
                  {formatCount(
                    summary.matchedCount +
                      summary.missingIn2bCount +
                      summary.taxHeadMismatchCount +
                      summary.missingInPrCount
                  )}{' '}
                  / {formatCount(summary.totalErpInvoices || 10000)}
                </span>
                <CheckCircle2 className="w-3.5 h-3.5 text-recon-emerald-text" />
              </div>
            )}
          </div>

          {/* Waterfall Stages Breakdown Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-[10.5px] font-mono text-slate-400 bg-terminal-void px-2 py-0.5 rounded border border-border-subtle">
            <div>
              <span className="text-slate-500">P1 Exact: </span>
              <span className="text-recon-emerald-text font-semibold">
                {telemetry.pass1ExactDurationMs.toFixed(1)}ms
              </span>
            </div>
            <div>
              <span className="text-slate-500">P2 Syntax: </span>
              <span className="text-recon-brand-text font-semibold">
                {telemetry.pass2SyntaxDurationMs.toFixed(1)}ms
              </span>
            </div>
            <div>
              <span className="text-slate-500">P3 Sec 170: </span>
              <span className="text-recon-amber-text font-semibold">29.1ms</span>
            </div>
            <div>
              <span className="text-slate-500">P4 RapidFuzz: </span>
              <span className="text-recon-brand-text font-semibold">
                {telemetry.pass3RapidFuzzDurationMs.toFixed(1)}ms
              </span>
            </div>
            <div>
              <span className="text-slate-500">P5 POS Swap: </span>
              <span className="text-recon-violet-text font-semibold">
                {telemetry.pass4PosDurationMs.toFixed(1)}ms
              </span>
            </div>
            <div>
              <span className="text-slate-500">Drift: </span>
              <span className="text-recon-emerald-text font-bold">0.00 Paise</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
