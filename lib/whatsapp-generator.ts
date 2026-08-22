/**
 * @file whatsapp-generator.ts
 * @module ReconcileGST/WhatsAppGenerator
 * @description Client-Side Bilingual (English & Hinglish) WhatsApp (wa.me) & Email Deep-Link
 * Intimation Generator for Defaulting Vendors under Section 16(2)(aa) and Form GSTR-1A.
 *
 * @standards
 * - ADR-006: Client-Side WhatsApp Deep-Link Architecture
 * - Zero Network Egress: Generated 100% inside client RAM (CON-PRIV-01)
 * - Zero Infrastructure Cost: ₹0 SaaS messaging fee protocol (CON-PRIV-04)
 * - Section 16(2)(aa) Payment-Hold Clause & Form GSTR-1A Amendment Intimation
 * - Safe URI Length Budgeting: Auto-summarization when URL exceeds 2,000 characters (ERR_EXT_001)
 */

import { Paise, GSTIN, formatPaiseToRupees } from './statutory-sentinel';

// ============================================================================
// 1. DATA CONTRACTS & TYPES
// ============================================================================

export type WhatsAppLanguage = 'EN' | 'HINGLISH';

export type DiscrepancyType =
  | 'MISSING_IN_GSTR2B'
  | 'TAX_VALUE_MISMATCH'
  | 'TAX_HEAD_MISMATCH'
  | 'RULE_37A_OVERDUE';

/**
 * Individual discrepancy record for vendor intimation.
 */
export interface VendorDiscrepancyItem {
  readonly invoiceNumber: string;
  readonly invoiceDate: string; // YYYY-MM-DD
  readonly taxableValuePaise: Paise;
  readonly taxAmountPaise: Paise;
  readonly portalTaxPaise?: Paise;
  readonly discrepancyType: DiscrepancyType;
  readonly discrepancyNote?: string;
}

/**
 * Parameter payload for vendor intimation generation.
 */
export interface WhatsAppNoticeParams {
  readonly recipientPhone: string; // 10-digit Indian mobile or +91 format
  readonly recipientName: string; // Vendor trade/contact name
  readonly supplierGstin: GSTIN;
  readonly taxpayerName: string; // Buyer legal name
  readonly taxpayerGstin: GSTIN;
  readonly filingPeriod: string; // e.g. "August 2026" or "082026"
  readonly items: VendorDiscrepancyItem[];
  readonly language: WhatsAppLanguage;
  readonly includePaymentHoldClause?: boolean;
  readonly includeGstr1aRemediationClause?: boolean;
  readonly includeSection50InterestWarning?: boolean;
  readonly recipientEmail?: string;
}

/**
 * Generated multi-channel dispatch payload result.
 */
export interface WhatsAppPayloadResult {
  readonly waLink: string;
  readonly rawText: string;
  readonly uriLength: number;
  readonly isTruncated: boolean;
  readonly sanitizedPhone: string;
  readonly mailtoLink?: string;
  readonly emailSubject?: string;
  readonly emailBody?: string;
}

// ============================================================================
// 2. PHONE SANITIZATION & VALIDATION
// ============================================================================

/**
 * Cleanses and validates Indian mobile phone numbers, returning a canonical 12-digit string ("91XXXXXXXXXX").
 *
 * Validation Rules:
 * - Strips whitespace, hyphens, parentheses, plus signs, leading zeroes.
 * - Accepts 10-digit Indian mobile (starts with 6, 7, 8, 9) and prepends country code 91.
 * - Accepts 12-digit Indian number starting with 91.
 * - Returns clean phone string or empty string if invalid.
 */
export function sanitizeIndianPhoneNumber(rawPhone: string): string {
  if (!rawPhone) return '';
  const digitsOnly = rawPhone.replace(/\D/g, '');

  if (digitsOnly.length === 10 && /^[6-9]\d{9}$/.test(digitsOnly)) {
    return `91${digitsOnly}`;
  }

  if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) {
    const sub = digitsOnly.substring(1);
    if (/^[6-9]\d{9}$/.test(sub)) {
      return `91${sub}`;
    }
  }

  if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    const sub = digitsOnly.substring(2);
    if (/^[6-9]\d{9}$/.test(sub)) {
      return digitsOnly;
    }
  }

  // Fallback for international or non-standard format
  return digitsOnly;
}

// ============================================================================
// 3. NOTICE TEXT SYNTHESIS ENGINE
// ============================================================================

/**
 * Synthesizes multi-line formatted WhatsApp message in English or Hinglish.
 * Automatically switches to condensed summary mode if detailed lines threaten the 2,000-character URI budget.
 */
export function synthesizeNoticeMessage(
  params: WhatsAppNoticeParams,
  forceCondensed = false
): { text: string; isCondensed: boolean } {
  const isHinglish = params.language === 'HINGLISH';
  const totalDisputedTaxPaise = params.items.reduce((acc, curr) => acc + curr.taxAmountPaise, 0n);
  const totalTaxFormatted = formatPaiseToRupees(totalDisputedTaxPaise);
  const invoiceCount = params.items.length;

  const paymentHoldEnabled = params.includePaymentHoldClause !== false;
  const gstr1aEnabled = params.includeGstr1aRemediationClause !== false;
  const sec50Enabled = params.includeSection50InterestWarning !== false;

  // 1. CONDENSED SUMMARY MODE (Used when invoiceCount > 4 or when forced to prevent URI overflow)
  if (forceCondensed || invoiceCount > 4) {
    if (isHinglish) {
      let msg = `⚠️ *URGENT GST REMINDER: ${invoiceCount} Invoices GSTR-2B me Missing Hain*\n\n`;
      msg += `Namaste *${params.recipientName}*,\n`;
      msg += `Hamari purchase reconciliation (*${params.taxpayerName}* - GSTIN: \`${params.taxpayerGstin}\`) `;
      msg += `me aapke *${invoiceCount} invoices* ka ITC hamare Form GSTR-2B (*${params.filingPeriod}*) me show nahi ho raha hai.\n\n`;
      msg += `📊 *Summary Details:*\n`;
      msg += `• *Supplier GSTIN:* \`${params.supplierGstin}\`\n`;
      msg += `• *Total Missing Invoices:* ${invoiceCount}\n`;
      msg += `• *Total Blocked ITC:* *${totalTaxFormatted}*\n\n`;

      if (paymentHoldEnabled) {
        msg += `🔒 *Payment Policy Alert:* GST Section 16(2)(aa) ke anusaar, jab tak ye invoices GSTR-2B me reflect nahi hote, hum ITC claim nahi kar sakte. Isliye *₹${totalTaxFormatted.replace('₹', '')}* ka commercial payment administrative hold par rakha gaya hai.\n\n`;
      }

      if (gstr1aEnabled) {
        msg += `⚡ *Action Required:* Kripya in invoices ko turant *Form GSTR-1 ya GSTR-1A (Outward Amendment)* me upload karein taaki humara credit match ho sake aur aapka pending payment turant release kiya ja sake.\n\n`;
      }

      if (sec50Enabled) {
        msg += `⏱️ Delay hone par Section 50(3) ke tehat 18% p.a. penal interest ka risk rehta hai.\n\n`;
      }

      msg += `Shukriya,\n*Accounts & Taxation Team*\n_${params.taxpayerName}_`;
      return { text: msg, isCondensed: true };
    } else {
      let msg = `🚨 *URGENT STATUTORY NOTICE: ${invoiceCount} Invoices Missing in Form GSTR-2B*\n\n`;
      msg += `Dear *${params.recipientName}*,\n`;
      msg += `During our GST inward reconciliation for *${params.taxpayerName}* (GSTIN: \`${params.taxpayerGstin}\`), `;
      msg += `we observed that *${invoiceCount} invoices* issued by your firm (*${params.supplierGstin}*) are *NOT reflecting in our Form GSTR-2B* for *${params.filingPeriod}*.\n\n`;
      msg += `📊 *Discrepancy Summary:*\n`;
      msg += `• *Defaulting Invoices:* ${invoiceCount}\n`;
      msg += `• *Total Blocked Input Tax Credit:* *${totalTaxFormatted}*\n\n`;

      if (paymentHoldEnabled) {
        msg += `🔒 *Payment Withholding Intimation:* Under Section 16(2)(aa) of the CGST Act, 2017, Input Tax Credit is legally barred until uploaded in GSTR-1. Consequently, payment of *${totalTaxFormatted}* is placed on administrative hold pending portal reflection.\n\n`;
      }

      if (gstr1aEnabled) {
        msg += `⚡ *Remediation Protocol:* Kindly upload these missing invoices via *Form GSTR-1* or *Form GSTR-1A (CBIC Notification 12/2024-CT)* immediately to facilitate credit matching and allow invoice payment release.\n\n`;
      }

      if (sec50Enabled) {
        msg += `⚠️ Non-compliance exposes the transaction to Section 50(3) 18% p.a. penal interest.\n\n`;
      }

      msg += `Regards,\n*Taxation & Accounts Department*\n_${params.taxpayerName}_`;
      return { text: msg, isCondensed: true };
    }
  }

  // 2. ITEMIZED DETAILED MODE (For 1 to 4 invoices)
  if (isHinglish) {
    let msg = `⚠️ *URGENT GST NOTICE: Inward Invoice GSTR-2B me Missing Hai*\n\n`;
    msg += `Namaste *${params.recipientName}*,\n`;
    msg += `Aapke dwara issue kiye gaye niche diye gaye invoice(s) hamare Form GSTR-2B (*${params.filingPeriod}*) me reflect nahi ho rahe hain:\n\n`;

    params.items.forEach((item, index) => {
      msg += `📋 *Invoice ${index + 1}:* ${item.invoiceNumber}\n`;
      msg += `   • *Date:* ${item.invoiceDate}\n`;
      msg += `   • *Taxable Value:* ${formatPaiseToRupees(item.taxableValuePaise)}\n`;
      msg += `   • *Blocked Tax:* *${formatPaiseToRupees(item.taxAmountPaise)}*\n`;
      if (item.discrepancyNote) {
        msg += `   • *Issue:* ${item.discrepancyNote}\n`;
      }
      msg += `\n`;
    });

    msg += `💰 *Total Blocked ITC:* *${totalTaxFormatted}*\n\n`;

    if (paymentHoldEnabled) {
      msg += `🔒 *Payment Hold Note:* *Section 16(2)(aa)* ke rules ke hisaab se, jab tak ye invoices portal par reflect nahi hote, tab tak payment process hold par rahega.\n\n`;
    }

    if (gstr1aEnabled) {
      msg += `⚡ *Request:* Kripya is invoice ko turant *GSTR-1 ya GSTR-1A* me upload karke intimation dein taaki aapka pending payment release kiya ja sake.\n\n`;
    }

    if (sec50Enabled) {
      msg += `⏱️ Tax delay Section 50(3) ke mutabiq 18% p.a. interest attract karta hai.\n\n`;
    }

    msg += `Shukriya,\n*Finance Team — ${params.taxpayerName}*`;
    return { text: msg, isCondensed: false };
  } else {
    let msg = `🚨 *URGENT: GST ITC Discrepancy Notice — Form GSTR-2B Mismatch*\n\n`;
    msg += `Dear *${params.recipientName}*,\n`;
    msg += `The following invoice(s) issued to *${params.taxpayerName}* (GSTIN: \`${params.taxpayerGstin}\`) are *MISSING in our Form GSTR-2B* for *${params.filingPeriod}*:\n\n`;

    params.items.forEach((item, index) => {
      msg += `📋 *Item ${index + 1}: Invoice #${item.invoiceNumber}*\n`;
      msg += `   • *Date:* ${item.invoiceDate}\n`;
      msg += `   • *Taxable Value:* ${formatPaiseToRupees(item.taxableValuePaise)}\n`;
      msg += `   • *Blocked ITC:* *${formatPaiseToRupees(item.taxAmountPaise)}*\n`;
      if (item.discrepancyNote) {
        msg += `   • *Audit Note:* ${item.discrepancyNote}\n`;
      }
      msg += `\n`;
    });

    msg += `💰 *Total Blocked ITC:* *${totalTaxFormatted}*\n\n`;

    if (paymentHoldEnabled) {
      msg += `🔒 *Payment Withholding Clause:* Under Section 16(2)(aa) of the CGST Act, Input Tax Credit cannot be availed without GSTR-2B reflection. Payment of *${totalTaxFormatted}* is placed on administrative hold pending upload.\n\n`;
    }

    if (gstr1aEnabled) {
      msg += `⚡ *Remediation Action:* Kindly amend/upload via *Form GSTR-1* or *Form GSTR-1A (Notification 12/2024-CT)* immediately to release withheld payment.\n\n`;
    }

    if (sec50Enabled) {
      msg += `⚠️ Continued delay attracts Section 50(3) penal interest at 18% per annum.\n\n`;
    }

    msg += `Regards,\n*Taxation Department — ${params.taxpayerName}*`;
    return { text: msg, isCondensed: false };
  }
}

// ============================================================================
// 4. MAIN GENERATOR INTERFACE
// ============================================================================

/**
 * Builds a 1-Click WhatsApp deep-link payload with safe URI length enforcement.
 *
 * @param params - Vendor notice configuration
 * @returns WhatsAppPayloadResult
 */
export function buildVendorDiscrepancyWhatsAppPayload(
  params: WhatsAppNoticeParams
): WhatsAppPayloadResult {
  const cleanPhone = sanitizeIndianPhoneNumber(params.recipientPhone);

  // 1. Attempt synthesis with normal mode
  let { text, isCondensed } = synthesizeNoticeMessage(params, false);
  let encodedText = encodeURIComponent(text);
  let waLink = `https://wa.me/${cleanPhone}?text=${encodedText}`;

  // 2. URI Length Budget Guard (Browser limit: 2,048 chars; Safe limit: 1,950 chars)
  let isTruncated = false;
  if (waLink.length > 1950 && !isCondensed) {
    // Re-synthesize in forced condensed summary mode
    const fallback = synthesizeNoticeMessage(params, true);
    text = fallback.text;
    encodedText = encodeURIComponent(text);
    waLink = `https://wa.me/${cleanPhone}?text=${encodedText}`;
    isCondensed = true;
    isTruncated = true;
  }

  // 3. Synthesize Email deep-link payload (mailto:)
  const totalTaxFormatted = formatPaiseToRupees(
    params.items.reduce((acc, curr) => acc + curr.taxAmountPaise, 0n)
  );
  const emailSubject = `URGENT: GST ITC Discrepancy Notice — Form GSTR-2B Mismatch (${params.taxpayerName})`;
  const emailBody = text.replace(/\*/g, ''); // Strip WhatsApp markdown asterisks for plain email
  const mailtoLink = params.recipientEmail
    ? `mailto:${params.recipientEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`
    : undefined;

  return {
    waLink,
    rawText: text,
    uriLength: waLink.length,
    isTruncated: isCondensed || isTruncated,
    sanitizedPhone: cleanPhone,
    mailtoLink,
    emailSubject,
    emailBody
  };
}

/**
 * Convenience helper to build a single invoice dispute WhatsApp payload.
 */
export function buildSingleInvoiceWhatsAppLink(params: {
  supplierPhone: string;
  supplierName: string;
  supplierGstin: GSTIN;
  taxpayerName: string;
  taxpayerGstin: GSTIN;
  invoiceNumber: string;
  invoiceDate: string;
  taxableValuePaise: Paise;
  taxAmountPaise: Paise;
  filingPeriod: string;
  language?: WhatsAppLanguage;
}): WhatsAppPayloadResult {
  return buildVendorDiscrepancyWhatsAppPayload({
    recipientPhone: params.supplierPhone,
    recipientName: params.supplierName,
    supplierGstin: params.supplierGstin,
    taxpayerName: params.taxpayerName,
    taxpayerGstin: params.taxpayerGstin,
    filingPeriod: params.filingPeriod,
    language: params.language || 'HINGLISH',
    items: [
      {
        invoiceNumber: params.invoiceNumber,
        invoiceDate: params.invoiceDate,
        taxableValuePaise: params.taxableValuePaise,
        taxAmountPaise: params.taxAmountPaise,
        discrepancyType: 'MISSING_IN_GSTR2B'
      }
    ]
  });
}

/**
 * UI Component interface compatibility helpers
 */
export interface VendorNoticeParamsInput {
  phoneNumber?: string;
  supplierGstin: string;
  supplierName: string;
  invoiceNumber: string;
  invoiceDate: string;
  taxAmountInr: string;
  language: 'EN' | 'HINGLISH';
  taxableValueInr?: string;
}

export function generateWhatsAppMessage(params: VendorNoticeParamsInput): string {
  const isHinglish = params.language === 'HINGLISH';
  const taxableLine = params.taxableValueInr ? `Taxable Value: ₹ ${params.taxableValueInr}\n` : '';

  if (isHinglish) {
    return (
      `*URGENT: GST ITC RECONCILIATION NOTICE*\n\n` +
      `Namaste Accounts Team (${params.supplierName}),\n\n` +
      `Humari monthly purchase reconciliation (August 2026) ke dauran, aapka invoice *${params.invoiceNumber}* (Dated: ${params.invoiceDate}) humare GSTR-2B portal par reflect *NAHI* ho raha hai.\n\n` +
      `📄 *Invoice Details:*\n` +
      `• Invoice No: *${params.invoiceNumber}*\n` +
      `• Date: ${params.invoiceDate}\n` +
      `${taxableLine ? `• ${taxableLine}` : ''}` +
      `• Tax Amount (Disputed ITC): *₹ ${params.taxAmountInr}*\n` +
      `• Supplier GSTIN: ${params.supplierGstin}\n\n` +
      `⚠️ *Statutory Action Notice under Section 16(2)(aa):*\n` +
      `Kripya is invoice ko Form GSTR-1 / GSTR-1A me immediately upload karein taaki humara ITC claim ho sake. Agar 20th tak reflect nahi hota, toh statutory guidelines ke anusar upcoming invoice payouts HOLD par daal diye jayenge.\n\n` +
      `Dhanyawad,\n*Accounts & Taxation Department*`
    );
  }

  return (
    `*FORMAL STATUTORY NOTICE UNDER SECTION 16(2)(aa) CGST ACT*\n\n` +
    `To: Finance & Accounts Department, ${params.supplierName}\n` +
    `GSTIN: ${params.supplierGstin}\n\n` +
    `Subject: GSTR-2B Input Tax Credit Discrepancy Notice for Invoice ${params.invoiceNumber}\n\n` +
    `During our monthly GST inward supply reconciliation for August 2026, the following invoice was NOT found in our GSTR-2B:\n\n` +
    `• Invoice No: ${params.invoiceNumber}\n` +
    `• Date: ${params.invoiceDate}\n` +
    `${taxableLine ? `• ${taxableLine}` : ''}` +
    `• Disputed Tax Amount: ₹ ${params.taxAmountInr}\n\n` +
    `Under Section 16(2)(aa) of the CGST Act 2017, ITC is legally contingent upon GSTR-2B reflection. Please furnish this outward supply via Form GSTR-1 / GSTR-1A immediately to avoid vendor payment withholding under Rule 37A.\n\n` +
    `Sincerely,\nFinance & Taxation Department`
  );
}

export function generateWhatsAppDeepLink(params: VendorNoticeParamsInput): string {
  const phone = sanitizeIndianPhoneNumber(params.phoneNumber || '919820055124');
  const message = generateWhatsAppMessage(params);
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

