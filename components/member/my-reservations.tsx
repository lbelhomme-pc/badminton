"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const [result, waitingResult] = await Promise.all([fetchMyReservations(), fetchMyWaitingList()]);
    setReservations(result.data);
    setWaitingList(waitingResult.data);
    if (result.error) setMessage(result.error);
    if (waitingResult.error && !waitingResult.error.includes("nouvelles règles")) setMessage(waitingResult.error);
  }

  useEffect(() => {
    load();
  }, []);

  async function cancel(id: number) {
    const result = await cancelReservation(id);
    setMessage(result.message);
    await load();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-black text-court-900">Mes réservations</h1>
      <p className="mt-3 text-ink-500">
        Consulte tes réservations. L'annulation adhérent est bloquée moins de 2 heures avant le début du créneau.
      </p>
      {message ? <p className="mt-5 rounded-lg bg-court-100 px-4 py-3 text-sm font-semibold text-court-900">{message}</p> : null}
      <div className="mt-6 grid gap-4">
        {reservations.map((reservation) => (
          <Card key={reservation.id} className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-black text-court-900">{reservation.creneaux?.jour} · {reservation.creneaux?.gymnase}</p>
                <p className="text-sm text-ink-500">{reservation.date_reservation} · {reservation.statut}</p>
              </div>
              {reservation.statut !== "annulee" ? (
                <Button variant="outline" onClick={() => cancel(reservation.id)}>
                  Annuler
                </Button>
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
                    {waiting.date_reservation} · {waiting.statut === "notifiee" ? "place à confirmer avec le club" : waiting.statut}
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
