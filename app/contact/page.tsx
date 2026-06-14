import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Mail, Phone } from "lucide-react";
import { InfoPage } from "@/components/public/info-page";
import { RequestForm } from "@/components/public/request-form";
import { Card } from "@/components/ui/card";
import { getPublicClubSettings } from "@/services/club.service";

export const metadata: Metadata = {
  title: "Contact - CF2V41",
  description: "Contacter le Club des fous du Volant Vendômois."
};

export default async function ContactPage() {
  const settings = await getPublicClubSettings();
  const hasContact = Boolean(settings.contact.email || settings.contact.phone || settings.contact.facebookUrl || settings.contact.instagramUrl);

  return (
    <InfoPage
      eyebrow="Contact"
      title={`Contacter le ${settings.club.name}`}
      intro="Une question sur l'inscription, une séance d'essai, une réservation, les volants ou la compétition ? Envoyez votre demande au club."
      cards={[]}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <RequestForm title="Envoyer un message" defaultType="Inscription" messagePlaceholder="Décrivez votre demande en quelques lignes." />
        <Card className="p-5">
          <Mail className="h-6 w-6 text-info" aria-hidden="true" />
          <h2 className="mt-4 text-2xl font-black text-court-900">Contact direct</h2>
          {hasContact ? (
            <div className="mt-4 grid gap-3 text-sm font-semibold text-ink-500">
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
            <p className="mt-4 text-sm leading-6 text-ink-500">
              Les coordonnées directes seront affichées ici dès qu'elles seront renseignées dans l'administration.
            </p>
          )}

          <h2 className="mt-8 text-2xl font-black text-court-900">Demandes fréquentes</h2>
          <div className="mt-4 grid gap-3 text-sm text-ink-500">
            <p>Inscription ou séance d'essai</p>
            <p>Problème de réservation</p>
            <p>Achat ou retrait de volants</p>
            <p>Compétition et interclubs</p>
          </div>
        </Card>
      </div>
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
