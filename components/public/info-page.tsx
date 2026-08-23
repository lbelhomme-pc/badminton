import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { InteriorHero, type InteriorHeroProps } from "@/components/public/interior-hero";
import { Card } from "@/components/ui/card";
import { getPublicClubSettings } from "@/services/club.service";

interface InfoCard {
  title: string;
  text: string;
  href?: string;
}

interface InfoPageProps {
  contentKey?: string;
  eyebrow: string;
  title: string;
  intro: string;
  cards: InfoCard[];
  hero?: Omit<InteriorHeroProps, "eyebrow" | "title" | "intro">;
  children?: ReactNode;
}

export async function InfoPage({ contentKey, eyebrow, title, intro, cards, hero, children }: InfoPageProps) {
  const settings = contentKey ? await getPublicClubSettings() : null;
  const override = contentKey ? settings?.content.pages[contentKey] : undefined;
  const displayedEyebrow = override?.eyebrow || eyebrow;
  const displayedTitle = override?.title || title;
  const displayedIntro = override?.intro || intro;
  const configuredPhoto = override?.imageUrl
    ? {
        id: "homeHero" as const,
        src: override.imageUrl,
        alt: override.imageAlt || "",
        width: 1400,
        height: 900
      }
    : undefined;
  const displayedHero = hero || configuredPhoto ? { ...(hero ?? {}), photo: configuredPhoto ?? hero?.photo } : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {displayedHero ? (
        <InteriorHero eyebrow={displayedEyebrow} title={displayedTitle} intro={displayedIntro} {...displayedHero} />
      ) : (
        <section className="rounded-lg border border-court-200 bg-white p-6 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-wide text-court-600">{displayedEyebrow}</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-black leading-tight text-court-900">{displayedTitle}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-ink-500">{displayedIntro}</p>
        </section>
      )}

      {override?.body ? (
        <section className="mt-8">
          <Card className="p-6">
            <div className="whitespace-pre-line text-base leading-8 text-ink-600">{override.body}</div>
          </Card>
        </section>
      ) : cards.length > 0 ? (
        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => {
            const content = (
              <Card className="h-full p-5">
                <h2 className="text-xl font-black text-court-900">{card.title}</h2>
                <p className="mt-2 text-sm leading-6 text-ink-500">{card.text}</p>
                {card.href ? (
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-court-600">
                    Ouvrir
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                ) : null}
              </Card>
            );

            return card.href ? (
              <Link key={card.title} href={card.href} className="block">
                {content}
              </Link>
            ) : (
              <div key={card.title}>{content}</div>
            );
          })}
        </section>
      ) : null}

      {!override?.body && children ? <section className="mt-8">{children}</section> : null}
    </div>
  );
}
