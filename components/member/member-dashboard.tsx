"use client";

import Link from "next/link";
import { CalendarDays, ShoppingBag, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useClub, useReservedSlots } from "@/hooks/use-club-store";
import { formatDate, formatEuros, formatTime } from "@/lib/utils";

export function MemberDashboard() {
  const { currentUser, orders, cancelReservation } = useClub();
  const reservedSlots = useReservedSlots();

  if (!currentUser) {
    return (
      <Card className="p-8 text-center">
        <h1 className="text-3xl font-black text-court-900">Connectez-vous à votre espace</h1>
        <p className="mx-auto mt-3 max-w-lg text-ink-500">
          L'espace adhérent permet de suivre vos réservations, vos commandes de volants et vos préférences RGPD.
        </p>
        <Link className="mt-6 inline-flex h-12 items-center rounded-lg bg-court-500 px-5 font-semibold text-white" href="/connexion">
          Se connecter
        </Link>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
      <section className="space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-court-600">Espace adhérent</p>
          <h1 className="mt-2 text-4xl font-black text-court-900">Bonjour {currentUser.firstName}</h1>
          <p className="mt-2 text-ink-500">Vos prochaines actions club sont regroupées ici.</p>
        </div>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-6 w-6 text-court-500" aria-hidden="true" />
            <h2 className="text-2xl font-black text-court-900">Mes réservations</h2>
          </div>
          {reservedSlots.length === 0 ? (
            <div className="mt-5 rounded-lg bg-court-100 p-5">
              <p className="font-semibold text-court-900">Aucune réservation à venir.</p>
              <p className="mt-1 text-sm text-ink-500">Choisissez un créneau et réservez votre place en quelques secondes.</p>
              <Link className="mt-4 inline-flex rounded-lg bg-court-500 px-4 py-3 text-sm font-semibold text-white" href="/planning">
                Voir les créneaux
              </Link>
            </div>
          ) : (
            <div className="mt-5 grid gap-3">
              {reservedSlots.map(({ reservation, slot }) => (
                <div key={reservation.id} className="rounded-lg border border-court-200 bg-court-50 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-court-900">{slot.title}</p>
                      <p className="mt-1 text-sm text-ink-500">
                        {formatDate(slot.startsAt)} · {formatTime(slot.startsAt)} - {formatTime(slot.endsAt)} · {slot.venueName}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => cancelReservation(reservation.id)}>
                      Annuler
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </section>

      <aside className="space-y-4">
        <Card className="p-5">
          <UserRound className="h-6 w-6 text-court-500" aria-hidden="true" />
          <h2 className="mt-3 text-xl font-black text-court-900">Profil</h2>
          <div className="mt-3 grid gap-2 text-sm text-ink-500">
            <p>{currentUser.displayName}</p>
            <p>{currentUser.email}</p>
            <p>Affichage public : {currentUser.consentShowName ? "autorisé" : "masqué"}</p>
          </div>
        </Card>

        <Card className="p-5">
          <ShoppingBag className="h-6 w-6 text-court-500" aria-hidden="true" />
          <h2 className="mt-3 text-xl font-black text-court-900">Volants</h2>
          {orders.length === 0 ? (
            <p className="mt-2 text-sm text-ink-500">Aucune commande en cours.</p>
          ) : (
            <div className="mt-3 grid gap-2">
              {orders.slice(0, 3).map((order) => (
                <div key={order.id} className="rounded-lg bg-court-100 px-3 py-2 text-sm">
                  <p className="font-semibold text-court-900">{order.productLabel} x{order.quantity}</p>
                  <p className="text-ink-500">{formatEuros(order.totalCents)} · à payer</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </aside>
    </div>
  );
}
