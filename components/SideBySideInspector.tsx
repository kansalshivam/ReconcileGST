'use client';

import React, { useEffect } from 'react';
import {
  X,
  GitCompare,
  CheckCircle2,
  AlertTriangle,
  Scale,
  MessageSquare,
  FileJson,
  ShieldCheck,
  Check,
  Clock,
  ArrowRight,
  Gavel,
} from 'lucide-react';
import { ReconResult, ImsActionState } from '@/types/recon';
import { formatINR, formatDate } from '@/lib/formatters';

interface SideBySideInspectorProps {
  isOpen: boolean;
  record: ReconResult | null;
  onClose: () => void;
  onOpenWhatsAppModal: (record: ReconResult) => void;
  onOpenGstr1aModal?: (record: ReconResult) => void;
  onUpdateImsAction: (matchId: string, action: ImsActionState) => void;
}

export const SideBySideInspector: React.FC<SideBySideInspectorProps> = ({
  isOpen,
  record,
  onClose,
  onOpenWhatsAppModal,
  onOpenGstr1aModal,
  onUpdateImsAction,
}) => {
  // ESC to close, 'W' to open WhatsApp modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || !record) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'w' || e.key === 'W') {
        if (record.status === 'MISSING_IN_GSTR2B') {
          onOpenWhatsAppModal(record);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, record, onClose, onOpenWhatsAppModal]);

  if (!isOpen || !record) return null;

  const erp = record.erpInvoice;
  const g2b = record.gstr2bRecord;

  const erpTotalTax = erp ? erp.igstPaise + erp.cgstPaise + erp.sgstPaise : 0n;
  const g2bTotalTax = g2b ? g2b.igstPaise + g2b.cgstPaise + g2b.sgstPaise : 0n;

  // Determine statutory risk directive
  let directiveTitle = 'Statutory Compliance Verified';
  let directiveBody = 'Invoice matches within legal tolerance. Safe to claim Input Tax Credit in GSTR-3B Table 4(A)(5).';
  let isSevere = false;

  if (record.status === 'MISSING_IN_GSTR2B') {
    directiveTitle = '🚨 Section 16(2)(aa) Statutory Violation & Rule 88D Risk';
    directiveBody =
      `The supplier has NOT declared this invoice on the GST portal. Claiming ITC in GSTR-3B will immediately trigger an automated Form GST DRC-01C demand notice with Section 50(3) 18% penal interest. Action: Keep PENDING in IMS, place invoice payment on hold, and dispatch 1-Click WhatsApp notice.`;
    isSevere = true;
  } else if (record.status === 'TAX_HEAD_MISMATCH') {
    directiveTitle = '⚠️ Inadvertent Tax Head Shift (IGST vs CGST+SGST)';
    directiveBody =
      `ERP booked tax as IGST while supplier uploaded CGST+SGST. As held by Kerala HC in *Saji S. (2020)*, tax has been paid to the Government, but portal amendment via GSTR-1A is advised to avoid Table 9A audit scrutiny.`;
  } else if (record.subCategory === 'SECTION_170_ROUNDING_PASS_2') {
    directiveTitle = '⚖️ Section 170 Statutory Rounding Tolerance (< ₹1.00)';
    directiveBody =
      `The ₹${(Number(record.taxDifferencePaise) / 100).toFixed(2)} variance is protected under Section 170 of the CGST Act, 2017. Permissible in full without reversal.`;
  } else if (record.imsActionState === 'REJECT') {
    directiveTitle = '🚫 Section 17(5) Blocked Credit Directive';
    directiveBody =
      `Ineligible inward credit under Section 17(5). Must be declared under Table 4(B)(1) as Permanent Reversal in GSTR-3B.`;
    isSevere = true;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop scrim */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
      />

      {/* 800px Slide-Over Drawer */}
      <div className="relative w-full max-w-[800px] h-full bg-slate-900 border-l border-slate-700 shadow-drawer flex flex-col z-50 overflow-y-auto text-slate-100 font-sans">
        {/* Drawer Header (60px) */}
        <div className="h-[60px] px-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-400">
              <GitCompare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Side-by-Side Audit Inspector</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                  {erp?.invoiceNumber || g2b?.invoiceNumber}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                {erp?.gstin || g2b?.supplierGstin} • {erp?.supplierName || g2b?.supplierTradeName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close drawer (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="p-6 space-y-6 flex-1">
          {/* Side-by-Side Comparison Matrix Table */}
          <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950/70">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="bg-slate-900 text-[11px] font-sans font-bold text-slate-400 border-b border-slate-800 uppercase tracking-wider">
                  <th className="py-2.5 px-3 w-1/3">Statutory Field</th>
                  <th className="py-2.5 px-3 w-1/3 text-cyan-400">ERP Ledger (Tally)</th>
                  <th className="py-2.5 px-3 w-1/3 text-emerald-400">GSTR-2B Record</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {/* Supplier Legal Name */}
                <tr className="hover:bg-slate-900/40">
                  <td className="py-2 px-3 text-slate-400 font-sans font-medium">Supplier Name</td>
                  <td className="py-2 px-3 font-sans truncate">{erp?.supplierName || '—'}</td>
                  <td className="py-2 px-3 font-sans truncate">{g2b?.supplierTradeName || '—'}</td>
                </tr>

                {/* Supplier GSTIN */}
                <tr className="hover:bg-slate-900/40">
                  <td className="py-2 px-3 text-slate-400 font-sans font-medium">Supplier GSTIN</td>
                  <td className="py-2 px-3 text-cyan-300 font-bold">{erp?.gstin || '—'}</td>
                  <td className="py-2 px-3 text-emerald-300 font-bold">{g2b?.supplierGstin || '—'}</td>
                </tr>

                {/* Invoice Number */}
                <tr className="hover:bg-slate-900/40">
                  <td className="py-2 px-3 text-slate-400 font-sans font-medium">Invoice Number</td>
                  <td className="py-2 px-3 font-bold">
                    {erp ? (
                      record.subCategory === 'CANONICAL_SYNTAX_PASS_2' ? (
                        <span>
                          <span className="line-through text-red-400 bg-red-950/40 px-1 rounded">
                            {erp.invoiceNumber.replace(erp.normalizedInvoiceNumber, '')}
                          </span>
                          <span className="text-emerald-400 font-extrabold">{erp.normalizedInvoiceNumber}</span>
                        </span>
                      ) : (
                        erp.invoiceNumber
                      )
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="py-2 px-3 font-bold text-emerald-400">{g2b?.invoiceNumber || '—'}</td>
                </tr>

                {/* Invoice Date */}
                <tr className="hover:bg-slate-900/40">
                  <td className="py-2 px-3 text-slate-400 font-sans font-medium">Invoice Date</td>
                  <td className="py-2 px-3">{formatDate(erp?.invoiceDate)}</td>
                  <td className="py-2 px-3">{formatDate(g2b?.invoiceDate)}</td>
                </tr>

                {/* Place of Supply */}
                <tr className="hover:bg-slate-900/40">
                  <td className="py-2 px-3 text-slate-400 font-sans font-medium">Place of Supply (POS)</td>
                  <td className="py-2 px-3">{erp?.pos ? `State Code ${erp.pos}` : '—'}</td>
                  <td className="py-2 px-3">{g2b?.placeOfSupply ? `State Code ${g2b.placeOfSupply}` : '—'}</td>
                </tr>

                {/* Taxable Value */}
                <tr className="hover:bg-slate-900/40">
                  <td className="py-2 px-3 text-slate-400 font-sans font-medium">Taxable Value</td>
                  <td className="py-2 px-3 tabular-nums font-bold text-slate-100">{erp ? formatINR(erp.taxableValuePaise) : '—'}</td>
                  <td className="py-2 px-3 tabular-nums font-bold text-slate-100">{g2b ? formatINR(g2b.taxableValuePaise) : '—'}</td>
                </tr>

                {/* IGST */}
                <tr className="hover:bg-slate-900/40">
                  <td className="py-2 px-3 text-slate-400 font-sans font-medium">Integrated Tax (IGST)</td>
                  <td className={`py-2 px-3 tabular-nums ${record.status === 'TAX_HEAD_MISMATCH' ? 'text-amber-400 font-bold' : ''}`}>
                    {erp ? formatINR(erp.igstPaise) : '—'}
                  </td>
                  <td className="py-2 px-3 tabular-nums">{g2b ? formatINR(g2b.igstPaise) : '—'}</td>
                </tr>

                {/* CGST + SGST */}
                <tr className="hover:bg-slate-900/40">
                  <td className="py-2 px-3 text-slate-400 font-sans font-medium">Central + State (CGST+SGST)</td>
                  <td className="py-2 px-3 tabular-nums">
                    {erp ? formatINR(erp.cgstPaise + erp.sgstPaise) : '—'}
                  </td>
                  <td className={`py-2 px-3 tabular-nums ${record.status === 'TAX_HEAD_MISMATCH' ? 'text-violet-400 font-bold' : ''}`}>
                    {g2b ? formatINR(g2b.cgstPaise + g2b.sgstPaise) : '—'}
                  </td>
                </tr>

                {/* Total Net ITC */}
                <tr className="bg-slate-900/80 font-bold">
                  <td className="py-2.5 px-3 text-white font-sans">Total Inward ITC</td>
                  <td className="py-2.5 px-3 text-cyan-300 tabular-nums">{erp ? formatINR(erpTotalTax) : '—'}</td>
                  <td className="py-2.5 px-3 text-emerald-300 tabular-nums">{g2b ? formatINR(g2bTotalTax) : '—'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Statutory Assessment & Precedent Box */}
          <div
            className={`border rounded-lg p-4 text-xs space-y-2 ${
              isSevere
                ? 'bg-red-950/30 border-red-800/60 text-red-200'
                : 'bg-cyan-950/20 border-cyan-800/50 text-cyan-200'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sm">
              <Gavel className="w-4 h-4" />
              <span>{directiveTitle}</span>
            </div>
            <p className="leading-relaxed text-slate-300 font-sans text-xs">
              {directiveBody}
            </p>
            {record.discrepancyExplanation && (
              <div className="font-mono text-[11px] bg-slate-950/60 p-2 rounded border border-slate-800 text-slate-300">
                <strong>Audit Note:</strong> {record.discrepancyExplanation}
              </div>
            )}
          </div>

          {/* GSTN IMS Pre-Triage Action Hub */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-sans uppercase tracking-wider text-slate-400">
                GSTN IMS Action Decision:
              </span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                record.imsActionState === 'ACCEPT'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                  : record.imsActionState === 'REJECT'
                  ? 'bg-red-950 text-red-300 border border-red-500/40'
                  : 'bg-amber-950 text-amber-300 border border-amber-500/40'
              }`}>
                Current: {record.imsActionState}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onUpdateImsAction(record.matchId, 'ACCEPT')}
                className={`py-2 px-3 rounded text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  record.imsActionState === 'ACCEPT'
                    ? 'bg-emerald-600 text-white shadow-glow-emerald'
                    : 'bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-900/60'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Accept (IMS)</span>
              </button>

              <button
                type="button"
                onClick={() => onUpdateImsAction(record.matchId, 'PENDING')}
                className={`py-2 px-3 rounded text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  record.imsActionState === 'PENDING'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-900/60'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Keep Pending</span>
              </button>

              <button
                type="button"
                onClick={() => onUpdateImsAction(record.matchId, 'REJECT')}
                className={`py-2 px-3 rounded text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  record.imsActionState === 'REJECT'
                    ? 'bg-red-600 text-white shadow-glow-crimson'
                    : 'bg-slate-900 hover:bg-slate-800 text-red-400 border border-red-900/60'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>
            </div>
          </div>

          {/* Vendor Dispute & Intimation Actions */}
          <div className="space-y-2">
            <span className="text-xs font-bold font-sans uppercase tracking-wider text-slate-400">
              Vendor Dispute Resolution:
            </span>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => onOpenWhatsAppModal(record)}
                className="flex-1 py-2.5 px-4 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-glow-emerald"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>1-Click WhatsApp Vendor Recovery</span>
                <kbd className="text-[10px] font-mono px-1 py-0.2 rounded bg-slate-900 text-emerald-300">W</kbd>
              </button>

              <button
                type="button"
                onClick={() => onOpenGstr1aModal?.(record)}
                className="py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <FileJson className="w-4 h-4 text-cyan-400" />
                <span>GSTR-1A Payload</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
