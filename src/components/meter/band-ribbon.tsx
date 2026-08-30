"use client";

import type { DayRow } from "@/lib/types";

const BANDS = [
  { label: "1 – 75", color: "bg-emerald-400", text: "text-emerald-600" },
  { label: "76 – 200", color: "bg-lime-400", text: "text-lime-600" },
  { label: "201 – 300", color: "bg-yellow-400", text: "text-yellow-600" },
  { label: "301 – 400", color: "bg-orange-400", text: "text-orange-600" },
  { label: "401 – 600", color: "bg-red-500", text: "text-red-600" },
  { label: "601+", color: "bg-purple-500", text: "text-purple-600" },
];

export function BandRibbon({ rows }: { rows: DayRow[] }) {
  if (rows.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex h-4 w-full overflow-hidden rounded-full ring-1 ring-border">
        {rows.map((row) => (
          <div
            key={row.date}
            className={`${BANDS[row.band]?.color ?? BANDS[BANDS.length - 1].color} flex-1`}
            title={`${row.date}: band ${row.band + 1}`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {BANDS.map((band, index) => (
          <div key={band.label} className="flex items-center gap-1.5">
            <div className={`h-2.5 w-2.5 rounded-full ${band.color}`} />
            <span className="text-xs text-muted-foreground">
              Band {index + 1} · {band.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
