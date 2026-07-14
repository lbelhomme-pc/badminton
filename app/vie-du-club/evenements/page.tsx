import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Clock, Info } from "lucide-react";
import { PublicAgenda } from "@/components/agenda/public-agenda";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { canonical, getSiteUrl } from "@/lib/seo";
import { getEventStructuredData, serializeStructuredData } from "@/lib/structured-data";
import { getPublicEvents } from "@/services/club.service";

export const metadata: Metadata = {
  title: "Agenda du club - CFVV",
  description:
    "Agenda du CFVV : compétitions, événements du club, réunions, stages, fermetures exceptionnelles et temps forts à Vendôme.",
  alternates: canonical("/vie-du-club/evenements")
};

export default async function EvenementsPage() {
  const events = await getPublicEvents();
  const eventStructuredData = getEventStructuredData(events);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {eventStructuredData ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeStructuredData(eventStructuredData) }} />
      ) : null}

      <section className="rounded-lg border border-court-200 bg-white p-6 shadow-soft">
        <p className="font-display text-sm font-bold uppercase text-court-600">Vie du club</p>
        <h1 className="mt-3 max-w-4xl text-4xl font-black leading-tight text-court-900 sm:text-5xl">
          Agenda du CFVV
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-ink-600">
          Retrouve les compétitions, événements associatifs, réunions, stages et fermetures exceptionnelles publiés par le club.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Badge variant="info" icon={<CalendarDays className="h-3.5 w-3.5" />}>
            Liste chronologique
          </Badge>
          <Badge variant="success" icon={<Clock className="h-3.5 w-3.5" />}>
            Ajout iCal
          </Badge>
          <Badge variant="warning" icon={<Info className="h-3.5 w-3.5" />}>
            Annulations visibles
          </Badge>
        </div>
      </section>

      <Card className="my-8 p-5">
        <h2 className="text-2xl font-black text-court-900">Ce que l'agenda centralise</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Événements publiés",
              text: "Seuls les événements publiés, programmés arrivés à date ou annulés restent visibles aux visiteurs."
            },
            {
              title: "Fermetures et changements",
              text: "Les fermetures exceptionnelles doivent être ajoutées ici pour éviter les informations dispersées."
            },
            {
              title: "Actions pratiques",
              text: "Chaque fiche peut proposer l'ajout au calendrier, un lien de partage, une inscription et une pièce jointe."
            }
          ].map((item) => (
            <div key={item.title} className="rounded-lg bg-court-50 p-4">
              <h3 className="font-display text-lg font-black text-court-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-ink-600">{item.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-5">
          <Link href="/contact">
            <Button variant="outline">Signaler une information à ajouter</Button>
          </Link>
        </div>
      </Card>

      <PublicAgenda events={events} siteUrl={getSiteUrl()} />
    </div>
  );
}
