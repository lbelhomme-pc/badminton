"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createReservation, fetchCreneaux, type CreneauRow } from "@/services/supabase-data.service";

export function ReservationCreneau() {
  return (
    <ProtectedRoute>
      <ReservationCreneauContent />
    </ProtectedRoute>
  );
}

function ReservationCreneauContent() {
  const { user } = useAuth();
  const [creneaux, setCreneaux] = useState<CreneauRow[]>([]);
  const [dateReservation, setDateReservation] = useState(new Date().toISOString().slice(0, 10));
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchCreneaux().then((result) => {
      setCreneaux(result.data.filter((creneau) => creneau.actif));
      if (result.error) setMessage(result.error);
    });
  }, []);

  async function reserve(creneauId: number) {
    if (!user) {
      setMessage("Tu dois être connecté pour réserver un créneau.");
      return;
    }

    const result = await createReservation(user.id, creneauId, dateReservation);
    setMessage(result.message);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-4xl font-black text-court-900">Réserver un créneau</h1>
        <p className="mt-3 text-ink-500">Choisis une date, puis réserve un créneau actif.</p>
      </div>
      <Card className="mb-6 p-5">
        <label className="grid max-w-xs gap-2 text-sm font-semibold text-court-900">
          Date de réservation
          <input
            type="date"
            value={dateReservation}
            onChange={(event) => setDateReservation(event.target.value)}
            className="h-11 rounded-lg border border-court-200 bg-court-50 px-3"
          />
        </label>
      </Card>
      {message ? <p className="mb-6 rounded-lg bg-court-100 px-4 py-3 text-sm font-semibold text-court-900">{message}</p> : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {creneaux.map((creneau) => (
          <Card key={creneau.id} className="p-5">
            <h2 className="text-xl font-black text-court-900">{creneau.jour} · {creneau.type}</h2>
            <p className="mt-2 text-sm text-ink-500">{creneau.heure_debut.slice(0, 5)} - {creneau.heure_fin.slice(0, 5)}</p>
            <p className="mt-1 text-sm text-ink-500">{creneau.gymnase}</p>
            <p className="mt-1 text-sm text-ink-500">{creneau.public} · {creneau.niveau}</p>
            <p className="mt-1 text-sm font-semibold text-court-700">Responsable : {creneau.responsable || "À renseigner"}</p>
            <Button className="mt-5 w-full" onClick={() => reserve(creneau.id)}>
              Réserver
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
