import Link from "next/link";
import { HeartHandshake, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import { InfoPage } from "@/components/public/info-page";
import { Card } from "@/components/ui/card";

export default function PresentationPage() {
  return (
    <InfoPage
      contentKey="/club/presentation"
      eyebrow="Le club"
      title="Un club vendômois pour jouer, progresser et partager"
      intro="Le CFVV accueille les débutants, les loisirs, les jeunes et les compétiteurs avec une organisation simple, lisible et associative."
      cards={[
        { title: "Convivialité", text: "Des créneaux pensés pour jouer avec plaisir, rencontrer d'autres adhérents et s'intégrer vite.", href: "/jouer-au-club/loisirs" },
        { title: "Progression", text: "Des séances adaptées aux niveaux, avec un cadre clair pour apprendre et se challenger.", href: "/jouer-au-club/adultes-debutants" },
        { title: "Vie associative", text: "Tournois internes, interclubs, bénévolat et événements rythment la saison.", href: "/vie-du-club" }
      ]}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="p-5">
          <UsersRound className="h-6 w-6 text-court-500" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-black text-court-900">Accueil</h2>
          <p className="mt-2 text-sm leading-6 text-ink-500">
            Un visiteur doit pouvoir comprendre rapidement où jouer, quand venir et qui contacter.
          </p>
        </Card>
        <Card className="p-5">
          <ShieldCheck className="h-6 w-6 text-court-500" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-black text-court-900">Respect</h2>
          <p className="mt-2 text-sm leading-6 text-ink-500">
            Les créneaux reposent sur le respect des joueurs, des bénévoles, du gymnase et du matériel.
          </p>
        </Card>
        <Card className="p-5">
          <Sparkles className="h-6 w-6 text-court-500" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-black text-court-900">Progression</h2>
          <p className="mt-2 text-sm leading-6 text-ink-500">
            Chaque joueur peut avancer à son rythme, du premier essai aux matchs plus engagés.
          </p>
        </Card>
        <Card className="p-5">
          <HeartHandshake className="h-6 w-6 text-court-500" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-black text-court-900">Bénévolat</h2>
          <p className="mt-2 text-sm leading-6 text-ink-500">
            Le club vit grâce aux coups de main ponctuels : accueil, événements, communication, buvette ou installation.
          </p>
        </Card>
      </div>

      <Card className="mt-4 p-6">
        <h2 className="text-2xl font-black text-court-900">Partenaires et collectivités</h2>
        <p className="mt-3 max-w-3xl leading-7 text-ink-500">
          Une entreprise, association ou collectivité peut soutenir le club, aider à faire connaître le badminton à Vendôme
          ou échanger sur une action locale. Les modalités sont à construire avec le bureau.
        </p>
        <Link className="mt-5 inline-flex font-bold text-court-600 hover:text-court-900" href="/vie-du-club/partenaires">
          Voir la page partenaires
        </Link>
      </Card>
    </InfoPage>
  );
}
