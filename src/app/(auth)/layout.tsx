import { BarChart3, CalendarClock, Gauge, Zap } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-svh bg-background lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-primary-foreground/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-primary-foreground/5 via-transparent to-transparent" />

        <Link
          href="/"
          className="relative z-10 flex items-center gap-2 text-lg font-bold"
        >
          <Zap className="h-6 w-6 fill-primary-foreground" />
          <span>Prepaid Meter Recharge Advisor</span>
        </Link>

        <div className="relative z-10 max-w-sm">
          <h2 className="text-3xl font-bold tracking-tight">
            Stop overpaying for prepaid electricity.
          </h2>
          <p className="mt-4 text-primary-foreground/80">
            Replay your meter history, see the hidden slab jumps, and recharge
            with confidence.
          </p>
          <ul className="mt-8 space-y-4">
            <li className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 shrink-0" />
              <span>Full balance replay</span>
            </li>
            <li className="flex items-center gap-3">
              <Gauge className="h-5 w-5 shrink-0" />
              <span>Slab warnings</span>
            </li>
            <li className="flex items-center gap-3">
              <CalendarClock className="h-5 w-5 shrink-0" />
              <span>Run-out projections</span>
            </li>
          </ul>
        </div>

        <p className="relative z-10 text-sm text-primary-foreground/70">
          Built for Bangladesh BPDB prepaid meters.
        </p>
      </div>

      <div className="relative flex flex-col items-center justify-center p-6 sm:p-10">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />

        <Link
          href="/"
          className="absolute top-6 left-6 flex items-center gap-2 text-lg font-bold lg:hidden"
        >
          <Zap className="h-5 w-5 fill-primary text-primary" />
          <span>Advisor</span>
        </Link>

        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
