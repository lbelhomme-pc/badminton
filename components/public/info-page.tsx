import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";

interface InfoCard {
  title: string;
  text: string;
  href?: string;
}

interface InfoPageProps {
  eyebrow: string;
  title: string;
  intro: string;
  cards: InfoCard[];
  children?: ReactNode;
}

export function InfoPage({ eyebrow, title, intro, cards, children }: InfoPageProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-lg border border-court-200 bg-white p-6 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-wide text-court-600">{eyebrow}</p>
        <h1 className="mt-3 max-w-4xl text-4xl font-black leading-tight text-court-900">{title}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-ink-500">{intro}</p>
      </section>

      {cards.length > 0 ? (
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

      {children ? <section className="mt-8">{children}</section> : null}
    </div>
  );
}
