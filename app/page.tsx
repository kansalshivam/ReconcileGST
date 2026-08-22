'use client';

import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { HeaderToolbar } from '@/components/HeaderToolbar';
import { KpiSummaryCards } from '@/components/KpiSummaryCards';
import { DropzoneZone } from '@/components/DropzoneZone';
import { VirtualReconTable } from '@/components/VirtualReconTable';
import { SideBySideInspector } from '@/components/SideBySideInspector';
import { WhatsAppModal } from '@/components/WhatsAppModal';
import { Drc01cLegalModal } from '@/components/Drc01cLegalModal';
import { ExportToolbar } from '@/components/ExportToolbar';
import { GuidedTourModal } from '@/components/GuidedTourModal';
import { ReconciliationResultSet, ReconResult, ImsActionState } from '@/types/recon';
import { generateSampleReconDataset } from '@/lib/sample-data';
import { exportCaAuditExcel } from '@/lib/excel-export';

export default function MasterDashboardPage() {
  const [resultSet, setResultSet] = useState<ReconciliationResultSet | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ReconResult | null>(null);
  const [isDiffDrawerOpen, setIsDiffDrawerOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsAppTargetRecord, setWhatsAppTargetRecord] = useState<ReconResult | null>(null);
  const [isDrc01cModalOpen, setIsDrc01cModalOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);

  // Trigger 1-Click 10k Benchmark Demo
  const handleLoadSampleDemo = useCallback(() => {
    setIsLoading(true);
    // Simulate ultra-fast Web Worker compute (~240ms)
    setTimeout(() => {
      const data = generateSampleReconDataset(10000);
      setResultSet(data);
      setIsLoading(false);
      
      // Warm Amber / Gold & Emerald celebratory confetti
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.15 },
        colors: ['#D97706', '#F59E0B', '#10B981', '#34D399', '#FFFFFF'],
      });
    }, 240);
  }, []);

  // Reset Session
  const handleResetSession = useCallback(() => {
    setResultSet(null);
    setSelectedRecord(null);
    setIsDiffDrawerOpen(false);
    setIsWhatsAppModalOpen(false);
    setWhatsAppTargetRecord(null);
    setIsDrc01cModalOpen(false);
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+D or Cmd+D for 1-Click Demo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        handleLoadSampleDemo();
      }

      // Ctrl+E or Cmd+E for 6-Tab CA Excel Export
      if ((e.ctrlKey || e.metaKey) && (e.key === 'e' || e.key === 'E')) {
        e.preventDefault();
        if (resultSet) {
          exportCaAuditExcel(resultSet);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [resultSet, handleLoadSampleDemo]);

  // Record Inspection Selection
  const handleSelectRecord = (record: ReconResult) => {
    setSelectedRecord(record);
    setIsDiffDrawerOpen(true);
  };

  // WhatsApp Intimation Trigger
  const handleOpenWhatsAppModal = (record: ReconResult) => {
    setWhatsAppTargetRecord(record);
    setIsWhatsAppModalOpen(true);
  };

  // In-Place IMS Action Update
  const handleUpdateImsAction = (matchId: string, action: ImsActionState) => {
    if (!resultSet) return;

    setResultSet((prev) => {
      if (!prev) return prev;
      const updatedRecords = prev.records.map((r) => {
        if (r.matchId === matchId) {
          return { ...r, imsAction: action, imsActionState: action };
        }
        return r;
      });
      return { ...prev, records: updatedRecords };
    });

    if (selectedRecord && selectedRecord.matchId === matchId) {
      setSelectedRecord((prev) => (prev ? { ...prev, imsAction: action, imsActionState: action } : null));
    }
  };


  return (
    <main className="min-h-screen w-full flex flex-col bg-terminal-void text-slate-100">
      {/* -------------------------------------------------------------
          1. STICKY EXECUTIVE HEADER & TELEMETRY HUD
          ------------------------------------------------------------- */}
      <HeaderToolbar
        clientName={resultSet?.clientTradeName || 'Bharat Manufacturing & Engineering Ltd'}
        clientGstin={resultSet?.clientGstin || '07AAAAA0000A1Z5'}
        filingPeriod={resultSet?.filingPeriod || 'August 2026 (082026)'}
        isLoaded={!!resultSet}
        isLoading={isLoading}
        telemetry={resultSet?.summary.telemetry}
        summary={resultSet?.summary}
        onLoadSampleDemo={handleLoadSampleDemo}
        onResetSession={handleResetSession}
        onOpenGuidedTour={() => setIsTourOpen(true)}
      />

      {/* -------------------------------------------------------------
          2. MAIN VIEWPORT: INGESTION EMPTY STATE OR RECONCILED GRID
          ------------------------------------------------------------- */}
      {!resultSet ? (
        <div className="flex-1 flex flex-col justify-center px-4 py-8">
          <DropzoneZone
            onFilesSelected={() => handleLoadSampleDemo()}
            onLoadSampleDemo={handleLoadSampleDemo}
            isLoading={isLoading}
          />
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0">
          {/* 3. STATUTORY SENTINEL RISK CARDS */}
          <KpiSummaryCards
            matchedCount={resultSet.summary.matchedCount}
            mismatchedCount={resultSet.summary.mismatchedCount}
            missingIn2bCount={resultSet.summary.missingIn2bCount}
            missingInPrCount={resultSet.summary.missingInPrCount}
            taxHeadMismatchCount={resultSet.summary.taxHeadMismatchCount}
            blocked17_5Count={resultSet.summary.blocked17_5Count ?? 0}
            totalClaimableItcPaise={resultSet.summary.totalClaimableItcPaise}
            totalBlockedItcPaise={resultSet.summary.totalBlockedItcPaise}
            totalUnclaimedItcPaise={resultSet.summary.totalUnclaimedItcPaise}
            totalSection50InterestPaise={resultSet.summary.totalSection50InterestPaise}
            rule88DRisk={resultSet.summary.rule88DRisk}
            totalInvoices={resultSet.summary.totalErpInvoices}
          />


          {/* 4. VIRTUALIZED RECON TABLE */}
          <div className="flex-1 px-4 sm:px-6 pb-2 min-h-[500px]">
            <VirtualReconTable
              resultSet={resultSet}
              selectedRecord={selectedRecord}
              onSelectRecord={handleSelectRecord}
              onOpenDiffDrawer={() => setIsDiffDrawerOpen(true)}
              onOpenWhatsAppModal={handleOpenWhatsAppModal}
              onUpdateImsStatus={handleUpdateImsAction}
            />
          </div>

          {/* 5. AUDIT & EXPORT TOOLBAR */}
          <div className="px-4 sm:px-6 pb-4">
            <ExportToolbar
              resultSet={resultSet}
              onOpenDrc01cModal={() => setIsDrc01cModalOpen(true)}
            />
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          ACTION MODALS & SLIDE-OVER INSPECTION DRAWERS
          ------------------------------------------------------------- */}
      <SideBySideInspector
        isOpen={isDiffDrawerOpen}
        record={selectedRecord}
        onClose={() => setIsDiffDrawerOpen(false)}
        onOpenWhatsAppModal={handleOpenWhatsAppModal}
        onUpdateImsAction={handleUpdateImsAction}
      />

      <WhatsAppModal
        isOpen={isWhatsAppModalOpen}
        record={whatsAppTargetRecord}
        onClose={() => {
          setIsWhatsAppModalOpen(false);
          setWhatsAppTargetRecord(null);
        }}
      />

      <Drc01cLegalModal
        isOpen={isDrc01cModalOpen}
        resultSet={resultSet}
        onClose={() => setIsDrc01cModalOpen(false)}
      />

      <GuidedTourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onRunDemo={handleLoadSampleDemo}
      />
    </main>
  );
}
