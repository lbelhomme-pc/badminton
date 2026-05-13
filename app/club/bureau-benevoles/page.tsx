import { InfoPage } from "@/components/public/info-page";

export default function BureauBenevolesPage() {
  return (
    <InfoPage
      eyebrow="Le club"
      title="Bureau et bénévoles"
      intro="Le club fonctionne grâce aux responsables et aux bénévoles qui donnent du temps pour les créneaux, les inscriptions et les événements."
      cards={[
        { title: "Bureau", text: "Présidence, trésorerie, secrétariat et coordination générale du club." },
        { title: "Responsables de créneaux", text: "Présence, accueil, suivi des inscrits et remontée des informations importantes." },
        { title: "Bénévoles événements", text: "Aide ponctuelle pour les tournois, stages, buvette, installation et communication." }
      ]}
    />
  );
}
