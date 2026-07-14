"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Settings, UsersRound, CalendarDays, Newspaper, Package, ClipboardList, Euro, Home, FileText, Image } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { cn } from "@/lib/utils";

const adminNavItems = [
  { href: "/admin", label: "Vue d'ensemble", icon: Home, minRole: "manager" },
  { href: "/admin/creneaux", label: "CrÃ©neaux", icon: CalendarDays, minRole: "manager" },
  { href: "/admin/agenda", label: "Agenda", icon: CalendarDays, minRole: "manager" },
  { href: "/admin/reservations", label: "RÃ©servations", icon: ClipboardList, minRole: "manager" },
  { href: "/admin/actualites", label: "ActualitÃ©s", icon: Newspaper, minRole: "manager" },
  { href: "/admin/medias", label: "MÃ©dias", icon: Image, minRole: "manager" },
  { href: "/admin/volants", label: "Volants", icon: Package, minRole: "manager" },
  { href: "/admin/documents", label: "Documents", icon: FileText, minRole: "manager" },
  { href: "/admin/adherents", label: "Membres", icon: UsersRound, minRole: "admin" },
  { href: "/admin/tarifs", label: "Tarifs", icon: Euro, minRole: "admin" },
  { href: "/admin/parametres", label: "ParamÃ¨tres", icon: Settings, minRole: "admin" }
] as const;

interface AdminShellProps {
  title: string;
  intro: string;
  eyebrow?: string;
  children: React.ReactNode;
}

export function AdminShell({ title, intro, eyebrow = "Administration", children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin } = useAuth();
  const visibleItems = adminNavItems.filter((item) => item.minRole === "manager" || isAdmin);
  const activeItem = visibleItems.find((item) => pathname === item.href) ?? visibleItems[0];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-court-600">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-black text-court-900 sm:text-4xl">{title}</h1>
        <p className="mt-3 max-w-3xl text-ink-500">{intro}</p>
      </div>

      <label className="mb-4 grid gap-2 text-sm font-semibold text-court-900 md:hidden">
        Aller Ã 
        <select
          value={activeItem?.href ?? "/admin"}
          onChange={(event) => router.push(event.target.value)}
          className="h-12 rounded-lg border border-court-200 bg-white px-3 text-base font-semibold"
        >
          {visibleItems.map((item) => (
            <option key={item.href} value={item.href}>
              {item.label}
            </option>
          ))}
        </select>
      </label>

      <nav className="mb-8 hidden gap-2 overflow-x-auto rounded-lg border border-court-200 bg-white p-2 md:flex" aria-label="Navigation administration">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex h-10 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-black transition",
                active ? "bg-court-500 text-white" : "text-ink-600 hover:bg-court-100 hover:text-court-900"
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {children}
    </div>
  );
}

