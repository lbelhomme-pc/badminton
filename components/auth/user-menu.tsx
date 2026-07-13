"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, Shield, UserRound } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";

function getInitials(label: string | null | undefined) {
  const value = (label || "Adhérent").trim();
  const parts = value.includes("@") ? value.split("@")[0].split(/[._-]/) : value.split(/\s+/);
  return (
    parts
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "A"
  );
}

function GuestMenu() {
  return (
    <Link
      href="/connexion"
      className="inline-flex h-12 items-center gap-2 rounded bg-[#0097a9] px-5 font-display text-sm font-black uppercase text-white shadow-[0_10px_22px_rgba(0,151,169,0.28)] transition hover:bg-[#007f8f]"
    >
      <UserRound className="h-4 w-4" aria-hidden="true" />
      Espace adhérent
    </Link>
  );
}

export function UserMenu() {
  const { isAuthenticated, profile, user, isAdmin, logout } = useAuth();
  const router = useRouter();
  const [pendingLogout, setPendingLogout] = useState(false);
  const label = profile?.prenom || user?.email || "Adhérent";

  async function onLogout() {
    setPendingLogout(true);
    try {
      await logout();
      router.replace("/connexion?logged_out=1");
      router.refresh();
    } finally {
      setPendingLogout(false);
    }
  }

  if (!isAuthenticated) {
    return <GuestMenu />;
  }

  return (
    <div className="flex items-center gap-2">
      {isAdmin ? (
        <Link
          href="/admin"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-court-200 bg-white font-display text-sm font-bold text-court-900 transition hover:bg-court-100 md:w-auto md:gap-2 md:px-3"
          aria-label="Administration"
          title="Administration"
        >
          <Shield className="h-4 w-4" aria-hidden="true" />
          <span className="hidden md:inline">Admin</span>
        </Link>
      ) : null}
      <Link
        href="/espace-adherent"
        className="inline-flex h-12 items-center gap-2 rounded bg-[#0097a9] px-4 font-display text-sm font-black uppercase text-white shadow-[0_10px_22px_rgba(0,151,169,0.28)] transition hover:bg-[#007f8f]"
      >
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-xs text-white" aria-hidden="true">
          {getInitials(label)}
        </span>
        <UserRound className="hidden h-4 w-4 md:block" aria-hidden="true" />
        <span className="hidden lg:inline">{label}</span>
      </Link>
      <Button variant="ghost" size="icon" onClick={onLogout} disabled={pendingLogout} aria-label="Se déconnecter" title="Se déconnecter">
        <LogOut className="h-4 w-4" aria-hidden="true" />
      </Button>
    </div>
  );
}
