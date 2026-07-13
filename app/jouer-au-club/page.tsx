import type { Metadata } from "next";
import { InfoPage } from "@/components/public/info-page";

export const metadata: Metadata = {
  title: "Jouer au club - CFVV",
  description: "Créneaux jeunes, adultes débutants, loisirs et compétition au CFVV."
};

export default function JouerAuClubPage() {
  return (
    <InfoPage
      eyebrow="Jouer au club"
      title="Trouver le bon créneau pour jouer au CFVV"
      intro="La rubrique regroupe les créneaux et les parcours de jeu selon l'âge, le niveau et l'envie de compétition."
      cards={[
        { title: "Créneaux", text: "Consulter le planning et réserver une place.", href: "/jouer-au-club/creneaux" },
        { title: "Jeunes", text: "École de badminton et séances adaptées.", href: "/jouer-au-club/jeunes" },
        { title: "Adultes débutants", text: "Découvrir le badminton dans un cadre rassurant.", href: "/jouer-au-club/adultes-debutants" },
        { title: "Loisirs", text: "Jouer régulièrement dans une ambiance conviviale.", href: "/jouer-au-club/loisirs" },
        { title: "Compétition", text: "Interclubs, entraînements ciblés et progression.", href: "/jouer-au-club/competition" }
      ]}
    />
  );
}
