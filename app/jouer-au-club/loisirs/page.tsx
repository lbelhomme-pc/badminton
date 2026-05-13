import { InfoPage } from "@/components/public/info-page";

export default function LoisirsPage() {
  return (
    <InfoPage
      eyebrow="Jouer au club"
      title="Loisirs"
      intro="Les créneaux loisirs sont faits pour jouer régulièrement, rencontrer du monde et garder un bon rythme sportif."
      cards={[
        { title: "Jeu libre", text: "Des créneaux ouverts pour varier les partenaires et les formats de jeu.", href: "/reservations/creneaux" },
        { title: "Tous niveaux", text: "Chaque séance indique le public et le niveau conseillé pour mieux choisir." },
        { title: "Convivialité", text: "Le club reste un lieu simple, direct et sympa pour jouer après le travail ou le week-end." }
      ]}
    />
  );
}
