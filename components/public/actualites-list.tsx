"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ImageIcon, X } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { fetchActualites, type ActualiteRow } from "@/services/supabase-data.service";

interface ActualitesListProps {
  limit?: number;
}

function isSafeDisplayUrl(value: string | null | undefined) {
  if (!value) return false;
  if (value.startsWith("/") && !value.startsWith("//")) return true;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function isExternalUrl(value: string) {
  return value.startsWith("http://") || value.startsWith("https://");
}

export function ActualitesList({ limit }: ActualitesListProps) {
  const [actualites, setActualites] = useState<ActualiteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedActualite, setSelectedActualite] = useState<ActualiteRow | null>(null);

  useEffect(() => {
    let mounted = true;

    fetchActualites(false).then((result) => {
      if (!mounted) return;

      setActualites(result.data);
      setLoading(false);

      if (result.error && result.error !== "Configuration Supabase manquante.") {
        setMessage(result.error);
      } else {
        setMessage(null);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (actualites.length === 0 || typeof window === "undefined") return;
    const match = window.location.hash.match(/^#actualite-(\d+)$/);
    if (!match) return;
    const requested = actualites.find((actualite) => actualite.id === Number(match[1]));
    if (requested) setSelectedActualite(requested);
  }, [actualites]);

  useEffect(() => {
    if (!selectedActualite) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedActualite(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [selectedActualite]);

  const items = actualites.map((actualite) => ({
    id: actualite.id,
    title: actualite.titre,
    category: "Actualité",
    excerpt: actualite.contenu,
    imageUrl: actualite.image_url,
    linkUrl: actualite.lien_url,
    linkLabel: actualite.lien_label,
    raw: actualite
  }));

  const visibleItems = typeof limit === "number" ? items.slice(0, limit) : items;

  return (
    <>
      {message ? <p className="mb-5 rounded-lg bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700">{message}</p> : null}
      {loading ? (
        <p className="rounded-lg bg-court-50 px-4 py-3 text-sm font-semibold text-ink-600">Chargement des actualités...</p>
      ) : null}
      {!loading && visibleItems.length === 0 ? (
        <p className="rounded-lg border border-dashed border-court-200 bg-court-50 px-4 py-6 text-sm font-semibold text-ink-600">
          Aucune actualité publique n'est publiée pour le moment. Les contenus ajoutés dans le back-office apparaîtront ici automatiquement.
        </p>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleItems.map((post) => (
          <Card id={`actualite-${post.id}`} key={post.id} className="relative grid aspect-square cursor-pointer grid-rows-[44%_56%] overflow-hidden p-0 hover:border-[#00a8bc] hover:shadow-soft">
            <button
              type="button"
              onClick={() => setSelectedActualite(post.raw)}
              className="absolute inset-0 z-10 rounded-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-[#00a8bc]/40"
              aria-label={`Lire toute l’actualité : ${post.title}`}
            />
            {isSafeDisplayUrl(post.imageUrl) ? (
              <img
                src={post.imageUrl ?? ""}
                alt={`Photo ou illustration de l'actualité : ${post.title}`}
                loading="lazy"
                decoding="async"
                sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                className="h-full w-full bg-court-50 object-contain"
              />
            ) : (
              <div className="flex min-h-0 items-center justify-center bg-gradient-to-br from-court-900 to-court-500 text-white">
                <div className="text-center">
                  <ImageIcon className="mx-auto h-9 w-9 opacity-70" aria-hidden="true" />
                  <p className="mt-2 font-display text-sm font-black uppercase">Actualité CFVV</p>
                </div>
              </div>
            )}
            <div className="flex min-h-0 overflow-hidden">
              <div className="flex min-h-0 w-full flex-col overflow-hidden px-5 py-4">
                <p className="text-xs font-bold uppercase text-warning">{post.category}</p>
                <h2 className="mt-1 line-clamp-2 text-xl font-black text-court-900">{post.title}</h2>
                <p className="mt-2 line-clamp-3 whitespace-pre-line text-sm leading-5 text-ink-500">{post.excerpt}</p>
                {isSafeDisplayUrl(post.linkUrl) ? <ActualiteLink href={post.linkUrl ?? ""} label={post.linkLabel || "Voir le lien"} /> : null}
                <span className="mt-auto pt-2 font-display text-xs font-black uppercase text-[#0097a9]">Lire toutes les informations</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
      {typeof document !== "undefined" && selectedActualite
        ? createPortal(
            <ActualiteDialog actualite={selectedActualite} onClose={() => setSelectedActualite(null)} />,
            document.body
          )
        : null}
    </>
  );
}

function ActualiteLink({ href, label }: { href: string; label: string }) {
  const isInternal = !isExternalUrl(href);
  const className = "relative z-20 mt-4 inline-flex h-10 items-center rounded-lg bg-court-500 px-4 text-sm font-semibold text-white hover:bg-court-600";

  if (isInternal) {
    return (
      <Link href={href} className={className}>
        {label}
      </Link>
    );
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {label}
    </a>
  );
}

function ActualiteDialog({ actualite, onClose }: { actualite: ActualiteRow; onClose: () => void }) {
  const hasImage = isSafeDisplayUrl(actualite.image_url);
  const hasLink = isSafeDisplayUrl(actualite.lien_url);

  return (
    <div
      className="fixed inset-0 z-[120] flex items-end justify-center bg-[#031d2b]/75 p-0 backdrop-blur-sm sm:items-center sm:p-5"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <article role="dialog" aria-modal="true" aria-labelledby={`actualite-dialog-${actualite.id}`} className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:max-w-2xl sm:rounded-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-court-100 bg-white px-5 py-4">
          <p className="font-display text-xs font-black uppercase text-[#0097a9]">Actualité du club</p>
          <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-court-50 text-court-900 hover:bg-court-100" aria-label="Fermer l’actualité">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        {hasImage ? (
          <img src={actualite.image_url ?? ""} alt={`Photo ou illustration de l'actualité : ${actualite.titre}`} className="aspect-square w-full bg-court-50 object-contain sm:max-h-[520px]" />
        ) : null}
        <div className="p-5 sm:p-7">
          <h2 id={`actualite-dialog-${actualite.id}`} className="font-display text-3xl font-black text-court-900">{actualite.titre}</h2>
          <p className="mt-4 whitespace-pre-line text-base leading-7 text-ink-600">{actualite.contenu}</p>
          {hasLink ? <ActualiteLink href={actualite.lien_url ?? ""} label={actualite.lien_label || "Ouvrir le lien associé"} /> : null}
        </div>
      </article>
    </div>
  );
}
