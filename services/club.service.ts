import { events, ffbadRegistrationUrl, rankings, shuttleProducts, slots, venues } from "@/lib/mock-data";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export interface PublicClubSettings {
  club: {
    name: string;
    fullName: string;
    city: string;
    ffbadUrl: string;
  };
  contact: {
    email: string;
    phone: string;
    facebookUrl: string;
    instagramUrl: string;
  };
}

export const defaultPublicClubSettings: PublicClubSettings = {
  club: {
    name: "CFVV41",
    fullName: "Club des fous du Volant Vendômois",
    city: "Vendôme",
    ffbadUrl: ffbadRegistrationUrl
  },
  contact: {
    email: "",
    phone: "",
    facebookUrl: "",
    instagramUrl: ""
  }
};

interface SettingRow {
  key: "club" | "contact";
  value: Record<string, unknown> | null;
}

function cleanText(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function getSettingValue(rows: SettingRow[], key: SettingRow["key"]) {
  return rows.find((row) => row.key === key)?.value ?? {};
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
      .in("key", ["club", "contact"]);

    if (error) {
      return defaultPublicClubSettings;
    }

    const rows = (data ?? []) as SettingRow[];
    const club = getSettingValue(rows, "club");
    const contact = getSettingValue(rows, "contact");

    return {
      club: {
        name: cleanText(club.name, defaultPublicClubSettings.club.name),
        fullName: cleanText(club.full_name, defaultPublicClubSettings.club.fullName),
        city: cleanText(club.city, defaultPublicClubSettings.club.city),
        ffbadUrl: cleanText(club.ffbad_url, defaultPublicClubSettings.club.ffbadUrl)
      },
      contact: {
        email: cleanText(contact.email, defaultPublicClubSettings.contact.email),
        phone: cleanText(contact.phone, defaultPublicClubSettings.contact.phone),
        facebookUrl: cleanText(contact.facebook_url, defaultPublicClubSettings.contact.facebookUrl),
        instagramUrl: cleanText(contact.instagram_url, defaultPublicClubSettings.contact.instagramUrl)
      }
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

export async function getConfiguredFfbadRegistrationUrl() {
  const settings = await getPublicClubSettings();
  return settings.club.ffbadUrl;
}
