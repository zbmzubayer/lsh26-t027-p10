import { z } from "zod";

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

export const publicDataSchema = z.object({
  schema_version: z.string(),
  problem_id: z.string(),
  cases: z.array(caseSchema),
});

export type PublicData = z.infer<typeof publicDataSchema>;
export type PublicCase = PublicData["cases"][number];
