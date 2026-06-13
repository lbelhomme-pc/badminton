import { PlanningExperience } from "@/components/planning/planning-experience";
import { Card } from "@/components/ui/card";
import { formatTime, slotTypeLabel } from "@/lib/utils";
import { getUpcomingSlots } from "@/services/club.service";

export default function CreneauxPage() {
  const weeklySlots = getUpcomingSlots();

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
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-court-600">Semaine type</p>
            <h2 className="mt-2 text-2xl font-black text-court-900">Créneaux habituels</h2>
            <p className="mt-3 text-sm leading-6 text-ink-500">
              Tous les créneaux ont lieu au Gymnase des Aigremonts. Responsable créneaux : Didier Remule.
            </p>
          </div>
          <div className="grid gap-3">
            {weeklySlots.map((slot) => {
              const dayLabel = new Intl.DateTimeFormat("fr-FR", { weekday: "long" }).format(new Date(slot.startsAt));

              return (
                <div
                  key={slot.id}
                  className="grid gap-3 rounded-lg border border-court-200 bg-court-50 p-4 md:grid-cols-[120px_150px_1fr_150px]"
                >
                  <p className="font-black capitalize text-court-900">{dayLabel}</p>
                  <p className="font-semibold text-ink-700">
                    {formatTime(slot.startsAt)} - {formatTime(slot.endsAt)}
                  </p>
                  <div>
                    <p className="font-black text-court-900">{slot.title}</p>
                    <p className="mt-1 text-sm text-ink-500">{slotTypeLabel(slot.type)} · {slot.audience}</p>
                  </div>
                  <p className="rounded-lg bg-white px-3 py-2 text-center text-sm font-black text-court-700">
                    {slot.capacityMax} places disponibles
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <PlanningExperience slots={weeklySlots} />
    </div>
  );
}
