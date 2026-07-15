"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { AdminFeedback, actionFeedback, errorFeedback, loadingFeedback, successFeedback, type AdminFeedbackMessage } from "@/components/admin/admin-feedback";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminRoute } from "@/components/auth/admin-route";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { parseLicenceCsvPreview, parseMemberCsvPreview, type CsvImportIssue, type CsvImportRow, type LicenceCsvImportRow } from "@/lib/back-office-rules";
import { appRoleLabels, normalizeAppRoles, type AppRole } from "@/lib/roles";
import { invitationStatusLabel } from "@/lib/member-invitations";
import { clubRoleLabel } from "@/lib/status-labels";
import {
  createMemberInvitations,
  fetchMemberLicences,
  fetchMemberInvitations,
  fetchProfiles,
  prepareMemberInvitationReminder,
  revokeMemberInvitation,
  upsertMemberLicences,
  updateUserRoles,
  type CreatedMemberInvitation,
  type MemberInvitationRow,
  type MemberLicenceRow,
  type ProfileRow
} from "@/services/supabase-data.service";

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
  return [profile.prenom, profile.nom].filter(Boolean).join(" ") || profile.email || "cet adhérent";
}

function roleChangeSummary(profile: ProfileRow, rolesById: Record<string, AppRole[]>) {
  const selectedRoles = getSelectedRoles(profile, rolesById);
  return sameRoles(selectedRoles, profile.roles) ? null : "Modifications non enregistrées";
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Non renseigné";
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function invitationName(invitation: MemberInvitationRow) {
  return [invitation.metadata?.prenom, invitation.metadata?.nom].filter(Boolean).join(" ") || invitation.email;
}

function csvExample() {
  return "email;prenom;nom;licence_ffbad;role\nalice@example.fr;Alice;Dupont;12345678;member\njulien@example.fr;Julien;Martin;;manager";
}

function licenceCsvExample() {
  return "Nom;Prénom;Licence;Catégorie\nAUBRY;Pauline;07172923;Veteran 1\nAUTRIVE;Kévin;07705663;Senior";
}

function csvIssuesByRow(issues: CsvImportIssue[]) {
  return issues.reduce<Record<number, CsvImportIssue[]>>((acc, issue) => {
    acc[issue.row] = [...(acc[issue.row] ?? []), issue];
    return acc;
  }, {});
}

function activationMailto(link: CreatedMemberInvitation) {
  const subject = encodeURIComponent("Invitation à activer ton espace CFVV");
  const body = encodeURIComponent(
    `Bonjour ${link.prenom || link.nom || ""},\n\nLe club t'invite à activer ton espace adhérent CFVV.\n\nLien d'activation : ${link.activationUrl}\n\nCe lien expire le ${formatDate(link.expiresAt)}.\n\nSportivement,\nLe bureau du CFVV`
  );
  return `mailto:${encodeURIComponent(link.email)}?subject=${subject}&body=${body}`;
}

async function readCsvText(file: File) {
  const buffer = await file.arrayBuffer();
  const utf8 = new TextDecoder("utf-8").decode(buffer);

  if (!utf8.includes("\uFFFD")) {
    return utf8;
  }

  return new TextDecoder("windows-1252").decode(buffer);
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
  const [memberLicences, setMemberLicences] = useState<MemberLicenceRow[]>([]);
  const [rolesById, setRolesById] = useState<Record<string, AppRole[]>>({});
  const [csvText, setCsvText] = useState("");
  const [licenceCsvText, setLicenceCsvText] = useState("");
  const [manualLicence, setManualLicence] = useState<LicenceCsvImportRow>({
    nom: "",
    prenom: "",
    licence_ffbad: "",
    categorie: "",
    statut: "actif"
  });
  const [generatedLinks, setGeneratedLinks] = useState<CreatedMemberInvitation[]>([]);
  const [feedback, setFeedback] = useState<AdminFeedbackMessage>(null);

  async function load() {
    const [profilesResult, invitationsResult, licencesResult] = await Promise.all([fetchProfiles(), fetchMemberInvitations(), fetchMemberLicences()]);
    setProfiles(profilesResult.data);
    setInvitations(invitationsResult.data);
    setMemberLicences(licencesResult.data);
    setRolesById(Object.fromEntries(profilesResult.data.map((profile) => [profile.id, profile.roles])));

    const error = profilesResult.error ?? invitationsResult.error ?? licencesResult.error;
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
  const licenceCsvPreview = useMemo(() => parseLicenceCsvPreview(licenceCsvText), [licenceCsvText]);
  const licenceRowIssues = useMemo(() => csvIssuesByRow(licenceCsvPreview.issues), [licenceCsvPreview.issues]);
  const canImportLicences = licenceCsvPreview.rows.length > 0 && licenceCsvPreview.issues.length === 0;

  async function saveRole(profile: ProfileRow) {
    const roles = getSelectedRoles(profile, rolesById);

    if (profile.id === user?.id && !sameRoles(roles, profile.roles)) {
      setFeedback(errorFeedback("Pour éviter de te bloquer, tes propres rôles ne peuvent pas être modifiés ici."));
      return;
    }

    if (!sameRoles(roles, profile.roles)) {
      const confirmed = window.confirm(`Modifier les rôles de ${profileDisplayName(profile)} ?`);
      if (!confirmed) return;
    }

    setFeedback(loadingFeedback("Mise à jour des rôles en cours..."));
    const result = await updateUserRoles(profile.id, roles);
    setFeedback(result.ok ? successFeedback(`Rôles mis à jour pour ${profileDisplayName(profile)}.`) : actionFeedback(result));
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
    setCsvText(await readCsvText(file));
    setGeneratedLinks([]);
  }

  async function readLicenceCsvFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setLicenceCsvText(await readCsvText(file));
  }

  async function createInvitations(rows: CsvImportRow[]) {
    if (!canCreateInvitations) {
      setFeedback(errorFeedback("Corrige les erreurs de l'aperçu CSV avant de créer les invitations."));
      return;
    }

    const confirmed = window.confirm(`Créer ${rows.length} invitation(s) ? Les liens seront affichés une seule fois.`);
    if (!confirmed) return;

    setFeedback(loadingFeedback("Création des invitations en cours..."));
    const result = await createMemberInvitations(rows, window.location.origin, user?.id);
    setGeneratedLinks(result.links);
    setFeedback(actionFeedback(result));
    if (result.ok) {
      setCsvText("");
      await load();
    }
  }

  async function importLicences(rows: LicenceCsvImportRow[]) {
    if (!canImportLicences) {
      setFeedback(errorFeedback("Corrige les erreurs de l'aperçu des licences avant import."));
      return;
    }

    const confirmed = window.confirm(`Importer ou mettre à jour ${rows.length} licence(s) autorisée(s) ?`);
    if (!confirmed) return;

    setFeedback(loadingFeedback("Import des licences autorisées en cours..."));
    const result = await upsertMemberLicences(rows, user?.id);
    setFeedback(actionFeedback(result));
    if (result.ok) {
      setLicenceCsvText("");
      await load();
    }
  }

  async function saveManualLicence() {
    const rows = [manualLicence];
    const preview = parseLicenceCsvPreview(`Nom;Prénom;Licence;Catégorie;Statut\n${manualLicence.nom};${manualLicence.prenom};${manualLicence.licence_ffbad};${manualLicence.categorie ?? ""};${manualLicence.statut}`);

    if (preview.issues.length > 0) {
      setFeedback(errorFeedback(preview.issues.map((issue) => issue.message).join(" ")));
      return;
    }

    setFeedback(loadingFeedback("Enregistrement de la licence autorisée..."));
    const result = await upsertMemberLicences(rows, user?.id);
    setFeedback(actionFeedback(result));
    if (result.ok) {
      setManualLicence({ nom: "", prenom: "", licence_ffbad: "", categorie: "", statut: "actif" });
      await load();
    }
  }

  async function copyLink(link: string) {
    await navigator.clipboard.writeText(link);
    setFeedback(successFeedback("Lien copié dans le presse-papiers."));
  }

  async function revokeInvitation(invitation: MemberInvitationRow) {
    const confirmed = window.confirm(`Révoquer l'invitation de ${invitationName(invitation)} ?`);
    if (!confirmed) return;

    setFeedback(loadingFeedback("Révocation de l'invitation..."));
    const result = await revokeMemberInvitation(invitation.id);
    setFeedback(actionFeedback(result));
    if (result.ok) await load();
  }

  async function prepareReminder(invitation: MemberInvitationRow) {
    const confirmed = window.confirm(`Préparer une nouvelle relance pour ${invitationName(invitation)} ? L'ancien lien sera révoqué.`);
    if (!confirmed) return;

    setFeedback(loadingFeedback("Préparation de la relance..."));
    const result = await prepareMemberInvitationReminder(invitation, window.location.origin, user?.id);
    setGeneratedLinks(result.link ? [result.link] : []);
    setFeedback(actionFeedback(result));
    if (result.ok) await load();
  }

  return (
    <AdminShell title="Adhérents" intro="Gestion des profils, rôles, imports CSV et invitations d'activation.">
      <AdminFeedback feedback={feedback} className="mt-6" />

      <section className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-5">
          <h2 className="text-xl font-black text-court-900">Importer des adhérents</h2>
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
            Créer les invitations
          </Button>
          {csvPreview.issues.length > 0 ? (
            <div className="mt-4 rounded-lg bg-orange-50 p-3 text-sm font-semibold text-orange-800">
              <p>{csvPreview.issues.length} erreur(s) à corriger avant import.</p>
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
          <h2 className="text-xl font-black text-court-900">Aperçu CSV</h2>
          {csvPreview.rows.length === 0 ? (
            <p className="mt-3 text-sm text-ink-500">Ajoute un CSV pour vérifier les lignes avant création.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-xs uppercase text-ink-500">
                  <tr>
                    <th className="px-3 py-2">Nom</th>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Licence</th>
                    <th className="px-3 py-2">Rôle</th>
                    <th className="px-3 py-2">État</th>
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

      <section className="mt-8 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="p-5">
          <h2 className="text-xl font-black text-court-900">Licences autorisées</h2>
          <p className="mt-2 text-sm leading-6 text-ink-500">
            Importe le CSV FFBaD avec les colonnes <strong>Nom</strong>, <strong>Prénom</strong>, <strong>Licence</strong> et <strong>Catégorie</strong>.
            Ces licences permettent ensuite aux adhérents de créer leur compte avec leur numéro de licence.
          </p>
          <pre className="mt-4 overflow-auto rounded-lg bg-court-900 p-3 text-xs text-white">{licenceCsvExample()}</pre>
          <label className="mt-4 grid gap-2 text-sm font-bold text-court-900">
            Fichier CSV licences
            <input type="file" accept=".csv,text/csv" onChange={readLicenceCsvFile} className="rounded-lg border border-court-200 bg-white p-3 text-sm" />
          </label>
          <label className="mt-4 grid gap-2 text-sm font-bold text-court-900">
            Contenu CSV licences
            <textarea
              value={licenceCsvText}
              onChange={(event) => setLicenceCsvText(event.target.value)}
              rows={8}
              placeholder={licenceCsvExample()}
              className="rounded-lg border border-court-200 bg-white p-3 text-sm font-medium text-ink-700"
            />
          </label>
          <Button className="mt-4 w-full" disabled={!canImportLicences} onClick={() => importLicences(licenceCsvPreview.rows)}>
            Importer / mettre à jour les licences
          </Button>
          {licenceCsvPreview.issues.length > 0 ? (
            <div className="mt-4 rounded-lg bg-orange-50 p-3 text-sm font-semibold text-orange-800">
              <p>{licenceCsvPreview.issues.length} erreur(s) à corriger avant import.</p>
              <ul className="mt-2 grid gap-1">
                {licenceCsvPreview.issues.slice(0, 8).map((issue, index) => (
                  <li key={`${issue.row}-${issue.field}-${index}`}>
                    Ligne {issue.row}, {issue.field} : {issue.message}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </Card>

        <Card className="p-5">
          <h2 className="text-xl font-black text-court-900">Aperçu et ajout manuel</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <MemberLicenceInput label="Nom" value={manualLicence.nom} onChange={(value) => setManualLicence((current) => ({ ...current, nom: value }))} />
            <MemberLicenceInput label="Prénom" value={manualLicence.prenom} onChange={(value) => setManualLicence((current) => ({ ...current, prenom: value }))} />
            <MemberLicenceInput
              label="Licence"
              value={manualLicence.licence_ffbad}
              onChange={(value) => setManualLicence((current) => ({ ...current, licence_ffbad: value }))}
            />
            <MemberLicenceInput
              label="Catégorie"
              required={false}
              value={manualLicence.categorie ?? ""}
              onChange={(value) => setManualLicence((current) => ({ ...current, categorie: value }))}
            />
            <label className="grid gap-2 text-sm font-bold text-court-900">
              Statut
              <select
                value={manualLicence.statut}
                onChange={(event) => setManualLicence((current) => ({ ...current, statut: event.target.value as LicenceCsvImportRow["statut"] }))}
                className="h-11 rounded-lg border border-court-200 bg-white px-3"
              >
                <option value="actif">Actif</option>
                <option value="inactif">Inactif</option>
                <option value="archive">Archivé</option>
              </select>
            </label>
            <Button type="button" className="mt-auto" onClick={saveManualLicence}>
              Ajouter cette licence
            </Button>
          </div>

          <div className="mt-6">
            <h3 className="font-display text-lg font-black text-court-900">Aperçu CSV licences</h3>
            {licenceCsvPreview.rows.length === 0 ? (
              <p className="mt-3 text-sm text-ink-500">Ajoute le CSV pour contrôler les licences avant import.</p>
            ) : (
              <div className="mt-4 max-h-72 overflow-auto rounded-lg border border-court-100">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-court-50 text-xs uppercase text-ink-500">
                    <tr>
                      <th className="px-3 py-2">Licence</th>
                      <th className="px-3 py-2">Nom</th>
                      <th className="px-3 py-2">Catégorie</th>
                      <th className="px-3 py-2">État</th>
                    </tr>
                  </thead>
                  <tbody>
                    {licenceCsvPreview.rows.slice(0, 30).map((row, index) => {
                      const issues = licenceRowIssues[index + 2] ?? [];
                      return (
                        <tr key={`${row.licence_ffbad}-${index}`} className="border-t border-court-100">
                          <td className="px-3 py-2 font-bold text-court-900">{row.licence_ffbad}</td>
                          <td className="px-3 py-2 text-ink-600">
                            {row.prenom} {row.nom}
                          </td>
                          <td className="px-3 py-2 text-ink-600">{row.categorie || "-"}</td>
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
          </div>
        </Card>
      </section>

      <section className="mt-8">
        <Card className="p-5">
          <h2 className="text-xl font-black text-court-900">Licences enregistrées dans Supabase</h2>
          <p className="mt-2 text-sm leading-6 text-ink-500">
            Une licence active et non utilisée permet de créer un compte. Lorsqu'un adhérent crée son compte, la licence est rattachée automatiquement.
          </p>
          {memberLicences.length === 0 ? (
            <p className="mt-4 text-sm font-semibold text-ink-500">Aucune licence autorisée pour le moment.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-xs uppercase text-ink-500">
                  <tr>
                    <th className="px-3 py-2">Licence</th>
                    <th className="px-3 py-2">Adhérent</th>
                    <th className="px-3 py-2">Catégorie</th>
                    <th className="px-3 py-2">Statut</th>
                    <th className="px-3 py-2">Compte</th>
                  </tr>
                </thead>
                <tbody>
                  {memberLicences.slice(0, 80).map((licence) => (
                    <tr key={licence.id} className="border-t border-court-100">
                      <td className="px-3 py-2 font-bold text-court-900">{licence.licence_ffbad}</td>
                      <td className="px-3 py-2 text-ink-600">
                        {licence.prenom} {licence.nom}
                      </td>
                      <td className="px-3 py-2 text-ink-600">{licence.categorie || "-"}</td>
                      <td className="px-3 py-2">
                        <span className="rounded-full bg-court-50 px-2 py-1 text-xs font-black text-ink-600">{licence.statut}</span>
                      </td>
                      <td className="px-3 py-2 text-ink-600">{licence.claimed_at ? `Activé (${licence.claimed_email || "email masqué"})` : "Disponible"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </section>

      {generatedLinks.length > 0 ? (
        <section className="mt-6">
          <Card className="p-5">
            <h2 className="text-xl font-black text-court-900">Liens à envoyer maintenant</h2>
            <p className="mt-2 text-sm font-semibold text-orange-700">
              Ces liens ne sont pas stockés en clair. Copie-les ou ouvre le mail préparé avant de quitter la page.
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
                      Ouvrir le mail préparé
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
          <p className="mt-2 text-sm text-ink-500">Les relances génèrent un nouveau lien et révoquent l'ancien lien en attente.</p>
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
                      Préparer une relance
                    </Button>
                    <Button size="sm" variant="danger" disabled={!pending} onClick={() => revokeInvitation(invitation)}>
                      Révoquer
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-xl font-black text-court-900">Repères rôles</h2>
          <div className="mt-3 grid gap-2 text-sm text-ink-500">
            <p>Adhérent : accès au compte, réservations et commandes.</p>
            <p>Gestionnaire : gestion opérationnelle du club.</p>
            <p>Admin : gestion des membres et des droits.</p>
            <p>Super admin : niveau technique exceptionnel.</p>
          </div>
        </Card>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {profiles.length === 0 ? <Card className="p-5 text-sm font-semibold text-ink-500">Aucun adhérent trouvé pour le moment.</Card> : null}
        {profiles.map((profile) => (
          <Card key={profile.id} className="p-5">
            <h2 className="text-xl font-black text-court-900">{profileDisplayName(profile)}</h2>
            <p className="mt-2 text-sm text-ink-500">{profile.email}</p>
            <p className="mt-1 text-sm text-ink-500">{profile.telephone || "Téléphone non renseigné"}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <RoleBadges roles={profile.roles} />
              <span className="rounded-full bg-court-50 px-3 py-1 text-xs font-black text-ink-600">
                Rôle historique : {clubRoleLabel(profile.role)}
              </span>
              <span className="rounded-full bg-court-50 px-3 py-1 text-xs font-black text-ink-600">{profile.categorie || "Catégorie non renseignée"}</span>
              {profile.statut ? <span className="rounded-full bg-court-50 px-3 py-1 text-xs font-black text-ink-600">{profile.statut}</span> : null}
              {profile.licence_ffbad ? <span className="rounded-full bg-court-50 px-3 py-1 text-xs font-black text-ink-600">Licence {profile.licence_ffbad}</span> : null}
              {roleChangeSummary(profile, rolesById) ? (
                <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-black text-yellow-800">À enregistrer</span>
              ) : null}
              {profile.id === user?.id ? <span className="rounded-full bg-court-100 px-3 py-1 text-xs font-black text-ink-600">verrouillé</span> : null}
            </div>
            <div className="mt-5 rounded-lg border border-court-200 bg-court-50 p-3">
              <p className="text-sm font-black text-court-900">Rôles sur le site</p>
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
              {profile.roles.length === 0 ? <p className="mt-2 text-xs font-semibold text-orange-700">Rôles indisponibles</p> : null}
              <Button className="mt-3 w-full" disabled={profile.id === user?.id} onClick={() => saveRole(profile)}>
                Enregistrer les rôles
              </Button>
              {profile.id === user?.id ? (
                <p className="mt-2 text-xs font-semibold text-ink-500">Ton propre rôle est verrouillé pour éviter une perte d'accès.</p>
              ) : null}
            </div>
          </Card>
        ))}
      </section>
    </AdminShell>
  );
}

function MemberLicenceInput({
  label,
  value,
  onChange,
  required = true
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold text-court-900">
      {label}
      <input
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-lg border border-court-200 bg-white px-3"
      />
    </label>
  );
}
