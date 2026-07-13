import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  CalendarDays,
  ChartColumnIncreasing,
  Clock3,
  FileText,
  Mail,
  MapPin,
  ShoppingBag,
  Trophy,
  UserRound,
  UsersRound
} from "lucide-react";
import { canonical } from "@/lib/seo";
import { getLocalStructuredData, serializeStructuredData } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "CFVV - Club de badminton à Vendôme",
  description:
    "Accueil du Club des Fous du Volant du Vendômois : créneaux, inscriptions, séance d'essai, actualités et informations pratiques.",
  alternates: canonical("/")
};

const newsCards = [
  {
    label: "Vie du club",
    date: "02 sept. 2025",
    title: "C'est la rentrée !",
    text: "Reprise des créneaux et des entraînements. On vous attend nombreux sur les terrains !",
    tone: "from-cyan-900/80 to-cyan-500/40"
  },
  {
    label: "Événement",
    date: "30 août 2025",
    title: "Journée des associations",
    text: "Merci à tous ceux qui sont venus nous rencontrer au forum des associations !",
    tone: "from-slate-900/80 to-cyan-500/35"
  },
  {
    label: "Entraînements",
    date: "25 août 2025",
    title: "Reprise des entraînements",
    text: "Les séances encadrées reprennent dès le 2 septembre. Consultez les créneaux !",
    tone: "from-cyan-950/85 to-slate-400/35"
  }
];

const slotCards = [
  { title: "Jeunes", subtitle: "Entraînement", day: "Mardi", hour: "18h00 - 19h30" },
  { title: "Adultes", subtitle: "Compétition / Perf.", day: "Mardi", hour: "20h00 - 22h30" },
  { title: "Loisir", subtitle: "Adultes", day: "Jeudi", hour: "20h00 - 22h30" },
  { title: "Jeu libre", subtitle: "Adultes", day: "Vendredi", hour: "20h00 - 22h30" }
];

const agenda = [
  { day: "07", month: "Juin", title: "Tournoi interne", place: "Complexe G. Vezain - Vendôme", tag: "Club" },
  { day: "21", month: "Juin", title: "Fête du club", place: "Repas convivial et animations", tag: "Club" },
  { day: "05", month: "Juil.", title: "Tournoi des 3 châteaux", place: "Vendôme / Blois / Amboise", tag: "Tournoi" }
];

const bureau = [
  { name: "Claire D.", role: "Présidente", email: "presidente@cfvv41.fr" },
  { name: "Julien M.", role: "Trésorier", email: "tresorier@cfvv41.fr" },
  { name: "Sophie L.", role: "Secrétaire", email: "secretaire@cfvv41.fr" }
];

const sponsors = ["INTERSPORT", "Crédit Mutuel", "FZ FORZA", "Gerflor", "DECATHLON", "Badminton 41"];

export default function HomePage() {
  const structuredData = getLocalStructuredData();

  return (
    <div className="bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeStructuredData(structuredData) }} />

      <section className="relative overflow-hidden bg-[#031d2b] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(255,255,255,0.34),transparent_5%),radial-gradient(circle_at_64%_22%,rgba(255,255,255,0.18),transparent_4%),linear-gradient(90deg,rgba(3,29,43,0.96)_0%,rgba(3,29,43,0.82)_38%,rgba(2,45,62,0.38)_72%,rgba(0,151,169,0.42)_100%)]" />
        <div className="absolute inset-y-0 right-0 hidden w-[58%] bg-[radial-gradient(circle_at_52%_40%,rgba(0,151,169,0.52),transparent_27%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0))] lg:block" />
        <div className="absolute bottom-0 right-0 hidden h-48 w-[430px] -rotate-6 opacity-95 lg:block">
          <div className="cfvv-brush absolute inset-x-16 bottom-8 h-24" />
          <img src="/logos/cfvv-illustration.png" alt="" className="absolute bottom-0 right-0 h-44 w-auto object-contain" aria-hidden="true" />
        </div>
        <div className="relative mx-auto grid min-h-[430px] max-w-[1180px] items-center px-5 py-14 lg:grid-cols-[1fr_0.85fr] lg:px-8">
          <div className="max-w-2xl">
            <h1 className="font-display text-[2.65rem] font-black uppercase leading-[0.95] tracking-normal sm:text-6xl">
              Le badminton à Vendôme,
              <span className="mt-2 block text-[#00a8bc]">dans une ambiance conviviale et dynamique</span>
            </h1>
            <p className="mt-8 max-w-xl text-lg font-medium leading-8 text-white/92">
              Le Club des Fous du Volant Vendômois accueille les débutants comme les joueurs confirmés, pour partager le plaisir du jeu dans la bonne humeur.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link href="/creneaux" className="inline-flex h-12 items-center justify-center gap-3 rounded bg-[#0097a9] px-6 font-display text-sm font-black uppercase text-white shadow-[0_12px_26px_rgba(0,151,169,0.25)] transition hover:bg-[#007f8f]">
                <CalendarDays className="h-5 w-5" aria-hidden="true" />
                Découvrir les créneaux
              </Link>
              <Link href="/inscription" className="inline-flex h-12 items-center justify-center gap-3 rounded border border-white/80 px-6 font-display text-sm font-black uppercase text-white transition hover:bg-white hover:text-[#031d2b]">
                <UsersRound className="h-5 w-5" aria-hidden="true" />
                Rejoindre le club
              </Link>
            </div>
          </div>
          <div className="relative hidden min-h-[360px] lg:block">
            <div className="absolute right-12 top-16 h-48 w-48 rounded-full border border-white/12 bg-white/5 blur-[1px]" />
            <div className="absolute right-32 top-20 h-36 w-36 rounded-full border border-[#00a8bc]/40" />
            <div className="absolute right-8 top-24 rotate-[-18deg] font-display text-[9rem] font-black leading-none text-white/10">CFVV</div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-[1180px] divide-y divide-slate-200 px-5 py-7 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4 lg:px-8">
          {[
            { icon: UsersRound, title: "Adultes & jeunes", text: "À partir de 8 ans" },
            { icon: ChartColumnIncreasing, title: "Loisir & progression", text: "Chacun à son rythme" },
            { icon: MapPin, title: "Vendôme", text: "Complexes sportifs" },
            { icon: CalendarCheck, title: "Inscriptions ouvertes", text: "Rejoignez-nous !" }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex items-center gap-5 px-4 py-4 first:pl-0">
                <Icon className="h-11 w-11 shrink-0 text-[#0097a9]" aria-hidden="true" />
                <div>
                  <p className="font-display text-lg font-black uppercase leading-none text-[#061b2a]">{item.title}</p>
                  <p className="mt-2 text-sm text-slate-500">{item.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-5 py-10 lg:px-8">
        <SectionHeader title="Actualités du club" href="/vie-du-club/actualites" label="Voir toutes les actualités" />
        <div className="mt-9 grid gap-7 lg:grid-cols-3">
          {newsCards.map((item) => (
            <article key={item.title} className="overflow-hidden rounded border border-slate-200 bg-white shadow-[0_8px_20px_rgba(6,27,42,0.06)]">
              <div className={`relative h-32 bg-gradient-to-br ${item.tone}`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_38%,rgba(255,255,255,0.38),transparent_10%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent)]" />
                <img src="/logos/cfvv-blason.png" alt="" className="absolute right-4 top-4 h-20 w-20 object-contain opacity-40" aria-hidden="true" />
                <span className="absolute bottom-0 left-4 bg-[#0097a9] px-3 py-1 font-display text-[11px] font-black uppercase text-white">{item.label}</span>
              </div>
              <div className="p-5">
                <p className="font-display text-xs font-black uppercase text-slate-500">{item.date}</p>
                <h3 className="mt-3 font-display text-2xl font-black text-[#061b2a]">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.text}</p>
                <Link href="/vie-du-club/actualites" className="mt-4 inline-flex items-center gap-2 font-display text-sm font-black text-[#0097a9] hover:underline">
                  Lire la suite <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-[1180px] gap-10 px-5 py-3 lg:grid-cols-[1.35fr_1fr] lg:px-8">
        <div>
          <SectionHeader title="Nos créneaux" href="/creneaux" label="Voir tous les créneaux" />
          <div className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {slotCards.map((slot) => (
              <article key={slot.title} className="rounded border border-slate-200 bg-white p-5 text-center shadow-[0_6px_16px_rgba(6,27,42,0.04)]">
                <Trophy className="mx-auto h-10 w-10 text-[#0097a9]" aria-hidden="true" />
                <h3 className="mt-4 font-display text-xl font-black uppercase text-[#061b2a]">{slot.title}</h3>
                <p className="text-sm text-slate-600">{slot.subtitle}</p>
                <p className="mt-5 text-sm font-semibold text-slate-600">{slot.day}</p>
                <p className="font-display text-lg font-black text-[#061b2a]">{slot.hour}</p>
                <p className="mt-2 text-xs text-slate-500">Complexe G. Vezain</p>
              </article>
            ))}
          </div>
          <p className="mt-4 text-center text-sm text-slate-500">D'autres créneaux peuvent être ouverts selon la saison.</p>
        </div>

        <div className="lg:border-l lg:border-slate-200 lg:pl-9">
          <SectionHeader title="Agenda" href="/agenda" label="Voir tout l'agenda" />
          <div className="mt-9 grid gap-3">
            {agenda.map((item) => (
              <article key={item.title} className="grid grid-cols-[72px_1fr] gap-4 rounded border border-slate-200 bg-white p-3 shadow-[0_6px_16px_rgba(6,27,42,0.04)]">
                <div className="rounded border border-slate-200 bg-slate-50 py-2 text-center">
                  <p className="font-display text-3xl font-black leading-none text-[#061b2a]">{item.day}</p>
                  <p className="mt-1 font-display text-xs font-black uppercase text-slate-500">{item.month}</p>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-display text-lg font-black text-[#061b2a]">{item.title}</h3>
                    <p className="text-sm text-slate-500">{item.place}</p>
                  </div>
                  <span className="rounded bg-cyan-50 px-3 py-1 font-display text-xs font-black uppercase text-[#0097a9]">{item.tag}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-5 py-10 lg:px-8">
        <SectionHeader title="Le Bureau" href="/club/bureau-benevoles" label="Découvrir le bureau complet" />
        <div className="mt-9 grid gap-7 lg:grid-cols-3">
          {bureau.map((person) => (
            <article key={person.email} className="flex items-center gap-5 rounded border border-slate-200 bg-white p-5 shadow-[0_6px_16px_rgba(6,27,42,0.04)]">
              <span className="inline-flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <UserRound className="h-11 w-11" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h3 className="font-display text-2xl font-black text-[#061b2a]">{person.name}</h3>
                <p className="font-display text-sm font-black uppercase text-[#0097a9]">{person.role}</p>
                <p className="mt-1 truncate text-sm font-semibold text-slate-600">{person.email}</p>
              </div>
              <Mail className="ml-auto h-6 w-6 shrink-0 text-[#0097a9]" aria-hidden="true" />
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-5 pb-10 lg:px-8">
        <div className="relative overflow-hidden rounded bg-[#031d2b] px-8 py-8 text-white shadow-[0_16px_35px_rgba(3,29,43,0.22)] lg:px-14">
          <div className="absolute inset-y-0 left-0 w-48 opacity-80">
            <div className="cfvv-brush absolute bottom-4 left-4 h-24 w-40" />
          </div>
          <div className="relative grid items-center gap-8 lg:grid-cols-[1.1fr_2fr]">
            <div>
              <h2 className="font-display text-4xl font-black uppercase leading-none">Espace adhérent</h2>
              <p className="mt-4 max-w-sm text-lg leading-7 text-white/82">Votre espace privé, simple et sécurisé</p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: CalendarDays, title: "Réserver les créneaux", text: "Mercredi et vendredi en quelques clics" },
                { icon: FileText, title: "Consulter les infos", text: "Actualités internes et documents" },
                { icon: ShoppingBag, title: "Commander", text: "Vos boîtes de volants au tarif membre" },
                { icon: Clock3, title: "Payer en ligne", text: "Règlements sécurisés via HelloAsso" }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="border-l border-white/18 pl-5">
                    <Icon className="h-8 w-8 text-white" aria-hidden="true" />
                    <h3 className="mt-3 font-display text-base font-black text-white">{item.title}</h3>
                    <p className="mt-2 text-xs leading-5 text-white/72">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
          <Link href="/connexion" className="absolute bottom-[-22px] left-1/2 hidden h-14 -translate-x-1/2 items-center gap-3 rounded bg-[#0097a9] px-8 font-display text-sm font-black uppercase text-white shadow-[0_12px_26px_rgba(0,151,169,0.35)] transition hover:bg-[#007f8f] sm:inline-flex">
            <UserRound className="h-5 w-5" aria-hidden="true" />
            Accéder à mon espace
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-5 pb-12 pt-2 lg:px-8">
        <h2 className="cfvv-section-title">Ils nous soutiennent</h2>
        <div className="mt-10 grid grid-cols-2 items-center gap-8 text-center font-display text-2xl font-black text-slate-400 grayscale md:grid-cols-3 lg:grid-cols-6">
          {sponsors.map((sponsor) => (
            <span key={sponsor} className="opacity-75">{sponsor}</span>
          ))}
        </div>
      </section>
    </div>
  );
}

function SectionHeader({ title, href, label }: { title: string; href: string; label: string }) {
  return (
    <div className="flex items-end justify-between gap-5">
      <h2 className="cfvv-section-title">{title}</h2>
      <Link href={href} className="hidden items-center gap-2 font-display text-sm font-black text-[#0097a9] hover:underline sm:inline-flex">
        {label}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  );
}
