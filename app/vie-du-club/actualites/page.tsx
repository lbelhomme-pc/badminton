import { InfoPage } from "@/components/public/info-page";
import { ActualitesList } from "@/components/public/actualites-list";

export default function ActualitesPage() {
  return (
    <InfoPage
      eyebrow="Vie du club"
      title="Actualités"
      intro="Les dernières informations utiles du club : planning, bénévoles, événements et annonces."
      cards={[]}
    >
      <ActualitesList />
    </InfoPage>
  );
}
