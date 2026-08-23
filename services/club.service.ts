import { events, ffbadRegistrationUrl, rankings, shuttleProducts, slots, venues } from "@/lib/mock-data";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { fetchPublicEvents } from "@/services/supabase-data.service";
import { heroBadgeIconOptions, type HeroBadgeIcon, type InlineTextOverrides, type PageContentOverride, type PageHeroBadge } from "@/lib/site-content";
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
  appearance: PublicAppearanceSettings;
  content: PublicContentSettings;
}

export interface PublicAppearanceSettings {
  headerLogoUrl: string;
  headerLogoAlt: string;
  footerImageUrl: string;
  footerImageAlt: string;
  homeHeroImageUrl: string;
}

export interface PublicContentSettings {
  headerRegistrationLabel: string;
  footerHeading: string;
  footerDescription: string;
  footerAddress: string;
  homeTitle: string;
  homeHighlight: string;
  homeIntro: string;
  pages: Record<string, PageContentOverride>;
  inlineTexts: InlineTextOverrides;
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

const defaultPublicPartners: PublicPartner[] = [
  {
    id: "sporteam",
    name: "SPORTEAM",
    description: "Tous les adhérents du CFVV bénéficieront de prix attractifs sur l'ensemble de la gamme badminton.",
    level: "Partenaire équipement",
    logoUrl: "/partners/sporteam.png",
    websiteUrl: "",
    altText: "Logo SPORTEAM",
    active: true
  },
  {
    id: "mairie-vendome",
    name: "Mairie de Vendôme",
    description: "Le CFVV remercie le service des sports de la ville de Vendôme.",
    level: "Collectivité",
    logoUrl: "/partners/mairie-vendome.png",
    websiteUrl: "",
    altText: "Logo de la ville de Vendôme",
    active: true
  },
  {
    id: "codep41",
    name: "CODEP41",
    description: "Le CFVV remercie le Comité départemental de Badminton du Loir-et-Cher pour son accompagnement du badminton dans le département.",
    level: "Comité départemental",
    logoUrl: "/partners/codep41.png",
    websiteUrl: "https://www.badminton41.org/",
    altText: "Logo du CODEP41, Comité départemental de Badminton du Loir-et-Cher",
    active: true
  }
];

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
    instagramUrl: "https://www.instagram.com/cfvv.41/"
  },
  appearance: {
    headerLogoUrl: "/logos/cfvv-horizontal.png",
    headerLogoAlt: "Logo du CFVV",
    footerImageUrl: "",
    footerImageAlt: "",
    homeHeroImageUrl: ""
  },
  content: {
    headerRegistrationLabel: "Inscriptions 2026-2027",
    footerHeading: "Club des fous du Volants Vendômois",
    footerDescription: "Badminton à Vendôme : pratique loisir, progression, compétition et vie associative.",
    footerAddress: "Gymnase des Aigremonts, 554 Rue de la Chappe, 41100 Vendôme",
    homeTitle: "Le badminton à Vendôme,",
    homeHighlight: "dans une ambiance conviviale et dynamique",
    homeIntro: "Le Club des fous du Volants Vendômois accueille les débutants comme les joueurs confirmés, pour partager le plaisir du jeu dans la bonne humeur.",
    pages: {},
    inlineTexts: {}
  },
  partners: defaultPublicPartners,
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
  key: "club" | "contact" | "bureau" | "partners" | "appearance" | "content";
  value: Record<string, unknown> | null;
}

function cleanText(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function cleanMediaUrl(value: unknown, fallback = "") {
  const url = cleanText(value, fallback);
  if (!url) return "";
  if (url.startsWith("/") && !url.startsWith("//")) return url;

  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? url : fallback;
  } catch {
    return fallback;
  }
}

function cleanPageOverrides(value: unknown): Record<string, PageContentOverride> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return {};

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).flatMap(([key, raw]) => {
      if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return [];
      const record = raw as Record<string, unknown>;
      const badges = Array.isArray(record.badges)
        ? record.badges
            .map((badge, index): PageHeroBadge | null => {
              if (typeof badge !== "object" || badge === null || Array.isArray(badge)) return null;
              const badgeRecord = badge as Record<string, unknown>;
              const label = cleanText(badgeRecord.label);
              if (!label) return null;
              const requestedIcon = cleanText(badgeRecord.icon, "info") as HeroBadgeIcon;
              const icon = heroBadgeIconOptions.some((option) => option.value === requestedIcon) ? requestedIcon : "info";

              return {
                id: cleanText(badgeRecord.id, `badge-${index + 1}`),
                label,
                icon
              };
            })
            .filter((badge): badge is PageHeroBadge => Boolean(badge))
        : undefined;
      return [[key, {
        eyebrow: cleanText(record.eyebrow),
        title: cleanText(record.title),
        intro: cleanText(record.intro),
        body: cleanText(record.body),
        imageUrl: cleanMediaUrl(record.imageUrl ?? record.image_url),
        imageAlt: cleanText(record.imageAlt ?? record.image_alt),
        badges
      } satisfies PageContentOverride]];
    })
  );
}

function cleanInlineTextOverrides(value: unknown): InlineTextOverrides {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return {};

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).flatMap(([pathname, rawTexts]) => {
      if (typeof rawTexts !== "object" || rawTexts === null || Array.isArray(rawTexts)) return [];
      const texts = Object.fromEntries(
        Object.entries(rawTexts as Record<string, unknown>)
          .filter((entry): entry is [string, string] => typeof entry[1] === "string")
          .map(([key, text]) => [key, text.slice(0, 5000)])
      );
      return [[pathname, texts]];
    })
  );
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
  const source = Array.isArray(value) ? value : defaultPublicPartners;

  const partners = source
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

  return partners.length > 0 ? partners : defaultPublicPartners;
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
      .in("key", ["club", "contact", "bureau", "partners", "appearance", "content"]);

    if (error) {
      return defaultPublicClubSettings;
    }

    const rows = (data ?? []) as SettingRow[];
    const club = getSettingValue(rows, "club");
    const contact = getSettingValue(rows, "contact");
    const bureau = getSettingValue(rows, "bureau");
    const partners = getSettingValue(rows, "partners");
    const appearance = getSettingValue(rows, "appearance");
    const content = getSettingValue(rows, "content");

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
      appearance: {
        headerLogoUrl: cleanMediaUrl(appearance.header_logo_url ?? appearance.headerLogoUrl, defaultPublicClubSettings.appearance.headerLogoUrl),
        headerLogoAlt: cleanText(appearance.header_logo_alt ?? appearance.headerLogoAlt, defaultPublicClubSettings.appearance.headerLogoAlt),
        footerImageUrl: cleanMediaUrl(appearance.footer_image_url ?? appearance.footerImageUrl),
        footerImageAlt: cleanText(appearance.footer_image_alt ?? appearance.footerImageAlt),
        homeHeroImageUrl: cleanMediaUrl(appearance.home_hero_image_url ?? appearance.homeHeroImageUrl)
      },
      content: {
        headerRegistrationLabel: cleanText(content.header_registration_label ?? content.headerRegistrationLabel, defaultPublicClubSettings.content.headerRegistrationLabel),
        footerHeading: cleanText(content.footer_heading ?? content.footerHeading, defaultPublicClubSettings.content.footerHeading),
        footerDescription: cleanText(content.footer_description ?? content.footerDescription, defaultPublicClubSettings.content.footerDescription),
        footerAddress: cleanText(content.footer_address ?? content.footerAddress, defaultPublicClubSettings.content.footerAddress),
        homeTitle: cleanText(content.home_title ?? content.homeTitle, defaultPublicClubSettings.content.homeTitle),
        homeHighlight: cleanText(content.home_highlight ?? content.homeHighlight, defaultPublicClubSettings.content.homeHighlight),
        homeIntro: cleanText(content.home_intro ?? content.homeIntro, defaultPublicClubSettings.content.homeIntro),
        pages: cleanPageOverrides(content.pages),
        inlineTexts: cleanInlineTextOverrides(content.inlineTexts ?? content.inline_texts)
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
    sourceLabel: isFallback ? "Ancienne page d'inscription du club" : "Lien FFBaD configuré par le club",
    confirmationMessage: isFallback
      ? "Cette page reste accessible, mais ses informations peuvent être anciennes. Le bureau doit la remplacer dans l'administration dès que le lien Poona 2026/2027 est disponible."
      : "Ce lien provient des paramètres publics du site et peut être mis à jour par le club."
  };
}

export async function getConfiguredFfbadRegistrationUrl() {
  const settings = await getPublicClubSettings();
  return settings.club.ffbadUrl;
}
