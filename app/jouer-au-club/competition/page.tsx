import Link from "next/link";
import { ListChecks, Medal, Trophy } from "lucide-react";
import { InfoPage } from "@/components/public/info-page";
import { Card } from "@/components/ui/card";

export default function CompetitionPage() {
  return (
    <InfoPage
      eyebrow="Jouer au club"
      title="Compétition"
      intro="Pour les joueurs qui veulent progresser, représenter le club et participer aux interclubs ou tournois selon leur niveau et leurs disponibilités."
      cards={[
        { title: "Interclubs", text: "Équipes, capitaines, convocations et rencontres sont regroupés dans la rubrique dédiée.", href: "/vie-du-club/interclubs" },
        { title: "Créneaux adaptés", text: "Les créneaux indiquent le public conseillé, la capacité et le responsable pour choisir le bon moment.", href: "/jouer-au-club/creneaux" },
        { title: "Classements", text: "Les classements du club peuvent être suivis ou importés selon les données disponibles.", href: "/classements" }
      ]}
    >
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
    </InfoPage>
  );
}
