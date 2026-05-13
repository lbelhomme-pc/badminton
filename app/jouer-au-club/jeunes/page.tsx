import { InfoPage } from "@/components/public/info-page";

export default function JeunesPage() {
  return (
    <InfoPage
      eyebrow="Jouer au club"
      title="Jeunes"
      intro="Les séances jeunes aident à découvrir le badminton, progresser techniquement et prendre plaisir à jouer en groupe."
      cards={[
        { title: "Apprentissage", text: "Tenue de raquette, service, déplacements, règles et premiers matchs." },
        { title: "Progression", text: "Séances par niveau avec exercices courts, variés et adaptés." },
        { title: "Vie de groupe", text: "Respect, autonomie, esprit d’équipe et découverte de la compétition si souhaité." }
      ]}
    />
  );
}
