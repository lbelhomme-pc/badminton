import type { Metadata } from "next";
import { ArrowRight, CalendarCheck, Info, MapPin } from "lucide-react";
import { PublicCreneauxPlanning } from "@/components/planning/public-creneaux-planning";
import { InteriorHero } from "@/components/public/interior-hero";
import { Card } from "@/components/ui/card";
import { clubPhotoSlots } from "@/lib/club-photos";
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
      <InteriorHero
        contentKey="/jouer-au-club/creneaux"
        eyebrow="Jouer au club"
        title="Créneaux badminton du CFVV à Vendôme"
        intro="Retrouve la semaine type du club, les horaires principaux, les lieux et les modalités à connaître avant de venir jouer."
        tone="creneaux"
        photo={clubPhotoSlots.trialSession}
        visualLabel="Créneaux au Gymnase des Aigremonts"
        badges={[
          { label: "Horaires centralisés", icon: <CalendarCheck className="h-4 w-4" aria-hidden="true" /> },
          { label: "Lieu et accès", icon: <MapPin className="h-4 w-4" aria-hidden="true" /> },
          { label: "Changements visibles", icon: <Info className="h-4 w-4" aria-hidden="true" /> }
        ]}
        actions={[
          { href: "/inscriptions/seance-essai", label: "Demander un essai", icon: <CalendarCheck className="h-4 w-4" aria-hidden="true" /> },
          { href: "/inscription", label: "S'inscrire", variant: "secondary", icon: <ArrowRight className="h-4 w-4" aria-hidden="true" /> }
        ]}
      />

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
