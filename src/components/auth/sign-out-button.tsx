"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      className="rounded-full"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await signOut({ callbackUrl: "/" });
        })
      }
      variant="outline"
    >
      <LogOut className="size-4" />
      {isPending ? "Abmelden..." : "Abmelden"}
    </Button>
  );
}
