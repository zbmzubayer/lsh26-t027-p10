import { Spinner } from "@/components/ui/spinner";

export default function LoadingPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />

      <div className="flex flex-col items-center gap-6 text-center">
        <div className="relative">
          <div className="absolute inset-0 -z-10 animate-ping rounded-full bg-primary/20 opacity-50" />
          <div className="flex size-16 items-center justify-center rounded-2xl border bg-card shadow-lg">
            <Spinner className="size-7 text-primary" />
          </div>
        </div>

        <div>
          <h1 className="text-lg font-semibold text-foreground">
            Prepaid Meter Recharge Advisor
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Crunching the numbers…
          </p>
        </div>
      </div>
    </main>
  );
}
