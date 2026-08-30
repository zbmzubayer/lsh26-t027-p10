import { notFound } from "next/navigation";
import { PageHeader } from "@/components/meter/page-header";
import { SettingsForm } from "@/components/meter/settings-form";
import { requireAuth } from "@/lib/auth";
import { getHouseholdById, listHouseholds } from "@/lib/households";

export default async function SettingsPage({
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

  const householdOptions = households.map((h) => ({
    id: h.id,
    name: h.name,
    usualDailyUnits: h.usualDailyUnits ? Number(h.usualDailyUnits) : null,
  }));

  return (
    <div className="container py-6 sm:py-8">
      <PageHeader
        title="Settings"
        description={`Defaults and thresholds for ${household.name}`}
        householdId={householdId}
        households={householdOptions}
      />

      <SettingsForm
        household={{
          id: household.id,
          name: household.name,
          usualDailyUnits: household.usualDailyUnits
            ? Number(household.usualDailyUnits)
            : null,
          lowThresholdBdt: Number(household.lowThresholdBdt),
          lowAmountBdt: Number(household.lowAmountBdt),
          monthlyAmountBdt: Number(household.monthlyAmountBdt),
        }}
      />
    </div>
  );
}
