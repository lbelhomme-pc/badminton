import Link from "next/link";
import { CalendarCheck, ClipboardList, UsersRound } from "lucide-react";
import { InfoPage } from "@/components/public/info-page";
import { Card } from "@/components/ui/card";

export default function InterclubsPage() {
  return (
    <InfoPage
      eyebrow="Vie du club"
      title="Interclubs"
      intro="Les interclubs permettent de représenter le CFVV en équipe, dans une ambiance sportive et collective. Les équipes exactes, capitaines et calendriers sont à confirmer par le club chaque saison."
      cards={[
        { title: "Équipes", text: "Composition, niveau et championnat seront précisés quand la saison est connue." },
        { title: "Capitaines", text: "Les capitaines centralisent les convocations, disponibilités et informations de rencontre." },
        { title: "Résultats", text: "Les résultats et liens officiels pourront être ajoutés au fil de la saison." }
      ]}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <UsersRound className="h-6 w-6 text-court-500" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-black text-court-900">Esprit d'équipe</h2>
          <p className="mt-2 text-sm leading-6 text-ink-500">
            Les interclubs demandent régularité, communication et respect des disponibilités annoncées.
          </p>
        </Card>
        <Card className="p-5">
          <CalendarCheck className="h-6 w-6 text-court-500" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-black text-court-900">Organisation</h2>
          <p className="mt-2 text-sm leading-6 text-ink-500">
            Les dates, déplacements, convocations et lieux de rencontre seront relayés par les capitaines ou le bureau.
          </p>
        </Card>
        <Card className="p-5">
          <ClipboardList className="h-6 w-6 text-court-500" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-black text-court-900">Pour participer</h2>
          <p className="mt-2 text-sm leading-6 text-ink-500">
            Vérifiez votre licence, votre niveau et vos disponibilités avant de vous proposer pour une équipe.
          </p>
        </Card>
      </div>

      <Card className="mt-4 p-6">
        <h2 className="text-2xl font-black text-court-900">Intéressé par les interclubs ?</h2>
        <p className="mt-3 max-w-3xl leading-7 text-ink-500">
          Indiquez votre niveau, vos disponibilités et vos tableaux préférés. Le club pourra vous orienter vers le bon créneau ou la bonne équipe.
        </p>
        <Link className="mt-5 inline-flex font-bold text-court-600 hover:text-court-900" href="/contact">
          Contacter le club
        </Link>
      </Card>
    </InfoPage>
  );
}
