import { Activity } from "lucide-react";
import { notFound } from "next/navigation";
import { ActionBar } from "@/components/meter/action-bar";
import { BalanceChart } from "@/components/meter/balance-chart";
import { BandRibbon } from "@/components/meter/band-ribbon";
import { PageHeader } from "@/components/meter/page-header";
import { SummaryCards } from "@/components/meter/summary-cards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAuth } from "@/lib/auth";
import { replay } from "@/lib/engine";
import {
  caseFromHousehold,
  getHouseholdById,
  listHouseholds,
} from "@/lib/households";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ household?: string }>;
}) {
  const session = await requireAuth();
  const params = await searchParams;
  const households = await listHouseholds(session.userId);

  if (households.length === 0) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-semibold">No households yet</h1>
        <p className="mt-2 text-muted-foreground">
          <a href="/welcome" className="text-primary hover:underline">
            Create your first household
          </a>{" "}
          or seed demo data with{" "}
          <code className="text-sm">npm run db:seed</code>.
        </p>
      </div>
    );
  }

  const householdId = params.household ?? households[0].id;
  const household = await getHouseholdById(householdId, session.userId);
  if (!household) notFound();

  const kase = caseFromHousehold(household);
  const rows = replay(kase);
  const todayRow =
    rows.find((r) => r.date === kase.today) ?? rows[rows.length - 1];

  const householdOptions = households.map((h) => ({
    id: h.id,
    name: h.name,
    usualDailyUnits: h.usualDailyUnits ? Number(h.usualDailyUnits) : null,
  }));

  return (
    <div className="container py-6 sm:py-8">
      <PageHeader
        title="Balance history"
        description={`Where the money went for ${household.name} — ${kase.days.length} days of readings from ${kase.days[0].date} to ${kase.days[kase.days.length - 1].date}`}
        householdId={householdId}
        households={householdOptions}
      >
        <ActionBar householdId={householdId} />
      </PageHeader>

      <div className="mb-6 sm:mb-8">
        <SummaryCards
          balance={todayRow.balance}
          monthUnits={todayRow.monthUnits}
        />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <CardTitle>Balance over time</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Vertical dashed lines mark month boundaries. Dots show recharges.
          </p>
        </CardHeader>
        <CardContent className="space-y-6 pb-6">
          <BalanceChart rows={rows} />
          <BandRibbon rows={rows} />
        </CardContent>
      </Card>
    </div>
  );
}
