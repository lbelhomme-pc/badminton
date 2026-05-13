import { CalendarCheck, Handshake, Mail, Megaphone, ShieldCheck, WalletCards } from "lucide-react";
import { InfoPage } from "@/components/public/info-page";
import { Card } from "@/components/ui/card";

const bureau = [
  {
    role: "Présidence",
    name: "À renseigner",
    mission: "Coordination générale du club, relations avec les partenaires, la mairie et les instances sportives.",
    icon: ShieldCheck
  },
  {
    role: "Trésorerie",
    name: "À renseigner",
    mission: "Suivi du budget, cotisations, commandes et dépenses liées au fonctionnement du club.",
    icon: WalletCards
  },
  {
    role: "Secrétariat",
    name: "À renseigner",
    mission: "Inscriptions, licences, documents administratifs et communication avec les adhérents.",
    icon: Mail
  },
  {
    role: "Responsables créneaux",
    name: "Bureau CFVV41",
    mission: "Accueil des joueurs, suivi des présences, annulations exceptionnelles et organisation des terrains.",
    icon: CalendarCheck
  },
  {
    role: "Communication",
    name: "À renseigner",
    mission: "Actualités, événements, informations de dernière minute et mise à jour du site.",
    icon: Megaphone
  },
  {
    role: "Bénévoles",
    name: "Tous les coups de main comptent",
    mission: "Tournois, stages, buvette, installation, rangement et accueil des nouveaux joueurs.",
    icon: Handshake
  }
];

export default function BureauBenevolesPage() {
  return (
    <InfoPage
      eyebrow="Le club"
      title="Bureau et bénévoles"
      intro="Le CFVV41 fonctionne grâce à une équipe de bénévoles qui organise les créneaux, accompagne les inscriptions et fait vivre les événements du club."
      cards={[]}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {bureau.map((member) => {
          const Icon = member.icon;

          return (
            <Card key={member.role} className="p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-court-100 text-court-600">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-court-600">{member.role}</p>
              <h2 className="mt-2 text-2xl font-black text-court-900">{member.name}</h2>
              <p className="mt-3 text-sm leading-6 text-ink-500">{member.mission}</p>
            </Card>
          );
        })}
      </div>

      <Card className="mt-6 p-6">
        <h2 className="text-2xl font-black text-court-900">Envie d'aider le club ?</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-ink-500">
          Le bénévolat peut être ponctuel : tenir une table, aider sur un tournoi, accueillir les débutants ou relayer
          une information. Quelques minutes au bon moment peuvent vraiment simplifier la vie du club.
        </p>
      </Card>
    </InfoPage>
  );
}
