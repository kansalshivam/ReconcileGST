'use client';

import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Copy, Check, ExternalLink, Phone, ShieldCheck } from 'lucide-react';
import { ReconResult, VendorNoticeParams } from '@/types/recon';
import { generateWhatsAppMessage, generateWhatsAppDeepLink } from '@/lib/whatsapp-generator';
import { formatINRRaw, formatDate } from '@/lib/formatters';

interface WhatsAppModalProps {
  isOpen: boolean;
  record: ReconResult | null;
  onClose: () => void;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  record,
  onClose,
}) => {
  const [language, setLanguage] = useState<'EN' | 'HINGLISH'>('HINGLISH');
  const [phoneNumber, setPhoneNumber] = useState('919820055124');
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

  if (!isOpen || !record) return null;

  const erp = record.erpInvoice;
  const supplierName = erp?.supplierName || record.gstr2bRecord?.supplierTradeName || 'Defaulting Supplier';
  const supplierGstin = erp?.gstin || record.gstr2bRecord?.supplierGstin || '';
  const invoiceNumber = erp?.invoiceNumber || record.gstr2bRecord?.invoiceNumber || '';
  const invoiceDate = formatDate(erp?.invoiceDate || record.gstr2bRecord?.invoiceDate);
  const taxAmountInr = formatINRRaw(record.taxDifferencePaise < 0n ? -record.taxDifferencePaise : erp ? (erp.igstPaise + erp.cgstPaise + erp.sgstPaise) : 0n);
  const taxableValueInr = erp ? formatINRRaw(erp.taxableValuePaise) : undefined;

  const noticeParams: VendorNoticeParams = {
    phoneNumber,
    supplierGstin,
    supplierName,
    invoiceNumber,
    invoiceDate,
    taxAmountInr,
    language,
    taxableValueInr,
  };

  const messageText = generateWhatsAppMessage(noticeParams);
  const deepLinkUrl = generateWhatsAppDeepLink(noticeParams);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(messageText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleLaunchWhatsApp = () => {
    window.open(deepLinkUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity" />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col font-sans text-slate-100">
        {/* Header */}
        <div className="h-14 px-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-400">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>1-Click WhatsApp Vendor Recovery Notice</span>
                <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/30">
                  Zero-Cloud Deep Link
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
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Vendor Summary Strip */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div>
              <span className="text-slate-500 text-[11px] block">Defaulting Vendor:</span>
              <span className="font-semibold text-slate-200 truncate block">{supplierName}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Supplier GSTIN:</span>
              <span className="font-mono text-cyan-400 block">{supplierGstin}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Blocked ITC Amount:</span>
              <span className="font-mono text-red-400 font-bold block">₹ {taxAmountInr}</span>
            </div>
          </div>

          {/* Language Template Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              Select Statutory Template Language:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLanguage('HINGLISH')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border flex items-center justify-center gap-2 transition-all ${
                  language === 'HINGLISH'
                    ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500 shadow-glow-emerald'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <span>🇮🇳 Action-Oriented Hinglish</span>
                {language === 'HINGLISH' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
              </button>

              <button
                type="button"
                onClick={() => setLanguage('EN')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border flex items-center justify-center gap-2 transition-all ${
                  language === 'EN'
                    ? 'bg-cyan-950/90 text-cyan-300 border-cyan-500 shadow-glow-cyan'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <span>Formal English Statutory Notice</span>
                {language === 'EN' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
              </button>
            </div>
          </div>

          {/* Phone Number Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Recipient WhatsApp Mobile Number:</span>
              <span className="text-[11px] text-slate-500 font-normal">Auto-formatted with +91 country code</span>
            </label>
            <div className="relative">
              <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="919820055124"
                className="w-full bg-slate-950 text-slate-200 font-mono text-xs rounded-lg pl-9 pr-3 py-2 border border-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Live Rendered Markdown Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Live Rendered Notice Payload:</span>
              <span className="text-[10px] font-mono text-emerald-400">Section 16(2)(aa) & Sec 50(3) Included</span>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 text-xs font-mono text-slate-300 whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed selection:bg-emerald-500/30">
              {messageText}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{isCopied ? 'Copied Payload!' : 'Copy Markdown Text'}</span>
          </button>

          <button
            type="button"
            onClick={handleLaunchWhatsApp}
            className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-glow-emerald flex items-center gap-2 transition-all transform active:scale-95"
          >
            <span>🚀 Launch WhatsApp Web / Desktop (wa.me)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
