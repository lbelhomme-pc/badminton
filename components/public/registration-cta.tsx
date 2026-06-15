import Link from "next/link";
import { ArrowRight, CalendarDays, ExternalLink, HelpCircle, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { getPublicClubSettings, getRegistrationLinkStatus } from "@/services/club.service";

interface RegistrationCtaProps {
  className?: string;
  compact?: boolean;
  title?: string;
  intro?: string;
  showOfficialLink?: boolean;
}

export async function RegistrationCta({
  className,
  compact = false,
  title = "Prêt à rejoindre le CF2V41 ?",
  intro = "Choisis d'abord le créneau adapté ou demande une séance d'essai. Le club confirme ensuite les documents et la licence à finaliser.",
  showOfficialLink = true
}: RegistrationCtaProps) {
  const settings = await getPublicClubSettings();
  const registration = getRegistrationLinkStatus(settings);

  return (
    <section className={cn("rounded-lg border border-court-200 bg-white p-5 shadow-soft", className)}>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-court-600">Inscription</p>
          <h2 className="mt-2 text-2xl font-black text-court-900">{title}</h2>
          <p className="mt-3 text-sm leading-6 text-ink-500 sm:text-base">{intro}</p>
          {showOfficialLink ? (
            <p className="mt-3 rounded-lg bg-court-50 px-4 py-3 text-sm font-semibold leading-6 text-court-800">
              {registration.sourceLabel} : {registration.confirmationMessage}
            </p>
          ) : null}
        </div>

        <div className={cn("grid gap-3 sm:grid-cols-2", compact ? "lg:min-w-[360px]" : "lg:min-w-[520px]")}>
          <Link
            href="/inscription"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-court-500 px-5 font-semibold text-white shadow-soft transition hover:bg-court-600"
          >
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            Voir le parcours
          </Link>
          <Link
            href="/inscriptions/seance-essai"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-court-200 bg-white px-5 font-semibold text-court-900 transition hover:bg-court-50"
          >
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
            Demander un essai
          </Link>
          {showOfficialLink ? (
            <Link
              href={registration.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-court-200 bg-white px-5 font-semibold text-court-900 transition hover:bg-court-50 sm:col-span-2"
            >
              {registration.isFallback ? "Lien inscription à confirmer" : "Ouvrir l'inscription officielle"}
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </Link>
          ) : (
            <Link
              href="/contact"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-court-200 bg-white px-5 font-semibold text-court-900 transition hover:bg-court-50"
            >
              <HelpCircle className="h-4 w-4" aria-hidden="true" />
              Poser une question
            </Link>
          )}
          {!compact && showOfficialLink ? (
            <Link
              href="/contact"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-court-200 bg-white px-5 font-semibold text-court-900 transition hover:bg-court-50 sm:col-span-2"
            >
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
              Une question avant de venir ?
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
