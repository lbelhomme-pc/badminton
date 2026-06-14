import { InfoPage } from "@/components/public/info-page";

export default function ConfidentialitePage() {
  return (
    <InfoPage
      eyebrow="RGPD"
      title="Confidentialité"
      intro="Le site du CF2V41 limite les données collectées aux informations nécessaires à la vie du club, aux demandes de contact et aux réservations."
      cards={[
        { title: "Données limitées", text: "Profil, réservations, commandes de volants et préférences d'affichage." },
        { title: "Consentement", text: "L'affichage des noms dans les réservations dépend du choix de l'adhérent." },
        { title: "Sécurité", text: "Les espaces adhérents et responsables sont protégés par des droits d'accès adaptés." }
      ]}
    />
  );
}
