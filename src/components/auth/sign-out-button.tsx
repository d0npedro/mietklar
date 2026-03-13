"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const [isPending, startTransition] = useTransition();

  // UX-Grund: Eine gut sichtbare Abmeldung verhindert, dass Nutzende in einem falschen Konto weiterarbeiten.
  return (
    <Button
      className="h-12 rounded-2xl px-4 text-base"
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
