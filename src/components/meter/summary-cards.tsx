import { BatteryCharging, Gauge, Layers, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatBDT } from "@/lib/money";
import { BANDS, bandIndexFor } from "@/lib/tariff";

const BAND_LABELS = [
  "1 – 75",
  "76 – 200",
  "201 – 300",
  "301 – 400",
  "401 – 600",
  "601+",
];

export function SummaryCards({
  balance,
  monthUnits,
}: {
  balance: number;
  monthUnits: number;
}) {
  const bandIndex = bandIndexFor(monthUnits);
  const currentBand = BANDS[bandIndex];
  const nextBand = BANDS[bandIndex + 1];
  const nextRate = nextBand ? nextBand.rate : currentBand.rate;

  const cards = [
    {
      label: "Balance today",
      value: formatBDT(balance),
      subtext: "Closing balance",
      icon: Wallet,
      accent: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      label: "Month-to-date units",
      value: monthUnits.toLocaleString("en-BD"),
      subtext: `${BAND_LABELS[bandIndex]} band`,
      icon: Gauge,
      accent: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      label: "Current band",
      value: `Band ${bandIndex + 1}`,
      subtext: BAND_LABELS[bandIndex],
      icon: Layers,
      accent: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-500/10",
      border: "border-violet-500/20",
    },
    {
      label: "Next unit costs",
      value: formatBDT(nextRate),
      subtext: "per unit incl. VAT",
      icon: BatteryCharging,
      accent: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.label}
            className={`overflow-hidden transition-shadow hover:shadow-md ${card.border}`}
          >
            <CardContent className="flex items-start justify-between p-5">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {card.label}
                </p>
                <p className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {card.value}
                </p>
                <p className="text-xs text-muted-foreground">{card.subtext}</p>
              </div>
              <div className={`rounded-xl ${card.bg} p-2.5`}>
                <Icon className={`h-5 w-5 ${card.accent}`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
