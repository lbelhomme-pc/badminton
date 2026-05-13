import { InfoPage } from "@/components/public/info-page";

export default function TournoisPage() {
  return (
    <InfoPage
      eyebrow="Vie du club"
      title="Tournois"
      intro="Tournois internes, sorties compétition et informations pratiques pour les joueuses et joueurs motivés."
      cards={[
        { title: "Tournois internes", text: "Formats conviviaux, doubles surprises et animations club." },
        { title: "Tournois officiels", text: "Liens utiles, calendrier et conseils pour s’inscrire." },
        { title: "Bénévoles", text: "Aide à l’organisation, installation, accueil et buvette." }
      ]}
    />
  );
}
