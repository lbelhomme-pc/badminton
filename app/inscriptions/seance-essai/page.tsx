import type { Metadata } from "next";
import { ClubPhoto } from "@/components/public/club-photo";
import { InfoPage } from "@/components/public/info-page";
import { RequestForm } from "@/components/public/request-form";
import { clubPhotoSlots, hasClubPhoto } from "@/lib/club-photos";
import { canonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "SÃ©ance d'essai - CFVV",
  description: "Demander une sÃ©ance d'essai gratuite au Club des fous du Volant VendÃ´mois.",
  alternates: canonical("/inscriptions/seance-essai")
};

export default function SeanceEssaiPage() {
  const trialPhoto = clubPhotoSlots.trialSession;

  return (
    <InfoPage
      eyebrow="Inscriptions"
      title="SÃ©ance d'essai"
      intro="Le CFVV propose jusqu'Ã  3 sÃ©ances d'essai gratuites pour dÃ©couvrir le club, le gymnase, l'ambiance et le bon crÃ©neau selon votre profil."
      cards={[
        { title: "Pour qui ?", text: "Jeunes, adultes dÃ©butants, joueurs loisirs ou personnes qui arrivent dans la rÃ©gion." },
        { title: "MatÃ©riel", text: "Tenue sportive, chaussures propres et raquette si possible. Le club peut aider Ã  dÃ©panner pour une premiÃ¨re sÃ©ance." },
        { title: "OÃ¹ ?", text: "Gymnase des Aigremonts, 554 Rue de la Chappe, 41100 VendÃ´me.", href: "/club/gymnases-acces" }
      ]}
    >
      <div className="space-y-6">
        {hasClubPhoto(trialPhoto) ? <ClubPhoto slot={trialPhoto} className="h-64 w-full md:h-96" /> : null}
        <RequestForm
          title="Demander un essai"
          defaultType="SÃ©ance d'essai"
          messagePlaceholder="Indiquez l'Ã¢ge du joueur, son niveau approximatif et les crÃ©neaux qui vous arrangent."
        />
      </div>
    </InfoPage>
  );
}
