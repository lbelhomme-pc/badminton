import { cn } from "@/lib/utils";

interface ClubLogoProps {
  className?: string;
  markOnly?: boolean;
}

export function ClubLogo({ className, markOnly = false }: ClubLogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-court-200 bg-white shadow-soft">
        <img
          src="/logo-cfvv41.png"
          alt=""
          className="h-full w-full object-contain"
          aria-hidden="true"
        />
      </span>
      {markOnly ? null : (
        <span className="hidden sm:block">
          <span className="block text-sm font-black uppercase tracking-wide text-court-900">CFVV41</span>
          <span className="block text-xs font-medium text-ink-500">Club des fous du Volant Vendômois</span>
        </span>
      )}
    </span>
  );
}
