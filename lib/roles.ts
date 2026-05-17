export type LegacyClubRole = "adherent" | "entraineur" | "bureau" | "admin";
export type AppRole = "member" | "manager" | "admin" | "super_admin";

export const appRoleOrder: AppRole[] = ["member", "manager", "admin", "super_admin"];

export const appRoleLabels: Record<AppRole, string> = {
  member: "Adhérent",
  manager: "Gestionnaire",
  admin: "Admin",
  super_admin: "Super admin"
};

const validAppRoles = new Set<AppRole>(appRoleOrder);

export function normalizeAppRoles(values: Array<string | AppRole | null | undefined>) {
  const roles = new Set<AppRole>();

  values.forEach((value) => {
    if (value && validAppRoles.has(value as AppRole)) {
      roles.add(value as AppRole);
    }
  });

  if (roles.has("super_admin")) {
    roles.add("admin");
    roles.add("manager");
    roles.add("member");
  }

  if (roles.has("admin")) {
    roles.add("manager");
    roles.add("member");
  }

  if (roles.has("manager")) {
    roles.add("member");
  }

  if (roles.size === 0) {
    roles.add("member");
  }

  return appRoleOrder.filter((role) => roles.has(role));
}

export function legacyClubRoleToAppRoles(role?: string | null) {
  switch (role) {
    case "admin":
    case "bureau":
      return normalizeAppRoles(["member", "manager", "admin"]);
    case "entraineur":
      return normalizeAppRoles(["member", "manager"]);
    default:
      return normalizeAppRoles(["member"]);
  }
}

export function appRolesToLegacyClubRole(roles: AppRole[]): LegacyClubRole {
  const normalized = normalizeAppRoles(roles);

  if (normalized.includes("admin") || normalized.includes("super_admin")) {
    return "admin";
  }

  if (normalized.includes("manager")) {
    return "bureau";
  }

  return "adherent";
}

export function hasAppRole(roles: AppRole[], role: AppRole) {
  return normalizeAppRoles(roles).includes(role);
}
