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
const creneauSlots = loadTsModule("lib/creneau-slots.ts");
const roles = loadTsModule("lib/roles.ts");
const memberAccess = loadTsModule("lib/member-access.ts", { "@/lib/roles": roles });
const invitations = loadTsModule("lib/member-invitations.ts");
const reservationRules = loadTsModule("lib/reservation-rules.ts");
const helloAsso = loadTsModule("lib/helloasso.ts");
const mediaLibrary = loadTsModule("lib/media-library.ts");
const privateDocuments = loadTsModule("lib/private-documents.ts", { "@/lib/roles": roles });
const backOfficeRules = loadTsModule("lib/back-office-rules.ts", {
  "@/lib/private-documents": privateDocuments,
  "@/lib/roles": roles
});

const {
  filterSlots,
  generateEventIcs,
  getNextPublicEvents,
  getPublicSlotStatus,
  getUpcomingPublicEvents,
  validateEvent,
  validateSlot
} = planning;

const { creneauxToSlotOccurrences, dedupeCreneauxForPublicDisplay } = creneauSlots;

const {
  appRolesToMemberAccessRoles,
  getMemberAccessState,
  isActiveSeasonStatus
} = memberAccess;

const { buildActivationUrl, canPrepareInvitationReminder, getDefaultInvitationExpiration, getInvitationAccessState, isInvitationUsable } = invitations;

const {
  buildReservationCsv,
  canCancelReservation,
  getReservationActionState,
  reservationActionLabel
} = reservationRules;

const { buildHelloAssoProductUrl, isValidHelloAssoUrl } = helloAsso;

const {
  canDeleteMediaAsset,
  getMediaKind,
  isAllowedPublicMediaFile,
  sanitizeMediaFileName,
  validateMediaAssetInput
} = mediaLibrary;

const {
  canAccessPrivateDocument,
  isAllowedPrivateDocumentFile,
  sanitizePrivateDocumentFileName
} = privateDocuments;

const {
  canPerformBackOfficeAction,
  nextContentStatus,
  parseLicenceCsvPreview,
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

const duplicateCreneaux = [
  {
    id: 1,
    jour: "Mercredi",
    heure_debut: "18:00:00",
    heure_fin: "20:30:00",
    gymnase: "Gymnase des Aigremonts",
    adresse: "554 Rue de la Chappe, 41100 Vendome",
    type: "jeu_libre",
    public: "adultes",
    niveau: "Tous niveaux",
    places_max: 28,
    responsable: "Didier Remule",
    actif: true,
    reservation_active: true
  },
  {
    id: 2,
    jour: "mercredi",
    heure_debut: "18:00:00",
    heure_fin: "20:30:00",
    gymnase: "Gymnase des Aigremonts",
    adresse: "554 Rue de la Chappe, 41100 Vendome",
    type: "jeu libre",
    public: "adultes",
    niveau: "Tous niveaux",
    places_max: 28,
    responsable: "Didier Remule",
    actif: true,
    reservation_active: true
  }
];

assert.equal(dedupeCreneauxForPublicDisplay(duplicateCreneaux).length, 1, "doublons de créneaux supprimés côté affichage");
assert.equal(creneauxToSlotOccurrences(duplicateCreneaux).length, 1, "cartes publiques sans doublon");

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

const nextHomeEvents = getNextPublicEvents(
  [
    { ...event, id: "far", startsAt: "2026-12-10T18:00:00+02:00", endsAt: "2026-12-10T20:00:00+02:00" },
    { ...event, id: "first", startsAt: "2026-08-03T18:00:00+02:00", endsAt: "2026-08-03T20:00:00+02:00" },
    { ...event, id: "draft-home", status: "draft", startsAt: "2026-08-04T18:00:00+02:00", endsAt: "2026-08-04T20:00:00+02:00" },
    { ...event, id: "second", startsAt: "2026-08-05T18:00:00+02:00", endsAt: "2026-08-05T20:00:00+02:00" },
    { ...event, id: "past", startsAt: "2026-07-01T18:00:00+02:00", endsAt: "2026-07-01T20:00:00+02:00" },
    { ...event, id: "third", startsAt: "2026-08-06T18:00:00+02:00", endsAt: "2026-08-06T20:00:00+02:00" }
  ],
  3,
  new Date("2026-08-02T10:00:00+02:00")
);

assert.deepEqual(
  nextHomeEvents.map((item) => item.id),
  ["first", "second", "third"],
  "accueil : trois prochains événements publics uniquement"
);

assert.equal(validateEvent(event).length, 0, "événement valide");
assert.ok(validateEvent({ ...cancelled, cancellationMessage: "" }).includes("message d'annulation manquant"), "annulation documentée");
assert.ok(
  validateEvent({ ...event, status: "scheduled", scheduledFor: undefined }).some((message) => message.includes("publication")),
  "programmation sans date refusée"
);
assert.equal(
  validateEvent({ ...event, status: "scheduled", scheduledFor: "2026-08-01T10:00:00+02:00" }).length,
  0,
  "programmation avec date valide"
);

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
assert.equal(canPrepareInvitationReminder(usableInvitation, new Date("2026-08-01T10:00:00+02:00")), true, "relance possible avant expiration");
assert.equal(canPrepareInvitationReminder({ ...usableInvitation, revoked_at: "2026-08-02T10:00:00+02:00" }), false, "relance interdite après révocation");
assert.equal(buildActivationUrl("https://cfvv.example/", "abc 123"), "https://cfvv.example/creation-compte?invitation=abc%20123", "url activation stable");
assert.equal(getDefaultInvitationExpiration(new Date("2026-08-01T10:00:00+02:00"), 14), "2026-08-15T08:00:00.000Z", "expiration invitation");

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
  "créneau réservable dans la fenêtre"
);
assert.equal(
  getReservationActionState({ ...baseReservationRule, alreadyReserved: true }, new Date("2026-09-01T09:00:00+02:00")),
  "already_reserved",
  "double clic ou doublon rendu idempotent côté interface"
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
  "annulation autorisée avant la limite"
);
assert.equal(
  canCancelReservation(
    { status: "confirmee", cancellationDeadlineAt: "2026-09-02T17:00:00+02:00" },
    new Date("2026-09-02T18:00:00+02:00")
  ),
  false,
  "annulation bloquée après la limite"
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

assert.equal(canAccessPrivateDocument(["member"], ["member"]), true, "adhérent autorisé à consulter un document membre");
assert.equal(canAccessPrivateDocument(["member"], ["manager"]), false, "adhérent bloqué pour un document gestionnaire");
assert.equal(canAccessPrivateDocument(["manager"], ["admin"]), true, "manager/admin ont acces bureau");
assert.equal(
  isAllowedPrivateDocumentFile({ mimeType: "application/pdf", sizeBytes: 1024 }),
  true,
  "document PDF autorisé"
);
assert.equal(
  isAllowedPrivateDocumentFile({ mimeType: "application/x-msdownload", sizeBytes: 1024 }),
  false,
  "type dangereux refuse"
);
assert.equal(sanitizePrivateDocumentFileName("Compte rendu AG été 2026!!.pdf"), "compte-rendu-ag-ete-2026.pdf", "nom de fichier nettoyé");

assert.equal(canPerformBackOfficeAction(["manager"], "publish_content"), true, "éditeur autorisé à publier un contenu");
assert.equal(canPerformBackOfficeAction(["manager"], "manage_admins"), false, "éditeur non autorisé à gérer les administrateurs");
assert.equal(canPerformBackOfficeAction(["admin"], "manage_admins"), true, "admin gere les droits sensibles");
assert.equal(canPerformBackOfficeAction(["manager"], "delete_permanently"), false, "suppression définitive réservée à l'administrateur");

const csvPreview = parseMemberCsvPreview(
  "email;prenom;nom;licence_ffbad;role\nalice@example.test;Alice;Dupont;123;member\nalice@example.test;Alice;Doublon;124;manager\nbad-email;Bob;Martin;;member"
);
assert.equal(csvPreview.rows.length, 3, "import CSV produit un apercu");
assert.ok(csvPreview.issues.some((issue) => issue.message.includes("Doublon")), "import CSV détecte les doublons");
assert.ok(csvPreview.issues.some((issue) => issue.message.includes("Email invalide")), "import CSV détecte les e-mails invalides");

const csvPreviewWithExistingData = parseMemberCsvPreview(
  'email,prenom,nom,licence_ffbad,role\n"membre@example.test",Marie,Club,999,member\ninvite@example.test,Paul,Invite,888,member',
  {
    existingEmails: ["membre@example.test"],
    existingLicences: ["999"],
    pendingInvitationEmails: ["invite@example.test"]
  }
);
assert.equal(csvPreviewWithExistingData.rows.length, 2, "import CSV accepte aussi la virgule");
assert.ok(csvPreviewWithExistingData.issues.some((issue) => issue.message.includes("déjà présent")), "import CSV détecte un adhérent déjà présent");
assert.ok(csvPreviewWithExistingData.issues.some((issue) => issue.message.includes("déjà en attente")), "import CSV détecte une invitation déjà en attente");

const licenceCsvPreview = parseLicenceCsvPreview(
  "Nom;Prénom;Licence;Catégorie\nAUBRY;Pauline;07172923;Veteran 1\nAUTRIVE;Kévin;07705663;Senior"
);
assert.equal(licenceCsvPreview.rows.length, 2, "import licences FFBaD accepte le CSV federation");
assert.equal(licenceCsvPreview.rows[1].prenom, "Kévin", "import licences conserve les accents");
assert.equal(licenceCsvPreview.rows[0].licence_ffbad, "07172923", "import licences conserve les zeros initiaux");

const licenceCsvWithDuplicate = parseLicenceCsvPreview("Nom;Prenom;Licence\nA;B;123\nC;D;123");
assert.ok(licenceCsvWithDuplicate.issues.some((issue) => issue.message.includes("Doublon")), "import de licences détecte les doublons");

assert.equal(nextContentStatus("brouillon", "publish"), "publie", "publication brouillon");
assert.equal(nextContentStatus("publie", "unpublish"), "brouillon", "dépublication");
assert.equal(nextContentStatus("brouillon", "schedule", "2026-09-01T10:00:00+02:00"), "programme", "planification");
assert.equal(nextContentStatus("archive", "restore"), "brouillon", "restauration");
assert.equal(nextContentStatus("brouillon", "delete_permanently"), null, "suppression définitive interdite hors corbeille");

const media = validateMediaUpload({
  fileName: "Affiche tournoi été 2026.pdf",
  mimeType: "application/pdf",
  sizeBytes: 2048,
  informative: false
});
assert.equal(media.ok, true, "media valide");
assert.equal(media.cleanName, "affiche-tournoi-ete-2026.pdf", "média nettoyé");
assert.equal(
  validateMediaUpload({ fileName: "photo.jpg", mimeType: "image/jpeg", sizeBytes: 2048, informative: true }).ok,
  false,
  "texte alternatif obligatoire pour image informative"
);

assert.equal(getMediaKind("image/webp"), "image", "médiathèque reconnaît une image webp");
assert.equal(getMediaKind("application/pdf"), "document", "médiathèque reconnaît un document public");
assert.equal(isAllowedPublicMediaFile({ mimeType: "image/png", sizeBytes: 2048 }), true, "médiathèque accepte une image valide");
assert.equal(isAllowedPublicMediaFile({ mimeType: "image/png", sizeBytes: 9 * 1024 * 1024 }), false, "médiathèque refuse un fichier trop lourd");
assert.equal(sanitizeMediaFileName("Photo rentree CFVV!!.webp"), "photo-rentree-cfvv.webp", "nom de média nettoyé");
assert.equal(
  validateMediaAssetInput({
    fileName: "hero.webp",
    mimeType: "image/webp",
    sizeBytes: 4096,
    title: "Hero accueil",
    informative: true,
    altText: ""
  }).ok,
  false,
  "alt obligatoire pour image informative"
);
assert.equal(
  validateMediaAssetInput({
    fileName: "hero.webp",
    mimeType: "image/webp",
    sizeBytes: 4096,
    title: "Hero accueil",
    informative: true,
    altText: "Joueur de badminton en action"
  }).ok,
  true,
  "image informative valide avec alt"
);
assert.equal(canDeleteMediaAsset({ knownUsage: ["accueil"], status: "archived" }).ok, false, "suppression bloquée si usage connu");
assert.equal(canDeleteMediaAsset({ knownUsage: [], status: "active" }).ok, false, "suppression impose archivage");
assert.equal(canDeleteMediaAsset({ knownUsage: [], status: "archived" }).ok, true, "suppression autorisée après archivage sans usage");

console.log("Public planning and member access tests passed");
