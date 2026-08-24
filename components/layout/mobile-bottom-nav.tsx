"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Handshake, Home, Shield, ShoppingBag, Trophy, UserRound } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { cn } from "@/lib/utils";

const memberItems = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/creneaux", label: "Créneaux", icon: CalendarDays },
  { href: "/agenda", label: "Agenda", icon: Trophy },
  { href: "/partenaires", label: "Partenaires", icon: Handshake },
  { href: "/connexion", label: "Compte", icon: UserRound }
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { isAdmin, isAuthenticated, isManager } = useAuth();
  const publicItems = isAuthenticated
    ? memberItems.map((item) => item.href === "/partenaires" ? { href: "/commande-volants", label: "Volants", icon: ShoppingBag } : item)
    : memberItems;
  const items = isAdmin || isManager ? [...publicItems, { href: "/admin", label: "Admin", icon: Shield }] : publicItems;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-court-200 bg-white/95 px-2 pb-2 pt-1 shadow-soft backdrop-blur md:hidden"
      aria-label="Navigation mobile rapide"
    >
      <div className={cn("grid", items.length === 6 ? "grid-cols-6" : "grid-cols-5")}>
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg font-display text-[11px] font-bold transition motion-reduce:transition-none",
                active ? "bg-court-100 text-court-900" : "text-ink-600 hover:bg-court-100 hover:text-court-900"
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
