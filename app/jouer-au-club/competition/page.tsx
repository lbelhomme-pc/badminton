import { InfoPage } from "@/components/public/info-page";

export default function CompetitionPage() {
  return (
    <InfoPage
      eyebrow="Jouer au club"
      title="Compétition"
      intro="Pour les joueurs qui veulent progresser, représenter le club et participer aux interclubs ou tournois."
      cards={[
        { title: "Interclubs", text: "Équipes, capitaines, rencontres et résultats.", href: "/vie-du-club/interclubs" },
        { title: "Créneaux dédiés", text: "Préparation tactique, double, intensité et objectifs de saison.", href: "/jouer-au-club/creneaux" },
        { title: "Classements", text: "Suivi des classements simples, doubles et mixtes.", href: "/classements" }
      ]}
    />
  );
}
