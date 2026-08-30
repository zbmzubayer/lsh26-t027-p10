"use client";

import { Menu, Zap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/auth/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const appLinks = [
  { href: "/dashboard", label: "Balance" },
  { href: "/advisor", label: "Advisor" },
  { href: "/habits", label: "Habits" },
  { href: "/settings", label: "Settings" },
];

export function MainNav({ isAuthenticated }: { isAuthenticated: boolean }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold tracking-tight transition-colors hover:text-primary"
        >
          <Zap className="h-5 w-5 fill-primary text-primary" />
          <span className="hidden sm:inline">
            Prepaid Meter Recharge Advisor
          </span>
          <span className="sm:hidden">Advisor</span>
        </Link>

        {isAuthenticated && (
          <nav className="hidden items-center gap-1 md:flex">
            {appLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "relative",
                    isActive
                      ? "font-medium text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-1 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-primary" />
                  )}
                </Link>
              );
            })}
          </nav>
        )}

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isAuthenticated ? (
            <div className="hidden md:block">
              <LogoutButton />
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link
                href="/login"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Sign in
              </Link>
              <Link href="/register" className={buttonVariants({ size: "sm" })}>
                Get started
              </Link>
            </div>
          )}
          <Sheet>
            <SheetTrigger
              aria-label="Open menu"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 md:hidden"
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <div className="flex flex-col gap-6 pt-6">
                <Link
                  href="/"
                  className="flex items-center gap-2 text-lg font-bold"
                >
                  <Zap className="h-5 w-5 fill-primary text-primary" />
                  Prepaid Meter Recharge Advisor
                </Link>
                {isAuthenticated ? (
                  <nav className="flex flex-col gap-2">
                    {appLinks.map((link) => {
                      const isActive = pathname.startsWith(link.href);
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={cn(
                            buttonVariants({
                              variant: isActive ? "default" : "ghost",
                              size: "lg",
                            }),
                            "justify-start",
                          )}
                        >
                          {link.label}
                        </Link>
                      );
                    })}
                  </nav>
                ) : (
                  <nav className="flex flex-col gap-2">
                    <Link
                      href="/login"
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "lg" }),
                        "justify-start",
                      )}
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/register"
                      className={cn(
                        buttonVariants({ size: "lg" }),
                        "justify-start",
                      )}
                    >
                      Get started
                    </Link>
                  </nav>
                )}
                {isAuthenticated && (
                  <div className="mt-auto md:hidden">
                    <LogoutButton />
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
