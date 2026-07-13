import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

function loadTsModule(path, requireMap = {}) {
  const source = fs.readFileSync(path, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
      strict: true
    }
  }).outputText;

  const module = { exports: {} };
  vm.runInNewContext(output, {
    exports: module.exports,
    module,
    require: (id) => {
      if (id in requireMap) return requireMap[id];
      throw new Error(`Unexpected runtime import in tests: ${id}`);
    },
    Intl,
    Date,
    URL,
    Set,
    Map,
    Number,
    encodeURIComponent
  });

  return module.exports;
}

const planning = loadTsModule("lib/public-planning.ts");
const roles = loadTsModule("lib/roles.ts");
const memberAccess = loadTsModule("lib/member-access.ts", { "@/lib/roles": roles });
const invitations = loadTsModule("lib/member-invitations.ts");
const reservationRules = loadTsModule("lib/reservation-rules.ts");
const helloAsso = loadTsModule("lib/helloasso.ts");
const privateDocuments = loadTsModule("lib/private-documents.ts", { "@/lib/roles": roles });
const backOfficeRules = loadTsModule("lib/back-office-rules.ts", {
  "@/lib/private-documents": privateDocuments,
  "@/lib/roles": roles
});

const {
  filterSlots,
  generateEventIcs,
  getPublicSlotStatus,
  getUpcomingPublicEvents,
  validateEvent,
  validateSlot
} = planning;

const {
  appRolesToMemberAccessRoles,
  getMemberAccessState,
  isActiveSeasonStatus
} = memberAccess;

const { getInvitationAccessState, isInvitationUsable } = invitations;

const {
  buildReservationCsv,
  canCancelReservation,
  getReservationActionState,
  reservationActionLabel
} = reservationRules;

const { buildHelloAssoProductUrl, isValidHelloAssoUrl } = helloAsso;

const {
  canAccessPrivateDocument,
  isAllowedPrivateDocumentFile,
  sanitizePrivateDocumentFileName
} = privateDocuments;

const {
  canPerformBackOfficeAction,
  nextContentStatus,
  parseMemberCsvPreview,
  validateMediaUpload
} = backOfficeRules;

const slots = [
  {
    id: "adult-tuesday",
    title: "Jeu libre adultes",
    type: "free_play",
    date: "2026-09-01",
    startsAt: "2026-09-01T19:00:00+02:00",
    endsAt: "2026-09-01T21:00:00+02:00",
    venueId: "aigremonts",
    venueName: "Gymnase des Aigremonts",
    address: "554 Rue de la Chappe, 41100 Vendôme",
    managerName: "Didier Remule",
    recommendedLevel: "Adultes loisirs",
    audience: "Adultes",
    courtsCount: 7,
    capacityMax: 28,
    registeredCount: 12,
    status: "open"
  },
  {
    id: "youth-thursday-full",
    title: "Entraînement jeunes",
    type: "youth_training",
    date: "2026-09-03",
    startsAt: "2026-09-03T18:00:00+02:00",
    endsAt: "2026-09-03T19:30:00+02:00",
    venueId: "aigremonts",
    venueName: "Gymnase des Aigremonts",
    address: "554 Rue de la Chappe, 41100 Vendôme",
    managerName: "Didier Remule",
    recommendedLevel: "Jeunes tous niveaux",
    audience: "Jeunes",
    courtsCount: 7,
    capacityMax: 28,
    registeredCount: 28,
    status: "open"
  }
];

assert.equal(filterSlots(slots, { audience: "Adultes" }).length, 1, "filtre public");
assert.equal(filterSlots(slots, { day: "mardi" }).length, 1, "filtre jour");
assert.equal(filterSlots(slots, { level: "loisirs" }).length, 1, "filtre niveau");
assert.equal(filterSlots(slots, { type: "youth_training" }).length, 1, "filtre type");
assert.equal(filterSlots(slots, { venue: "Gymnase des Aigremonts" }).length, 2, "filtre lieu");
assert.equal(getPublicSlotStatus(slots[1]), "full", "complet seulement avec capacité suivie");
assert.equal(validateSlot(slots[0]).length, 0, "créneau valide");

const event = {
  id: "tournoi-2026",
  title: "Tournoi interne, jeunes; adultes",
  category: "club_event",
  status: "published",
  startsAt: "2026-09-01T18:00:00+02:00",
  endsAt: "2026-09-01T20:00:00+02:00",
  venueName: "Gymnase des Aigremonts",
  audience: "Tous",
  description: "Moment club\nPrévoir une gourde."
};

const cancelled = {
  ...event,
  id: "fermeture-2026",
  category: "closure",
  status: "cancelled",
  cancellationMessage: "Gymnase indisponible."
};

const upcoming = getUpcomingPublicEvents(
  [
    event,
    { ...event, id: "draft", status: "draft" },
    { ...event, id: "scheduled-later", status: "scheduled", scheduledFor: "2026-08-30T10:00:00+02:00" },
    { ...event, id: "scheduled-now", status: "scheduled", scheduledFor: "2026-08-01T10:00:00+02:00" },
    cancelled
  ],
  new Date("2026-08-02T10:00:00+02:00")
);

assert.deepEqual(
  upcoming.map((item) => item.id),
  ["tournoi-2026", "scheduled-now", "fermeture-2026"],
  "publication, programmation et annulation"
);

assert.equal(validateEvent(event).length, 0, "événement valide");
assert.ok(validateEvent({ ...cancelled, cancellationMessage: "" }).includes("message d'annulation manquant"), "annulation documentée");

const ics = generateEventIcs(event, "https://cfvv.example");
assert.ok(ics.includes("BEGIN:VCALENDAR"), "iCal démarre");
assert.ok(ics.includes("DTSTART:20260901T160000Z"), "iCal convertit le fuseau horaire en UTC");
assert.ok(ics.includes("SUMMARY:Tournoi interne\\, jeunes\\; adultes"), "iCal échappe les caractères spéciaux");

const cancelledIcs = generateEventIcs(cancelled, "https://cfvv.example");
assert.ok(cancelledIcs.includes("STATUS:CANCELLED"), "iCal annulation");

assert.equal(
  getMemberAccessState({ configured: true, loading: false, isAuthenticated: false, profile: null, roles: [] }),
  "anonymous",
  "utilisateur non connecté"
);
assert.equal(
  getMemberAccessState({
    configured: true,
    loading: false,
    isAuthenticated: true,
    profile: { role: "adherent", statut: "actif" },
    roles: ["member"]
  }),
  "allowed",
  "adhérent actif autorisé"
);
assert.equal(
  JSON.stringify(appRolesToMemberAccessRoles(["manager"], "bureau")),
  JSON.stringify(["adherent", "encadrant", "editeur"]),
  "éditeur / responsable"
);
assert.equal(
  JSON.stringify(appRolesToMemberAccessRoles(["admin"], "admin")),
  JSON.stringify(["adherent", "encadrant", "editeur", "administrateur"]),
  "administrateur"
);
assert.equal(
  getMemberAccessState({
    configured: true,
    loading: false,
    isAuthenticated: true,
    profile: { role: "adherent", statut: "inactif" },
    roles: ["member"]
  }),
  "suspended",
  "compte suspendu"
);
assert.equal(
  getMemberAccessState({
    configured: true,
    loading: false,
    isAuthenticated: true,
    profile: { role: "adherent", statut: "ancien" },
    roles: ["member"]
  }),
  "not_renewed",
  "compte non renouvelé"
);
assert.equal(isActiveSeasonStatus("actif"), true, "saison active");
assert.equal(isActiveSeasonStatus("suspendu"), false, "saison suspendue");

const usableInvitation = { status: "pending", expires_at: "2026-09-01T10:00:00+02:00", used_at: null, revoked_at: null };
assert.equal(isInvitationUsable(usableInvitation, new Date("2026-08-01T10:00:00+02:00")), true, "invitation utilisable");
assert.equal(getInvitationAccessState(usableInvitation, new Date("2026-10-01T10:00:00+02:00")), "expired", "invitation expirée");
assert.equal(getInvitationAccessState({ ...usableInvitation, used_at: "2026-08-02T10:00:00+02:00" }), "used", "invitation à usage unique");

const baseReservationRule = {
  reservationActive: true,
  isCancelled: false,
  opensAt: "2026-09-01T08:00:00+02:00",
  closesAt: "2026-09-02T19:00:00+02:00",
  placesLeft: 4,
  alreadyReserved: false,
  alreadyWaiting: false
};

assert.equal(
  getReservationActionState(baseReservationRule, new Date("2026-09-01T09:00:00+02:00")),
  "reservable",
  "creneau reservable dans la fenetre"
);
assert.equal(
  getReservationActionState({ ...baseReservationRule, alreadyReserved: true }, new Date("2026-09-01T09:00:00+02:00")),
  "already_reserved",
  "double clic ou doublon rendu idempotent cote interface"
);
assert.equal(
  getReservationActionState({ ...baseReservationRule, placesLeft: 0 }, new Date("2026-09-01T09:00:00+02:00")),
  "waitlist_available",
  "derniere place prise : bascule liste d'attente"
);
assert.equal(
  getReservationActionState({ ...baseReservationRule, isCancelled: true }, new Date("2026-09-01T09:00:00+02:00")),
  "closed_exceptionally",
  "session fermee exceptionnellement"
);
assert.equal(
  getReservationActionState(baseReservationRule, new Date("2026-08-31T20:00:00+02:00")),
  "not_open_yet",
  "ouverture future respectee"
);
assert.equal(
  getReservationActionState(baseReservationRule, new Date("2026-09-02T20:00:00+02:00")),
  "closed",
  "fermeture avant seance respectee"
);
assert.equal(reservationActionLabel("closed_exceptionally"), "Fermé exceptionnellement", "libelle explicite");

assert.equal(
  canCancelReservation(
    { status: "confirmee", cancellationDeadlineAt: "2026-09-02T17:00:00+02:00" },
    new Date("2026-09-02T16:00:00+02:00")
  ),
  true,
  "annulation autorisee avant la limite"
);
assert.equal(
  canCancelReservation(
    { status: "confirmee", cancellationDeadlineAt: "2026-09-02T17:00:00+02:00" },
    new Date("2026-09-02T18:00:00+02:00")
  ),
  false,
  "annulation bloquee apres la limite"
);

const dstRule = {
  ...baseReservationRule,
  opensAt: "2026-03-29T08:00:00+02:00",
  closesAt: "2026-03-29T10:00:00+02:00"
};
assert.equal(
  getReservationActionState(dstRule, new Date("2026-03-29T07:30:00+02:00")),
  "not_open_yet",
  "changement d'heure : comparaison avec fuseau explicite"
);

const csv = buildReservationCsv([
  {
    date_reservation: "2026-09-02",
    member_name: "Dupont; Alice",
    member_email: "alice@example.test",
    statut: "confirmee",
    creneaux: {
      jour: "Mercredi",
      heure_debut: "19:00:00",
      heure_fin: "21:00:00",
      gymnase: "Gymnase des Aigremonts"
    }
  }
]);
assert.ok(csv.includes('"Dupont; Alice"'), "export CSV echappe les points-virgules");
assert.ok(csv.includes("2026-09-02"), "export CSV contient la date");

assert.equal(isValidHelloAssoUrl("https://www.helloasso.com/associations/cfvv/boutiques/volants"), true, "lien HelloAsso valide");
assert.equal(isValidHelloAssoUrl("http://www.helloasso.com/associations/cfvv"), false, "HelloAsso force en HTTPS");
assert.equal(isValidHelloAssoUrl("https://example.com/paiement"), false, "domaine externe refuse");
assert.ok(
  buildHelloAssoProductUrl({
    helloassoUrl: "https://www.helloasso.com/associations/cfvv/boutiques/volants",
    reference: "RSL-A9",
    quantity: 2
  })?.includes("cfvv_quantite=2"),
  "URL HelloAsso enrichie avec quantite indicative"
);

assert.equal(canAccessPrivateDocument(["member"], ["member"]), true, "adherent autorise document membre");
assert.equal(canAccessPrivateDocument(["member"], ["manager"]), false, "adherent bloque document gestionnaire");
assert.equal(canAccessPrivateDocument(["manager"], ["admin"]), true, "manager/admin ont acces bureau");
assert.equal(
  isAllowedPrivateDocumentFile({ mimeType: "application/pdf", sizeBytes: 1024 }),
  true,
  "document PDF autorise"
);
assert.equal(
  isAllowedPrivateDocumentFile({ mimeType: "application/x-msdownload", sizeBytes: 1024 }),
  false,
  "type dangereux refuse"
);
assert.equal(sanitizePrivateDocumentFileName("Compte rendu AG été 2026!!.pdf"), "compte-rendu-ag-ete-2026.pdf", "nom fichier nettoye");

assert.equal(canPerformBackOfficeAction(["manager"], "publish_content"), true, "editeur peut publier un contenu");
assert.equal(canPerformBackOfficeAction(["manager"], "manage_admins"), false, "editeur ne gere pas les admins");
assert.equal(canPerformBackOfficeAction(["admin"], "manage_admins"), true, "admin gere les droits sensibles");
assert.equal(canPerformBackOfficeAction(["manager"], "delete_permanently"), false, "suppression definitive reservee admin");

const csvPreview = parseMemberCsvPreview(
  "email;prenom;nom;licence_ffbad;role\nalice@example.test;Alice;Dupont;123;member\nalice@example.test;Alice;Doublon;124;manager\nbad-email;Bob;Martin;;member"
);
assert.equal(csvPreview.rows.length, 3, "import CSV produit un apercu");
assert.ok(csvPreview.issues.some((issue) => issue.message.includes("Doublon")), "import CSV detecte les doublons");
assert.ok(csvPreview.issues.some((issue) => issue.message.includes("Email invalide")), "import CSV detecte les emails invalides");

assert.equal(nextContentStatus("brouillon", "publish"), "publie", "publication brouillon");
assert.equal(nextContentStatus("publie", "unpublish"), "brouillon", "depublication");
assert.equal(nextContentStatus("brouillon", "schedule", "2026-09-01T10:00:00+02:00"), "programme", "planification");
assert.equal(nextContentStatus("archive", "restore"), "brouillon", "restauration");
assert.equal(nextContentStatus("brouillon", "delete_permanently"), null, "suppression definitive interdite hors corbeille");

const media = validateMediaUpload({
  fileName: "Affiche tournoi été 2026.pdf",
  mimeType: "application/pdf",
  sizeBytes: 2048,
  informative: false
});
assert.equal(media.ok, true, "media valide");
assert.equal(media.cleanName, "affiche-tournoi-ete-2026.pdf", "media nettoye");
assert.equal(
  validateMediaUpload({ fileName: "photo.jpg", mimeType: "image/jpeg", sizeBytes: 2048, informative: true }).ok,
  false,
  "texte alternatif obligatoire pour image informative"
);

console.log("Public planning and member access tests passed");
