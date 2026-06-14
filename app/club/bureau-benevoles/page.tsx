import { CalendarCheck, Handshake, Mail, Megaphone, ShieldCheck, WalletCards } from "lucide-react";
import { InfoPage } from "@/components/public/info-page";
import { Card } from "@/components/ui/card";
import { getPublicClubSettings } from "@/services/club.service";

const iconsByKey = {
  presidence: ShieldCheck,
  tresorerie: WalletCards,
  secretariat: Mail,
  creneaux: CalendarCheck,
  communication: Megaphone,
  benevoles: Handshake
};

export default async function BureauBenevolesPage() {
  const settings = await getPublicClubSettings();

  return (
    <InfoPage
      eyebrow="Le club"
      title="Bureau et bénévoles"
      intro="Le CF2V41 fonctionne grâce à une équipe de bénévoles qui organise les créneaux, accompagne les inscriptions et fait vivre les événements du club."
      cards={[]}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {settings.bureau.map((member) => {
          const Icon = iconsByKey[member.key as keyof typeof iconsByKey] ?? Handshake;

          return (
            <Card key={member.key} className="p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-court-100 text-court-600">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-court-600">{member.role}</p>
              <h2 className="mt-2 text-2xl font-black text-court-900">{member.name}</h2>
              <p className="mt-3 text-sm leading-6 text-ink-500">{member.mission}</p>
              {member.email || member.phone ? (
                <div className="mt-4 grid gap-1 text-sm font-semibold text-court-800">
                  {member.email ? <a href={`mailto:${member.email}`}>{member.email}</a> : null}
                  {member.phone ? <a href={`tel:${member.phone.replace(/\s/g, "")}`}>{member.phone}</a> : null}
                </div>
              ) : null}
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
