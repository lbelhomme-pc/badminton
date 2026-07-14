import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Accessibilité - CFVV",
  description: "Engagements d'accessibilité numérique du site du Club des fous du Volants Vendômois."
};

export default function AccessibilitePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="font-display text-sm font-bold uppercase text-court-600">Accessibilité numérique</p>
      <h1 className="mt-2 text-4xl font-black text-court-900">Accessibilité</h1>
      <section className="mt-8 rounded-lg border border-court-200 bg-white p-6 shadow-soft">
        <p className="text-ink-600">
          Le CFVV cherche à proposer un site lisible, utilisable au clavier et confortable sur mobile. Cette page sera complétée avec une
          déclaration d'accessibilité plus détaillée après audit RGAA.
        </p>
        <ul className="mt-6 grid gap-3 text-ink-600">
          <li>Contrastes renforcés sur les boutons et liens importants.</li>
          <li>Lien d'évitement vers le contenu principal.</li>
          <li>Menu mobile utilisable au clavier et fermeture par la touche Échap.</li>
          <li>Textes alternatifs prévus pour les images utiles.</li>
        </ul>
        <p className="mt-6 text-ink-600">
          En cas de difficulté d'accès à une information, contactez le club depuis la page{" "}
          <Link href="/contact" className="font-bold text-court-900 underline">
            Contact
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
