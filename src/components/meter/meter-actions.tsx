"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import {
  addReadingAction,
  addRechargeAction,
  createHouseholdAction,
} from "@/actions/meter";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function formatToday() {
  const d = new Date();
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function AddReadingDialog({ householdId }: { householdId: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Reading
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add daily reading</DialogTitle>
          <DialogDescription>
            Enter the date and units consumed. Correcting an existing day will
            overwrite it.
          </DialogDescription>
        </DialogHeader>
        <form
          action={async (formData) => {
            setError(null);
            const result = await addReadingAction({
              householdId,
              date: formData.get("date") as string,
              units: formData.get("units") as string,
            });
            if (result.ok) {
              setOpen(false);
            } else {
              setError(result.error);
            }
          }}
          className="grid gap-4 py-4"
        >
          <div className="grid gap-2">
            <Label htmlFor="reading-date">Date</Label>
            <Input
              id="reading-date"
              name="date"
              type="date"
              defaultValue={formatToday()}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="reading-units">Units</Label>
            <Input
              id="reading-units"
              name="units"
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g. 19"
              required
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="submit">Save reading</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AddRechargeDialog({ householdId }: { householdId: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Recharge
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add recharge</DialogTitle>
          <DialogDescription>
            Record a top-up. Adding one for an existing date will overwrite it.
          </DialogDescription>
        </DialogHeader>
        <form
          action={async (formData) => {
            setError(null);
            const result = await addRechargeAction({
              householdId,
              date: formData.get("date") as string,
              amount: formData.get("amount") as string,
              note: (formData.get("note") as string) || undefined,
            });
            if (result.ok) {
              setOpen(false);
            } else {
              setError(result.error);
            }
          }}
          className="grid gap-4 py-4"
        >
          <div className="grid gap-2">
            <Label htmlFor="recharge-date">Date</Label>
            <Input
              id="recharge-date"
              name="date"
              type="date"
              defaultValue={formatToday()}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="recharge-amount">Amount (৳)</Label>
            <Input
              id="recharge-amount"
              name="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g. 5000"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="recharge-note">Note (optional)</Label>
            <Input
              id="recharge-note"
              name="note"
              placeholder="e.g. bKash receipt"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="submit">Save recharge</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CreateHouseholdDialog() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New household
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Create household</DialogTitle>
          <DialogDescription>
            Add a meter. The start date must be the 1st of a month so the slab
            counter resets cleanly.
          </DialogDescription>
        </DialogHeader>
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
            if (result.ok) {
              setOpen(false);
            } else {
              setError(result.error);
            }
          }}
          className="grid gap-4 py-4"
        >
          <div className="grid gap-2">
            <Label htmlFor="household-name">Name</Label>
            <Input
              id="household-name"
              name="name"
              placeholder="e.g. Rahman family"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="household-meter">Meter number (optional)</Label>
            <Input
              id="household-meter"
              name="meterNumber"
              placeholder="e.g. 123456789"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="household-start">Start date (must be 1st)</Label>
            <Input
              id="household-start"
              name="startDate"
              type="date"
              defaultValue={`${formatToday().slice(0, 7)}-01`}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="household-opening">Opening balance (৳)</Label>
            <Input
              id="household-opening"
              name="openingBalance"
              type="number"
              step="0.01"
              min="0"
              defaultValue="0"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="household-usual">
              Usual daily units (optional)
            </Label>
            <Input
              id="household-usual"
              name="usualDailyUnits"
              type="number"
              step="0.1"
              min="0"
              placeholder="Leave blank to auto-calculate"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="submit">Create household</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
