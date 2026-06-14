import type { Metadata } from "next";
import { RankingsBoard } from "@/components/rankings/rankings-board";
import { getRankings } from "@/services/club.service";

export const metadata: Metadata = {
  title: "Classements du club - CF2V41",
  description: "Classements joueurs synchronisés vers Supabase, avec affichage RGPD limité."
};

export default function ClassementsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-court-600">Classements</p>
        <h1 className="mt-2 text-4xl font-black text-court-900">Classements du club</h1>
        <p className="mt-3 max-w-2xl text-ink-500">
          Affichage public limité selon les règles RGPD du club. Les données peuvent être synchronisées automatiquement
          depuis un export officiel CSV.
        </p>
      </div>

      <RankingsBoard fallbackRankings={getRankings()} />
    </div>
  );
}
