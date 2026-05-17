"use client";

import { useEffect, useState } from "react";
import { AdminRoute } from "@/components/auth/admin-route";
import { useAuth } from "@/components/auth/auth-provider";
import { appRoleLabels, normalizeAppRoles, type AppRole } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fetchProfiles, updateUserRoles, type ProfileRow } from "@/services/supabase-data.service";

const roleOptions = [
  { value: "member", description: "Accès à l'espace adhérent, réservations et commandes." },
  { value: "manager", description: "Gestion opérationnelle : créneaux, réservations, volants, actualités." },
  { value: "admin", description: "Gestion des membres, rôles, tarifs et paramètres sensibles." },
  { value: "super_admin", description: "Accès technique complet. À réserver au propriétaire du projet." }
] satisfies Array<{ value: AppRole; description: string }>;

const roleBadgeTone: Record<AppRole, string> = {
  member: "bg-court-100 text-court-600",
  manager: "bg-yellow-100 text-yellow-800",
  admin: "bg-orange-100 text-orange-800",
  super_admin: "bg-court-900 text-white"
};

function sameRoles(a: AppRole[], b: AppRole[]) {
  const normalizedA = normalizeAppRoles(a);
  const normalizedB = normalizeAppRoles(b);
  return normalizedA.length === normalizedB.length && normalizedA.every((role, index) => role === normalizedB[index]);
}

function toggleRole(currentRoles: AppRole[], role: AppRole) {
  if (role === "member") {
    return normalizeAppRoles(currentRoles);
  }

  const roles = new Set(currentRoles);

  if (roles.has(role)) {
    roles.delete(role);
  } else {
    roles.add(role);
  }

  return normalizeAppRoles([...roles]);
}

function RoleBadges({ roles }: { roles: AppRole[] }) {
  return (
    <>
      {normalizeAppRoles(roles).map((role) => (
        <span key={role} className={`rounded-full px-3 py-1 text-xs font-black ${roleBadgeTone[role]}`}>
          {appRoleLabels[role]}
        </span>
      ))}
    </>
  );
}

const fallbackRoles = ["member"] satisfies AppRole[];

function getSelectedRoles(profile: ProfileRow, rolesById: Record<string, AppRole[]>) {
  return rolesById[profile.id] ?? profile.roles ?? fallbackRoles;
}

function roleChangeSummary(profile: ProfileRow, rolesById: Record<string, AppRole[]>) {
  const selectedRoles = getSelectedRoles(profile, rolesById);
  return sameRoles(selectedRoles, profile.roles) ? null : "Modifications non enregistrées";
}

const emptyProfilesMessage = "Aucun adhérent trouvé pour le moment.";

const selfRoleLockMessage = "Ton propre rôle est verrouillé pour éviter une perte d'accès.";

const roleHelp =
  "Les rôles avancés sont synchronisés avec l'ancien rôle du profil pour garder le site compatible pendant la migration Supabase.";

const adminOnlyHelp = "Cette page reste réservée aux admins. Les gestionnaires auront ensuite des accès ciblés par module.";

const pageIntro = "Liste réservée aux responsables. Les visiteurs ne peuvent pas lire ces données personnelles.";

const migrationWarning =
  "Si Supabase n'a pas encore reçu les scripts SQL de l'étape 1, le site utilise automatiquement l'ancien champ rôle en compatibilité.";

const roleListTitle = "Rôles sur le site";

const saveLabel = "Enregistrer les rôles";

const legacyLabel = "Rôle historique";

const contactFallback = "Téléphone non renseigné";

const memberFallback = "Adhérent";

const roleUnavailableMessage = "Rôles indisponibles";

const roleLockedLabel = "verrouillé";

const changeLabel = "à enregistrer";

const noCategoryLabel = "Catégorie non renseignée";

const roleExplanationTitle = "Repères";

const roleExplanationItems = [
  "Adhérent : accès au compte, réservations et commandes.",
  "Gestionnaire : gestion opérationnelle du club.",
  "Admin : gestion des membres et des droits.",
  "Super admin : niveau technique exceptionnel."
];

export function AdminAdherents() {
  return (
    <AdminRoute>
      <AdminAdherentsContent />
    </AdminRoute>
  );
}

function AdminAdherentsContent() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [rolesById, setRolesById] = useState<Record<string, AppRole[]>>({});
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const result = await fetchProfiles();
    setProfiles(result.data);
    setRolesById(Object.fromEntries(result.data.map((profile) => [profile.id, profile.roles])));
    setMessage(result.error);
  }

  useEffect(() => {
    load();
  }, []);

  async function saveRole(profile: ProfileRow) {
    const roles = getSelectedRoles(profile, rolesById);

    if (profile.id === user?.id && !sameRoles(roles, profile.roles)) {
      setMessage("Pour éviter de te bloquer, tes propres rôles ne peuvent pas être modifiés ici.");
      return;
    }

    const result = await updateUserRoles(profile.id, roles);
    setMessage(result.message);
    if (result.ok) await load();
  }

  function setProfileRoles(profile: ProfileRow, role: AppRole) {
    setRolesById((current) => ({
      ...current,
      [profile.id]: toggleRole(getSelectedRoles(profile, current), role)
    }));
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-black text-court-900">Adhérents</h1>
      <p className="mt-3 max-w-2xl text-ink-500">{pageIntro}</p>

      {message ? <p className="mt-6 rounded-lg bg-court-100 px-4 py-3 text-sm font-semibold text-court-900">{message}</p> : null}

      <section className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-5">
          <h2 className="text-xl font-black text-court-900">{roleExplanationTitle}</h2>
          <div className="mt-3 grid gap-2 text-sm text-ink-500">
            {roleExplanationItems.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="text-xl font-black text-court-900">Migration douce</h2>
          <p className="mt-3 text-sm leading-6 text-ink-500">{roleHelp}</p>
          <p className="mt-2 text-sm leading-6 text-ink-500">{adminOnlyHelp}</p>
          <p className="mt-2 text-sm leading-6 text-ink-500">{migrationWarning}</p>
        </Card>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {profiles.length === 0 ? <Card className="p-5 text-sm font-semibold text-ink-500">{emptyProfilesMessage}</Card> : null}
        {profiles.map((profile) => (
          <Card key={profile.id} className="p-5">
            <h2 className="text-xl font-black text-court-900">
              {[profile.prenom, profile.nom].filter(Boolean).join(" ") || profile.email || memberFallback}
            </h2>
            <p className="mt-2 text-sm text-ink-500">{profile.email}</p>
            <p className="mt-1 text-sm text-ink-500">{profile.telephone || contactFallback}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <RoleBadges roles={profile.roles} />
              <span className="rounded-full bg-court-50 px-3 py-1 text-xs font-black text-ink-600">
                {legacyLabel} : {profile.role}
              </span>
              <span className="rounded-full bg-court-50 px-3 py-1 text-xs font-black text-ink-600">{profile.categorie || noCategoryLabel}</span>
              {roleChangeSummary(profile, rolesById) ? (
                <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-black text-yellow-800">{changeLabel}</span>
              ) : null}
              {profile.id === user?.id ? (
                <span className="rounded-full bg-court-100 px-3 py-1 text-xs font-black text-ink-600">{roleLockedLabel}</span>
              ) : null}
            </div>
            <div className="mt-5 rounded-lg border border-court-200 bg-court-50 p-3">
              <p className="text-sm font-black text-court-900">{roleListTitle}</p>
              <div className="mt-3 grid gap-3">
                {roleOptions.map((option) => {
                  const selectedRoles = getSelectedRoles(profile, rolesById);
                  const checked = selectedRoles.includes(option.value);
                  const disabled = profile.id === user?.id || option.value === "member";

                  return (
                    <label key={option.value} className="flex gap-3 rounded-lg bg-white p-3 text-sm">
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={disabled}
                        onChange={() => setProfileRoles(profile, option.value)}
                        className="mt-1 h-4 w-4 rounded border-court-300 text-court-600"
                      />
                      <span>
                        <span className="block font-black text-court-900">{appRoleLabels[option.value]}</span>
                        <span className="mt-1 block text-xs leading-5 text-ink-500">{option.description}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
              {profile.roles.length === 0 ? <p className="mt-2 text-xs font-semibold text-orange-700">{roleUnavailableMessage}</p> : null}
              <Button className="mt-3 w-full" type="button" disabled={profile.id === user?.id} onClick={() => saveRole(profile)}>
                {saveLabel}
              </Button>
              {profile.id === user?.id ? (
                <p className="mt-2 text-xs font-semibold text-ink-500">{selfRoleLockMessage}</p>
              ) : null}
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
}
