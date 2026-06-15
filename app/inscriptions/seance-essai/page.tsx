import type { Metadata } from "next";
import { InfoPage } from "@/components/public/info-page";
import { RequestForm } from "@/components/public/request-form";
import { canonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Séance d'essai - CF2V41",
  description: "Demander une séance d'essai gratuite au Club des fous du Volant Vendômois.",
  alternates: canonical("/inscriptions/seance-essai")
};

export default function SeanceEssaiPage() {
  return (
    <InfoPage
      eyebrow="Inscriptions"
      title="Séance d'essai"
      intro="Le CF2V41 propose jusqu'à 3 séances d'essai gratuites pour découvrir le club, le gymnase, l'ambiance et le bon créneau selon votre profil."
      cards={[
        { title: "Pour qui ?", text: "Jeunes, adultes débutants, joueurs loisirs ou personnes qui arrivent dans la région." },
        { title: "Matériel", text: "Tenue sportive, chaussures propres et raquette si possible. Le club peut aider à dépanner pour une première séance." },
        { title: "Où ?", text: "Gymnase des Aigremonts, 554 Rue de la Chappe, 41100 Vendôme.", href: "/club/gymnases-acces" }
      ]}
    >
      <RequestForm
        title="Demander un essai"
        defaultType="Séance d'essai"
        messagePlaceholder="Indiquez l'âge du joueur, son niveau approximatif et les créneaux qui vous arrangent."
      />
    </InfoPage>
  );
}
