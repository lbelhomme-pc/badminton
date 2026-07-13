import Link from "next/link";
import type { Metadata } from "next";
import { Building2, Handshake, Megaphone, ShieldCheck } from "lucide-react";
import { InfoPage } from "@/components/public/info-page";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { canonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Partenaires - CFVV",
  description: "Partenaires, collectivités et structures locales qui soutiennent le CFVV.",
  alternates: canonical("/vie-du-club/partenaires")
};

const partnershipBenefits = [
  {
    icon: Megaphone,
    title: "Visibilité locale",
    text: "Logo et mention sur les supports validés par le club, selon le niveau de partenariat."
  },
  {
    icon: Building2,
    title: "Ancrage vendômois",
    text: "Soutien à une association sportive locale ouverte aux jeunes, adultes, loisirs et compétiteurs."
  },
  {
    icon: ShieldCheck,
    title: "Cadre clair",
    text: "Publication après validation du bureau, consentement RGPD et période de visibilité définie si nécessaire."
  }
];

export default function PartenairesPage() {
  return (
    <InfoPage
      eyebrow="Partenaires"
      title="Soutenir le badminton local"
      intro="Cette page présentera les partenaires existants du CFVV dès que les logos, descriptions, niveaux de partenariat et périodes de visibilité seront validés."
      cards={[]}
    >
      <EmptyState
        title="Aucun partenaire publié pour le moment"
        text="Le club doit encore confirmer les partenaires à afficher, les logos autorisés, les liens publics et les textes alternatifs."
        action={
          <Link href="/devenir-partenaire">
            <Button>Devenir partenaire</Button>
          </Link>
        }
      />

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {partnershipBenefits.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="p-5">
              <Icon className="h-6 w-6 text-court-500" aria-hidden="true" />
              <h2 className="mt-4 text-xl font-black text-court-900">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-ink-600">{item.text}</p>
            </Card>
          );
        })}
      </div>

      <Card className="mt-6 p-6">
        <Handshake className="h-7 w-7 text-court-500" aria-hidden="true" />
        <h2 className="mt-4 text-2xl font-black text-court-900">Parcours partenaire</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-ink-600">
          Une structure intéressée peut présenter son activité, son idée de soutien et les informations qu'elle accepte de publier. Le bureau valide
          ensuite ce qui peut être affiché sur le site.
        </p>
        <Link href="/devenir-partenaire" className="mt-5 inline-flex">
          <Button variant="outline">Ouvrir le parcours partenaire</Button>
        </Link>
      </Card>
    </InfoPage>
  );
}
