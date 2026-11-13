// South African cell number helpers. No imports, so they are easy to test.

// Turns what the person typed into +27XXXXXXXXX, or null if it is not a valid SA cell number.
// Accepts: 082 123 4567, 82 123 4567, +27 82 123 4567, 27821234567, 0027821234567.
export function toSouthAfricanNumber(input: string): string | null {
  const s = input.replace(/[\s\-().]/g, '');
  let national: string | null = null;
  let m: RegExpMatchArray | null;
  if ((m = s.match(/^(?:\+27|0027|27)(\d{9})$/))) national = m[1];
  else if ((m = s.match(/^0(\d{9})$/))) national = m[1];
  else if (/^\d{9}$/.test(s)) national = s;
  if (!national || !/^[678]/.test(national)) return null; // SA cell numbers start with 06, 07 or 08
  return `+27${national}`;
}

// +27821234567 -> +27 82 123 4567
export const formatPhone = (e164: string) => e164.replace(/^\+27(\d{2})(\d{3})(\d{4})$/, '+27 $1 $2 $3');

export function formatCountdown(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60), s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
