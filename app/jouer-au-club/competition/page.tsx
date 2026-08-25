import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, ListChecks, Medal, Trophy } from "lucide-react";
import { InfoPage } from "@/components/public/info-page";
import { RankingsBoard } from "@/components/rankings/rankings-board";
import { Card } from "@/components/ui/card";
import { getRankings } from "@/services/club.service";

export const metadata: Metadata = {
  title: "Compétition et niveaux des joueurs - CFVV",
  description: "Niveaux FFBaD des joueurs du CFVV, actualisés quotidiennement à partir de la source officielle configurée par le club."
};

export default function CompetitionPage() {
  return (
    <InfoPage
      contentKey="/jouer-au-club/competition"
      eyebrow="Jouer au club"
      title="Compétition"
      intro="Suivez les niveaux des joueurs du CFVV, préparez vos tournois et interclubs, et retrouvez les informations utiles pour progresser en compétition."
      cards={[
        { title: "Interclubs", text: "Équipes, capitaines, convocations et rencontres sont regroupés dans la rubrique dédiée.", href: "/vie-du-club/interclubs" },
        { title: "Mise à jour quotidienne", text: "Les niveaux Simple, Double et Mixte sont actualisés chaque jour depuis la source FFBaD configurée par le club.", href: "#niveaux-joueurs" },
        { title: "Créneaux adaptés", text: "Les créneaux indiquent le public conseillé, la capacité et le responsable pour choisir le bon moment.", href: "/jouer-au-club/creneaux" }
      ]}
    >
      <section id="niveaux-joueurs" className="scroll-mt-28">
        <RankingsBoard fallbackRankings={getRankings()} />
      </section>

      <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="p-6">
          <Medal className="h-6 w-6 text-court-500" aria-hidden="true" />
          <h2 className="mt-4 text-2xl font-black text-court-900">Pour qui ?</h2>
          <p className="mt-3 leading-7 text-ink-500">
            Joueurs déjà à l'aise en match, anciens compétiteurs, licenciés motivés ou loisirs qui veulent essayer un cadre plus structuré.
            Le bureau ou les responsables de créneau peuvent orienter chacun vers la formule adaptée.
          </p>
        </Card>

        <Card className="p-6">
          <ListChecks className="h-6 w-6 text-info" aria-hidden="true" />
          <h2 className="mt-4 text-2xl font-black text-court-900">Avant de s'engager</h2>
          <ul className="mt-4 grid gap-3 text-sm leading-6 text-ink-500">
            <li>Vérifier la licence adaptée : loisir ou compétiteur.</li>
            <li>Confirmer les disponibilités pour les rencontres et déplacements.</li>
            <li>Échanger avec le responsable de créneau ou le capitaine d'équipe.</li>
            <li>Suivre les convocations et informations publiées par le club.</li>
          </ul>
        </Card>
      </div>

      <Card className="mt-4 p-6">
        <Trophy className="h-6 w-6 text-court-500" aria-hidden="true" />
        <h2 className="mt-4 text-2xl font-black text-court-900">Tournois et progression</h2>
        <p className="mt-3 max-w-3xl leading-7 text-ink-500">
          Les joueurs qui souhaitent faire des tournois officiels doivent vérifier les modalités FFBaD et les informations du club.
          Les dates, catégories et inscriptions exactes sont à confirmer au fil de la saison.
        </p>
        <Link className="mt-5 inline-flex font-bold text-court-600 hover:text-court-900" href="/vie-du-club/tournois">
          Voir la rubrique tournois
        </Link>
      </Card>

      <Card className="mt-4 border-court-200 bg-court-50 p-6">
        <CalendarDays className="h-6 w-6 text-court-500" aria-hidden="true" />
        <h2 className="mt-4 text-2xl font-black text-court-900">Comment sont actualisés les niveaux ?</h2>
        <p className="mt-3 max-w-3xl leading-7 text-ink-500">
          Le site synchronise quotidiennement les données de classement importées depuis la source FFBaD du club. La date exacte de la dernière synchronisation est affichée au-dessus du tableau.
        </p>
      </Card>
    </InfoPage>
  );
}
