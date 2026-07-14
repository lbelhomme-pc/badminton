"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
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

  const items = actualites.map((actualite) => ({
    id: actualite.id,
    title: actualite.titre,
    category: "Actualité",
    excerpt: actualite.contenu,
    imageUrl: actualite.image_url,
    linkUrl: actualite.lien_url,
    linkLabel: actualite.lien_label
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
          <Card key={post.id} className="overflow-hidden p-0">
            {isSafeDisplayUrl(post.imageUrl) ? (
              <img
                src={post.imageUrl ?? ""}
                alt={`Photo ou illustration de l'actualité : ${post.title}`}
                loading="lazy"
                decoding="async"
                sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                className="h-44 w-full object-cover"
              />
            ) : null}
            <div className="flex items-start gap-3">
              <MapPin className="ml-5 mt-6 h-5 w-5 text-warning" aria-hidden="true" />
              <div className="px-5 py-5 pl-0">
                <p className="text-xs font-bold uppercase text-warning">{post.category}</p>
                <h2 className="mt-1 text-xl font-black text-court-900">{post.title}</h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-ink-500">{post.excerpt}</p>
                {isSafeDisplayUrl(post.linkUrl) ? <ActualiteLink href={post.linkUrl ?? ""} label={post.linkLabel || "Voir le lien"} /> : null}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

function ActualiteLink({ href, label }: { href: string; label: string }) {
  const isInternal = !isExternalUrl(href);
  const className = "mt-4 inline-flex h-10 items-center rounded-lg bg-court-500 px-4 text-sm font-semibold text-white hover:bg-court-600";

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
