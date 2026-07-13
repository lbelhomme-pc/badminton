import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { canonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Cookies - CFVV",
  description: "Information sur les cookies, le stockage local et les services tiers du site CFVV.",
  alternates: canonical("/cookies")
};

const rules = [
  "Aucun bandeau n'est affiché pour les éléments strictement nécessaires au fonctionnement du site.",
  "Les traceurs non essentiels doivent être bloqués avant consentement.",
  "Le refus doit être aussi simple que l'acceptation.",
  "Le choix doit pouvoir être retiré ou modifié facilement.",
  "Aucune carte, vidéo, statistique ou réseau social non exempté ne doit être chargé avant accord."
];

export default function CookiesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="font-display text-sm font-bold uppercase text-court-600">Données et navigation</p>
      <h1 className="mt-2 text-4xl font-black text-court-900">Cookies et services tiers</h1>

      <section className="mt-8 rounded-lg border border-court-200 bg-white p-6 shadow-soft">
        <h2 className="text-2xl font-black text-court-900">État actuel</h2>
        <p className="mt-4 text-ink-600">
          Le site utilise les mécanismes nécessaires à l'authentification, à la sécurité, à l'affichage et à l'installation facultative de l'application
          mobile. Ces éléments sont nécessaires au service demandé par l'utilisateur.
        </p>
        <p className="mt-5 text-ink-600">
          À ce stade, aucun outil de publicité personnalisée ou de mesure d'audience non exemptée n'est volontairement chargé par le site.
        </p>
      </section>

      <Card className="mt-6 p-5">
        <h2 className="text-xl font-black text-court-900">Règles si le club ajoute un service tiers</h2>
        <ul className="mt-4 space-y-3 text-sm leading-6 text-ink-600">
          {rules.map((rule) => (
            <li key={rule} className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-court-500" aria-hidden="true" />
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="mt-6 p-5">
        <h2 className="text-xl font-black text-court-900">Préférences</h2>
        <p className="mt-3 text-sm leading-6 text-ink-600">
          Aucune préférence de traceur non essentiel n'est actuellement nécessaire. Si le club ajoute des statistiques, cartes intégrées ou vidéos, un
          panneau de préférences permanent devra être ajouté ici.
        </p>
        <p className="mt-5 text-sm leading-6 text-ink-600">
          Pour toute question, utilisez la page{" "}
          <Link href="/contact" className="font-bold text-court-900 underline">
            Contact
          </Link>
          .
        </p>
      </Card>
    </div>
  );
}
