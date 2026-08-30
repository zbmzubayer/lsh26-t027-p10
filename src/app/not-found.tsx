import {
  FrownIcon,
  HomeIcon,
  LayoutDashboardIcon,
  LogInIcon,
} from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFoundPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />

      <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-xl">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-muted">
          <FrownIcon className="size-10 text-muted-foreground" />
        </div>

        <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          404 — Page not found
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
          We could not find that page
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The link you followed may be broken, or the page may have moved.
        </p>

        <div className="mt-8 grid gap-3">
          <Link href="/" className={cn(buttonVariants(), "gap-2")}>
            <HomeIcon className="size-4" />
            Back to home
          </Link>

          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
            >
              <LogInIcon className="size-4" />
              Sign in
            </Link>
            <Link
              href="/dashboard"
              className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
            >
              <LayoutDashboardIcon className="size-4" />
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
