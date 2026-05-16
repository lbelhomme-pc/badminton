"use client";

import { useEffect, useState } from "react";
import { AdminRoute } from "@/components/auth/admin-route";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createTarif, deleteTarif, fetchTarifs, updateTarif, type TarifRow } from "@/services/supabase-data.service";

const emptyForm = {
  titre: "",
  description: "",
  montant: "",
  public: "",
  ordre: "10",
  actif: true
};

type TarifForm = typeof emptyForm;

function toForm(tarif: TarifRow): TarifForm {
  return {
    titre: tarif.titre,
    description: tarif.description ?? "",
    montant: String(tarif.montant),
    public: tarif.public ?? "",
    ordre: String(tarif.ordre),
    actif: tarif.actif
  };
}

function toInput(form: TarifForm) {
  return {
    titre: form.titre,
    description: form.description || null,
    montant: Number(form.montant || 0),
    public: form.public || null,
    ordre: Number(form.ordre || 0),
    actif: form.actif
  };
}

export function AdminTarifs() {
  return (
    <AdminRoute>
      <AdminTarifsContent />
    </AdminRoute>
  );
}

function AdminTarifsContent() {
  const [tarifs, setTarifs] = useState<TarifRow[]>([]);
  const [form, setForm] = useState<TarifForm>(emptyForm);
  const [editing, setEditing] = useState<Record<number, TarifForm>>({});
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const result = await fetchTarifs(true);
    setTarifs(result.data);
    setMessage(result.error);
  }

  useEffect(() => {
    load();
  }, []);

  function updateForm(field: keyof TarifForm, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateEditing(id: number, field: keyof TarifForm, value: string | boolean) {
    setEditing((current) => ({
      ...current,
      [id]: { ...(current[id] ?? toForm(tarifs.find((tarif) => tarif.id === id)!)), [field]: value }
    }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await createTarif(toInput(form));
    setMessage(result.message);

    if (result.ok) {
      setForm(emptyForm);
      await load();
    }
  }

  async function save(tarif: TarifRow) {
    const current = editing[tarif.id] ?? toForm(tarif);
    const result = await updateTarif(tarif.id, toInput(current));
    setMessage(result.message);

    if (result.ok) {
      setEditing((state) => {
        const next = { ...state };
        delete next[tarif.id];
        return next;
      });
      await load();
    }
  }

  async function remove(id: number) {
    const result = await deleteTarif(id);
    setMessage(result.message);
    if (result.ok) await load();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-black text-court-900">Gestion des tarifs</h1>
      <p className="mt-3 max-w-2xl text-ink-500">
        Modifie les montants affichés sur la page Tarifs. Mets 0 pour un tarif gratuit ou à confirmer.
      </p>

      <Card className="mt-8 p-5">
        <h2 className="text-xl font-black text-court-900">Nouveau tarif</h2>
        <form className="mt-5 grid gap-4 md:grid-cols-3" onSubmit={onSubmit}>
          <TarifInput label="Titre" value={form.titre} onChange={(value) => updateForm("titre", value)} />
          <TarifInput label="Montant en euros" type="number" value={form.montant} onChange={(value) => updateForm("montant", value)} />
          <TarifInput label="Ordre" type="number" value={form.ordre} onChange={(value) => updateForm("ordre", value)} />
          <TarifInput label="Public" required={false} value={form.public} onChange={(value) => updateForm("public", value)} />
          <label className="grid gap-2 text-sm font-semibold text-court-900 md:col-span-2">
            Description
            <input
              value={form.description}
              onChange={(event) => updateForm("description", event.target.value)}
              className="h-11 rounded-lg border border-court-200 bg-court-50 px-3 outline-none focus:border-court-500 focus:ring-2 focus:ring-court-500/20"
            />
          </label>
          <label className="flex items-center gap-3 text-sm font-semibold text-court-900 md:col-span-3">
            <input type="checkbox" checked={form.actif} onChange={(event) => updateForm("actif", event.target.checked)} className="h-4 w-4" />
            Visible sur la page Tarifs
          </label>
          <Button type="submit" className="md:col-span-3">
            Ajouter le tarif
          </Button>
        </form>
      </Card>

      {message ? <p className="mt-6 rounded-lg bg-court-100 px-4 py-3 text-sm font-semibold text-court-900">{message}</p> : null}

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        {tarifs.map((tarif) => {
          const current = editing[tarif.id] ?? toForm(tarif);

          return (
            <Card key={tarif.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-court-900">{tarif.titre}</h2>
                  <p className="mt-1 text-sm text-ink-500">{Number(tarif.montant).toFixed(2)} € · ordre {tarif.ordre}</p>
                </div>
                <span className={tarif.actif ? "rounded-full bg-court-100 px-3 py-1 text-xs font-black text-court-600" : "rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-700"}>
                  {tarif.actif ? "Visible" : "Masqué"}
                </span>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <TarifInput label="Titre" value={current.titre} onChange={(value) => updateEditing(tarif.id, "titre", value)} />
                <TarifInput label="Montant" type="number" value={current.montant} onChange={(value) => updateEditing(tarif.id, "montant", value)} />
                <TarifInput label="Ordre" type="number" value={current.ordre} onChange={(value) => updateEditing(tarif.id, "ordre", value)} />
                <TarifInput label="Public" required={false} value={current.public} onChange={(value) => updateEditing(tarif.id, "public", value)} />
                <label className="grid gap-2 text-sm font-semibold text-court-900 md:col-span-2">
                  Description
                  <input
                    value={current.description}
                    onChange={(event) => updateEditing(tarif.id, "description", event.target.value)}
                    className="h-11 rounded-lg border border-court-200 bg-court-50 px-3 outline-none focus:border-court-500 focus:ring-2 focus:ring-court-500/20"
                  />
                </label>
                <label className="flex items-center gap-3 text-sm font-semibold text-court-900 md:col-span-3">
                  <input type="checkbox" checked={current.actif} onChange={(event) => updateEditing(tarif.id, "actif", event.target.checked)} className="h-4 w-4" />
                  Visible sur la page Tarifs
                </label>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Button type="button" onClick={() => save(tarif)}>
                  Enregistrer
                </Button>
                <Button type="button" variant="danger" onClick={() => remove(tarif.id)}>
                  Supprimer
                </Button>
              </div>
            </Card>
          );
        })}
      </section>
    </div>
  );
}

function TarifInput({
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
        step={type === "number" ? "1" : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-lg border border-court-200 bg-court-50 px-3 outline-none focus:border-court-500 focus:ring-2 focus:ring-court-500/20"
      />
    </label>
  );
}
