# P10 — Prepaid Meter Recharge Advisor

A Next.js app that replays a prepaid electricity meter against its real tariff and shows a household where the money went, when it will run out, and what a top-up is actually buying.

## The tariff

Cumulative units consumed in the **calendar month**:

| Units in the month | Rate ৳ |
| --- | ---: |
| 1 – 75 | 4.63 |
| 76 – 200 | 5.26 |
| 201 – 300 | 5.63 |
| 301 – 400 | 5.83 |
| 401 – 600 | 9.30 |
| 601 and above | 10.70 |

Plus a **৳42** demand charge and **৳40** meter rent, taken once on the **first recharge of each calendar month**. **5% VAT** is applied to the energy amount.

A household that never leaves the first band pays ৳4.86 a unit with VAT. One in the top band pays ৳11.24 — a **2.31×** difference. That invisible jump is what the app exists to show.

## Data contract

Cases live in `data/public.json`. Each case has consecutive daily readings starting on the 1st of a month, recharges, today's date, the household's usual daily use, a target date, and a comparison block.

```ts
type Case = {
  case_id: string
  opening_balance_bdt: string      // balance BEFORE the first day
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

Verified on the public dataset:

- **25 households**
- **5,208 days** replayed (181–243 days per case)
- **11–23 recharges** per case
- **usual_daily_units:** 10–23
- **monthly consumption:** 106–829 units
- all comparison blocks currently use `source: "readings"`

## The day loop

One loop produces every number in the app. The order inside a day is fixed by the public data: replaying all 25 cases with this order keeps every balance positive, with the lowest minimum at **৳77.11 (PUB-19)**.

```
for each day, in date order:
  1. if the date is the 1st of a month: month_units = 0
  2. if a recharge falls on this date:
       balance += amount
       if it is the first recharge of this calendar month:
           balance -= 82        // 42 demand charge + 40 meter rent
  3. energy = cost of today's units, split across bands,
              starting from month_units
  4. balance -= energy * 1.05   // 5% VAT
  5. month_units += units
```

Return one row per day carrying date, units, band split, energy, VAT, recharge, fixed charge, closing balance, month-to-date units, and the band the day ended in.

Money is `decimal.js` from parse to format. Rates carry two decimals, VAT adds a third, and float drift over 243 days produces visible errors. Round to two places for display only — never inside the loop.

## The family's first question

> Given today's balance and usual daily use, when does the money run out?

Use the closing balance and month-to-date units from the replay, then project forward day by day at `usual_daily_units`, resetting the slab counter on each 1st.

For **PUB-01** on 30 June 2026: covered through **19 July**, runs out on **20 July 2026** — 20 days from a balance of ৳2,080.97 at 19 units a day.

## The family's second question

> To last until a chosen date, how much must be recharged today — and what is that money buying?

```
units   = usual_daily_units * days(today -> target_date)
energy  = cost of those units, continuing this month's counter and resetting on each 1st
fixed   = 82 if today's recharge would be this month's first, else 0
vat     = energy * 0.05
base    = units * 4.63
premium = energy - base
total   = base + premium + fixed + vat
required = max(0, total - balance)
```

For **PUB-01** from 30 June to 13 August at 19 units a day:

| Component | ৳ |
| --- | ---: |
| Energy at ৳4.63 | 3,870.68 |
| Higher-band premium | 1,307.13 |
| Fixed charges | 0.00 |
| VAT at 5% | 258.89 |
| Total for 836 units | 5,436.70 |
| less current balance | −2,080.97 |
| **Recharge today** | **3,355.73** |

Fixed charges are ৳0 because June already had a recharge, so today's top-up is not the month's first. Later months in the projection add no fixed charges either — fixed charges attach to a month's first *recharge*, and no further recharge happens in the projection.

## The habit comparison

Two habits run on the **same daily consumption** across the same three months.

- **Low balance:** at the start of any day whose balance is below `low_threshold_bdt`, recharge `low_amount_bdt`.
- **Monthly:** recharge `monthly_amount_bdt` on the 1st of each month.

Because consumption and the calendar-month slab counter are identical, energy and VAT are equal to the paisa. The only possible difference is the number of months that contain a first recharge, at ৳82 each.

On the public cases, **22 of 25 tie at exactly zero difference**. PUB-02, PUB-06, and PUB-24 each favour the low-balance habit by exactly ৳82 — for example, PUB-24 skips July entirely under the low-balance habit, saving one month of fixed charges.

## Screens

| Route | Purpose |
| --- | --- |
| `/` | Balance history line chart, recharge markers, month boundaries, band ribbon, today's figures |
| `/advisor` | Run-out date, target-date picker, four-part top-up breakdown |
| `/habits` | Side-by-side habit costs, recharge schedules, plain-language verdict |
| `/bill/[month]` | One month's bill: energy, demand, rent, VAT, total, effective per-unit cost |
| `/settings` | Household defaults, habit thresholds, delete household |
| `/welcome` | Onboarding: create household and import history |

## Engine API

```ts
energyFor(monthUnitsSoFar, units)  → { total, parts: BandPart[] }
replay(kase)                       → DayRow[]
runsOut(kase)                      → { coveredThrough, runsOutOn, days }
topUpFor(kase, targetDate)         → { base, premium, fixed, vat, total, required }
compareHabits(kase)                → { low, monthly, difference, explanation }
monthlyBill(kase, "2026-05")       → { units, energy, demand, rent, vat, total, perUnit }
```

All money handling uses `decimal.js` from parse to format. VAT at 5% of an exact-paisa energy figure is not always a whole paisa. Round to two places for display only — never inside the loop.

## Layout

```
p10-meter/
  app/
    page.tsx                  // balance chart + today's figures
    advisor/page.tsx          // run-out date + top-up breakdown
    habits/page.tsx           // the comparison
    bill/[month]/page.tsx     // one month, four parts
    settings/page.tsx         // defaults and thresholds
    welcome/page.tsx          // onboarding + history import
    api/run/route.ts
  lib/
    tariff.ts                 // bands, VAT, fixed charges — the only place rates appear
    engine.ts                 // pure; Decimal in, Decimal out
    money.ts                  // decimal.js wrapper; format only at the edge
    households.ts             // DB access + Case adapter
    auth.ts                   // sessions, password hashing
  src/proxy.ts                // route protection
  data/public.json
  prisma/seed.ts
  __tests__/engine.test.ts
  __tests__/adapter.test.ts
```

## Verified reference values

All figures computed from `data/public.json` on 30 August 2026.

| Metric | Value |
| --- | --- |
| Households | 25 |
| Days replayed | 5,208 |
| Lowest balance | ৳77.11 (PUB-19) |
| Negative balances | 0 |
| Top band vs first band | 2.31× |

## Tech stack

- [Next.js](https://nextjs.org) 16 (App Router)
- [React](https://react.dev) 19
- [TypeScript](https://www.typescript.org)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com) components
- [decimal.js](https://github.com/MikeMcl/decimal.js) for exact money arithmetic
- [Prisma](https://prisma.io) 7 + PostgreSQL
- [jose](https://github.com/panva/jose) + [argon2](https://github.com/ranisalt/node-argon2) for sessions
- [Biome](https://biomejs.dev) for linting and formatting

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set environment variables in `.env` (see `.env.example`):

   - `DATABASE_URL` — PostgreSQL connection string
   - `AUTH_SECRET` — at least 32 characters

3. Push the schema and seed the demo dataset:

   ```bash
   npm run db:push
   npm run db:seed
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000), register an account, and sign in.

## Authentication

All routes except `/login` and `/register` are protected by `src/proxy.ts`. Sessions are signed JWTs stored in an HTTP-only cookie. Each household belongs to the user who created it; the seeded demo households are visible to any signed-in user as read-only examples.

## Available scripts

- `npm run dev` — start the development server
- `npm run build` — create a production build
- `npm run start` — start the production server
- `npm run lint` — run Biome linter
- `npm run format` — format code with Biome
- `npm run db:seed` — load `data/public.json` into Postgres

## What loses points

1. **Resetting the slab counter on a recharge** — it resets on the 1st of the calendar month.
2. **Inventing a slab saving in the habit comparison** — identical consumption produces identical energy and VAT.
3. **Reporting deposits as cost** — cost is what the meter consumes, not what was deposited.
4. **Refusing to report a tie** — 22 of 25 cases tie.
5. **Dropping the month-to-date total in projections** — carry it forward from the replay.
6. **Charging ৳82 every month regardless** — fixed charges attach only to a month's first recharge.
7. **Using floats for money** — use `decimal.js` throughout the engine.
