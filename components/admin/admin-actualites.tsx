"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminRoute } from "@/components/auth/admin-route";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  createActualite,
  deleteActualite,
  fetchActualites,
  updateActualite,
  type ActualiteRow
} from "@/services/supabase-data.service";

export function AdminActualites() {
  return (
    <AdminRoute requiredRole="manager">
      <AdminActualitesContent />
    </AdminRoute>
  );
}

function AdminActualitesContent() {
  const { user } = useAuth();
  const [actualites, setActualites] = useState<ActualiteRow[]>([]);
  const [form, setForm] = useState({ titre: "", contenu: "", visible_public: true });
  const [editing, setEditing] = useState<Record<number, { titre: string; contenu: string; visible_public: boolean }>>({});
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const result = await fetchActualites(true);
    setActualites(result.data);
    setMessage(result.error);
  }

  useEffect(() => {
    load();
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await createActualite({
      titre: form.titre,
      contenu: form.contenu,
      visible_public: form.visible_public,
      auteur_id: user?.id
    });
    setMessage(result.message);
    if (result.ok) {
      setForm({ titre: "", contenu: "", visible_public: true });
      await load();
    }
  }

  async function remove(id: number) {
    const result = await deleteActualite(id);
    setMessage(result.message);
    if (result.ok) await load();
  }

  function editValue(actualite: ActualiteRow) {
    return editing[actualite.id] ?? {
      titre: actualite.titre,
      contenu: actualite.contenu,
      visible_public: actualite.visible_public
    };
  }

  function updateEdit(id: number, field: "titre" | "contenu" | "visible_public", value: string | boolean) {
    const actualite = actualites.find((item) => item.id === id);
    if (!actualite) return;

    setEditing((current) => ({
      ...current,
      [id]: {
        ...editValue(actualite),
        [field]: value
      }
    }));
  }

  async function save(actualite: ActualiteRow) {
    const current = editValue(actualite);
    const result = await updateActualite(actualite.id, current);
    setMessage(result.message);

    if (result.ok) {
      setEditing((state) => {
        const next = { ...state };
        delete next[actualite.id];
        return next;
      });
      await load();
    }
  }

  return (
    <AdminShell title="Actualités" intro="Publier une information publique ou réservée aux adhérents connectés.">
      <Card className="p-5">
        <h2 className="text-xl font-black text-court-900">Nouvelle actualité</h2>
        <form className="mt-5 grid gap-4" onSubmit={onSubmit}>
          <label className="grid gap-2 text-sm font-semibold text-court-900">
            Titre
            <input
              required
              value={form.titre}
              onChange={(event) => setForm((current) => ({ ...current, titre: event.target.value }))}
              className="h-11 rounded-lg border border-court-200 bg-court-50 px-3"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-court-900">
            Contenu
            <textarea
              required
              value={form.contenu}
              onChange={(event) => setForm((current) => ({ ...current, contenu: event.target.value }))}
              className="min-h-32 rounded-lg border border-court-200 bg-court-50 px-3 py-3"
            />
          </label>
          <label className="flex items-center gap-3 text-sm font-semibold text-court-900">
            <input
              type="checkbox"
              checked={form.visible_public}
              onChange={(event) => setForm((current) => ({ ...current, visible_public: event.target.checked }))}
              className="h-4 w-4"
            />
            Visible publiquement
          </label>
          <Button type="submit">Publier</Button>
        </form>
      </Card>

      {message ? <p className="mt-6 rounded-lg bg-court-100 px-4 py-3 text-sm font-semibold text-court-900">{message}</p> : null}

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {actualites.map((actualite) => (
          <ActualiteEditor
            key={actualite.id}
            actualite={actualite}
            value={editValue(actualite)}
            onChange={updateEdit}
            onSave={save}
            onRemove={remove}
          />
        ))}
      </section>
    </AdminShell>
  );
}

function ActualiteEditor({
  actualite,
  value,
  onChange,
  onSave,
  onRemove
}: {
  actualite: ActualiteRow;
  value: { titre: string; contenu: string; visible_public: boolean };
  onChange: (id: number, field: "titre" | "contenu" | "visible_public", value: string | boolean) => void;
  onSave: (actualite: ActualiteRow) => void;
  onRemove: (id: number) => void;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-black text-court-900">Modifier l’actualité</h2>
        <span className="rounded-full bg-court-100 px-3 py-1 text-xs font-black text-court-600">
          {value.visible_public ? "Public" : "Interne"}
        </span>
      </div>

      <div className="mt-5 grid gap-4">
        <label className="grid gap-2 text-sm font-semibold text-court-900">
          Titre
          <input
            required
            value={value.titre}
            onChange={(event) => onChange(actualite.id, "titre", event.target.value)}
            className="h-11 rounded-lg border border-court-200 bg-court-50 px-3"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-court-900">
          Contenu
          <textarea
            required
            value={value.contenu}
            onChange={(event) => onChange(actualite.id, "contenu", event.target.value)}
            className="min-h-32 rounded-lg border border-court-200 bg-court-50 px-3 py-3"
          />
        </label>
        <label className="flex items-center gap-3 text-sm font-semibold text-court-900">
          <input
            type="checkbox"
            checked={value.visible_public}
            onChange={(event) => onChange(actualite.id, "visible_public", event.target.checked)}
            className="h-4 w-4"
          />
          Visible publiquement
        </label>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button type="button" onClick={() => onSave(actualite)}>
          Enregistrer
        </Button>
        <Button variant="danger" type="button" onClick={() => onRemove(actualite.id)}>
          Supprimer
        </Button>
      </div>
    </Card>
  );
}
