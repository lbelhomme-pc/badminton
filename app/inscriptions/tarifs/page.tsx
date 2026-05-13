import { CheckCircle2 } from "lucide-react";
import { InfoPage } from "@/components/public/info-page";
import { Card } from "@/components/ui/card";

export default function TarifsPage() {
  return (
    <InfoPage
      eyebrow="Inscriptions"
      title="Tarifs"
      intro="Les tarifs de saison sont confirmés chaque année par le bureau du CFVV41. La page officielle d’inscription fait foi pour le montant final."
      cards={[]}
    >
      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Jeunes", "École de badminton, créneaux encadrés et licence."],
          ["Adultes loisirs", "Accès aux créneaux de jeu libre adultes."],
          ["Compétition", "Licence adaptée aux tournois et interclubs."],
          ["Essai", "Jusqu’à 3 séances gratuites pour découvrir."]
        ].map(([title, text]) => (
          <Card key={title} className="p-5">
            <CheckCircle2 className="h-6 w-6 text-court-500" aria-hidden="true" />
            <h2 className="mt-4 text-lg font-black text-court-900">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-ink-500">{text}</p>
          </Card>
        ))}
      </div>
    </InfoPage>
  );
}
