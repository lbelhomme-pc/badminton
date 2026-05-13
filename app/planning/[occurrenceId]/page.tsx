import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays, Clock, MapPin, UserRound, UsersRound } from "lucide-react";
import { SlotDetailActions } from "@/components/planning/slot-detail-actions";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatTime, slotStatusClass, slotStatusLabel, slotTypeLabel } from "@/lib/utils";
import { getSlotById } from "@/services/club.service";

interface SlotDetailPageProps {
  params: Promise<{
    occurrenceId: string;
  }>;
}

export async function generateMetadata({ params }: SlotDetailPageProps): Promise<Metadata> {
  const { occurrenceId } = await params;
  const slot = getSlotById(occurrenceId);

  return {
    title: slot ? `${slot.title} - CFVV41` : "Créneau introuvable",
    description: slot ? `Détail du créneau ${slot.title} au ${slot.venueName}.` : undefined
  };
}

export default async function SlotDetailPage({ params }: SlotDetailPageProps) {
  const { occurrenceId } = await params;
  const slot = getSlotById(occurrenceId);

  if (!slot) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <section>
          <Badge className={slotStatusClass(slot.status)}>{slotStatusLabel(slot.status)}</Badge>
          <h1 className="mt-4 text-4xl font-black text-court-900">{slot.title}</h1>
          <p className="mt-3 text-lg font-semibold text-court-600">{slotTypeLabel(slot.type)} · {slot.recommendedLevel}</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              { icon: CalendarDays, label: "Date", value: formatDate(slot.startsAt) },
              { icon: Clock, label: "Horaire", value: `${formatTime(slot.startsAt)} - ${formatTime(slot.endsAt)}` },
              { icon: MapPin, label: "Lieu", value: `${slot.venueName}, ${slot.address}` },
              { icon: UserRound, label: "Responsable", value: slot.managerName },
              { icon: UsersRound, label: "Public", value: slot.audience },
              { icon: UsersRound, label: "Terrains", value: `${slot.courtsCount} terrains disponibles` }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-lg border border-court-200 bg-white p-4">
                  <Icon className="h-5 w-5 text-court-500" aria-hidden="true" />
                  <p className="mt-3 text-sm font-semibold text-ink-500">{item.label}</p>
                  <p className="mt-1 font-bold text-court-900">{item.value}</p>
                </div>
              );
            })}
          </div>

          <section className="mt-8 rounded-lg border border-court-200 bg-white p-5">
            <h2 className="text-2xl font-black text-court-900">Participants</h2>
            <p className="mt-2 text-sm leading-6 text-ink-500">
              Affichage limité : les noms complets sont visibles uniquement selon les droits et les consentements des adhérents.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Camille M.", "Nadia B.", "Thomas L.", "Élodie R.", "Alex B."].map((name) => (
                <span key={name} className="rounded-full bg-court-100 px-3 py-2 text-sm font-semibold text-court-900">
                  {name}
                </span>
              ))}
            </div>
          </section>
        </section>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <SlotDetailActions slot={slot} />
        </aside>
      </div>
    </div>
  );
}
