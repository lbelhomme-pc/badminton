"use client";

import { AlertTriangle, CalendarDays, FileUp, PackageCheck, ShieldCheck, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useClub } from "@/hooks/use-club-store";
import { slots } from "@/lib/mock-data";
import { formatDate, formatEuros, formatTime, slotStatusLabel } from "@/lib/utils";

export function AdminDashboard() {
  const { currentUser, hasRole, loginAs, reservations, orders } = useClub();

  if (!currentUser || !hasRole("admin")) {
    return (
      <Card className="mx-auto max-w-2xl p-8 text-center">
        <ShieldCheck className="mx-auto h-10 w-10 text-info" aria-hidden="true" />
        <h1 className="mt-4 text-3xl font-black text-court-900">Interface admin protégée</h1>
        <p className="mt-3 text-ink-500">
          Cet espace est réservé aux responsables du club.
        </p>
        <Button className="mt-6" variant="secondary" onClick={() => loginAs("admin")}>
          Entrer comme responsable
        </Button>
      </Card>
    );
  }

  const openSlots = slots.filter((slot) => slot.status === "open").length;
  const activeReservations = reservations.filter((reservation) => reservation.status === "confirmed").length;
  const pendingOrders = orders.filter((order) => order.status === "to_pay").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-court-600">Admin club</p>
          <h1 className="mt-2 text-4xl font-black text-court-900">Tableau de bord</h1>
          <p className="mt-2 text-ink-500">Les actions essentielles du club sont regroupées ici.</p>
        </div>
        <Button variant="secondary">Publier une alerte</Button>
      </div>

      <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 text-orange-800">
        <div className="flex gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-bold">Alerte créneau</p>
            <p className="text-sm">Le créneau du vendredi est complet. Prévoir une communication si la liste d'attente est activée en V2.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric icon={CalendarDays} label="Créneaux ouverts" value={String(openSlots)} />
        <Metric icon={UsersRound} label="Réservations actives" value={String(activeReservations)} />
        <Metric icon={PackageCheck} label="Commandes à payer" value={String(pendingOrders)} />
        <Metric icon={FileUp} label="Classements" value="CSV prêt" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-black text-court-900">Planning</h2>
            <Button variant="outline" size="sm">Ajouter un créneau</Button>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="text-xs uppercase text-ink-500">
                <tr>
                  <th className="py-3">Créneau</th>
                  <th className="py-3">Date</th>
                  <th className="py-3">Lieu</th>
                  <th className="py-3">Places</th>
                  <th className="py-3">Statut</th>
                  <th className="py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-court-200">
                {slots.map((slot) => (
                  <tr key={slot.id}>
                    <td className="py-3 font-semibold text-court-900">{slot.title}</td>
                    <td className="py-3 text-ink-500">{formatDate(slot.startsAt, "short")} · {formatTime(slot.startsAt)}</td>
                    <td className="py-3 text-ink-500">{slot.venueName}</td>
                    <td className="py-3 text-ink-500">{slot.registeredCount}/{slot.capacityMax}</td>
                    <td className="py-3 text-ink-500">{slotStatusLabel(slot.status)}</td>
                    <td className="py-3 text-right">
                      <Button variant="outline" size="sm">Voir</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="text-2xl font-black text-court-900">Commandes volants</h2>
            {orders.length === 0 ? (
              <p className="mt-3 text-sm text-ink-500">Aucune commande en attente.</p>
            ) : (
              <div className="mt-4 grid gap-3">
                {orders.map((order) => (
                  <div key={order.id} className="rounded-lg bg-court-50 p-3">
                    <p className="font-semibold text-court-900">{order.productLabel} x{order.quantity}</p>
                    <p className="text-sm text-ink-500">{formatEuros(order.totalCents)} · à payer</p>
                    <Button className="mt-3" size="sm" variant="outline">Marquer payé</Button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="text-2xl font-black text-court-900">Import classements</h2>
            <div className="mt-4 rounded-lg border border-dashed border-court-300 bg-court-100 p-5 text-center">
              <FileUp className="mx-auto h-8 w-8 text-ink-500" aria-hidden="true" />
              <p className="mt-3 font-semibold text-court-900">Déposer un CSV</p>
              <p className="mt-1 text-sm text-ink-500">Le fichier sera vérifié avant mise à jour des classements.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: string }) {
  return (
    <Card className="p-5">
      <Icon className="h-6 w-6 text-court-500" aria-hidden="true" />
      <p className="mt-4 text-3xl font-black text-court-900">{value}</p>
      <p className="mt-1 text-sm font-medium text-ink-500">{label}</p>
    </Card>
  );
}
