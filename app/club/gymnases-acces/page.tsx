import Link from "next/link";
import { ExternalLink, MapPin, ParkingCircle } from "lucide-react";
import { InfoPage } from "@/components/public/info-page";
import { Card } from "@/components/ui/card";
import { getVenues } from "@/services/club.service";

export default function GymnasesAccesPage() {
  const venues = getVenues();

  return (
    <InfoPage
      eyebrow="Le club"
      title="Gymnase et accès"
      intro="Le CFVV41 joue au Gymnase des Aigremonts à Vendôme. Les créneaux indiquent toujours le lieu, l’horaire et le public concerné."
      cards={[]}
    >
      <div className="grid gap-4 md:grid-cols-2">
        {venues.map((venue) => (
          <Card key={venue.id} className="p-5">
            <MapPin className="h-6 w-6 text-court-500" aria-hidden="true" />
            <h2 className="mt-4 text-xl font-black text-court-900">{venue.name}</h2>
            <p className="mt-2 text-sm font-semibold text-court-600">
              {venue.address}, {venue.postalCode} {venue.city}
            </p>
            <p className="mt-3 text-sm leading-6 text-ink-500">{venue.accessNotes}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-court-100 px-3 py-2 text-sm font-semibold text-court-900">
                <ParkingCircle className="h-4 w-4 text-court-500" aria-hidden="true" />
                Stationnement à proximité
              </span>
              <Link
                href={venue.mapUrl}
                target="_blank"
                className="inline-flex items-center gap-2 rounded-full border border-court-200 bg-white px-3 py-2 text-sm font-semibold text-court-900 transition hover:bg-court-100"
              >
                Itinéraire
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </Card>
        ))}
        <Card className="p-5">
          <h2 className="text-xl font-black text-court-900">Repères pratiques</h2>
          <div className="mt-4 grid gap-3 text-sm text-ink-500">
            <p>7 terrains dédiés au badminton.</p>
            <p>Gymnase chauffé l’hiver.</p>
            <p>Arriver quelques minutes avant le début du créneau pour s’installer sans gêner les terrains.</p>
          </div>
        </Card>
      </div>
    </InfoPage>
  );
}
