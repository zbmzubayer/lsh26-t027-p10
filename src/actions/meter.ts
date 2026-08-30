"use server";

import Decimal from "decimal.js";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { isFirstDayOfMonth, parseDate } from "@/lib/date-utc";
import prisma from "@/lib/prisma";

export type ActionResult = { ok: true } | { ok: false; error: string };

export type CreateHouseholdResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

async function requireAuthForAction() {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

async function requireHouseholdAccess(householdId: string, userId: string) {
  const household = await prisma.household.findFirst({
    where: { id: householdId, OR: [{ userId }, { userId: null }] },
    select: { id: true, userId: true },
  });
  if (!household) {
    throw new Error("Household not found");
  }
  return household;
}

function decimalString(message?: string) {
  return z.string().refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0, {
    message: message ?? "Must be a valid non-negative number",
  });
}

const createHouseholdSchema = z.object({
  name: z.string().min(1, "Name is required"),
  meterNumber: z.string().optional(),
  openingBalance: decimalString("Opening balance must be a number"),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
  usualDailyUnits: z
    .union([z.string(), z.null()])
    .optional()
    .transform((v) => (v === "" || v === null || v === undefined ? null : v))
    .refine((v) => v === null || (!Number.isNaN(Number(v)) && Number(v) > 0), {
      message: "Usual daily units must be a positive number",
    }),
});

export async function createHouseholdAction(
  input: unknown,
): Promise<CreateHouseholdResult> {
  const parsed = createHouseholdSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const session = await requireAuthForAction();

  const { name, meterNumber, openingBalance, startDate, usualDailyUnits } =
    parsed.data;

  if (!isFirstDayOfMonth(startDate)) {
    return { ok: false, error: "Start date must be the 1st of the month" };
  }

  try {
    const created = await prisma.household.create({
      data: {
        name,
        meterNumber,
        openingBalance: new Decimal(openingBalance),
        startDate: parseDate(startDate),
        usualDailyUnits:
          usualDailyUnits === null ? null : new Decimal(usualDailyUnits),
        userId: session.userId,
      },
    });

    revalidatePath("/");
    revalidatePath("/advisor");
    revalidatePath("/habits");
    return { ok: true, id: created.id };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Failed to create household";
    return { ok: false, error: message };
  }
}

const addReadingSchema = z.object({
  householdId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
  units: z.string().refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0, {
    message: "Units must be a non-negative number",
  }),
});

export async function addReadingAction(input: unknown): Promise<ActionResult> {
  const parsed = addReadingSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const session = await requireAuthForAction();
  const { householdId, date, units } = parsed.data;

  try {
    await requireHouseholdAccess(householdId, session.userId);
    await prisma.dailyReading.upsert({
      where: { householdId_date: { householdId, date: parseDate(date) } },
      create: {
        householdId,
        date: parseDate(date),
        units: new Decimal(units),
      },
      update: { units: new Decimal(units) },
    });

    revalidatePath("/");
    revalidatePath("/advisor");
    revalidatePath("/habits");
    revalidatePath("/bill/[month]");
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to add reading";
    return { ok: false, error: message };
  }
}

const addRechargeSchema = z.object({
  householdId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
  amount: decimalString("Amount must be a number"),
  note: z.string().optional(),
});

export async function addRechargeAction(input: unknown): Promise<ActionResult> {
  const parsed = addRechargeSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const session = await requireAuthForAction();
  const { householdId, date, amount, note } = parsed.data;

  try {
    await requireHouseholdAccess(householdId, session.userId);
    await prisma.recharge.upsert({
      where: { householdId_date: { householdId, date: parseDate(date) } },
      create: {
        householdId,
        date: parseDate(date),
        amountBdt: new Decimal(amount),
        note,
      },
      update: { amountBdt: new Decimal(amount), note },
    });

    revalidatePath("/");
    revalidatePath("/advisor");
    revalidatePath("/habits");
    revalidatePath("/bill/[month]");
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to add recharge";
    return { ok: false, error: message };
  }
}

const updateSettingsSchema = z.object({
  householdId: z.string().min(1),
  usualDailyUnits: z
    .union([z.string(), z.null()])
    .optional()
    .transform((v) => (v === "" || v === null || v === undefined ? null : v))
    .refine((v) => v === null || (!Number.isNaN(Number(v)) && Number(v) > 0), {
      message: "Usual daily units must be a positive number",
    }),
  lowThresholdBdt: decimalString("Low threshold must be a number"),
  lowAmountBdt: decimalString("Low amount must be a number"),
  monthlyAmountBdt: decimalString("Monthly amount must be a number"),
});

export async function updateSettingsAction(
  input: unknown,
): Promise<ActionResult> {
  const parsed = updateSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const session = await requireAuthForAction();
  const {
    householdId,
    usualDailyUnits,
    lowThresholdBdt,
    lowAmountBdt,
    monthlyAmountBdt,
  } = parsed.data;

  try {
    await requireHouseholdAccess(householdId, session.userId);
    await prisma.household.update({
      where: { id: householdId },
      data: {
        usualDailyUnits:
          usualDailyUnits === null ? null : new Decimal(usualDailyUnits),
        lowThresholdBdt: new Decimal(lowThresholdBdt),
        lowAmountBdt: new Decimal(lowAmountBdt),
        monthlyAmountBdt: new Decimal(monthlyAmountBdt),
      },
    });

    revalidatePath("/");
    revalidatePath("/advisor");
    revalidatePath("/habits");
    return { ok: true };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Failed to update settings";
    return { ok: false, error: message };
  }
}

const deleteHouseholdSchema = z.object({
  householdId: z.string().min(1),
});

export async function deleteHouseholdAction(
  input: unknown,
): Promise<ActionResult> {
  const parsed = deleteHouseholdSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const session = await requireAuthForAction();

  try {
    await requireHouseholdAccess(parsed.data.householdId, session.userId);
    await prisma.household.delete({ where: { id: parsed.data.householdId } });

    revalidatePath("/");
    revalidatePath("/advisor");
    revalidatePath("/habits");
    return { ok: true };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Failed to delete household";
    return { ok: false, error: message };
  }
}

const importHistorySchema = z.object({
  householdId: z.string().min(1),
  readingsText: z.string(),
  rechargesText: z.string(),
});

function parseHistoryLines(
  text: string,
  _kind: "units" | "amount",
): { date: string; value: Decimal }[] {
  const rows: { date: string; value: Decimal }[] = [];
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    const parts = line.split(",").map((p) => p.trim());
    if (parts.length < 2) continue;
    const [dateStr, valueStr] = parts;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) continue;
    const value = Number(valueStr);
    if (Number.isNaN(value) || value < 0) continue;
    rows.push({ date: dateStr, value: new Decimal(value) });
  }
  return rows;
}

export async function importHistoryAction(
  input: unknown,
): Promise<ActionResult & { readings: number; recharges: number }> {
  const parsed = importHistorySchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0].message,
      readings: 0,
      recharges: 0,
    };
  }

  const session = await requireAuthForAction();
  const { householdId, readingsText, rechargesText } = parsed.data;

  try {
    await requireHouseholdAccess(householdId, session.userId);
    const readings = parseHistoryLines(readingsText, "units");
    const recharges = parseHistoryLines(rechargesText, "amount");

    for (const { date, value } of readings) {
      await prisma.dailyReading.upsert({
        where: { householdId_date: { householdId, date: parseDate(date) } },
        create: { householdId, date: parseDate(date), units: value },
        update: { units: value },
      });
    }

    for (const { date, value } of recharges) {
      await prisma.recharge.upsert({
        where: { householdId_date: { householdId, date: parseDate(date) } },
        create: {
          householdId,
          date: parseDate(date),
          amountBdt: value,
        },
        update: { amountBdt: value },
      });
    }

    revalidatePath("/");
    revalidatePath("/advisor");
    revalidatePath("/habits");
    revalidatePath("/bill/[month]");

    return { ok: true, readings: readings.length, recharges: recharges.length };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to import history";
    return { ok: false, error: message, readings: 0, recharges: 0 };
  }
}
