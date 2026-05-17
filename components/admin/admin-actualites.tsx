"use client";

import { useEffect, useState } from "react";
import { ExternalLink, ImageIcon } from "lucide-react";
import { AdminFeedback, actionFeedback, errorFeedback, type AdminFeedbackMessage } from "@/components/admin/admin-feedback";
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

type ActualiteForm = {
  titre: string;
  contenu: string;
  image_url: string;
  lien_url: string;
  lien_label: string;
  visible_public: boolean;
};

const emptyActualiteForm: ActualiteForm = {
  titre: "",
  contenu: "",
  image_url: "",
  lien_url: "",
  lien_label: "",
  visible_public: true
};

function cleanOptionalUrl(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toActualitePayload(form: ActualiteForm, auteurId?: string) {
  return {
    titre: form.titre.trim(),
    contenu: form.contenu.trim(),
    image_url: cleanOptionalUrl(form.image_url),
    lien_url: cleanOptionalUrl(form.lien_url),
    lien_label: form.lien_label.trim() || null,
    visible_public: form.visible_public,
    auteur_id: auteurId
  };
}

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
  const [form, setForm] = useState<ActualiteForm>(emptyActualiteForm);
  const [editing, setEditing] = useState<Record<number, ActualiteForm>>({});
  const [feedback, setFeedback] = useState<AdminFeedbackMessage>(null);

  async function load() {
    const result = await fetchActualites(true);
    setActualites(result.data);
    if (result.error) {
      setFeedback(errorFeedback(result.error));
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await createActualite(toActualitePayload(form, user?.id));
    setFeedback(actionFeedback(result));
    if (result.ok) {
      setForm(emptyActualiteForm);
      await load();
    }
  }

  async function remove(id: number) {
    const result = await deleteActualite(id);
    setFeedback(actionFeedback(result));
    if (result.ok) await load();
  }

  function editValue(actualite: ActualiteRow) {
    return editing[actualite.id] ?? {
      titre: actualite.titre,
      contenu: actualite.contenu,
      image_url: actualite.image_url ?? "",
      lien_url: actualite.lien_url ?? "",
      lien_label: actualite.lien_label ?? "",
      visible_public: actualite.visible_public
    };
  }

  function updateEdit(id: number, field: keyof ActualiteForm, value: string | boolean) {
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
    const result = await updateActualite(actualite.id, toActualitePayload(current));
    setFeedback(actionFeedback(result));

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
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold text-court-900">
              URL de la photo
              <input
                value={form.image_url}
                placeholder="https://..."
                onChange={(event) => setForm((current) => ({ ...current, image_url: event.target.value }))}
                className="h-11 rounded-lg border border-court-200 bg-court-50 px-3"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-court-900">
              Lien associe
              <input
                value={form.lien_url}
                placeholder="https://... ou /contact"
                onChange={(event) => setForm((current) => ({ ...current, lien_url: event.target.value }))}
                className="h-11 rounded-lg border border-court-200 bg-court-50 px-3"
              />
            </label>
          </div>
          <label className="grid gap-2 text-sm font-semibold text-court-900">
            Texte du bouton lien
            <input
              value={form.lien_label}
              placeholder="Ex. Voir les photos, S'inscrire, Lire le document"
              onChange={(event) => setForm((current) => ({ ...current, lien_label: event.target.value }))}
              className="h-11 rounded-lg border border-court-200 bg-court-50 px-3"
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

      <AdminFeedback feedback={feedback} className="mt-6" />

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
  value: ActualiteForm;
  onChange: (id: number, field: keyof ActualiteForm, value: string | boolean) => void;
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

      {value.image_url ? (
        <div className="mt-4 overflow-hidden rounded-lg border border-court-200 bg-court-50">
          <img src={value.image_url} alt="" className="h-40 w-full object-cover" />
        </div>
      ) : (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-court-50 px-3 py-2 text-sm font-semibold text-ink-500">
          <ImageIcon className="h-4 w-4" aria-hidden="true" />
          Aucune photo associee
        </div>
      )}

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
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold text-court-900">
            URL de la photo
            <input
              value={value.image_url}
              placeholder="https://..."
              onChange={(event) => onChange(actualite.id, "image_url", event.target.value)}
              className="h-11 rounded-lg border border-court-200 bg-court-50 px-3"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-court-900">
            Lien associe
            <input
              value={value.lien_url}
              placeholder="https://... ou /contact"
              onChange={(event) => onChange(actualite.id, "lien_url", event.target.value)}
              className="h-11 rounded-lg border border-court-200 bg-court-50 px-3"
            />
          </label>
        </div>
        <label className="grid gap-2 text-sm font-semibold text-court-900">
          Texte du bouton lien
          <input
            value={value.lien_label}
            placeholder="Ex. Voir les photos"
            onChange={(event) => onChange(actualite.id, "lien_label", event.target.value)}
            className="h-11 rounded-lg border border-court-200 bg-court-50 px-3"
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
        {value.lien_url ? (
          <a
            href={value.lien_url}
            target={value.lien_url.startsWith("/") ? undefined : "_blank"}
            rel={value.lien_url.startsWith("/") ? undefined : "noreferrer"}
            className="inline-flex h-11 items-center gap-2 rounded-lg border border-court-200 bg-white px-4 text-sm font-semibold text-court-900 hover:bg-court-50"
          >
            Tester le lien
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        ) : null}
        <Button variant="danger" type="button" onClick={() => onRemove(actualite.id)}>
          Supprimer
        </Button>
      </div>
    </Card>
  );
}
