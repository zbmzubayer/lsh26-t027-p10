@AGENTS.md

# P10 — Prepaid Meter Recharge Advisor

When implementing features for this app, always follow the domain rules and scoring requirements in `README.md` and `AGENTS.md`.

Key reminders:

- The slab counter resets on the **1st of the calendar month**, not on a recharge.
- Fixed charges (৳82) are taken only on a month's **first recharge**; a month with no recharge pays neither.
- Use `decimal.js` for all money arithmetic inside the engine; format to two decimals only at the UI edge.
- Projections start from today's replayed **balance** and **month-to-date units**.
- The habit comparison runs on identical consumption; energy and VAT are equal, and the only difference is ৳82 per skipped month.
- 22 of 25 public cases tie — the UI must be able to say "equal" plainly.
- Test against the verified reference values in `__tests__/engine.test.ts`, especially PUB-19's minimum balance of ৳77.11.
