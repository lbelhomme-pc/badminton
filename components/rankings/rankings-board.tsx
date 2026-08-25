"use client";

import { CalendarDays, Search, Trophy, UsersRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { type RankingRow, fetchPublicRankings } from "@/services/supabase-data.service";
import type { Ranking } from "@/types/domain";

interface RankingsBoardProps {
  fallbackRankings: Ranking[];
}

function rankingLevelClass(value: string | null) {
  const level = value?.trim().toUpperCase() || "NC";
  if (level === "NC") return "border-slate-200 bg-slate-100 text-slate-600";
  if (level.startsWith("N")) return "border-court-900 bg-court-900 text-white";
  if (level.startsWith("R")) return "border-court-500 bg-court-500 text-white";
  if (level.startsWith("D")) return "border-court-200 bg-court-100 text-court-900";
  return "border-amber-200 bg-amber-100 text-amber-950";
}

function RankingLevel({ value, points }: { value: string | null; points: number | null }) {
  const level = value?.trim().toUpperCase() || "NC";
  const detail = points === null ? level : `${level} · ${points.toLocaleString("fr-FR")} points`;

  return (
    <span
      title={detail}
      aria-label={detail}
      className={`inline-flex h-10 min-w-10 items-center justify-center rounded-lg border px-2 font-display text-sm font-black ${rankingLevelClass(level)}`}
    >
      {level}
    </span>
  );
}

function fromFallback(ranking: Ranking, index: number): RankingRow {
  return {
    id: Number(ranking.id.replace(/\D/g, "")) || index + 1,
    display_name: ranking.displayName,
    categorie: ranking.category,
    classement_simple: ranking.singleRank,
    classement_double: ranking.doubleRank,
    classement_mixte: ranking.mixedRank,
    points_simple: null,
    points_double: null,
    points_mixte: null,
    progression: ranking.progression,
    equipe: ranking.team,
    synced_at: null
  };
}

export function RankingsBoard({ fallbackRankings }: RankingsBoardProps) {
  const [rankings, setRankings] = useState<RankingRow[]>(fallbackRankings.map(fromFallback));
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [syncedAt, setSyncedAt] = useState<string | null>(null);

  useEffect(() => {
    fetchPublicRankings().then((result) => {
      if (result.data.length > 0) {
        setRankings(result.data);
        setSyncedAt(result.data.find((ranking) => ranking.synced_at)?.synced_at ?? null);
        setMessage(null);
      } else if (result.error && result.error !== "Configuration Supabase manquante.") {
        setMessage(result.error);
      }
    });
  }, []);

  const filteredRankings = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return rankings;

    return rankings.filter((ranking) =>
      [
        ranking.display_name,
        ranking.categorie,
        ranking.classement_simple,
        ranking.classement_double,
        ranking.classement_mixte,
        ranking.equipe
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [query, rankings]);

  return (
    <>
      <div className="mb-5 overflow-hidden rounded-lg border border-court-200 bg-white shadow-sm">
        <div className="grid gap-5 bg-court-900 px-5 py-6 text-white lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="flex items-center gap-2 text-court-100">
              <Trophy className="h-5 w-5" aria-hidden="true" />
              <p className="font-display text-xs font-black uppercase tracking-[0.16em]">Niveaux FFBaD</p>
            </div>
            <h2 className="mt-3 text-2xl font-black">Les niveaux des joueurs du CFVV</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-200">
              Classements en Simple, Double et Mixte issus de la dernière synchronisation validée par le club.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-bold">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-2"><CalendarDays className="h-4 w-4" aria-hidden="true" /> Mise à jour quotidienne</span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-2"><UsersRound className="h-4 w-4" aria-hidden="true" /> {rankings.length} joueur{rankings.length > 1 ? "s" : ""}</span>
          </div>
        </div>

        <div className="p-3 sm:p-4">
          <label className="relative block">
            <span className="sr-only">Rechercher un joueur</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-11 w-full rounded-lg border border-court-200 bg-court-50 pl-10 pr-3 text-sm font-medium outline-none transition focus:border-court-500 focus:bg-white focus:ring-2 focus:ring-court-500/20"
              placeholder="Rechercher un joueur, une catégorie ou une équipe"
            />
          </label>
        </div>
      </div>

      {message ? <p className="mb-5 rounded-lg bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700">{message}</p> : null}

      {syncedAt ? (
        <p className="mb-5 text-sm font-semibold text-ink-500">
          Dernière synchronisation : {new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(syncedAt))}
        </p>
      ) : null}

      {filteredRankings.length === 0 ? (
        <Card className="p-6 text-sm leading-6 text-ink-500">
          {rankings.length === 0
            ? "Aucun classement n’est publié pour le moment. Le tableau sera alimenté lors de la première synchronisation quotidienne depuis la source FFBaD configurée par le club."
            : "Aucun joueur ne correspond à cette recherche."}
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-court-50 text-xs uppercase text-ink-500">
                <tr>
                  <th className="px-5 py-4">Joueur</th>
                  <th className="px-5 py-4">Catégorie</th>
                  <th className="px-5 py-4">Simple</th>
                  <th className="px-5 py-4">Double</th>
                  <th className="px-5 py-4">Mixte</th>
                  <th className="px-5 py-4">Progression</th>
                  <th className="px-5 py-4">Équipe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-court-200">
                {filteredRankings.map((ranking) => (
                  <tr key={ranking.id}>
                    <td className="px-5 py-4 font-black text-court-900">{ranking.display_name}</td>
                    <td className="px-5 py-4 text-ink-500">{ranking.categorie || "-"}</td>
                    <td className="px-5 py-4"><RankingLevel value={ranking.classement_simple} points={ranking.points_simple} /></td>
                    <td className="px-5 py-4"><RankingLevel value={ranking.classement_double} points={ranking.points_double} /></td>
                    <td className="px-5 py-4"><RankingLevel value={ranking.classement_mixte} points={ranking.points_mixte} /></td>
                    <td className="px-5 py-4">
                      <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">{ranking.progression || "À jour"}</Badge>
                    </td>
                    <td className="px-5 py-4 text-ink-500">{ranking.equipe || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 p-4 md:hidden">
            {filteredRankings.map((ranking) => (
              <div key={ranking.id} className="rounded-lg bg-court-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-black text-court-900">{ranking.display_name}</p>
                    <p className="text-sm text-ink-500">{ranking.categorie || "-"} · {ranking.equipe || "-"}</p>
                  </div>
                  <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">{ranking.progression || "À jour"}</Badge>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="rounded-lg bg-white p-3"><p className="text-ink-500">Simple</p><div className="mt-2"><RankingLevel value={ranking.classement_simple} points={ranking.points_simple} /></div></div>
                  <div className="rounded-lg bg-white p-3"><p className="text-ink-500">Double</p><div className="mt-2"><RankingLevel value={ranking.classement_double} points={ranking.points_double} /></div></div>
                  <div className="rounded-lg bg-white p-3"><p className="text-ink-500">Mixte</p><div className="mt-2"><RankingLevel value={ranking.classement_mixte} points={ranking.points_mixte} /></div></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </>
  );
}
