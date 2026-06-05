import Link from "next/link";
import { ArrowRight, CalendarDays, Medal, Sparkles, Trophy, UsersRound } from "lucide-react";
import { SlotCard } from "@/components/planning/slot-card";
import { ActualitesList } from "@/components/public/actualites-list";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { clubStats } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";
import { getEvents, getOpenSlots } from "@/services/club.service";

export default function HomePage() {
  const openSlots = getOpenSlots().slice(0, 3);
  const events = getEvents();

  return (
    <div>
      <section className="border-b border-court-200 bg-white">
        <div className="mx-auto grid min-h-[560px] max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div>
            <h1 className="max-w-3xl text-4xl font-black leading-tight text-court-900 sm:text-6xl">
              Club des fous du Volant Vendômois
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-ink-600">
              Créneaux, réservations, volants et informations du club dans une interface simple, lisible et pensée pour les adhérents.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/inscription"
                className="inline-flex h-12 items-center justify-center rounded-lg bg-court-500 px-5 font-semibold text-white shadow-soft transition hover:bg-court-600"
              >
                Rejoindre le club
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/creneaux"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-court-200 bg-white px-5 font-semibold text-court-900 transition hover:bg-court-100"
              >
                Voir les créneaux
              </Link>
            </div>
          </div>
          <div className="grid gap-4">
            <Card className="border-court-800 bg-court-900 p-5 text-white shadow-lift">
              <div className="flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-court-500/20 text-court-200">
                  <Sparkles className="h-5 w-5" aria-hidden="true" />
                </span>
                <p className="text-sm font-semibold uppercase tracking-wide text-court-200">Séance d'essai</p>
              </div>
              <h2 className="mt-4 text-2xl font-black leading-tight">Envie d'essayer le badminton ?</h2>
              <p className="mt-3 text-sm leading-6 text-court-50">
                Une séance d'essai est possible pour découvrir l'ambiance du CFVV41 avant de s'inscrire. Consulte les
                créneaux puis contacte le club pour choisir le bon moment selon ton profil.
              </p>
              <p className="mt-4 rounded-lg bg-white/10 p-3 text-sm font-semibold leading-6 text-white">
                Pas besoin d'être déjà bon : viens simplement avec une tenue de sport, on t'explique le reste.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Link
                  href="/creneaux"
                  className="inline-flex h-11 items-center justify-center rounded-lg bg-white px-4 text-sm font-black text-court-900 transition hover:bg-court-50"
                >
                  Voir les créneaux
                </Link>
                <Link
                  href="/inscriptions/seance-essai"
                  className="inline-flex h-11 items-center justify-center rounded-lg bg-court-500 px-4 text-sm font-black text-white transition hover:bg-court-600"
                >
                  Demander une séance d'essai
                </Link>
              </div>
            </Card>
            <div className="grid gap-4 sm:grid-cols-2">
              {clubStats.slice(0, 2).map((stat) => (
                <div key={stat.label} className="rounded-lg border border-court-200 bg-court-50 p-5">
                  <p className="text-3xl font-black text-court-900">{stat.value}</p>
                  <p className="mt-1 text-sm font-semibold text-ink-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 pt-10 sm:px-6 md:grid-cols-4 lg:px-8">
        {[
          { href: "/creneaux", label: "Créneaux", text: "Voir les prochains créneaux", icon: CalendarDays },
          { href: "/reservation-creneau", label: "Réserver", text: "Choisir une place ouverte", icon: UsersRound },
          { href: "/commande-volants", label: "Volants", text: "Réserver un tube", icon: Sparkles },
          { href: "/inscription", label: "Inscriptions", text: "Accéder au lien FFBaD", icon: Trophy }
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="group rounded-lg border border-court-200 bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift">
              <Icon className="h-6 w-6 text-court-500" aria-hidden="true" />
              <p className="mt-4 text-lg font-black text-court-900">{item.label}</p>
              <p className="mt-1 text-sm text-ink-500">{item.text}</p>
            </Link>
          );
        })}
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-court-600">Actualités</p>
            <h2 className="mt-2 text-3xl font-black text-court-900">Infos utiles du club</h2>
          </div>
          <Link className="text-sm font-bold text-court-600 hover:text-court-900" href="/vie-du-club/actualites">
            Voir toutes les actualités
          </Link>
        </div>
        <div className="mt-6">
          <ActualitesList limit={2} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-court-600">Réserver vite</p>
            <h2 className="mt-2 text-3xl font-black text-court-900">Prochains créneaux ouverts</h2>
          </div>
          <Link className="text-sm font-bold text-court-600 hover:text-court-900" href="/creneaux">
            Voir tout le planning
          </Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {openSlots.map((slot) => (
            <SlotCard key={slot.id} slot={slot} compact />
          ))}
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
          {clubStats.map((stat) => (
            <div key={stat.label} className="rounded-lg border border-court-200 bg-court-50 p-5">
              <p className="text-4xl font-black text-court-900">{stat.value}</p>
              <p className="mt-1 text-sm font-semibold text-ink-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-court-600">Pour chaque joueur</p>
            <h2 className="mt-2 text-3xl font-black text-court-900">Loisirs, jeunes, adultes et compétiteurs.</h2>
            <p className="mt-4 leading-7 text-ink-500">
              Les créneaux sont pensés pour que chacun trouve sa place : découvrir, progresser, préparer les interclubs ou simplement jouer avec plaisir.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["Débutants", "Un cadre simple pour apprendre les bases sans pression."],
              ["Jeunes", "École de badminton, motricité, technique et matchs."],
              ["Adultes", "Entraînements structurés et jeu libre convivial."],
              ["Compétiteurs", "Préparation interclubs, doubles et intensité maîtrisée."]
            ].map(([title, text]) => (
              <Card key={title} className="p-5">
                <Medal className="h-6 w-6 text-court-500" aria-hidden="true" />
                <h3 className="mt-4 text-xl font-black text-court-900">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink-500">{text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-court-100 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-court-600">Vie du club</p>
          <h2 className="mt-2 text-3xl font-black text-court-900">Événements à venir</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {events.map((event) => (
              <Card key={event.id} className="p-5">
                <Badge className="border-blue-200 bg-blue-50 text-blue-700">{event.type}</Badge>
                <h3 className="mt-3 text-xl font-black text-court-900">{event.title}</h3>
                <p className="mt-1 text-sm font-semibold text-court-600">{formatDate(event.date)}</p>
                <p className="mt-3 text-sm leading-6 text-ink-500">{event.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
