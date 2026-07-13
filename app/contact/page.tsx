import type { Metadata } from "next";
import Link from "next/link";
import { Clock, ExternalLink, Mail, MapPin, Phone } from "lucide-react";
import { InfoPage } from "@/components/public/info-page";
import { RegistrationCta } from "@/components/public/registration-cta";
import { RequestForm } from "@/components/public/request-form";
import { Card } from "@/components/ui/card";
import { canonical } from "@/lib/seo";
import { getPublicClubSettings, getVenues } from "@/services/club.service";

export const metadata: Metadata = {
  title: "Contact - CFVV",
  description: "Contacter le Club des Fous du Volant du Vendômois.",
  alternates: canonical("/contact")
};

export default async function ContactPage() {
  const settings = await getPublicClubSettings();
  const venues = getVenues();
  const mainVenue = venues[0];
  const hasContact = Boolean(settings.contact.email || settings.contact.phone || settings.contact.facebookUrl || settings.contact.instagramUrl);

  return (
    <InfoPage
      eyebrow="Contact"
      title="Contacter le club"
      intro="Une question sur une inscription, une séance d'essai, un créneau, les volants, la compétition ou un partenariat ? Envoyez une demande au CFVV."
      cards={[]}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <RequestForm title="Envoyer un message" defaultType="Inscription" messagePlaceholder="Décrivez votre demande en quelques lignes." />

        <div className="grid gap-4">
          <Card className="p-5">
            <Mail className="h-6 w-6 text-court-500" aria-hidden="true" />
            <h2 className="mt-4 text-2xl font-black text-court-900">Coordonnées génériques</h2>
            {hasContact ? (
              <div className="mt-4 grid gap-3 text-sm font-semibold text-ink-600">
                {settings.contact.email ? (
                  <Link href={`mailto:${settings.contact.email}`} className="inline-flex items-center gap-2 hover:text-court-900">
                    <Mail className="h-4 w-4" aria-hidden="true" />
                    {settings.contact.email}
                  </Link>
                ) : null}
                {settings.contact.phone ? (
                  <Link href={`tel:${settings.contact.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-2 hover:text-court-900">
                    <Phone className="h-4 w-4" aria-hidden="true" />
                    {settings.contact.phone}
                  </Link>
                ) : null}
                {settings.contact.facebookUrl ? <SocialLink href={settings.contact.facebookUrl} label="Facebook du club" /> : null}
                {settings.contact.instagramUrl ? <SocialLink href={settings.contact.instagramUrl} label="Instagram du club" /> : null}
              </div>
            ) : (
              <p className="mt-4 text-sm leading-6 text-ink-600">
                Les coordonnées directes seront affichées ici dès qu'elles seront renseignées dans l'administration.
              </p>
            )}
          </Card>

          <Card className="p-5">
            <Clock className="h-6 w-6 text-court-500" aria-hidden="true" />
            <h2 className="mt-4 text-2xl font-black text-court-900">Délai de réponse</h2>
            <p className="mt-3 text-sm leading-6 text-ink-600">
              Le club est géré par des bénévoles. Une réponse rapide est recherchée, mais le délai peut varier selon la période sportive.
            </p>
          </Card>

          <Card className="p-5">
            <MapPin className="h-6 w-6 text-court-500" aria-hidden="true" />
            <h2 className="mt-4 text-2xl font-black text-court-900">Accès</h2>
            {mainVenue ? (
              <div className="mt-3 text-sm leading-6 text-ink-600">
                <p className="font-bold text-court-900">{mainVenue.name}</p>
                <p>{mainVenue.address}</p>
                <p>
                  {mainVenue.postalCode} {mainVenue.city}
                </p>
              </div>
            ) : (
              <p className="mt-3 text-sm leading-6 text-ink-600">Le lieu sera affiché ici dès validation.</p>
            )}
            <Link href="/club/gymnases-acces" className="mt-4 inline-flex font-display text-sm font-bold text-court-600 hover:underline">
              Voir les informations d'accès
            </Link>
          </Card>
        </div>
      </div>

      <RegistrationCta
        className="mt-8"
        compact
        showOfficialLink={false}
        title="Vous venez pour une inscription ou un essai ?"
        intro="Le plus simple est de consulter les créneaux et le parcours d'inscription avant d'envoyer votre demande."
      />
    </InfoPage>
  );
}

function SocialLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-court-900">
      <ExternalLink className="h-4 w-4" aria-hidden="true" />
      {label}
    </Link>
  );
}
