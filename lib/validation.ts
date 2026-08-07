/**
 * Pakistani Phone Validator (e.g. 03XXXXXXXXX or +923XXXXXXXXX)
 */
export function isValidPakistaniPhone(phone: string): boolean {
  const regex = /^(?:\+923\d{9}|03\d{9})$/;
  return regex.test(phone.trim());
}

/**
 * Pakistani CNIC Validator (13 digits with or without hyphens: XXXXX-XXXXXXX-X or XXXXXXXXXXXXX)
 */
export function isValidPakistaniCnic(cnic: string): boolean {
  const regex = /^(\d{13}|\d{5}-\d{7}-\d{1})$/;
  return regex.test(cnic.trim());
}

/**
 * Helper to mask CNIC as XXXXX-XXXXXXX-X as the user types
 */
export function formatCnicInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 13);
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
}
