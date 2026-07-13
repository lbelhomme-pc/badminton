import type { Metadata } from "next";
import { PlanningExperience } from "@/components/planning/planning-experience";
import { getUpcomingSlots } from "@/services/club.service";

export const metadata: Metadata = {
  title: "Réserver un créneau - CFVV",
  description: "Réservez rapidement une place sur un créneau ouvert."
};

export default function ReservationPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 rounded-lg border border-court-200 bg-white p-6 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-wide text-court-600">Réservation rapide</p>
        <h1 className="mt-2 text-4xl font-black text-court-900">Choisir un créneau ouvert</h1>
        <p className="mt-3 max-w-2xl text-ink-500">
          Connectez-vous à votre espace adhérent puis réservez votre place. Le club limite les réservations actives pour garder des créneaux accessibles.
        </p>
      </div>
      <PlanningExperience slots={getUpcomingSlots()} onlyOpen />
    </div>
  );
}
