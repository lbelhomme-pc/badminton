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

function isoDate(daysFromToday: number) {
  return dateAt(daysFromToday, 12).slice(0, 10);
}

export const demoMember: UserProfile = {
  id: "user-camille",
  email: "camille@cfvv41.fr",
  firstName: "Camille",
  lastName: "Martin",
  displayName: "Camille M.",
  roles: ["member"],
  membershipStatus: "active",
  consentShowName: true
};

export const demoAdmin: UserProfile = {
  id: "user-admin",
  email: "bureau@cfvv41.fr",
  firstName: "Véronique",
  lastName: "David",
  displayName: "Véronique D.",
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
    accessNotes: "7 terrains dédiés, gymnase chauffé l’hiver. Accès par le secteur des Aigremonts, stationnement à proximité du gymnase."
  }
];

export const slots: SlotOccurrence[] = [
  {
    id: "slot-tuesday-free",
    title: "Jeu libre adultes",
    type: "free_play",
    date: isoDate(1),
    startsAt: dateAt(1, 19, 30),
    endsAt: dateAt(1, 22, 30),
    venueId: "venue-aigremonts",
    venueName: "Gymnase des Aigremonts",
    address: "554 Rue de la Chappe, 41100 Vendôme",
    managerName: "Véronique",
    recommendedLevel: "Tous niveaux",
    audience: "Adultes loisirs et compétiteurs",
    courtsCount: 7,
    capacityMax: 28,
    registeredCount: 18,
    status: "open"
  },
  {
    id: "slot-wednesday-family",
    title: "Parents / enfants",
    type: "free_play",
    date: isoDate(2),
    startsAt: dateAt(2, 18, 30),
    endsAt: dateAt(2, 20, 30),
    venueId: "venue-aigremonts",
    venueName: "Gymnase des Aigremonts",
    address: "554 Rue de la Chappe, 41100 Vendôme",
    managerName: "Valérian",
    recommendedLevel: "Découverte à loisir",
    audience: "Parents et enfants",
    courtsCount: 7,
    capacityMax: 24,
    registeredCount: 12,
    status: "open"
  },
  {
    id: "slot-thursday-youth-7-11",
    title: "Jeunes 7-11 ans",
    type: "youth_training",
    date: isoDate(3),
    startsAt: dateAt(3, 18, 0),
    endsAt: dateAt(3, 19, 15),
    venueId: "venue-aigremonts",
    venueName: "Gymnase des Aigremonts",
    address: "554 Rue de la Chappe, 41100 Vendôme",
    managerName: "Valérian",
    recommendedLevel: "Débutant à confirmé",
    audience: "Jeunes 7-11 ans",
    courtsCount: 4,
    capacityMax: 20,
    registeredCount: 14,
    status: "open"
  },
  {
    id: "slot-thursday-youth-11-17",
    title: "Jeunes 11-17 ans",
    type: "youth_training",
    date: isoDate(3),
    startsAt: dateAt(3, 18, 0),
    endsAt: dateAt(3, 19, 30),
    venueId: "venue-aigremonts",
    venueName: "Gymnase des Aigremonts",
    address: "554 Rue de la Chappe, 41100 Vendôme",
    managerName: "Véronique",
    recommendedLevel: "Débutant à confirmé",
    audience: "Jeunes 11-17 ans",
    courtsCount: 3,
    capacityMax: 18,
    registeredCount: 13,
    status: "open"
  },
  {
    id: "slot-thursday-adults",
    title: "Jeu libre adultes",
    type: "adult_training",
    date: isoDate(3),
    startsAt: dateAt(3, 19, 30),
    endsAt: dateAt(3, 22, 30),
    venueId: "venue-aigremonts",
    venueName: "Gymnase des Aigremonts",
    address: "554 Rue de la Chappe, 41100 Vendôme",
    managerName: "Véronique",
    recommendedLevel: "Tous niveaux",
    audience: "Adultes",
    courtsCount: 7,
    capacityMax: 28,
    registeredCount: 28,
    status: "full"
  },
  {
    id: "slot-friday-booking",
    title: "Jeu libre sur réservation",
    type: "free_play",
    date: isoDate(4),
    startsAt: dateAt(4, 19, 0),
    endsAt: dateAt(4, 22, 0),
    venueId: "venue-aigremonts",
    venueName: "Gymnase des Aigremonts",
    address: "554 Rue de la Chappe, 41100 Vendôme",
    managerName: "Bureau CFVV41",
    recommendedLevel: "Tous niveaux",
    audience: "Adultes et parents/enfants selon participants",
    courtsCount: 7,
    capacityMax: 28,
    registeredCount: 9,
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
    description: "Volants plumes d’entraînement, bon équilibre entre coût et régularité.",
    priceCents: 1500,
    stockQuantity: 8,
    lowStockThreshold: 4,
    imageTone: "blue"
  }
];

export const rankings: Ranking[] = [
  {
    id: "rank-1",
    displayName: "Camille M.",
    category: "Senior",
    singleRank: "D8",
    doubleRank: "D7",
    mixedRank: "D8",
    progression: "+2 places",
    team: "Interclubs",
    visibility: "public"
  },
  {
    id: "rank-2",
    displayName: "Nadia B.",
    category: "Senior",
    singleRank: "R6",
    doubleRank: "R5",
    mixedRank: "R6",
    progression: "Stable",
    team: "Interclubs",
    visibility: "public"
  },
  {
    id: "rank-3",
    displayName: "Thomas L.",
    category: "Vétéran",
    singleRank: "D7",
    doubleRank: "D7",
    mixedRank: "D9",
    progression: "+1 série",
    team: "Loisirs +",
    visibility: "public"
  },
  {
    id: "rank-4",
    displayName: "Élodie R.",
    category: "Senior",
    singleRank: "P10",
    doubleRank: "D9",
    mixedRank: "D9",
    progression: "+4 places",
    team: "Loisirs",
    visibility: "public"
  }
];

export const events: ClubEvent[] = [
  {
    id: "event-internal",
    title: "Tournoi interne doubles surprises",
    date: dateAt(10, 14, 0),
    type: "Vie du club",
    description: "Un après-midi convivial avec tirage des paires sur place."
  },
  {
    id: "event-stage",
    title: "Séance découverte jeunes",
    date: dateAt(18, 18, 0),
    type: "Jeunes",
    description: "Accueil des familles, essai encadré et présentation du fonctionnement du club."
  }
];

export const news: NewsPost[] = [
  {
    id: "news-training",
    title: "Créneaux d’entraînement de la saison",
    category: "Créneaux",
    excerpt: "Mardi 19h30-22h30, mercredi 18h30-20h30, jeudi jeunes puis adultes, vendredi sur réservation.",
    publishedAt: dateAt(-1, 9)
  },
  {
    id: "news-shuttles",
    title: "Volants plumes disponibles à la salle",
    category: "Volants",
    excerpt: "Les boîtes RSL sont disponibles auprès de Véronique avec règlement à la salle.",
    publishedAt: dateAt(-3, 11)
  }
];

export const clubStats = [
  { label: "Terrains dédiés", value: "7" },
  { label: "Séances d’essai", value: "3" },
  { label: "Créneaux/semaine", value: "5" },
  { label: "Ville", value: "Vendôme" }
];

export const ffbadRegistrationUrl = "https://www.cfvv41.fr/inscription";
