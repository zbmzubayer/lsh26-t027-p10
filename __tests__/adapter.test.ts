import { describe, expect, it } from "vitest";
import { getCase } from "@/lib/cases";
import {
  compareHabits,
  monthlyBill,
  replay,
  runsOut,
  topUpFor,
} from "@/lib/engine";
import { caseFromHousehold, getHouseholdById } from "@/lib/households";

const TEST_USER_ID = "test-user";

async function seededCase(name: string) {
  const staticCase = getCase(name);
  if (!staticCase) throw new Error(`Missing ${name}`);

  const households = await import("@/lib/prisma").then((m) =>
    m.default.household.findMany({ where: { name } }),
  );
  if (households.length === 0) {
    throw new Error(`Household ${name} not seeded. Run npm run db:seed.`);
  }

  const household = await getHouseholdById(households[0].id, TEST_USER_ID);
  if (!household) throw new Error(`Household ${name} not found`);

  return { staticCase, dynamicCase: caseFromHousehold(household) };
}

describe("DB adapter parity", () => {
  it("PUB-01 matches the static case", async () => {
    const { staticCase, dynamicCase } = await seededCase("PUB-01");

    expect(dynamicCase.opening_balance_bdt).toBe(
      staticCase.opening_balance_bdt,
    );
    expect(dynamicCase.today).toBe(staticCase.today);
    expect(dynamicCase.usual_daily_units).toBe(staticCase.usual_daily_units);

    const staticRows = replay(staticCase);
    const dynamicRows = replay(dynamicCase);

    expect(dynamicRows.length).toBe(staticRows.length);

    const lastStatic = staticRows[staticRows.length - 1];
    const lastDynamic = dynamicRows[dynamicRows.length - 1];

    expect(lastDynamic.balance).toBeCloseTo(lastStatic.balance, 2);
    expect(lastDynamic.monthUnits).toBe(lastStatic.monthUnits);
    expect(lastDynamic.band).toBe(lastStatic.band);

    const staticRunsOut = runsOut(staticCase);
    const dynamicRunsOut = runsOut(dynamicCase);
    expect(dynamicRunsOut.runsOutOn).toBe(staticRunsOut.runsOutOn);
    expect(dynamicRunsOut.days).toBe(staticRunsOut.days);

    const staticTopUp = topUpFor(staticCase, staticCase.target_date);
    const dynamicTopUp = topUpFor(dynamicCase, staticCase.target_date);
    expect(dynamicTopUp.required).toBeCloseTo(staticTopUp.required, 2);
    expect(dynamicTopUp.premium).toBeCloseTo(staticTopUp.premium, 2);
    expect(dynamicTopUp.fixed).toBeCloseTo(staticTopUp.fixed, 2);

    const staticHabits = compareHabits(staticCase);
    const dynamicHabits = compareHabits(dynamicCase);
    expect(dynamicHabits.difference).toBeCloseTo(staticHabits.difference, 2);

    const staticBill = monthlyBill(staticCase, "2026-05");
    const dynamicBill = monthlyBill(dynamicCase, "2026-05");
    expect(dynamicBill.total).toBeCloseTo(staticBill.total, 2);
    expect(dynamicBill.perUnit).toBeCloseTo(staticBill.perUnit, 2);
  });

  it("PUB-19 minimum balance is ৳77.11", async () => {
    const { dynamicCase } = await seededCase("PUB-19");
    const rows = replay(dynamicCase);
    const min = Math.min(...rows.map((r) => r.balance));
    expect(min).toBeCloseTo(77.11, 2);
  });

  it("all seeded households stay positive", async () => {
    const prisma = await import("@/lib/prisma").then((m) => m.default);
    const seeded = await prisma.household.findMany({
      select: { id: true },
    });

    for (const { id } of seeded) {
      const household = await getHouseholdById(id, TEST_USER_ID);
      if (!household) continue;
      const rows = replay(caseFromHousehold(household));
      const min = Math.min(...rows.map((r) => r.balance));
      expect(min).toBeGreaterThan(0);
    }
  }, 20000);
});
