import Link from "next/link";
import { GraduationCap, Info, ShieldCheck, Target } from "lucide-react";
import { InfoPage } from "@/components/public/info-page";
import { Card } from "@/components/ui/card";

export default function EncadrantsPage() {
  return (
    <InfoPage
      eyebrow="Le club"
      title="Encadrants et responsables de séances"
      intro="Les encadrants et responsables de créneaux accompagnent les jeunes, les adultes débutants et les compétiteurs avec des objectifs adaptés à chaque public."
      cards={[
        { title: "Jeunes", text: "Apprentissage technique, motricité, règles du jeu et premiers matchs.", href: "/jouer-au-club/jeunes" },
        { title: "Adultes débutants", text: "Bases techniques, placements, service, sécurité et plaisir de jouer.", href: "/jouer-au-club/adultes-debutants" },
        { title: "Compétition", text: "Intensité, tactique, doubles, préparation interclubs et suivi des équipes.", href: "/jouer-au-club/competition" }
      ]}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <GraduationCap className="h-6 w-6 text-court-500" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-black text-court-900">Apprendre</h2>
          <p className="mt-2 text-sm leading-6 text-ink-500">
            Les séances structurées permettent de poser les bases : gestes, déplacements, règles et sécurité.
          </p>
        </Card>
        <Card className="p-5">
          <Target className="h-6 w-6 text-court-500" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-black text-court-900">Progresser</h2>
          <p className="mt-2 text-sm leading-6 text-ink-500">
            Les responsables peuvent orienter vers un créneau plus adapté quand le niveau ou les envies évoluent.
          </p>
        </Card>
        <Card className="p-5">
          <ShieldCheck className="h-6 w-6 text-court-500" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-black text-court-900">Sécuriser</h2>
          <p className="mt-2 text-sm leading-6 text-ink-500">
            L'encadrement veille au bon usage des terrains, aux rotations et à l'accueil des nouveaux.
          </p>
        </Card>
      </div>

      <Card className="mt-4 p-6">
        <Info className="h-6 w-6 text-info" aria-hidden="true" />
        <h2 className="mt-4 text-2xl font-black text-court-900">Responsables à confirmer</h2>
        <p className="mt-3 max-w-3xl leading-7 text-ink-500">
          La liste nominative des encadrants, diplômes éventuels et référents par créneau doit être validée par le bureau avant publication.
        </p>
        <Link className="mt-5 inline-flex font-bold text-court-600 hover:text-court-900" href="/contact">
          Contacter le club
        </Link>
      </Card>
    </InfoPage>
  );
}
