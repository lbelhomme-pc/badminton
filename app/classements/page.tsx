import type { Metadata } from "next";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getRankings } from "@/services/club.service";

export const metadata: Metadata = {
  title: "Classements du club - CFVV41",
  description: "Classements joueurs importables par CSV, avec affichage RGPD limité."
};

export default function ClassementsPage() {
  const rankings = getRankings();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-court-600">Classements</p>
        <h1 className="mt-2 text-4xl font-black text-court-900">Classements du club</h1>
        <p className="mt-3 max-w-2xl text-ink-500">
          Affichage public limité selon les préférences des joueurs. Les classements sont mis à jour par le club.
        </p>
      </div>

      <div className="mb-5 rounded-lg border border-court-200 bg-white p-3">
        <label className="relative block">
          <span className="sr-only">Rechercher un joueur</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
          <input
            className="h-11 w-full rounded-lg border border-court-200 bg-court-50 pl-10 pr-3 text-sm font-medium outline-none transition focus:border-court-500 focus:bg-white focus:ring-2 focus:ring-court-500/20"
            placeholder="Rechercher un joueur, une catégorie ou une équipe"
          />
        </label>
      </div>

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
              {rankings.map((ranking) => (
                <tr key={ranking.id}>
                  <td className="px-5 py-4 font-black text-court-900">{ranking.displayName}</td>
                  <td className="px-5 py-4 text-ink-500">{ranking.category}</td>
                  <td className="px-5 py-4 font-semibold text-court-900">{ranking.singleRank}</td>
                  <td className="px-5 py-4 font-semibold text-court-900">{ranking.doubleRank}</td>
                  <td className="px-5 py-4 font-semibold text-court-900">{ranking.mixedRank}</td>
                  <td className="px-5 py-4"><Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">{ranking.progression}</Badge></td>
                  <td className="px-5 py-4 text-ink-500">{ranking.team}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 p-4 md:hidden">
          {rankings.map((ranking) => (
            <div key={ranking.id} className="rounded-lg bg-court-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-black text-court-900">{ranking.displayName}</p>
                  <p className="text-sm text-ink-500">{ranking.category} · {ranking.team}</p>
                </div>
                <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">{ranking.progression}</Badge>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
                <div className="rounded-lg bg-white p-3"><p className="text-ink-500">Simple</p><p className="font-black">{ranking.singleRank}</p></div>
                <div className="rounded-lg bg-white p-3"><p className="text-ink-500">Double</p><p className="font-black">{ranking.doubleRank}</p></div>
                <div className="rounded-lg bg-white p-3"><p className="text-ink-500">Mixte</p><p className="font-black">{ranking.mixedRank}</p></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
