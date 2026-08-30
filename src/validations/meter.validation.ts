import { z } from "zod";

export function decimalString(message?: string) {
  return z.string().refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0, {
    message: message ?? "Must be a valid non-negative number",
  });
}

export const createHouseholdSchema = z.object({
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

export type CreateHouseholdDto = z.infer<typeof createHouseholdSchema>;

export const addReadingSchema = z.object({
  householdId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
  units: z.string().refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0, {
    message: "Units must be a non-negative number",
  }),
});

export type AddReadingDto = z.infer<typeof addReadingSchema>;

export const addRechargeSchema = z.object({
  householdId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
  amount: decimalString("Amount must be a number"),
  note: z.string().optional(),
});

export type AddRechargeDto = z.infer<typeof addRechargeSchema>;

export const updateSettingsSchema = z.object({
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

export type UpdateSettingsDto = z.infer<typeof updateSettingsSchema>;

export const deleteHouseholdSchema = z.object({
  householdId: z.string().min(1),
});

export type DeleteHouseholdDto = z.infer<typeof deleteHouseholdSchema>;

export const importHistorySchema = z.object({
  householdId: z.string().min(1),
  readingsText: z.string(),
  rechargesText: z.string(),
});

export type ImportHistoryDto = z.infer<typeof importHistorySchema>;
