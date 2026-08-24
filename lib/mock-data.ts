import type {
  ClubEvent,
  NewsPost,
  Ranking,
  ShuttleProduct,
  SlotOccurrence,
  UserProfile,
  Venue
} from "@/types/domain";

const dayMs = 24 * 60 * 60 * 1000;

function dateAt(daysFromToday: number, hour: number, minute = 0) {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  date.setTime(date.getTime() + daysFromToday * dayMs);
  return date.toISOString();
}

function nextWeekdayAt(weekday: number, hour: number, minute = 0) {
  const now = new Date();
  const date = new Date();
  const daysUntilWeekday = (weekday - now.getDay() + 7) % 7;
  date.setDate(now.getDate() + daysUntilWeekday);
  date.setHours(hour, minute, 0, 0);

  if (date <= now) {
    date.setDate(date.getDate() + 7);
  }

  return date.toISOString();
}

function isoDateForWeekday(weekday: number) {
  return nextWeekdayAt(weekday, 12).slice(0, 10);
}

export const demoMember: UserProfile = {
  id: "user-adherent",
  email: "adherent@example.com",
  firstName: "Adhérent",
  lastName: "CFVV",
  displayName: "Adhérent CFVV",
  roles: ["member"],
  membershipStatus: "active",
  consentShowName: true
};

export const demoAdmin: UserProfile = {
  id: "user-admin",
  email: "responsable@example.com",
  firstName: "Responsable",
  lastName: "CFVV",
  displayName: "Responsable CFVV",
  roles: ["member", "admin", "slot_manager", "shuttle_manager"],
  membershipStatus: "active",
  consentShowName: true
};

export const venues: Venue[] = [
  {
    id: "venue-aigremonts",
    name: "Gymnase des Aigremonts",
    address: "554 Rue de la Chappe",
    city: "Vendôme",
    postalCode: "41100",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Gymnase%20des%20Aigremonts%20554%20Rue%20de%20la%20Chappe%2041100%20Vendome",
    accessNotes: "7 terrains dédiés, gymnase chauffé l'hiver. Accès par le secteur des Aigremonts, stationnement à proximité du gymnase."
  }
];

export const slots: SlotOccurrence[] = [
  {
    id: "slot-tuesday-youth-training",
    title: "Entraînement jeunes",
    type: "youth_training",
    date: isoDateForWeekday(2),
    startsAt: nextWeekdayAt(2, 18, 0),
    endsAt: nextWeekdayAt(2, 19, 30),
    venueId: "venue-aigremonts",
    venueName: "Gymnase des Aigremonts",
    address: "554 Rue de la Chappe, 41100 Vendôme",
    managerName: "Julie Remule / Didier Remule",
    recommendedLevel: "Jeunes, tous niveaux",
    audience: "Jeunes",
    courtsCount: 7,
    capacityMax: 28,
    registeredCount: 0,
    status: "open",
    isReservable: false
  },
  {
    id: "slot-tuesday-adult-training",
    title: "Entraînement adultes",
    type: "adult_training",
    date: isoDateForWeekday(2),
    startsAt: nextWeekdayAt(2, 19, 30),
    endsAt: nextWeekdayAt(2, 20, 45),
    venueId: "venue-aigremonts",
    venueName: "Gymnase des Aigremonts",
    address: "554 Rue de la Chappe, 41100 Vendôme",
    managerName: "Clovis / Gildas",
    recommendedLevel: "Adultes, tous niveaux",
    audience: "Adultes",
    courtsCount: 7,
    capacityMax: 28,
    registeredCount: 0,
    status: "open",
    isReservable: false
  },
  {
    id: "slot-tuesday-adult-free-play",
    title: "Jeu libre adultes",
    type: "free_play",
    date: isoDateForWeekday(2),
    startsAt: nextWeekdayAt(2, 20, 45),
    endsAt: nextWeekdayAt(2, 22, 30),
    venueId: "venue-aigremonts",
    venueName: "Gymnase des Aigremonts",
    address: "554 Rue de la Chappe, 41100 Vendôme",
    managerName: "Clovis / Gildas",
    recommendedLevel: "Adultes loisirs et compétiteurs",
    audience: "Adultes",
    courtsCount: 7,
    capacityMax: 28,
    registeredCount: 0,
    status: "open",
    isReservable: false
  },
  {
    id: "slot-wednesday-adult-free-play",
    title: "Jeu libre adultes",
    type: "free_play",
    date: isoDateForWeekday(3),
    startsAt: nextWeekdayAt(3, 18, 0),
    endsAt: nextWeekdayAt(3, 20, 30),
    venueId: "venue-aigremonts",
    venueName: "Gymnase des Aigremonts",
    address: "554 Rue de la Chappe, 41100 Vendôme",
    managerName: "Julie Remule / Didier Remule",
    recommendedLevel: "Adultes, tous niveaux",
    audience: "Adultes",
    courtsCount: 7,
    capacityMax: 28,
    registeredCount: 0,
    status: "open",
    isReservable: true
  },
  {
    id: "slot-thursday-youth-training",
    title: "Entraînement jeunes",
    type: "youth_training",
    date: isoDateForWeekday(4),
    startsAt: nextWeekdayAt(4, 18, 0),
    endsAt: nextWeekdayAt(4, 19, 30),
    venueId: "venue-aigremonts",
    venueName: "Gymnase des Aigremonts",
    address: "554 Rue de la Chappe, 41100 Vendôme",
    managerName: "Clovis / Gildas",
    recommendedLevel: "Jeunes, tous niveaux",
    audience: "Jeunes",
    courtsCount: 7,
    capacityMax: 28,
    registeredCount: 0,
    status: "open",
    isReservable: false
  },
  {
    id: "slot-thursday-adult-free-play",
    title: "Jeu libre adultes",
    type: "free_play",
    date: isoDateForWeekday(4),
    startsAt: nextWeekdayAt(4, 19, 30),
    endsAt: nextWeekdayAt(4, 22, 30),
    venueId: "venue-aigremonts",
    venueName: "Gymnase des Aigremonts",
    address: "554 Rue de la Chappe, 41100 Vendôme",
    managerName: "Clovis / Gildas",
    recommendedLevel: "Adultes, tous niveaux",
    audience: "Adultes",
    courtsCount: 7,
    capacityMax: 28,
    registeredCount: 0,
    status: "open",
    isReservable: false
  },
  {
    id: "slot-friday-free-play",
    title: "Jeu libre adultes / jeunes",
    type: "free_play",
    date: isoDateForWeekday(5),
    startsAt: nextWeekdayAt(5, 18, 0),
    endsAt: nextWeekdayAt(5, 22, 30),
    venueId: "venue-aigremonts",
    venueName: "Gymnase des Aigremonts",
    address: "554 Rue de la Chappe, 41100 Vendôme",
    managerName: "Julie Remule / Didier Remule",
    recommendedLevel: "Adultes et jeunes, tous niveaux",
    audience: "Adultes / Jeunes",
    courtsCount: 7,
    capacityMax: 28,
    registeredCount: 0,
    status: "open",
    isReservable: true
  }
];

export const shuttleProducts: ShuttleProduct[] = [
  {
    id: "shuttle-rsl-rouge",
    brand: "RSL",
    model: "Rouges",
    description: "Volants plumes RSL rouges, tarif proposé pour la saison 2026/2027.",
    priceCents: 2500,
    stockQuantity: 0,
    lowStockThreshold: 4,
    imageTone: "green"
  },
  {
    id: "shuttle-forza-hybride",
    brand: "Forza",
    model: "Hybride",
    description: "Volants hybrides Forza, tarif proposé pour la saison 2026/2027.",
    priceCents: 1600,
    stockQuantity: 0,
    lowStockThreshold: 4,
    imageTone: "blue"
  }
];

export const rankings: Ranking[] = [];

export const events: ClubEvent[] = [
  {
    id: "journee-associations-2026",
    title: "Journée des associations",
    category: "club_event",
    status: "published",
    startsAt: "2026-09-05T07:00:00.000Z",
    endsAt: "2026-09-05T16:00:00.000Z",
    venueName: "Stand du club, lieu communiqué par l'USV",
    audience: "Tous publics",
    description:
      "Le CFVV sera présent toute la journée pour présenter les créneaux, les inscriptions et les informations de rentrée. Créneaux jeunes à demander directement sur le stand.",
    contactLabel: "Contacter le club",
    contactHref: "/contact",
    publishedAt: "2026-07-03T18:00:00.000Z"
  },
  {
    id: "apres-midi-bienvenue-2026",
    title: "Après-midi de bienvenue",
    category: "club_event",
    status: "published",
    startsAt: "2026-10-03T12:00:00.000Z",
    venueName: "Lieu à définir",
    audience: "Adhérents et nouveaux joueurs",
    description:
      "Temps convivial de début de saison. Le lieu reste à confirmer entre Laser Game, Cabane à Mousse ou Padel Arena. Les inscriptions seront organisées via le site.",
    contactLabel: "Suivre les infos",
    contactHref: "/agenda",
    publishedAt: "2026-07-03T18:00:00.000Z"
  },
  {
    id: "tournoi-interne-costume-2026",
    title: "Tournoi interne costumé",
    category: "club_event",
    status: "published",
    startsAt: "2026-11-06T18:00:00.000Z",
    venueName: "Gymnase des Aigremonts",
    audience: "Adhérents",
    description:
      "Tournoi interne du club avec déguisements. Lot prévu pour le meilleur déguisement et le vainqueur du tournoi.",
    contactLabel: "Voir les créneaux",
    contactHref: "/creneaux",
    publishedAt: "2026-07-03T18:00:00.000Z"
  },
  {
    id: "tournoi-ouvert-hiver-2026",
    title: "Tournoi ouvert à tous",
    category: "competition",
    status: "draft",
    startsAt: "2026-12-18T18:00:00.000Z",
    venueName: "Lieu à confirmer",
    audience: "Tous publics",
    description:
      "Projet de tournoi ouvert, entrée envisagée à 5 euros par joueur. Date à arbitrer entre le 18 décembre 2026 et le 8 janvier 2027.",
    publishedAt: "2026-07-03T18:00:00.000Z"
  }
];

export const news: NewsPost[] = [
  {
    id: "news-training",
    title: "Créneaux hebdomadaires du club",
    category: "Créneaux",
    excerpt: "Les créneaux ont lieu au Gymnase des Aigremonts, avec des séances réservables le mercredi et le vendredi.",
    publishedAt: dateAt(-1, 9)
  },
  {
    id: "news-prices",
    title: "Tarifs 2026/2027 proposés",
    category: "Inscriptions",
    excerpt: "Tarifs proposés pour la saison 2026/2027 : 90 euros jeunes et 100 euros adultes, à confirmer à l'ouverture des inscriptions Poona.",
    publishedAt: dateAt(-3, 11)
  },
  {
    id: "news-associations-2026",
    title: "Journée des associations le 5 septembre",
    category: "Rentrée",
    excerpt: "Le club prépare son stand pour présenter les créneaux, les inscriptions et les informations de rentrée aux futurs adhérents.",
    publishedAt: dateAt(-2, 14)
  },
  {
    id: "news-trial",
    title: "Séances d'essai possibles",
    category: "Essai",
    excerpt: "Jusqu'à 3 séances d'essai sont possibles sur inscription préalable avant de rejoindre le club.",
    publishedAt: dateAt(-5, 10)
  }
];

export const clubStats = [
  { label: "Terrains dédiés", value: "7" },
  { label: "Séances d'essai", value: "3" },
  { label: "Créneaux/semaine", value: "7" },
  { label: "Ville", value: "Vendôme" }
];

export const ffbadRegistrationUrl = "https://www.myffbad.fr/adherer/CFVV41";
