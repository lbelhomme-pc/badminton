import { InfoPage } from "@/components/public/info-page";

export default function InterclubsPage() {
  return (
    <InfoPage
      eyebrow="Vie du club"
      title="Interclubs"
      intro="La rubrique interclubs présentera les équipes, les capitaines, les prochaines rencontres et les résultats."
      cards={[
        { title: "Équipe 1", text: "Objectif performance, rencontres régionales ou départementales selon la saison." },
        { title: "Équipe 2", text: "Compétition accessible, progression et esprit d’équipe." },
        { title: "Capitaines", text: "Convocations, compositions et informations de rencontre seront centralisées ici." }
      ]}
    />
  );
}
