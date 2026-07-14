"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { AdminFeedback, actionFeedback, errorFeedback, loadingFeedback, successFeedback, type AdminFeedbackMessage } from "@/components/admin/admin-feedback";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminRoute } from "@/components/auth/admin-route";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { parseMemberCsvPreview, type CsvImportIssue, type CsvImportRow } from "@/lib/back-office-rules";
import { appRoleLabels, normalizeAppRoles, type AppRole } from "@/lib/roles";
import { invitationStatusLabel } from "@/lib/member-invitations";
import { clubRoleLabel } from "@/lib/status-labels";
import {
  createMemberInvitations,
  fetchMemberInvitations,
  fetchProfiles,
  prepareMemberInvitationReminder,
  revokeMemberInvitation,
  updateUserRoles,
  type CreatedMemberInvitation,
  type MemberInvitationRow,
  type ProfileRow
} from "@/services/supabase-data.service";

const roleOptions = [
  { value: "member", description: "Acces a l'espace adherent, reservations et commandes." },
  { value: "manager", description: "Gestion operationnelle : creneaux, reservations, volants, actualites." },
  { value: "admin", description: "Gestion des membres, roles, tarifs et parametres sensibles." },
  { value: "super_admin", description: "Acces technique complet. A reserver au proprietaire du projet." }
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
  if (role === "member") return normalizeAppRoles(currentRoles);

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

function profileDisplayName(profile: ProfileRow) {
  return [profile.prenom, profile.nom].filter(Boolean).join(" ") || profile.email || "cet adherent";
}

function roleChangeSummary(profile: ProfileRow, rolesById: Record<string, AppRole[]>) {
  const selectedRoles = getSelectedRoles(profile, rolesById);
  return sameRoles(selectedRoles, profile.roles) ? null : "Modifications non enregistrees";
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Non renseigne";
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function invitationName(invitation: MemberInvitationRow) {
  return [invitation.metadata?.prenom, invitation.metadata?.nom].filter(Boolean).join(" ") || invitation.email;
}

function csvExample() {
  return "email;prenom;nom;licence_ffbad;role\nalice@example.fr;Alice;Dupont;12345678;member\njulien@example.fr;Julien;Martin;;manager";
}

function csvIssuesByRow(issues: CsvImportIssue[]) {
  return issues.reduce<Record<number, CsvImportIssue[]>>((acc, issue) => {
    acc[issue.row] = [...(acc[issue.row] ?? []), issue];
    return acc;
  }, {});
}

function activationMailto(link: CreatedMemberInvitation) {
  const subject = encodeURIComponent("Invitation a activer ton espace CFVV");
  const body = encodeURIComponent(
    `Bonjour ${link.prenom || link.nom || ""},\n\nLe club t'invite a activer ton espace adherent CFVV.\n\nLien d'activation : ${link.activationUrl}\n\nCe lien expire le ${formatDate(link.expiresAt)}.\n\nSportivement,\nLe bureau du CFVV`
  );
  return `mailto:${encodeURIComponent(link.email)}?subject=${subject}&body=${body}`;
}

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
  const [invitations, setInvitations] = useState<MemberInvitationRow[]>([]);
  const [rolesById, setRolesById] = useState<Record<string, AppRole[]>>({});
  const [csvText, setCsvText] = useState("");
  const [generatedLinks, setGeneratedLinks] = useState<CreatedMemberInvitation[]>([]);
  const [feedback, setFeedback] = useState<AdminFeedbackMessage>(null);

  async function load() {
    const [profilesResult, invitationsResult] = await Promise.all([fetchProfiles(), fetchMemberInvitations()]);
    setProfiles(profilesResult.data);
    setInvitations(invitationsResult.data);
    setRolesById(Object.fromEntries(profilesResult.data.map((profile) => [profile.id, profile.roles])));

    const error = profilesResult.error ?? invitationsResult.error;
    if (error) setFeedback(errorFeedback(error));
  }

  useEffect(() => {
    load();
  }, []);

  const csvPreview = useMemo(
    () =>
      parseMemberCsvPreview(csvText, {
        existingEmails: profiles.map((profile) => profile.email ?? ""),
        existingLicences: profiles.map((profile) => profile.licence_ffbad ?? ""),
        pendingInvitationEmails: invitations.filter((invitation) => invitation.status === "pending").map((invitation) => invitation.email)
      }),
    [csvText, invitations, profiles]
  );

  const rowIssues = useMemo(() => csvIssuesByRow(csvPreview.issues), [csvPreview.issues]);
  const canCreateInvitations = csvPreview.rows.length > 0 && csvPreview.issues.length === 0;

  async function saveRole(profile: ProfileRow) {
    const roles = getSelectedRoles(profile, rolesById);

    if (profile.id === user?.id && !sameRoles(roles, profile.roles)) {
      setFeedback(errorFeedback("Pour eviter de te bloquer, tes propres roles ne peuvent pas etre modifies ici."));
      return;
    }

    if (!sameRoles(roles, profile.roles)) {
      const confirmed = window.confirm(`Modifier les roles de ${profileDisplayName(profile)} ?`);
      if (!confirmed) return;
    }

    setFeedback(loadingFeedback("Mise a jour des roles en cours..."));
    const result = await updateUserRoles(profile.id, roles);
    setFeedback(result.ok ? successFeedback(`Roles mis a jour pour ${profileDisplayName(profile)}.`) : actionFeedback(result));
    if (result.ok) await load();
  }

  function setProfileRoles(profile: ProfileRow, role: AppRole) {
    setRolesById((current) => ({
      ...current,
      [profile.id]: toggleRole(getSelectedRoles(profile, current), role)
    }));
  }

  async function readCsvFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setCsvText(await file.text());
    setGeneratedLinks([]);
  }

  async function createInvitations(rows: CsvImportRow[]) {
    if (!canCreateInvitations) {
      setFeedback(errorFeedback("Corrige les erreurs de l'aperçu CSV avant de créer les invitations."));
      return;
    }

    const confirmed = window.confirm(`Créer ${rows.length} invitation(s) ? Les liens seront affichés une seule fois.`);
    if (!confirmed) return;

    setFeedback(loadingFeedback("Creation des invitations en cours..."));
    const result = await createMemberInvitations(rows, window.location.origin, user?.id);
    setGeneratedLinks(result.links);
    setFeedback(actionFeedback(result));
    if (result.ok) {
      setCsvText("");
      await load();
    }
  }

  async function copyLink(link: string) {
    await navigator.clipboard.writeText(link);
    setFeedback(successFeedback("Lien copie dans le presse-papiers."));
  }

  async function revokeInvitation(invitation: MemberInvitationRow) {
    const confirmed = window.confirm(`Révoquer l'invitation de ${invitationName(invitation)} ?`);
    if (!confirmed) return;

    setFeedback(loadingFeedback("Revocation de l'invitation..."));
    const result = await revokeMemberInvitation(invitation.id);
    setFeedback(actionFeedback(result));
    if (result.ok) await load();
  }

  async function prepareReminder(invitation: MemberInvitationRow) {
    const confirmed = window.confirm(`Préparer une nouvelle relance pour ${invitationName(invitation)} ? L'ancien lien sera révoqué.`);
    if (!confirmed) return;

    setFeedback(loadingFeedback("Preparation de la relance..."));
    const result = await prepareMemberInvitationReminder(invitation, window.location.origin, user?.id);
    setGeneratedLinks(result.link ? [result.link] : []);
    setFeedback(actionFeedback(result));
    if (result.ok) await load();
  }

  return (
    <AdminShell title="Adherents" intro="Gestion des profils, roles, imports CSV et invitations d'activation.">
      <AdminFeedback feedback={feedback} className="mt-6" />

      <section className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-5">
          <h2 className="text-xl font-black text-court-900">Importer des adherents</h2>
          <p className="mt-2 text-sm leading-6 text-ink-500">
            Colle un CSV ou importe un fichier. Le site affiche un aperçu, détecte les doublons et crée seulement des invitations, pas de comptes actifs
            automatiquement.
          </p>
          <pre className="mt-4 overflow-auto rounded-lg bg-court-900 p-3 text-xs text-white">{csvExample()}</pre>
          <label className="mt-4 grid gap-2 text-sm font-bold text-court-900">
            Fichier CSV
            <input type="file" accept=".csv,text/csv" onChange={readCsvFile} className="rounded-lg border border-court-200 bg-white p-3 text-sm" />
          </label>
          <label className="mt-4 grid gap-2 text-sm font-bold text-court-900">
            Contenu CSV
            <textarea
              value={csvText}
              onChange={(event) => {
                setCsvText(event.target.value);
                setGeneratedLinks([]);
              }}
              rows={8}
              placeholder={csvExample()}
              className="rounded-lg border border-court-200 bg-white p-3 text-sm font-medium text-ink-700"
            />
          </label>
          <Button className="mt-4 w-full" disabled={!canCreateInvitations} onClick={() => createInvitations(csvPreview.rows)}>
            Creer les invitations
          </Button>
          {csvPreview.issues.length > 0 ? (
            <div className="mt-4 rounded-lg bg-orange-50 p-3 text-sm font-semibold text-orange-800">
              <p>{csvPreview.issues.length} erreur(s) a corriger avant import.</p>
              <ul className="mt-2 grid gap-1">
                {csvPreview.issues.slice(0, 8).map((issue, index) => (
                  <li key={`${issue.row}-${issue.field}-${index}`}>
                    Ligne {issue.row}, {issue.field} : {issue.message}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </Card>

        <Card className="p-5">
          <h2 className="text-xl font-black text-court-900">Apercu CSV</h2>
          {csvPreview.rows.length === 0 ? (
            <p className="mt-3 text-sm text-ink-500">Ajoute un CSV pour verifier les lignes avant creation.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-xs uppercase text-ink-500">
                  <tr>
                    <th className="px-3 py-2">Nom</th>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Licence</th>
                    <th className="px-3 py-2">Role</th>
                    <th className="px-3 py-2">Etat</th>
                  </tr>
                </thead>
                <tbody>
                  {csvPreview.rows.map((row, index) => {
                    const issues = rowIssues[index + 2] ?? [];
                    return (
                      <tr key={`${row.email}-${index}`} className="border-t border-court-100">
                        <td className="px-3 py-2 font-bold text-court-900">
                          {row.prenom} {row.nom}
                        </td>
                        <td className="px-3 py-2 text-ink-600">{row.email}</td>
                        <td className="px-3 py-2 text-ink-600">{row.licence_ffbad || "-"}</td>
                        <td className="px-3 py-2 text-ink-600">{appRoleLabels[row.role]}</td>
                        <td className="px-3 py-2">
                          {issues.length === 0 ? (
                            <span className="rounded-full bg-court-100 px-2 py-1 text-xs font-black text-court-700">OK</span>
                          ) : (
                            <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-black text-orange-800">{issues.length} erreur(s)</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </section>

      {generatedLinks.length > 0 ? (
        <section className="mt-6">
          <Card className="p-5">
            <h2 className="text-xl font-black text-court-900">Liens a envoyer maintenant</h2>
            <p className="mt-2 text-sm font-semibold text-orange-700">
              Ces liens ne sont pas stockes en clair. Copie-les ou ouvre le mail prepare avant de quitter la page.
            </p>
            <div className="mt-4 grid gap-3">
              {generatedLinks.map((link) => (
                <div key={`${link.email}-${link.activationUrl}`} className="rounded-lg border border-court-200 bg-court-50 p-3">
                  <p className="font-black text-court-900">
                    {link.prenom} {link.nom} - {link.email}
                  </p>
                  <p className="mt-1 break-all text-sm text-ink-600">{link.activationUrl}</p>
                  <p className="mt-1 text-xs font-semibold text-ink-500">Expiration : {formatDate(link.expiresAt)}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => copyLink(link.activationUrl)}>
                      Copier le lien
                    </Button>
                    <a className="inline-flex h-9 items-center rounded-lg border border-court-200 bg-white px-3 text-sm font-bold text-court-900" href={activationMailto(link)}>
                      Ouvrir le mail prepare
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>
      ) : null}

      <section className="mt-8 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Card className="p-5">
          <h2 className="text-xl font-black text-court-900">Invitations</h2>
          <p className="mt-2 text-sm text-ink-500">Les relances generent un nouveau lien et revoquent l'ancien lien en attente.</p>
          <div className="mt-4 grid gap-3">
            {invitations.length === 0 ? <p className="text-sm font-semibold text-ink-500">Aucune invitation pour le moment.</p> : null}
            {invitations.slice(0, 12).map((invitation) => {
              const pending = invitation.status === "pending";
              return (
                <div key={invitation.id} className="rounded-lg border border-court-200 p-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-court-900">{invitationName(invitation)}</p>
                      <p className="text-sm text-ink-500">{invitation.email}</p>
                      <p className="text-xs font-semibold text-ink-500">Expire le {formatDate(invitation.expires_at)}</p>
                    </div>
                    <span className="rounded-full bg-court-100 px-3 py-1 text-xs font-black text-court-700">{invitationStatusLabel(invitation)}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" disabled={!pending} onClick={() => prepareReminder(invitation)}>
                      Preparer une relance
                    </Button>
                    <Button size="sm" variant="danger" disabled={!pending} onClick={() => revokeInvitation(invitation)}>
                      Revoquer
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-xl font-black text-court-900">Reperes roles</h2>
          <div className="mt-3 grid gap-2 text-sm text-ink-500">
            <p>Adherent : acces au compte, reservations et commandes.</p>
            <p>Gestionnaire : gestion operationnelle du club.</p>
            <p>Admin : gestion des membres et des droits.</p>
            <p>Super admin : niveau technique exceptionnel.</p>
          </div>
        </Card>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {profiles.length === 0 ? <Card className="p-5 text-sm font-semibold text-ink-500">Aucun adherent trouve pour le moment.</Card> : null}
        {profiles.map((profile) => (
          <Card key={profile.id} className="p-5">
            <h2 className="text-xl font-black text-court-900">{profileDisplayName(profile)}</h2>
            <p className="mt-2 text-sm text-ink-500">{profile.email}</p>
            <p className="mt-1 text-sm text-ink-500">{profile.telephone || "Telephone non renseigne"}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <RoleBadges roles={profile.roles} />
              <span className="rounded-full bg-court-50 px-3 py-1 text-xs font-black text-ink-600">
                Role historique : {clubRoleLabel(profile.role)}
              </span>
              <span className="rounded-full bg-court-50 px-3 py-1 text-xs font-black text-ink-600">{profile.categorie || "Categorie non renseignee"}</span>
              {profile.statut ? <span className="rounded-full bg-court-50 px-3 py-1 text-xs font-black text-ink-600">{profile.statut}</span> : null}
              {profile.licence_ffbad ? <span className="rounded-full bg-court-50 px-3 py-1 text-xs font-black text-ink-600">Licence {profile.licence_ffbad}</span> : null}
              {roleChangeSummary(profile, rolesById) ? (
                <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-black text-yellow-800">A enregistrer</span>
              ) : null}
              {profile.id === user?.id ? <span className="rounded-full bg-court-100 px-3 py-1 text-xs font-black text-ink-600">verrouille</span> : null}
            </div>
            <div className="mt-5 rounded-lg border border-court-200 bg-court-50 p-3">
              <p className="text-sm font-black text-court-900">Roles sur le site</p>
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
              {profile.roles.length === 0 ? <p className="mt-2 text-xs font-semibold text-orange-700">Roles indisponibles</p> : null}
              <Button className="mt-3 w-full" disabled={profile.id === user?.id} onClick={() => saveRole(profile)}>
                Enregistrer les roles
              </Button>
              {profile.id === user?.id ? (
                <p className="mt-2 text-xs font-semibold text-ink-500">Ton propre role est verrouille pour eviter une perte d'acces.</p>
              ) : null}
            </div>
          </Card>
        ))}
      </section>
    </AdminShell>
  );
}
