import { absoluteUrl, getSiteUrl } from "@/lib/seo";
import type { ClubEvent } from "@/types/domain";

const club = {
  shortName: "CFVV",
  fullName: "Club des Fous du Volant du Vendômois",
  city: "Vendôme",
  email: "cfvv41@gmail.com",
  sport: "Badminton"
};

const venue = {
  name: "Gymnase des Aigremonts",
  streetAddress: "554 Rue de la Chappe",
  postalCode: "41100",
  city: "Vendôme",
  courtsCount: 7
};

const openingHoursSpecification = [
  { dayOfWeek: "Tuesday", opens: "18:00", closes: "19:30", name: "Entraînement jeunes" },
  { dayOfWeek: "Tuesday", opens: "19:30", closes: "20:45", name: "Entraînement adultes" },
  { dayOfWeek: "Tuesday", opens: "20:45", closes: "22:30", name: "Jeu libre adultes" },
  { dayOfWeek: "Wednesday", opens: "18:00", closes: "20:30", name: "Jeu libre adultes" },
  { dayOfWeek: "Thursday", opens: "18:00", closes: "19:30", name: "Entraînement jeunes" },
  { dayOfWeek: "Thursday", opens: "19:30", closes: "22:30", name: "Jeu libre adultes" },
  { dayOfWeek: "Friday", opens: "18:00", closes: "22:30", name: "Jeu libre adultes / jeunes" }
];

export function getLocalStructuredData() {
  const organizationId = absoluteUrl("/#organization");
  const venueId = absoluteUrl("/club/gymnases-acces#gymnase-aigremonts");

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SportsOrganization",
        "@id": organizationId,
        name: club.shortName,
        alternateName: club.fullName,
        url: getSiteUrl(),
        logo: absoluteUrl("/logos/cfvv-horizontal.png"),
        image: absoluteUrl("/logos/cfvv-horizontal.png"),
        email: club.email,
        sport: club.sport,
        areaServed: {
          "@type": "City",
          name: club.city
        },
        location: {
          "@id": venueId
        }
      },
      {
        "@type": "SportsActivityLocation",
        "@id": venueId,
        name: venue.name,
        url: absoluteUrl("/club/gymnases-acces"),
        sport: club.sport,
        address: {
          "@type": "PostalAddress",
          streetAddress: venue.streetAddress,
          postalCode: venue.postalCode,
          addressLocality: venue.city,
          addressCountry: "FR"
        },
        amenityFeature: [
          {
            "@type": "LocationFeatureSpecification",
            name: "Terrains de badminton",
            value: venue.courtsCount
          }
        ],
        openingHoursSpecification: openingHoursSpecification.map((slot) => ({
          "@type": "OpeningHoursSpecification",
          dayOfWeek: `https://schema.org/${slot.dayOfWeek}`,
          opens: slot.opens,
          closes: slot.closes,
          description: slot.name
        }))
      }
    ]
  };
}

export function getEventStructuredData(events: ClubEvent[]) {
  const visibleEvents = events.filter((event) => event.status === "published" || event.status === "cancelled");

  if (visibleEvents.length === 0) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@graph": visibleEvents.map((event) => ({
      "@type": "Event",
      "@id": absoluteUrl(`/agenda#${event.id}`),
      name: event.title,
      description: event.cancellationMessage ? `${event.cancellationMessage} ${event.description}` : event.description,
      startDate: event.startsAt,
      endDate: event.endsAt,
      eventStatus: event.status === "cancelled" ? "https://schema.org/EventCancelled" : "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      organizer: {
        "@id": absoluteUrl("/#organization")
      },
      location: event.venueName
        ? {
            "@type": "Place",
            name: event.venueName
          }
        : {
            "@id": absoluteUrl("/club/gymnases-acces#gymnase-aigremonts")
          },
      image: event.imageUrl ? [absoluteUrl(event.imageUrl)] : undefined,
      url: absoluteUrl(`/agenda#${event.id}`)
    }))
  };
}

export function serializeStructuredData(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
