import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarCheck, Info, MapPin } from "lucide-react";
import { PublicCreneauxPlanning } from "@/components/planning/public-creneaux-planning";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { canonical } from "@/lib/seo";
import { getUpcomingSlots } from "@/services/club.service";

export const metadata: Metadata = {
  title: "Créneaux de badminton à Vendôme - CFVV",
  description:
    "Horaires du CFVV : créneaux jeunes, adultes, loisirs, entraînement, jeu libre, lieu de pratique et demande de séance d'essai à Vendôme.",
  alternates: canonical("/creneaux")
};

export default function CreneauxPage() {
  const weeklySlots = getUpcomingSlots();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-lg border border-court-200 bg-white p-6 shadow-soft">
        <p className="font-display text-sm font-bold uppercase text-court-600">Jouer au club</p>
        <h1 className="mt-3 max-w-4xl text-4xl font-black leading-tight text-court-900 sm:text-5xl">
          Créneaux badminton du CFVV à Vendôme
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-ink-600">
          Retrouve la semaine type du club, les horaires principaux, les lieux et les modalités à connaître avant de venir jouer.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Badge variant="success" icon={<CalendarCheck className="h-3.5 w-3.5" />}>
            Horaires centralisés
          </Badge>
          <Badge variant="info" icon={<MapPin className="h-3.5 w-3.5" />}>
            Lieu et accès
          </Badge>
          <Badge variant="warning" icon={<Info className="h-3.5 w-3.5" />}>
            Changements exceptionnels prévus
          </Badge>
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/inscriptions/seance-essai">
            <Button size="lg" className="w-full sm:w-auto">
              Demander un essai
            </Button>
          </Link>
          <Link href="/inscription">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Voir le parcours d'inscription
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </section>

      <Card className="my-8 p-5">
        <h2 className="text-2xl font-black text-court-900">À savoir avant de venir</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-ink-600">
          Avant de venir, vérifie les horaires, le lieu du créneau et les éventuelles modalités de réservation.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: "Été 2026",
              text: "Les créneaux d'été sont ouverts jusqu'au 17 juillet 2026. Reprise prévue le 17 août 2026, sous réserve de confirmation du gymnase."
            },
            {
              title: "Changements ponctuels",
              text: "Un créneau peut être habituel, modifié, fermé exceptionnellement ou en vacances scolaires."
            },
            {
              title: "Jeunes et adultes",
              text: "La semaine type distingue les entraînements jeunes et les créneaux adultes pour aller vite."
            }
          ].map((item) => (
            <div key={item.title} className="rounded-lg bg-court-50 p-4">
              <h3 className="font-display text-lg font-black text-court-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-ink-600">{item.text}</p>
            </div>
          ))}
        </div>
      </Card>

      <PublicCreneauxPlanning fallbackSlots={weeklySlots} showWeeklySummary showDetailedBoard={false} />
    </div>
  );
}
