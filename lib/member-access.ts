import { hasAppRole, type AppRole } from "@/lib/roles";

export type SeasonStatus = "actif" | "en_attente" | "suspendu" | "non_renouvele";
export type LegacySeasonStatus = "actif" | "en_attente" | "inactif" | "ancien" | "suspendu" | "non_renouvele";
export type MemberAccessRole = "adherent" | "encadrant" | "editeur" | "administrateur";

export interface AccessProfile {
  role?: string | null;
  statut?: string | null;
}

export interface MemberAccessInput {
  configured: boolean;
  loading: boolean;
  isAuthenticated: boolean;
  profile: AccessProfile | null;
  roles: AppRole[];
}

export type MemberAccessState =
  | "loading"
  | "not_configured"
  | "anonymous"
  | "profile_missing"
  | "pending"
  | "suspended"
  | "not_renewed"
  | "forbidden"
  | "allowed";

export const seasonStatusLabels: Record<SeasonStatus, string> = {
  actif: "Actif",
  en_attente: "En attente",
  suspendu: "Suspendu",
  non_renouvele: "Non renouvelé"
};

export const memberAccessRoleLabels: Record<MemberAccessRole, string> = {
  adherent: "Adhérent",
  encadrant: "Encadrant",
  editeur: "Éditeur",
  administrateur: "Administrateur"
};

export function normalizeSeasonStatus(status: string | null | undefined): SeasonStatus {
  switch (status) {
    case "actif":
      return "actif";
    case "en_attente":
      return "en_attente";
    case "suspendu":
    case "inactif":
      return "suspendu";
    case "non_renouvele":
    case "ancien":
      return "non_renouvele";
    default:
      return "en_attente";
  }
}

export function isActiveSeasonStatus(status: string | null | undefined) {
  return normalizeSeasonStatus(status) === "actif";
}

export function appRolesToMemberAccessRoles(roles: AppRole[], legacyRole?: string | null): MemberAccessRole[] {
  const accessRoles = new Set<MemberAccessRole>();

  if (hasAppRole(roles, "member") || legacyRole === "adherent" || legacyRole === "entraineur" || legacyRole === "bureau" || legacyRole === "admin") {
    accessRoles.add("adherent");
  }

  if (legacyRole === "entraineur" || hasAppRole(roles, "manager") || hasAppRole(roles, "admin")) {
    accessRoles.add("encadrant");
  }

  if (legacyRole === "bureau" || hasAppRole(roles, "manager") || hasAppRole(roles, "admin")) {
    accessRoles.add("editeur");
  }

  if (legacyRole === "admin" || hasAppRole(roles, "admin") || hasAppRole(roles, "super_admin")) {
    accessRoles.add("administrateur");
  }

  return ["adherent", "encadrant", "editeur", "administrateur"].filter((role) => accessRoles.has(role as MemberAccessRole)) as MemberAccessRole[];
}

export function getMemberAccessState(input: MemberAccessInput): MemberAccessState {
  if (input.loading) return "loading";
  if (!input.configured) return "not_configured";
  if (!input.isAuthenticated) return "anonymous";
  if (!input.profile) return "profile_missing";

  const seasonStatus = normalizeSeasonStatus(input.profile.statut);
  if (seasonStatus === "en_attente") return "pending";
  if (seasonStatus === "suspendu") return "suspended";
  if (seasonStatus === "non_renouvele") return "not_renewed";

  const accessRoles = appRolesToMemberAccessRoles(input.roles, input.profile.role);
  if (!accessRoles.includes("adherent")) return "forbidden";

  return "allowed";
}

export function memberAccessMessage(state: MemberAccessState) {
  switch (state) {
    case "loading":
      return {
        title: "Chargement de l'espace adhérent",
        text: "Vérification de la session en cours."
      };
    case "not_configured":
      return {
        title: "Connexion à configurer",
        text: "Les variables Supabase doivent être configurées pour activer l'espace adhérent."
      };
    case "anonymous":
      return {
        title: "Connexion nécessaire",
        text: "Tu dois être connecté pour accéder à cette page."
      };
    case "profile_missing":
      return {
        title: "Profil introuvable",
        text: "Ton compte de connexion existe, mais le profil adhérent n'est pas encore rattaché. Contacte le bureau."
      };
    case "pending":
      return {
        title: "Compte en attente d'activation",
        text: "Ton compte doit être validé par le club avant d'accéder aux réservations et informations internes."
      };
    case "suspended":
      return {
        title: "Compte suspendu",
        text: "L'accès à l'espace adhérent est momentanément suspendu. Contacte le bureau pour régulariser la situation."
      };
    case "not_renewed":
      return {
        title: "Licence non renouvelée",
        text: "Ton accès adhérent est désactivé pour la saison en cours, sans suppression de ton historique."
      };
    case "forbidden":
      return {
        title: "Accès refusé",
        text: "Ton compte ne possède pas le rôle adhérent nécessaire."
      };
    default:
      return {
        title: "Accès autorisé",
        text: ""
      };
  }
}
