import { cn } from "@/lib/utils";

interface ClubLogoProps {
  className?: string;
  compact?: boolean;
  markOnly?: boolean;
}

export function ClubLogo({ className, compact = false, markOnly = false }: ClubLogoProps) {
  return (
    <span className={cn("inline-flex items-center", className)}>
      <img
        src={markOnly ? "/logos/cfvv-blason.png" : "/logos/cfvv-horizontal.png"}
        alt=""
        width={markOnly ? 56 : 164}
        height={markOnly ? 56 : 61}
        className={cn("block shrink-0 object-contain", markOnly ? "h-12 w-12" : "h-12 w-auto sm:h-14", compact && "h-11 sm:h-12")}
        aria-hidden="true"
      />
      <span className="sr-only">Club des Fous du Volant du Vendômois</span>
    </span>
  );
}
