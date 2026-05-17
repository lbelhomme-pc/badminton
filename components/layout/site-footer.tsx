import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { ClubLogo } from "@/components/brand/club-logo";
import { siteNavigation, utilityNavigation } from "@/lib/navigation";
import { getPublicClubSettings } from "@/services/club.service";

export async function SiteFooter() {
  const settings = await getPublicClubSettings();

  return (
    <footer className="border-t border-court-200 bg-white pb-24 md:pb-0">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <ClubLogo />
          </div>
          <p className="mt-5 max-w-md text-sm leading-6 text-ink-500">
            Planning, réservations, volants, classements, espace adhérent et administration du club.
          </p>
          <p className="mt-4 text-xs font-semibold text-ink-500">
            © 2026 {settings.club.fullName}. Tous droits réservés.
          </p>
        </div>
        <div>
          <p className="font-semibold text-court-900">Rubriques</p>
          <div className="mt-3 grid gap-2 text-sm text-ink-500">
            {siteNavigation.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-court-900">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="font-semibold text-court-900">Infos</p>
          <div className="mt-3 grid gap-2 text-sm text-ink-500">
            {utilityNavigation.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-court-900">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="font-semibold text-court-900">{settings.club.city}</p>
          <p className="mt-3 flex gap-2 text-sm leading-6 text-ink-500">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            Gymnase des Aigremonts, 554 Rue de la Chappe, 41100 Vendôme
          </p>
          {settings.contact.email ? (
            <Link href={`mailto:${settings.contact.email}`} className="mt-3 flex gap-2 text-sm leading-6 text-ink-500 hover:text-court-900">
              <Mail className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {settings.contact.email}
            </Link>
          ) : null}
          {settings.contact.phone ? (
            <Link href={`tel:${settings.contact.phone.replace(/\s/g, "")}`} className="mt-3 flex gap-2 text-sm leading-6 text-ink-500 hover:text-court-900">
              <Phone className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {settings.contact.phone}
            </Link>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
