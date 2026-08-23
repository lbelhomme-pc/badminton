import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/public/info-page";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "FAQ - CFVV",
  description: "Questions fréquentes sur le club, les créneaux, les inscriptions et les réservations."
};

const faqItems = [
  {
    question: "Peut-on faire un essai ?",
    answer: "Oui. Le site prévoit un parcours de demande d'essai afin que le club puisse orienter la personne vers le bon créneau.",
    href: "/inscriptions/seance-essai",
    cta: "Demander un essai"
  },
  {
    question: "Le club accepte-t-il les débutants ?",
    answer: "Oui, les pages créneaux indiquent les publics et niveaux conseillés. En cas de doute, contactez le club avant de venir.",
    href: "/creneaux",
    cta: "Voir les créneaux"
  },
  {
    question: "À partir de quel âge ?",
    answer: "L'âge d'accueil des jeunes doit être confirmé par le club selon les groupes ouverts et l'encadrement disponible."
  },
  {
    question: "Faut-il une raquette ?",
    answer: "Pour une première séance, contactez le club si vous n'avez pas encore de matériel. Les consignes définitives doivent être confirmées par le bureau."
  },
  {
    question: "Où joue-t-on ?",
    answer: "Les informations d'accès sont regroupées dans la page Lieux et accès, avec une alternative textuelle à la carte.",
    href: "/club/gymnases-acces",
    cta: "Voir l'accès"
  },
  {
    question: "Quels sont les horaires ?",
    answer: "Les horaires publiés dans la page Créneaux font foi. Ils peuvent changer en cas de vacances, fermeture ou événement.",
    href: "/creneaux",
    cta: "Voir les horaires"
  },
  {
    question: "Combien coûte l'inscription ?",
    answer: "Les tarifs doivent être confirmés chaque saison par le bureau. La page Tarifs précise si les données affichées sont confirmées ou de démonstration.",
    href: "/tarifs",
    cta: "Voir les tarifs"
  },
  {
    question: "Comment inscrire un mineur ?",
    answer: "Un responsable légal doit suivre la procédure d'inscription et fournir les documents demandés par le club et la FFBaD.",
    href: "/inscriptions/documents-utiles",
    cta: "Documents utiles"
  },
  {
    question: "Y a-t-il des compétitions ?",
    answer: "La compétition dépend des équipes, des calendriers et des responsables sportifs de la saison.",
    href: "/vie-du-club/interclubs",
    cta: "Voir interclubs"
  },
  {
    question: "Qui contacter ?",
    answer: "Utilisez le formulaire de contact avec l'objet adapté : essai, inscription, créneaux, volants, interclubs ou partenariat.",
    href: "/contact",
    cta: "Contact"
  }
];

export default function FaqPage() {
  return (
    <InfoPage
      contentKey="/faq"
      eyebrow="FAQ"
      title="Questions fréquentes"
      intro="Les réponses rapides pour comprendre le fonctionnement du CFVV avant de venir jouer, essayer ou s'inscrire."
      cards={[]}
    >
      <div className="grid gap-4 md:grid-cols-2">
        {faqItems.map((item) => (
          <Card key={item.question} className="p-5">
            <h2 className="text-lg font-black text-court-900">{item.question}</h2>
            <p className="mt-2 text-sm leading-6 text-ink-600">{item.answer}</p>
            {item.href ? (
              <Link href={item.href} className="mt-4 inline-flex font-display text-sm font-bold text-court-600 hover:text-court-900 hover:underline">
                {item.cta}
              </Link>
            ) : null}
          </Card>
        ))}
      </div>
    </InfoPage>
  );
}
