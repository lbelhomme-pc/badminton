import type { Metadata } from "next";
import { CalendarDays, Clock, Info } from "lucide-react";
import { PublicAgenda } from "@/components/agenda/public-agenda";
import { InteriorHero } from "@/components/public/interior-hero";
import { clubPhotoSlots } from "@/lib/club-photos";
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

      <InteriorHero
        eyebrow="Vie du club"
        title="Agenda du CFVV"
        intro="Retrouve les compétitions, événements associatifs, réunions, stages, fermetures exceptionnelles et anniversaires publiés avec autorisation."
        tone="agenda"
        photo={clubPhotoSlots.clubLife}
        visualLabel="Temps forts du club"
        badges={[
          { label: "Liste chronologique", icon: <CalendarDays className="h-4 w-4" aria-hidden="true" /> },
          { label: "Ajout iCal", icon: <Clock className="h-4 w-4" aria-hidden="true" /> },
          { label: "Annulations visibles", icon: <Info className="h-4 w-4" aria-hidden="true" /> }
        ]}
        actions={[{ href: "#agenda-list", label: "Voir l'agenda", icon: <CalendarDays className="h-4 w-4" aria-hidden="true" /> }]}
      />

      <div id="agenda-list" className="mt-8 scroll-mt-28">
        <PublicAgenda events={events} siteUrl={getSiteUrl()} />
      </div>
    </div>
  );
}
