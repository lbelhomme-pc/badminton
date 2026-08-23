import { InfoPage } from "@/components/public/info-page";
import { RegistrationCta } from "@/components/public/registration-cta";
import { TarifsList } from "@/components/public/tarifs-list";

export default function TarifsPage() {
  return (
    <InfoPage
      contentKey="/inscriptions/tarifs"
      eyebrow="Inscriptions"
      title="Tarifs et inscriptions"
      intro="Les tarifs de saison doivent être confirmés chaque année par le bureau du CFVV. Les consignes du club et le lien d'inscription validé font foi pour le montant final."
      cards={[]}
    >
      <TarifsList />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Pièces nécessaires",
            text: "Les documents exacts dépendent de la saison, de la licence FFBaD et du profil du joueur. Ils doivent être confirmés par le club."
          },
          {
            title: "Procédure",
            text: "Consulter les créneaux, demander un essai si besoin, puis suivre le lien d'inscription officiel communiqué par le club."
          },
          {
            title: "Aides acceptées",
            text: "Pass'Sport, aides locales ou autres dispositifs sont à confirmer par le bureau avant paiement."
          }
        ].map((item) => (
          <div key={item.title} className="rounded-lg border border-court-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black text-court-900">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-ink-600">{item.text}</p>
          </div>
        ))}
      </div>
      <RegistrationCta
        className="mt-8"
        title="Après avoir vérifié le tarif"
        intro="Choisis la formule qui correspond à ton profil, puis demande un essai ou ouvre le parcours d'inscription pour finaliser avec le club."
      />
    </InfoPage>
  );
}
