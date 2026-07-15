"use client";

import { useEffect, useState } from "react";
import { AdminFeedback, errorFeedback, loadingFeedback, successFeedback, type AdminFeedbackMessage } from "@/components/admin/admin-feedback";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminRoute } from "@/components/auth/admin-route";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { defaultPublicClubSettings, type PublicBureauMember, type PublicPartner } from "@/services/club.service";
import { fetchSiteSettings, upsertSiteSetting, type SiteSettingRow } from "@/services/supabase-data.service";

const defaultClub = {
  name: "CFVV",
  full_name: "Club des fous du Volants Vendômois",
  city: "Vendôme",
  registered_office: "10 Imp. de la Devallerie, 41100 Naveil",
  ffbad_url: defaultPublicClubSettings.club.ffbadUrl
};

const defaultContact = {
  email: "cfvv41@gmail.com",
  phone: "06 60 93 51 85",
  generic_contacts: "Clovis Bellan / Didier Remule / Julie Remule",
  facebook_url: "https://www.facebook.com/CFVVBadminton/",
  instagram_url: ""
};

type ClubForm = typeof defaultClub;
type ContactForm = typeof defaultContact;
type BureauForm = {
  members: PublicBureauMember[];
};
type PartnersForm = {
  items: PublicPartner[];
};

const defaultBureau: BureauForm = {
  members: defaultPublicClubSettings.bureau
};
const defaultPartners: PartnersForm = {
  items: defaultPublicClubSettings.partners
};

function getSetting(rows: SiteSettingRow[], key: SiteSettingRow["key"]) {
  return rows.find((row) => row.key === key)?.value ?? {};
}

function cleanMember(item: unknown, fallback: PublicBureauMember): PublicBureauMember {
  const record = typeof item === "object" && item !== null ? (item as Record<string, unknown>) : {};

  return {
    key: typeof record.key === "string" ? record.key : fallback.key,
    role: typeof record.role === "string" ? record.role : fallback.role,
    name: typeof record.name === "string" ? record.name : fallback.name,
    mission: typeof record.mission === "string" ? record.mission : fallback.mission,
    email: typeof record.email === "string" ? record.email : fallback.email,
    phone: typeof record.phone === "string" ? record.phone : fallback.phone
  };
}

function cleanPartner(item: unknown, index: number): PublicPartner {
  const record = typeof item === "object" && item !== null ? (item as Record<string, unknown>) : {};
  const name = typeof record.name === "string" ? record.name : "";

  return {
    id: typeof record.id === "string" && record.id ? record.id : `partner-${index + 1}`,
    name,
    description: typeof record.description === "string" ? record.description : "",
    level: typeof record.level === "string" ? record.level : "Partenaire",
    logoUrl: typeof record.logoUrl === "string" ? record.logoUrl : typeof record.logo_url === "string" ? record.logo_url : "",
    websiteUrl: typeof record.websiteUrl === "string" ? record.websiteUrl : typeof record.website_url === "string" ? record.website_url : "",
    altText: typeof record.altText === "string" ? record.altText : typeof record.alt_text === "string" ? record.alt_text : name ? `Logo ${name}` : "",
    active: typeof record.active === "boolean" ? record.active : true
  };
}

function getBureauSetting(rows: SiteSettingRow[]): BureauForm {
  const value = getSetting(rows, "bureau");
  const members = Array.isArray(value.members) ? value.members : defaultBureau.members;

  return {
    members: defaultBureau.members.map((fallback, index) => cleanMember(members[index], fallback))
  };
}

function getPartnersSetting(rows: SiteSettingRow[]): PartnersForm {
  const value = getSetting(rows, "partners");
  const items = Array.isArray(value.items) ? value.items : defaultPartners.items;

  return {
    items: items.map((item, index) => cleanPartner(item, index))
  };
}

function getContactSetting(rows: SiteSettingRow[]): ContactForm {
  const value = getSetting(rows, "contact");

  return {
    ...defaultContact,
    ...value,
    facebook_url:
      typeof value.facebook_url === "string" && value.facebook_url.trim().length > 0
        ? value.facebook_url
        : defaultContact.facebook_url
  };
}

export function AdminParametres() {
  return (
    <AdminRoute>
      <AdminParametresContent />
    </AdminRoute>
  );
}

function AdminParametresContent() {
  const [club, setClub] = useState<ClubForm>(defaultClub);
  const [contact, setContact] = useState<ContactForm>(defaultContact);
  const [bureau, setBureau] = useState<BureauForm>(defaultBureau);
  const [partners, setPartners] = useState<PartnersForm>(defaultPartners);
  const [feedback, setFeedback] = useState<AdminFeedbackMessage>(null);
  const [pending, setPending] = useState(false);

  async function load() {
    const result = await fetchSiteSettings();

    if (result.error) {
      setFeedback(errorFeedback(result.error));
      return;
    }

    setClub({ ...defaultClub, ...getSetting(result.data, "club") });
    setContact(getContactSetting(result.data));
    setBureau(getBureauSetting(result.data));
    setPartners(getPartnersSetting(result.data));
  }

  useEffect(() => {
    load();
  }, []);

  function updateClub(field: keyof ClubForm, value: string) {
    setClub((current) => ({ ...current, [field]: value }));
  }

  function updateContact(field: keyof ContactForm, value: string) {
    setContact((current) => ({ ...current, [field]: value }));
  }

  function updateBureau(index: number, field: keyof PublicBureauMember, value: string) {
    setBureau((current) => ({
      members: current.members.map((member, memberIndex) =>
        memberIndex === index ? { ...member, [field]: value } : member
      )
    }));
  }

  function updatePartner(index: number, field: keyof PublicPartner, value: string | boolean) {
    setPartners((current) => ({
      items: current.items.map((partner, partnerIndex) =>
        partnerIndex === index ? { ...partner, [field]: value } : partner
      )
    }));
  }

  function addPartner() {
    setPartners((current) => ({
      items: [
        ...current.items,
        {
          id: `partner-${Date.now()}`,
          name: "",
          description: "",
          level: "Partenaire",
          logoUrl: "",
          websiteUrl: "",
          altText: "",
          active: true
        }
      ]
    }));
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setFeedback(loadingFeedback("Enregistrement des paramètres du site en cours..."));

    const [clubResult, contactResult, bureauResult, partnersResult] = await Promise.all([
      upsertSiteSetting({ key: "club", value: club, visibility: "public" }),
      upsertSiteSetting({ key: "contact", value: contact, visibility: "public" }),
      upsertSiteSetting({ key: "bureau", value: bureau, visibility: "public" }),
      upsertSiteSetting({ key: "partners", value: partners, visibility: "public" })
    ]);

    setPending(false);
    setFeedback(
      clubResult.ok && contactResult.ok && bureauResult.ok && partnersResult.ok
        ? successFeedback("Paramètres du site mis à jour.")
        : errorFeedback(
            !clubResult.ok
              ? clubResult.message
              : !contactResult.ok
                ? contactResult.message
                : !bureauResult.ok
                  ? bureauResult.message
                  : partnersResult.message
          )
    );

    if (clubResult.ok && contactResult.ok && bureauResult.ok && partnersResult.ok) {
      await load();
    }
  }

  return (
    <AdminShell
      title="Paramètres du site"
      intro="Centralise les informations publiques du club : identité, lien FFBaD, contact, bureau et réseaux."
    >
      <AdminFeedback feedback={feedback} className="mb-6" />

      <form className="grid gap-6 lg:grid-cols-2" onSubmit={save}>
        <Card className="p-5">
          <h2 className="text-xl font-black text-court-900">Identité du club</h2>
          <div className="mt-5 grid gap-4">
            <SettingsInput label="Nom court" value={club.name} onChange={(value) => updateClub("name", value)} />
            <SettingsInput label="Nom complet" value={club.full_name} onChange={(value) => updateClub("full_name", value)} />
            <SettingsInput label="Ville" value={club.city} onChange={(value) => updateClub("city", value)} />
            <SettingsInput label="Siège social" value={club.registered_office} onChange={(value) => updateClub("registered_office", value)} />
            <div>
              <SettingsInput
                label="Lien officiel inscription"
                required={false}
                value={club.ffbad_url}
                onChange={(value) => updateClub("ffbad_url", value)}
              />
              <p className="mt-2 text-xs leading-5 text-ink-500">
                À vérifier chaque saison : lien FFBaD, HelloAsso ou page club utilisée pour finaliser l'inscription.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-xl font-black text-court-900">Contact public</h2>
          <div className="mt-5 grid gap-4">
            <SettingsInput label="Email du club" type="email" required={false} value={contact.email} onChange={(value) => updateContact("email", value)} />
            <SettingsInput label="Téléphone" required={false} value={contact.phone} onChange={(value) => updateContact("phone", value)} />
            <SettingsInput
              label="Référents contact"
              required={false}
              value={contact.generic_contacts}
              onChange={(value) => updateContact("generic_contacts", value)}
            />
            <SettingsInput label="Facebook" required={false} value={contact.facebook_url} onChange={(value) => updateContact("facebook_url", value)} />
            <SettingsInput label="Instagram" required={false} value={contact.instagram_url} onChange={(value) => updateContact("instagram_url", value)} />
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h2 className="text-xl font-black text-court-900">Bureau du club</h2>
          <p className="mt-2 text-sm leading-6 text-ink-500">
            Ces informations alimentent la page publique “Bureau et bénévoles”. Les emails et téléphones peuvent rester vides.
          </p>
          <div className="mt-5 grid gap-5">
            {bureau.members.map((member, index) => (
              <div key={member.key} className="rounded-lg border border-court-100 bg-court-50 p-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <SettingsInput label="Rôle" value={member.role} onChange={(value) => updateBureau(index, "role", value)} />
                  <SettingsInput label="Nom affiché" value={member.name} onChange={(value) => updateBureau(index, "name", value)} />
                  <SettingsInput label="Email" type="email" required={false} value={member.email} onChange={(value) => updateBureau(index, "email", value)} />
                  <SettingsInput label="Téléphone" required={false} value={member.phone} onChange={(value) => updateBureau(index, "phone", value)} />
                  <SettingsTextarea
                    label="Mission"
                    value={member.mission}
                    onChange={(value) => updateBureau(index, "mission", value)}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-court-900">Partenaires publics</h2>
              <p className="mt-2 text-sm leading-6 text-ink-500">
                Ces informations alimentent la page Partenaires et le bloc “Ils nous soutiennent” de l'accueil.
              </p>
            </div>
            <Button type="button" variant="outline" onClick={addPartner}>
              Ajouter un partenaire
            </Button>
          </div>

          {partners.items.length === 0 ? (
            <p className="mt-5 rounded-lg bg-court-50 px-4 py-3 text-sm font-semibold text-ink-600">
              Aucun partenaire publié. L'accueil affichera un état “à confirmer” sans logo fictif.
            </p>
          ) : (
            <div className="mt-5 grid gap-5">
              {partners.items.map((partner, index) => (
                <div key={partner.id} className="rounded-lg border border-court-100 bg-court-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-bold text-court-900">Partenaire {index + 1}</p>
                    <button
                      type="button"
                      className="font-display text-sm font-bold text-court-700 hover:underline"
                      onClick={() => updatePartner(index, "active", !partner.active)}
                    >
                      {partner.active ? "Retirer" : "Restaurer"}
                    </button>
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <SettingsInput label="Nom" value={partner.name} onChange={(value) => updatePartner(index, "name", value)} />
                    <SettingsInput label="Niveau" value={partner.level} onChange={(value) => updatePartner(index, "level", value)} />
                    <SettingsInput label="Logo URL" required={false} value={partner.logoUrl} onChange={(value) => updatePartner(index, "logoUrl", value)} />
                    <SettingsInput label="Site web" required={false} value={partner.websiteUrl} onChange={(value) => updatePartner(index, "websiteUrl", value)} />
                    <SettingsInput label="Texte alternatif du logo" required={false} value={partner.altText} onChange={(value) => updatePartner(index, "altText", value)} />
                    <label className="flex items-center gap-3 text-sm font-semibold text-court-900">
                      <input
                        type="checkbox"
                        checked={partner.active}
                        onChange={(event) => updatePartner(index, "active", event.target.checked)}
                        className="h-4 w-4 rounded border-court-300 text-court-600 focus:ring-court-500"
                      />
                      Afficher ce partenaire
                    </label>
                    <SettingsTextarea
                      label="Description"
                      value={partner.description}
                      onChange={(value) => updatePartner(index, "description", value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h2 className="text-xl font-black text-court-900">À savoir</h2>
          <p className="mt-2 text-sm leading-6 text-ink-500">
            Les créneaux, actualités, tarifs, volants et réservations ont leurs pages dédiées dans l'administration.
            Cette page gère les informations transversales du site.
          </p>
          <Button className="mt-5 w-full sm:w-auto" type="submit" disabled={pending}>
            {pending ? "Enregistrement..." : "Enregistrer les paramètres"}
          </Button>
        </Card>
      </form>
    </AdminShell>
  );
}

function SettingsInput({
  label,
  value,
  onChange,
  type = "text",
  required = true
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-court-900">
      {label}
      <input
        required={required}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-lg border border-court-200 bg-court-50 px-3 outline-none focus:border-court-500 focus:ring-2 focus:ring-court-500/20"
      />
    </label>
  );
}

function SettingsTextarea({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-court-900 md:col-span-2">
      {label}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-24 rounded-lg border border-court-200 bg-white px-3 py-3 outline-none focus:border-court-500 focus:ring-2 focus:ring-court-500/20"
      />
    </label>
  );
}
