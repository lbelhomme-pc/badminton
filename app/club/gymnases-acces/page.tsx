import Link from "next/link";
import { ExternalLink, MapPin, Navigation, ParkingCircle, ThermometerSun } from "lucide-react";
import { InfoPage } from "@/components/public/info-page";
import { Card } from "@/components/ui/card";
import { getVenues } from "@/services/club.service";

const mapSrc =
  "https://www.google.com/maps?q=Gymnase%20des%20Aigremonts%20554%20Rue%20de%20la%20Chappe%2041100%20Vend%C3%B4me&output=embed";

export default function GymnasesAccesPage() {
  const venues = getVenues();
  const mainVenue = venues[0];

  return (
    <InfoPage
      eyebrow="Le club"
      title="Notre gymnase"
      intro="Le CFVV41 joue au Gymnase des Aigremonts à Vendôme. Les créneaux indiquent toujours le lieu, l'horaire et le public concerné."
      cards={[]}
    >
      <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
        <Card className="p-6">
          <MapPin className="h-7 w-7 text-court-500" aria-hidden="true" />
          <h2 className="mt-5 text-3xl font-black text-court-900">Gymnase des Aigremonts</h2>
          <p className="mt-5 text-lg leading-8 text-ink-600">
            Nous disposons d'un gymnase de <strong className="text-court-900">7 terrains</strong>, chauffé l'hiver.
          </p>

          <div className="mt-8 space-y-3 text-lg leading-8 text-court-900">
            <p className="font-black">Gymnase des Aigremonts</p>
            <p>554 Rue de la Chappe,</p>
            <p>41100 Vendôme</p>
          </div>

          <div className="mt-6 grid gap-3 text-sm font-semibold text-court-900">
            <span className="inline-flex items-center gap-2 rounded-lg bg-court-100 px-3 py-3">
              <ParkingCircle className="h-4 w-4 text-court-500" aria-hidden="true" />
              Stationnement à proximité
            </span>
            <span className="inline-flex items-center gap-2 rounded-lg bg-court-100 px-3 py-3">
              <ThermometerSun className="h-4 w-4 text-warning" aria-hidden="true" />
              Gymnase chauffé l'hiver
            </span>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href={mainVenue.mapUrl}
              target="_blank"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-court-500 px-4 text-sm font-semibold text-white shadow-soft transition hover:bg-court-600"
            >
              Itinéraire
              <Navigation className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/creneaux"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-court-200 bg-white px-4 text-sm font-semibold text-court-900 transition hover:bg-court-100"
            >
              Voir les créneaux
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </Card>

        <div className="overflow-hidden rounded-lg border border-court-200 bg-white shadow-soft">
          <iframe
            title="Carte du Gymnase des Aigremonts à Vendôme"
            src={mapSrc}
            className="h-[360px] w-full md:h-[520px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </InfoPage>
  );
}
