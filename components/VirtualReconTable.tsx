'use client';

import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  Search,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  AlertTriangle,
  Lock,
  RotateCcw,
  MessageSquare,
  Sparkles,
  Check,
  X,
  Clock,
  ExternalLink,
} from 'lucide-react';
import {
  ReconResult,
  MatchStatus,
  Paise,
  ImsActionState,
  ReconciliationResultSet,
} from '@/types/recon';
import { formatPaiseToINR, formatISODate } from '@/lib/formatters';

interface VirtualReconTableProps {
  resultSet: ReconciliationResultSet;
  selectedRecord: ReconResult | null;
  onSelectRecord: (record: ReconResult) => void;
  onOpenDiffDrawer: () => void;
  onOpenWhatsAppModal: (record: ReconResult) => void;
  onUpdateImsStatus?: (matchId: string, status: ImsActionState) => void;
}

export const VirtualReconTable: React.FC<VirtualReconTableProps> = ({
  resultSet,
  selectedRecord,
  onSelectRecord,
  onOpenDiffDrawer,
  onOpenWhatsAppModal,
  onUpdateImsStatus,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [imsFilter, setImsFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<'invoiceNumber' | 'supplier' | 'variance' | 'taxable'>('variance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const parentRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut '/' to search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter & Search Logic
  const filteredRecords = useMemo(() => {
    let list = resultSet.records;

    // Status Filter
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'MATCHED') {
        list = list.filter((r) => r.status === 'MATCHED' || r.status === 'PROBABLE_MATCH');
      } else {
        list = list.filter((r) => r.status === statusFilter);
      }
    }

    // IMS Filter
    if (imsFilter !== 'ALL') {
      list = list.filter((r) => {
        const state = (r as any).imsActionState || (r as any).imsAction || 'PENDING';
        if (imsFilter === 'ACCEPTED') return state === 'ACCEPTED' || state === 'ACCEPT';
        if (imsFilter === 'REJECTED') return state === 'REJECTED' || state === 'REJECT';
        if (imsFilter === 'PENDING') return state === 'PENDING';
        return state === imsFilter;
      });
    }

    // Text Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((r) => {
        const inv = (r.erpInvoice?.invoiceNumber || r.gstr2bRecord?.invoiceNumber || '').toLowerCase();
        const gstin = (r.erpInvoice?.gstin || r.gstr2bRecord?.supplierGstin || '').toLowerCase();
        const name = (r.erpInvoice?.supplierName || r.gstr2bRecord?.supplierTradeName || '').toLowerCase();
        return inv.includes(q) || gstin.includes(q) || name.includes(q);
      });
    }

    // Sort
    return [...list].sort((a, b) => {
      let comp = 0;
      if (sortField === 'invoiceNumber') {
        const invA = a.erpInvoice?.invoiceNumber || a.gstr2bRecord?.invoiceNumber || '';
        const invB = b.erpInvoice?.invoiceNumber || b.gstr2bRecord?.invoiceNumber || '';
        comp = invA.localeCompare(invB);
      } else if (sortField === 'supplier') {
        const supA = a.erpInvoice?.supplierName || a.gstr2bRecord?.supplierTradeName || '';
        const supB = b.erpInvoice?.supplierName || b.gstr2bRecord?.supplierTradeName || '';
        comp = supA.localeCompare(supB);
      } else if (sortField === 'taxable') {
        const valA = a.erpInvoice?.taxableValuePaise || a.gstr2bRecord?.taxableValuePaise || 0n;
        const valB = b.erpInvoice?.taxableValuePaise || b.gstr2bRecord?.taxableValuePaise || 0n;
        comp = valA < valB ? -1 : valA > valB ? 1 : 0;
      } else if (sortField === 'variance') {
        const deltaA = (a as any).taxDifferencePaise ?? (a as any).deltaTaxablePaise ?? 0n;
        const deltaB = (b as any).taxDifferencePaise ?? (b as any).deltaTaxablePaise ?? 0n;
        const varA = deltaA < 0n ? -deltaA : deltaA;
        const varB = deltaB < 0n ? -deltaB : deltaB;
        comp = varA < varB ? -1 : varA > varB ? 1 : 0;
      }
      return sortOrder === 'asc' ? comp : -comp;
    });

  }, [resultSet.records, statusFilter, imsFilter, searchQuery, sortField, sortOrder]);

  // Virtualizer Setup with dynamic size
  const rowVirtualizer = useVirtualizer({
    count: filteredRecords.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 15,
  });

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredRecords.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredRecords.map((r) => r.matchId)));
    }
  };

  const toggleSelectRecord = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleInlineImsClick = (matchId: string, status: ImsActionState, e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateImsStatus?.(matchId, status);
  };

  // Status Badge Component
  const renderStatusBadge = (record: ReconResult) => {
    switch (record.status) {
      case 'MATCHED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-recon-emerald-surface text-recon-emerald-text border border-recon-emerald-border">
            <CheckCircle2 className="w-3 h-3" />
            Exact Match
          </span>
        );
      case 'PROBABLE_MATCH':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-recon-brand-surface text-recon-brand-text border border-recon-brand-border">
            <Sparkles className="w-3 h-3" />
            Fuzzy ({Math.round((record.similarityScore || 0.85) * 100)}%)
          </span>
        );
      case 'MISSING_IN_GSTR2B':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-recon-crimson-surface text-recon-crimson-text border border-recon-crimson-border animate-pulse">
            <Lock className="w-3 h-3" />
            Missing in 2B
          </span>
        );
      case 'TAX_HEAD_MISMATCH':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-recon-violet-surface text-recon-violet-text border border-recon-violet-border">
            <AlertTriangle className="w-3 h-3" />
            POS Swap
          </span>
        );
      case 'MISMATCHED_VALUE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-recon-amber-surface text-recon-amber-text border border-recon-amber-border">
            <AlertTriangle className="w-3 h-3" />
            Value Diff
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-terminal-surface3 text-slate-300">
            {record.status}
          </span>
        );
    }
  };


  return (
    <div className="flex flex-col h-full bg-terminal-surface1 border border-border-default rounded-xl shadow-terminal-card overflow-hidden">
      {/* -------------------------------------------------------------
          FILTER & CONTROLS TOOLBAR
          ------------------------------------------------------------- */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-border-subtle bg-terminal-surface2">
        {/* Left: Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-0.5 bg-terminal-void border border-border-default rounded-lg">
            {[
              { label: 'All Invoices', val: 'ALL' },
              { label: 'Matched (Safe)', val: 'MATCHED' },
              { label: 'Missing in 2B', val: 'MISSING_IN_GSTR2B' },
              { label: 'POS Swaps', val: 'TAX_HEAD_MISMATCH' },
            ].map((tab) => (
              <button
                key={tab.val}
                type="button"
                onClick={() => setStatusFilter(tab.val)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  statusFilter === tab.val
                    ? 'bg-terminal-surface2 text-white shadow-sm border border-border-subtle'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* IMS Action Pre-Triage Filter */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-border-subtle">
            <span className="text-xs text-slate-400 font-medium">IMS:</span>
            <select
              value={imsFilter}
              onChange={(e) => setImsFilter(e.target.value)}
              className="bg-terminal-void text-slate-200 text-xs font-mono px-2 py-1 rounded-md border border-border-default focus:outline-none focus:border-recon-brand-border"
            >
              <option value="ALL">All Actions</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="REJECTED">Rejected</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
        </div>

        {/* Right: Search & Bulk Info */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search Inv#, GSTIN, Vendor... (/)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-terminal-void text-slate-200 placeholder-slate-500 text-xs rounded-lg pl-8 pr-7 py-1.5 border border-border-default focus:outline-none focus:border-recon-brand-border w-52 sm:w-64 font-mono transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <span className="text-xs font-mono text-slate-400">
            <strong className="text-white">{filteredRecords.length.toLocaleString()}</strong> results
          </span>
        </div>
      </div>

      {/* -------------------------------------------------------------
          TABLE HEADER (Unified Grid Template)
          ------------------------------------------------------------- */}
      <div className="grid grid-cols-[40px_140px_160px_1fr_130px_130px_100px_140px_70px] items-center px-4 py-2.5 border-b border-border-default bg-terminal-surface2 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 select-none">
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={selectedIds.size === filteredRecords.length && filteredRecords.length > 0}
            onChange={toggleSelectAll}
            className="rounded border-border-default bg-terminal-void text-recon-brand focus:ring-0 cursor-pointer"
          />
        </div>
        <div onClick={() => handleSort('variance')} className="flex items-center gap-1 cursor-pointer hover:text-white">
          <span>Status</span>
          <ArrowUpDown className="w-3 h-3 text-slate-500" />
        </div>
        <div onClick={() => handleSort('invoiceNumber')} className="flex items-center gap-1 cursor-pointer hover:text-white">
          <span>Invoice No / Date</span>
          <ArrowUpDown className="w-3 h-3 text-slate-500" />
        </div>
        <div onClick={() => handleSort('supplier')} className="flex items-center gap-1 cursor-pointer hover:text-white">
          <span>Supplier GSTIN & Name</span>
          <ArrowUpDown className="w-3 h-3 text-slate-500" />
        </div>
        <div onClick={() => handleSort('taxable')} className="text-right flex items-center justify-end gap-1 cursor-pointer hover:text-white">
          <span>ERP Taxable</span>
          <ArrowUpDown className="w-3 h-3 text-slate-500" />
        </div>
        <div className="text-right">
          <span>GSTR-2B Taxable</span>
        </div>
        <div className="text-right">
          <span>Variance</span>
        </div>
        <div className="text-center">
          <span>IMS Action</span>
        </div>
        <div className="text-center">
          <span>Action</span>
        </div>
      </div>

      {/* -------------------------------------------------------------
          VIRTUALIZED TABLE BODY (Zero-Blur Responsive Windowing)
          ------------------------------------------------------------- */}
      <div
        ref={parentRef}
        className="flex-1 overflow-auto bg-terminal-void font-mono text-xs focus:outline-none"
        style={{ minHeight: '400px' }}
      >
        {filteredRecords.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-xs">
            <Search className="w-8 h-8 text-slate-600 mb-2" />
            <p>No invoices found matching &ldquo;{searchQuery}&rdquo;</p>
          </div>
        ) : (
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const record = filteredRecords[virtualRow.index];
              const isSelected = selectedRecord?.matchId === record.matchId;
              const isChecked = selectedIds.has(record.matchId);
              const ims = (record as any).imsActionState || (record as any).imsAction || 'PENDING';
              const delta = (record as any).taxDifferencePaise ?? (record as any).deltaTaxablePaise ?? 0n;

              return (
                <div
                  key={virtualRow.key}
                  data-index={virtualRow.index}
                  ref={rowVirtualizer.measureElement}
                  onClick={() => onSelectRecord(record)}
                  className={`absolute top-0 left-0 w-full grid grid-cols-[40px_140px_160px_1fr_130px_130px_100px_140px_70px] items-center px-4 py-2.5 border-b border-border-subtle cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-terminal-surface3 border-l-2 border-l-recon-brand-text'
                      : record.status === 'MISSING_IN_GSTR2B'
                      ? 'bg-recon-crimson-surface hover:bg-recon-crimson-border/20'
                      : 'hover:bg-terminal-surface2'
                  }`}
                  style={{
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  {/* Checkbox */}
                  <div className="flex items-center justify-center" onClick={(e) => toggleSelectRecord(record.matchId, e)}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="rounded border-border-default bg-terminal-void text-recon-brand focus:ring-0 cursor-pointer"
                    />
                  </div>

                  {/* Status Badge */}
                  <div>{renderStatusBadge(record)}</div>

                  {/* Invoice No & Date */}
                  <div className="truncate pr-2">
                    <div className="font-semibold text-slate-100 truncate">
                      {record.erpInvoice?.invoiceNumber || record.gstr2bRecord?.invoiceNumber}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {formatISODate(record.erpInvoice?.invoiceDate || record.gstr2bRecord?.invoiceDate || '')}
                    </div>
                  </div>

                  {/* Supplier GSTIN & Name */}
                  <div className="truncate pr-2">
                    <div className="font-mono text-recon-brand-text text-[11px] font-semibold truncate">
                      {record.erpInvoice?.gstin || record.gstr2bRecord?.supplierGstin}
                    </div>
                    <div className="text-[11px] text-slate-300 truncate font-sans">
                      {record.erpInvoice?.supplierName || record.gstr2bRecord?.supplierTradeName}
                    </div>
                  </div>

                  {/* ERP Taxable */}
                  <div className="text-right font-mono text-slate-200">
                    {record.erpInvoice ? formatPaiseToINR(record.erpInvoice.taxableValuePaise) : '—'}
                  </div>

                  {/* GSTR-2B Taxable */}
                  <div className="text-right font-mono text-slate-200">
                    {record.gstr2bRecord ? formatPaiseToINR(record.gstr2bRecord.taxableValuePaise) : '—'}
                  </div>

                  {/* Variance */}
                  <div className="text-right font-mono">
                    {delta && delta !== 0n ? (
                      <span className={delta > 0n ? 'text-recon-crimson-text font-bold' : 'text-recon-emerald-text'}>
                        {formatPaiseToINR(delta < 0n ? -delta : delta)}
                      </span>
                    ) : (
                      <span className="text-slate-500">₹0.00</span>
                    )}
                  </div>

                  {/* Inline IMS Pre-Triage Buttons */}
                  <div className="flex items-center justify-center gap-1">
                    <button
                      type="button"
                      title="Accept Invoice in GSTN IMS"
                      onClick={(e) => handleInlineImsClick(record.matchId, 'ACCEPT', e)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                        ims === 'ACCEPTED' || ims === 'ACCEPT'
                          ? 'bg-recon-emerald-base text-black border-recon-emerald-base'
                          : 'bg-terminal-void text-slate-400 border-border-default hover:text-recon-emerald-text hover:border-recon-emerald-border'
                      }`}
                    >
                      ACC
                    </button>
                    <button
                      type="button"
                      title="Reject Invoice in GSTN IMS"
                      onClick={(e) => handleInlineImsClick(record.matchId, 'REJECT', e)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                        ims === 'REJECTED' || ims === 'REJECT'
                          ? 'bg-recon-crimson-base text-white border-recon-crimson-base'
                          : 'bg-terminal-void text-slate-400 border-border-default hover:text-recon-crimson-text hover:border-recon-crimson-border'
                      }`}
                    >
                      REJ
                    </button>
                    <button
                      type="button"
                      title="Keep Pending in GSTN IMS"
                      onClick={(e) => handleInlineImsClick(record.matchId, 'PENDING', e)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                        ims === 'PENDING'
                          ? 'bg-recon-amber-base text-black border-recon-amber-base'
                          : 'bg-terminal-void text-slate-400 border-border-default hover:text-recon-amber-text hover:border-recon-amber-border'
                      }`}
                    >
                      PND
                    </button>
                  </div>


                  {/* Actions Column */}
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenWhatsAppModal(record);
                      }}
                      className="p-1 rounded bg-recon-emerald-surface hover:bg-recon-emerald-border/40 text-recon-emerald-text transition-colors"
                      title="Send WhatsApp Payment-Hold Notice"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectRecord(record);
                        onOpenDiffDrawer();
                      }}
                      className="p-1 rounded bg-terminal-surface3 hover:bg-terminal-surface2 text-slate-300 hover:text-white transition-colors"
                      title="View Split-Screen Discrepancy Diff"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
