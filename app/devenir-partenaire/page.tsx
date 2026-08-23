import type { Metadata } from "next";
import { CheckCircle2, FileText, Handshake, ShieldCheck } from "lucide-react";
import { InfoPage } from "@/components/public/info-page";
import { RequestForm } from "@/components/public/request-form";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Devenir partenaire - CFVV",
  description: "Parcours de demande de partenariat pour soutenir le Club des fous du Volants Vendômois."
};

const steps = [
  {
    icon: FileText,
    title: "Présenter la structure",
    text: "Nom, activité, lien public, personne de contact générique et idée de soutien."
  },
  {
    icon: ShieldCheck,
    title: "Valider les données publiées",
    text: "Logo, description, lien et période de visibilité ne sont publiés qu'après accord explicite."
  },
  {
    icon: CheckCircle2,
    title: "Confirmer avec le bureau",
    text: "Le bureau vérifie la cohérence avec le projet associatif et les besoins réels du club."
  }
];

export default function DevenirPartenairePage() {
  return (
    <InfoPage
      contentKey="/devenir-partenaire"
      eyebrow="Partenariat"
      title="Devenir partenaire du CFVV"
      intro="Le partenariat doit rester simple, transparent et utile au club. Ce formulaire ne crée aucun engagement automatique : il permet seulement au bureau de reprendre contact."
      cards={[]}
    >
      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="grid gap-4">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <Card key={step.title} className="p-5">
                <Icon className="h-6 w-6 text-court-500" aria-hidden="true" />
                <h2 className="mt-4 text-xl font-black text-court-900">{step.title}</h2>
                <p className="mt-2 text-sm leading-6 text-ink-600">{step.text}</p>
              </Card>
            );
          })}
          <Card className="p-5">
            <Handshake className="h-6 w-6 text-court-500" aria-hidden="true" />
            <h2 className="mt-4 text-xl font-black text-court-900">Consentement RGPD</h2>
            <p className="mt-2 text-sm leading-6 text-ink-600">
              Les informations envoyées servent uniquement à traiter la demande de partenariat. Les éléments publics devront être validés avant
              publication.
            </p>
          </Card>
        </div>

        <RequestForm
          title="Proposer un partenariat"
          defaultType="Partenariat"
          messagePlaceholder="Présentez votre structure, le type de soutien envisagé, les éléments que vous acceptez de rendre publics et la personne à recontacter."
        />
      </div>
    </InfoPage>
  );
}
