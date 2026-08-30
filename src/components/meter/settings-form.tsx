"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteHouseholdAction, updateSettingsAction } from "@/actions/meter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SettingsForm({
  household,
}: {
  household: {
    id: string;
    name: string;
    usualDailyUnits: number | null;
    lowThresholdBdt: number;
    lowAmountBdt: number;
    monthlyAmountBdt: number;
  };
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Projection and comparison defaults</CardTitle>
          <CardDescription>
            These values drive the run-out projection and the habit comparison.
            Leave &quot;usual daily units&quot; blank to use the 28-day average.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={async (formData) => {
              setError(null);
              const usual = formData.get("usualDailyUnits") as string;
              const result = await updateSettingsAction({
                householdId: household.id,
                usualDailyUnits: usual.trim() === "" ? null : usual,
                lowThresholdBdt: formData.get("lowThresholdBdt") as string,
                lowAmountBdt: formData.get("lowAmountBdt") as string,
                monthlyAmountBdt: formData.get("monthlyAmountBdt") as string,
              });
              if (!result.ok) {
                setError(result.error);
              }
            }}
            className="grid gap-4"
          >
            <div className="grid gap-2">
              <Label htmlFor="usualDailyUnits">Usual daily units</Label>
              <Input
                id="usualDailyUnits"
                name="usualDailyUnits"
                type="number"
                step="0.1"
                min="0"
                defaultValue={household.usualDailyUnits?.toString() ?? ""}
                placeholder="Auto-calculate from last 28 days"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="lowThresholdBdt">Low-balance threshold (৳)</Label>
              <Input
                id="lowThresholdBdt"
                name="lowThresholdBdt"
                type="number"
                step="0.01"
                min="0"
                defaultValue={household.lowThresholdBdt.toString()}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="lowAmountBdt">Low-balance recharge (৳)</Label>
              <Input
                id="lowAmountBdt"
                name="lowAmountBdt"
                type="number"
                step="0.01"
                min="0"
                defaultValue={household.lowAmountBdt.toString()}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="monthlyAmountBdt">Monthly recharge (৳)</Label>
              <Input
                id="monthlyAmountBdt"
                name="monthlyAmountBdt"
                type="number"
                step="0.01"
                min="0"
                defaultValue={household.monthlyAmountBdt.toString()}
                required
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex justify-end">
              <Button type="submit">Save settings</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger zone</CardTitle>
          <CardDescription>
            Deleting a household removes all its readings and recharges. This
            cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={async () => {
              setDeleteError(null);
              if (!confirm("Delete this household and all its data?")) return;
              const result = await deleteHouseholdAction({
                householdId: household.id,
              });
              if (result.ok) {
                router.push("/");
              } else {
                setDeleteError(result.error);
              }
            }}
          >
            {deleteError && (
              <p className="mb-3 text-sm text-destructive">{deleteError}</p>
            )}
            <Button type="submit" variant="destructive">
              Delete {household.name}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
