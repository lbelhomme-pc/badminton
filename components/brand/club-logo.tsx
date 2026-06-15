import { cn } from "@/lib/utils";

interface ClubLogoProps {
  className?: string;
  markOnly?: boolean;
}

export function ClubLogo({ className, markOnly = false }: ClubLogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <span
        className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-court-200 bg-white shadow-soft"
        style={{ width: 48, height: 48 }}
      >
        <img
          src="/icons/pwa-icon-192.png"
          alt=""
          width={48}
          height={48}
          className="block h-12 w-12 object-contain"
          style={{ width: 48, height: 48 }}
          aria-hidden="true"
        />
      </span>
      {markOnly ? null : (
        <span className="hidden sm:block">
          <span className="block text-sm font-black uppercase tracking-wide text-court-900">CF2V41</span>
          <span className="block text-xs font-medium text-ink-500">Club des fous du Volant Vendômois</span>
        </span>
      )}
    </span>
  );
}
