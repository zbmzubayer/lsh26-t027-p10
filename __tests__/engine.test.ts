import { describe, expect, it } from "vitest";
import { cases, getCase } from "@/lib/cases";
import {
  compareHabits,
  minBalance,
  monthlyBill,
  replay,
  runsOut,
  topUpFor,
} from "@/lib/engine";

describe("engine", () => {
  it("replays all cases with positive balances", () => {
    for (const kase of cases) {
      const rows = replay(kase);
      const min = Math.min(...rows.map((r) => r.balance));
      expect(min).toBeGreaterThan(0);
    }
  });

  it("PUB-19 minimum balance is ৳77.11", () => {
    expect(minBalance("PUB-19")).toBeCloseTo(77.11, 2);
  });

  it("PUB-01 5 May 2026 splits bands correctly", () => {
    const kase = getCase("PUB-01");
    if (!kase) throw new Error("PUB-01 not found");
    const rows = replay(kase);
    const day = rows.find((r) => r.date === "2026-05-05");
    expect(day).toBeDefined();
    expect(day?.energy).toBeCloseTo(96.79, 2);
    expect(day?.vat).toBeCloseTo(4.84, 2);
    expect(day?.deduction).toBeCloseTo(101.63, 2);
    expect(day?.balance).toBeCloseTo(2297.76, 2);
  });

  it("PUB-01 run-out from 30 June", () => {
    const kase = getCase("PUB-01");
    if (!kase) throw new Error("PUB-01 not found");
    const result = runsOut(kase);
    expect(result.coveredThrough).toBe("2026-07-19");
    expect(result.runsOutOn).toBe("2026-07-20");
    expect(result.days).toBe(20);
  });

  it("PUB-01 top-up to 13 August", () => {
    const kase = getCase("PUB-01");
    if (!kase) throw new Error("PUB-01 not found");
    const result = topUpFor(kase, "2026-08-13");
    expect(result.required).toBeCloseTo(3355.73, 2);
    expect(result.premium).toBeCloseTo(1307.13, 2);
    expect(result.fixed).toBeCloseTo(0, 2);
  });

  it("PUB-01 habit comparison ties", () => {
    const kase = getCase("PUB-01");
    if (!kase) throw new Error("PUB-01 not found");
    const result = compareHabits(kase);
    expect(result.difference).toBeCloseTo(0, 2);
  });

  it("PUB-24 habit comparison favours low balance by ৳82", () => {
    const kase = getCase("PUB-24");
    if (!kase) throw new Error("PUB-24 not found");
    const result = compareHabits(kase);
    expect(result.difference).toBeCloseTo(82, 2);
    expect(result.low.fixedMonths).toBe(2);
    expect(result.monthly.fixedMonths).toBe(3);
  });

  it("PUB-01 May 2026 bill", () => {
    const kase = getCase("PUB-01");
    if (!kase) throw new Error("PUB-01 not found");
    const bill = monthlyBill(kase, "2026-05");
    expect(bill.units).toBe(673);
    expect(bill.energy).toBeCloseTo(4791.85, 2);
    expect(bill.demand).toBeCloseTo(42, 2);
    expect(bill.rent).toBeCloseTo(40, 2);
    expect(bill.vat).toBeCloseTo(239.59, 2);
    expect(bill.total).toBeCloseTo(5113.44, 2);
    expect(bill.perUnit).toBeCloseTo(7.6, 2);
  });
});
