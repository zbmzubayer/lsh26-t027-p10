"use client";

import { format, parseISO } from "date-fns";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatBDT } from "@/lib/money";
import type { DayRow } from "@/lib/types";

export function BalanceChart({ rows }: { rows: DayRow[] }) {
  const data = rows.map((r) => ({
    date: r.date,
    balance: r.balance,
    recharge: r.recharge > 0 ? r.recharge : null,
    month: r.date.slice(0, 7),
    isFirstDay: r.date.endsWith("-01"),
  }));

  const monthBoundaries = data.filter((d) => d.isFirstDay).map((d) => d.date);

  const formatY = (value: number) => `৳${(value / 1000).toFixed(1)}k`;

  return (
    <div className="balance-chart h-[300px] w-full sm:h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="var(--border)"
          />
          <XAxis
            dataKey="date"
            tickFormatter={(date) => format(parseISO(date), "MMM d")}
            minTickGap={30}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            tickFormatter={formatY}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            cursor={{
              stroke: "var(--muted-foreground)",
              strokeDasharray: "4 4",
            }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length || typeof label !== "string")
                return null;
              const row = payload[0].payload as (typeof data)[number];
              return (
                <div className="rounded-xl border bg-background/95 p-3 shadow-lg backdrop-blur">
                  <p className="text-sm font-semibold">
                    {format(parseISO(label), "MMMM d, yyyy")}
                  </p>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Balance:{" "}
                      <span className="font-medium text-foreground">
                        {formatBDT(row.balance)}
                      </span>
                    </p>
                    {row.recharge ? (
                      <p className="text-sm text-emerald-600">
                        Recharge:{" "}
                        <span className="font-medium">
                          {formatBDT(row.recharge)}
                        </span>
                      </p>
                    ) : null}
                  </div>
                </div>
              );
            }}
          />
          {monthBoundaries.map((date) => (
            <ReferenceLine
              key={date}
              x={date}
              stroke="var(--muted-foreground)"
              strokeDasharray="4 4"
              opacity={0.4}
            />
          ))}
          <Area
            type="monotone"
            dataKey="balance"
            stroke="var(--primary)"
            fill="url(#balanceGradient)"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
          <Line
            type="monotone"
            dataKey="recharge"
            stroke="transparent"
            strokeWidth={0}
            dot={{
              r: 5,
              fill: "var(--chart-2)",
              strokeWidth: 2,
              stroke: "var(--background)",
            }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
