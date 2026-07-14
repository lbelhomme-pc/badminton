"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { AdminFeedback, actionFeedback, errorFeedback, loadingFeedback, successFeedback, type AdminFeedbackMessage } from "@/components/admin/admin-feedback";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminRoute } from "@/components/auth/admin-route";
import { useAuth } from "@/components/auth/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { canDeleteMediaAsset, validateMediaAssetInput } from "@/lib/media-library";
import {
  deleteMediaAssetPermanently,
  fetchMediaAssetsForManager,
  replaceMediaAssetFile,
  updateMediaAsset,
  uploadMediaAsset,
  type MediaAssetRow
} from "@/services/supabase-data.service";

const emptyForm = {
  title: "",
  description: "",
  altText: "",
  credit: "",
  informative: true,
  knownUsage: ""
};

function formatSize(size: number) {
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} Ko`;
  return `${(size / 1024 / 1024).toFixed(1)} Mo`;
}

function splitKnownUsage(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function mediaStatusVariant(status: string) {
  return status === "active" ? "success" : "warning";
}

export function AdminMedias() {
  return (
    <AdminRoute requiredRole="manager">
      <AdminMediasContent />
    </AdminRoute>
  );
}

function AdminMediasContent() {
  const { user } = useAuth();
  const [assets, setAssets] = useState<MediaAssetRow[]>([]);
  const [feedback, setFeedback] = useState<AdminFeedbackMessage>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [replacementById, setReplacementById] = useState<Record<number, File | null>>({});
  const [pendingId, setPendingId] = useState<number | null>(null);

  async function load() {
    const result = await fetchMediaAssetsForManager(search);
    setAssets(result.data);
    if (result.error) setFeedback(errorFeedback(result.error));
  }

  useEffect(() => {
    void load();
  }, []);

  const validation = useMemo(() => {
    if (!file) return null;
    return validateMediaAssetInput({
      fileName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      title: form.title,
      informative: form.informative,
      altText: form.altText
    });
  }, [file, form.altText, form.informative, form.title]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!file) {
      setFeedback(errorFeedback("Choisis un fichier a televerser."));
      return;
    }

    if (validation && !validation.ok) {
      setFeedback(errorFeedback(validation.issues.join(" ")));
      return;
    }

    setFeedback(loadingFeedback("Televersement du media en cours..."));
    const result = await uploadMediaAsset({
      file,
      title: form.title,
      description: form.description,
      altText: form.altText,
      credit: form.credit,
      informative: form.informative,
      knownUsage: splitKnownUsage(form.knownUsage),
      uploadedBy: user?.id
    });

    setFeedback(result.ok ? successFeedback("Media ajoute.") : actionFeedback(result));
    if (result.ok) {
      setForm(emptyForm);
      setFile(null);
      const input = document.getElementById("media-file") as HTMLInputElement | null;
      if (input) input.value = "";
      await load();
    }
  }

  async function saveMetadata(asset: MediaAssetRow, next: Partial<MediaAssetRow>) {
    setPendingId(asset.id);
    setFeedback(loadingFeedback("Mise a jour du media..."));
    const result = await updateMediaAsset(asset.id, next);
    setFeedback(actionFeedback(result));
    if (result.ok) await load();
    setPendingId(null);
  }

  async function replaceFile(asset: MediaAssetRow) {
    const replacement = replacementById[asset.id];
    if (!replacement) {
      setFeedback(errorFeedback("Choisis un nouveau fichier."));
      return;
    }

    const confirmed = window.confirm(`Remplacer le fichier de "${asset.title}" ? L'ancienne URL pourra changer.`);
    if (!confirmed) return;

    setPendingId(asset.id);
    setFeedback(loadingFeedback("Remplacement du fichier..."));
    const result = await replaceMediaAssetFile(asset, replacement);
    setFeedback(actionFeedback(result));
    if (result.ok) {
      setReplacementById((current) => ({ ...current, [asset.id]: null }));
      await load();
    }
    setPendingId(null);
  }

  async function archive(asset: MediaAssetRow) {
    const nextStatus = asset.status === "archived" ? "active" : "archived";
    const confirmed = window.confirm(`${nextStatus === "archived" ? "Archiver" : "Réactiver"} "${asset.title}" ?`);
    if (!confirmed) return;
    await saveMetadata(asset, { status: nextStatus });
  }

  async function remove(asset: MediaAssetRow) {
    const allowed = canDeleteMediaAsset({ knownUsage: asset.known_usage, status: asset.status });
    if (!allowed.ok) {
      setFeedback(errorFeedback(allowed.message));
      return;
    }

    const confirmed = window.confirm(`Supprimer definitivement "${asset.title}" et son fichier ?`);
    if (!confirmed) return;

    setPendingId(asset.id);
    setFeedback(loadingFeedback("Suppression definitive..."));
    const result = await deleteMediaAssetPermanently(asset);
    setFeedback(actionFeedback(result));
    if (result.ok) await load();
    setPendingId(null);
  }

  return (
    <AdminShell title="Mediatheque" intro="Images et fichiers publics du site, avec textes alternatifs, credits et suppression controlee.">
      <AdminFeedback feedback={feedback} className="mb-6" />

      <Card className="p-5">
        <h2 className="text-xl font-black text-court-900">Ajouter un media</h2>
        <form className="mt-5 grid gap-4 lg:grid-cols-3" onSubmit={submit}>
          <MediaInput label="Titre" value={form.title} onChange={(value) => setForm((current) => ({ ...current, title: value }))} />
          <MediaInput label="Credit photo / source" value={form.credit} onChange={(value) => setForm((current) => ({ ...current, credit: value }))} />
          <label className="grid gap-2 text-sm font-semibold text-court-900">
            Fichier
            <input
              id="media-file"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml,application/pdf"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className="rounded-lg border border-court-200 bg-court-50 px-3 py-2"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-court-900 lg:col-span-3">
            Description interne
            <textarea
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              className="min-h-20 rounded-lg border border-court-200 bg-court-50 px-3 py-2"
            />
          </label>
          <label className="flex items-start gap-3 rounded-lg border border-court-200 bg-court-50 p-3 text-sm font-semibold text-court-900 lg:col-span-3">
            <input
              type="checkbox"
              checked={form.informative}
              onChange={(event) => setForm((current) => ({ ...current, informative: event.target.checked }))}
              className="mt-1"
            />
            <span>
              Image informative
              <span className="block text-xs font-medium text-ink-500">Si l'image porte une information, le texte alternatif devient obligatoire.</span>
            </span>
          </label>
          <label className="grid gap-2 text-sm font-semibold text-court-900 lg:col-span-2">
            Texte alternatif
            <input
              value={form.altText}
              onChange={(event) => setForm((current) => ({ ...current, altText: event.target.value }))}
              className="h-11 rounded-lg border border-court-200 bg-court-50 px-3"
            />
          </label>
          <MediaInput
            label="Usages connus"
            value={form.knownUsage}
            onChange={(value) => setForm((current) => ({ ...current, knownUsage: value }))}
            hint="Exemple : accueil, actualite rentree. Separe par des virgules."
          />
          {validation && validation.issues.length > 0 ? (
            <p className="rounded-lg bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700 lg:col-span-3">{validation.issues.join(" ")}</p>
          ) : null}
          <Button type="submit" className="lg:col-span-3">
            Ajouter a la mediatheque
          </Button>
        </form>
      </Card>

      <Card className="mt-8 p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl font-black text-court-900">Medias existants</h2>
            <p className="mt-2 text-sm text-ink-500">Recherche par titre, fichier ou credit. Archive avant suppression definitive.</p>
          </div>
          <form
            className="flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              void load();
            }}
          >
            <label className="grid gap-2 text-sm font-semibold text-court-900">
              Recherche
              <input value={search} onChange={(event) => setSearch(event.target.value)} className="h-11 rounded-lg border border-court-200 bg-court-50 px-3" />
            </label>
            <Button className="mt-auto" type="submit">
              Rechercher
            </Button>
          </form>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {assets.map((asset) => (
            <MediaCard
              key={asset.id}
              asset={asset}
              pending={pendingId === asset.id}
              replacement={replacementById[asset.id] ?? null}
              onReplacement={(file) => setReplacementById((current) => ({ ...current, [asset.id]: file }))}
              onSave={saveMetadata}
              onArchive={archive}
              onReplace={replaceFile}
              onDelete={remove}
            />
          ))}
        </div>

        {assets.length === 0 ? (
          <div className="mt-5">
            <EmptyState title="Aucun media" text="Ajoute un media ou modifie la recherche." />
          </div>
        ) : null}
      </Card>
    </AdminShell>
  );
}

function MediaCard({
  asset,
  pending,
  replacement,
  onReplacement,
  onSave,
  onArchive,
  onReplace,
  onDelete
}: {
  asset: MediaAssetRow;
  pending: boolean;
  replacement: File | null;
  onReplacement: (file: File | null) => void;
  onSave: (asset: MediaAssetRow, next: Partial<MediaAssetRow>) => void;
  onArchive: (asset: MediaAssetRow) => void;
  onReplace: (asset: MediaAssetRow) => void;
  onDelete: (asset: MediaAssetRow) => void;
}) {
  const [altText, setAltText] = useState(asset.alt_text ?? "");
  const [credit, setCredit] = useState(asset.credit ?? "");
  const [knownUsage, setKnownUsage] = useState(asset.known_usage.join(", "));
  const deleteState = canDeleteMediaAsset({ knownUsage: asset.known_usage, status: asset.status });

  useEffect(() => {
    setAltText(asset.alt_text ?? "");
    setCredit(asset.credit ?? "");
    setKnownUsage(asset.known_usage.join(", "));
  }, [asset]);

  return (
    <article className="rounded-lg border border-court-100 bg-court-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-black text-court-900">{asset.title}</h3>
          <p className="mt-1 text-xs font-semibold text-ink-500">
            {asset.file_name} - {formatSize(asset.size_bytes)}
          </p>
        </div>
        <Badge variant={mediaStatusVariant(asset.status)}>{asset.status}</Badge>
      </div>

      {asset.kind === "image" && asset.public_url ? (
        <img src={asset.public_url} alt={asset.alt_text || ""} className="mt-4 aspect-video w-full rounded-lg border border-court-100 object-cover" />
      ) : (
        <div className="mt-4 rounded-lg border border-court-100 bg-white p-4 text-sm font-semibold text-ink-600">Document public</div>
      )}

      {asset.public_url ? (
        <a className="mt-3 block break-all text-xs font-semibold text-court-700 underline" href={asset.public_url} target="_blank" rel="noreferrer">
          {asset.public_url}
        </a>
      ) : null}

      <div className="mt-4 grid gap-3">
        {asset.kind === "image" ? (
          <MediaInput label="Texte alternatif" value={altText} onChange={setAltText} />
        ) : null}
        <MediaInput label="Credit" value={credit} onChange={setCredit} />
        <MediaInput label="Usages connus" value={knownUsage} onChange={setKnownUsage} />
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() =>
            onSave(asset, {
              alt_text: asset.kind === "image" ? altText.trim() || null : null,
              credit: credit.trim() || null,
              known_usage: splitKnownUsage(knownUsage)
            })
          }
        >
          Enregistrer les metadonnees
        </Button>
      </div>

      <div className="mt-4 rounded-lg border border-court-100 bg-white p-3">
        <label className="grid gap-2 text-sm font-semibold text-court-900">
          Remplacer le fichier
          <input
            type="file"
            accept={asset.kind === "image" ? "image/jpeg,image/png,image/webp,image/avif,image/svg+xml" : "application/pdf"}
            onChange={(event: ChangeEvent<HTMLInputElement>) => onReplacement(event.target.files?.[0] ?? null)}
            className="rounded-lg border border-court-200 bg-court-50 px-3 py-2"
          />
        </label>
        <Button type="button" className="mt-3 w-full" variant="outline" disabled={pending || !replacement} onClick={() => onReplace(asset)}>
          Remplacer
        </Button>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <Button type="button" variant="outline" disabled={pending} onClick={() => onArchive(asset)}>
          {asset.status === "archived" ? "Reactiver" : "Archiver"}
        </Button>
        <Button type="button" variant="danger" disabled={pending || !deleteState.ok} onClick={() => onDelete(asset)}>
          Supprimer
        </Button>
      </div>
      {!deleteState.ok ? <p className="mt-2 text-xs font-semibold text-orange-700">{deleteState.message}</p> : null}
    </article>
  );
}

function MediaInput({ label, value, onChange, hint }: { label: string; value: string; onChange: (value: string) => void; hint?: string }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-court-900">
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} className="h-11 rounded-lg border border-court-200 bg-court-50 px-3" />
      {hint ? <span className="text-xs font-medium text-ink-500">{hint}</span> : null}
    </label>
  );
}
