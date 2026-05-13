import { InfoPage } from "@/components/public/info-page";

export default function PresentationPage() {
  return (
    <InfoPage
      eyebrow="Le club"
      title="Un club vendômois pour jouer, progresser et partager"
      intro="Le CFVV41 accueille les débutants, les loisirs, les jeunes et les compétiteurs avec une organisation simple et lisible."
      cards={[
        { title: "Convivialité", text: "Des créneaux pensés pour jouer avec plaisir, rencontrer d’autres adhérents et s’intégrer vite." },
        { title: "Progression", text: "Des séances adaptées aux niveaux, avec un cadre clair pour apprendre et se challenger." },
        { title: "Vie associative", text: "Tournois internes, interclubs, bénévolat et événements rythment la saison." }
      ]}
    />
  );
}
