import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, CalendarCheck, Check, Clock, Info, MapPin, Star, Users } from "lucide-react";
import type { ConfiguredClubPhotoSlot } from "@/lib/club-photos";
import { cn } from "@/lib/utils";
import { getPublicClubSettings } from "@/services/club.service";
import { AdminEditLink } from "@/components/admin/admin-edit-link";
import { InlineHeroBadgesEditor } from "@/components/admin/inline-hero-badges-editor";
import { defaultCreneauxHeroBadges, pageEditorId } from "@/lib/site-content";
import type { HeroBadgeIcon } from "@/lib/site-content";

type HeroTone = "creneaux" | "bureau" | "agenda" | "club" | "partenaires" | "contact";

interface InteriorHeroAction {
  href: string;
  label: string;
  variant?: "primary" | "secondary";
  icon?: ReactNode;
  external?: boolean;
}

interface InteriorHeroBadge {
  label: string;
  icon?: ReactNode;
}

export interface InteriorHeroProps {
  contentKey?: string;
  eyebrow: string;
  title: string;
  intro: string;
  tone?: HeroTone;
  photo?: ConfiguredClubPhotoSlot;
  visualLabel?: string;
  actions?: InteriorHeroAction[];
  badges?: InteriorHeroBadge[];
}

const toneLabels: Record<HeroTone, { kicker: string; detail: string }> = {
  creneaux: { kicker: "Horaires", detail: "Jeunes, adultes, loisirs et réservation" },
  bureau: { kicker: "Équipe bénévole", detail: "Des référents identifiés pour chaque sujet" },
  agenda: { kicker: "Vie du club", detail: "Événements, compétitions et temps forts" },
  club: { kicker: "Badminton à Vendôme", detail: "Accueil, progression et convivialité" },
  partenaires: { kicker: "Réseau local", detail: "Soutenir une association sportive active" },
  contact: { kicker: "Contact CFVV", detail: "Une demande claire, une réponse du bureau" }
};

const actionClasses = {
  primary: "bg-court-500 text-white hover:bg-court-600",
  secondary: "border border-white/35 bg-white/8 text-white hover:bg-white/14"
};

export async function InteriorHero({
  contentKey,
  eyebrow,
  title,
  intro,
  tone = "club",
  photo,
  visualLabel,
  actions = [],
  badges = []
}: InteriorHeroProps) {
  const settings = contentKey ? await getPublicClubSettings() : null;
  const override = contentKey ? settings?.content.pages[contentKey] : undefined;
  const configuredPhoto = override?.imageUrl
    ? { id: "homeHero" as const, src: override.imageUrl, alt: override.imageAlt || "", width: 1400, height: 900 }
    : null;
  const heroPhoto = configuredPhoto ?? (photo?.src ? photo : null);
  const toneLabel = toneLabels[tone];
  const displayedEyebrow = override?.eyebrow || eyebrow;
  const displayedTitle = override?.title || title;
  const displayedIntro = override?.intro || intro;
  const displayedBadges = override?.badges === undefined
    ? badges
    : override.badges.map((badge) => ({ ...badge, icon: badgeIcon(badge.icon) }));
  const directlyEditableBadges = contentKey === "/jouer-au-club/creneaux"
    ? (override?.badges ?? defaultCreneauxHeroBadges)
    : null;

  return (
    <section data-admin-editable={contentKey ? true : undefined} className="relative overflow-hidden rounded bg-[#031d2b] text-white shadow-[0_16px_35px_rgba(3,29,43,0.22)]">
      {contentKey ? <AdminEditLink href={`/admin/parametres#${pageEditorId(contentKey)}`} label="ce bandeau" /> : null}
      {heroPhoto ? (
        <img
          src={heroPhoto.src}
          alt=""
          aria-hidden="true"
          width={heroPhoto.width}
          height={heroPhoto.height}
          className="absolute inset-0 h-full w-full object-cover opacity-44"
          loading="eager"
          decoding="sync"
        />
      ) : null}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(255,255,255,0.32),transparent_5%),radial-gradient(circle_at_64%_22%,rgba(255,255,255,0.14),transparent_4%),linear-gradient(90deg,rgba(3,29,43,0.98)_0%,rgba(3,29,43,0.86)_42%,rgba(2,45,62,0.46)_76%,rgba(0,151,169,0.46)_100%)]" />
      <div className="absolute inset-y-0 right-0 hidden w-[52%] bg-[radial-gradient(circle_at_52%_40%,rgba(0,151,169,0.50),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0))] lg:block" />
      <div className="absolute bottom-0 right-0 hidden h-44 w-[390px] -rotate-6 opacity-90 lg:block" aria-hidden="true">
        <div className="cfvv-brush absolute inset-x-14 bottom-7 h-24" />
      </div>
      <div className="absolute right-6 top-16 hidden rotate-[-18deg] font-display text-[8rem] font-black leading-none text-white/10 lg:block" aria-hidden="true">
        CFVV
      </div>

      <div className="relative grid min-h-[320px] items-center gap-7 px-6 py-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_0.52fr] lg:px-12 lg:py-12">
        <div className="max-w-4xl">
          <p className="font-display text-sm font-black uppercase text-[#00a8bc]">{displayedEyebrow}</p>
          <h1 className="mt-4 text-4xl font-black uppercase leading-[0.98] text-white sm:text-5xl lg:text-6xl">{displayedTitle}</h1>
          <p className="mt-6 max-w-3xl text-base font-medium leading-7 text-white/88 sm:text-lg sm:leading-8">{displayedIntro}</p>

          <div className="mt-7 flex flex-col gap-4 xl:flex-row xl:items-center">
            {actions.length > 0 ? (
              <div className="flex flex-col gap-3 sm:flex-row">
                {actions.map((action) => (
                  <Link
                    key={action.href + action.label}
                    href={action.href}
                    target={action.external ? "_blank" : undefined}
                    rel={action.external ? "noopener noreferrer" : undefined}
                    className={cn(
                      "inline-flex min-h-12 items-center justify-center gap-2 rounded px-5 py-3 font-display text-sm font-black uppercase transition motion-reduce:transition-none",
                      actionClasses[action.variant ?? "primary"]
                    )}
                  >
                    {action.icon}
                    {action.label}
                    {!action.icon ? <ArrowRight className="h-4 w-4" aria-hidden="true" /> : null}
                  </Link>
                ))}
              </div>
            ) : null}

            {displayedBadges.length > 0 || directlyEditableBadges ? (
              <div className="flex flex-wrap items-center gap-2">
                {displayedBadges.map((badge) => (
                  <span
                    key={badge.label}
                    className="inline-flex items-center gap-2 rounded border border-white/18 bg-white/10 px-3 py-2 font-display text-xs font-black uppercase text-white"
                  >
                    {badge.icon}
                    {badge.label}
                  </span>
                ))}
                {directlyEditableBadges && settings && contentKey ? (
                  <InlineHeroBadgesEditor
                    content={settings.content}
                    contentKey={contentKey}
                    badges={directlyEditableBadges}
                  />
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        <div className="hidden lg:flex lg:justify-end">
          <div className="max-w-xs rounded border border-white/18 bg-white/10 p-5 backdrop-blur-sm">
            <p className="font-display text-xs font-black uppercase text-[#00a8bc]">{visualLabel ?? toneLabel.kicker}</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-white/82">{toneLabel.detail}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function badgeIcon(icon: HeroBadgeIcon) {
  const className = "h-4 w-4";
  const props = { className, "aria-hidden": true as const };

  switch (icon) {
    case "calendar": return <CalendarCheck {...props} />;
    case "map-pin": return <MapPin {...props} />;
    case "clock": return <Clock {...props} />;
    case "users": return <Users {...props} />;
    case "check": return <Check {...props} />;
    case "star": return <Star {...props} />;
    case "none": return null;
    case "info":
    default: return <Info {...props} />;
  }
}
