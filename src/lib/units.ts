/** Converts documented kilograms to pounds; catalog values are stored in pounds. */
export function kilogramsToPounds(kilograms: number): number {
  if (!Number.isFinite(kilograms) || kilograms < 0) throw new Error('Kilograms must be a non-negative finite number');
  return Math.round(kilograms * 2.2046226218 * 100) / 100;
}

/** Converts documented millimetres to inches; catalog values are stored in inches. */
export function millimetresToInches(millimetres: number): number {
  if (!Number.isFinite(millimetres) || millimetres < 0) throw new Error('Millimetres must be a non-negative finite number');
  return Math.round((millimetres / 25.4) * 1000) / 1000;
}
