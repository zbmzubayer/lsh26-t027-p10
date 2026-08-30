export type DayReading = {
  date: string;
  units: number;
};

export type Recharge = {
  date: string;
  amount_bdt: string;
};

export type Comparison = {
  months: [string, string, string];
  source: "readings" | "daily_units";
  daily_units: number | null;
  opening_balance_bdt: string;
  low_threshold_bdt: string;
  low_amount_bdt: string;
  monthly_amount_bdt: string;
};

export type Case = {
  case_id: string;
  opening_balance_bdt: string;
  days: DayReading[];
  recharges: Recharge[];
  today: string;
  usual_daily_units: number;
  target_date: string;
  comparison: Comparison;
};

export type BandPart = {
  from: number;
  to: number;
  rate: number;
  units: number;
  cost: number;
};

export type DayRow = {
  date: string;
  units: number;
  energy: number;
  vat: number;
  deduction: number;
  recharge: number;
  fixed: number;
  balance: number;
  monthUnits: number;
  band: number;
  parts: BandPart[];
};

export type RunsOutResult = {
  coveredThrough: string;
  runsOutOn: string;
  days: number;
};

export type TopUpResult = {
  units: number;
  base: number;
  premium: number;
  fixed: number;
  vat: number;
  total: number;
  required: number;
};

export type HabitResult = {
  cost: number;
  fixedMonths: number;
  rechargeDates: string[];
};

export type HabitComparison = {
  low: HabitResult;
  monthly: HabitResult;
  difference: number;
  explanation: string;
};

export type MonthlyBill = {
  month: string;
  units: number;
  energy: number;
  demand: number;
  rent: number;
  vat: number;
  total: number;
  perUnit: number;
};
