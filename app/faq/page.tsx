import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/public/info-page";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "FAQ - CFVV41",
  description: "Questions fréquentes sur le club, les créneaux, les inscriptions et les réservations."
};

const faqItems = [
  {
    question: "Peut-on faire un essai ?",
    answer: "Oui, jusqu’à 3 séances d’essai sont possibles sur inscription préalable.",
    href: "/inscriptions/seance-essai",
    cta: "Demander un essai"
  },
  {
    question: "Le club accepte-t-il les débutants ?",
    answer: "Oui, des créneaux sont adaptés aux débutants adultes et aux jeunes.",
    href: "/jouer-au-club/adultes-debutants",
    cta: "Voir les débutants"
  },
  {
    question: "À partir de quel âge ?",
    answer: "Les créneaux jeunes indiqués commencent à 7 ans, avec des groupes 7-11 ans et 11-17 ans."
  },
  {
    question: "Faut-il une raquette ?",
    answer: "Pour une séance d’essai, le club peut aider à dépanner si vous n’avez pas encore de raquette."
  },
  {
    question: "Faut-il acheter des volants ?",
    answer: "Les volants plumes peuvent être achetés auprès du club. Les usages plastique/plumes dépendent du créneau et du niveau.",
    href: "/reservations/volants",
    cta: "Voir les volants"
  },
  {
    question: "Où joue-t-on ?",
    answer: "Le club joue au Gymnase des Aigremonts, 554 Rue de la Chappe, 41100 Vendôme, avec stationnement à proximité.",
    href: "/club/gymnases-acces",
    cta: "Voir l’accès"
  },
  {
    question: "Quels sont les horaires ?",
    answer: "Les horaires sont consultables dans le planning : mardi soir, mercredi parents/enfants, jeudi jeunes puis adultes, vendredi sur réservation.",
    href: "/jouer-au-club/creneaux",
    cta: "Voir le planning"
  },
  {
    question: "Combien coûte l’inscription ?",
    answer: "Les tarifs sont détaillés sur la page Tarifs. La page officielle d’inscription du club fait foi pour les montants de saison.",
    href: "/inscriptions/tarifs",
    cta: "Voir les tarifs"
  },
  {
    question: "La licence FFBaD est-elle incluse ?",
    answer: "L’inscription au club passe par la licence FFBaD selon la formule choisie. Vérifiez les détails sur la page officielle.",
    href: "/inscriptions/licence-ffbad",
    cta: "Licence FFBaD"
  },
  {
    question: "Comment inscrire un mineur ?",
    answer: "Un responsable légal doit suivre la procédure d’inscription et préparer les documents nécessaires, dont l’autorisation parentale si demandée.",
    href: "/inscriptions/documents-utiles",
    cta: "Documents utiles"
  },
  {
    question: "Y a-t-il des compétitions ?",
    answer: "Oui, le club propose de la compétition via interclubs et tournois, selon les niveaux et les envies.",
    href: "/vie-du-club/interclubs",
    cta: "Voir interclubs"
  },
  {
    question: "Les loisirs peuvent-ils jouer sans compétition ?",
    answer: "Oui. Les créneaux loisirs permettent de jouer régulièrement sans obligation de compétition.",
    href: "/jouer-au-club/loisirs",
    cta: "Créneaux loisirs"
  },
  {
    question: "Comment prévenir d’une absence ?",
    answer: "Annulez votre réservation quand c’est possible ou contactez le responsable du créneau."
  },
  {
    question: "Peut-on venir en cours d’année ?",
    answer: "Oui si des places restent disponibles. Le plus simple est de demander un essai ou de contacter le club.",
    href: "/contact",
    cta: "Contacter le club"
  },
  {
    question: "Qui contacter ?",
    answer: "Utilisez le formulaire de contact pour une question d’inscription, d’essai, de réservation, de volants ou de compétition.",
    href: "/contact",
    cta: "Contact"
  }
];

export default function FaqPage() {
  return (
    <InfoPage
      eyebrow="FAQ"
      title="Questions fréquentes"
      intro="Les réponses rapides pour comprendre le fonctionnement du CFVV41 avant de venir jouer, essayer ou s’inscrire."
      cards={[]}
    >
      <div className="grid gap-4 md:grid-cols-2">
        {faqItems.map((item) => (
          <Card key={item.question} className="p-5">
            <h2 className="text-lg font-black text-court-900">{item.question}</h2>
            <p className="mt-2 text-sm leading-6 text-ink-500">{item.answer}</p>
            {item.href ? (
              <Link href={item.href} className="mt-4 inline-flex text-sm font-bold text-court-600 hover:text-court-900">
                {item.cta}
              </Link>
            ) : null}
          </Card>
        ))}
      </div>
    </InfoPage>
  );
}
