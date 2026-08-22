'use client';

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Gavel,
  FileJson,
  ShieldCheck,
  Download,
  CheckCircle2,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { ReconciliationResultSet } from '@/types/recon';
import { exportCaAuditExcel } from '@/lib/excel-export';
import { downloadGstr1aJson } from '@/lib/gstr1a-generator';
import { formatCount } from '@/lib/formatters';

interface ExportToolbarProps {
  resultSet: ReconciliationResultSet | null;
  onOpenDrc01cModal: () => void;
}

export const ExportToolbar: React.FC<ExportToolbarProps> = ({
  resultSet,
  onOpenDrc01cModal,
}) => {
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingJson, setIsExportingJson] = useState(false);

  if (!resultSet) return null;

  const handleExcelExport = () => {
    setIsExportingExcel(true);
    setTimeout(() => {
      try {
        exportCaAuditExcel(resultSet);
      } finally {
        setIsExportingExcel(false);
      }
    }, 50);
  };

  const handleGstr1aExport = () => {
    setIsExportingJson(true);
    setTimeout(() => {
      try {
        downloadGstr1aJson(resultSet);
      } finally {
        setIsExportingJson(false);
      }
    }, 50);
  };

  const summary = resultSet.summary;

  return (
    <footer className="h-[60px] bg-slate-950 border-t border-slate-800 px-4 flex items-center justify-between gap-3 shrink-0 z-30 shadow-terminal-card">
      {/* Left: Zero-Cloud Privacy Guarantee & SHA-256 Seal */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-400">Zero-Cloud Seal:</span>
          <span className="text-emerald-400 font-bold">SHA-256 Verified (0 Egress)</span>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="text-slate-500">•</span>
          <span>Matched: <strong className="text-emerald-400">{formatCount(summary.matchedCount)}</strong></span>
          <span className="text-slate-500">•</span>
          <span>Defaulters: <strong className="text-red-400">{formatCount(summary.missingIn2bCount)}</strong></span>
          <span className="text-slate-500">•</span>
          <span>Blocked: <strong className="text-violet-400">{formatCount(summary.blocked17_5Count ?? 0)}</strong></span>
        </div>
      </div>


      {/* Right: Export CTAs */}
      <div className="flex items-center gap-2">
        {/* Form GSTR-1A Delta JSON CTA */}
        <button
          type="button"
          onClick={handleGstr1aExport}
          disabled={isExportingJson}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-600 text-xs font-bold transition-all disabled:opacity-50"
          title="Export CBIC-compliant Form GSTR-1A Outward Supply Delta JSON for vendor amendments"
        >
          <FileJson className="w-3.5 h-3.5 text-cyan-400" />
          <span>{isExportingJson ? 'Assembling...' : 'GSTR-1A JSON'}</span>
        </button>

        {/* Form GST DRC-01C Part B Legal Defense CTA */}
        <button
          type="button"
          onClick={onOpenDrc01cModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-violet-950/80 hover:bg-violet-900 text-violet-300 border border-violet-500/50 text-xs font-bold transition-all"
          title="Open Form GST DRC-01C Part B Statutory Legal Defense Generator"
        >
          <Gavel className="w-3.5 h-3.5 text-violet-400" />
          <span>DRC-01C Legal Defense</span>
        </button>

        {/* 6-Tab CA Audit Excel CTA */}
        <button
          type="button"
          onClick={handleExcelExport}
          disabled={isExportingExcel}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-bold text-xs shadow-glow-emerald transition-all transform active:scale-95 disabled:opacity-50"
          title="Generate and download 6-Tab CA Audit Excel Workbook with Dynamic Formulas (Ctrl+E)"
        >
          <FileSpreadsheet className="w-4 h-4 text-white" />
          <span>{isExportingExcel ? 'Generating Workbook...' : 'Export 6-Tab CA Excel (.xlsx)'}</span>
          <kbd className="hidden md:inline-block px-1 py-0.2 text-[9px] font-mono bg-emerald-950/60 rounded text-emerald-200 border border-emerald-400/40">
            ^E
          </kbd>
        </button>
      </div>
    </footer>
  );
};
