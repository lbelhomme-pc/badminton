import { cn } from "@/lib/utils";

interface ClubLogoProps {
  className?: string;
  markOnly?: boolean;
}

export function ClubLogo({ className, markOnly = false }: ClubLogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-court-900 shadow-soft">
        <svg viewBox="0 0 64 64" className="h-9 w-9" aria-hidden="true">
          <g transform="rotate(-28 34 33)">
            <ellipse cx="39" cy="23" rx="11" ry="15" fill="none" stroke="#FFFFFF" strokeWidth="4" />
            <path d="M30 22h18M32 15c4 3 9 3 14 0M32 30c4-3 9-3 14 0M39 9v28" stroke="#B8F7D4" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M31 36L18 53" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
            <path d="M31 36L18 53" stroke="#12B76A" strokeWidth="2.2" strokeLinecap="round" />
          </g>
          <g transform="rotate(14 24 25)">
            <path d="M12 11h26l-8 25H20L12 11Z" fill="#F8FAFC" />
            <path d="M13 12l8 23M21 12l3 23M29 12l-3 23M37 12l-8 23" stroke="#10201B" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M19 35h12l3 8-6 5H22l-6-5 3-8Z" fill="#FACC15" />
            <path d="M19 35h12" stroke="#10201B" strokeWidth="1.8" strokeLinecap="round" />
          </g>
        </svg>
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
