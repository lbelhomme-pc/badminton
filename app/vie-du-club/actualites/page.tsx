import { InfoPage } from "@/components/public/info-page";
import { news } from "@/lib/mock-data";

export default function ActualitesPage() {
  return (
    <InfoPage
      eyebrow="Vie du club"
      title="Actualités"
      intro="Les dernières informations utiles du club : planning, bénévoles, événements et annonces."
      cards={news.map((post) => ({
        title: post.title,
        text: post.excerpt
      }))}
    />
  );
}
