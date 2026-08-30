"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type HouseholdOption = {
  id: string;
  name: string;
  usualDailyUnits: number | null;
};

export function HouseholdSelector({
  currentId,
  households,
}: {
  currentId: string;
  households: HouseholdOption[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <div className="flex flex-col gap-1.5">
      <Label
        htmlFor="household-select"
        className="text-xs text-muted-foreground"
      >
        Household
      </Label>
      <Select
        value={currentId}
        onValueChange={(id) => {
          if (!id) return;
          const params = new URLSearchParams(searchParams.toString());
          params.set("household", id);
          router.push(`?${params.toString()}`);
        }}
      >
        <SelectTrigger id="household-select" className="w-[160px] sm:w-[220px]">
          <SelectValue placeholder="Select household" />
        </SelectTrigger>
        <SelectContent>
          {households.map((h) => (
            <SelectItem key={h.id} value={h.id}>
              {h.name} · {h.usualDailyUnits ?? "auto"} units/day
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
