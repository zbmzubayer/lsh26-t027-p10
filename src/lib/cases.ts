import type { Case } from "@/lib/types";
import { publicDataSchema } from "@/validations/cases.validation";
import data from "../../data/public.json";

export const rawData = publicDataSchema.parse(data);
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
