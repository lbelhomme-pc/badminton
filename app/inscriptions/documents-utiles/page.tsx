import { InfoPage } from "@/components/public/info-page";

export default function DocumentsUtilesPage() {
  return (
    <InfoPage
      eyebrow="Inscriptions"
      title="Documents utiles"
      intro="Préparez les documents demandés avant de finaliser votre inscription ou celle de votre enfant."
      cards={[
        { title: "Règlement intérieur", text: "Les règles de vie, d’accès aux créneaux et de sécurité." },
        { title: "Questionnaire santé", text: "Document utile selon les règles fédérales en vigueur." },
        { title: "Autorisation parentale", text: "Document nécessaire pour les jeunes selon les cas." }
      ]}
    />
  );
}
