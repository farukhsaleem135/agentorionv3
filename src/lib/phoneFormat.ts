/**
 * Strips a phone string down to digits only.
 */
export function stripPhone(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Formats a US phone number for display: (313) 550-5604
 * Accepts any string of digits; handles 10 or 11 (with leading 1) digit numbers.
 */
export function formatPhoneDisplay(value: string): string {
  const digits = stripPhone(value);
  // Remove leading country code 1 for formatting
  const national = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;

  if (national.length <= 3) return national;
  if (national.length <= 6) return `(${national.slice(0, 3)}) ${national.slice(3)}`;
  return `(${national.slice(0, 3)}) ${national.slice(3, 6)}-${national.slice(6, 10)}`;
}

/**
 * Converts any US phone input to E.164 format: +13135505604
 * Returns null if the input is not a valid 10/11 digit US number.
 */
export function toE164(value: string): string | null {
  const digits = stripPhone(value);
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null; // Not a valid US number
}

/**
 * Validates whether a phone string looks like a valid US number.
 */
export function isValidUSPhone(value: string): boolean {
  const digits = stripPhone(value);
  if (digits.length === 10) return true;
  if (digits.length === 11 && digits.startsWith("1")) return true;
  return false;
}
