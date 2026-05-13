"use client";

import { useRouter } from "next/navigation";
import { ShieldCheck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useClub } from "@/hooks/use-club-store";

export function AuthPanel() {
  const router = useRouter();
  const { currentUser, loginAs, logout } = useClub();

  if (currentUser) {
    return (
      <Card className="mx-auto max-w-xl p-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-court-600">Session active</p>
        <h1 className="mt-3 text-3xl font-black text-court-900">Bonjour {currentUser.firstName}</h1>
        <p className="mt-3 text-ink-500">Vous êtes connecté à l’espace du club.</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={() => router.push("/compte")}>Aller à mon espace</Button>
          <Button variant="outline" onClick={logout}>Se déconnecter</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="mx-auto grid max-w-3xl gap-4 md:grid-cols-2">
      <Card className="p-6">
        <UserRound className="h-8 w-8 text-court-500" aria-hidden="true" />
        <h2 className="mt-4 text-2xl font-black text-court-900">Espace adhérent</h2>
        <p className="mt-2 text-sm leading-6 text-ink-500">
          Réserver un créneau, commander des volants et consulter l’espace personnel.
        </p>
        <Button
          className="mt-5 w-full"
          onClick={() => {
            loginAs("member");
            router.push("/compte");
          }}
        >
          Entrer comme adhérent
        </Button>
      </Card>
      <Card className="p-6">
        <ShieldCheck className="h-8 w-8 text-info" aria-hidden="true" />
        <h2 className="mt-4 text-2xl font-black text-court-900">Espace responsable</h2>
        <p className="mt-2 text-sm leading-6 text-ink-500">
          Accéder au tableau de bord, aux réservations, aux commandes et aux actions rapides.
        </p>
        <Button
          variant="secondary"
          className="mt-5 w-full"
          onClick={() => {
            loginAs("admin");
            router.push("/admin");
          }}
        >
          Entrer comme responsable
        </Button>
      </Card>
    </div>
  );
}
