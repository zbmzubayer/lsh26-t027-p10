import type { ReactNode } from "react";
import {
  type HouseholdOption,
  HouseholdSelector,
} from "@/components/meter/household-selector";

export function PageHeader({
  title,
  description,
  householdId,
  households,
  children,
}: {
  title: string;
  description: string;
  householdId: string;
  households: HouseholdOption[];
  children?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="max-w-xl text-muted-foreground">{description}</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        {children}
        <HouseholdSelector currentId={householdId} households={households} />
      </div>
    </div>
  );
}
