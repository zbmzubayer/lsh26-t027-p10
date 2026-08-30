import { AlertTriangle, Calendar, Clock, Target } from "lucide-react";
import { notFound } from "next/navigation";
import { ActionBar } from "@/components/meter/action-bar";
import { PageHeader } from "@/components/meter/page-header";
import { TargetDatePicker } from "@/components/meter/target-date-picker";
import { TopUpBreakdown } from "@/components/meter/topup-breakdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAuth } from "@/lib/auth";
import { runsOut, topUpFor } from "@/lib/engine";
import {
  caseFromHousehold,
  getHouseholdById,
  listHouseholds,
} from "@/lib/households";

export default async function AdvisorPage({
  searchParams,
}: {
  searchParams: Promise<{ household?: string; target?: string }>;
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
  const targetDate = params.target ?? kase.target_date;
  const runOut = runsOut(kase);
  const topUp = topUpFor(kase, targetDate);

  const householdOptions = households.map((h) => ({
    id: h.id,
    name: h.name,
    usualDailyUnits: h.usualDailyUnits ? Number(h.usualDailyUnits) : null,
  }));

  return (
    <div className="container py-6 sm:py-8">
      <PageHeader
        title="Recharge advisor"
        description={`When the money runs out and what a top-up buys for ${household.name}`}
        householdId={householdId}
        households={householdOptions}
      >
        <ActionBar householdId={householdId} />
      </PageHeader>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-red-500" />
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Covered through
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{runOut.coveredThrough}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Runs out on
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{runOut.runsOutOn}</p>
            <p className="text-xs text-muted-foreground">
              {runOut.days} days away
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Target date
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <TargetDatePicker defaultDate={targetDate} minDate={kase.today} />
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 flex items-center gap-2">
        <Target className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Top-up breakdown</h2>
      </div>

      <TopUpBreakdown result={topUp} />
    </div>
  );
}
