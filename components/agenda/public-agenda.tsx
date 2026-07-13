"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertTriangle, CalendarPlus, ExternalLink, Filter, Link2, MapPin, Paperclip, UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { eventCategoryLabel, filterEvents, generateEventIcs, getUpcomingPublicEvents, validateEvent } from "@/lib/public-planning";
import { formatDate, formatTime } from "@/lib/utils";
import type { ClubEvent, ClubEventCategory, ClubEventStatus } from "@/types/domain";

interface PublicAgendaProps {
  events: ClubEvent[];
  siteUrl: string;
}

const categoryOptions: Array<{ value: ClubEventCategory | "all"; label: string }> = [
  { value: "all", label: "Tous les événements" },
  { value: "competition", label: "Compétitions" },
  { value: "club_event", label: "Événements du club" },
  { value: "meeting", label: "Réunions" },
  { value: "camp", label: "Stages" },
  { value: "closure", label: "Fermetures" }
];

const statusLabels: Record<ClubEventStatus, string> = {
  draft: "Brouillon",
  published: "Publié",
  scheduled: "Programmé",
  cancelled: "Annulé"
};

function statusVariant(status: ClubEventStatus) {
  if (status === "cancelled") return "danger" as const;
  if (status === "scheduled") return "warning" as const;
  return "success" as const;
}

function eventDateLabel(event: ClubEvent) {
  if (!event.endsAt) {
    return `${formatDate(event.startsAt)} · ${formatTime(event.startsAt)}`;
  }

  const sameDay = event.startsAt.slice(0, 10) === event.endsAt.slice(0, 10);
  if (sameDay) {
    return `${formatDate(event.startsAt)} · ${formatTime(event.startsAt)} - ${formatTime(event.endsAt)}`;
  }

  return `${formatDate(event.startsAt)} ${formatTime(event.startsAt)} - ${formatDate(event.endsAt)} ${formatTime(event.endsAt)}`;
}

function icsDownloadHref(event: ClubEvent, siteUrl: string) {
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(generateEventIcs(event, siteUrl))}`;
}

export function PublicAgenda({ events, siteUrl }: PublicAgendaProps) {
  const [category, setCategory] = useState<ClubEventCategory | "all">("all");
  const upcomingEvents = useMemo(() => getUpcomingPublicEvents(events), [events]);
  const filteredEvents = useMemo(() => filterEvents(upcomingEvents, { category }), [category, upcomingEvents]);

  return (
    <section aria-labelledby="agenda-title">
      <Card className="mb-6 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 font-display text-sm font-bold uppercase text-court-600">
              <Filter className="h-4 w-4" aria-hidden="true" />
              Filtres
            </p>
            <h2 id="agenda-title" className="mt-2 text-2xl font-black text-court-900">
              Événements à venir
            </h2>
          </div>
          <label className="grid min-w-64 gap-2 text-sm font-bold text-court-900">
            Catégorie
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as ClubEventCategory | "all")}
              className="h-11 rounded-lg border border-court-200 bg-white px-3 text-base font-medium text-ink-700 outline-none transition focus:border-court-500 focus:ring-2 focus:ring-court-100"
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Card>

      {filteredEvents.length > 0 ? (
        <div className="grid gap-4">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} siteUrl={siteUrl} />
          ))}
        </div>
      ) : (
        <EmptyState
          title={upcomingEvents.length === 0 ? "Aucun événement publié pour le moment" : "Aucun événement dans cette catégorie"}
          text={
            upcomingEvents.length === 0
              ? "Les compétitions, réunions, stages, fermetures et temps forts du club apparaîtront ici dès leur publication."
              : "Change de filtre pour afficher les autres événements à venir."
          }
          action={
            <Link href="/contact">
              <Button variant="outline">Demander une information</Button>
            </Link>
          }
        />
      )}
    </section>
  );
}

function EventCard({ event, siteUrl }: { event: ClubEvent; siteUrl: string }) {
  const validationErrors = validateEvent(event);
  const isCancelled = event.status === "cancelled";
  const eventUrl = `${siteUrl.replace(/\/+$/, "")}/vie-du-club/evenements#${encodeURIComponent(event.id)}`;

  return (
    <Card id={event.id} className={isCancelled ? "border-red-200 bg-red-50/50 p-5" : "p-5"}>
      <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
        <div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="info">{eventCategoryLabel(event.category)}</Badge>
            <Badge variant={statusVariant(event.status)}>{statusLabels[event.status]}</Badge>
            {event.audience ? (
              <Badge variant="neutral" icon={<UsersRound className="h-3.5 w-3.5" />}>
                {event.audience}
              </Badge>
            ) : null}
          </div>

          <h3 className="mt-4 text-2xl font-black text-court-900">{event.title}</h3>
          <p className="mt-2 font-bold text-court-700">{eventDateLabel(event)}</p>

          {event.venueName ? (
            <p className="mt-3 flex items-center gap-2 text-sm text-ink-700">
              <MapPin className="h-4 w-4 text-court-500" aria-hidden="true" />
              {event.venueName}
            </p>
          ) : null}

          {isCancelled && event.cancellationMessage ? (
            <p className="mt-4 rounded-lg bg-red-100 px-4 py-3 text-sm font-bold text-red-700">{event.cancellationMessage}</p>
          ) : null}

          <p className="mt-4 leading-7 text-ink-600">{event.description}</p>

          {validationErrors.length > 0 ? (
            <p className="mt-4 flex items-start gap-2 rounded-lg bg-yellow-50 px-4 py-3 text-sm font-bold text-yellow-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              Données à compléter côté administration : {validationErrors.join(", ")}.
            </p>
          ) : null}
        </div>

        <div className="grid content-start gap-3">
          <a href={icsDownloadHref(event, siteUrl)} download={`cfvv-${event.id}.ics`}>
            <Button className="w-full">
              <CalendarPlus className="h-4 w-4" aria-hidden="true" />
              Ajouter à mon agenda
            </Button>
          </a>
          <a href={eventUrl}>
            <Button variant="outline" className="w-full">
              <Link2 className="h-4 w-4" aria-hidden="true" />
              Partager le lien
            </Button>
          </a>
          {event.externalUrl ? (
            <a href={event.externalUrl} target="_blank" rel="noreferrer">
              <Button variant="secondary" className="w-full">
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                S'inscrire / réserver
              </Button>
            </a>
          ) : null}
          {event.attachmentUrl ? (
            <a href={event.attachmentUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 font-display text-sm font-bold text-court-600 hover:text-court-900 hover:underline">
              <Paperclip className="h-4 w-4" aria-hidden="true" />
              Pièce jointe
            </a>
          ) : null}
          {event.contactHref && event.contactLabel ? (
            <a href={event.contactHref} className="text-center font-display text-sm font-bold text-court-600 hover:text-court-900 hover:underline">
              {event.contactLabel}
            </a>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
