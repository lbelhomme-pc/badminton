import Link from "next/link";
import { ClipboardList, HeartHandshake, Info, ShieldCheck, UsersRound } from "lucide-react";
import { InfoPage } from "@/components/public/info-page";
import { Card } from "@/components/ui/card";

export default function JeunesPage() {
  return (
    <InfoPage
      eyebrow="Jouer au club"
      title="Jeunes"
      intro="Les séances jeunes permettent de découvrir le badminton, de progresser techniquement et de prendre plaisir à jouer en groupe dans un cadre adapté."
      cards={[
        { title: "Âge minimum", text: "L'âge exact d'accueil est à confirmer par le bureau selon les groupes ouverts, l'encadrement disponible et les places restantes.", href: "/contact" },
        { title: "Encadrement", text: "Les séances sont organisées par niveau autant que possible, avec des exercices courts, des règles claires et des temps de jeu." },
        { title: "Compétition possible", text: "Les jeunes qui le souhaitent peuvent être accompagnés vers les tournois ou interclubs selon leur âge, leur niveau et leur motivation.", href: "/jouer-au-club/competition" }
      ]}
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <Card className="p-6">
          <UsersRound className="h-6 w-6 text-court-500" aria-hidden="true" />
          <h2 className="mt-4 text-2xl font-black text-court-900">Pour les parents</h2>
          <p className="mt-3 leading-7 text-ink-500">
            Avant la première venue, consultez les créneaux jeunes puis contactez le club pour vérifier le bon groupe, les places
            disponibles et les documents à préparer. Indiquez l'âge de l'enfant, son expérience sportive et s'il a déjà joué au badminton.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/creneaux"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-court-500 px-4 text-sm font-semibold text-white shadow-soft transition hover:bg-court-600"
            >
              Voir les créneaux jeunes
            </Link>
            <Link
              href="/inscriptions/documents-utiles"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-court-200 bg-white px-4 text-sm font-semibold text-court-900 transition hover:bg-court-50"
            >
              Documents utiles
            </Link>
          </div>
        </Card>

        <Card className="p-6">
          <ClipboardList className="h-6 w-6 text-info" aria-hidden="true" />
          <h2 className="mt-4 text-2xl font-black text-court-900">À prévoir</h2>
          <ul className="mt-4 grid gap-3 text-sm leading-6 text-ink-500">
            <li className="flex gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-court-500" aria-hidden="true" />
              Tenue de sport, chaussures propres de salle et gourde.
            </li>
            <li className="flex gap-2">
              <HeartHandshake className="mt-0.5 h-4 w-4 shrink-0 text-court-500" aria-hidden="true" />
              Raquette personnelle si possible ; prêt à confirmer pour l'essai.
            </li>
            <li className="flex gap-2">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-court-500" aria-hidden="true" />
              Autorisation parentale et éléments médicaux selon les règles FFBaD en vigueur.
            </li>
          </ul>
        </Card>
      </div>
    </InfoPage>
  );
}
