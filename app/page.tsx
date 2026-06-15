import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, Medal, Sparkles, Trophy, UsersRound } from "lucide-react";
import { ActualitesList } from "@/components/public/actualites-list";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { clubStats } from "@/lib/mock-data";
import { canonical } from "@/lib/seo";
import { getLocalStructuredData, serializeStructuredData } from "@/lib/structured-data";
import { formatDate, formatTime, slotTypeLabel } from "@/lib/utils";
import { getEvents, getOpenSlots } from "@/services/club.service";

export const metadata: Metadata = {
  title: "CF2V41 - Club de badminton à Vendôme",
  description:
    "Accueil du Club des fous du Volant Vendômois : créneaux, inscriptions, séance d'essai, actualités et informations pratiques.",
  alternates: canonical("/")
};

export default function HomePage() {
  const nextSlot = getOpenSlots()[0];
  const events = getEvents();
  const structuredData = getLocalStructuredData();

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeStructuredData(structuredData) }}
      />
      <section className="border-b border-court-200 bg-white">
        <div className="mx-auto grid min-h-[460px] max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
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
              <Link
                href="/inscriptions/seance-essai"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-court-200 bg-white px-5 font-semibold text-court-900 transition hover:bg-court-100"
              >
                Demander un essai
              </Link>
            </div>
          </div>
          <div className="grid gap-4">
            {nextSlot ? (
              <Link
                href={`/planning/${nextSlot.id}`}
                className="rounded-lg border border-court-200 bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-court-600">Prochain créneau</p>
                    <h2 className="mt-2 text-2xl font-black leading-tight text-court-900">{nextSlot.title}</h2>
                  </div>
                  <span className="rounded-full bg-court-100 px-3 py-1 text-xs font-black text-court-700">Ouvert</span>
                </div>
                <div className="mt-4 grid gap-2 text-sm text-ink-500">
                  <p>
                    <span className="font-semibold text-court-900">{formatDate(nextSlot.startsAt, "short")}</span>
                    {" · "}
                    {formatTime(nextSlot.startsAt)} - {formatTime(nextSlot.endsAt)}
                  </p>
                  <p>{nextSlot.venueName}</p>
                  <p>{slotTypeLabel(nextSlot.type)} · {nextSlot.recommendedLevel}</p>
                </div>
                <span className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-lg border border-court-200 bg-court-50 px-4 text-sm font-black text-court-900 transition hover:bg-court-100">
                  Voir le détail
                </span>
              </Link>
            ) : null}
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

      <section className="border-b border-court-200 bg-court-50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-court-600">Actualités du club</p>
              <h2 className="mt-2 text-3xl font-black text-court-900">À retenir cette semaine</h2>
            </div>
            <Link className="text-sm font-bold text-court-600 hover:text-court-900" href="/vie-du-club/actualites">
              Voir toutes les actualités
            </Link>
          </div>
          <div className="mt-6">
            <ActualitesList limit={3} />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 pt-10 sm:px-6 md:grid-cols-4 lg:px-8">
        {[
          { href: "/inscriptions/seance-essai", label: "Essai", text: "Tester le club avant de s'inscrire", icon: CalendarDays },
          { href: "/commande-volants", label: "Volants", text: "Réserver un tube", icon: Sparkles },
          { href: "/inscription", label: "Inscriptions", text: "Tarifs, licence et documents", icon: Trophy },
          { href: "/contact", label: "Contact", text: "Poser une question au club", icon: UsersRound }
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

      {events.length > 0 ? (
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
      ) : null}
    </div>
  );
}
