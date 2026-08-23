import Link from "next/link";
import { CalendarDays, SmilePlus, UsersRound } from "lucide-react";
import { InfoPage } from "@/components/public/info-page";
import { Card } from "@/components/ui/card";

export default function LoisirsPage() {
  return (
    <InfoPage
      contentKey="/jouer-au-club/loisirs"
      eyebrow="Jouer au club"
      title="Loisirs"
      intro="Les créneaux loisirs sont faits pour jouer régulièrement, rencontrer du monde et garder un bon rythme sportif sans obligation de compétition."
      cards={[
        { title: "Jeu libre", text: "Des créneaux ouverts pour varier les partenaires et les formats de jeu.", href: "/reservations/creneaux" },
        { title: "Tous niveaux", text: "Chaque séance indique le public et le niveau conseillé pour mieux choisir.", href: "/creneaux" },
        { title: "Convivialité", text: "Le club reste un lieu simple, direct et sympa pour jouer après le travail ou en fin de semaine." }
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
          <h2 className="mt-4 text-xl font-black text-court-900">Sans compétition</h2>
          <p className="mt-2 text-sm leading-6 text-ink-500">
            Les loisirs peuvent jouer toute la saison sans faire d'interclubs ni de tournoi officiel.
          </p>
        </Card>
        <Card className="p-5">
          <SmilePlus className="h-6 w-6 text-court-500" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-black text-court-900">Première venue</h2>
          <p className="mt-2 text-sm leading-6 text-ink-500">
            Le plus simple est de demander un essai avant de venir pour être accueilli sur le bon créneau.
          </p>
          <Link className="mt-4 inline-flex font-bold text-court-600 hover:text-court-900" href="/inscriptions/seance-essai">
            Demander un essai
          </Link>
        </Card>
      </div>
    </InfoPage>
  );
}

