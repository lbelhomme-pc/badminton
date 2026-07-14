"use client";

import { useEffect, useState } from "react";
import { ExternalLink, ImageIcon } from "lucide-react";
import { AdminFeedback, actionFeedback, errorFeedback, loadingFeedback, successFeedback, type AdminFeedbackMessage } from "@/components/admin/admin-feedback";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminRoute } from "@/components/auth/admin-route";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  createActualite,
  deleteActualite,
  deleteActualitePermanently,
  fetchActualites,
  updateActualite,
  updateActualiteStatus,
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

type ParsedActualiteForm =
  | {
      ok: true;
      input: {
        titre: string;
        contenu: string;
        image_url: string | null;
        lien_url: string | null;
        lien_label: string | null;
        visible_public: boolean;
        auteur_id?: string;
      };
    }
  | { ok: false; message: string };

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

function isSafeActualiteUrl(value: string | null) {
  if (!value) return true;
  if (value.startsWith("/") && !value.startsWith("//")) return true;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function isExternalActualiteUrl(value: string) {
  return value.startsWith("http://") || value.startsWith("https://");
}

function toActualitePayload(form: ActualiteForm, auteurId?: string): ParsedActualiteForm {
  const titre = form.titre.trim();
  const contenu = form.contenu.trim();
  const imageUrl = cleanOptionalUrl(form.image_url);
  const lienUrl = cleanOptionalUrl(form.lien_url);
  const lienLabel = form.lien_label.trim() || null;

  if (!titre) {
    return { ok: false, message: "Le titre de l'actualité est obligatoire." };
  }

  if (!contenu) {
    return { ok: false, message: "Le contenu de l'actualité est obligatoire." };
  }

  if (!isSafeActualiteUrl(imageUrl)) {
    return { ok: false, message: "L'URL de la photo doit commencer par https://, http:// ou /." };
  }

  if (!isSafeActualiteUrl(lienUrl)) {
    return { ok: false, message: "Le lien doit commencer par https://, http:// ou /." };
  }

  if (lienUrl && !lienLabel) {
    return { ok: false, message: "Ajoute un texte de bouton pour le lien de l'actualité." };
  }

  return {
    ok: true,
    input: {
      titre,
      contenu,
      image_url: imageUrl,
      lien_url: lienUrl,
      lien_label: lienLabel,
      visible_public: form.visible_public,
      auteur_id: auteurId
    }
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
  const { user, isAdmin } = useAuth();
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
    const parsed = toActualitePayload(form, user?.id);

    if (!parsed.ok) {
      setFeedback(errorFeedback(parsed.message));
      return;
    }

    setFeedback(loadingFeedback("Publication de l'actualité en cours..."));
    const result = await createActualite(parsed.input);
    setFeedback(result.ok ? successFeedback("Actualité publiée.") : actionFeedback(result));
    if (result.ok) {
      setForm(emptyActualiteForm);
      await load();
    }
  }

  async function remove(actualite: ActualiteRow) {
    const confirmed = window.confirm(`Mettre l'actualité "${actualite.titre}" dans la corbeille ?`);
    if (!confirmed) return;

    setFeedback(loadingFeedback("Mise en corbeille de l'actualité..."));
    const result = await deleteActualite(actualite.id);
    setFeedback(result.ok ? successFeedback("Actualité placée dans la corbeille.") : actionFeedback(result));
    if (result.ok) await load();
  }

  async function changeStatus(actualite: ActualiteRow, statut: "brouillon" | "publie" | "archive" | "corbeille") {
    const confirmed = window.confirm(`Passer "${actualite.titre}" au statut ${statut} ?`);
    if (!confirmed) return;

    setFeedback(loadingFeedback("Changement de statut..."));
    const result = await updateActualiteStatus(actualite.id, statut);
    setFeedback(actionFeedback(result));
    if (result.ok) await load();
  }

  async function removePermanently(actualite: ActualiteRow) {
    if (!isAdmin) {
      setFeedback(errorFeedback("Suppression définitive réservée aux admins."));
      return;
    }

    const confirmed = window.confirm(`Supprimer définitivement "${actualite.titre}" ? Cette action est irréversible.`);
    if (!confirmed) return;

    setFeedback(loadingFeedback("Suppression définitive..."));
    const result = await deleteActualitePermanently(actualite.id);
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
    const parsed = toActualitePayload(current);

    if (!parsed.ok) {
      setFeedback(errorFeedback(parsed.message));
      return;
    }

    setFeedback(loadingFeedback("Mise à jour de l'actualité en cours..."));
    const result = await updateActualite(actualite.id, parsed.input);
    setFeedback(result.ok ? successFeedback("Actualité mise à jour.") : actionFeedback(result));

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
          <Button className="w-full sm:w-auto" type="submit">Publier</Button>
        </form>
        <ActualitePreview value={form} title="Aperçu avant publication" />
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
            onStatus={changeStatus}
            onPermanentRemove={removePermanently}
            isAdmin={isAdmin}
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
  onRemove,
  onStatus,
  onPermanentRemove,
  isAdmin
}: {
  actualite: ActualiteRow;
  value: ActualiteForm;
  onChange: (id: number, field: keyof ActualiteForm, value: string | boolean) => void;
  onSave: (actualite: ActualiteRow) => void;
  onRemove: (actualite: ActualiteRow) => void;
  onStatus: (actualite: ActualiteRow, statut: "brouillon" | "publie" | "archive" | "corbeille") => void;
  onPermanentRemove: (actualite: ActualiteRow) => void;
  isAdmin: boolean;
}) {
  const safeEditorLink = cleanOptionalUrl(value.lien_url);
  const canPreviewLink = isSafeActualiteUrl(safeEditorLink);
  const statut = actualite.deleted_at ? "corbeille" : actualite.statut ?? (actualite.visible_public ? "publie" : "brouillon");

  return (
    <Card className="p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-black text-court-900">Modifier l’actualité</h2>
        <span className="rounded-full bg-court-100 px-3 py-1 text-xs font-black text-court-600">
          {statut}
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

      <ActualitePreview value={value} title="Aperçu public" />

      <div className="mt-5 grid gap-2 sm:flex sm:flex-wrap">
        <Button className="w-full sm:w-auto" type="button" onClick={() => onSave(actualite)}>
          Enregistrer
        </Button>
        <Button className="w-full sm:w-auto" variant="outline" type="button" onClick={() => onStatus(actualite, "brouillon")}>
          Dépublier
        </Button>
        <Button className="w-full sm:w-auto" variant="outline" type="button" onClick={() => onStatus(actualite, "publie")}>
          Publier
        </Button>
        <Button className="w-full sm:w-auto" variant="outline" type="button" onClick={() => onStatus(actualite, "archive")}>
          Archiver
        </Button>
        {statut === "corbeille" ? (
          <Button className="w-full sm:w-auto" variant="outline" type="button" onClick={() => onStatus(actualite, "brouillon")}>
            Restaurer
          </Button>
        ) : null}
        {safeEditorLink && canPreviewLink ? (
          <a
            href={safeEditorLink}
            target={isExternalActualiteUrl(safeEditorLink) ? "_blank" : undefined}
            rel={isExternalActualiteUrl(safeEditorLink) ? "noopener noreferrer" : undefined}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-court-200 bg-white px-4 text-sm font-semibold text-court-900 hover:bg-court-50 sm:w-auto"
          >
            Tester le lien
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        ) : null}
        <Button className="w-full sm:w-auto" variant="danger" type="button" onClick={() => onRemove(actualite)}>
          Mettre à la corbeille
        </Button>
        {isAdmin && statut === "corbeille" ? (
          <Button className="w-full sm:w-auto" variant="danger" type="button" onClick={() => onPermanentRemove(actualite)}>
            Supprimer définitivement
          </Button>
        ) : null}
      </div>
    </Card>
  );
}

function ActualitePreview({ value, title }: { value: ActualiteForm; title: string }) {
  const imageUrl = cleanOptionalUrl(value.image_url);
  const linkUrl = cleanOptionalUrl(value.lien_url);
  const safeImageUrl = isSafeActualiteUrl(imageUrl) ? imageUrl : null;
  const safeLinkUrl = isSafeActualiteUrl(linkUrl) ? linkUrl : null;
  const visibleTitle = value.titre.trim() || "Titre de l'actualité";
  const visibleContent = value.contenu.trim() || "Le contenu saisi apparaîtra ici, sans HTML libre.";

  return (
    <div className="mt-5 rounded-lg border border-court-100 bg-court-50 p-4">
      <p className="text-sm font-black uppercase text-court-700">{title}</p>
      <article className="mt-3 overflow-hidden rounded-lg border border-court-200 bg-white">
        {safeImageUrl ? (
          <img
            src={safeImageUrl}
            alt={`Illustration : ${visibleTitle}`}
            loading="lazy"
            decoding="async"
            className="h-40 w-full object-cover"
          />
        ) : (
          <div className="flex h-20 items-center gap-2 bg-court-50 px-4 text-sm font-semibold text-ink-500">
            <ImageIcon className="h-4 w-4" aria-hidden="true" />
            Aucune photo ajoutée
          </div>
        )}
        <div className="p-4">
          <span className="rounded-full bg-court-100 px-3 py-1 text-xs font-black text-court-700">
            {value.visible_public ? "Public" : "Interne adhérents"}
          </span>
          <h3 className="mt-3 text-xl font-black text-court-900">{visibleTitle}</h3>
          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-ink-500">{visibleContent}</p>
          {safeLinkUrl ? (
            <a
              href={safeLinkUrl}
              target={isExternalActualiteUrl(safeLinkUrl) ? "_blank" : undefined}
              rel={isExternalActualiteUrl(safeLinkUrl) ? "noopener noreferrer" : undefined}
              className="mt-4 inline-flex h-10 items-center rounded-lg bg-court-500 px-4 text-sm font-semibold text-white hover:bg-court-600"
            >
              {value.lien_label.trim() || "Voir le lien"}
            </a>
          ) : null}
        </div>
      </article>
      <p className="mt-3 text-xs leading-5 text-ink-500">
        Le contenu est affiché comme du texte. Les balises HTML ne sont pas interprétées.
      </p>
    </div>
  );
}
