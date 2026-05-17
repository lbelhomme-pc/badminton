"use client";

import { useEffect, useState } from "react";
import { AdminFeedback, actionFeedback, errorFeedback, successFeedback, type AdminFeedbackMessage } from "@/components/admin/admin-feedback";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminRoute } from "@/components/auth/admin-route";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createVolant, fetchVolants, updateVolant, type VolantRow } from "@/services/supabase-data.service";

export function AdminVolants() {
  return (
    <AdminRoute requiredRole="manager">
      <AdminVolantsContent />
    </AdminRoute>
  );
}

function AdminVolantsContent() {
  const [volants, setVolants] = useState<VolantRow[]>([]);
  const [form, setForm] = useState({ marque: "", modele: "", type: "plume", prix: "22", stock: "12" });
  const [restockById, setRestockById] = useState<Record<number, string>>({});
  const [feedback, setFeedback] = useState<AdminFeedbackMessage>(null);

  async function load() {
    const result = await fetchVolants();
    setVolants(result.data);
    if (result.error) {
      setFeedback(errorFeedback(result.error));
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await createVolant({
      marque: form.marque.trim(),
      modele: form.modele.trim() || null,
      type: form.type,
      prix: Number((form.prix || "0").replace(",", ".")),
      stock: Math.max(0, Math.floor(Number((form.stock || "0").replace(",", ".")))),
      actif: true
    });
    setFeedback(actionFeedback(result));
    if (result.ok) {
      setForm({ marque: "", modele: "", type: "plume", prix: "22", stock: "12" });
      await load();
    }
  }

  async function patchVolant(id: number, input: Partial<VolantRow>) {
    const result = await updateVolant(id, input);
    setFeedback(actionFeedback(result));
    if (result.ok) await load();
  }

  async function restockVolant(volant: VolantRow) {
    const quantity = Math.floor(Number(restockById[volant.id] ?? 0));

    if (!Number.isFinite(quantity) || quantity <= 0) {
      setFeedback(errorFeedback("Indique un nombre de tubes a ajouter au stock."));
      return;
    }

    const result = await updateVolant(volant.id, { stock: volant.stock + quantity });
    setFeedback(result.ok ? successFeedback(`${quantity} tube(s) ajoute(s) au stock ${volant.marque}.`) : actionFeedback(result));

    if (result.ok) {
      setRestockById((current) => ({ ...current, [volant.id]: "" }));
      await load();
    }
  }

  return (
    <AdminShell title="Gestion des volants" intro="Ajouter un modèle, corriger un écart ou saisir un réassort quand le club achète des tubes.">
      <Card className="p-5">
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

      <AdminFeedback feedback={feedback} className="mt-6" />

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
            <div className="mt-5 rounded-2xl border border-court-100 bg-court-50 p-3">
              <label className="text-sm font-bold text-court-900" htmlFor={`restock-${volant.id}`}>
                Réassort club
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  id={`restock-${volant.id}`}
                  min="1"
                  type="number"
                  inputMode="numeric"
                  value={restockById[volant.id] ?? ""}
                  onChange={(event) => setRestockById((current) => ({ ...current, [volant.id]: event.target.value }))}
                  placeholder="Nombre de tubes"
                  className="h-11 min-w-0 flex-1 rounded-lg border border-court-200 bg-white px-3 text-sm"
                />
                <Button type="button" onClick={() => restockVolant(volant)}>
                  Ajouter
                </Button>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => patchVolant(volant.id, { stock: Math.max(0, volant.stock - 1) })}>
                Correction -1
              </Button>
              <Button variant="outline" onClick={() => patchVolant(volant.id, { stock: volant.stock + 1 })}>
                Correction +1
              </Button>
              <Button variant="outline" onClick={() => patchVolant(volant.id, { actif: !volant.actif })}>
                {volant.actif ? "Masquer" : "Afficher"}
              </Button>
            </div>
          </Card>
        ))}
      </section>
    </AdminShell>
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
        step={type === "number" ? "0.01" : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-lg border border-court-200 bg-court-50 px-3"
      />
    </label>
  );
}
