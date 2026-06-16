"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatFullDate } from "@/lib/club-week";
import {
  cancelReservationForSlot,
  createReservation,
  fetchCreneauAvailability,
  type CreneauAvailabilityRow
} from "@/services/supabase-data.service";

type Feedback = { tone: "success" | "error" | "info"; text: string };

function publicReservationMessage(value: string) {
  return value === "Configuration Supabase manquante."
    ? "Le service de réservation n'est pas encore disponible. Contacte le club si tu veux réserver."
    : value;
}

export function ReservationCreneau() {
  return (
    <ProtectedRoute>
      <ReservationCreneauContent />
    </ProtectedRoute>
  );
}

function ReservationCreneauContent() {
  const { user } = useAuth();
  const [creneaux, setCreneaux] = useState<CreneauAvailabilityRow[]>([]);
  const [dateReservation, setDateReservation] = useState(new Date().toISOString().slice(0, 10));
  const [message, setMessage] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingActionKey, setPendingActionKey] = useState<string | null>(null);

  const loadAvailability = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      const result = await fetchCreneauAvailability(dateReservation, dateReservation);
      setCreneaux(result.data);
      if (result.error) {
        setMessage({ tone: "error", text: publicReservationMessage(result.error) });
      } else if (!silent) {
        setMessage(null);
      }
      if (!silent) setLoading(false);
    },
    [dateReservation]
  );

  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  useEffect(() => {
    function refreshVisiblePage() {
      if (document.visibilityState === "visible") {
        loadAvailability(true);
      }
    }

    window.addEventListener("focus", refreshVisiblePage);
    document.addEventListener("visibilitychange", refreshVisiblePage);

    return () => {
      window.removeEventListener("focus", refreshVisiblePage);
      document.removeEventListener("visibilitychange", refreshVisiblePage);
    };
  }, [loadAvailability]);

  async function reserve(creneau: CreneauAvailabilityRow) {
    if (!user) {
      setMessage({ tone: "error", text: "Tu dois être connecté pour réserver un créneau." });
      return;
    }

    const actionKey = `${creneau.id}-${creneau.occurrence_date}-reserve`;
    setPendingActionKey(actionKey);
    setMessage({ tone: "info", text: "Réservation en cours..." });

    try {
      const result = await createReservation(user.id, creneau.id, creneau.occurrence_date);
      setMessage({ tone: result.ok ? "success" : "error", text: publicReservationMessage(result.message) });
      await loadAvailability(true);
    } finally {
      setPendingActionKey(null);
    }
  }

  async function cancel(creneau: CreneauAvailabilityRow) {
    const label = `${creneau.jour} ${creneau.heure_debut.slice(0, 5)} - ${creneau.heure_fin.slice(0, 5)}`;
    const confirmed = window.confirm(`Annuler ta réservation pour ${label} ?`);
    if (!confirmed) return;

    const actionKey = `${creneau.id}-${creneau.occurrence_date}-cancel`;
    setPendingActionKey(actionKey);
    setMessage({ tone: "info", text: "Annulation en cours..." });

    try {
      const result = await cancelReservationForSlot({
        reservationId: creneau.user_reservation_id,
        creneauId: creneau.id,
        dateReservation: creneau.occurrence_date
      });
      setMessage({ tone: result.ok ? "success" : "error", text: publicReservationMessage(result.message) });
      await loadAvailability(true);
    } finally {
      setPendingActionKey(null);
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
      <div className="mb-6">
        <h1 className="text-4xl font-black text-court-900">Réserver un créneau</h1>
        <p className="mt-3 text-ink-500">
          Choisis une date. Si le créneau est complet, tu peux rejoindre la liste d'attente.
        </p>
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
        <p className="mt-3 text-sm font-semibold capitalize text-ink-500">{formatFullDate(dateReservation)}</p>
      </Card>
      {message ? (
        <p className={`mb-6 rounded-lg px-4 py-3 text-sm font-semibold ${messageClassName}`} aria-live="polite">
          {message.text}
        </p>
      ) : null}
      {loading ? <Card className="p-5 text-sm font-semibold text-ink-500">Chargement des disponibilités...</Card> : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {creneaux.map((creneau) => (
          <ReservationCard
            key={`${creneau.id}-${creneau.occurrence_date}`}
            creneau={creneau}
            pendingActionKey={pendingActionKey}
            onCancel={cancel}
            onReserve={reserve}
          />
        ))}
        {!loading && creneaux.length === 0 ? (
          <Card className="p-5 text-sm font-semibold text-ink-500">
            Aucun créneau habituel n'est prévu ce jour-là.
          </Card>
        ) : null}
      </div>
    </div>
  );
}

function ReservationCard({
  creneau,
  pendingActionKey,
  onCancel,
  onReserve
}: {
  creneau: CreneauAvailabilityRow;
  pendingActionKey: string | null;
  onCancel: (creneau: CreneauAvailabilityRow) => void;
  onReserve: (creneau: CreneauAvailabilityRow) => void;
}) {
  const alreadyReserved = creneau.user_reservation_status && !["annulee", "refusee"].includes(creneau.user_reservation_status);
  const alreadyWaiting = creneau.user_waiting_status && ["en_attente", "notifiee"].includes(creneau.user_waiting_status);
  const full = creneau.places_left === 0;
  const reserveActionKey = `${creneau.id}-${creneau.occurrence_date}-reserve`;
  const cancelActionKey = `${creneau.id}-${creneau.occurrence_date}-cancel`;
  const pendingReserve = pendingActionKey === reserveActionKey;
  const pendingCancel = pendingActionKey === cancelActionKey;

  function renderAction() {
    if (creneau.is_cancelled) {
      return (
        <Button className="mt-5 w-full" disabled>
          Créneau annulé
        </Button>
      );
    }

    if (alreadyReserved) {
      return (
        <Button className="mt-5 w-full" variant="outline" disabled={pendingCancel} onClick={() => onCancel(creneau)}>
          {pendingCancel ? "Annulation..." : "Annuler ma réservation"}
        </Button>
      );
    }

    if (alreadyWaiting) {
      return (
        <Button className="mt-5 w-full" disabled>
          Déjà en attente
        </Button>
      );
    }

    return (
      <Button className="mt-5 w-full" disabled={pendingReserve} onClick={() => onReserve(creneau)}>
        {pendingReserve ? "Réservation..." : full ? "Rejoindre la liste d'attente" : "Réserver"}
      </Button>
    );
  }

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-court-900">{creneau.jour} · {creneau.type}</h2>
          <p className="mt-2 text-sm text-ink-500">{creneau.heure_debut.slice(0, 5)} - {creneau.heure_fin.slice(0, 5)}</p>
          <p className="mt-1 text-sm text-ink-500">{creneau.gymnase}</p>
          <p className="mt-1 text-sm text-ink-500">{creneau.public} · {creneau.niveau}</p>
          <p className="mt-1 text-sm font-semibold text-court-700">Responsable : {creneau.responsable || "Responsable non précisé"}</p>
        </div>
        <span className={creneau.is_cancelled ? "rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-700" : full ? "rounded-full bg-yellow-100 px-3 py-1 text-xs font-black text-yellow-800" : "rounded-full bg-court-100 px-3 py-1 text-xs font-black text-court-700"}>
          {creneau.is_cancelled ? "Annulé" : full ? "Complet" : "Ouvert"}
        </span>
      </div>

      {creneau.is_cancelled ? (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          {creneau.cancellation_reason || "Annulation exceptionnelle du club."}
        </p>
      ) : (
        <div className="mt-4 grid gap-2 rounded-lg bg-court-50 p-3 text-sm">
          <p className="font-black text-court-900">
            {creneau.places_left == null ? "Capacité non limitée" : `${creneau.places_left} place${creneau.places_left > 1 ? "s" : ""} restante${creneau.places_left > 1 ? "s" : ""}`}
          </p>
          <p className="text-ink-500">
            {creneau.reserved_count} inscrit{creneau.reserved_count > 1 ? "s" : ""} confirmé{creneau.reserved_count > 1 ? "s" : ""}
            {creneau.waiting_count > 0 ? ` · ${creneau.waiting_count} en attente` : ""}
          </p>
        </div>
      )}

      {renderAction()}
    </Card>
  );
}
