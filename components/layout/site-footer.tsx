import Link from "next/link";
import { ExternalLink, Mail, MapPin, Phone, UserRound } from "lucide-react";
import { ClubLogo } from "@/components/brand/club-logo";
import { getPublicClubSettings } from "@/services/club.service";

const externalLinks = [
  { label: "FFBaD", href: "https://www.ffbad.org/" },
  { label: "HelloAsso", href: "https://www.helloasso.com/" }
];

export async function SiteFooter() {
  const settings = await getPublicClubSettings();

  return (
    <footer className="bg-[#031d2b] pb-24 text-white md:pb-0">
      <div className="mx-auto grid max-w-[1180px] gap-10 px-5 py-12 sm:px-6 lg:grid-cols-[1.2fr_1.1fr_0.8fr] lg:px-8">
        <div>
          <Link href="/" aria-label="Accueil du CFVV" className="inline-flex">
            <ClubLogo />
          </Link>
          <p className="mt-5 max-w-md font-display text-sm font-black uppercase leading-6 text-white">
            Club des Fous du Volant Vendômois
          </p>
          <div className="mt-5 grid gap-3 text-sm leading-6 text-slate-200">
            <p className="flex gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#00a8bc]" aria-hidden="true" />
              <span>Gymnase des Aigremonts, 554 Rue de la Chappe, 41100 Vendôme</span>
            </p>
            {settings.contact.email ? (
              <Link href={`mailto:${settings.contact.email}`} className="flex gap-2 hover:text-white">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#00a8bc]" aria-hidden="true" />
                {settings.contact.email}
              </Link>
            ) : null}
            {settings.contact.phone ? (
              <Link href={`tel:${settings.contact.phone.replace(/\s/g, "")}`} className="flex gap-2 hover:text-white">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#00a8bc]" aria-hidden="true" />
                {settings.contact.phone}
              </Link>
            ) : null}
          </div>
        </div>

        <div>
          <p className="font-display text-lg font-black uppercase text-white">Liens rapides</p>
          <div className="mt-4 grid gap-2 text-sm text-slate-200">
            {["Créneaux", "Le Bureau", "Agenda", "Le Club", "Contact"].map((label) => {
              const href = label === "Créneaux" ? "/creneaux" : label === "Le Bureau" ? "/club/bureau-benevoles" : label === "Agenda" ? "/agenda" : label === "Le Club" ? "/club" : "/contact";
              return (
                <Link key={label} href={href} className="hover:text-white hover:underline">
                  {label}
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <p className="font-display text-lg font-black uppercase text-white">Suivez-nous</p>
          <div className="mt-5 flex gap-3">
            {["f", "ig", "▶"].map((item) => (
              <span key={item} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/45 font-display text-sm font-black uppercase text-white">
                {item}
              </span>
            ))}
          </div>
          <Link
            href="/connexion"
            className="mt-6 inline-flex h-12 items-center gap-2 rounded bg-[#0097a9] px-5 font-display text-sm font-black uppercase text-white shadow-[0_10px_22px_rgba(0,151,169,0.25)] transition hover:bg-[#007f8f]"
          >
            <UserRound className="h-4 w-4" aria-hidden="true" />
            Espace adhérent
          </Link>
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-3 px-5 py-5 text-xs text-slate-300 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>© 2026 {settings.club.fullName}. Tous droits réservés.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/mentions-legales" className="hover:text-white hover:underline">Mentions légales</Link>
            <Link href="/confidentialite" className="hover:text-white hover:underline">Politique de confidentialité</Link>
            {externalLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-display font-bold text-slate-200 hover:text-white hover:underline"
              >
                {item.label}
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            ))}
            {settings.contact.facebookUrl ? (
              <a href={settings.contact.facebookUrl} target="_blank" rel="noreferrer" className="font-display font-bold text-court-900 hover:underline">
                Facebook
              </a>
            ) : null}
            {settings.contact.instagramUrl ? (
              <a href={settings.contact.instagramUrl} target="_blank" rel="noreferrer" className="font-display font-bold text-court-900 hover:underline">
                Instagram
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </footer>
  );
}
