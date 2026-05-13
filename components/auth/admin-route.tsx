"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { RouteMessage } from "@/components/auth/protected-route";

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { loading, configured, isAuthenticated, isAdmin } = useAuth();

  if (loading) {
    return <RouteMessage title="Chargement de l’administration" text="Vérification des droits en cours." />;
  }

  if (!configured) {
    return <RouteMessage title="Administration à configurer" text="Renseignez les variables Supabase pour activer l’espace responsable." />;
  }

  if (!isAuthenticated) {
    return <RouteMessage title="Connexion nécessaire" text="Accès réservé aux responsables du club." href="/connexion?redirect=/admin" label="Se connecter" />;
  }

  if (!isAdmin) {
    return <RouteMessage title="Accès réservé aux administrateurs" text="Ton compte n’a pas les droits nécessaires." href="/espace-adherent" label="Retour à mon espace" />;
  }

  return <>{children}</>;
}
