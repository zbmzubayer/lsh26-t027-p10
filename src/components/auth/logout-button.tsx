"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();

  return (
    <form
      action={async () => {
        await logoutAction();
        router.push("/login");
      }}
    >
      <Button type="submit" variant="ghost" size="icon" aria-label="Sign out">
        <LogOut className="h-5 w-5" />
      </Button>
    </form>
  );
}
