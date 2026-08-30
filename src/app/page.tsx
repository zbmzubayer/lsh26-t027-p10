import {
  BarChart3,
  Bell,
  CalendarClock,
  ChevronRight,
  Gauge,
  LayoutDashboardIcon,
  PiggyBank,
  ShieldCheck,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSession } from "@/lib/auth";

export default async function LandingPage() {
  const session = await getSession();
  const isAuthenticated = !!session;
  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden border-b bg-background px-4 py-20 sm:px-6 sm:py-28 lg:py-36">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        <div className="container mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-sm font-medium text-primary shadow-sm backdrop-blur">
            <Zap className="h-4 w-4 fill-primary" />
            <span>Stop guessing your prepaid meter bills</span>
          </div>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
            See where every taka goes
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Replay your prepaid electricity meter, spot the hidden slab charges,
            and recharge with confidence. Built for Bangladesh BPDB prepaid
            meters.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className={buttonVariants({
                  size: "lg",
                  className: "h-11 gap-2 px-8 text-base",
                })}
              >
                <LayoutDashboardIcon className="h-4 w-4" />
                Go to dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className={buttonVariants({
                    size: "lg",
                    className: "h-11 px-8 text-base",
                  })}
                >
                  Get started free
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className={buttonVariants({
                    variant: "outline",
                    size: "lg",
                    className: "h-11 px-8 text-base",
                  })}
                >
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            The slab jump no one warned you about
          </h2>
          <p className="mt-4 text-muted-foreground">
            The 400th unit costs ৳5.83. The 401st costs ৳9.30. We show you
            exactly when that happens and what it means for your wallet.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-primary" />
              <CardTitle className="mt-4">Balance replay</CardTitle>
              <CardDescription>
                Rebuild your full balance history from daily units and
                recharges. One calculation powers every screen.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Gauge className="h-8 w-8 text-primary" />
              <CardTitle className="mt-4">Slab warnings</CardTitle>
              <CardDescription>
                See which band you are in today and how close you are to the
                next price jump.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CalendarClock className="h-8 w-8 text-primary" />
              <CardTitle className="mt-4">Run-out date</CardTitle>
              <CardDescription>
                Project your balance forward from today, carrying the current
                month&apos;s slab count with it.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <PiggyBank className="h-8 w-8 text-primary" />
              <CardTitle className="mt-4">Top-up breakdown</CardTitle>
              <CardDescription>
                Split any recharge into baseline band-one cost, higher-band
                premium, fixed charges and VAT.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Bell className="h-8 w-8 text-primary" />
              <CardTitle className="mt-4">Habit comparison</CardTitle>
              <CardDescription>
                Compare low-balance top-ups against fixed monthly recharges on
                identical consumption. No fabricated savings.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <ShieldCheck className="h-8 w-8 text-primary" />
              <CardTitle className="mt-4">Private by default</CardTitle>
              <CardDescription>
                Your households belong to your account. Demo data is shared, but
                your real data stays yours.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      <section className="border-y bg-muted/40 px-4 py-20 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Built on the real tariff
              </h2>
              <p className="mt-4 text-muted-foreground">
                The engine uses the published cumulative calendar-month slabs,
                plus demand charge, meter rent and 5% VAT — exactly as the meter
                applies them.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  "Cumulative calendar-month bands",
                  "Demand charge + meter rent on the first recharge",
                  "5% VAT applied to energy daily",
                  "Projection carries month-to-date units forward",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Zap className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Card className="border-primary/10 bg-background shadow-sm">
              <CardContent className="p-6 sm:p-8">
                <div className="space-y-4">
                  <div className="flex justify-between border-b pb-2 text-sm">
                    <span className="text-muted-foreground">1 – 75 units</span>
                    <span className="font-medium">৳4.63</span>
                  </div>
                  <div className="flex justify-between border-b pb-2 text-sm">
                    <span className="text-muted-foreground">
                      76 – 200 units
                    </span>
                    <span className="font-medium">৳5.26</span>
                  </div>
                  <div className="flex justify-between border-b pb-2 text-sm">
                    <span className="text-muted-foreground">
                      201 – 300 units
                    </span>
                    <span className="font-medium">৳5.63</span>
                  </div>
                  <div className="flex justify-between border-b pb-2 text-sm">
                    <span className="text-muted-foreground">
                      301 – 400 units
                    </span>
                    <span className="font-medium">৳5.83</span>
                  </div>
                  <div className="flex justify-between border-b pb-2 text-sm text-destructive">
                    <span>401 – 600 units</span>
                    <span className="font-medium">৳9.30</span>
                  </div>
                  <div className="flex justify-between text-sm text-destructive">
                    <span>601+ units</span>
                    <span className="font-medium">৳10.70</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Ready to stop overpaying?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Create a free account, add your first household, and see exactly what
          your next recharge is really buying.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className={buttonVariants({
                size: "lg",
                className: "h-11 gap-2 px-8 text-base",
              })}
            >
              <LayoutDashboardIcon className="h-4 w-4" />
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/register"
                className={buttonVariants({
                  size: "lg",
                  className: "h-11 px-8 text-base",
                })}
              >
                Create free account
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className={buttonVariants({
                  variant: "outline",
                  size: "lg",
                  className: "h-11 px-8 text-base",
                })}
              >
                Already have an account?
              </Link>
            </>
          )}
        </div>
      </section>

      <footer className="mt-auto border-t bg-background px-4 py-8 sm:px-6">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 text-lg font-bold">
            <Zap className="h-5 w-5 fill-primary text-primary" />
            <span>Prepaid Meter Recharge Advisor</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Built for transparent prepaid meter tracking.
          </p>
        </div>
      </footer>
    </div>
  );
}
