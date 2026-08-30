"use client";

import { CalendarDays } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Label } from "@/components/ui/label";

export function TargetDatePicker({
  defaultDate,
  minDate,
}: {
  defaultDate: string;
  minDate: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="target-date" className="text-xs text-muted-foreground">
        Target date
      </Label>
      <div className="relative">
        <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          id="target-date"
          type="date"
          defaultValue={defaultDate}
          min={minDate}
          className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring sm:w-[240px]"
          onChange={(e) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("target", e.target.value);
            router.push(`?${params.toString()}`);
          }}
        />
      </div>
    </div>
  );
}
