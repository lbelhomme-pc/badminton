"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminFeedback, actionFeedback, errorFeedback, loadingFeedback, successFeedback, type AdminFeedbackMessage } from "@/components/admin/admin-feedback";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminRoute } from "@/components/auth/admin-route";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { privateDocumentCategories, privateDocumentCategoryLabels, type PrivateDocumentCategory } from "@/lib/private-documents";
import {
  deletePrivateDocumentPermanently,
  fetchPrivateDocumentsForManager,
  updatePrivateDocument,
  uploadPrivateDocument,
  type PrivateDocumentRow
} from "@/services/supabase-data.service";

const roleOptions = [
  { value: "member", label: "Adhérents" },
  { value: "manager", label: "Responsables" },
  { value: "admin", label: "Admins" }
];

const statusOptions = [
  { value: "brouillon", label: "Brouillon" },
  { value: "publie", label: "Publié" },
  { value: "archive", label: "Archivé" }
];

export function AdminDocuments() {
  return (
    <AdminRoute requiredRole="manager">
      <AdminDocumentsContent />
    </AdminRoute>
  );
}

function AdminDocumentsContent() {
  const [documents, setDocuments] = useState<PrivateDocumentRow[]>([]);
  const [feedback, setFeedback] = useState<AdminFeedbackMessage>(null);
  const [filter, setFilter] = useState("");
  const [form, setForm] = useState({
    titre: "",
    description: "",
    categorie: "saison",
    auteur: "CFVV",
    versionLabel: "v1",
    allowedRoles: ["member"],
    statut: "brouillon"
  });
  const [file, setFile] = useState<File | null>(null);
  const [pendingId, setPendingId] = useState<number | null>(null);

  async function load() {
    const result = await fetchPrivateDocumentsForManager();
    setDocuments(result.data);
    if (result.error) setFeedback(errorFeedback(result.error));
  }

  useEffect(() => {
    void load();
  }, []);

  const visibleDocuments = useMemo(() => {
    if (!filter) return documents;
    return documents.filter((document) => document.statut === filter);
  }, [documents, filter]);

  function toggleAllowedRole(role: string) {
    setForm((current) => {
      const roles = new Set(current.allowedRoles);
      if (roles.has(role)) roles.delete(role);
      else roles.add(role);

      return { ...current, allowedRoles: roles.size > 0 ? [...roles] : ["member"] };
    });
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!file) {
      setFeedback(errorFeedback("Choisis un fichier à téléverser."));
      return;
    }

    setFeedback(loadingFeedback("Téléversement du document en cours..."));
    const result = await uploadPrivateDocument({ ...form, file });
    setFeedback(result.ok ? successFeedback("Document ajouté. Il peut maintenant être publié ou conservé en brouillon.") : actionFeedback(result));

    if (result.ok) {
      setForm((current) => ({ ...current, titre: "", description: "", versionLabel: "v1", statut: "brouillon" }));
      setFile(null);
      const input = document.getElementById("private-document-file") as HTMLInputElement | null;
      if (input) input.value = "";
      await load();
    }
  }

  async function changeStatus(document: PrivateDocumentRow, statut: string) {
    const sensitive = statut === "archive" || statut === "brouillon";
    if (sensitive) {
      const confirmed = window.confirm(`Passer "${document.titre}" en statut ${statut} ?`);
      if (!confirmed) return;
    }

    setPendingId(document.id);
    setFeedback(loadingFeedback("Mise à jour du document en cours..."));
    const result = await updatePrivateDocument(document.id, { statut });
    setFeedback(result.ok ? successFeedback("Statut du document mis à jour.") : actionFeedback(result));
    if (result.ok) await load();
    setPendingId(null);
  }

  async function remove(document: PrivateDocumentRow) {
    if (document.statut !== "archive") {
      const archiveFirst = window.confirm("Par sécurité, le document doit d'abord être archivé. L'archiver maintenant ?");
      if (!archiveFirst) return;
      await changeStatus(document, "archive");
      return;
    }

    const confirmed = window.confirm(`Supprimer définitivement "${document.titre}" et son fichier ? Cette action est irréversible.`);
    if (!confirmed) return;

    setPendingId(document.id);
    setFeedback(loadingFeedback("Suppression définitive en cours..."));
    const result = await deletePrivateDocumentPermanently(document);
    setFeedback(result.ok ? successFeedback("Document supprimé définitivement.") : actionFeedback(result));
    if (result.ok) await load();
    setPendingId(null);
  }

  return (
    <AdminShell
      title="Documents privés"
      intro="Déposer, publier, archiver ou retirer les documents réservés aux adhérents et responsables du club."
    >
      <AdminFeedback feedback={feedback} className="mb-6" />

      <Card className="p-5">
        <h2 className="text-xl font-black text-court-900">Ajouter un document</h2>
        <form className="mt-5 grid gap-4 lg:grid-cols-3" onSubmit={submit}>
          <AdminDocumentInput label="Titre" value={form.titre} onChange={(value) => setForm((current) => ({ ...current, titre: value }))} />
          <label className="grid gap-2 text-sm font-semibold text-court-900">
            Catégorie
            <select
              value={form.categorie}
              onChange={(event) => setForm((current) => ({ ...current, categorie: event.target.value }))}
              className="h-11 rounded-lg border border-court-200 bg-court-50 px-3"
            >
              {privateDocumentCategories.map((category) => (
                <option key={category} value={category}>
                  {privateDocumentCategoryLabels[category]}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold text-court-900">
            Statut
            <select
              value={form.statut}
              onChange={(event) => setForm((current) => ({ ...current, statut: event.target.value }))}
              className="h-11 rounded-lg border border-court-200 bg-court-50 px-3"
            >
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </label>
          <AdminDocumentInput label="Auteur" value={form.auteur} onChange={(value) => setForm((current) => ({ ...current, auteur: value }))} />
          <AdminDocumentInput label="Version" value={form.versionLabel} onChange={(value) => setForm((current) => ({ ...current, versionLabel: value }))} />
          <label className="grid gap-2 text-sm font-semibold text-court-900">
            Fichier
            <input
              id="private-document-file"
              type="file"
              accept=".pdf,.docx,.xlsx,.jpg,.jpeg,.png,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,image/jpeg,image/png"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className="rounded-lg border border-court-200 bg-court-50 px-3 py-2"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-court-900 lg:col-span-3">
            Description
            <textarea
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              className="min-h-24 rounded-lg border border-court-200 bg-court-50 px-3 py-2"
            />
          </label>
          <fieldset className="rounded-lg border border-court-200 bg-court-50 p-3 lg:col-span-3">
            <legend className="px-1 text-sm font-black text-court-900">Accès autorisés</legend>
            <div className="mt-2 flex flex-wrap gap-3">
              {roleOptions.map((role) => (
                <label key={role.value} className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-court-900">
                  <input
                    type="checkbox"
                    checked={form.allowedRoles.includes(role.value)}
                    onChange={() => toggleAllowedRole(role.value)}
                  />
                  {role.label}
                </label>
              ))}
            </div>
          </fieldset>
          <Button type="submit" className="lg:col-span-3">
            Ajouter le document
          </Button>
        </form>
      </Card>

      <Card className="mt-8 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-black text-court-900">Documents existants</h2>
            <p className="mt-2 text-sm text-ink-500">Archive avant suppression définitive. Les documents brouillons ne sont pas visibles des adhérents.</p>
          </div>
          <label className="grid gap-2 text-sm font-semibold text-court-900">
            Filtrer
            <select value={filter} onChange={(event) => setFilter(event.target.value)} className="h-11 rounded-lg border border-court-200 bg-court-50 px-3">
              <option value="">Tous</option>
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {visibleDocuments.map((document) => (
            <div key={document.id} className="rounded-lg border border-court-100 bg-court-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-black text-court-900">{document.titre}</h3>
                  <p className="mt-1 text-sm text-ink-500">
                    {privateDocumentCategoryLabels[document.categorie as PrivateDocumentCategory] ?? document.categorie} · {document.file_name}
                  </p>
                  <p className="mt-1 text-sm text-ink-500">
                    Version {document.version_label || "non précisée"} · {new Date(document.updated_at).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <Badge variant={document.statut === "publie" ? "success" : document.statut === "archive" ? "warning" : "neutral"}>
                  {document.statut}
                </Badge>
              </div>
              {document.description ? <p className="mt-3 text-sm leading-6 text-ink-600">{document.description}</p> : null}
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <Button type="button" disabled={pendingId === document.id} onClick={() => changeStatus(document, "publie")}>
                  Publier
                </Button>
                <Button type="button" variant="outline" disabled={pendingId === document.id} onClick={() => changeStatus(document, "brouillon")}>
                  Dépublier
                </Button>
                <Button type="button" variant="outline" disabled={pendingId === document.id} onClick={() => changeStatus(document, "archive")}>
                  Archiver
                </Button>
                <Button type="button" variant="danger" disabled={pendingId === document.id} onClick={() => remove(document)}>
                  Supprimer
                </Button>
              </div>
            </div>
          ))}
        </div>

        {visibleDocuments.length === 0 ? (
          <div className="mt-5">
            <EmptyState title="Aucun document" text="Ajoute un document ou change le filtre de statut." />
          </div>
        ) : null}
      </Card>
    </AdminShell>
  );
}

function AdminDocumentInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-court-900">
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} className="h-11 rounded-lg border border-court-200 bg-court-50 px-3" />
    </label>
  );
}
