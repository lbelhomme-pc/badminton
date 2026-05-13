import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { InfoPage } from "@/components/public/info-page";
import { RequestForm } from "@/components/public/request-form";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Contact - CFVV41",
  description: "Contacter le Club des fous du Volant Vendômois."
};

export default function ContactPage() {
  return (
    <InfoPage
      eyebrow="Contact"
      title="Contacter le CFVV41"
      intro="Une question sur l’inscription, une séance d’essai, une réservation, les volants ou la compétition ? Envoyez votre demande au club."
      cards={[]}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <RequestForm title="Envoyer un message" defaultType="Inscription" messagePlaceholder="Décrivez votre demande en quelques lignes." />
        <Card className="p-5">
          <Mail className="h-6 w-6 text-info" aria-hidden="true" />
          <h2 className="mt-4 text-2xl font-black text-court-900">Demandes fréquentes</h2>
          <div className="mt-4 grid gap-3 text-sm text-ink-500">
            <p>Inscription ou séance d’essai</p>
            <p>Problème de réservation</p>
            <p>Achat ou retrait de volants</p>
            <p>Compétition et interclubs</p>
          </div>
        </Card>
      </div>
    </InfoPage>
  );
}
