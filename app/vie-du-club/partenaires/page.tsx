import Link from "next/link";
import type { Metadata } from "next";
import { Building2, ExternalLink, Handshake, Megaphone } from "lucide-react";
import { InfoPage } from "@/components/public/info-page";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { canonical } from "@/lib/seo";
import { getPublicClubSettings, type PublicPartner } from "@/services/club.service";

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
  }
];

function isSafeDisplayUrl(value: string | null | undefined) {
  if (!value) return false;
  if (value.startsWith("/") && !value.startsWith("//")) return true;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export default async function PartenairesPage() {
  const settings = await getPublicClubSettings();

  return (
    <InfoPage
      eyebrow="Partenaires"
      title="Soutenir le badminton local"
      intro="Les partenaires affichés ici proviennent des paramètres publics du site. Le bureau peut les publier, modifier ou retirer sans changer le code."
      cards={[]}
    >
      {settings.partners.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {settings.partners.map((partner) => (
            <PartnerCard key={partner.id} partner={partner} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Aucun partenaire publié pour le moment"
          text="Le club doit encore confirmer les partenaires à afficher, les logos autorisés, les liens publics et les textes alternatifs."
          action={
            <Link href="/devenir-partenaire">
              <Button>Devenir partenaire</Button>
            </Link>
          }
        />
      )}

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

function PartnerCard({ partner }: { partner: PublicPartner }) {
  return (
    <Card className="p-5">
      <div className="flex min-h-24 items-center justify-center rounded-lg bg-court-50 p-4">
        {isSafeDisplayUrl(partner.logoUrl) ? (
          <img src={partner.logoUrl} alt={partner.altText} className="max-h-16 w-auto object-contain" />
        ) : (
          <span className="font-display text-2xl font-black uppercase text-court-700">{partner.name}</span>
        )}
      </div>
      <p className="mt-4 font-display text-sm font-black uppercase text-court-600">{partner.level}</p>
      <h2 className="mt-1 text-2xl font-black text-court-900">{partner.name}</h2>
      {partner.description ? <p className="mt-2 text-sm leading-6 text-ink-600">{partner.description}</p> : null}
      {isSafeDisplayUrl(partner.websiteUrl) ? (
        <a
          href={partner.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 font-display text-sm font-black text-court-600 hover:text-court-900 hover:underline"
        >
          Voir le site
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </a>
      ) : null}
    </Card>
  );
}
