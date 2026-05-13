import { InfoPage } from "@/components/public/info-page";

export default function EncadrantsPage() {
  return (
    <InfoPage
      eyebrow="Le club"
      title="Encadrants et responsables de séances"
      intro="Les encadrants accompagnent les jeunes, les adultes débutants et les compétiteurs avec des objectifs adaptés à chaque public."
      cards={[
        { title: "Jeunes", text: "Apprentissage technique, motricité, règles du jeu et premiers matchs." },
        { title: "Adultes débutants", text: "Bases techniques, placements, service, sécurité et plaisir de jouer." },
        { title: "Compétition", text: "Intensité, tactique, doubles, préparation interclubs et suivi des équipes." }
      ]}
    />
  );
}
