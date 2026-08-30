import { z } from "zod";
import type { Case } from "@/lib/types";
import data from "../../data/public.json";

const caseSchema = z.object({
  case_id: z.string(),
  opening_balance_bdt: z.string(),
  days: z.array(
    z.object({
      date: z.string(),
      units: z.number(),
    }),
  ),
  recharges: z.array(
    z.object({
      date: z.string(),
      amount_bdt: z.string(),
    }),
  ),
  today: z.string(),
  usual_daily_units: z.number(),
  target_date: z.string(),
  comparison: z.object({
    months: z.tuple([z.string(), z.string(), z.string()]),
    source: z.enum(["readings", "daily_units"]),
    daily_units: z.number().nullable(),
    opening_balance_bdt: z.string(),
    low_threshold_bdt: z.string(),
    low_amount_bdt: z.string(),
    monthly_amount_bdt: z.string(),
  }),
});

const schema = z.object({
  schema_version: z.string(),
  problem_id: z.string(),
  cases: z.array(caseSchema),
});

export const rawData = schema.parse(data);
export const cases: Case[] = rawData.cases;

export function getCase(caseId: string): Case | undefined {
  return cases.find((c) => c.case_id === caseId);
}

export const defaultCaseId = "PUB-01";

export function getDefaultCase(): Case {
  const c = getCase(defaultCaseId);
  if (!c) throw new Error(`Default case ${defaultCaseId} not found`);
  return c;
}
