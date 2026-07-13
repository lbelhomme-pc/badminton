"use client";

import type { ReactNode } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { RouteMessage } from "@/components/auth/protected-route";
import { isActiveSeasonStatus } from "@/lib/member-access";

interface AdminRouteProps {
  children: ReactNode;
  requiredRole?: "manager" | "admin";
}

export function AdminRoute({ children, requiredRole = "admin" }: AdminRouteProps) {
  const { loading, configured, isAuthenticated, isManager, isAdmin, profile } = useAuth();
  const hasAccess = requiredRole === "manager" ? isManager || isAdmin : isAdmin;

  if (loading) {
    return <RouteMessage title="Chargement de l'administration" text="Vérification des droits en cours." />;
  }

  if (!configured) {
    return <RouteMessage title="Administration à configurer" text="Renseigne les variables Supabase pour activer l'espace responsable." />;
  }

  if (!isAuthenticated) {
    return (
      <RouteMessage
        title="Connexion nécessaire"
        text="Accès réservé aux responsables du club."
        href="/connexion?redirect=/admin"
        label="Se connecter"
      />
    );
  }

  if (!profile || !isActiveSeasonStatus(profile.statut)) {
    return (
      <RouteMessage
        title="Compte responsable inactif"
        text="Ton profil doit être actif pour accéder à l'administration."
        href="/contact"
        label="Contacter le club"
      />
    );
  }

  if (!hasAccess) {
    return (
      <RouteMessage
        title={requiredRole === "manager" ? "Accès réservé aux responsables" : "Accès réservé aux administrateurs"}
        text="Ton compte n'a pas les droits nécessaires."
        href="/espace-adherent"
        label="Retour à mon espace"
      />
    );
  }

  return <>{children}</>;
}
