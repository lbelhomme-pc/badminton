"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { reservationStatusLabel, waitingListStatusLabel } from "@/lib/status-labels";
import {
  cancelReservation,
  fetchMyReservations,
  fetchMyWaitingList,
  type ReservationRow,
  type WaitingListRow
} from "@/services/supabase-data.service";

export function MyReservations() {
  return (
    <ProtectedRoute>
      <MyReservationsContent />
    </ProtectedRoute>
  );
}

function MyReservationsContent() {
  const [reservations, setReservations] = useState<ReservationRow[]>([]);
  const [waitingList, setWaitingList] = useState<WaitingListRow[]>([]);
  const [message, setMessage] = useState<{ tone: "success" | "error" | "info"; text: string } | null>(null);
  const [pendingCancelId, setPendingCancelId] = useState<number | null>(null);

  async function load() {
    const [result, waitingResult] = await Promise.all([fetchMyReservations(), fetchMyWaitingList()]);
    setReservations(result.data);
    setWaitingList(waitingResult.data);
    if (result.error) setMessage({ tone: "error", text: result.error });
    if (waitingResult.error && !waitingResult.error.includes("nouvelles règles")) {
      setMessage({ tone: "error", text: waitingResult.error });
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function cancel(id: number) {
    const reservation = reservations.find((item) => item.id === id);
    const label = reservation?.creneaux
      ? `${reservation.creneaux.jour} ${reservation.creneaux.heure_debut.slice(0, 5)} - ${reservation.creneaux.heure_fin.slice(0, 5)}`
      : "ce créneau";
    const confirmed = window.confirm(`Annuler ta réservation pour ${label} ?`);
    if (!confirmed) return;

    setPendingCancelId(id);
    setMessage({ tone: "info", text: "Annulation de la réservation en cours..." });
    try {
      const result = await cancelReservation(id);
      setMessage({ tone: result.ok ? "success" : "error", text: result.message });
      await load();
    } finally {
      setPendingCancelId(null);
    }
  }

  function canCancel(reservation: ReservationRow) {
    if (reservation.statut === "annulee" || reservation.statut === "refusee") return false;
    if (!reservation.creneaux?.heure_debut) return true;

    const start = new Date(`${reservation.date_reservation}T${reservation.creneaux.heure_debut.slice(0, 8)}`);
    return start.getTime() > Date.now() + 2 * 60 * 60 * 1000;
  }

  const messageClassName =
    message?.tone === "success"
      ? "bg-emerald-50 text-emerald-700"
      : message?.tone === "error"
        ? "bg-red-50 text-red-700"
        : "bg-court-100 text-court-900";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-black text-court-900">Mes réservations</h1>
      <p className="mt-3 text-ink-500">
        Consulte tes réservations. L'annulation adhérent est bloquée moins de 2 heures avant le début du créneau.
      </p>
      {message ? (
        <p className={`mt-5 rounded-lg px-4 py-3 text-sm font-semibold ${messageClassName}`} aria-live="polite">
          {message.text}
        </p>
      ) : null}
      <div className="mt-6 grid gap-4">
        {reservations.map((reservation) => (
          <Card key={reservation.id} className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-black text-court-900">{reservation.creneaux?.jour} · {reservation.creneaux?.gymnase}</p>
                <p className="text-sm text-ink-500">{reservation.date_reservation} · {reservationStatusLabel(reservation.statut)}</p>
              </div>
              {canCancel(reservation) ? (
                <Button variant="outline" onClick={() => cancel(reservation.id)} disabled={pendingCancelId === reservation.id}>
                  {pendingCancelId === reservation.id ? "Annulation..." : "Annuler ma réservation"}
                </Button>
              ) : reservation.statut !== "annulee" ? (
                <span className="rounded-lg bg-ink-100 px-3 py-2 text-sm font-semibold text-ink-500">
                  Annulation fermée
                </span>
              ) : null}
            </div>
          </Card>
        ))}
        {reservations.length === 0 ? <Card className="p-5 text-ink-500">Aucune réservation.</Card> : null}
      </div>

      <section className="mt-10">
        <h2 className="text-2xl font-black text-court-900">Liste d'attente</h2>
        <div className="mt-4 grid gap-4">
          {waitingList.map((waiting) => (
            <Card key={waiting.id} className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-black text-court-900">{waiting.creneaux?.jour} · {waiting.creneaux?.gymnase}</p>
                  <p className="text-sm text-ink-500">
                    {waiting.date_reservation} · {waitingListStatusLabel(waiting.statut)}
                  </p>
                </div>
                <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-black text-yellow-800">
                  En attente
                </span>
              </div>
            </Card>
          ))}
          {waitingList.length === 0 ? <Card className="p-5 text-ink-500">Aucune inscription en liste d'attente.</Card> : null}
        </div>
      </section>
    </div>
  );
}
