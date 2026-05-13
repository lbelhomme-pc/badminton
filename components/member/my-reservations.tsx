"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fetchMyReservations, updateReservationStatus, type ReservationRow } from "@/services/supabase-data.service";

export function MyReservations() {
  return (
    <ProtectedRoute>
      <MyReservationsContent />
    </ProtectedRoute>
  );
}

function MyReservationsContent() {
  const [reservations, setReservations] = useState<ReservationRow[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const result = await fetchMyReservations();
    setReservations(result.data);
    if (result.error) setMessage(result.error);
  }

  useEffect(() => {
    load();
  }, []);

  async function cancel(id: number) {
    const result = await updateReservationStatus(id, "annulee");
    setMessage(result.message);
    await load();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-black text-court-900">Mes réservations</h1>
      <p className="mt-3 text-ink-500">Consulte et annule tes réservations si nécessaire.</p>
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
    </div>
  );
}
