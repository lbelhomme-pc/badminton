"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { formatFullDate, getCurrentClubWeek } from "@/lib/club-week";
import { fetchCreneauAvailability, type CreneauAvailabilityRow } from "@/services/supabase-data.service";

export function WeeklyAvailability() {
  const week = useMemo(() => getCurrentClubWeek(), []);
  const [items, setItems] = useState<CreneauAvailabilityRow[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCreneauAvailability(week.start, week.end).then((result) => {
      setItems(result.data);
      setMessage(result.error);
      setLoading(false);
    });
  }, [week.end, week.start]);

  return (
    <Card className="mb-8 p-6">
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-court-600">Cette semaine</p>
          <h2 className="mt-2 text-2xl font-black text-court-900">Places disponibles</h2>
          <p className="mt-3 text-sm leading-6 text-ink-500">
            Semaine du {week.label}. Les annulations exceptionnelles et les réservations sont prises en compte.
          </p>
        </div>

        <div className="grid gap-3">
          {loading ? <p className="rounded-lg bg-court-50 p-4 text-sm font-semibold text-ink-500">Chargement des disponibilités...</p> : null}
          {message ? <p className="rounded-lg bg-yellow-50 p-4 text-sm font-semibold text-yellow-800">{message}</p> : null}
          {!loading && !message && items.length === 0 ? (
            <p className="rounded-lg bg-court-50 p-4 text-sm font-semibold text-ink-500">Aucun créneau actif cette semaine.</p>
          ) : null}
          {items.map((item) => {
            const full = item.places_left === 0;

            return (
              <div
                key={`${item.id}-${item.occurrence_date}`}
                className="grid gap-3 rounded-lg border border-court-200 bg-court-50 p-4 md:grid-cols-[170px_150px_1fr_150px]"
              >
                <p className="font-black capitalize text-court-900">{formatFullDate(item.occurrence_date)}</p>
                <p className="font-semibold text-ink-700">
                  {item.heure_debut.slice(0, 5)} - {item.heure_fin.slice(0, 5)}
                </p>
                <div>
                  <p className="font-black text-court-900">{item.niveau || item.type}</p>
                  <p className="mt-1 text-sm text-ink-500">
                    {item.gymnase} · {item.reserved_count} inscrit{item.reserved_count > 1 ? "s" : ""}
                    {item.waiting_count > 0 ? ` · ${item.waiting_count} en attente` : ""}
                  </p>
                  {item.is_cancelled ? (
                    <p className="mt-2 text-sm font-semibold text-red-700">{item.cancellation_reason || "Annulé exceptionnellement"}</p>
                  ) : null}
                </div>
                <p className={item.is_cancelled ? "rounded-lg bg-red-50 px-3 py-2 text-center text-sm font-black text-red-700" : full ? "rounded-lg bg-yellow-100 px-3 py-2 text-center text-sm font-black text-yellow-800" : "rounded-lg bg-white px-3 py-2 text-center text-sm font-black text-court-700"}>
                  {item.is_cancelled ? "Annulé" : item.places_left == null ? "Ouvert" : `${item.places_left} place${item.places_left > 1 ? "s" : ""}`}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
