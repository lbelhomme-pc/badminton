"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Shield, UserRound } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";

function GuestMenu() {
  return (
    <div className="flex items-center gap-2">
      <Link
        href="/connexion"
        className="inline-flex h-10 items-center rounded-lg border border-court-200 bg-white px-3 text-sm font-semibold text-court-900 transition hover:bg-court-100"
      >
        Connexion
      </Link>
      <Link
        href="/inscription"
        className="inline-flex h-10 items-center rounded-lg bg-court-500 px-4 text-sm font-semibold text-white shadow-soft transition hover:bg-court-600"
      >
        S'inscrire
      </Link>
    </div>
  );
}

export function UserMenu() {
  const router = useRouter();
  const { loading, isAuthenticated, profile, user, isAdmin, logout } = useAuth();
  const [pendingLogout, setPendingLogout] = useState(false);

  async function onLogout() {
    setPendingLogout(true);
    await logout();
    router.push("/connexion");
    router.refresh();
    setPendingLogout(false);
  }

  if (loading || !isAuthenticated) {
    return <GuestMenu />;
  }

  return (
    <div className="flex items-center gap-2">
      {isAdmin ? (
        <Link
          href="/admin"
          className="hidden h-10 items-center gap-2 rounded-lg border border-court-200 bg-white px-3 text-sm font-semibold text-court-900 transition hover:bg-court-100 md:inline-flex"
        >
          <Shield className="h-4 w-4" aria-hidden="true" />
          Admin
        </Link>
      ) : null}
      <Link
        href="/espace-adherent"
        className="inline-flex h-10 items-center gap-2 rounded-lg border border-court-200 bg-white px-3 text-sm font-semibold text-court-900 transition hover:bg-court-100"
      >
        <UserRound className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">{profile?.prenom || user?.email}</span>
      </Link>
      <Button variant="ghost" size="icon" onClick={onLogout} disabled={pendingLogout} aria-label="Se déconnecter" title="Se déconnecter">
        <LogOut className="h-4 w-4" aria-hidden="true" />
      </Button>
    </div>
  );
}
