import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck, Handshake, Mail, Megaphone, Phone, ShieldCheck, UserRound, WalletCards } from "lucide-react";
import { InfoPage } from "@/components/public/info-page";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getPublicClubSettings } from "@/services/club.service";

export const metadata: Metadata = {
  title: "Le Bureau - CFVV",
  description: "Fonctions, responsabilités et contacts génériques du bureau du CFVV."
};

const iconsByKey = {
  presidence: ShieldCheck,
  "vice-presidence": Handshake,
  tresorerie: WalletCards,
  secretariat: Mail,
  creneaux: CalendarCheck,
  communication: Megaphone,
  contact: Mail,
  benevoles: Handshake
};

export default async function BureauBenevolesPage() {
  const settings = await getPublicClubSettings();

  return (
    <InfoPage
      eyebrow="Le Bureau"
      title="Les bénévoles qui font vivre le club"
      intro="Le bureau organise les créneaux, les inscriptions, les événements et la communication. Les contacts personnels ne sont affichés que s'ils sont validés par le club."
      cards={[]}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {settings.bureau.map((member) => {
          const Icon = iconsByKey[member.key as keyof typeof iconsByKey] ?? Handshake;

          return (
            <Card key={member.key} className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-court-200 bg-court-50 text-court-600">
                  {member.photoUrl ? (
                    <img src={member.photoUrl} alt={member.photoAlt || `Portrait de ${member.name}`} className="h-full w-full object-cover" />
                  ) : (
                    <UserRound className="h-11 w-11" aria-hidden="true" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-court-100 text-court-600">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <p className="mt-4 font-display text-sm font-bold uppercase text-court-600">{member.role}</p>
                  <h2 className="mt-2 text-2xl font-black text-court-900">{member.name}</h2>
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-ink-600">{member.mission}</p>
              {member.email || member.phone ? (
                <div className="mt-4 grid gap-1 text-sm font-bold text-court-800">
                  {member.email ? (
                    <a href={`mailto:${member.email}`} className="inline-flex items-center gap-2 hover:text-court-900">
                      <Mail className="h-4 w-4" aria-hidden="true" />
                      {member.email}
                    </a>
                  ) : null}
                  {member.phone ? (
                    <a href={`tel:${member.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-2 hover:text-court-900">
                      <Phone className="h-4 w-4" aria-hidden="true" />
                      {member.phone}
                    </a>
                  ) : null}
                </div>
              ) : (
                <p className="mt-4 rounded-lg bg-court-50 px-3 py-2 text-sm font-semibold text-ink-600">
                  Contact via le formulaire du club.
                </p>
              )}
            </Card>
          );
        })}
      </div>

      <Card className="mt-6 p-6">
        <h2 className="text-2xl font-black text-court-900">Commissions et coups de main ponctuels</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-ink-600">
          Le bénévolat peut être simple et limité dans le temps : accueil des nouveaux, tournoi, buvette, rangement, communication ou relais
          d'information. Le site évite d'exposer des coordonnées privées inutiles.
        </p>
        <Link href="/contact" className="mt-5 inline-flex">
          <Button variant="outline">Proposer mon aide</Button>
        </Link>
      </Card>
    </InfoPage>
  );
}
