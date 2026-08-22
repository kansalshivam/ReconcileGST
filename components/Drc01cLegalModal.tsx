'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { X, Gavel, Download, Copy, Check, ShieldCheck, Scale, FileSpreadsheet } from 'lucide-react';
import { ReconciliationResultSet } from '@/types/recon';
import { generateDrc01cLegalReply } from '@/lib/drc01c-generator';
import { formatINR, formatINRRaw } from '@/lib/formatters';

interface Drc01cLegalModalProps {
  isOpen: boolean;
  resultSet: ReconciliationResultSet | null;
  onClose: () => void;
}

export const Drc01cLegalModal: React.FC<Drc01cLegalModalProps> = ({
  isOpen,
  resultSet,
  onClose,
}) => {
  const [selectedGrounds, setSelectedGrounds] = useState({
    ground1SupplierDelay: true,
    ground2ClericalPrefix: true,
    ground3Section170Rounding: true,
    ground4PosAllocation: true,
    ground5Rule37ASafeHarbor: false,
  });

  const [customRemarks, setCustomRemarks] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const summary = resultSet?.summary;

  const claimedItcInr = formatINR(summary?.totalClaimableItcPaise ? summary.totalClaimableItcPaise + (summary.totalBlockedItcPaise || 0n) : 4824192000n);
  const autoPopulatedItcInr = formatINR(summary?.totalClaimableItcPaise || 4824192000n);
  const varianceInr = formatINR(summary?.rule88DRisk?.excessItcPaise || 31450000n);

  const legalBriefText = useMemo(() => {
    return generateDrc01cLegalReply({
      clientGstin: resultSet?.clientGstin || '27AAACT2727Q1ZW',
      clientName: resultSet?.clientTradeName || 'TATA STEEL LIMITED',
      taxPeriod: resultSet?.filingPeriod || 'August 2024 (2024-25)',
      referenceNo: 'DRC-01C/2024-25/88D-09921',
      claimedItcInr,
      autoPopulatedItcInr,
      varianceInr,
      selectedGrounds,
      customRemarks,
    });
  }, [resultSet, claimedItcInr, autoPopulatedItcInr, varianceInr, selectedGrounds, customRemarks]);

  if (!isOpen) return null;

  const handleCopyBrief = async () => {
    try {
      await navigator.clipboard.writeText(legalBriefText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownloadBrief = () => {
    const blob = new Blob([legalBriefText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DRC01C_Part_B_Legal_Defense_${resultSet?.clientGstin || 'GSTIN'}_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity" />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col font-sans text-slate-100 max-h-[90vh]">
        {/* Header */}
        <div className="h-14 px-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-violet-950 border border-violet-500/40 text-violet-400">
              <Gavel className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Form GST DRC-01C Part B Statutory Legal Defense Generator</span>
                <span className="text-[10px] font-mono bg-violet-950 text-violet-300 px-1.5 py-0.2 rounded border border-violet-500/30">
                  Rule 88D Compliance
                </span>
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Rule 88D Variance Table */}
          <div>
            <span className="font-bold text-slate-300 block mb-2 font-sans uppercase tracking-wider text-[11px]">
              Rule 88D Statutory Variance Schedule:
            </span>
            <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950">
              <table className="w-full text-left font-mono">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 text-[11px]">
                    <th className="py-2 px-3">Tax Head / Component</th>
                    <th className="py-2 px-3 text-right">GSTR-3B Claimed</th>
                    <th className="py-2 px-3 text-right">GSTR-2B Auto-Pop</th>
                    <th className="py-2 px-3 text-right text-red-400">Excess Variance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  <tr>
                    <td className="py-1.5 px-3">Integrated Tax (IGST)</td>
                    <td className="py-1.5 px-3 text-right tabular-nums">₹ 2,89,45,152.00</td>
                    <td className="py-1.5 px-3 text-right tabular-nums">₹ 2,89,45,152.00</td>
                    <td className="py-1.5 px-3 text-right tabular-nums text-emerald-400">₹ 0.00</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3">Central Tax (CGST)</td>
                    <td className="py-1.5 px-3 text-right tabular-nums">₹ 96,48,384.00</td>
                    <td className="py-1.5 px-3 text-right tabular-nums">₹ 96,48,384.00</td>
                    <td className="py-1.5 px-3 text-right tabular-nums text-emerald-400">₹ 0.00</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3">State Tax (SGST)</td>
                    <td className="py-1.5 px-3 text-right tabular-nums">₹ 96,48,384.00</td>
                    <td className="py-1.5 px-3 text-right tabular-nums">₹ 96,48,384.00</td>
                    <td className="py-1.5 px-3 text-right tabular-nums text-emerald-400">₹ 0.00</td>
                  </tr>
                  <tr className="bg-slate-900/60 font-bold">
                    <td className="py-2 px-3 text-white">Disputed Invoices (Missing 2B)</td>
                    <td className="py-2 px-3 text-right text-red-400 tabular-nums">{varianceInr}</td>
                    <td className="py-2 px-3 text-right tabular-nums">₹ 0.00</td>
                    <td className="py-2 px-3 text-right text-red-400 tabular-nums">{varianceInr}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Statutory Ground Checkboxes */}
          <div className="space-y-2">
            <span className="font-bold text-slate-300 block font-sans uppercase tracking-wider text-[11px]">
              Select Judicial Precedents & Statutory Grounds:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-slate-950/80 border border-slate-800 p-3 rounded-lg">
              <label className="flex items-start gap-2 text-slate-300 cursor-pointer hover:text-white">
                <input
                  type="checkbox"
                  checked={selectedGrounds.ground1SupplierDelay}
                  onChange={(e) =>
                    setSelectedGrounds((prev) => ({ ...prev, ground1SupplierDelay: e.target.checked }))
                  }
                  className="mt-0.5 rounded border-slate-700 bg-slate-900 text-violet-600 focus:ring-violet-500"
                />
                <span>
                  <strong className="text-violet-300">Ground 1:</strong> Supplier delay; no recovery against buyer without seller probe (<em>D.Y. Beathel - Madras HC</em>)
                </span>
              </label>

              <label className="flex items-start gap-2 text-slate-300 cursor-pointer hover:text-white">
                <input
                  type="checkbox"
                  checked={selectedGrounds.ground2ClericalPrefix}
                  onChange={(e) =>
                    setSelectedGrounds((prev) => ({ ...prev, ground2ClericalPrefix: e.target.checked }))
                  }
                  className="mt-0.5 rounded border-slate-700 bg-slate-900 text-violet-600 focus:ring-violet-500"
                />
                <span>
                  <strong className="text-violet-300">Ground 2:</strong> Clerical invoice prefix / delimiter mismatch (<em>Suncraft Energy - Calcutta HC</em>)
                </span>
              </label>

              <label className="flex items-start gap-2 text-slate-300 cursor-pointer hover:text-white">
                <input
                  type="checkbox"
                  checked={selectedGrounds.ground3Section170Rounding}
                  onChange={(e) =>
                    setSelectedGrounds((prev) => ({ ...prev, ground3Section170Rounding: e.target.checked }))
                  }
                  className="mt-0.5 rounded border-slate-700 bg-slate-900 text-violet-600 focus:ring-violet-500"
                />
                <span>
                  <strong className="text-violet-300">Ground 3:</strong> Section 170 statutory rounding of tax fractions (&le; ±₹1.00)
                </span>
              </label>

              <label className="flex items-start gap-2 text-slate-300 cursor-pointer hover:text-white">
                <input
                  type="checkbox"
                  checked={selectedGrounds.ground4PosAllocation}
                  onChange={(e) =>
                    setSelectedGrounds((prev) => ({ ...prev, ground4PosAllocation: e.target.checked }))
                  }
                  className="mt-0.5 rounded border-slate-700 bg-slate-900 text-violet-600 focus:ring-violet-500"
                />
                <span>
                  <strong className="text-violet-300">Ground 4:</strong> Inadvertent IGST vs CGST/SGST allocation (<em>Saji S. - Kerala HC</em>)
                </span>
              </label>
            </div>
          </div>

          {/* Generated Formal Legal Reply Brief Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-semibold text-slate-300 font-sans">Generated Formal Legal Reply Brief (Part B):</span>
              <span className="font-mono text-[10px] text-violet-400">Addressed to Proper Officer</span>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs text-slate-300 whitespace-pre-wrap max-h-56 overflow-y-auto leading-relaxed selection:bg-violet-500/30">
              {legalBriefText}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleCopyBrief}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{isCopied ? 'Copied Legal Brief!' : 'Copy Form DRC-01C Part B Text'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadBrief}
            className="px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-glow-cyan flex items-center gap-2 transition-all transform active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Signed Legal Defense (.txt)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
