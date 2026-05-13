"use client";

import { useEffect, useState } from "react";
import { AdminRoute } from "@/components/auth/admin-route";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createVolant, fetchVolants, updateVolant, type VolantRow } from "@/services/supabase-data.service";

export function AdminVolants() {
  return (
    <AdminRoute>
      <AdminVolantsContent />
    </AdminRoute>
  );
}

function AdminVolantsContent() {
  const [volants, setVolants] = useState<VolantRow[]>([]);
  const [form, setForm] = useState({ marque: "", modele: "", type: "plume", prix: "22", stock: "12" });
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const result = await fetchVolants();
    setVolants(result.data);
    setMessage(result.error);
  }

  useEffect(() => {
    load();
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await createVolant({
      marque: form.marque,
      modele: form.modele || null,
      type: form.type,
      prix: Number(form.prix),
      stock: Number(form.stock),
      actif: true
    });
    setMessage(result.message);
    if (result.ok) {
      setForm({ marque: "", modele: "", type: "plume", prix: "22", stock: "12" });
      await load();
    }
  }

  async function patchVolant(id: number, input: Partial<VolantRow>) {
    const result = await updateVolant(id, input);
    setMessage(result.message);
    if (result.ok) await load();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-black text-court-900">Gestion des volants</h1>
      <p className="mt-3 max-w-2xl text-ink-500">Ajouter un modèle et ajuster rapidement le stock disponible.</p>

      <Card className="mt-8 p-5">
        <h2 className="text-xl font-black text-court-900">Nouveau volant</h2>
        <form className="mt-5 grid gap-4 md:grid-cols-5" onSubmit={onSubmit}>
          <VolantInput label="Marque" value={form.marque} onChange={(value) => setForm((current) => ({ ...current, marque: value }))} />
          <VolantInput label="Modèle" required={false} value={form.modele} onChange={(value) => setForm((current) => ({ ...current, modele: value }))} />
          <label className="grid gap-2 text-sm font-semibold text-court-900">
            Type
            <select
              value={form.type}
              onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}
              className="h-11 rounded-lg border border-court-200 bg-court-50 px-3"
            >
              <option value="plastique">plastique</option>
              <option value="plume">plume</option>
              <option value="hybride">hybride</option>
            </select>
          </label>
          <VolantInput label="Prix" type="number" value={form.prix} onChange={(value) => setForm((current) => ({ ...current, prix: value }))} />
          <VolantInput label="Stock" type="number" value={form.stock} onChange={(value) => setForm((current) => ({ ...current, stock: value }))} />
          <Button type="submit" className="md:col-span-5">Ajouter au stock</Button>
        </form>
      </Card>

      {message ? <p className="mt-6 rounded-lg bg-court-100 px-4 py-3 text-sm font-semibold text-court-900">{message}</p> : null}

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {volants.map((volant) => (
          <Card key={volant.id} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-court-900">{volant.marque}</h2>
                <p className="mt-1 text-sm text-ink-500">{volant.modele || "Modèle non précisé"} · {volant.type}</p>
              </div>
              <span className={volant.actif ? "rounded-full bg-court-100 px-3 py-1 text-xs font-black text-court-600" : "rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-700"}>
                {volant.actif ? "Actif" : "Masqué"}
              </span>
            </div>
            <p className="mt-4 text-3xl font-black text-court-900">{volant.stock}</p>
            <p className="text-sm text-ink-500">{Number(volant.prix).toFixed(2)} € le tube</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => patchVolant(volant.id, { stock: Math.max(0, volant.stock - 1) })}>
                -1
              </Button>
              <Button variant="outline" onClick={() => patchVolant(volant.id, { stock: volant.stock + 1 })}>
                +1
              </Button>
              <Button variant="outline" onClick={() => patchVolant(volant.id, { actif: !volant.actif })}>
                {volant.actif ? "Masquer" : "Afficher"}
              </Button>
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
}

function VolantInput({
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
        className="h-11 rounded-lg border border-court-200 bg-court-50 px-3"
      />
    </label>
  );
}
