import Link from "next/link";
import { HeartHandshake, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import { InfoPage } from "@/components/public/info-page";
import { Card } from "@/components/ui/card";

export default function PresentationPage() {
  return (
    <InfoPage
      eyebrow="Le club"
      title="Un club vendÃ´mois pour jouer, progresser et partager"
      intro="Le CFVV accueille les dÃ©butants, les loisirs, les jeunes et les compÃ©titeurs avec une organisation simple, lisible et associative."
      cards={[
        { title: "ConvivialitÃ©", text: "Des crÃ©neaux pensÃ©s pour jouer avec plaisir, rencontrer d'autres adhÃ©rents et s'intÃ©grer vite.", href: "/jouer-au-club/loisirs" },
        { title: "Progression", text: "Des sÃ©ances adaptÃ©es aux niveaux, avec un cadre clair pour apprendre et se challenger.", href: "/jouer-au-club/adultes-debutants" },
        { title: "Vie associative", text: "Tournois internes, interclubs, bÃ©nÃ©volat et Ã©vÃ©nements rythment la saison.", href: "/vie-du-club" }
      ]}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="p-5">
          <UsersRound className="h-6 w-6 text-court-500" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-black text-court-900">Accueil</h2>
          <p className="mt-2 text-sm leading-6 text-ink-500">
            Un visiteur doit pouvoir comprendre rapidement oÃ¹ jouer, quand venir et qui contacter.
          </p>
        </Card>
        <Card className="p-5">
          <ShieldCheck className="h-6 w-6 text-court-500" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-black text-court-900">Respect</h2>
          <p className="mt-2 text-sm leading-6 text-ink-500">
            Les crÃ©neaux reposent sur le respect des joueurs, des bÃ©nÃ©voles, du gymnase et du matÃ©riel.
          </p>
        </Card>
        <Card className="p-5">
          <Sparkles className="h-6 w-6 text-court-500" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-black text-court-900">Progression</h2>
          <p className="mt-2 text-sm leading-6 text-ink-500">
            Chaque joueur peut avancer Ã  son rythme, du premier essai aux matchs plus engagÃ©s.
          </p>
        </Card>
        <Card className="p-5">
          <HeartHandshake className="h-6 w-6 text-court-500" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-black text-court-900">BÃ©nÃ©volat</h2>
          <p className="mt-2 text-sm leading-6 text-ink-500">
            Le club vit grÃ¢ce aux coups de main ponctuels : accueil, Ã©vÃ©nements, communication, buvette ou installation.
          </p>
        </Card>
      </div>

      <Card className="mt-4 p-6">
        <h2 className="text-2xl font-black text-court-900">Partenaires et collectivitÃ©s</h2>
        <p className="mt-3 max-w-3xl leading-7 text-ink-500">
          Une entreprise, association ou collectivitÃ© peut soutenir le club, aider Ã  faire connaÃ®tre le badminton Ã  VendÃ´me
          ou Ã©changer sur une action locale. Les modalitÃ©s sont Ã  construire avec le bureau.
        </p>
        <Link className="mt-5 inline-flex font-bold text-court-600 hover:text-court-900" href="/vie-du-club/partenaires">
          Voir la page partenaires
        </Link>
      </Card>
    </InfoPage>
  );
}
