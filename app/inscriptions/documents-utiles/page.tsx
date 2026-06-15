import Link from "next/link";
import { FileCheck2, HeartPulse, ShieldCheck, UserRoundCheck } from "lucide-react";
import { InfoPage } from "@/components/public/info-page";
import { Card } from "@/components/ui/card";

export default function DocumentsUtilesPage() {
  return (
    <InfoPage
      eyebrow="Inscriptions"
      title="Documents utiles"
      intro="Préparez les documents demandés avant de finaliser votre inscription ou celle de votre enfant. Les pièces exactes peuvent varier selon la saison et les règles FFBaD en vigueur."
      cards={[
        { title: "Règlement intérieur", text: "Règles de vie, accès aux créneaux, sécurité, annulations et respect du matériel." },
        { title: "Santé", text: "Questionnaire santé ou certificat médical selon votre situation et les règles fédérales en vigueur." },
        { title: "Mineurs", text: "Autorisation parentale et coordonnées du responsable légal si nécessaire." }
      ]}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <FileCheck2 className="h-6 w-6 text-court-500" aria-hidden="true" />
          <h2 className="mt-4 text-2xl font-black text-court-900">Checklist avant inscription</h2>
          <ul className="mt-4 grid gap-3 text-sm leading-6 text-ink-500">
            <li>Choisir la formule : adulte loisir, adulte compétiteur, enfant loisir ou enfant compétiteur.</li>
            <li>Vérifier le créneau adapté au niveau et à l'âge du joueur.</li>
            <li>Préparer les documents santé demandés par la fédération.</li>
            <li>Pour un mineur, prévoir les informations du responsable légal.</li>
            <li>Contacter le club si le lien d'inscription officiel n'est pas encore confirmé.</li>
          </ul>
        </Card>

        <Card className="p-6">
          <ShieldCheck className="h-6 w-6 text-info" aria-hidden="true" />
          <h2 className="mt-4 text-2xl font-black text-court-900">À valider par le bureau</h2>
          <div className="mt-4 grid gap-3 text-sm leading-6 text-ink-500">
            <p className="flex gap-2">
              <HeartPulse className="mt-0.5 h-4 w-4 shrink-0 text-court-500" aria-hidden="true" />
              Les règles médicales applicables à la saison en cours.
            </p>
            <p className="flex gap-2">
              <UserRoundCheck className="mt-0.5 h-4 w-4 shrink-0 text-court-500" aria-hidden="true" />
              L'âge minimum d'accueil des jeunes et les groupes disponibles.
            </p>
            <p className="rounded-lg bg-court-50 px-4 py-3">
              Si vous avez un doute, utilisez le formulaire de contact avant de créer ou finaliser l'inscription.
            </p>
          </div>
          <Link className="mt-5 inline-flex font-bold text-court-600 hover:text-court-900" href="/contact">
            Poser une question au club
          </Link>
        </Card>
      </div>
    </InfoPage>
  );
}
