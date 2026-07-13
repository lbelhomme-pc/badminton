import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarCheck, Info, MapPin } from "lucide-react";
import { PublicCreneauxPlanning } from "@/components/planning/public-creneaux-planning";
import { RegistrationCta } from "@/components/public/registration-cta";
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
          Retrouve les horaires, publics, niveaux, lieux et informations pratiques avant de venir jouer. Les créneaux peuvent être filtrés par public,
          jour, niveau, type de pratique et lieu.
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
              S'inscrire
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </section>

      <RegistrationCta
        className="my-8"
        compact
        showOfficialLink={false}
        title="Tu as trouvé un créneau qui te convient ?"
        intro="Demande une séance d'essai ou ouvre le parcours d'inscription avant de venir pour la première fois."
      />

      <Card className="mb-8 p-5">
        <h2 className="text-2xl font-black text-court-900">À savoir avant de venir</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Statuts lisibles",
              text: "Un créneau peut être habituel, modifié, fermé exceptionnellement, en vacances scolaires ou complet si une capacité réelle est suivie."
            },
            {
              title: "Mobile d'abord",
              text: "L'affichage utilise des cartes empilées pour éviter les tableaux illisibles sur téléphone."
            },
            {
              title: "Réservation",
              text: "Le bouton Réserver apparaît seulement pour un adhérent connecté et sur un créneau réservable."
            }
          ].map((item) => (
            <div key={item.title} className="rounded-lg bg-court-50 p-4">
              <h3 className="font-display text-lg font-black text-court-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-ink-600">{item.text}</p>
            </div>
          ))}
        </div>
      </Card>

      <PublicCreneauxPlanning fallbackSlots={weeklySlots} showWeeklySummary />
    </div>
  );
}
