import { ArrowRight, BadgeCheck, Calendar, Scale, Wallet } from "lucide-react";
import { notFound } from "next/navigation";
import { ActionBar } from "@/components/meter/action-bar";
import { PageHeader } from "@/components/meter/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { requireAuth } from "@/lib/auth";
import { compareHabits } from "@/lib/engine";
import {
  caseFromHousehold,
  getHouseholdById,
  listHouseholds,
} from "@/lib/households";
import { formatBDT } from "@/lib/money";

export default async function HabitsPage({
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
  const result = compareHabits(kase);
  const maxCost = Math.max(result.low.cost, result.monthly.cost);

  const householdOptions = households.map((h) => ({
    id: h.id,
    name: h.name,
    usualDailyUnits: h.usualDailyUnits ? Number(h.usualDailyUnits) : null,
  }));

  return (
    <div className="container py-6 sm:py-8">
      <PageHeader
        title="Habit comparison"
        description={`Two habits, identical consumption for ${household.name}`}
        householdId={householdId}
        households={householdOptions}
      >
        <ActionBar householdId={householdId} />
      </PageHeader>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="gap-1">
          <Scale className="h-3 w-3" />
          Same daily units
        </Badge>
        <Badge variant="secondary" className="gap-1">
          <BadgeCheck className="h-3 w-3" />
          Same calendar-month slab counter
        </Badge>
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <Card className="relative overflow-hidden transition-shadow hover:shadow-md">
          <div className="absolute left-0 top-0 h-full w-1 bg-emerald-500" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-emerald-500" />
              Low-balance habit
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Below {formatBDT(Number(kase.comparison.low_threshold_bdt))} →
              recharge {formatBDT(Number(kase.comparison.low_amount_bdt))}
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <div className="mb-2 flex items-end justify-between">
                <p className="text-sm text-muted-foreground">Cost</p>
                <p className="text-3xl font-bold">
                  {formatBDT(result.low.cost)}
                </p>
              </div>
              <Progress
                value={maxCost > 0 ? (result.low.cost / maxCost) * 100 : 0}
                className="h-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">
                  Fixed-charge months
                </p>
                <p className="text-xl font-semibold">
                  {result.low.fixedMonths}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Recharges</p>
                <p className="text-xl font-semibold">
                  {result.low.rechargeDates.length}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Recharge dates</p>
              <p className="mt-1 text-sm leading-relaxed">
                {result.low.rechargeDates.join(", ") || "None"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden transition-shadow hover:shadow-md">
          <div className="absolute left-0 top-0 h-full w-1 bg-blue-500" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              Monthly habit
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Recharge {formatBDT(Number(kase.comparison.monthly_amount_bdt))}{" "}
              on the 1st of each month
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <div className="mb-2 flex items-end justify-between">
                <p className="text-sm text-muted-foreground">Cost</p>
                <p className="text-3xl font-bold">
                  {formatBDT(result.monthly.cost)}
                </p>
              </div>
              <Progress
                value={maxCost > 0 ? (result.monthly.cost / maxCost) * 100 : 0}
                className="h-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">
                  Fixed-charge months
                </p>
                <p className="text-xl font-semibold">
                  {result.monthly.fixedMonths}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Recharges</p>
                <p className="text-xl font-semibold">
                  {result.monthly.rechargeDates.length}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Recharge dates</p>
              <p className="mt-1 text-sm leading-relaxed">
                {result.monthly.rechargeDates.join(", ")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card
        className={`overflow-hidden ${
          result.difference === 0
            ? "bg-muted/50"
            : result.difference > 0
              ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20"
              : "border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20"
        }`}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5" />
            Verdict
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-medium">
            {result.difference === 0
              ? "These habits cost exactly the same."
              : result.difference > 0
                ? `Low-balance habit saves ${formatBDT(result.difference)}.`
                : `Monthly habit saves ${formatBDT(Math.abs(result.difference))}.`}
          </p>
          <p className="mt-2 text-muted-foreground">{result.explanation}</p>
        </CardContent>
      </Card>
    </div>
  );
}
