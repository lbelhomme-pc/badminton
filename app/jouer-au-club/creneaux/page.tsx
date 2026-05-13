import { PlanningExperience } from "@/components/planning/planning-experience";
import { getUpcomingSlots } from "@/services/club.service";

export default function CreneauxPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 rounded-lg border border-court-200 bg-white p-6 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-wide text-court-600">Jouer au club</p>
        <h1 className="mt-2 text-4xl font-black text-court-900">Créneaux du CFVV41</h1>
        <p className="mt-3 max-w-2xl text-ink-500">
          Tous les créneaux du club, avec filtres, recherche, statut et réservation.
        </p>
      </div>
      <PlanningExperience slots={getUpcomingSlots()} />
    </div>
  );
}
