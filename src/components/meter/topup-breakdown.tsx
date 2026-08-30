import { TrendingUp, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatBDT } from "@/lib/money";
import type { TopUpResult } from "@/lib/types";

export function TopUpBreakdown({ result }: { result: TopUpResult }) {
  const rows = [
    {
      label: "Energy at ৳4.63",
      value: result.base,
      color: "bg-emerald-500",
    },
    {
      label: "Higher-band premium",
      value: result.premium,
      color: "bg-amber-500",
    },
    {
      label: "Fixed charges",
      value: result.fixed,
      color: "bg-blue-500",
    },
    {
      label: "VAT at 5%",
      value: result.vat,
      color: "bg-violet-500",
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="grid divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            <div className="p-6">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Wallet className="h-4 w-4" />
                Total for {result.units.toLocaleString("en-BD")} units
              </div>
              <p className="mt-2 text-4xl font-bold tracking-tight">
                {formatBDT(result.total)}
              </p>
            </div>
            <div className="bg-primary/5 p-6 dark:bg-primary/10">
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <TrendingUp className="h-4 w-4" />
                Recharge today
              </div>
              <p className="mt-2 text-4xl font-bold tracking-tight text-primary">
                {formatBDT(result.required)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {rows.map((row) => {
          const percentage =
            result.total > 0 ? (row.value / result.total) * 100 : 0;
          return (
            <Card key={row.label} className="transition-shadow hover:shadow-md">
              <CardContent className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{row.label}</p>
                  <span className="text-xs font-medium text-muted-foreground">
                    {percentage.toFixed(0)}%
                  </span>
                </div>
                <p className="mb-3 text-2xl font-bold">
                  {formatBDT(row.value)}
                </p>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full ${row.color} transition-all`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {result.premium > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
          <p className="font-medium leading-relaxed">
            {formatBDT(result.premium)} of this top-up exists only because the
            month climbs into the upper bands.
          </p>
        </div>
      )}
    </div>
  );
}
