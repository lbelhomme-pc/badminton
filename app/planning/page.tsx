import type { Metadata } from "next";
import { PlanningExperience } from "@/components/planning/planning-experience";
import { getUpcomingSlots } from "@/services/club.service";

export const metadata: Metadata = {
  title: "Planning des créneaux - CFVV41",
  description: "Consultez les créneaux du club et réservez votre place."
};

export default function PlanningPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-court-600">Planning</p>
        <h1 className="mt-2 text-4xl font-black text-court-900">Créneaux du club</h1>
        <p className="mt-3 max-w-2xl text-ink-500">
          Recherchez par jour, niveau, type de séance ou gymnase. Les statuts indiquent les créneaux ouverts, complets ou réservés.
        </p>
      </div>
      <PlanningExperience slots={getUpcomingSlots()} />
    </div>
  );
}
