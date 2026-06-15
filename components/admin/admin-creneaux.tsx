"use client";

import { useEffect, useState } from "react";
import { AdminFeedback, actionFeedback, errorFeedback, loadingFeedback, successFeedback, type AdminFeedbackMessage } from "@/components/admin/admin-feedback";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminRoute } from "@/components/auth/admin-route";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { dateForFrenchDay, getCurrentClubWeek } from "@/lib/club-week";
import {
  createCreneau,
  createCreneauCancellation,
  deleteCreneauCancellation,
  fetchCreneauCancellations,
  fetchCreneaux,
  updateCreneau,
  type CreneauCancellationRow,
  type CreneauRow
} from "@/services/supabase-data.service";

const initialForm = {
  jour: "Mardi",
  heure_debut: "18:00",
  heure_fin: "19:30",
  gymnase: "Gymnase des Aigremonts",
  adresse: "554 Rue de la Chappe, 41100 Vendôme",
  type: "jeu_libre",
  public: "adultes",
  niveau: "Tous niveaux",
  places_max: "28",
  responsable: "Didier Remule"
};

type CreneauForm = typeof initialForm;

function toCreneauInput(form: CreneauForm) {
  return {
    jour: form.jour.trim(),
    heure_debut: form.heure_debut,
    heure_fin: form.heure_fin,
    gymnase: form.gymnase.trim(),
    adresse: form.adresse.trim() || null,
    type: form.type,
    public: form.public,
    niveau: form.niveau.trim() || null,
    places_max: form.places_max ? Number(form.places_max) : null,
    responsable: form.responsable.trim() || null,
    actif: true
  };
}

function formFromCreneau(creneau: CreneauRow): CreneauForm {
  return {
    jour: creneau.jour,
    heure_debut: creneau.heure_debut.slice(0, 5),
    heure_fin: creneau.heure_fin.slice(0, 5),
    gymnase: creneau.gymnase,
    adresse: creneau.adresse ?? "",
    type: creneau.type,
    public: creneau.public,
    niveau: creneau.niveau ?? "",
    places_max: creneau.places_max == null ? "" : String(creneau.places_max),
    responsable: creneau.responsable ?? ""
  };
}

export function AdminCreneaux() {
  return (
    <AdminRoute requiredRole="manager">
      <AdminCreneauxContent />
    </AdminRoute>
  );
}

function AdminCreneauxContent() {
  const [creneaux, setCreneaux] = useState<CreneauRow[]>([]);
  const [cancellations, setCancellations] = useState<CreneauCancellationRow[]>([]);
  const [form, setForm] = useState(initialForm);
  const [editing, setEditing] = useState<Record<number, CreneauForm>>({});
  const [cancelForms, setCancelForms] = useState<Record<number, { date: string; reason: string }>>({});
  const [feedback, setFeedback] = useState<AdminFeedbackMessage>(null);

  async function load() {
    const [result, cancellationResult] = await Promise.all([fetchCreneaux(), fetchCreneauCancellations()]);
    setCreneaux(result.data);
    setCancellations(cancellationResult.data);
    if (result.error) {
      setFeedback(errorFeedback(result.error));
    }
    if (cancellationResult.error && !cancellationResult.error.includes("nouvelles règles")) {
      setFeedback(errorFeedback(cancellationResult.error));
    }
  }

  useEffect(() => {
    load();
  }, []);

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateEdit(id: number, field: keyof CreneauForm, value: string) {
    const creneau = creneaux.find((item) => item.id === id);
    if (!creneau) return;

    setEditing((current) => ({
      ...current,
      [id]: {
        ...(current[id] ?? formFromCreneau(creneau)),
        [field]: value
      }
    }));
  }

  function updateCancelForm(id: number, field: "date" | "reason", value: string) {
    const creneau = creneaux.find((item) => item.id === id);
    const week = getCurrentClubWeek();
    const fallbackDate = creneau ? dateForFrenchDay(creneau.jour, week.start) : week.start;

    setCancelForms((current) => ({
      ...current,
      [id]: {
        date: current[id]?.date ?? fallbackDate,
        reason: current[id]?.reason ?? "",
        [field]: value
      }
    }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(loadingFeedback("Création du créneau en cours..."));
    const result = await createCreneau(toCreneauInput(form));
    setFeedback(result.ok ? successFeedback("Créneau créé.") : actionFeedback(result));
    if (result.ok) {
      setForm(initialForm);
      await load();
    }
  }

  async function toggleActive(creneau: CreneauRow) {
    if (creneau.actif) {
      const confirmed = window.confirm(`Désactiver le créneau du ${creneau.jour} ? Il ne sera plus proposé tant qu'il reste inactif.`);
      if (!confirmed) return;
    }

    setFeedback(loadingFeedback(creneau.actif ? "Désactivation du créneau en cours..." : "Réactivation du créneau en cours..."));
    const result = await updateCreneau(creneau.id, { actif: !creneau.actif });
    setFeedback(result.ok ? successFeedback(creneau.actif ? "Créneau désactivé." : "Créneau réactivé.") : actionFeedback(result));
    if (result.ok) await load();
  }

  async function saveCreneau(creneau: CreneauRow) {
    const current = editing[creneau.id] ?? formFromCreneau(creneau);
    setFeedback(loadingFeedback("Mise à jour du créneau en cours..."));
    const result = await updateCreneau(creneau.id, { ...toCreneauInput(current), actif: creneau.actif });
    setFeedback(result.ok ? successFeedback("Créneau mis à jour.") : actionFeedback(result));

    if (result.ok) {
      setEditing((state) => {
        const next = { ...state };
        delete next[creneau.id];
        return next;
      });
      await load();
    }
  }

  async function cancelOccurrence(creneau: CreneauRow) {
    const week = getCurrentClubWeek();
    const fallbackDate = dateForFrenchDay(creneau.jour, week.start);
    const current = cancelForms[creneau.id] ?? { date: fallbackDate, reason: "" };
    const confirmed = window.confirm(`Annuler le créneau du ${current.date} ? Cela ne supprimera pas le créneau habituel.`);
    if (!confirmed) return;

    setFeedback(loadingFeedback("Annulation exceptionnelle en cours..."));
    const result = await createCreneauCancellation({
      creneauId: creneau.id,
      dateReservation: current.date,
      reason: current.reason
    });

    setFeedback(result.ok ? successFeedback(`Créneau annulé pour le ${current.date}.`) : actionFeedback(result));
    if (result.ok) {
      setCancelForms((state) => ({ ...state, [creneau.id]: { date: fallbackDate, reason: "" } }));
      await load();
    }
  }

  async function removeCancellation(id: number) {
    const confirmed = window.confirm("Retirer cette annulation exceptionnelle ?");
    if (!confirmed) return;

    setFeedback(loadingFeedback("Retrait de l'annulation en cours..."));
    const result = await deleteCreneauCancellation(id);
    setFeedback(result.ok ? successFeedback("Annulation exceptionnelle retirée.") : actionFeedback(result));
    if (result.ok) await load();
  }

  return (
    <AdminShell title="Gestion des créneaux" intro="Créer un créneau régulier et désactiver une séance si besoin.">
      <AdminFeedback feedback={feedback} className="mt-6" />

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
          <AdminInput label="Responsable créneau" required={false} value={form.responsable} onChange={(value) => update("responsable", value)} />
          <Button type="submit" className="md:col-span-3">Créer le créneau</Button>
        </form>
      </Card>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {creneaux.map((creneau) => {
          const current = editing[creneau.id] ?? formFromCreneau(creneau);
          const week = getCurrentClubWeek();
          const cancelForm = cancelForms[creneau.id] ?? {
            date: dateForFrenchDay(creneau.jour, week.start),
            reason: ""
          };

          return (
          <Card key={creneau.id} className="p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-black text-court-900">{creneau.jour} · {creneau.type}</h2>
                <p className="mt-2 text-sm text-ink-500">
                  {creneau.heure_debut.slice(0, 5)} - {creneau.heure_fin.slice(0, 5)} · {creneau.gymnase}
                </p>
                <p className="mt-1 text-sm text-ink-500">{creneau.public} · {creneau.niveau || "Niveau non précisé"}</p>
                <p className="mt-1 text-sm font-semibold text-court-700">Responsable : {creneau.responsable || "À renseigner"}</p>
              </div>
              <span className={creneau.actif ? "rounded-full bg-court-100 px-3 py-1 text-xs font-black text-court-600" : "rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-700"}>
                {creneau.actif ? "Actif" : "Inactif"}
              </span>
            </div>
            <Button variant="outline" className="mt-5 w-full sm:w-auto" onClick={() => toggleActive(creneau)}>
              {creneau.actif ? "Désactiver" : "Réactiver"}
            </Button>

            <div className="mt-5 rounded-lg border border-court-100 bg-court-50 p-4">
              <h3 className="font-black text-court-900">Modifier ce créneau</h3>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <AdminInput label="Jour" value={current.jour} onChange={(value) => updateEdit(creneau.id, "jour", value)} />
                <AdminInput label="Début" type="time" value={current.heure_debut} onChange={(value) => updateEdit(creneau.id, "heure_debut", value)} />
                <AdminInput label="Fin" type="time" value={current.heure_fin} onChange={(value) => updateEdit(creneau.id, "heure_fin", value)} />
                <AdminInput label="Places max" type="number" value={current.places_max} onChange={(value) => updateEdit(creneau.id, "places_max", value)} />
                <AdminInput label="Gymnase" value={current.gymnase} onChange={(value) => updateEdit(creneau.id, "gymnase", value)} />
                <AdminInput label="Responsable" required={false} value={current.responsable} onChange={(value) => updateEdit(creneau.id, "responsable", value)} />
                <AdminSelect label="Type" value={current.type} onChange={(value) => updateEdit(creneau.id, "type", value)} options={["jeu_libre", "entrainement", "competition", "jeunes", "adultes"]} />
                <AdminSelect label="Public" value={current.public} onChange={(value) => updateEdit(creneau.id, "public", value)} options={["jeunes", "adultes", "loisirs", "competiteurs", "tous"]} />
                <AdminInput label="Niveau" required={false} value={current.niveau} onChange={(value) => updateEdit(creneau.id, "niveau", value)} />
                <AdminInput label="Adresse" required={false} value={current.adresse} onChange={(value) => updateEdit(creneau.id, "adresse", value)} />
              </div>
              <Button className="mt-4 w-full" type="button" onClick={() => saveCreneau(creneau)}>
                Enregistrer les modifications
              </Button>
            </div>

            <div className="mt-5 rounded-lg border border-red-100 bg-red-50 p-4">
              <h3 className="font-black text-red-900">Annulation exceptionnelle</h3>
              <p className="mt-2 text-sm text-red-800">Annule uniquement cette date, sans supprimer le créneau habituel.</p>
              <div className="mt-4 grid gap-3 md:grid-cols-[180px_1fr]">
                <AdminInput label="Date" type="date" value={cancelForm.date} onChange={(value) => updateCancelForm(creneau.id, "date", value)} />
                <AdminInput label="Motif" required={false} value={cancelForm.reason} onChange={(value) => updateCancelForm(creneau.id, "reason", value)} />
              </div>
              <Button className="mt-4 w-full" variant="danger" type="button" onClick={() => cancelOccurrence(creneau)}>
                Annuler cette date
              </Button>
            </div>
          </Card>
        );
        })}
      </section>

      <Card className="mt-8 p-5">
        <h2 className="text-xl font-black text-court-900">Annulations exceptionnelles prévues</h2>
        {cancellations.length === 0 ? (
          <p className="mt-3 text-sm text-ink-500">Aucune annulation exceptionnelle enregistrée.</p>
        ) : (
          <div className="mt-4 grid gap-3">
            {cancellations.map((cancellation) => (
              <div key={cancellation.id} className="grid gap-3 rounded-lg bg-court-50 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <p className="font-black text-court-900">
                    {cancellation.creneaux?.jour || "Créneau"} · {cancellation.date_reservation}
                  </p>
                  <p className="text-sm text-ink-500">{cancellation.reason || "Motif non renseigné"}</p>
                </div>
                <Button className="w-full sm:w-auto" variant="outline" type="button" onClick={() => removeCancellation(cancellation.id)}>
                  Retirer
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
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
