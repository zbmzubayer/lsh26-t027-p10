import "dotenv/config";
import Decimal from "decimal.js";
import { rawData } from "../src/lib/cases";
import { parseDate } from "../src/lib/date-utc";
import prisma from "../src/lib/prisma";

async function main() {
  for (const c of rawData.cases) {
    await prisma.household.deleteMany({
      where: { name: c.case_id },
    });

    const household = await prisma.household.create({
      data: {
        name: c.case_id,
        openingBalance: new Decimal(c.opening_balance_bdt),
        startDate: parseDate(c.days[0].date),
        usualDailyUnits: new Decimal(c.usual_daily_units),
        lowThresholdBdt: new Decimal(c.comparison.low_threshold_bdt),
        lowAmountBdt: new Decimal(c.comparison.low_amount_bdt),
        monthlyAmountBdt: new Decimal(c.comparison.monthly_amount_bdt),
      },
    });

    await prisma.dailyReading.createMany({
      data: c.days.map((d) => ({
        householdId: household.id,
        date: parseDate(d.date),
        units: new Decimal(d.units),
      })),
      skipDuplicates: true,
    });

    await prisma.recharge.createMany({
      data: c.recharges.map((r) => ({
        householdId: household.id,
        date: parseDate(r.date),
        amountBdt: new Decimal(r.amount_bdt),
      })),
      skipDuplicates: true,
    });

    console.log(`Seeded ${c.case_id} → ${household.id}`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
