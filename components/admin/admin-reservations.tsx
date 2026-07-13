"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminFeedback, actionFeedback, errorFeedback, loadingFeedback, successFeedback, type AdminFeedbackMessage } from "@/components/admin/admin-feedback";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminRoute } from "@/components/auth/admin-route";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { buildReservationCsv } from "@/lib/reservation-rules";
import { reservationStatusLabel } from "@/lib/status-labels";
import {
  fetchAllReservations,
  updateReservationStatus,
  type ReservationRow
} from "@/services/supabase-data.service";

const statuses = ["en_attente", "confirmee", "annulee", "refusee"];

export function AdminReservations() {
  return (
    <AdminRoute requiredRole="manager">
      <AdminReservationsContent />
    </AdminRoute>
  );
}

function AdminReservationsContent() {
  const [reservations, setReservations] = useState<ReservationRow[]>([]);
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [feedback, setFeedback] = useState<AdminFeedbackMessage>(null);

  async function load() {
    const result = await fetchAllReservations();
    setReservations(result.data);
    if (result.error) {
      setFeedback(errorFeedback(result.error));
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () =>
      reservations.filter((reservation) => {
        const matchDate = !dateFilter || reservation.date_reservation === dateFilter;
        const matchStatus = !statusFilter || reservation.statut === statusFilter;
        return matchDate && matchStatus;
      }),
    [dateFilter, reservations, statusFilter]
  );

  async function updateStatus(id: number, statut: string) {
    const label = reservationStatusLabel(statut).toLowerCase();

    if (statut === "annulee" || statut === "refusee") {
      const confirmed = window.confirm(`Passer cette réservation en statut "${reservationStatusLabel(statut)}" ?`);
      if (!confirmed) return;
    }

    setFeedback(loadingFeedback("Mise à jour de la réservation en cours..."));
    const result = await updateReservationStatus(id, statut);
    setFeedback(result.ok ? successFeedback(`Réservation ${label}.`) : actionFeedback(result));
    if (result.ok) await load();
  }

  function exportCsv() {
    const csv = buildReservationCsv(
      filtered.map((reservation) => ({
        date: reservation.date_reservation,
        creneau: reservation.creneaux?.jour || "Créneau",
        heure: reservation.creneaux
          ? `${reservation.creneaux.heure_debut.slice(0, 5)}-${reservation.creneaux.heure_fin.slice(0, 5)}`
          : "",
        lieu: reservation.creneaux?.gymnase,
        adherent: reservation.member_name || reservation.user_id,
        email: reservation.member_email,
        statut: reservationStatusLabel(reservation.statut)
      }))
    );
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `reservations-cfvv-${dateFilter || "toutes"}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setFeedback(successFeedback("Export CSV généré."));
  }

  return (
    <AdminShell title="Réservations" intro="Suivi simple des réservations et des annulations.">
      <Card className="grid gap-4 p-5 md:grid-cols-3">
        <label className="grid gap-2 text-sm font-semibold text-court-900">
          Date
          <input
            type="date"
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value)}
            className="h-11 rounded-lg border border-court-200 bg-court-50 px-3"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-court-900">
          Statut
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-11 rounded-lg border border-court-200 bg-court-50 px-3"
          >
            <option value="">Tous</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {reservationStatusLabel(status)}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end gap-3">
          <Button className="w-full md:w-auto" variant="outline" onClick={() => { setDateFilter(""); setStatusFilter(""); }}>
            Réinitialiser
          </Button>
          <Button className="w-full md:w-auto" type="button" onClick={exportCsv} disabled={filtered.length === 0}>
            Export CSV
          </Button>
        </div>
      </Card>

      <AdminFeedback feedback={feedback} className="mt-6" />

      <section className="mt-8 grid gap-4">
        {filtered.map((reservation) => (
          <Card key={reservation.id} className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="font-black text-court-900">
                {reservation.creneaux?.jour || "Créneau"} · {reservation.date_reservation}
              </p>
              <p className="mt-1 text-sm text-ink-500">
                {reservation.creneaux?.gymnase || "Gymnase"} · {reservation.creneaux?.heure_debut?.slice(0, 5)} - {reservation.creneaux?.heure_fin?.slice(0, 5)}
              </p>
              <p className="mt-1 text-xs font-semibold text-ink-500">
                Adhérent : {reservation.member_name || reservation.member_email || reservation.user_id}
              </p>
              {reservation.member_email && reservation.member_name ? (
                <p className="mt-1 text-xs text-ink-500">{reservation.member_email}</p>
              ) : null}
            </div>
            <select
              value={reservation.statut}
              onChange={(event) => updateStatus(reservation.id, event.target.value)}
              className="h-11 w-full rounded-lg border border-court-200 bg-court-50 px-3 text-sm font-semibold text-court-900 md:w-auto"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {reservationStatusLabel(status)}
                </option>
              ))}
            </select>
          </Card>
        ))}
      </section>
    </AdminShell>
  );
}
