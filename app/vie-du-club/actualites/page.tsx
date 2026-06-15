import type { Metadata } from "next";
import { InfoPage } from "@/components/public/info-page";
import { ActualitesList } from "@/components/public/actualites-list";
import { canonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Actualités - CF2V41",
  description: "Actualités et annonces du Club des fous du Volant Vendômois.",
  alternates: canonical("/vie-du-club/actualites")
};

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
