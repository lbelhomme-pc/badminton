"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { PasswordUpdateForm } from "@/components/auth/password-update-form";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fetchActualites, fetchMyReservations, type ActualiteRow, type ReservationRow } from "@/services/supabase-data.service";

export function PrivateMemberArea() {
  return (
    <ProtectedRoute>
      <MemberContent />
    </ProtectedRoute>
  );
}

function MemberContent() {
  const { profile, user } = useAuth();
  const [reservations, setReservations] = useState<ReservationRow[]>([]);
  const [actualites, setActualites] = useState<ActualiteRow[]>([]);

  useEffect(() => {
    fetchMyReservations().then((result) => setReservations(result.data));
    fetchActualites(true).then((result) => setActualites(result.data));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.8fr]">
        <section className="space-y-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-court-600">Espace adhérent</p>
            <h1 className="mt-2 text-4xl font-black text-court-900">Bonjour {profile?.prenom || user?.email}</h1>
            <p className="mt-2 text-ink-500">Retrouve tes informations, tes réservations et les actualités internes du club.</p>
          </div>

          <Card className="p-5">
            <h2 className="text-2xl font-black text-court-900">Mes prochaines réservations</h2>
            {reservations.length === 0 ? (
              <p className="mt-3 text-sm text-ink-500">Aucune réservation pour le moment.</p>
            ) : (
              <div className="mt-4 grid gap-3">
                {reservations.slice(0, 4).map((reservation) => (
                  <div key={reservation.id} className="rounded-lg bg-court-50 p-4">
                    <p className="font-semibold text-court-900">{reservation.creneaux?.jour} · {reservation.creneaux?.gymnase}</p>
                    <p className="text-sm text-ink-500">{reservation.date_reservation} · {reservation.statut}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/reservation-creneau"><Button>Réserver un créneau</Button></Link>
              <Link href="/mes-reservations"><Button variant="outline">Voir mes réservations</Button></Link>
              <Link href="/commande-volants"><Button variant="outline">Commander des volants</Button></Link>
            </div>
          </Card>
        </section>

        <aside className="space-y-4">
          <Card className="p-5">
            <h2 className="text-xl font-black text-court-900">Mes informations</h2>
            <div className="mt-3 grid gap-2 text-sm text-ink-500">
              <p>{profile?.prenom} {profile?.nom}</p>
              <p>{profile?.email || user?.email}</p>
              <p>Rôle : {profile?.role ?? "adherent"}</p>
            </div>
          </Card>
          <PasswordUpdateForm
            compact
            title="Sécurité du compte"
            intro="Modifie ton mot de passe sans repasser par le lien de mot de passe oublié."
          />
          <Card className="p-5">
            <h2 className="text-xl font-black text-court-900">Actualités internes</h2>
            {actualites.length === 0 ? (
              <p className="mt-3 text-sm text-ink-500">Aucune actualité interne pour le moment.</p>
            ) : (
              <div className="mt-3 grid gap-3">
                {actualites.slice(0, 3).map((actualite) => (
                  <div key={actualite.id} className="rounded-lg bg-court-50 p-3">
                    <p className="font-semibold text-court-900">{actualite.titre}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-ink-500">{actualite.contenu}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </aside>
      </div>
    </div>
  );
}
