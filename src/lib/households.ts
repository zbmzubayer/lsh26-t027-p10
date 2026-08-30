import Decimal from "decimal.js";
import {
  addDays,
  endOfMonth,
  formatDate,
  formatMonth,
  parseDate,
  startOfMonth,
  subDays,
  subMonths,
} from "@/lib/date-utc";
import { replay } from "@/lib/engine";
import prisma from "@/lib/prisma";
import type { Case, Comparison, DayReading, Recharge } from "@/lib/types";

export type HouseholdWithData = NonNullable<
  Awaited<ReturnType<typeof getHouseholdById>>
>;

export async function listHouseholds(userId: string) {
  return prisma.household.findMany({
    where: { OR: [{ userId }, { userId: null }] },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { readings: true, recharges: true } },
    },
  });
}

export async function getHouseholdById(id: string, userId: string) {
  return prisma.household.findFirst({
    where: { id, OR: [{ userId }, { userId: null }] },
    include: {
      readings: { orderBy: { date: "asc" } },
      recharges: { orderBy: { date: "asc" } },
    },
  });
}

function autoUsualDailyUnits(
  readings: { date: Date; units: Decimal }[],
): Decimal {
  const recent = readings
    .slice()
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 28);

  if (recent.length === 0) return new Decimal(0);

  const total = recent.reduce((sum, r) => sum.plus(r.units), new Decimal(0));
  return total
    .dividedBy(recent.length)
    .toDecimalPlaces(1, Decimal.ROUND_HALF_UP);
}

function deriveComparison(
  household: { openingBalance: Decimal; startDate: Date },
  readings: { date: Date; units: Decimal }[],
  replayRows: { date: string; balance: number }[],
): Comparison {
  if (readings.length === 0) {
    return {
      months: ["", "", ""] as [string, string, string],
      source: "readings",
      daily_units: null,
      opening_balance_bdt: household.openingBalance.toFixed(2),
      low_threshold_bdt: "100",
      low_amount_bdt: "500",
      monthly_amount_bdt: "1500",
    };
  }

  const lastReading = readings[readings.length - 1].date;
  let candidate = startOfMonth(lastReading);

  // The most recent *complete* month is the starting point.
  const candidateEnd = endOfMonth(candidate);
  if (formatDate(lastReading) < formatDate(candidateEnd)) {
    candidate = subMonths(candidate, 1);
  }

  const months: string[] = [];
  for (let i = 0; i < 3; i++) {
    months.unshift(formatMonth(candidate));
    candidate = subMonths(candidate, 1);
  }

  const firstMonthStart = parseDate(`${months[0]}-01`);
  const balanceDate = subDays(firstMonthStart, 1);
  const balanceDateStr = formatDate(balanceDate);

  let openingBalanceBdt = household.openingBalance.toFixed(2);
  for (const row of replayRows) {
    if (row.date === balanceDateStr) {
      openingBalanceBdt = row.balance.toFixed(2);
      break;
    }
  }

  return {
    months: months as [string, string, string],
    source: "readings",
    daily_units: null,
    opening_balance_bdt: openingBalanceBdt,
    low_threshold_bdt: "100",
    low_amount_bdt: "500",
    monthly_amount_bdt: "1500",
  };
}

export function buildCaseData(
  household: HouseholdWithData,
): Omit<Case, "comparison"> {
  const readings = household.readings;
  const recharges = household.recharges;

  if (readings.length === 0) {
    throw new Error("Household has no readings");
  }

  const days: DayReading[] = readings.map((r) => ({
    date: formatDate(r.date),
    units: Number(r.units),
  }));

  const rechargeRows: Recharge[] = recharges.map((r) => ({
    date: formatDate(r.date),
    amount_bdt: r.amountBdt.toFixed(2),
  }));

  const today = days[days.length - 1].date;
  const usual = household.usualDailyUnits ?? autoUsualDailyUnits(readings);
  const targetDate = formatDate(addDays(parseDate(today), 30));

  return {
    case_id: household.id,
    opening_balance_bdt: household.openingBalance.toFixed(2),
    days,
    recharges: rechargeRows,
    today,
    usual_daily_units: Number(usual),
    target_date: targetDate,
  };
}

export function caseFromHousehold(household: HouseholdWithData): Case {
  const base = buildCaseData(household);
  const rows = replay({
    ...base,
    comparison: undefined as unknown as Comparison,
  });

  const comparison = deriveComparison(
    {
      openingBalance: household.openingBalance,
      startDate: household.startDate,
    },
    household.readings,
    rows,
  );

  // Apply household-specific habit thresholds if present.
  comparison.low_threshold_bdt = household.lowThresholdBdt.toFixed(2);
  comparison.low_amount_bdt = household.lowAmountBdt.toFixed(2);
  comparison.monthly_amount_bdt = household.monthlyAmountBdt.toFixed(2);

  return { ...base, comparison };
}

export function replayHousehold(household: HouseholdWithData) {
  const base = buildCaseData(household);
  return replay({ ...base, comparison: undefined as unknown as Comparison });
}

export function balanceAtDate(
  household: HouseholdWithData,
  dateStr: string,
): Decimal {
  const rows = replayHousehold(household);
  for (const row of rows) {
    if (row.date === dateStr) {
      return new Decimal(row.balance);
    }
  }
  return household.openingBalance;
}
