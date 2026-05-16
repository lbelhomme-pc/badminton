import { InfoPage } from "@/components/public/info-page";
import { TarifsList } from "@/components/public/tarifs-list";

export default function TarifsPage() {
  return (
    <InfoPage
      eyebrow="Inscriptions"
      title="Tarifs"
      intro="Les tarifs de saison sont confirmés chaque année par le bureau du CFVV41. La page officielle d’inscription fait foi pour le montant final."
      cards={[]}
    >
      <TarifsList />
    </InfoPage>
  );
}
