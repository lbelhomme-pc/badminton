"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarClock, Info, MapPin, ShieldCheck } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatFullDate } from "@/lib/club-week";
import {
  getReservationActionState,
  reservationActionLabel,
  type ReservationActionState
} from "@/lib/reservation-rules";
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

function formatDateTime(value: string | null | undefined) {
  if (!value) return "non configuré";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

function stateTone(state: ReservationActionState) {
  if (state === "reservable") return "success" as const;
  if (state === "waitlist_available" || state === "not_open_yet") return "warning" as const;
  if (state === "closed_exceptionally" || state === "closed") return "danger" as const;
  return "neutral" as const;
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
    void loadAvailability();
  }, [loadAvailability]);

  useEffect(() => {
    function refreshVisiblePage() {
      if (document.visibilityState === "visible") {
        void loadAvailability(true);
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
    if (pendingActionKey === actionKey) return;

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
    if (pendingActionKey === actionKey) return;

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
        <p className="font-display text-sm font-bold uppercase text-court-600">Réservation adhérent</p>
        <h1 className="mt-2 text-4xl font-black text-court-900">Réserver un créneau</h1>
        <p className="mt-3 max-w-3xl text-ink-500">
          Choisis une date, vérifie les règles affichées, puis confirme ta place. La validation finale se fait en base pour éviter les doubles
          réservations et les dépassements de capacité.
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
          <Card className="p-5 text-sm font-semibold text-ink-500">Aucun créneau habituel n'est prévu ce jour-là.</Card>
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
  const alreadyReserved = Boolean(creneau.user_reservation_status && !["annulee", "refusee"].includes(creneau.user_reservation_status));
  const alreadyWaiting = Boolean(creneau.user_waiting_status && ["en_attente", "notifiee"].includes(creneau.user_waiting_status));
  const full = creneau.places_left === 0;
  const reserveActionKey = `${creneau.id}-${creneau.occurrence_date}-reserve`;
  const cancelActionKey = `${creneau.id}-${creneau.occurrence_date}-cancel`;
  const pendingReserve = pendingActionKey === reserveActionKey;
  const pendingCancel = pendingActionKey === cancelActionKey;
  const actionState = useMemo(
    () =>
      getReservationActionState({
        reservationActive: Boolean(creneau.reservation_active),
        isCancelled: Boolean(creneau.is_cancelled),
        opensAt: creneau.opens_at,
        closesAt: creneau.closes_at,
        placesLeft: creneau.places_left,
        alreadyReserved,
        alreadyWaiting
      }),
    [alreadyReserved, alreadyWaiting, creneau]
  );
  const canClickReserve = actionState === "reservable" || actionState === "waitlist_available";

  function renderAction() {
    if (alreadyReserved) {
      return (
        <Button className="mt-5 w-full" variant="outline" disabled={pendingCancel} onClick={() => onCancel(creneau)}>
          {pendingCancel ? "Annulation..." : reservationActionLabel(actionState)}
        </Button>
      );
    }

    return (
      <Button className="mt-5 w-full" disabled={pendingReserve || !canClickReserve} onClick={() => onReserve(creneau)}>
        {pendingReserve ? "Réservation..." : reservationActionLabel(actionState)}
      </Button>
    );
  }

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-court-900">
            {creneau.jour} · {creneau.type}
          </h2>
          <p className="mt-2 text-sm text-ink-500">
            {creneau.heure_debut.slice(0, 5)} - {creneau.heure_fin.slice(0, 5)}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-500">
            <MapPin className="h-4 w-4 text-court-500" aria-hidden="true" />
            {creneau.gymnase}
          </p>
          <p className="mt-1 text-sm text-ink-500">
            {creneau.public} · {creneau.niveau}
          </p>
          <p className="mt-1 text-sm font-semibold text-court-700">Responsable : {creneau.responsable || "Responsable non précisé"}</p>
        </div>
        <Badge variant={stateTone(actionState)}>{reservationActionLabel(actionState)}</Badge>
      </div>

      {creneau.is_cancelled ? (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          {creneau.cancellation_reason || "Fermeture exceptionnelle du club."}
        </p>
      ) : (
        <div className="mt-4 grid gap-2 rounded-lg bg-court-50 p-3 text-sm">
          <p className="font-black text-court-900">
            {creneau.places_left == null
              ? "Capacité non limitée"
              : `${creneau.places_left} place${creneau.places_left > 1 ? "s" : ""} restante${creneau.places_left > 1 ? "s" : ""}`}
          </p>
          <p className="text-ink-500">
            {creneau.reserved_count} inscrit{creneau.reserved_count > 1 ? "s" : ""} confirmé{creneau.reserved_count > 1 ? "s" : ""}
            {creneau.waiting_count > 0 ? ` · ${creneau.waiting_count} en attente` : ""}
          </p>
        </div>
      )}

      <div className="mt-4 rounded-lg border border-court-100 bg-white p-3 text-sm leading-6 text-ink-600">
        <p className="flex gap-2 font-bold text-court-900">
          <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-court-500" aria-hidden="true" />
          Règles applicables
        </p>
        <p className="mt-2">
          Ouverture : {formatDateTime(creneau.opens_at)} · Fermeture : {formatDateTime(creneau.closes_at)}
        </p>
        <p>Annulation possible jusqu'à : {formatDateTime(creneau.cancellation_deadline_at)}</p>
        {creneau.reservation_message ? (
          <p className="mt-2 flex gap-2 rounded-lg bg-court-50 px-3 py-2">
            <Info className="mt-1 h-4 w-4 shrink-0 text-court-500" aria-hidden="true" />
            {creneau.reservation_message}
          </p>
        ) : null}
      </div>

      <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-ink-500">
        <CalendarClock className="h-4 w-4 text-court-500" aria-hidden="true" />
        Confirmation immédiate après validation Supabase.
      </p>

      {renderAction()}
    </Card>
  );
}
