"use client";

import { useEffect, useState } from "react";
import { AdminRoute } from "@/components/auth/admin-route";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  createActualite,
  deleteActualite,
  fetchActualites,
  type ActualiteRow
} from "@/services/supabase-data.service";

export function AdminActualites() {
  return (
    <AdminRoute>
      <AdminActualitesContent />
    </AdminRoute>
  );
}

function AdminActualitesContent() {
  const { user } = useAuth();
  const [actualites, setActualites] = useState<ActualiteRow[]>([]);
  const [form, setForm] = useState({ titre: "", contenu: "", visible_public: true });
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-black text-court-900">Actualités</h1>
      <p className="mt-3 max-w-2xl text-ink-500">Publier une information publique ou réservée aux adhérents connectés.</p>

      <Card className="mt-8 p-5">
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
          <Card key={actualite.id} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-court-900">{actualite.titre}</h2>
                <p className="mt-2 text-sm leading-6 text-ink-500">{actualite.contenu}</p>
              </div>
              <span className="rounded-full bg-court-100 px-3 py-1 text-xs font-black text-court-600">
                {actualite.visible_public ? "Public" : "Interne"}
              </span>
            </div>
            <Button variant="danger" className="mt-5" onClick={() => remove(actualite.id)}>
              Supprimer
            </Button>
          </Card>
        ))}
      </section>
    </div>
  );
}
