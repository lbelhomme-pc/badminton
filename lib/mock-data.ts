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
  lastName: "CF2V41",
  displayName: "Adhérent CF2V41",
  roles: ["member"],
  membershipStatus: "active",
  consentShowName: true
};

export const demoAdmin: UserProfile = {
  id: "user-admin",
  email: "responsable@example.com",
  firstName: "Responsable",
  lastName: "CF2V41",
  displayName: "Responsable CF2V41",
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
    managerName: "Didier Remule",
    recommendedLevel: "Jeunes, tous niveaux",
    audience: "Jeunes",
    courtsCount: 7,
    capacityMax: 28,
    registeredCount: 0,
    status: "open"
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
    managerName: "Didier Remule",
    recommendedLevel: "Adultes, tous niveaux",
    audience: "Adultes",
    courtsCount: 7,
    capacityMax: 28,
    registeredCount: 0,
    status: "open"
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
    managerName: "Didier Remule",
    recommendedLevel: "Adultes loisirs et compétiteurs",
    audience: "Adultes",
    courtsCount: 7,
    capacityMax: 28,
    registeredCount: 0,
    status: "open"
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
    managerName: "Didier Remule",
    recommendedLevel: "Adultes, tous niveaux",
    audience: "Adultes",
    courtsCount: 7,
    capacityMax: 28,
    registeredCount: 0,
    status: "open"
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
    managerName: "Didier Remule",
    recommendedLevel: "Jeunes, tous niveaux",
    audience: "Jeunes",
    courtsCount: 7,
    capacityMax: 28,
    registeredCount: 0,
    status: "open"
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
    managerName: "Didier Remule",
    recommendedLevel: "Adultes, tous niveaux",
    audience: "Adultes",
    courtsCount: 7,
    capacityMax: 28,
    registeredCount: 0,
    status: "open"
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
    managerName: "Didier Remule",
    recommendedLevel: "Adultes et jeunes, tous niveaux",
    audience: "Adultes / Jeunes",
    courtsCount: 7,
    capacityMax: 28,
    registeredCount: 0,
    status: "open"
  }
];

export const shuttleProducts: ShuttleProduct[] = [
  {
    id: "shuttle-rsl-grade3",
    brand: "RSL",
    model: "Grade 3 Homologué FFBaD",
    description: "Volants plumes standard pour matchs et entraînements exigeants.",
    priceCents: 1900,
    stockQuantity: 12,
    lowStockThreshold: 4,
    imageTone: "green"
  },
  {
    id: "shuttle-rsl-training-a9",
    brand: "RSL",
    model: "Training A9",
    description: "Volants plumes d'entraînement, bon équilibre entre coût et régularité.",
    priceCents: 1500,
    stockQuantity: 8,
    lowStockThreshold: 4,
    imageTone: "blue"
  }
];

export const rankings: Ranking[] = [];

export const events: ClubEvent[] = [];

export const news: NewsPost[] = [
  {
    id: "news-training",
    title: "Créneaux hebdomadaires du club",
    category: "Créneaux",
    excerpt: "Tous les créneaux ont lieu au Gymnase des Aigremonts, avec 28 places disponibles par créneau.",
    publishedAt: dateAt(-1, 9)
  },
  {
    id: "news-prices",
    title: "Tarifs licences",
    category: "Inscriptions",
    excerpt: "Adultes : loisirs 60 euros, compétiteurs 95 euros. Enfants : loisirs 50 euros, compétiteurs 85 euros.",
    publishedAt: dateAt(-3, 11)
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

export const ffbadRegistrationUrl = "https://www.cfvv41.fr/inscription";
