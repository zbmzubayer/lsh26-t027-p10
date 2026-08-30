"use client";

import { AlertTriangleIcon, HomeIcon, RefreshCcwIcon } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-destructive/10 via-transparent to-transparent" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />

      <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-xl">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangleIcon className="size-8 text-destructive" />
        </div>

        <h1 className="mt-6 text-2xl font-bold tracking-tight text-foreground">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We ran into an unexpected problem while loading this page.
        </p>

        {error.message && (
          <div className="mt-6 rounded-lg border bg-muted/50 p-3 text-left">
            <p className="font-mono text-xs text-muted-foreground break-words">
              {error.message}
            </p>
            {error.digest && (
              <p className="mt-2 font-mono text-[10px] text-muted-foreground/70">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={reset} className="gap-2">
            <RefreshCcwIcon className="size-4" />
            Try again
          </Button>
          <Link
            href="/"
            className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
          >
            <HomeIcon className="size-4" />
            Back home
          </Link>
        </div>
      </div>
    </main>
  );
}
