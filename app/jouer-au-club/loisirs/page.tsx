import Link from "next/link";
import { CalendarDays, SmilePlus, UsersRound } from "lucide-react";
import { InfoPage } from "@/components/public/info-page";
import { Card } from "@/components/ui/card";

export default function LoisirsPage() {
  return (
    <InfoPage
      eyebrow="Jouer au club"
      title="Loisirs"
      intro="Les crÃ©neaux loisirs sont faits pour jouer rÃ©guliÃ¨rement, rencontrer du monde et garder un bon rythme sportif sans obligation de compÃ©tition."
      cards={[
        { title: "Jeu libre", text: "Des crÃ©neaux ouverts pour varier les partenaires et les formats de jeu.", href: "/reservations/creneaux" },
        { title: "Tous niveaux", text: "Chaque sÃ©ance indique le public et le niveau conseillÃ© pour mieux choisir.", href: "/creneaux" },
        { title: "ConvivialitÃ©", text: "Le club reste un lieu simple, direct et sympa pour jouer aprÃ¨s le travail ou en fin de semaine." }
      ]}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <CalendarDays className="h-6 w-6 text-court-500" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-black text-court-900">Rythme souple</h2>
          <p className="mt-2 text-sm leading-6 text-ink-500">
            Réserve les créneaux du mercredi et du vendredi quand tu viens jouer, et annule si besoin.
          </p>
        </Card>
        <Card className="p-5">
          <UsersRound className="h-6 w-6 text-court-500" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-black text-court-900">Sans compÃ©tition</h2>
          <p className="mt-2 text-sm leading-6 text-ink-500">
            Les loisirs peuvent jouer toute la saison sans faire d'interclubs ni de tournoi officiel.
          </p>
        </Card>
        <Card className="p-5">
          <SmilePlus className="h-6 w-6 text-court-500" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-black text-court-900">PremiÃ¨re venue</h2>
          <p className="mt-2 text-sm leading-6 text-ink-500">
            Le plus simple est de demander un essai avant de venir pour Ãªtre accueilli sur le bon crÃ©neau.
          </p>
          <Link className="mt-4 inline-flex font-bold text-court-600 hover:text-court-900" href="/inscriptions/seance-essai">
            Demander un essai
          </Link>
        </Card>
      </div>
    </InfoPage>
  );
}

