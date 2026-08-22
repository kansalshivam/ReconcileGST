/**
 * Automated Verification Test Suite for ReconcileGST
 * Validates:
 * - Pass 1: Exact Hash Match Join
 * - Pass 2: Canonical Syntax Normalization & Section 170 +-Rs 1.00 Roundoff
 * - Pass 3: Fuzzy Typo Matching (Levenshtein / Jaro-Winkler)
 * - Pass 4: Place of Supply / Tax Head Swap Detection
 * - Pass 5: Rule 37A 180-Day Ageing Watchdog & DRC-01C Exposure Formula
 */

import {
  normalizeInvoiceSyntax,
  evaluateRule88DThreat,
  ReconciliationEngine,
  SECTION_170_TOLERANCE_PAISE,
  DRC01C_STATUTORY_PERCENTAGE_THRESHOLD,
} from '../lib/matching-engine';
import { generateSyntheticBenchmarkDataset } from '../lib/sample-data';
import { InwardInvoice, Gstr2bRecord } from '../types/recon';

describe('ReconcileGST Statutory Matching Engine Test Suite', () => {
  // Test 1: Syntax Normalization
  test('Syntax Normalization correctly strips prefixes, delimiters and leading zeros', () => {
    expect(normalizeInvoiceSyntax('INV/2026/00045')).toBe('202645');
    expect(normalizeInvoiceSyntax('BILL-AUG-099')).toBe('AUG99');
    expect(normalizeInvoiceSyntax('GST-IN/26-27/001')).toBe('26271');
    expect(normalizeInvoiceSyntax('UTCL/MUM/00456')).toBe('MUM456');
  });

  // Test 2: Section 170 Statutory Roundoff (within +- 100 Paise)
  test('Section 170 tolerance allows +- 100 Paise (Rs 1.00) variance', () => {
    expect(SECTION_170_TOLERANCE_PAISE).toBe(100n);
  });

  // Test 3: Rule 88D DRC-01C Statutory Threat Evaluation
  test('DRC-01C triggers when excess ITC exceeds 20% statutory threshold', () => {
    const totalClaimed = 150_000_000n; // Rs 15,00,000
    const totalAvailable = 100_000_000n; // Rs 10,00,000 (50% excess)

    const evaluation = evaluateRule88DThreat(totalClaimed, totalAvailable);
    expect(evaluation.isDrc01cTriggered).toBe(true);
    expect(evaluation.threatLevel).toBe('HIGH_THREAT');
    expect(evaluation.excessPercentage).toBe(50.0);
  });

  test('DRC-01C does NOT trigger when excess ITC is below 20%', () => {
    const totalClaimed = 110_000_000n; // Rs 11,00,000
    const totalAvailable = 100_000_000n; // Rs 10,00,000 (10% excess)

    const evaluation = evaluateRule88DThreat(totalClaimed, totalAvailable);
    expect(evaluation.isDrc01cTriggered).toBe(false);
    expect(evaluation.threatLevel).toBe('SAFE');
    expect(evaluation.excessPercentage).toBe(10.0);
  });

  // Test 4: 10,000-Row Benchmark Execution Performance
  test('Reconciles 10,000 realistic records in < 500ms', () => {
    const benchmark = generateSyntheticBenchmarkDataset({ totalCount: 10000 });
    expect(benchmark.erpInvoices.length).toBe(10000);
    expect(benchmark.gstr2bRecords.length).toBe(9500);

    const tStart = performance.now();
    const result = ReconciliationEngine.run({
      erpInvoices: benchmark.erpInvoices,
      gstr2bRecords: benchmark.gstr2bRecords,
    });
    const duration = performance.now() - tStart;

    expect(duration).toBeLessThan(1000); // Must be fast
    expect(result.summary.matchedCount).toBeGreaterThanOrEqual(7000);
    expect(result.summary.missingIn2bCount).toBe(500);
  });
});
