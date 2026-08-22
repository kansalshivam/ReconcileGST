'use client';

import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Lock,
  Clock,
} from 'lucide-react';
import { Paise, Rule88DDiscrepancyEvaluation } from '@/types/recon';
import { formatPaiseToINR } from '@/lib/formatters';

interface KpiSummaryCardsProps {
  matchedCount: number;
  mismatchedCount: number;
  missingIn2bCount: number;
  missingInPrCount: number;
  taxHeadMismatchCount: number;
  blocked17_5Count?: number;
  totalClaimableItcPaise: Paise;
  totalBlockedItcPaise: Paise;
  totalUnclaimedItcPaise: Paise;
  totalSection50InterestPaise: Paise;
  rule88DRisk: Rule88DDiscrepancyEvaluation;
  totalInvoices?: number;
  onSelectTriageTab?: (tab: string) => void;
}

export const KpiSummaryCards: React.FC<KpiSummaryCardsProps> = ({
  matchedCount,
  missingIn2bCount,
  taxHeadMismatchCount,
  blocked17_5Count = 0,
  totalClaimableItcPaise,
  totalBlockedItcPaise,
  totalSection50InterestPaise,
  rule88DRisk,
  totalInvoices = 10000,
  onSelectTriageTab,
}) => {
  const formatINR = (paise: Paise) => formatPaiseToINR(paise);
  const formatCount = (n: number) => n.toLocaleString('en-IN');
  const matchPct = totalInvoices > 0 ? ((matchedCount / totalInvoices) * 100).toFixed(1) : '0.0';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 px-4 py-3 sm:px-6">
      {/* -------------------------------------------------------------
          CARD 1: MATCHED ITC (SAFE TO CLAIM IN GSTR-3B)
          ------------------------------------------------------------- */}
      <div 
        onClick={() => onSelectTriageTab?.('MATCHED')}
        className="group relative bg-terminal-surface1 hover:bg-terminal-surface2 border border-border-default hover:border-recon-emerald-border rounded-xl p-4 flex flex-col justify-between shadow-terminal-card transition-all duration-150 cursor-pointer"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold font-sans uppercase tracking-wider text-recon-emerald-text">
            <ShieldCheck className="w-4 h-4 text-recon-emerald-text" />
            <span>Matched ITC (Safe)</span>
          </div>
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-recon-emerald-surface border border-recon-emerald-border text-recon-emerald-text rounded">
            GSTR-3B Ready
          </span>
        </div>

        <div className="my-2.5">
          <div className="font-mono text-2xl sm:text-3xl font-extrabold tabular-nums tracking-tight text-white group-hover:text-recon-emerald-text transition-colors">
            {formatINR(totalClaimableItcPaise)}
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-300">
            <span className="font-semibold text-recon-emerald-text">{formatCount(matchedCount)} Invoices</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">{matchPct}% match rate</span>
          </div>
        </div>

        <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-[11px] text-slate-400">
          <span>Table 4(A)(5) Eligible Inward</span>
          <span className="text-recon-emerald-text font-medium">0% Reversal Risk</span>
        </div>
      </div>

      {/* -------------------------------------------------------------
          CARD 2: RULE 88D DRC-01C RISK SENTINEL
          ------------------------------------------------------------- */}
      <div 
        onClick={() => onSelectTriageTab?.('DRC01C')}
        className={`group relative bg-terminal-surface1 hover:bg-terminal-surface2 border rounded-xl p-4 flex flex-col justify-between shadow-terminal-card transition-all duration-150 cursor-pointer ${
          rule88DRisk.isDrc01cTriggered
            ? 'border-recon-crimson hover:shadow-glow-crimson'
            : 'border-border-default hover:border-recon-brand-border'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold font-sans uppercase tracking-wider text-recon-crimson-text">
            <AlertTriangle className="w-4 h-4 text-recon-crimson-text" />
            <span>Rule 88D DRC-01C Risk</span>
          </div>
          <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded ${
            rule88DRisk.isDrc01cTriggered
              ? 'bg-recon-crimson-surface border border-recon-crimson-border text-recon-crimson-text animate-pulse'
              : 'bg-terminal-surface3 text-slate-300'
          }`}>
            {rule88DRisk.threatLevel}
          </span>
        </div>

        <div className="my-2.5">
          <div className="font-mono text-2xl sm:text-3xl font-extrabold tabular-nums tracking-tight text-white">
            {formatINR(rule88DRisk.excessItcPaise)}
          </div>
          
          {/* Statutory Variance Progress Bar */}
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span>Variance: {rule88DRisk.excessPercentage.toFixed(1)}%</span>
              <span className="text-slate-500">Max Safe: 20.0%</span>
            </div>
            <div className="w-full h-1.5 bg-terminal-surface3 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  rule88DRisk.isDrc01cTriggered ? 'bg-recon-crimson' : 'bg-recon-emerald'
                }`}
                style={{ width: `${Math.min(100, Math.max(5, (rule88DRisk.excessPercentage / 25) * 100))}%` }}
              />
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-[11px] text-slate-400">
          <span>Statutory Exposure</span>
          <span className={rule88DRisk.isDrc01cTriggered ? 'text-recon-crimson-text font-bold' : 'text-recon-emerald-text'}>
            {rule88DRisk.isDrc01cTriggered ? 'Demand Triggered' : 'Below 20% Limit'}
          </span>
        </div>
      </div>

      {/* -------------------------------------------------------------
          CARD 3: TRAPPED RISK & SECTION 16(2)(aa) BLOCKED
          ------------------------------------------------------------- */}
      <div 
        onClick={() => onSelectTriageTab?.('MISSING_IN_GSTR2B')}
        className="group relative bg-terminal-surface1 hover:bg-terminal-surface2 border border-border-default hover:border-recon-crimson-border rounded-xl p-4 flex flex-col justify-between shadow-terminal-card transition-all duration-150 cursor-pointer"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold font-sans uppercase tracking-wider text-recon-crimson-text">
            <Lock className="w-4 h-4 text-recon-crimson-text" />
            <span>Trapped ITC Risk</span>
          </div>
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-recon-crimson-surface border border-recon-crimson-border text-recon-crimson-text rounded">
            Sec 16(2)(aa)
          </span>
        </div>

        <div className="my-2.5">
          <div className="font-mono text-2xl sm:text-3xl font-extrabold tabular-nums tracking-tight text-white group-hover:text-recon-crimson-text transition-colors">
            {formatINR(totalBlockedItcPaise)}
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-300">
            <span className="font-semibold text-recon-crimson-text">{formatCount(missingIn2bCount)} Missing in 2B</span>
            <span className="text-slate-500">•</span>
            <span className="text-recon-violet-text font-medium">{formatCount(blocked17_5Count)} Blocked 17(5)</span>
          </div>
        </div>

        <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-[11px] text-slate-400">
          <span>Vendor Payment Action</span>
          <span className="text-recon-crimson-text font-medium">Hold Payout</span>
        </div>
      </div>

      {/* -------------------------------------------------------------
          CARD 4: SECTION 50(3) 18% PENAL INTEREST ACCRUAL
          ------------------------------------------------------------- */}
      <div 
        onClick={() => onSelectTriageTab?.('SEC50_INTEREST')}
        className="group relative bg-terminal-surface1 hover:bg-terminal-surface2 border border-border-default hover:border-recon-amber-border rounded-xl p-4 flex flex-col justify-between shadow-terminal-card transition-all duration-150 cursor-pointer"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold font-sans uppercase tracking-wider text-recon-amber-text">
            <Clock className="w-4 h-4 text-recon-amber-text" />
            <span>Sec 50(3) Interest</span>
          </div>
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-recon-amber-surface border border-recon-amber-border text-recon-amber-text rounded">
            18% p.a.
          </span>
        </div>

        <div className="my-2.5">
          <div className="font-mono text-2xl sm:text-3xl font-extrabold tabular-nums tracking-tight text-white group-hover:text-recon-amber-text transition-colors">
            {formatINR(totalSection50InterestPaise)}
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-300">
            <span className="font-semibold text-recon-amber-text">Rule 37A Watch</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">{formatCount(taxHeadMismatchCount)} POS Swaps</span>
          </div>
        </div>

        <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-[11px] text-slate-400">
          <span>Daily Accrual Rate</span>
          <span className="text-recon-amber-text font-mono font-medium">18% Statutory Rate</span>
        </div>
      </div>
    </div>
  );
};
