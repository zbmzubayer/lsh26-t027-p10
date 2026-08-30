<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# P10 — Prepaid Meter Recharge Advisor

This is a Next.js application that replays prepaid electricity meter history against a cumulative calendar-month tariff. All domain rules, exact figures, and scoring pitfalls are described below. Read them before writing code.

## Domain rules

### 1. The tariff is the only tariff

Rates are cumulative positions in the **calendar month**:

| Units in the month | Rate ৳ |
| --- | ---: |
| 1 – 75 | 4.63 |
| 76 – 200 | 5.26 |
| 201 – 300 | 5.63 |
| 301 – 400 | 5.83 |
| 401 – 600 | 9.30 |
| 601 and above | 10.70 |

- Demand charge: **৳42**
- Meter rent: **৳40**
- VAT: **5%** of energy

Fixed charges are taken **once per calendar month, on that month's first recharge**. A month with no recharge pays neither. Do not charge ৳82 automatically on the 1st.

### 2. The day loop is the source of truth

One loop produces every value in the app. The order inside a day matters and is fixed by the data.

```
for each day, in date order:
  1. if the date is the 1st of a month: month_units = 0
  2. if a recharge falls on this date:
       balance += amount
       if it is the first recharge of this calendar month:
           balance -= 82
  3. energy = cost of today's units, split across bands starting from month_units
  4. balance -= energy * 1.05     // VAT included
  5. month_units += units
```

The slab counter resets on the **1st of the month**, not on a recharge.

### 3. Money is exact

Use `decimal.js` from the moment a string is parsed until the moment it is formatted. Do not use `number` for money inside the engine. Round to two decimal places for display only — never inside the loop.

### 4. Projections carry the slab counter forward

`runsOut` and `topUpFor` must start from today's **closing balance** and **month-to-date units** as produced by the replay. Do not restart the slab counter at band one.

## Data contract

The canonical dataset is `data/public.json`.

```ts
type Case = {
  case_id: string
  opening_balance_bdt: string
  days: { date: string; units: number }[]
  recharges: { date: string; amount_bdt: string }[]
  today: string
  usual_daily_units: number
  target_date: string
  comparison: {
    months: [string, string, string]
    source: "readings" | "daily_units"
    daily_units: number | null
    opening_balance_bdt: string
    low_threshold_bdt: string
    low_amount_bdt: string
    monthly_amount_bdt: string
  }
}
```

Implement both `source: "readings"` and `source: "daily_units"`. The public cases all use readings; hidden cases may use `daily_units`.

## Required functionality

1. **Balance history** (`/`)
   - Line chart of closing balance across the whole case.
   - Markers on every recharge with amount on hover.
   - Month boundaries shaded.
   - Band ribbon under the line showing which band each day ended in.
   - Today's figures: balance, month-to-date units, current band, next-unit rate.

2. **Advisor** (`/advisor`)
   - Run-out projection in plain language: "Covered through 19 July. You run out on 20 July, 20 days away."
   - Target-date picker.
   - Four-part top-up breakdown that visibly adds up: base, premium, fixed, VAT.
   - The premium called out in words.

3. **Habit comparison** (`/habits`)
   - Low-balance habit vs monthly habit on identical consumption.
   - Recharge schedules listed side by side.
   - Month counts that produced the fixed-charge total.
   - A plain-language verdict that is comfortable saying "these are equal".

4. **Monthly bill** (`/bill/[month]`)
   - One month shown as energy, demand, rent, VAT, total, effective per-unit cost.

## Architecture notes

- Keep calculation logic pure and testable in `src/lib/engine.ts`.
- `src/lib/tariff.ts` is the only file that contains rates, VAT, and fixed charges.
- `src/lib/money.ts` wraps `decimal.js`; format only at the UI edge.
- Server components and route handlers may call `replay` and other engine functions directly.
- Match the existing shadcn/ui component conventions and Tailwind style.

## Engine API

```ts
energyFor(monthUnitsSoFar: number, units: number): { total: Decimal; parts: BandPart[] }
replay(kase: Case): DayRow[]
runsOut(kase: Case): { coveredThrough: string; runsOutOn: string; days: number }
topUpFor(kase: Case, targetDate: string): { base, premium, fixed, vat, total, required }
compareHabits(kase: Case): { low, monthly, difference, explanation }
monthlyBill(kase: Case, month: string): { units, energy, demand, rent, vat, total, perUnit }
```

## Testing

Replaying the public dataset must reproduce the verified reference values. Add these assertions to `__tests__/engine.test.ts`:

```ts
expect(minBalance("PUB-19")).toBeCloseTo(77.11, 2)
expect(cases.every(c => minBalance(c) > 0)).toBe(true)
```

Also test:
- PUB-01, 5 May 2026: energy ৳96.79, VAT ৳4.84, deducted ৳101.63, closing balance ৳2,297.76.
- PUB-01 run-out from 30 June: covered through 19 July, runs out 20 July.
- PUB-01 top-up to 13 August: required ৳3,355.73, premium ৳1,307.13, fixed ৳0.
- Habit comparison ties on 22 of 25 cases; PUB-02, PUB-06, PUB-24 differ by exactly ৳82 in favour of low balance.

## Scoring pitfalls

These are the most common ways to lose marks on P10:

1. **Resetting the slab counter on a recharge.** It resets on the 1st of the calendar month.
2. **Fabricating a slab saving in the comparison.** Identical consumption cannot produce an energy-rate saving. Energy and VAT are equal to the paisa.
3. **Reporting deposits as cost.** Cost is energy + VAT + applicable fixed charges, not the amount deposited.
4. **Refusing to report a tie.** 22 of 25 public cases tie.
5. **Dropping the month-to-date total in projections.** Start from today's `month_units`.
6. **Charging ৳82 every month.** Fixed charges attach only to a month's first recharge.
7. **Using floats for money.** Use `decimal.js` throughout the engine.

## Useful commands

- `npm run dev` — start the dev server.
- `npm run build` — verify the build passes before committing.
- `npm run lint` / `npm run format` — run Biome.
- `npm test` — run the engine test suite (add once configured).
