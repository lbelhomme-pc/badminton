import { events, ffbadRegistrationUrl, rankings, shuttleProducts, slots, venues } from "@/lib/mock-data";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export interface PublicClubSettings {
  club: {
    name: string;
    fullName: string;
    city: string;
    registeredOffice: string;
    ffbadUrl: string;
  };
  contact: {
    email: string;
    phone: string;
    facebookUrl: string;
    instagramUrl: string;
  };
  bureau: PublicBureauMember[];
}

export interface PublicBureauMember {
  key: string;
  role: string;
  name: string;
  mission: string;
  email: string;
  phone: string;
}

export interface RegistrationLinkStatus {
  url: string;
  fallbackUrl: string;
  isFallback: boolean;
  sourceLabel: string;
  confirmationMessage: string;
}

export const defaultPublicClubSettings: PublicClubSettings = {
  club: {
    name: "CFVV",
    fullName: "Club des fous du Volant Vendômois",
    city: "Vendôme",
    registeredOffice: "Naveil",
    ffbadUrl: ffbadRegistrationUrl
  },
  contact: {
    email: "cfvv41@gmail.com",
    phone: "",
    facebookUrl: "",
    instagramUrl: ""
  },
  bureau: [
    {
      key: "presidence",
      role: "Présidence",
      name: "Didier Remule",
      mission: "Coordination générale du club, relations avec les partenaires, la mairie et les instances sportives.",
      email: "",
      phone: ""
    },
    {
      key: "tresorerie",
      role: "Trésorerie",
      name: "Yeliz Ozogul",
      mission: "Suivi du budget, cotisations, commandes et dépenses liées au fonctionnement du club.",
      email: "",
      phone: ""
    },
    {
      key: "secretariat",
      role: "Secrétariat",
      name: "Ludovic Belhomme",
      mission: "Inscriptions, licences, documents administratifs et communication avec les adhérents.",
      email: "",
      phone: ""
    },
    {
      key: "creneaux",
      role: "Responsables créneaux",
      name: "Didier Remule",
      mission: "Accueil des joueurs, suivi des présences, annulations exceptionnelles et organisation des terrains.",
      email: "",
      phone: ""
    },
    {
      key: "communication",
      role: "Communication",
      name: "Julie Remule",
      mission: "Actualités, événements, informations de dernière minute et mise à jour du site.",
      email: "",
      phone: ""
    },
    {
      key: "benevoles",
      role: "Bénévoles",
      name: "Tous les coups de main comptent",
      mission: "Tournois, stages, buvette, installation, rangement et accueil des nouveaux joueurs.",
      email: "",
      phone: ""
    }
  ]
};

interface SettingRow {
  key: "club" | "contact" | "bureau";
  value: Record<string, unknown> | null;
}

function cleanText(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function getSettingValue(rows: SettingRow[], key: SettingRow["key"]) {
  return rows.find((row) => row.key === key)?.value ?? {};
}

function cleanBureau(value: unknown) {
  const source = Array.isArray(value) ? value : defaultPublicClubSettings.bureau;
  const fallbackByKey = new Map(defaultPublicClubSettings.bureau.map((member) => [member.key, member]));

  return source.map((item, index) => {
    const record = typeof item === "object" && item !== null ? (item as Record<string, unknown>) : {};
    const key = cleanText(record.key, defaultPublicClubSettings.bureau[index]?.key ?? `member-${index + 1}`);
    const fallback = fallbackByKey.get(key) ?? defaultPublicClubSettings.bureau[index] ?? defaultPublicClubSettings.bureau[0];

    return {
      key,
      role: cleanText(record.role, fallback.role),
      name: cleanText(record.name, fallback.name),
      mission: cleanText(record.mission, fallback.mission),
      email: cleanText(record.email, fallback.email),
      phone: cleanText(record.phone, fallback.phone)
    };
  });
}

export async function getPublicClubSettings(): Promise<PublicClubSettings> {
  const supabase = createSupabaseBrowserClient();

  if (!supabase) {
    return defaultPublicClubSettings;
  }

  try {
    const { data, error } = await supabase
      .from("settings_site")
      .select("key, value")
      .in("key", ["club", "contact", "bureau"]);

    if (error) {
      return defaultPublicClubSettings;
    }

    const rows = (data ?? []) as SettingRow[];
    const club = getSettingValue(rows, "club");
    const contact = getSettingValue(rows, "contact");
    const bureau = getSettingValue(rows, "bureau");

    return {
      club: {
        name: cleanText(club.name, defaultPublicClubSettings.club.name),
        fullName: cleanText(club.full_name, defaultPublicClubSettings.club.fullName),
        city: cleanText(club.city, defaultPublicClubSettings.club.city),
        registeredOffice: cleanText(club.registered_office, defaultPublicClubSettings.club.registeredOffice),
        ffbadUrl: cleanText(club.ffbad_url, defaultPublicClubSettings.club.ffbadUrl)
      },
      contact: {
        email: cleanText(contact.email, defaultPublicClubSettings.contact.email),
        phone: cleanText(contact.phone, defaultPublicClubSettings.contact.phone),
        facebookUrl: cleanText(contact.facebook_url, defaultPublicClubSettings.contact.facebookUrl),
        instagramUrl: cleanText(contact.instagram_url, defaultPublicClubSettings.contact.instagramUrl)
      },
      bureau: cleanBureau(bureau.members)
    };
  } catch {
    return defaultPublicClubSettings;
  }
}

export function getUpcomingSlots() {
  return [...slots].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export function getOpenSlots() {
  return getUpcomingSlots().filter((slot) => slot.status === "open");
}

export function getSlotById(id: string) {
  return slots.find((slot) => slot.id === id);
}

export function getVenues() {
  return venues;
}

export function getShuttleProducts() {
  return shuttleProducts;
}

export function getRankings() {
  return rankings;
}

export function getEvents() {
  return events;
}

export function getFfbadRegistrationUrl() {
  return ffbadRegistrationUrl;
}

export function getRegistrationLinkStatus(settings: PublicClubSettings): RegistrationLinkStatus {
  const url = settings.club.ffbadUrl || ffbadRegistrationUrl;
  const isFallback = url === ffbadRegistrationUrl;

  return {
    url,
    fallbackUrl: ffbadRegistrationUrl,
    isFallback,
    sourceLabel: isFallback ? "Lien à confirmer" : "Lien configuré par le club",
    confirmationMessage: isFallback
      ? "Le lien d'inscription affiché est le lien de secours du site. Le bureau peut le confirmer ou le remplacer dans l'administration."
      : "Ce lien provient des paramètres publics du site et peut être mis à jour par le club."
  };
}

export async function getConfiguredFfbadRegistrationUrl() {
  const settings = await getPublicClubSettings();
  return settings.club.ffbadUrl;
}
