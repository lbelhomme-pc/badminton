"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { news } from "@/lib/mock-data";
import { fetchActualites, type ActualiteRow } from "@/services/supabase-data.service";

interface ActualitesListProps {
  limit?: number;
}

export function ActualitesList({ limit }: ActualitesListProps) {
  const [actualites, setActualites] = useState<ActualiteRow[] | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchActualites(false).then((result) => {
      if (result.data.length > 0) {
        setActualites(result.data);
        setMessage(null);
      } else if (result.error && result.error !== "Configuration Supabase manquante.") {
        setMessage(result.error);
      }
    });
  }, []);

  const items = actualites
    ? actualites.map((actualite) => ({
        id: actualite.id,
        title: actualite.titre,
        category: "Actualité",
        excerpt: actualite.contenu,
        imageUrl: actualite.image_url,
        linkUrl: actualite.lien_url,
        linkLabel: actualite.lien_label
      }))
    : news.map((post) => ({ ...post, imageUrl: null, linkUrl: null, linkLabel: null }));

  const visibleItems = typeof limit === "number" ? items.slice(0, limit) : items;

  return (
    <>
      {message ? <p className="mb-5 rounded-lg bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700">{message}</p> : null}
      <div className="grid gap-4 md:grid-cols-2">
        {visibleItems.map((post) => (
          <Card key={post.id} className="overflow-hidden p-0">
            {post.imageUrl ? <img src={post.imageUrl} alt="" className="h-44 w-full object-cover" /> : null}
            <div className="flex items-start gap-3">
              <MapPin className="ml-5 mt-6 h-5 w-5 text-warning" aria-hidden="true" />
              <div className="px-5 py-5 pl-0">
                <p className="text-xs font-bold uppercase text-warning">{post.category}</p>
                <h2 className="mt-1 text-xl font-black text-court-900">{post.title}</h2>
                <p className="mt-2 text-sm leading-6 text-ink-500">{post.excerpt}</p>
                {post.linkUrl ? <ActualiteLink href={post.linkUrl} label={post.linkLabel || "Voir le lien"} /> : null}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

function ActualiteLink({ href, label }: { href: string; label: string }) {
  const isInternal = href.startsWith("/");

  return (
    <a
      href={href}
      target={isInternal ? undefined : "_blank"}
      rel={isInternal ? undefined : "noreferrer"}
      className="mt-4 inline-flex h-10 items-center rounded-lg bg-court-500 px-4 text-sm font-semibold text-white hover:bg-court-600"
    >
      {label}
    </a>
  );
}
