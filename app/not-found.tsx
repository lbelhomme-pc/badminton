import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-info">404</p>
      <h1 className="mt-3 text-3xl font-black text-court-900">Page introuvable</h1>
      <p className="mt-3 text-ink-500">Cette page n'existe pas ou a été déplacée.</p>
      <div className="mt-6 flex justify-center gap-3">
        <Link className="rounded-lg bg-court-500 px-4 py-3 text-sm font-semibold text-white" href="/">
          Retour à l'accueil
        </Link>
        <Link className="rounded-lg border border-court-200 bg-white px-4 py-3 text-sm font-semibold text-court-900" href="/planning">
          Voir les créneaux
        </Link>
      </div>
    </div>
  );
}
