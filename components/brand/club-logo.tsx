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
          <path
            d="M41 9c8 3 12 10 10 19-2 12-13 22-28 28l-3-5c12-5 21-13 23-22 2-7-1-11-7-13l5-7Z"
            fill="#12B76A"
          />
          <path
            d="M14 18c9-5 21-4 30 2-8 2-14 7-19 16l-11-18Z"
            fill="#FACC15"
          />
          <path d="M18 21l9 15M24 17l8 13M31 16l6 9" stroke="#10201B" strokeWidth="2.5" strokeLinecap="round" />
          <path
            d="M12 46c8-5 17-8 27-9"
            stroke="#FFFFFF"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path d="M35 38l14 14" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
          <path d="M35 38l14 14" stroke="#12B76A" strokeWidth="2.5" strokeLinecap="round" />
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
