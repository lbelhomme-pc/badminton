import { events, ffbadRegistrationUrl, rankings, shuttleProducts, slots, venues } from "@/lib/mock-data";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { fetchPublicEvents } from "@/services/supabase-data.service";
import type { ClubEvent } from "@/types/domain";

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
    genericContacts: string[];
    facebookUrl: string;
    instagramUrl: string;
  };
  bureau: PublicBureauMember[];
  partners: PublicPartner[];
}

export interface PublicBureauMember {
  key: string;
  role: string;
  name: string;
  mission: string;
  email: string;
  phone: string;
  photoUrl: string;
  photoAlt: string;
}

export interface PublicPartner {
  id: string;
  name: string;
  description: string;
  level: string;
  logoUrl: string;
  websiteUrl: string;
  altText: string;
  active: boolean;
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
    fullName: "Club des fous du Volants Vendômois",
    city: "Vendôme",
    registeredOffice: "10 Imp. de la Devallerie, 41100 Naveil",
    ffbadUrl: ffbadRegistrationUrl
  },
  contact: {
    email: "cfvv41@gmail.com",
    phone: "06 60 93 51 85",
    genericContacts: ["Clovis Bellan", "Didier Remule", "Julie Remule"],
    facebookUrl: "https://www.facebook.com/CFVVBadminton/",
    instagramUrl: ""
  },
  partners: [],
  bureau: [
    {
      key: "presidence",
      role: "Présidence",
      name: "Didier Remule",
      mission: "Coordination générale du club, relations avec les partenaires, la mairie et les instances sportives.",
      email: "",
      phone: "06 60 93 51 85",
      photoUrl: "",
      photoAlt: "Portrait de Didier Remule"
    },
    {
      key: "vice-presidence",
      role: "Vice-présidence",
      name: "Clovis Bellan",
      mission: "Appui à la présidence, relais du bureau et coordination des actions du club.",
      email: "",
      phone: "",
      photoUrl: "",
      photoAlt: "Portrait de Clovis Bellan"
    },
    {
      key: "tresorerie",
      role: "Trésorerie",
      name: "Yeliz Ozogul",
      mission: "Suivi du budget, cotisations, commandes et dépenses liées au fonctionnement du club.",
      email: "",
      phone: "",
      photoUrl: "",
      photoAlt: "Portrait de Yeliz Ozogul"
    },
    {
      key: "secretariat",
      role: "Secrétariat",
      name: "Ludovic Belhomme",
      mission: "Inscriptions, licences, documents administratifs et communication avec les adhérents.",
      email: "",
      phone: "",
      photoUrl: "",
      photoAlt: "Portrait de Ludovic Belhomme"
    },
    {
      key: "creneaux",
      role: "Responsables créneaux",
      name: "Julie Remule / Didier Remule",
      mission: "Accueil des joueurs, suivi des présences, annulations exceptionnelles et organisation des terrains.",
      email: "",
      phone: "",
      photoUrl: "",
      photoAlt: "Portrait des responsables créneaux"
    },
    {
      key: "communication",
      role: "Communication",
      name: "Julie Remule",
      mission: "Actualités, événements, informations de dernière minute et mise à jour du site.",
      email: "",
      phone: "",
      photoUrl: "",
      photoAlt: "Portrait de Julie Remule"
    },
    {
      key: "contact",
      role: "Contacts génériques",
      name: "Clovis Bellan / Didier Remule / Julie Remule",
      mission: "Référents publics pour orienter les demandes d'essai, d'inscription, de créneaux, de volants et de partenariat.",
      email: "cfvv41@gmail.com",
      phone: "06 60 93 51 85",
      photoUrl: "",
      photoAlt: "Référents contact du CFVV"
    },
    {
      key: "benevoles",
      role: "Bénévoles",
      name: "Tous les coups de main comptent",
      mission: "Tournois, stages, buvette, installation, rangement et accueil des nouveaux joueurs.",
      email: "",
      phone: "",
      photoUrl: "",
      photoAlt: "Bénévoles du CFVV"
    }
  ]
};

interface SettingRow {
  key: "club" | "contact" | "bureau" | "partners";
  value: Record<string, unknown> | null;
}

function cleanText(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function cleanStringList(value: unknown, fallback: string[]) {
  if (Array.isArray(value)) {
    const cleaned = value.filter((item): item is string => typeof item === "string" && item.trim().length > 0).map((item) => item.trim());
    return cleaned.length > 0 ? cleaned : fallback;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const cleaned = value
      .split("/")
      .map((item) => item.trim())
      .filter(Boolean);

    return cleaned.length > 0 ? cleaned : fallback;
  }

  return fallback;
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
      phone: cleanText(record.phone, fallback.phone),
      photoUrl: cleanText(record.photo_url ?? record.photoUrl, fallback.photoUrl),
      photoAlt: cleanText(record.photo_alt ?? record.photoAlt, fallback.photoAlt || `Portrait de ${cleanText(record.name, fallback.name)}`)
    };
  });
}

function cleanPartners(value: unknown): PublicPartner[] {
  const source = Array.isArray(value) ? value : [];

  return source
    .map((item, index) => {
      const record = typeof item === "object" && item !== null ? (item as Record<string, unknown>) : {};
      const name = cleanText(record.name);

      if (!name) return null;

      return {
        id: cleanText(record.id, name.toLowerCase().replace(/[^a-z0-9]+/g, "-") || `partner-${index + 1}`),
        name,
        description: cleanText(record.description),
        level: cleanText(record.level, "Partenaire"),
        logoUrl: cleanText(record.logo_url ?? record.logoUrl),
        websiteUrl: cleanText(record.website_url ?? record.websiteUrl),
        altText: cleanText(record.alt_text ?? record.altText, `Logo ${name}`),
        active: typeof record.active === "boolean" ? record.active : true
      };
    })
    .filter((partner): partner is PublicPartner => Boolean(partner))
    .filter((partner) => partner.active);
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
      .in("key", ["club", "contact", "bureau", "partners"]);

    if (error) {
      return defaultPublicClubSettings;
    }

    const rows = (data ?? []) as SettingRow[];
    const club = getSettingValue(rows, "club");
    const contact = getSettingValue(rows, "contact");
    const bureau = getSettingValue(rows, "bureau");
    const partners = getSettingValue(rows, "partners");

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
        genericContacts: cleanStringList(contact.generic_contacts ?? contact.genericContacts, defaultPublicClubSettings.contact.genericContacts),
        facebookUrl: cleanText(contact.facebook_url, defaultPublicClubSettings.contact.facebookUrl),
        instagramUrl: cleanText(contact.instagram_url, defaultPublicClubSettings.contact.instagramUrl)
      },
      bureau: cleanBureau(bureau.members),
      partners: cleanPartners(partners.items)
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

export async function getPublicEvents(): Promise<ClubEvent[]> {
  const result = await fetchPublicEvents();
  return result.data.length > 0 ? result.data : events;
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
    sourceLabel: isFallback ? "Lien FFBaD à confirmer" : "Lien FFBaD configuré par le club",
    confirmationMessage: isFallback
      ? "Le lien d'inscription affiché est le lien de secours du site. Le bureau peut le confirmer ou le remplacer dans l'administration."
      : "Ce lien provient des paramètres publics du site et peut être mis à jour par le club."
  };
}

export async function getConfiguredFfbadRegistrationUrl() {
  const settings = await getPublicClubSettings();
  return settings.club.ffbadUrl;
}
