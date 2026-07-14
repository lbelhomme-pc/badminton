import Link from "next/link";
import { CalendarDays, Handshake, Trophy } from "lucide-react";
import { InfoPage } from "@/components/public/info-page";
import { Card } from "@/components/ui/card";

export default function TournoisPage() {
  return (
    <InfoPage
      eyebrow="Vie du club"
      title="Tournois"
      intro="Tournois internes, sorties compÃ©tition et informations pratiques pour les joueuses et joueurs motivÃ©s."
      cards={[
        { title: "Tournois internes", text: "Formats conviviaux, doubles surprises et animations club quand le calendrier le permet." },
        { title: "Tournois officiels", text: "Les inscriptions et catégories dépendent des règlements FFBaD et des informations officielles de chaque tournoi." },
        { title: "BÃ©nÃ©voles", text: "Aide Ã  l'organisation, installation, accueil et buvette lors des temps forts du club." }
      ]}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <Trophy className="h-6 w-6 text-court-500" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-black text-court-900">Jouer</h2>
          <p className="mt-2 text-sm leading-6 text-ink-500">
            Les compÃ©titeurs peuvent demander conseil au club pour choisir un tournoi adaptÃ© Ã  leur niveau.
          </p>
        </Card>
        <Card className="p-5">
          <CalendarDays className="h-6 w-6 text-court-500" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-black text-court-900">S'organiser</h2>
          <p className="mt-2 text-sm leading-6 text-ink-500">
            Les dates, horaires, tableaux et inscriptions seront Ã  confirmer avec les informations officielles.
          </p>
        </Card>
        <Card className="p-5">
          <Handshake className="h-6 w-6 text-court-500" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-black text-court-900">Aider</h2>
          <p className="mt-2 text-sm leading-6 text-ink-500">
            Les bÃ©nÃ©voles peuvent aider ponctuellement, mÃªme sans s'engager toute l'annÃ©e.
          </p>
        </Card>
      </div>
      <Link className="mt-6 inline-flex font-bold text-court-600 hover:text-court-900" href="/contact">
        Proposer son aide ou poser une question
      </Link>
    </InfoPage>
  );
}

