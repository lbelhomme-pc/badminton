"use client";

import { useEffect, useState } from "react";
import { AdminFeedback, errorFeedback, successFeedback, type AdminFeedbackMessage } from "@/components/admin/admin-feedback";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminRoute } from "@/components/auth/admin-route";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { defaultPublicClubSettings, type PublicBureauMember } from "@/services/club.service";
import { fetchSiteSettings, upsertSiteSetting, type SiteSettingRow } from "@/services/supabase-data.service";

const defaultClub = {
  name: "CF2V41",
  full_name: "Club des fous du Volant Vendômois",
  city: "Vendôme",
  registered_office: "Naveil",
  ffbad_url: ""
};

const defaultContact = {
  email: "cfvv41@gmail.com",
  phone: "",
  facebook_url: "",
  instagram_url: ""
};

type ClubForm = typeof defaultClub;
type ContactForm = typeof defaultContact;
type BureauForm = {
  members: PublicBureauMember[];
};

const defaultBureau: BureauForm = {
  members: defaultPublicClubSettings.bureau
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

function getBureauSetting(rows: SiteSettingRow[]): BureauForm {
  const value = getSetting(rows, "bureau");
  const members = Array.isArray(value.members) ? value.members : defaultBureau.members;

  return {
    members: defaultBureau.members.map((fallback, index) => cleanMember(members[index], fallback))
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
  const [feedback, setFeedback] = useState<AdminFeedbackMessage>(null);
  const [pending, setPending] = useState(false);

  async function load() {
    const result = await fetchSiteSettings();

    if (result.error) {
      setFeedback(errorFeedback(result.error));
      return;
    }

    setClub({ ...defaultClub, ...getSetting(result.data, "club") });
    setContact({ ...defaultContact, ...getSetting(result.data, "contact") });
    setBureau(getBureauSetting(result.data));
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

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);

    const [clubResult, contactResult, bureauResult] = await Promise.all([
      upsertSiteSetting({ key: "club", value: club, visibility: "public" }),
      upsertSiteSetting({ key: "contact", value: contact, visibility: "public" }),
      upsertSiteSetting({ key: "bureau", value: bureau, visibility: "public" })
    ]);

    setPending(false);
    setFeedback(
      clubResult.ok && contactResult.ok && bureauResult.ok
        ? successFeedback("Paramètres du site mis à jour.")
        : errorFeedback(!clubResult.ok ? clubResult.message : !contactResult.ok ? contactResult.message : bureauResult.message)
    );

    if (clubResult.ok && contactResult.ok && bureauResult.ok) {
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
            <SettingsInput label="Lien inscription FFBaD" required={false} value={club.ffbad_url} onChange={(value) => updateClub("ffbad_url", value)} />
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-xl font-black text-court-900">Contact public</h2>
          <div className="mt-5 grid gap-4">
            <SettingsInput label="Email du club" type="email" required={false} value={contact.email} onChange={(value) => updateContact("email", value)} />
            <SettingsInput label="Téléphone" required={false} value={contact.phone} onChange={(value) => updateContact("phone", value)} />
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
