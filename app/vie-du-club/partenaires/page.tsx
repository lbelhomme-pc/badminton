import Link from "next/link";
import type { Metadata } from "next";
import { Building2, Handshake, Megaphone, UsersRound } from "lucide-react";
import { InfoPage } from "@/components/public/info-page";
import { Card } from "@/components/ui/card";
import { canonical } from "@/lib/seo";
import { getPublicClubSettings } from "@/services/club.service";

export const metadata: Metadata = {
  title: "Partenaires et collectivités - CF2V41",
  description: "Informations pour les partenaires, collectivités et structures locales qui souhaitent échanger avec le CF2V41.",
  alternates: canonical("/vie-du-club/partenaires")
};

export default async function PartenairesPage() {
  const settings = await getPublicClubSettings();

  return (
    <InfoPage
      eyebrow="Vie du club"
      title="Partenaires et collectivités"
      intro="Le CF2V41 est un club associatif local. Entreprises, collectivités et structures sportives peuvent échanger avec le bureau pour soutenir la pratique du badminton à Vendôme."
      cards={[
        { title: "Soutien local", text: "Aide matérielle, visibilité, lots pour événements ou accompagnement d'une action club." },
        { title: "Collectivités", text: "Échanges autour des équipements, des créneaux, des jeunes et de la pratique sportive locale." },
        { title: "Actions communes", text: "Découverte du badminton, animations ponctuelles ou relais d'information selon les possibilités du club." }
      ]}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="p-5">
          <Handshake className="h-6 w-6 text-court-500" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-black text-court-900">Devenir partenaire</h2>
          <p className="mt-2 text-sm leading-6 text-ink-500">
            Les modalités sont à définir avec le bureau selon la saison, les besoins et les possibilités de chacun.
          </p>
        </Card>
        <Card className="p-5">
          <Building2 className="h-6 w-6 text-court-500" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-black text-court-900">Collectivité</h2>
          <p className="mt-2 text-sm leading-6 text-ink-500">
            Le club peut centraliser les demandes liées au gymnase, aux actions jeunes ou à la vie sportive locale.
          </p>
        </Card>
        <Card className="p-5">
          <Megaphone className="h-6 w-6 text-court-500" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-black text-court-900">Visibilité</h2>
          <p className="mt-2 text-sm leading-6 text-ink-500">
            Logos, mentions ou supports de communication doivent être validés par le bureau avant publication.
          </p>
        </Card>
        <Card className="p-5">
          <UsersRound className="h-6 w-6 text-court-500" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-black text-court-900">Bénévolat</h2>
          <p className="mt-2 text-sm leading-6 text-ink-500">
            Un coup de main ponctuel peut aussi aider : événement, installation, accueil ou relais d'information.
          </p>
        </Card>
      </div>

      <Card className="mt-4 p-6">
        <h2 className="text-2xl font-black text-court-900">Contacter le bureau</h2>
        <p className="mt-3 max-w-3xl leading-7 text-ink-500">
          Présentez simplement votre structure, votre idée et vos coordonnées. Le club reviendra vers vous pour confirmer
          ce qui est possible sans engager d'information non validée publiquement.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/contact"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-court-500 px-5 font-semibold text-white shadow-soft transition hover:bg-court-600"
          >
            Envoyer une demande
          </Link>
          {settings.contact.email ? (
            <Link
              href={`mailto:${settings.contact.email}`}
              className="inline-flex h-12 items-center justify-center rounded-lg border border-court-200 bg-white px-5 font-semibold text-court-900 transition hover:bg-court-50"
            >
              {settings.contact.email}
            </Link>
          ) : null}
        </div>
      </Card>
    </InfoPage>
  );
}
