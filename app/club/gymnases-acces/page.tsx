import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, MapPin, Navigation, ParkingCircle, ThermometerSun } from "lucide-react";
import { ClubPhoto } from "@/components/public/club-photo";
import { InfoPage } from "@/components/public/info-page";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { clubPhotoSlots, hasClubPhoto } from "@/lib/club-photos";
import { canonical } from "@/lib/seo";
import { getVenues } from "@/services/club.service";

export const metadata: Metadata = {
  title: "Lieux et accès - CFVV",
  description: "Adresse, accès et informations pratiques du Gymnase des Aigremonts à Vendôme.",
  alternates: canonical("/club/gymnases-acces")
};

export default function GymnasesAccesPage() {
  const venues = getVenues();
  const mainVenue = venues[0];
  const gymnasePhoto = clubPhotoSlots.gymnaseAigremonts;

  return (
    <InfoPage
      contentKey="/club/gymnases-acces"
      eyebrow="Lieux et accès"
      title="Venir jouer au gymnase"
      intro="Chaque créneau précise son lieu, son horaire et le public concerné. La carte intégrée n'est pas affichée par défaut afin d'éviter un outil tiers sans consentement."
      cards={[]}
    >
      <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
        <Card className="p-6">
          <MapPin className="h-7 w-7 text-court-500" aria-hidden="true" />
          <h2 className="mt-5 text-3xl font-black text-court-900">{mainVenue?.name ?? "Lieu à confirmer"}</h2>
          {mainVenue ? (
            <div className="mt-5 text-lg leading-8 text-ink-700">
              <p className="font-black text-court-900">{mainVenue.name}</p>
              <p>{mainVenue.address}</p>
              <p>
                {mainVenue.postalCode} {mainVenue.city}
              </p>
              <p className="mt-5 text-base leading-7 text-ink-600">{mainVenue.accessNotes}</p>
            </div>
          ) : (
            <p className="mt-5 text-ink-600">Le lieu principal sera affiché ici dès qu'il sera confirmé dans les données du site.</p>
          )}

          <div className="mt-6 grid gap-3 text-sm font-semibold text-court-900">
            <span className="inline-flex items-center gap-2 rounded-lg bg-court-100 px-3 py-3">
              <ParkingCircle className="h-4 w-4 text-court-500" aria-hidden="true" />
              Stationnement à proximité si confirmé par le club
            </span>
            <span className="inline-flex items-center gap-2 rounded-lg bg-court-100 px-3 py-3">
              <ThermometerSun className="h-4 w-4 text-warning" aria-hidden="true" />
              Prévoir une tenue et des chaussures adaptées au gymnase
            </span>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {mainVenue?.mapUrl ? (
              <a
                href={mainVenue.mapUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-court-500 px-4 font-display text-sm font-bold text-white shadow-soft transition hover:bg-court-600"
              >
                Itinéraire externe
                <Navigation className="h-4 w-4" aria-hidden="true" />
              </a>
            ) : null}
            <Link href="/creneaux">
              <Button variant="outline" className="w-full sm:w-auto">
                Voir les créneaux
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="overflow-hidden p-0">
          {hasClubPhoto(gymnasePhoto) ? (
            <ClubPhoto slot={gymnasePhoto} className="h-full min-h-[360px] w-full" />
          ) : (
            <div className="grid min-h-[360px] place-items-center bg-court-50 p-6 text-center">
              <div>
                <MapPin className="mx-auto h-10 w-10 text-court-500" aria-hidden="true" />
                <p className="mt-4 text-xl font-black text-court-900">Photo du lieu à ajouter</p>
                <p className="mt-2 text-sm leading-6 text-ink-600">
                  Une photo réelle du gymnase aidera les nouveaux adhérents et les parents à se repérer.
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </InfoPage>
  );
}
