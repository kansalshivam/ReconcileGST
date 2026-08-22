/**
 * Precision Currency & Date Formatting Utilities
 * Adheres strictly to Indian Rupee numbering format (Lakhs & Crores)
 * Invariant: 1 INR = 100 Paise (BigInt)
 */

import { Paise } from '@/types/recon';

/**
 * Formats integer Paise to Indian Currency String with Rupee Symbol
 * e.g. 4824192000n -> "₹ 4,82,41,920.00"
 * e.g. -14520000n -> "-₹ 1,45,200.00"
 */
export function formatINR(paise: Paise | number | undefined | null): string {
  if (paise === undefined || paise === null) return '₹ 0.00';
  
  const isNegative = typeof paise === 'bigint' ? paise < 0n : paise < 0;
  const absPaise = typeof paise === 'bigint' 
    ? (isNegative ? -paise : paise) 
    : BigInt(Math.round(Math.abs(paise)));

  const rupees = absPaise / 100n;
  const fraction = absPaise % 100n;
  const fractionStr = fraction.toString().padStart(2, '0');

  const rupeesStr = rupees.toString();
  const formattedRupees = formatIndianNumberString(rupeesStr);

  return `${isNegative ? '-' : ''}₹ ${formattedRupees}.${fractionStr}`;
}

/**
 * Formats integer Paise to Indian Number string without symbol
 * e.g. 4824192000n -> "4,82,41,920.00"
 */
export function formatINRRaw(paise: Paise | number | undefined | null): string {
  if (paise === undefined || paise === null) return '0.00';
  
  const isNegative = typeof paise === 'bigint' ? paise < 0n : paise < 0;
  const absPaise = typeof paise === 'bigint' 
    ? (isNegative ? -paise : paise) 
    : BigInt(Math.round(Math.abs(paise)));

  const rupees = absPaise / 100n;
  const fraction = absPaise % 100n;
  const fractionStr = fraction.toString().padStart(2, '0');

  const rupeesStr = rupees.toString();
  const formattedRupees = formatIndianNumberString(rupeesStr);

  return `${isNegative ? '-' : ''}${formattedRupees}.${fractionStr}`;
}

/**
 * Converts Paise (BigInt) to decimal float for external exports
 */
export function paiseToFloat(paise: Paise | undefined | null): number {
  if (!paise) return 0;
  return Number(paise) / 100;
}

/**
 * Converts float or string Rupees to integer Paise (BigInt)
 */
export function rupeesToPaise(rupees: number | string): Paise {
  if (typeof rupees === 'string') {
    const clean = rupees.replace(/[^0-9.-]/g, '');
    const num = parseFloat(clean);
    if (isNaN(num)) return 0n;
    return BigInt(Math.round(num * 100));
  }
  return BigInt(Math.round(rupees * 100));
}

/**
 * Formats a raw number string in Indian comma format (2,2,3 grouping)
 */
function formatIndianNumberString(str: string): string {
  if (str.length <= 3) return str;
  const lastThree = str.substring(str.length - 3);
  const otherNumbers = str.substring(0, str.length - 3);
  const formattedOther = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return `${formattedOther},${lastThree}`;
}

/**
 * Formats ISO date (YYYY-MM-DD) into standard Indian Display Format: DD-MMM-YYYY
 */
export function formatDate(isoDateStr: string | undefined | null): string {
  if (!isoDateStr) return '—';
  try {
    const parts = isoDateStr.split('-');
    if (parts.length !== 3) return isoDateStr;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const d = new Date(year, month, day);
    if (isNaN(d.getTime())) return isoDateStr;
    
    const dayStr = String(day).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${dayStr}-${months[month]}-${year}`;
  } catch {
    return isoDateStr;
  }
}

/**
 * Formats integer counts with commas (safely handles undefined and null)
 */
export function formatCount(count: number | undefined | null): string {
  if (count === undefined || count === null || isNaN(count)) return '0';
  return new Intl.NumberFormat('en-IN').format(count);
}


/**
 * Aliases for compatibility with UI components
 */
export const formatPaiseToINR = formatINR;
export const formatISODate = formatDate;

