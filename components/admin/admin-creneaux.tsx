"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminRoute } from "@/components/auth/admin-route";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createCreneau, fetchCreneaux, updateCreneau, type CreneauRow } from "@/services/supabase-data.service";

const initialForm = {
  jour: "Lundi",
  heure_debut: "19:00",
  heure_fin: "21:00",
  gymnase: "Gymnase principal",
  adresse: "",
  type: "jeu_libre",
  public: "adultes",
  niveau: "Tous niveaux",
  places_max: "24",
  responsable: ""
};

export function AdminCreneaux() {
  return (
    <AdminRoute requiredRole="manager">
      <AdminCreneauxContent />
    </AdminRoute>
  );
}

function AdminCreneauxContent() {
  const [creneaux, setCreneaux] = useState<CreneauRow[]>([]);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const result = await fetchCreneaux();
    setCreneaux(result.data);
    setMessage(result.error);
  }

  useEffect(() => {
    load();
  }, []);

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await createCreneau({
      jour: form.jour,
      heure_debut: form.heure_debut,
      heure_fin: form.heure_fin,
      gymnase: form.gymnase,
      adresse: form.adresse || null,
      type: form.type,
      public: form.public,
      niveau: form.niveau || null,
      places_max: form.places_max ? Number(form.places_max) : null,
      responsable: form.responsable || null,
      actif: true
    });
    setMessage(result.message);
    if (result.ok) {
      setForm(initialForm);
      await load();
    }
  }

  async function toggleActive(creneau: CreneauRow) {
    const result = await updateCreneau(creneau.id, { actif: !creneau.actif });
    setMessage(result.message);
    if (result.ok) await load();
  }

  return (
    <AdminShell title="Gestion des créneaux" intro="Créer un créneau régulier et désactiver une séance si besoin.">
      {message ? <p className="mt-6 rounded-lg bg-court-100 px-4 py-3 text-sm font-semibold text-court-900">{message}</p> : null}

      <Card className="mt-8 p-5">
        <h2 className="text-xl font-black text-court-900">Nouveau créneau</h2>
        <form className="mt-5 grid gap-4 md:grid-cols-3" onSubmit={onSubmit}>
          <AdminInput label="Jour" value={form.jour} onChange={(value) => update("jour", value)} />
          <AdminInput label="Début" type="time" value={form.heure_debut} onChange={(value) => update("heure_debut", value)} />
          <AdminInput label="Fin" type="time" value={form.heure_fin} onChange={(value) => update("heure_fin", value)} />
          <AdminInput label="Gymnase" value={form.gymnase} onChange={(value) => update("gymnase", value)} />
          <AdminInput label="Adresse" required={false} value={form.adresse} onChange={(value) => update("adresse", value)} />
          <AdminInput label="Places max" type="number" value={form.places_max} onChange={(value) => update("places_max", value)} />
          <AdminSelect label="Type" value={form.type} onChange={(value) => update("type", value)} options={["jeu_libre", "entrainement", "competition", "jeunes", "adultes"]} />
          <AdminSelect label="Public" value={form.public} onChange={(value) => update("public", value)} options={["jeunes", "adultes", "loisirs", "competiteurs", "tous"]} />
          <AdminInput label="Niveau" required={false} value={form.niveau} onChange={(value) => update("niveau", value)} />
          <AdminInput label="Responsable" required={false} value={form.responsable} onChange={(value) => update("responsable", value)} />
          <Button type="submit" className="md:col-span-3">Créer le créneau</Button>
        </form>
      </Card>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {creneaux.map((creneau) => (
          <Card key={creneau.id} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-court-900">{creneau.jour} · {creneau.type}</h2>
                <p className="mt-2 text-sm text-ink-500">
                  {creneau.heure_debut.slice(0, 5)} - {creneau.heure_fin.slice(0, 5)} · {creneau.gymnase}
                </p>
                <p className="mt-1 text-sm text-ink-500">{creneau.public} · {creneau.niveau || "Niveau non précisé"}</p>
              </div>
              <span className={creneau.actif ? "rounded-full bg-court-100 px-3 py-1 text-xs font-black text-court-600" : "rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-700"}>
                {creneau.actif ? "Actif" : "Inactif"}
              </span>
            </div>
            <Button variant="outline" className="mt-5" onClick={() => toggleActive(creneau)}>
              {creneau.actif ? "Désactiver" : "Réactiver"}
            </Button>
          </Card>
        ))}
      </section>
    </AdminShell>
  );
}

function AdminInput({
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

function AdminSelect({
  label,
  value,
  onChange,
  options
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-court-900">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-lg border border-court-200 bg-court-50 px-3 outline-none focus:border-court-500 focus:ring-2 focus:ring-court-500/20"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
