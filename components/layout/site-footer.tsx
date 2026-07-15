import Link from "next/link";
import { ExternalLink, Mail, MapPin, Phone, UserRound } from "lucide-react";
import { ClubLogo } from "@/components/brand/club-logo";
import { getPublicClubSettings } from "@/services/club.service";

const footerSections = [
  {
    title: "Pratique",
    links: [
      { label: "Créneaux", href: "/creneaux" },
      { label: "Tarifs", href: "/tarifs" },
      { label: "Lieux et accès", href: "/lieux-acces" },
      { label: "Séance d'essai", href: "/inscriptions/seance-essai" },
      { label: "Règlement intérieur", href: "/inscriptions/documents-utiles" }
    ]
  },
  {
    title: "Catégories",
    links: [
      { label: "Jeunes", href: "/jouer-au-club/jeunes" },
      { label: "Adultes débutants", href: "/jouer-au-club/adultes-debutants" },
      { label: "Loisirs", href: "/jouer-au-club/loisirs" },
      { label: "Compétition", href: "/jouer-au-club/competition" },
      { label: "Classements", href: "/classements" }
    ]
  },
  {
    title: "Vie du club",
    links: [
      { label: "Le Bureau", href: "/club/bureau-benevoles" },
      { label: "Agenda", href: "/agenda" },
      { label: "Actualités", href: "/vie-du-club/actualites" },
      { label: "Partenaires", href: "/partenaires" },
      { label: "Devenir partenaire", href: "/devenir-partenaire" }
    ]
  },
  {
    title: "Aide et légal",
    links: [
      { label: "FAQ", href: "/faq" },
      { label: "Contact", href: "/contact" },
      { label: "Mentions légales", href: "/mentions-legales" },
      { label: "Confidentialité", href: "/confidentialite" },
      { label: "Cookies", href: "/cookies" },
      { label: "Accessibilité", href: "/accessibilite" }
    ]
  }
];

const organismLinks = [
  { label: "FFBaD", href: "https://www.ffbad.org/" },
  { label: "HelloAsso", href: "https://www.helloasso.com/" }
];

export async function SiteFooter() {
  const settings = await getPublicClubSettings();
  const socialLinks = [
    settings.contact.facebookUrl ? { label: "Facebook", href: settings.contact.facebookUrl, icon: "facebook" } : null,
    settings.contact.instagramUrl ? { label: "Instagram", href: settings.contact.instagramUrl, icon: "external" } : null
  ].filter((item): item is { label: string; href: string; icon: "facebook" | "external" } => Boolean(item));

  return (
    <footer className="bg-[#031d2b] pb-24 text-white md:pb-0">
      <div className="mx-auto grid max-w-[1180px] gap-10 px-5 py-12 sm:px-6 lg:grid-cols-[1.15fr_2fr] lg:px-8">
        <div>
          <Link href="/" prefetch={false} aria-label="Accueil du CFVV" className="inline-flex">
            <ClubLogo />
          </Link>
          <p className="mt-5 max-w-md font-display text-sm font-black uppercase leading-6 text-white">
            {settings.club.fullName}
          </p>
          <div className="mt-5 grid gap-3 text-sm leading-6 text-slate-200">
            <p className="flex gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#00a8bc]" aria-hidden="true" />
              <span>Gymnase des Aigremonts, 554 Rue de la Chappe, 41100 Vendôme</span>
            </p>
            {settings.contact.email ? (
              <Link href={`mailto:${settings.contact.email}`} className="flex gap-2 hover:text-white hover:underline">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#00a8bc]" aria-hidden="true" />
                {settings.contact.email}
              </Link>
            ) : null}
            {settings.contact.phone ? (
              <Link href={`tel:${settings.contact.phone.replace(/\s/g, "")}`} className="flex gap-2 hover:text-white hover:underline">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#00a8bc]" aria-hidden="true" />
                {settings.contact.phone}
              </Link>
            ) : null}
          </div>

          <Link
            href="/connexion"
            prefetch={false}
            className="mt-6 inline-flex h-12 items-center gap-2 rounded bg-[#0097a9] px-5 font-display text-sm font-black uppercase text-white shadow-[0_10px_22px_rgba(0,151,169,0.25)] transition hover:bg-[#007f8f]"
          >
            <UserRound className="h-4 w-4" aria-hidden="true" />
            Espace adhérent
          </Link>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
          {footerSections.map((section) => (
            <div key={section.title}>
              <p className="font-display text-lg font-black uppercase text-white">{section.title}</p>
              <div className="mt-4 grid gap-2 text-sm text-slate-200">
                {section.links.map((item) => (
                  <Link key={item.href} href={item.href} prefetch={false} className="hover:text-white hover:underline">
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className="mx-auto grid max-w-[1180px] gap-4 px-5 py-5 text-xs text-slate-300 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p>© 2026 {settings.club.fullName}. Tous droits réservés.</p>
            <div className="flex flex-wrap gap-3">
              {organismLinks.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-display font-bold text-slate-200 hover:text-white hover:underline"
                >
                  {item.label}
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              ))}
              {socialLinks.length > 0 ? (
                socialLinks.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Ouvrir ${item.label} du CFVV`}
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1.5 font-display font-bold text-slate-200 transition hover:border-[#00a8bc] hover:bg-white/10 hover:text-white"
                  >
                    {item.icon === "facebook" ? <FacebookLogo className="h-4 w-4" /> : null}
                    {item.label}
                    {item.icon !== "facebook" ? <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /> : null}
                  </a>
                ))
              ) : (
                <span className="text-slate-400">Réseaux sociaux à confirmer</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FacebookLogo({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M13.6 21v-7.7h2.6l.4-3h-3V8.4c0-.9.3-1.5 1.6-1.5h1.6V4.2c-.8-.1-1.6-.2-2.4-.2-2.4 0-4 1.5-4 4.1v2.2H7.8v3h2.6V21h3.2Z"
      />
    </svg>
  );
}
