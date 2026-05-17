"use client";

import { useEffect, useState } from "react";
import { AdminFeedback, errorFeedback, successFeedback, type AdminFeedbackMessage } from "@/components/admin/admin-feedback";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminRoute } from "@/components/auth/admin-route";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fetchSiteSettings, upsertSiteSetting, type SiteSettingRow } from "@/services/supabase-data.service";

const defaultClub = {
  name: "CFVV41",
  full_name: "Club des fous du Volant Vendômois",
  city: "Vendôme",
  ffbad_url: ""
};

const defaultContact = {
  email: "",
  phone: "",
  facebook_url: "",
  instagram_url: ""
};

type ClubForm = typeof defaultClub;
type ContactForm = typeof defaultContact;

function getSetting(rows: SiteSettingRow[], key: SiteSettingRow["key"]) {
  return rows.find((row) => row.key === key)?.value ?? {};
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

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);

    const [clubResult, contactResult] = await Promise.all([
      upsertSiteSetting({ key: "club", value: club, visibility: "public" }),
      upsertSiteSetting({ key: "contact", value: contact, visibility: "public" })
    ]);

    setPending(false);
    setFeedback(
      clubResult.ok && contactResult.ok
        ? successFeedback("Paramètres du site mis à jour.")
        : errorFeedback(!clubResult.ok ? clubResult.message : contactResult.message)
    );

    if (clubResult.ok && contactResult.ok) {
      await load();
    }
  }

  return (
    <AdminShell
      title="Paramètres du site"
      intro="Centralise les informations publiques du club : nom, ville, lien FFBaD, contact et réseaux. Ces données serviront progressivement aux pages publiques."
    >
      <AdminFeedback feedback={feedback} className="mb-6" />

      <form className="grid gap-6 lg:grid-cols-2" onSubmit={save}>
        <Card className="p-5">
          <h2 className="text-xl font-black text-court-900">Identité du club</h2>
          <div className="mt-5 grid gap-4">
            <SettingsInput label="Nom court" value={club.name} onChange={(value) => updateClub("name", value)} />
            <SettingsInput label="Nom complet" value={club.full_name} onChange={(value) => updateClub("full_name", value)} />
            <SettingsInput label="Ville" value={club.city} onChange={(value) => updateClub("city", value)} />
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
          <h2 className="text-xl font-black text-court-900">À savoir</h2>
          <p className="mt-2 text-sm leading-6 text-ink-500">
            Cette page prépare la suite : les pages publiques pourront lire ces paramètres au lieu d'avoir des textes figés dans le code.
            Pour l'instant, elle sert de source propre côté Supabase.
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
