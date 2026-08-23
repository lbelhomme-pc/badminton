import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, HeartHandshake, History, Shirt, Sparkles, UsersRound } from "lucide-react";
import { ClubPhoto } from "@/components/public/club-photo";
import { InfoPage } from "@/components/public/info-page";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { clubPhotoSlots, hasClubPhoto } from "@/lib/club-photos";

export const metadata: Metadata = {
  title: "Le Club - CFVV",
  description: "Histoire, valeurs, pratiques, catégories, équipement et modalités d'essai du CFVV."
};

const sections = [
  {
    icon: History,
    title: "Histoire",
    text: "Le CFVV est un club associatif vendômois. Les dates historiques précises doivent être confirmées par le bureau avant publication."
  },
  {
    icon: HeartHandshake,
    title: "Valeurs",
    text: "Accueil, convivialité, progression, entraide bénévole et respect des niveaux de chacun."
  },
  {
    icon: UsersRound,
    title: "Pratiques proposées",
    text: "Jeu libre, créneaux jeunes, pratique adulte, loisir, compétition et interclubs selon les créneaux ouverts."
  },
  {
    icon: BadgeCheck,
    title: "Catégories",
    text: "Les catégories jeunes/adultes et loisirs/compétiteurs sont précisées dans les pages créneaux et tarifs."
  },
  {
    icon: Shirt,
    title: "Équipement",
    text: "Prévoir une tenue de sport, des chaussures propres adaptées au gymnase, une gourde et une raquette si possible."
  },
  {
    icon: Sparkles,
    title: "Essai",
    text: "La séance d'essai permet de vérifier le créneau, l'ambiance et le niveau avant de finaliser l'inscription."
  }
];

export default function ClubPage() {
  const clubLifePhoto = clubPhotoSlots.clubLife;

  return (
    <InfoPage
      contentKey="/club"
      eyebrow="Le Club"
      title="Un club de badminton associatif à Vendôme"
      intro="Le CFVV accueille les joueurs qui veulent découvrir, jouer régulièrement, progresser ou représenter le club en compétition."
      cards={[]}
      hero={{
        tone: "club",
        photo: clubPhotoSlots.clubLife,
        visualLabel: "Ambiance CFVV",
        badges: [
          { label: "Jeunes et adultes", icon: <UsersRound className="h-4 w-4" aria-hidden="true" /> },
          { label: "Loisir et compétition", icon: <BadgeCheck className="h-4 w-4" aria-hidden="true" /> },
          { label: "Séance d'essai", icon: <Sparkles className="h-4 w-4" aria-hidden="true" /> }
        ],
        actions: [
          { href: "/creneaux", label: "Voir les créneaux", icon: <UsersRound className="h-4 w-4" aria-hidden="true" /> },
          { href: "/inscriptions/seance-essai", label: "Demander un essai", variant: "secondary", icon: <Sparkles className="h-4 w-4" aria-hidden="true" /> }
        ]
      }}
    >
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          {hasClubPhoto(clubLifePhoto) ? (
            <ClubPhoto slot={clubLifePhoto} className="h-72 w-full md:h-96" />
          ) : (
            <img
              src="/logos/cfvv-illustration.png"
              alt="Illustration du CFVV avec volant de badminton et monument de Vendôme"
              className="h-72 w-full rounded-lg border border-court-200 bg-white object-contain p-5 md:h-96"
            />
          )}
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link href="/creneaux">
              <Button className="w-full sm:w-auto">Voir les créneaux</Button>
            </Link>
            <Link href="/inscriptions/seance-essai">
              <Button variant="outline" className="w-full sm:w-auto">Demander un essai</Button>
            </Link>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {sections.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title} className="p-5">
                <Icon className="h-6 w-6 text-court-500" aria-hidden="true" />
                <h2 className="mt-4 text-xl font-black text-court-900">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-ink-600">{item.text}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </InfoPage>
  );
}
