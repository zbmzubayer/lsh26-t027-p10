import Decimal from "decimal.js";
import { fromBDT } from "@/lib/money";
import type { BandPart } from "@/lib/types";

export type Band = {
  limit: number;
  rate: Decimal;
};

export const BANDS: Band[] = [
  { limit: 75, rate: fromBDT(4.63) },
  { limit: 200, rate: fromBDT(5.26) },
  { limit: 300, rate: fromBDT(5.63) },
  { limit: 400, rate: fromBDT(5.83) },
  { limit: 600, rate: fromBDT(9.3) },
  { limit: Number.POSITIVE_INFINITY, rate: fromBDT(10.7) },
];

export const VAT_RATE = fromBDT(0.05);
export const VAT_MULTIPLIER = fromBDT(1.05);
export const DEMAND_CHARGE = fromBDT(42);
export const METER_RENT = fromBDT(40);
export const FIXED_CHARGE = DEMAND_CHARGE.plus(METER_RENT);

export function energyFor(
  monthUnitsSoFar: number,
  units: number,
): { total: Decimal; parts: BandPart[] } {
  let total = new Decimal(0);
  const parts: BandPart[] = [];
  let remaining = units;
  let position = monthUnitsSoFar;

  for (const band of BANDS) {
    if (remaining <= 0) break;

    const bandEnd =
      band.limit === Number.POSITIVE_INFINITY
        ? Number.MAX_SAFE_INTEGER
        : band.limit;
    const availableInBand = Math.max(0, bandEnd - position);
    const used = Math.min(remaining, availableInBand);

    if (used > 0) {
      const cost = band.rate.times(used);
      total = total.plus(cost);
      parts.push({
        from: position + 1,
        to: position + used,
        rate: band.rate.toNumber(),
        units: used,
        cost: cost.toNumber(),
      });
      remaining -= used;
      position += used;
    }
  }

  return { total, parts };
}

export function bandIndexFor(monthUnits: number): number {
  let index = 0;
  for (const band of BANDS) {
    if (band.limit === Number.POSITIVE_INFINITY || monthUnits <= band.limit) {
      return index;
    }
    index++;
  }
  return BANDS.length - 1;
}
