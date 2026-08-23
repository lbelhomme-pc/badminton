"use client";

import { useEffect, useState } from "react";
import { AdminFeedback, errorFeedback, loadingFeedback, successFeedback, type AdminFeedbackMessage } from "@/components/admin/admin-feedback";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminRoute } from "@/components/auth/admin-route";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { editablePublicPages, type PageContentOverride } from "@/lib/site-content";
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
type AppearanceForm = typeof defaultPublicClubSettings.appearance;
type ContentForm = typeof defaultPublicClubSettings.content;

const defaultBureau: BureauForm = {
  members: defaultPublicClubSettings.bureau
};
const defaultPartners: PartnersForm = {
  items: defaultPublicClubSettings.partners
};
const defaultAppearance: AppearanceForm = defaultPublicClubSettings.appearance;
const defaultContent: ContentForm = defaultPublicClubSettings.content;

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
    phone: typeof record.phone === "string" ? record.phone : fallback.phone,
    photoUrl: typeof record.photoUrl === "string" ? record.photoUrl : typeof record.photo_url === "string" ? record.photo_url : fallback.photoUrl,
    photoAlt: typeof record.photoAlt === "string" ? record.photoAlt : typeof record.photo_alt === "string" ? record.photo_alt : fallback.photoAlt
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

function getAppearanceSetting(rows: SiteSettingRow[]): AppearanceForm {
  const value = getSetting(rows, "appearance");

  return {
    headerLogoUrl: typeof value.headerLogoUrl === "string" ? value.headerLogoUrl : typeof value.header_logo_url === "string" ? value.header_logo_url : defaultAppearance.headerLogoUrl,
    headerLogoAlt: typeof value.headerLogoAlt === "string" ? value.headerLogoAlt : typeof value.header_logo_alt === "string" ? value.header_logo_alt : defaultAppearance.headerLogoAlt,
    footerImageUrl: typeof value.footerImageUrl === "string" ? value.footerImageUrl : typeof value.footer_image_url === "string" ? value.footer_image_url : defaultAppearance.footerImageUrl,
    footerImageAlt: typeof value.footerImageAlt === "string" ? value.footerImageAlt : typeof value.footer_image_alt === "string" ? value.footer_image_alt : defaultAppearance.footerImageAlt,
    homeHeroImageUrl: typeof value.homeHeroImageUrl === "string" ? value.homeHeroImageUrl : typeof value.home_hero_image_url === "string" ? value.home_hero_image_url : defaultAppearance.homeHeroImageUrl
  };
}

function getContentSetting(rows: SiteSettingRow[]): ContentForm {
  const value = getSetting(rows, "content");
  const pages = typeof value.pages === "object" && value.pages !== null && !Array.isArray(value.pages)
    ? (value.pages as Record<string, PageContentOverride>)
    : {};

  return {
    headerRegistrationLabel: typeof value.headerRegistrationLabel === "string" ? value.headerRegistrationLabel : defaultContent.headerRegistrationLabel,
    footerHeading: typeof value.footerHeading === "string" ? value.footerHeading : defaultContent.footerHeading,
    footerDescription: typeof value.footerDescription === "string" ? value.footerDescription : defaultContent.footerDescription,
    homeTitle: typeof value.homeTitle === "string" ? value.homeTitle : defaultContent.homeTitle,
    homeHighlight: typeof value.homeHighlight === "string" ? value.homeHighlight : defaultContent.homeHighlight,
    homeIntro: typeof value.homeIntro === "string" ? value.homeIntro : defaultContent.homeIntro,
    pages
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
  const [appearance, setAppearance] = useState<AppearanceForm>(defaultAppearance);
  const [content, setContent] = useState<ContentForm>(defaultContent);
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
    setAppearance(getAppearanceSetting(result.data));
    setContent(getContentSetting(result.data));
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

  function updateAppearance(field: keyof AppearanceForm, value: string) {
    setAppearance((current) => ({ ...current, [field]: value }));
  }

  function updateContent(field: Exclude<keyof ContentForm, "pages">, value: string) {
    setContent((current) => ({ ...current, [field]: value }));
  }

  function updatePageContent(pageKey: string, field: keyof PageContentOverride, value: string) {
    setContent((current) => ({
      ...current,
      pages: {
        ...current.pages,
        [pageKey]: { ...(current.pages[pageKey] ?? {}), [field]: value }
      }
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

    const [clubResult, contactResult, bureauResult, partnersResult, appearanceResult, contentResult] = await Promise.all([
      upsertSiteSetting({ key: "club", value: club, visibility: "public" }),
      upsertSiteSetting({ key: "contact", value: contact, visibility: "public" }),
      upsertSiteSetting({ key: "bureau", value: bureau, visibility: "public" }),
      upsertSiteSetting({ key: "partners", value: partners, visibility: "public" }),
      upsertSiteSetting({ key: "appearance", value: { ...appearance }, visibility: "public" }),
      upsertSiteSetting({ key: "content", value: { ...content }, visibility: "public" })
    ]);

    setPending(false);
    setFeedback(
      clubResult.ok && contactResult.ok && bureauResult.ok && partnersResult.ok && appearanceResult.ok && contentResult.ok
        ? successFeedback("Paramètres du site mis à jour.")
        : errorFeedback(
            !clubResult.ok
              ? clubResult.message
              : !contactResult.ok
                ? contactResult.message
                : !bureauResult.ok
                  ? bureauResult.message
                : !partnersResult.ok
                  ? partnersResult.message
                  : !appearanceResult.ok
                    ? appearanceResult.message
                    : contentResult.message
          )
    );

    if (clubResult.ok && contactResult.ok && bureauResult.ok && partnersResult.ok && appearanceResult.ok && contentResult.ok) {
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
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-court-900">Images du site</h2>
              <p className="mt-2 text-sm leading-6 text-ink-500">
                Téléverse d'abord une image dans la médiathèque, puis colle son URL publique ici. Une valeur vide conserve l'affichage de secours.
              </p>
            </div>
            <a href="/admin/medias" className="font-display text-sm font-bold text-court-600 hover:underline">
              Ouvrir la médiathèque
            </a>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-3">
            <SettingsImageInput
              label="Logo du header"
              url={appearance.headerLogoUrl}
              alt={appearance.headerLogoAlt}
              onUrlChange={(value) => updateAppearance("headerLogoUrl", value)}
              onAltChange={(value) => updateAppearance("headerLogoAlt", value)}
            />
            <SettingsImageInput
              label="Image du footer"
              url={appearance.footerImageUrl}
              alt={appearance.footerImageAlt}
              onUrlChange={(value) => updateAppearance("footerImageUrl", value)}
              onAltChange={(value) => updateAppearance("footerImageAlt", value)}
            />
            <SettingsImageInput
              label="Photo de l'accueil"
              url={appearance.homeHeroImageUrl}
              alt=""
              onUrlChange={(value) => updateAppearance("homeHeroImageUrl", value)}
              onAltChange={() => undefined}
              decorative
            />
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h2 className="text-xl font-black text-court-900">Textes globaux</h2>
          <p className="mt-2 text-sm leading-6 text-ink-500">
            Ces textes apparaissent dans la navigation, l'accueil et le pied de page.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <SettingsInput label="Lien d'inscription du menu" value={content.headerRegistrationLabel} onChange={(value) => updateContent("headerRegistrationLabel", value)} />
            <SettingsInput label="Titre du footer" value={content.footerHeading} onChange={(value) => updateContent("footerHeading", value)} />
            <SettingsTextarea label="Description du footer" value={content.footerDescription} onChange={(value) => updateContent("footerDescription", value)} />
            <SettingsInput label="Titre principal de l'accueil" value={content.homeTitle} onChange={(value) => updateContent("homeTitle", value)} />
            <SettingsInput label="Titre coloré de l'accueil" value={content.homeHighlight} onChange={(value) => updateContent("homeHighlight", value)} />
            <SettingsTextarea label="Introduction de l'accueil" value={content.homeIntro} onChange={(value) => updateContent("homeIntro", value)} />
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h2 className="text-xl font-black text-court-900">Textes et bandeaux des pages</h2>
          <p className="mt-2 text-sm leading-6 text-ink-500">
            Ouvre une page pour remplacer son surtitre, son titre, son introduction ou sa photo de bandeau. Un champ vide conserve le texte prévu dans le site.
          </p>
          <div className="mt-5 grid gap-4">
            {editablePublicPages.map((page) => {
              const pageContent = content.pages[page.key] ?? {};

              return (
                <details key={page.key} className="rounded-lg border border-court-100 bg-court-50 p-4">
                  <summary className="cursor-pointer font-display font-black text-court-900">
                    {page.label} <span className="ml-2 text-xs font-semibold text-ink-500">{page.key}</span>
                  </summary>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <SettingsInput label="Surtitre" required={false} value={pageContent.eyebrow ?? ""} onChange={(value) => updatePageContent(page.key, "eyebrow", value)} />
                    <SettingsInput label="Titre" required={false} value={pageContent.title ?? ""} onChange={(value) => updatePageContent(page.key, "title", value)} />
                    <SettingsTextarea label="Introduction" value={pageContent.intro ?? ""} onChange={(value) => updatePageContent(page.key, "intro", value)} />
                    <SettingsInput label="URL de l'image de bandeau" required={false} value={pageContent.imageUrl ?? ""} onChange={(value) => updatePageContent(page.key, "imageUrl", value)} />
                    <SettingsInput label="Texte alternatif de l'image" required={false} value={pageContent.imageAlt ?? ""} onChange={(value) => updatePageContent(page.key, "imageAlt", value)} />
                    {(!("bodyEditable" in page) || page.bodyEditable) ? (
                      <div className="md:col-span-2">
                        <SettingsTextarea
                          label="Contenu principal complet (facultatif)"
                          value={pageContent.body ?? ""}
                          onChange={(value) => updatePageContent(page.key, "body", value)}
                        />
                        <p className="mt-1 text-xs leading-5 text-ink-500">
                          Si ce champ est rempli, il remplace les cartes et paragraphes prévus par défaut sur cette page. Les retours à la ligne sont conservés.
                        </p>
                      </div>
                    ) : null}
                  </div>
                </details>
              );
            })}
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
                  <SettingsInput label="Photo URL" required={false} value={member.photoUrl} onChange={(value) => updateBureau(index, "photoUrl", value)} />
                  <SettingsInput label="Texte alternatif de la photo" required={false} value={member.photoAlt} onChange={(value) => updateBureau(index, "photoAlt", value)} />
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

function SettingsImageInput({
  label,
  url,
  alt,
  onUrlChange,
  onAltChange,
  decorative = false
}: {
  label: string;
  url: string;
  alt: string;
  onUrlChange: (value: string) => void;
  onAltChange: (value: string) => void;
  decorative?: boolean;
}) {
  return (
    <div className="rounded-lg border border-court-100 bg-court-50 p-4">
      <p className="font-display text-sm font-black text-court-900">{label}</p>
      {url ? (
        <div className="mt-3 flex h-32 items-center justify-center overflow-hidden rounded-lg border border-court-100 bg-white p-3">
          <img src={url} alt={alt} className="max-h-full max-w-full object-contain" />
        </div>
      ) : (
        <div className="mt-3 flex h-32 items-center justify-center rounded-lg border border-dashed border-court-200 bg-white text-sm text-ink-500">
          Aucune image configurée
        </div>
      )}
      <div className="mt-4 grid gap-3">
        <SettingsInput label="URL publique" required={false} value={url} onChange={onUrlChange} />
        {!decorative ? <SettingsInput label="Texte alternatif" required={false} value={alt} onChange={onAltChange} /> : null}
      </div>
    </div>
  );
}
