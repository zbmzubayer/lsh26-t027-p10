import Decimal from "decimal.js";

export const ZERO = new Decimal(0);
export const VAT_RATE = new Decimal(0.05);
export const VAT_MULTIPLIER = new Decimal(1.05);
export const FIXED_CHARGE = new Decimal(82);

export function fromBDT(value: string | number): Decimal {
  return new Decimal(value);
}

export function toBDT(value: Decimal): number {
  return Number(value.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toFixed(2));
}

export function formatBDT(value: Decimal | number): string {
  const d = value instanceof Decimal ? value : new Decimal(value);
  const formatted = d.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toFixed(2);
  const parts = formatted.split(".");
  const whole = Number.parseInt(parts[0], 10);
  const fraction = parts[1];
  return `৳${whole.toLocaleString("en-BD")}.${fraction}`;
}

export function formatNumber(value: Decimal | number): string {
  const d = value instanceof Decimal ? value : new Decimal(value);
  const formatted = d.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toFixed(2);
  const parts = formatted.split(".");
  const whole = Number.parseInt(parts[0], 10);
  const fraction = parts[1];
  return `${whole.toLocaleString("en-BD")}.${fraction}`;
}
