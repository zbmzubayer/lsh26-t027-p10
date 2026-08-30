import {
  AddReadingDialog,
  AddRechargeDialog,
  CreateHouseholdDialog,
} from "@/components/meter/meter-actions";

export function ActionBar({ householdId }: { householdId: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      <AddReadingDialog householdId={householdId} />
      <AddRechargeDialog householdId={householdId} />
      <CreateHouseholdDialog />
    </div>
  );
}
