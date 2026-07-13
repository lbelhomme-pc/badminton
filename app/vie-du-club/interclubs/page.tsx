import Link from "next/link";
import { CalendarCheck, ClipboardList, UsersRound } from "lucide-react";
import { InfoPage } from "@/components/public/info-page";
import { Card } from "@/components/ui/card";

export default function InterclubsPage() {
  return (
    <InfoPage
      eyebrow="Vie du club"
      title="Interclubs"
      intro="Les interclubs permettent de reprÃ©senter le CFVV en Ã©quipe, dans une ambiance sportive et collective. Les Ã©quipes exactes, capitaines et calendriers sont Ã  confirmer par le club chaque saison."
      cards={[
        { title: "Ã‰quipes", text: "Composition, niveau et championnat seront prÃ©cisÃ©s quand la saison est connue." },
        { title: "Capitaines", text: "Les capitaines centralisent les convocations, disponibilitÃ©s et informations de rencontre." },
        { title: "RÃ©sultats", text: "Les rÃ©sultats et liens officiels pourront Ãªtre ajoutÃ©s au fil de la saison." }
      ]}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <UsersRound className="h-6 w-6 text-court-500" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-black text-court-900">Esprit d'Ã©quipe</h2>
          <p className="mt-2 text-sm leading-6 text-ink-500">
            Les interclubs demandent rÃ©gularitÃ©, communication et respect des disponibilitÃ©s annoncÃ©es.
          </p>
        </Card>
        <Card className="p-5">
          <CalendarCheck className="h-6 w-6 text-court-500" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-black text-court-900">Organisation</h2>
          <p className="mt-2 text-sm leading-6 text-ink-500">
            Les dates, dÃ©placements, convocations et lieux de rencontre seront relayÃ©s par les capitaines ou le bureau.
          </p>
        </Card>
        <Card className="p-5">
          <ClipboardList className="h-6 w-6 text-court-500" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-black text-court-900">Pour participer</h2>
          <p className="mt-2 text-sm leading-6 text-ink-500">
            VÃ©rifiez votre licence, votre niveau et vos disponibilitÃ©s avant de vous proposer pour une Ã©quipe.
          </p>
        </Card>
      </div>

      <Card className="mt-4 p-6">
        <h2 className="text-2xl font-black text-court-900">IntÃ©ressÃ© par les interclubs ?</h2>
        <p className="mt-3 max-w-3xl leading-7 text-ink-500">
          Indiquez votre niveau, vos disponibilitÃ©s et vos tableaux prÃ©fÃ©rÃ©s. Le club pourra vous orienter vers le bon crÃ©neau ou la bonne Ã©quipe.
        </p>
        <Link className="mt-5 inline-flex font-bold text-court-600 hover:text-court-900" href="/contact">
          Contacter le club
        </Link>
      </Card>
    </InfoPage>
  );
}
