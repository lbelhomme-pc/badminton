import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, HeartHandshake, History, Shirt, Sparkles, UsersRound } from "lucide-react";
import { InfoPage } from "@/components/public/info-page";
import { Card } from "@/components/ui/card";
import { clubPhotoSlots } from "@/lib/club-photos";

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
  const highlightedSections = sections.slice(0, 2);
  const practicalSections = sections.slice(2);

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
      <div id="valeurs-histoire" className="grid scroll-mt-28 gap-5 md:grid-cols-2" aria-label="Valeurs et histoire du club">
        {highlightedSections.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="border-court-300 bg-court-50 p-6 shadow-[0_12px_28px_rgba(3,29,43,0.08)]">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-court-900 text-white">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h2 className="text-2xl font-black text-court-900">{item.title}</h2>
              </div>
              <p className="mt-4 text-base leading-7 text-ink-700">{item.text}</p>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="La vie du club">
        {practicalSections.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="p-5">
              <Icon className="h-6 w-6 text-court-500" aria-hidden="true" />
              <h2 className="mt-4 text-lg font-black text-court-900">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-ink-600">{item.text}</p>
            </Card>
          );
        })}
      </div>

      <div className="mt-7 flex flex-col gap-3 rounded-lg border border-court-200 bg-white p-5 shadow-soft sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-ink-600">Envie de découvrir l’ambiance du CFVV ? Consultez les créneaux ou demandez une séance d’essai.</p>
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
          <Link href="/creneaux" className="inline-flex min-h-11 items-center justify-center rounded-lg bg-court-500 px-4 font-display text-sm font-black text-white hover:bg-court-600">Voir les créneaux</Link>
          <Link href="/inscriptions/seance-essai" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-court-200 px-4 font-display text-sm font-black text-court-900 hover:bg-court-50">Demander un essai</Link>
        </div>
      </div>
    </InfoPage>
  );
}
