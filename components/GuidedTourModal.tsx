'use client';

import React, { useState } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ShieldAlert,
  Zap,
  CheckCircle2,
  FileSpreadsheet,
  MessageSquare,
  Scale,
  Award,
} from 'lucide-react';

interface GuidedTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunDemo: () => void;
}

const TOUR_STEPS = [
  {
    step: 1,
    badge: 'The Statutory Challenge',
    title: 'The Monthly "6-Day Squeeze" & DRC-01C Risk',
    icon: ShieldAlert,
    iconColor: 'text-recon-crimson',
    description:
      'Between the 14th (when government GSTR-2B is generated) and the 20th (GSTR-3B filing deadline), Indian businesses face a high-stress 6-day window to reconcile thousands of purchase invoices. Unreconciled ITC triggers Section 50(3) 18% compound penal interest and automated Rule 88D DRC-01C recovery notices.',
    highlights: [
      '₹1.8 Lakhs avg. blocked working capital per MSME annually',
      'Over 40 hours spent manually checking spreadsheets in Excel',
      'Risk of Section 16(2)(aa) invalid ITC claims',
    ],
  },
  {
    step: 2,
    badge: 'The Zero-Cloud Core',
    title: '5-Stage SIMD Matching Waterfall (<300ms)',
    icon: Zap,
    iconColor: 'text-recon-brand-text',
    description:
      'ReconcileGST processes 10,000 to 100,000 invoices 100% locally in browser RAM using Web Workers and SIMD string algorithms. Zero bytes of sensitive financial data ever touch external cloud servers, guaranteeing 100% DPDP Act 2023 compliance.',
    highlights: [
      'Pass 1: O(1) Exact Hash Join (70% instant match in <25ms)',
      'Pass 2: Syntax Normalization & Sec 170 ±₹1.00 tolerance (15%)',
      'Pass 3: RapidFuzz SIMD Levenshtein Typo Match (5%)',
      'Pass 4 & 5: Place of Supply & Rule 37A Ageing Watchdog (10%)',
    ],
  },
  {
    step: 3,
    badge: 'Statutory Pre-Triage',
    title: 'GSTN IMS Action Pre-Triage & GSTR-1A Payload',
    icon: CheckCircle2,
    iconColor: 'text-recon-emerald-text',
    description:
      'Features native pre-triage for the government\'s new Invoice Management System (IMS). Direct inline buttons let you Accept, Reject, or mark Invoices as Pending with an immutable audit trail, generating Form GSTR-1A amendment payloads for defaulting suppliers.',
    highlights: [
      '1-Click IMS Accept / Reject / Pending state management',
      'Instant isolation of Blocked vs Claimable ITC',
      'Real-time Section 16(4) statutory time-limit warnings',
    ],
  },
  {
    step: 4,
    badge: 'Dispute Recovery & Legal Defense',
    title: '1-Click WhatsApp Recovery & DRC-01C Legal Defense',
    icon: Scale,
    iconColor: 'text-recon-brand-text',
    description:
      'Equips businesses and CAs with automated recovery tools. Send itemized WhatsApp & Email payment-hold intimations to defaulting vendors in bilingual Hinglish/English. Auto-generate Form GST DRC-01C Part B legal responses backed by landmark High Court rulings (D.Y. Beathel & Suncraft Energy).',
    highlights: [
      '1-Click Hinglish/English WhatsApp notices (90% response rate)',
      'High Court precedent DRC-01C legal defense annexures',
      '6-Tab CA Audit-Ready Excel workbooks with dynamic SUMIFS',
    ],
  },
];

export function GuidedTourModal({ isOpen, onClose, onRunDemo }: GuidedTourModalProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isOpen) return null;

  const currentStep = TOUR_STEPS[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;
  const StepIcon = currentStep.icon;

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      onClose();
      onRunDemo();
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-terminal-overlay backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-terminal-surface1 border border-border-strong rounded-xl shadow-terminal-card overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-terminal-surface2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-recon-brand-surface border border-recon-brand-border">
              <Sparkles className="w-5 h-5 text-recon-brand-text" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-recon-brand-text font-bold">
                  Guided CA & Jury Tour
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  ({currentStepIndex + 1} of {TOUR_STEPS.length})
                </span>
              </div>
              <h2 className="text-base font-semibold text-slate-100">
                ReconcileGST Master Walkthrough
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-terminal-surface3 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Step Badge & Icon */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-medium rounded-full bg-terminal-surface3 border border-border-default text-slate-200">
              <StepIcon className={`w-3.5 h-3.5 ${currentStep.iconColor}`} />
              {currentStep.badge}
            </span>
            {/* Progress Dots */}
            <div className="flex items-center gap-1.5">
              {TOUR_STEPS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentStepIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentStepIndex
                      ? 'w-6 bg-recon-brand-text'
                      : 'w-2 bg-border-default hover:bg-border-strong'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Title & Description */}
          <div>
            <h3 className="text-xl font-bold text-slate-100 mb-2">
              {currentStep.title}
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {currentStep.description}
            </p>
          </div>

          {/* Key Highlights */}
          <div className="p-4 rounded-lg bg-terminal-surface2 border border-border-subtle space-y-2.5">
            <div className="text-xs font-mono font-semibold uppercase text-slate-400 tracking-wider">
              Statutory & Technical Highlights:
            </div>
            <ul className="space-y-2">
              {currentStep.highlights.map((hl, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-recon-emerald-text shrink-0 mt-0.5" />
                  <span>{hl}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border-subtle bg-terminal-surface2">
          <button
            onClick={handlePrev}
            disabled={isFirstStep}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              isFirstStep
                ? 'text-slate-600 cursor-not-allowed'
                : 'text-slate-300 hover:text-slate-100 hover:bg-terminal-surface3'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              Skip Tour
            </button>
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-black bg-recon-brand-text hover:bg-amber-400 rounded-lg shadow-sm transition-all"
            >
              {isLastStep ? (
                <>
                  <Zap className="w-4 h-4" />
                  Launch 10k Benchmark Demo
                </>
              ) : (
                <>
                  Next Step
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
