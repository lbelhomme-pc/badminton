import Link from "next/link";
import { BadgeCheck, Dumbbell, MessageCircle } from "lucide-react";
import { InfoPage } from "@/components/public/info-page";
import { Card } from "@/components/ui/card";

export default function AdultesDebutantsPage() {
  return (
    <InfoPage
      eyebrow="Jouer au club"
      title="Adultes débutants"
      intro="Un parcours simple pour venir essayer, apprendre les bases et rejoindre progressivement les créneaux loisirs sans pression."
      cards={[
        { title: "Séance d'essai", text: "Une séance d'essai permet de découvrir l'ambiance, le gymnase et les formats de jeu avant inscription.", href: "/inscriptions/seance-essai" },
        { title: "Bases techniques", text: "Service, dégagement, amorti, placement, sécurité et premières rotations sur le terrain." },
        { title: "Intégration", text: "Les responsables orientent les nouveaux joueurs vers les créneaux et partenaires les plus adaptés." }
      ]}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <BadgeCheck className="h-6 w-6 text-court-500" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-black text-court-900">Niveaux acceptés</h2>
          <p className="mt-2 text-sm leading-6 text-ink-500">
            Débutant complet, reprise sportive, joueur loisir occasionnel : le club peut vous orienter vers le bon créneau.
          </p>
        </Card>
        <Card className="p-5">
          <Dumbbell className="h-6 w-6 text-court-500" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-black text-court-900">Matériel</h2>
          <p className="mt-2 text-sm leading-6 text-ink-500">
            Prévoyez une tenue de sport et des chaussures propres de salle. Le prêt de raquette pour l'essai est à confirmer.
          </p>
        </Card>
        <Card className="p-5">
          <MessageCircle className="h-6 w-6 text-court-500" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-black text-court-900">Avant de venir</h2>
          <p className="mt-2 text-sm leading-6 text-ink-500">
            Consultez les créneaux, puis envoyez une demande d'essai pour que le club confirme le meilleur moment.
          </p>
          <Link className="mt-4 inline-flex font-bold text-court-600 hover:text-court-900" href="/contact">
            Contacter le club
          </Link>
        </Card>
      </div>
    </InfoPage>
  );
}
