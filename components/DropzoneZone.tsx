'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, FileJson, Zap, ShieldCheck, Check, ArrowRight, FileCheck } from 'lucide-react';

interface DropzoneZoneProps {
  onFilesSelected: (gstr2bFile: File | null, erpFile: File | null) => void;
  onLoadSampleDemo: () => void;
  isLoading: boolean;
}

export const DropzoneZone: React.FC<DropzoneZoneProps> = ({
  onFilesSelected,
  onLoadSampleDemo,
  isLoading,
}) => {
  const [gstr2bFile, setGstr2bFile] = useState<File | null>(null);
  const [erpFile, setErpFile] = useState<File | null>(null);
  const [isG2bHovered, setIsG2bHovered] = useState(false);
  const [isErpHovered, setIsErpHovered] = useState(false);

  const gstr2bInputRef = useRef<HTMLInputElement>(null);
  const erpInputRef = useRef<HTMLInputElement>(null);

  const handleG2bDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsG2bHovered(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.json')) {
        setGstr2bFile(file);
      }
    }
  };

  const handleErpDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsErpHovered(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setErpFile(file);
    }
  };

  const handleExecuteRecon = () => {
    if (gstr2bFile || erpFile) {
      onFilesSelected(gstr2bFile, erpFile);
    } else {
      onLoadSampleDemo();
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center justify-center max-w-6xl mx-auto w-full">
      {/* -------------------------------------------------------------
          HERO BANNER & ZERO-CLOUD VALUE PROPOSITION
          ------------------------------------------------------------- */}
      <div className="text-center mb-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-semibold">
          <Zap className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
          <span>SIMD WASM Engine • Zero Cloud Network Egress</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Executive GST ITC Audit & Reconciliation Terminal
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Ingest 50,000+ invoices in &lt;300ms. Reconcile Tally, Zoho, SAP vs GSTR-2B with automated Rule 88D, Rule 37A, Section 170 tolerances, and 1-Click WhatsApp recovery.
        </p>
      </div>

      {/* -------------------------------------------------------------
          1-CLICK BENCHMARK DEMO HERO TRIGGER
          ------------------------------------------------------------- */}
      <div className="w-full mb-8 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border-2 border-cyan-500/30 hover:border-cyan-400/60 rounded-xl p-5 sm:p-6 shadow-2xl relative overflow-hidden group transition-all">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -z-10 group-hover:bg-cyan-500/20 transition-all" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1.5 text-left">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                1-Click Interactive Benchmark
              </span>
              <span className="text-xs text-slate-400">10,000 Dirty Records</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white">
              Instant Hackathon Verification & Performance Showcase
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Load realistic Indian B2B data with Tally prefix drifts, 2-day date discrepancies, Sec 170 ₹1 tolerances, and Rule 88D exposure in ~242ms.
            </p>
          </div>

          <button
            type="button"
            onClick={onLoadSampleDemo}
            disabled={isLoading}
            className="w-full md:w-auto px-6 py-3.5 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-sans font-extrabold text-sm shadow-glow-cyan transition-all transform active:scale-95 flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
          >
            <Zap className="w-4 h-4 fill-slate-950" />
            <span>{isLoading ? 'Executing SIMD Pipeline...' : '⚡ Load 10,000 Records & Run Recon'}</span>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 w-full my-3">
        <div className="h-px bg-slate-800 flex-1" />
        <span className="text-xs font-mono uppercase tracking-widest text-slate-500 font-bold">— OR INGEST OFFICIAL DATASETS —</span>
        <div className="h-px bg-slate-800 flex-1" />
      </div>

      {/* -------------------------------------------------------------
          DUAL DROPZONE ARCHITECTURE
          ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-6">
        {/* Dropzone 1: GSTR-2B JSON Payload */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsG2bHovered(true);
          }}
          onDragLeave={() => setIsG2bHovered(false)}
          onDrop={handleG2bDrop}
          onClick={() => gstr2bInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-150 ${
            isG2bHovered
              ? 'border-cyan-400 bg-cyan-950/20'
              : gstr2bFile
              ? 'border-emerald-500/60 bg-emerald-950/10'
              : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60'
          }`}
        >
          <input
            ref={gstr2bInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setGstr2bFile(e.target.files[0]);
              }
            }}
          />

          <div className="w-12 h-12 rounded-lg bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center mb-3 text-cyan-400">
            {gstr2bFile ? <FileCheck className="w-6 h-6 text-emerald-400" /> : <FileJson className="w-6 h-6" />}
          </div>

          <h3 className="font-bold text-sm text-white mb-1">
            {gstr2bFile ? gstr2bFile.name : 'GSTN Form GSTR-2B JSON Payload'}
          </h3>
          <p className="text-xs text-slate-400 mb-3">
            {gstr2bFile
              ? `${(gstr2bFile.size / 1024).toFixed(1)} KB • Ready for Ingestion`
              : 'Drag & Drop official government GSTR-2B JSON return file'}
          </p>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono bg-slate-800 text-slate-300 rounded border border-slate-700">
            Schema: GSTN v1.0 (b2b, cdnr, sezwp)
          </span>
        </div>

        {/* Dropzone 2: ERP Purchase Register */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsErpHovered(true);
          }}
          onDragLeave={() => setIsErpHovered(false)}
          onDrop={handleErpDrop}
          onClick={() => erpInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-150 ${
            isErpHovered
              ? 'border-emerald-400 bg-emerald-950/20'
              : erpFile
              ? 'border-emerald-500/60 bg-emerald-950/10'
              : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60'
          }`}
        >
          <input
            ref={erpInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setErpFile(e.target.files[0]);
              }
            }}
          />

          <div className="w-12 h-12 rounded-lg bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center mb-3 text-emerald-400">
            {erpFile ? <FileCheck className="w-6 h-6 text-emerald-400" /> : <FileSpreadsheet className="w-6 h-6" />}
          </div>

          <h3 className="font-bold text-sm text-white mb-1">
            {erpFile ? erpFile.name : 'ERP Inward Purchase Register'}
          </h3>
          <p className="text-xs text-slate-400 mb-3">
            {erpFile
              ? `${(erpFile.size / 1024).toFixed(1)} KB • Ready for Ingestion`
              : 'Support Tally Prime, Zoho Books, Busy, SAP, Marg (.xlsx / .csv)'}
          </p>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono bg-slate-800 text-slate-300 rounded border border-slate-700">
            Auto-Detect: Tally • Zoho • Busy • SAP
          </span>
        </div>
      </div>

      {/* -------------------------------------------------------------
          ERP COLUMN AUTO-MAPPER PREVIEW STRIP
          ------------------------------------------------------------- */}
      <div className="w-full bg-slate-900/80 border border-slate-800 rounded-lg p-3.5 mb-6">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="font-semibold text-slate-300">⚙️ Universal ERP Column Auto-Mapper Preview</span>
          <span className="font-mono text-[11px] text-emerald-400">Fuzzy Alias Engine: Active</span>
        </div>
        <div className="flex flex-wrap gap-2 text-[11px] font-mono">
          <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
            Vendor GSTIN ➔ <span className="text-cyan-400">supplier_gstin (100%)</span>
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
            Invoice Ref ➔ <span className="text-cyan-400">invoice_number (98%)</span>
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
            Voucher Date ➔ <span className="text-cyan-400">invoice_date (100%)</span>
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
            Taxable Value ➔ <span className="text-cyan-400">taxable_value (100%)</span>
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
            IGST / CGST / SGST ➔ <span className="text-cyan-400">tax_heads (100%)</span>
          </span>
        </div>
      </div>

      {/* -------------------------------------------------------------
          EXECUTION CTA IF CUSTOM FILES ARE SELECTED
          ------------------------------------------------------------- */}
      {(gstr2bFile || erpFile) && (
        <button
          type="button"
          onClick={handleExecuteRecon}
          disabled={isLoading}
          className="px-8 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-bold text-sm shadow-glow-emerald transition-all flex items-center gap-2"
        >
          <span>Run Reconciliation on Uploaded Files</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
