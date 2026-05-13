import { PlanningExperience } from "@/components/planning/planning-experience";
import { Card } from "@/components/ui/card";
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

      <Card className="mb-8 p-6">
        <div className="grid gap-6 lg:grid-cols-[180px_1fr]">
          <div>
            <p className="text-lg font-black text-court-900">Octobre</p>
            <p className="mt-1 text-sm font-semibold text-ink-500">Créneaux réguliers</p>
          </div>
          <div>
            <h2 className="text-lg font-black text-danger">Créneaux d'entraînements</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-7 text-ink-700">
              <li>Mardi : 19h30 à 22h30</li>
              <li>Mercredi : 18h30 à 20h30</li>
              <li>Jeudi : 19h30 à 22h30</li>
              <li>Vendredi : sur réservation selon le nombre de participants</li>
            </ul>
            <p className="mt-5 text-base text-ink-600">Le CFVV41</p>
          </div>
        </div>
      </Card>

      <PlanningExperience slots={getUpcomingSlots()} />
    </div>
  );
}
