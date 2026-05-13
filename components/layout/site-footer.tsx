import Link from "next/link";
import { MapPin } from "lucide-react";
import { siteNavigation, utilityNavigation } from "@/lib/navigation";

export function SiteFooter() {
  return (
    <footer className="border-t border-court-200 bg-white pb-24 md:pb-0">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-court-900 text-sm font-black text-shuttle">
              41
            </span>
            <div>
              <p className="font-black uppercase text-court-900">CFVV41</p>
              <p className="text-sm text-ink-500">Club des fous du Volant Vendômois.</p>
            </div>
          </div>
          <p className="mt-5 max-w-md text-sm leading-6 text-ink-500">
            Planning, réservations, volants, classements, espace adhérent et administration du club.
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
          <p className="font-semibold text-court-900">Gymnase principal</p>
          <p className="mt-3 flex gap-2 text-sm leading-6 text-ink-500">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            Gymnase des Aigremonts, 554 Rue de la Chappe, 41100 Vendôme
          </p>
        </div>
      </div>
    </footer>
  );
}
