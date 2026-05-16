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
        excerpt: actualite.contenu
      }))
    : news;

  const visibleItems = typeof limit === "number" ? items.slice(0, limit) : items;

  return (
    <>
      {message ? <p className="mb-5 rounded-lg bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700">{message}</p> : null}
      <div className="grid gap-4 md:grid-cols-2">
        {visibleItems.map((post) => (
          <Card key={post.id} className="p-5">
            <div className="flex items-start gap-3">
              <MapPin className="mt-1 h-5 w-5 text-warning" aria-hidden="true" />
              <div>
                <p className="text-xs font-bold uppercase text-warning">{post.category}</p>
                <h2 className="mt-1 text-xl font-black text-court-900">{post.title}</h2>
                <p className="mt-2 text-sm leading-6 text-ink-500">{post.excerpt}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
