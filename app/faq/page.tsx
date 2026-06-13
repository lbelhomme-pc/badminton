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
    answer: "L’âge d’accueil des jeunes est à confirmer auprès du club selon les groupes ouverts et les places disponibles."
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
    answer: "Les créneaux habituels sont le mardi de 18h à 22h30, le mercredi de 18h à 20h30, le jeudi de 18h à 22h30 et le vendredi de 18h à 22h30.",
    href: "/jouer-au-club/creneaux",
    cta: "Voir le planning"
  },
  {
    question: "Combien coûte l’inscription ?",
    answer: "La licence loisirs est à 60 euros et la licence compétiteurs à 95 euros. La page Tarifs récapitule les montants.",
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
