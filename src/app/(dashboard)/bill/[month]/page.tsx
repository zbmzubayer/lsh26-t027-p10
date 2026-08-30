import { Receipt, TrendingUp } from "lucide-react";
import { notFound } from "next/navigation";
import { ActionBar } from "@/components/meter/action-bar";
import { PageHeader } from "@/components/meter/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { requireAuth } from "@/lib/auth";
import { monthlyBill } from "@/lib/engine";
import {
  caseFromHousehold,
  getHouseholdById,
  listHouseholds,
} from "@/lib/households";
import { formatBDT } from "@/lib/money";

export default async function BillPage({
  params,
  searchParams,
}: {
  params: Promise<{ month: string }>;
  searchParams: Promise<{ household?: string }>;
}) {
  const session = await requireAuth();
  const { month } = await params;
  const paramsResolved = await searchParams;
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

  const householdId = paramsResolved.household ?? households[0].id;
  const household = await getHouseholdById(householdId, session.userId);
  if (!household) notFound();

  const kase = caseFromHousehold(household);
  const bill = monthlyBill(kase, month);

  const rows = [
    { label: "Energy", value: bill.energy },
    { label: "Demand charge", value: bill.demand },
    { label: "Meter rent", value: bill.rent },
    { label: "VAT at 5%", value: bill.vat },
  ];

  const householdOptions = households.map((h) => ({
    id: h.id,
    name: h.name,
    usualDailyUnits: h.usualDailyUnits ? Number(h.usualDailyUnits) : null,
  }));

  return (
    <div className="container py-6 sm:py-8">
      <PageHeader
        title={`${month} bill`}
        description={`What the meter consumed for ${household.name}`}
        householdId={householdId}
        households={householdOptions}
      >
        <ActionBar householdId={householdId} />
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              <CardTitle>Monthly consumption: {bill.units} units</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between py-2"
                >
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-medium">{formatBDT(row.value)}</span>
                </div>
              ))}
              <Separator />
              <div className="flex items-center justify-between py-2">
                <span className="text-lg font-semibold">Total consumed</span>
                <span className="text-2xl font-bold">
                  {formatBDT(bill.total)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 dark:bg-primary/10">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle>Effective rate</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold tracking-tight text-primary">
              {formatBDT(bill.perUnit)}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              per unit including all charges and VAT
            </p>
            <div className="mt-6 rounded-lg bg-background p-4">
              <p className="text-sm text-muted-foreground">
                Headline first-band rate
              </p>
              <p className="text-xl font-semibold">৳4.63</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
