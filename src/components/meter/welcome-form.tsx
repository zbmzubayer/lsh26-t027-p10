"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createHouseholdAction, importHistoryAction } from "@/actions/meter";
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
import { Textarea } from "@/components/ui/textarea";

function formatFirstOfMonth() {
  const d = new Date();
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}-01`;
}

export function WelcomeForm() {
  const router = useRouter();
  const [step, setStep] = useState<"create" | "import">("create");
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<{
    readings: number;
    recharges: number;
  } | null>(null);

  if (step === "import" && householdId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Import your history</CardTitle>
          <CardDescription>
            Paste rows as <code>YYYY-MM-DD, value</code>. One row per line.
            Leave a section empty if you have nothing to import.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={async (formData) => {
              setError(null);
              const result = await importHistoryAction({
                householdId,
                readingsText: (formData.get("readings") as string) || "",
                rechargesText: (formData.get("recharges") as string) || "",
              });
              if (!result.ok) {
                setError(result.error);
                return;
              }
              setImportResult({
                readings: result.readings,
                recharges: result.recharges,
              });
            }}
            className="grid gap-4"
          >
            <div className="grid gap-2">
              <Label htmlFor="readings">Daily readings (date, units)</Label>
              <Textarea
                id="readings"
                name="readings"
                rows={8}
                placeholder={`2026-01-01, 12\n2026-01-02, 15`}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="recharges">Recharges (date, amount)</Label>
              <Textarea
                id="recharges"
                name="recharges"
                rows={6}
                placeholder={`2026-01-05, 1000\n2026-01-12, 500`}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {importResult && (
              <p className="text-sm text-muted-foreground">
                Imported {importResult.readings} readings and{" "}
                {importResult.recharges} recharges.
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/?household=${householdId}`)}
              >
                Skip
              </Button>
              <Button type="submit">Import</Button>
            </div>
            {importResult && (
              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={() => router.push(`/?household=${householdId}`)}
                >
                  Go to dashboard
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your household</CardTitle>
        <CardDescription>
          Add your meter. The start date must be the 1st of the month.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          action={async (formData) => {
            setError(null);
            const result = await createHouseholdAction({
              name: formData.get("name") as string,
              meterNumber: (formData.get("meterNumber") as string) || undefined,
              openingBalance: formData.get("openingBalance") as string,
              startDate: formData.get("startDate") as string,
              usualDailyUnits:
                (formData.get("usualDailyUnits") as string) || null,
            });
            if (!result.ok) {
              setError(result.error);
              return;
            }
            setHouseholdId(result.id);
            setStep("import");
          }}
          className="grid gap-4"
        >
          <div className="grid gap-2">
            <Label htmlFor="name">Household name</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. Rahman family"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="meterNumber">Meter number (optional)</Label>
            <Input id="meterNumber" name="meterNumber" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="startDate">Start date (1st of month)</Label>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              defaultValue={formatFirstOfMonth()}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="openingBalance">Opening balance (৳)</Label>
            <Input
              id="openingBalance"
              name="openingBalance"
              type="number"
              step="0.01"
              min="0"
              defaultValue="0"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="usualDailyUnits">
              Usual daily units (optional)
            </Label>
            <Input
              id="usualDailyUnits"
              name="usualDailyUnits"
              type="number"
              step="0.1"
              min="0"
              placeholder="Leave blank to auto-calculate"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end">
            <Button type="submit">Create and continue</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
