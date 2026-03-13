import Link from "next/link";

import { BrandMark } from "@/components/brand/brand-mark";
import { buttonVariants } from "@/components/ui/button-styles";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Produkt" },
  { href: "/manager", label: "Manager-Demo" },
  { href: "/mieter", label: "Mieter-Demo" },
];

type SiteHeaderProps = {
  activePath: string;
};

export function SiteHeader({ activePath }: SiteHeaderProps) {
  return (
    <header className="bg-background/85 sticky top-0 z-30 border-b border-white/70 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="MietKlar Startseite">
          <BrandMark />
        </Link>
        <nav className="flex max-w-full flex-wrap items-center justify-end gap-2">
          {items.map((item) => (
            <Link
              key={item.href}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "rounded-full",
                activePath === item.href
                  ? "bg-slate-900 text-slate-50 hover:bg-slate-900"
                  : "bg-white/90 text-slate-700 hover:bg-white",
              )}
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
