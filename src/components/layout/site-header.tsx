import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { BrandMark } from "@/components/brand/brand-mark";
import { buttonVariants } from "@/components/ui/button-styles";
import { cn } from "@/lib/utils";

const items = [
  { href: "/mieter", label: "Ich wohne hier" },
  { href: "/manager", label: "Ich verwalte" },
];

type SiteHeaderProps = {
  activePath: string;
};

export function SiteHeader({ activePath }: SiteHeaderProps) {
  // UX-Grund: Die Hauptnavigation reduziert die Wahl auf die zwei Nutzerwege plus einen klaren Portalzugang.
  return (
    <header className="bg-background/95 sticky top-0 z-30 border-b border-slate-200/80 backdrop-blur">
      <a
        className="sr-only rounded-md px-3 py-2 focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-40 focus:bg-slate-950 focus:text-white"
        href="#main-content"
      >
        Zum Inhalt springen
      </a>
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="MietKlar Startseite">
          <BrandMark />
        </Link>
        <nav
          aria-label="Hauptnavigation"
          className="flex max-w-full flex-wrap items-center justify-end gap-2"
        >
          {items.map((item) => (
            <Link
              key={item.href}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "min-h-12 rounded-2xl px-4 text-base",
                activePath === item.href
                  ? "bg-slate-950 text-slate-50 hover:bg-slate-950"
                  : "bg-white text-slate-700 hover:bg-slate-50",
              )}
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
          <Link
            className={cn(
              buttonVariants(),
              "min-h-12 rounded-2xl px-4 text-base",
              activePath === "/login" ? "bg-primary text-primary-foreground" : "",
            )}
            href="/login"
          >
            Zum Portal
            <ArrowRight className="size-4" />
          </Link>
        </nav>
      </div>
    </header>
  );
}
