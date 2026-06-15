"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { PasswordUpdateForm } from "@/components/auth/password-update-form";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { clubRoleLabel, reservationStatusLabel, shuttleOrderStatusLabel, waitingListStatusLabel } from "@/lib/status-labels";
import {
  cancelReservation,
  fetchActualites,
  fetchMyReservations,
  fetchMyShuttleOrders,
  fetchMyWaitingList,
  type ActualiteRow,
  type ReservationRow,
  type ShuttleOrderMemberRow,
  type WaitingListRow
} from "@/services/supabase-data.service";

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
  const [waitingList, setWaitingList] = useState<WaitingListRow[]>([]);
  const [orders, setOrders] = useState<ShuttleOrderMemberRow[]>([]);
  const [actualites, setActualites] = useState<ActualiteRow[]>([]);
  const [message, setMessage] = useState<{ tone: "success" | "error" | "info"; text: string } | null>(null);
  const [pendingCancelId, setPendingCancelId] = useState<number | null>(null);

  async function loadMemberData() {
    const [reservationResult, waitingResult, orderResult, actualiteResult] = await Promise.all([
      fetchMyReservations(),
      fetchMyWaitingList(),
      fetchMyShuttleOrders(),
      fetchActualites(true)
    ]);

    setReservations(reservationResult.data);
    setWaitingList(waitingResult.data);
    setOrders(orderResult.data);
    setActualites(actualiteResult.data);
  }

  useEffect(() => {
    loadMemberData();
  }, []);

  function canCancel(reservation: ReservationRow) {
    if (reservation.statut === "annulee" || reservation.statut === "refusee") return false;
    if (!reservation.creneaux?.heure_debut) return true;

    const start = new Date(`${reservation.date_reservation}T${reservation.creneaux.heure_debut.slice(0, 8)}`);
    return start.getTime() > Date.now() + 2 * 60 * 60 * 1000;
  }

  async function cancelFromDashboard(reservation: ReservationRow) {
    const label = reservation.creneaux
      ? `${reservation.creneaux.jour} ${reservation.creneaux.heure_debut.slice(0, 5)} - ${reservation.creneaux.heure_fin.slice(0, 5)}`
      : "ce créneau";
    const confirmed = window.confirm(`Annuler ta réservation pour ${label} ?`);
    if (!confirmed) return;

    setPendingCancelId(reservation.id);
    setMessage({ tone: "info", text: "Annulation de la réservation en cours..." });

    try {
      const result = await cancelReservation(reservation.id);
      setMessage({ tone: result.ok ? "success" : "error", text: result.message });
      await loadMemberData();
    } finally {
      setPendingCancelId(null);
    }
  }

  const messageClassName =
    message?.tone === "success"
      ? "bg-emerald-50 text-emerald-700"
      : message?.tone === "error"
        ? "bg-red-50 text-red-700"
        : "bg-court-100 text-court-900";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.8fr]">
        <section className="space-y-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-court-600">Espace adhérent</p>
            <h1 className="mt-2 text-4xl font-black text-court-900">Bonjour {profile?.prenom || user?.email}</h1>
            <p className="mt-2 text-ink-500">Retrouve tes informations, tes réservations et les actualités internes du club.</p>
          </div>

          {message ? (
            <p className={`rounded-lg px-4 py-3 text-sm font-semibold ${messageClassName}`} aria-live="polite">
              {message.text}
            </p>
          ) : null}

          <Card className="p-5">
            <h2 className="text-2xl font-black text-court-900">Ce que permet ton compte</h2>
            <p className="mt-2 text-sm leading-6 text-ink-500">
              Le compte adhérent sert à gérer les actions utiles au quotidien, sans passer par plusieurs messages au club.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                "Réserver un créneau ouvert",
                "Voir et annuler tes réservations",
                "Suivre ta liste d'attente",
                "Commander des volants",
                "Voir ton historique de volants",
                "Retrouver les infos internes du club",
                "Consulter ton profil adhérent",
                "Modifier ton mot de passe"
              ].map((item) => (
                <div key={item} className="rounded-lg border border-court-100 bg-court-50 px-4 py-3 text-sm font-semibold text-court-900">
                  {item}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-2xl font-black text-court-900">Mes prochaines réservations</h2>
            {reservations.length === 0 ? (
              <p className="mt-3 text-sm text-ink-500">Aucune réservation pour le moment.</p>
            ) : (
              <div className="mt-4 grid gap-3">
                {reservations.slice(0, 4).map((reservation) => (
                  <div key={reservation.id} className="rounded-lg bg-court-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-court-900">{reservation.creneaux?.jour} · {reservation.creneaux?.gymnase}</p>
                        <p className="text-sm text-ink-500">{reservation.date_reservation} · {reservationStatusLabel(reservation.statut)}</p>
                      </div>
                      {canCancel(reservation) ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => cancelFromDashboard(reservation)}
                          disabled={pendingCancelId === reservation.id}
                        >
                          {pendingCancelId === reservation.id ? "Annulation..." : "Annuler"}
                        </Button>
                      ) : null}
                    </div>
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

          <Card className="p-5">
            <h2 className="text-2xl font-black text-court-900">Volants</h2>
            {orders.length === 0 ? (
              <p className="mt-3 text-sm text-ink-500">Aucun achat ou commande de volants enregistré pour le moment.</p>
            ) : (
              <div className="mt-4 grid gap-3">
                {orders.slice(0, 4).map((order) => (
                  <div key={order.id} className="rounded-lg bg-court-50 p-4">
                    <p className="font-semibold text-court-900">
                      {order.quantite} tube{order.quantite > 1 ? "s" : ""} · {order.volants?.marque} {order.volants?.modele ?? ""}
                    </p>
                    <p className="text-sm text-ink-500">
                      {new Date(order.created_at).toLocaleDateString("fr-FR")} · {shuttleOrderStatusLabel(order.statut)}
                      {order.total != null ? ` · ${Number(order.total).toFixed(2)} €` : ""}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <Link href="/commande-volants">
              <Button className="mt-5" variant="outline">Voir les volants</Button>
            </Link>
          </Card>
        </section>

        <aside className="space-y-4">
          <Card className="p-5">
            <h2 className="text-xl font-black text-court-900">Mes informations</h2>
            <div className="mt-3 grid gap-2 text-sm text-ink-500">
              <p>{profile?.prenom} {profile?.nom}</p>
              <p>{profile?.email || user?.email}</p>
              <p>Rôle : {clubRoleLabel(profile?.role ?? "adherent")}</p>
            </div>
          </Card>
          <PasswordUpdateForm
            compact
            title="Sécurité du compte"
            intro="Modifie ton mot de passe sans repasser par le lien de mot de passe oublié."
          />
          <Card className="p-5">
            <h2 className="text-xl font-black text-court-900">Liste d'attente</h2>
            {waitingList.length === 0 ? (
              <p className="mt-3 text-sm text-ink-500">Aucun créneau en attente.</p>
            ) : (
              <div className="mt-3 grid gap-3">
                {waitingList.slice(0, 3).map((waiting) => (
                  <div key={waiting.id} className="rounded-lg bg-yellow-50 p-3">
                    <p className="font-semibold text-court-900">{waiting.creneaux?.jour} · {waiting.date_reservation}</p>
                    <p className="mt-1 text-sm text-ink-500">{waitingListStatusLabel(waiting.statut)}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
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
