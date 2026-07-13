"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, FileText, Search } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { privateDocumentCategoryLabels, type PrivateDocumentCategory } from "@/lib/private-documents";
import {
  createPrivateDocumentSignedUrl,
  fetchPrivateDocuments,
  type PrivateDocumentRow
} from "@/services/supabase-data.service";

export function PrivateDocumentsLibrary() {
  return (
    <ProtectedRoute>
      <PrivateDocumentsContent />
    </ProtectedRoute>
  );
}

function PrivateDocumentsContent() {
  const [documents, setDocuments] = useState<PrivateDocumentRow[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState<{ tone: "success" | "error" | "info"; text: string } | null>(null);
  const [pendingId, setPendingId] = useState<number | null>(null);

  async function load() {
    const result = await fetchPrivateDocuments();
    setDocuments(result.data);
    if (result.error) {
      setMessage({ tone: "error", text: result.error });
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(documents.map((document) => document.categorie))).sort(),
    [documents]
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return documents.filter((document) => {
      const matchCategory = !category || document.categorie === category;
      const matchQuery =
        !needle ||
        [document.titre, document.description, document.auteur, document.version_label, document.file_name]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(needle));

      return matchCategory && matchQuery;
    });
  }, [category, documents, query]);

  async function download(document: PrivateDocumentRow) {
    setPendingId(document.id);
    setMessage({ tone: "info", text: "Préparation du lien de téléchargement sécurisé..." });

    try {
      const result = await createPrivateDocumentSignedUrl(document);
      if (!result.url) {
        setMessage({ tone: "error", text: result.error ?? "Document indisponible pour le moment." });
        return;
      }

      setMessage({ tone: "success", text: "Lien temporaire créé. Le téléchargement va s'ouvrir." });
      window.open(result.url, "_blank", "noopener,noreferrer");
    } finally {
      setPendingId(null);
    }
  }

  const messageClassName =
    message?.tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : message?.tone === "error"
        ? "border-red-200 bg-red-50 text-red-700"
        : "border-court-200 bg-court-100 text-court-900";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="font-display text-sm font-bold uppercase text-court-600">Documents adhérents</p>
      <h1 className="mt-2 text-4xl font-black text-court-900">Bibliothèque privée</h1>
      <p className="mt-3 max-w-3xl text-ink-500">
        Règlement intérieur, documents de saison, comptes rendus et formulaires internes. Les fichiers privés sont fournis par lien temporaire et ne
        sont pas indexés publiquement.
      </p>

      {message ? (
        <p className={`mt-6 rounded-lg border px-4 py-3 text-sm font-semibold ${messageClassName}`} aria-live="polite">
          {message.text}
        </p>
      ) : null}

      <Card className="mt-6 grid gap-4 p-5 md:grid-cols-[1fr_280px]">
        <label className="grid gap-2 text-sm font-semibold text-court-900">
          Recherche
          <span className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-court-500" aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Titre, version, auteur..."
              className="h-11 w-full rounded-lg border border-court-200 bg-court-50 pl-10 pr-3"
            />
          </span>
        </label>
        <label className="grid gap-2 text-sm font-semibold text-court-900">
          Catégorie
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="h-11 rounded-lg border border-court-200 bg-court-50 px-3"
          >
            <option value="">Toutes</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {privateDocumentCategoryLabels[item as PrivateDocumentCategory] ?? item}
              </option>
            ))}
          </select>
        </label>
      </Card>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((document) => (
          <Card key={document.id} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <FileText className="h-7 w-7 shrink-0 text-court-500" aria-hidden="true" />
              <Badge variant={document.statut === "archive" ? "warning" : "success"}>
                {privateDocumentCategoryLabels[document.categorie as PrivateDocumentCategory] ?? document.categorie}
              </Badge>
            </div>
            <h2 className="mt-4 text-xl font-black text-court-900">{document.titre}</h2>
            {document.description ? <p className="mt-2 text-sm leading-6 text-ink-600">{document.description}</p> : null}
            <div className="mt-4 grid gap-1 text-sm text-ink-500">
              <p>Version : {document.version_label || "non précisée"}</p>
              <p>Mise à jour : {new Date(document.updated_at).toLocaleDateString("fr-FR")}</p>
              <p>Auteur : {document.auteur || "CFVV"}</p>
              <p>Fichier : {document.file_name}</p>
            </div>
            <Button className="mt-5 w-full" variant="outline" disabled={pendingId === document.id} onClick={() => download(document)}>
              <Download className="mr-2 h-4 w-4" aria-hidden="true" />
              {pendingId === document.id ? "Préparation..." : "Télécharger"}
            </Button>
          </Card>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title={documents.length === 0 ? "Aucun document publié" : "Aucun document trouvé"}
            text={
              documents.length === 0
                ? "Les documents internes apparaîtront ici après publication par le bureau."
                : "Essaie de modifier la recherche ou le filtre de catégorie."
            }
          />
        </div>
      ) : null}
    </div>
  );
}
