import { InfoPage } from "@/components/public/info-page";
import { RegistrationCta } from "@/components/public/registration-cta";
import { TarifsList } from "@/components/public/tarifs-list";

export default function TarifsPage() {
  return (
    <InfoPage
      eyebrow="Inscriptions"
      title="Tarifs"
      intro="Les tarifs de saison sont confirmés chaque année par le bureau du CF2V41. Les consignes du club et le lien d'inscription validé font foi pour le montant final."
      cards={[]}
    >
      <TarifsList />
      <RegistrationCta
        className="mt-8"
        title="Après avoir vérifié le tarif"
        intro="Choisis la formule qui correspond à ton profil, puis demande un essai ou ouvre le parcours d'inscription pour finaliser avec le club."
      />
    </InfoPage>
  );
}
