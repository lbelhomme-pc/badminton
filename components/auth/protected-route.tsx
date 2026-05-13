"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { Card } from "@/components/ui/card";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { loading, isAuthenticated, configured } = useAuth();

  if (loading) {
    return <RouteMessage title="Chargement de l’espace adhérent" text="Vérification de la session en cours." />;
  }

  if (!configured) {
    return (
      <RouteMessage
        title="Connexion à configurer"
        text="Renseignez les variables Supabase pour activer l’espace adhérent."
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <RouteMessage
        title="Connexion nécessaire"
        text="Tu dois être connecté pour accéder à cette page."
        href={`/connexion?redirect=${encodeURIComponent(pathname)}`}
        label="Se connecter"
      />
    );
  }

  return <>{children}</>;
}

export function RouteMessage({ title, text, href, label }: { title: string; text: string; href?: string; label?: string }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Card className="p-6 text-center">
        <h1 className="text-3xl font-black text-court-900">{title}</h1>
        <p className="mt-3 text-ink-500">{text}</p>
        {href ? (
          <Link href={href} className="mt-6 inline-flex h-11 items-center rounded-lg bg-court-500 px-4 font-semibold text-white">
            {label}
          </Link>
        ) : null}
      </Card>
    </div>
  );
}
