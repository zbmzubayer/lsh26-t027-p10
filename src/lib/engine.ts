import {
  addDays,
  differenceInCalendarDays,
  format,
  isFirstDayOfMonth,
  parseISO,
} from "date-fns";
import type Decimal from "decimal.js";
import { cases, getCase } from "@/lib/cases";
import { fromBDT, toBDT, ZERO } from "@/lib/money";
import {
  bandIndexFor,
  DEMAND_CHARGE,
  energyFor,
  FIXED_CHARGE,
  METER_RENT,
  VAT_MULTIPLIER,
} from "@/lib/tariff";
import type {
  Case,
  DayRow,
  HabitComparison,
  HabitResult,
  MonthlyBill,
  RunsOutResult,
  TopUpResult,
} from "@/lib/types";

export { energyFor };

function toDayRow(
  date: string,
  units: number,
  energy: Decimal,
  recharge: Decimal,
  fixed: Decimal,
  balance: Decimal,
  monthUnits: number,
  parts: {
    from: number;
    to: number;
    rate: number;
    units: number;
    cost: number;
  }[],
): DayRow {
  const vat = energy.times(VAT_MULTIPLIER).minus(energy);
  const deduction = energy.plus(vat);
  return {
    date,
    units,
    energy: toBDT(energy),
    vat: toBDT(vat),
    deduction: toBDT(deduction),
    recharge: toBDT(recharge),
    fixed: toBDT(fixed),
    balance: toBDT(balance),
    monthUnits,
    band: bandIndexFor(monthUnits),
    parts,
  };
}

export function replay(kase: Case): DayRow[] {
  const rows: DayRow[] = [];
  let balance = fromBDT(kase.opening_balance_bdt);
  let monthUnits = 0;

  const rechargesByDate = new Map<string, Decimal>();
  const firstRechargeByMonth = new Map<string, string>();

  for (const recharge of kase.recharges) {
    const existing = rechargesByDate.get(recharge.date) ?? ZERO;
    rechargesByDate.set(
      recharge.date,
      existing.plus(fromBDT(recharge.amount_bdt)),
    );

    const month = recharge.date.slice(0, 7);
    if (!firstRechargeByMonth.has(month)) {
      firstRechargeByMonth.set(month, recharge.date);
    }
  }

  for (const day of kase.days) {
    if (isFirstDayOfMonth(parseISO(day.date))) {
      monthUnits = 0;
    }

    let rechargeAmount = ZERO;
    let fixedCharge = ZERO;
    const recharge = rechargesByDate.get(day.date);
    if (recharge) {
      rechargeAmount = recharge;
      balance = balance.plus(rechargeAmount);
      const month = day.date.slice(0, 7);
      if (firstRechargeByMonth.get(month) === day.date) {
        fixedCharge = FIXED_CHARGE;
        balance = balance.minus(fixedCharge);
      }
    }

    const { total: energy, parts } = energyFor(monthUnits, day.units);
    const vat = energy.times(VAT_MULTIPLIER).minus(energy);
    const deduction = energy.plus(vat);
    balance = balance.minus(deduction);
    monthUnits += day.units;

    rows.push(
      toDayRow(
        day.date,
        day.units,
        energy,
        rechargeAmount,
        fixedCharge,
        balance,
        monthUnits,
        parts,
      ),
    );
  }

  return rows;
}

export function runsOut(kase: Case): RunsOutResult {
  const rows = replay(kase);
  const todayRow = rows.find((r) => r.date === kase.today);
  if (!todayRow) {
    throw new Error(`Today ${kase.today} not found in replay`);
  }

  let balance = fromBDT(todayRow.balance.toFixed(2));
  let monthUnits = todayRow.monthUnits;
  const today = parseISO(kase.today);
  let currentDate = today;
  let coveredThrough = kase.today;

  while (true) {
    currentDate = addDays(currentDate, 1);
    const dateStr = format(currentDate, "yyyy-MM-dd");

    if (isFirstDayOfMonth(currentDate)) {
      monthUnits = 0;
    }

    const { total: energy } = energyFor(monthUnits, kase.usual_daily_units);
    const cost = energy.times(VAT_MULTIPLIER);

    if (balance.lessThan(cost)) {
      return {
        coveredThrough,
        runsOutOn: dateStr,
        days: differenceInCalendarDays(currentDate, today),
      };
    }

    balance = balance.minus(cost);
    monthUnits += kase.usual_daily_units;
    coveredThrough = dateStr;
  }
}

export function topUpFor(kase: Case, targetDate: string): TopUpResult {
  const rows = replay(kase);
  const todayRow = rows.find((r) => r.date === kase.today);
  if (!todayRow) {
    throw new Error(`Today ${kase.today} not found in replay`);
  }

  const today = parseISO(kase.today);
  const target = parseISO(targetDate);
  const days = differenceInCalendarDays(target, today);
  if (days <= 0) {
    throw new Error("Target date must be after today");
  }

  let monthUnits = todayRow.monthUnits;
  let totalEnergy = ZERO;
  let currentDate = today;
  let totalUnits = 0;

  for (let i = 0; i < days; i++) {
    currentDate = addDays(currentDate, 1);
    if (isFirstDayOfMonth(currentDate)) {
      monthUnits = 0;
    }
    const { total: energy } = energyFor(monthUnits, kase.usual_daily_units);
    totalEnergy = totalEnergy.plus(energy);
    monthUnits += kase.usual_daily_units;
    totalUnits += kase.usual_daily_units;
  }

  const vat = totalEnergy.times(VAT_MULTIPLIER).minus(totalEnergy);
  const base = fromBDT(4.63).times(totalUnits);
  const premium = totalEnergy.minus(base);

  // Fixed charge applies only if today's recharge would be the first of the month
  const monthRecharges = kase.recharges
    .filter((r) => r.date.startsWith(kase.today.slice(0, 7)))
    .map((r) => r.date)
    .sort();
  const fixed =
    monthRecharges.length > 0 && monthRecharges[0] > kase.today
      ? FIXED_CHARGE
      : ZERO;

  const total = base.plus(premium).plus(fixed).plus(vat);
  const balance = fromBDT(todayRow.balance.toFixed(2));
  const required = total.greaterThan(balance) ? total.minus(balance) : ZERO;

  return {
    units: totalUnits,
    base: toBDT(base),
    premium: toBDT(premium),
    fixed: toBDT(fixed),
    vat: toBDT(vat),
    total: toBDT(total),
    required: toBDT(required),
  };
}

function getComparisonDays(kase: Case): { date: string; units: number }[] {
  const months = kase.comparison.months;
  const startDate = parseISO(`${months[0]}-01`);
  const endDate = parseISO(`${months[2]}-01`);
  const endOfLastMonth = addDays(addDays(endDate, 32), -1);
  const startStr = format(startDate, "yyyy-MM-dd");
  const endStr = format(endOfLastMonth, "yyyy-MM-dd");

  if (kase.comparison.source === "readings") {
    return kase.days.filter((d) => d.date >= startStr && d.date <= endStr);
  }

  const dailyUnits = kase.comparison.daily_units ?? kase.usual_daily_units;
  const days: { date: string; units: number }[] = [];
  let current = startDate;
  while (current <= endOfLastMonth) {
    days.push({ date: format(current, "yyyy-MM-dd"), units: dailyUnits });
    current = addDays(current, 1);
  }
  return days;
}

function replayHabitCost(
  _kase: Case,
  rechargeDates: string[],
  days: { date: string; units: number }[],
): { cost: Decimal; fixedMonths: number } {
  const firstRechargeByMonth = new Map<string, string>();
  for (const date of rechargeDates) {
    const month = date.slice(0, 7);
    if (!firstRechargeByMonth.has(month)) {
      firstRechargeByMonth.set(month, date);
    }
  }

  let energyTotal = ZERO;
  let fixedTotal = ZERO;
  let monthUnits = 0;

  for (const day of days) {
    if (isFirstDayOfMonth(parseISO(day.date))) {
      monthUnits = 0;
    }

    if (rechargeDates.includes(day.date)) {
      const month = day.date.slice(0, 7);
      if (firstRechargeByMonth.get(month) === day.date) {
        fixedTotal = fixedTotal.plus(FIXED_CHARGE);
      }
    }

    const { total: energy } = energyFor(monthUnits, day.units);
    energyTotal = energyTotal.plus(energy);
    monthUnits += day.units;
  }

  const vat = energyTotal.times(VAT_MULTIPLIER).minus(energyTotal);
  const total = energyTotal.plus(vat).plus(fixedTotal);
  return { cost: total, fixedMonths: firstRechargeByMonth.size };
}

function runHabitLowBalance(
  kase: Case,
  days: { date: string; units: number }[],
): HabitResult {
  let balance = fromBDT(kase.comparison.opening_balance_bdt);
  let monthUnits = 0;
  const rechargeDates: string[] = [];
  const firstRechargeByMonth = new Map<string, string>();
  const threshold = fromBDT(kase.comparison.low_threshold_bdt);
  const amount = fromBDT(kase.comparison.low_amount_bdt);

  for (const day of days) {
    if (isFirstDayOfMonth(parseISO(day.date))) {
      monthUnits = 0;
    }

    if (balance.lessThan(threshold)) {
      balance = balance.plus(amount);
      rechargeDates.push(day.date);
      const month = day.date.slice(0, 7);
      if (!firstRechargeByMonth.has(month)) {
        firstRechargeByMonth.set(month, day.date);
      }
    }

    const { total: energy } = energyFor(monthUnits, day.units);
    const deduction = energy.times(VAT_MULTIPLIER);
    balance = balance.minus(deduction);
    monthUnits += day.units;
  }

  const { cost } = replayHabitCost(kase, rechargeDates, days);
  return {
    cost: toBDT(cost),
    fixedMonths: firstRechargeByMonth.size,
    rechargeDates,
  };
}

function runHabitMonthly(
  kase: Case,
  days: { date: string; units: number }[],
): HabitResult {
  const rechargeDates = kase.comparison.months.map((m) => `${m}-01`);
  const { cost, fixedMonths } = replayHabitCost(kase, rechargeDates, days);
  return {
    cost: toBDT(cost),
    fixedMonths,
    rechargeDates,
  };
}

export function compareHabits(kase: Case): HabitComparison {
  const days = getComparisonDays(kase);
  const low = runHabitLowBalance(kase, days);
  const monthly = runHabitMonthly(kase, days);
  const difference = monthly.cost - low.cost;

  let explanation = "";
  if (difference === 0) {
    explanation =
      "Both habits cost the same. Energy and VAT are identical because consumption is identical, and fixed charges also match.";
  } else if (difference > 0) {
    explanation = `The low-balance habit saves ৳${difference.toFixed(2)} by skipping ${monthly.fixedMonths - low.fixedMonths} month(s) of fixed charges.`;
  } else {
    explanation = `The monthly habit saves ৳${Math.abs(difference).toFixed(2)} by skipping ${low.fixedMonths - monthly.fixedMonths} month(s) of fixed charges.`;
  }

  return {
    low,
    monthly,
    difference,
    explanation,
  };
}

export function monthlyBill(kase: Case, month: string): MonthlyBill {
  const monthDays = kase.days.filter((d) => d.date.startsWith(month));
  if (monthDays.length === 0) {
    throw new Error(`Month ${month} not found in case`);
  }

  const firstRechargeOfMonth = kase.recharges
    .filter((r) => r.date.startsWith(month))
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  let energyTotal = ZERO;
  let monthUnits = 0;

  for (const day of monthDays) {
    const { total: energy } = energyFor(monthUnits, day.units);
    energyTotal = energyTotal.plus(energy);
    monthUnits += day.units;
  }

  const vat = energyTotal.times(VAT_MULTIPLIER).minus(energyTotal);
  const fixed = firstRechargeOfMonth ? FIXED_CHARGE : ZERO;
  const total = energyTotal.plus(vat).plus(fixed);
  const perUnit = monthUnits > 0 ? total.dividedBy(monthUnits) : ZERO;

  return {
    month,
    units: monthUnits,
    energy: toBDT(energyTotal),
    demand: toBDT(firstRechargeOfMonth ? DEMAND_CHARGE : ZERO),
    rent: toBDT(firstRechargeOfMonth ? METER_RENT : ZERO),
    vat: toBDT(vat),
    total: toBDT(total),
    perUnit: toBDT(perUnit),
  };
}

export function minBalance(caseId: string): number {
  const kase = getCase(caseId);
  if (!kase) throw new Error(`Case ${caseId} not found`);
  const rows = replay(kase);
  return Math.min(...rows.map((r) => r.balance));
}

export { cases };
