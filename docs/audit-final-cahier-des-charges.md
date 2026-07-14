# Audit final du cahier des charges CFVV

Date : 13 juillet 2026  
Depot audite : `C:\Users\ludov\Documents\Site_Club_Badminton`  
Reference fonctionnelle : `docs/cahier-des-charges/cahier-des-charges-cfvv.md`

## 1. Resume executif

Le projet CFVV est techniquement avance : Next.js 15, Supabase, routes publiques, espace adherent, back-office, migrations RLS, en-tetes de securite, sitemap, robots, pages legales et documentation existent. Les controles automatises disponibles passent : `npm run typecheck`, `npm.cmd run test`, `npm.cmd run build`, `npm audit --omit=dev` et Lighthouse local.

Le site public est le domaine le plus proche du MVP. Les routes principales repondent en local, la navigation a ete alignee sur la maquette, les pages essentielles existent et le SEO technique est bon.

Les parties les plus fragiles restent les modules connectes : authentification reelle Supabase, invitations, roles, reservations en concurrence, back-office en conditions reelles, HelloAsso, documents prives et validation RGPD. Plusieurs fonctionnalites sont presentes dans le code mais non validees avec des comptes reels, des donnees de production ou les services externes.

Verdict : **Pret apres developpements complementaires**.

Pourcentage indicatif du MVP : **65 %**.

## 2. Etat general du projet

### Architecture observee

- Framework : Next.js 15 App Router, React 19, TypeScript.
- Styles : Tailwind CSS et `app/globals.css`.
- Donnees : Supabase PostgreSQL avec migrations dans `supabase/migrations/`.
- Authentification : Supabase Auth cote client via `components/auth/auth-provider.tsx`.
- Protection UI : `ProtectedRoute` et `AdminRoute`.
- RLS : scripts SQL presents dans `supabase/migrations/20260614000200_rls_initial_cf2v41.sql` et migrations suivantes.
- Deploiement : Vercel avec `vercel.json`.
- PWA : `app/manifest.ts`, `public/sw.js`, icones.
- Tests : script unique `scripts/run-public-planning-tests.mjs`.

### Resultats de commandes

| Commande | Resultat |
|---|---|
| `npm run typecheck` | OK |
| `npm.cmd run test` | OK, `Public planning and member access tests passed` |
| `npm.cmd run build` | OK, 68 pages generees |
| `npm audit --omit=dev` avec certificats systeme | OK, 0 vulnerabilite |
| Controle routes local `http://localhost:3101` | 26 routes testees, toutes en 200 |
| Lighthouse local | `/` perf 70, a11y 95, BP 100, SEO 100 ; `/connexion` perf 80, a11y 96, BP 100, SEO 100 |

Scripts non disponibles : `lint`, `format`, tests E2E Playwright/Cypress.

## 3. Tableau complet des exigences

| ID | Domaine | Exigence | Statut | Preuve | Ce qui fonctionne | Ce qui manque | Codex peut-il terminer ? | Action humaine necessaire | Priorite |
|---|---|---|---|---|---|---|---|---|---|
| A01 | Architecture | Distinguer site public, espace adherent et back-office | PARTIELLEMENT REALISE | Routes `app/`, `app/espace-adherent`, `app/admin` | Separation visible dans les routes | Groupes App Router non separes, anciennes routes prototype encore accessibles | Oui, entierement | Non | P2 |
| A02 | Navigation | Menu principal conforme | PARTIELLEMENT REALISE | `components/layout/site-header.tsx` | Accueil, Creneaux, Bureau, Agenda, Club, Contact presents | Partenaires absent du menu desktop, Espace adherent via `UserMenu` seulement | Oui, entierement | Non | P1 |
| A03 | Navigation mobile | Menu mobile clavier/toucher avec Echap | REALISE ET VALIDE | `site-header.tsx`, test build OK | Focus premier lien, fermeture Echap, liens mobiles | Test manuel lecteur d'ecran non fait | Oui, avec informations a fournir | Recette mobile reelle | P2 |
| A04 | Pied de page | Footer complet | PARTIELLEMENT REALISE | `components/layout/site-footer.tsx` | Contact, liens rapides, legal, FFBaD/HelloAsso | Tarifs, FAQ, accessibilite, cookies, organismes locaux incomplets ; icones sociaux factices | Oui, avec informations a fournir | Liens sociaux/organismes a fournir | P1 |
| A05 | Routes mortes | Absence de routes mortes principales | REALISE ET VALIDE | Controle local 26 routes en 200 | Routes principales OK | Controle exhaustif de tous les liens non automatise | Oui, entierement | Non | P2 |
| B01 | Identite | Palette turquoise/anthracite | PARTIELLEMENT REALISE | `app/globals.css`, `tailwind.config.ts`, page accueil | Charte visuelle proche maquette | Quelques couleurs en dur, controle contraste manuel incomplet | Oui, entierement | Validation graphique club | P2 |
| B02 | Typographie | Rajdhani locale | PARTIELLEMENT REALISE | `app/globals.css`, `docs/design-system.md` | Font-display appliquee | Fichiers Rajdhani locaux non prouves dans `public/fonts` | Oui, avec informations a fournir | Fournir police officielle/licence | P2 |
| B03 | Logos | Logo non deforme et assets publics | REALISE MAIS NON VALIDE MANUELLEMENT | `public/logos/`, `components/brand/club-logo.tsx` | Logo utilise header/footer | Validation officielle des variantes manquante | Oui, avec informations a fournir | Valider logo officiel | P1 |
| B04 | Composants UI | Boutons, cartes, badges, formulaires, feedback | REALISE ET VALIDE | `components/ui/*`, build OK | Composants reutilisables presents | Pas de catalogue Storybook | Oui, entierement | Non | P3 |
| B05 | Reduction animations | Support motion-reduce | PARTIELLEMENT REALISE | Classes `motion-reduce:*` dans header/nav | Transitions principales prevues | Audit complet des animations non fait | Oui, entierement | Test manuel preference systeme | P3 |
| C01 | Accueil | Bandeau principal et CTA | REALISE MAIS NON VALIDE MANUELLEMENT | `app/page.tsx` | Hero, Voir les creneaux, Rejoindre le club | Photo joueur reelle non utilisee, visuel surtout CSS/logo | Oui, avec informations a fournir | Fournir photo club/droits | P1 |
| C02 | Accueil | Trois acces rapides maximum | PARTIELLEMENT REALISE | `app/page.tsx` | Bande de 4 arguments visuels | Cahier demande 3 acces rapides : Creneaux, Agenda, Espace adherent | Oui, entierement | Non | P2 |
| C03 | Accueil | Trois prochains evenements automatiques | PRESENT MAIS NON FONCTIONNEL | `app/page.tsx`, `services/club.service.ts` | Bloc agenda visible | Donnees statiques, pas de remontee Supabase/back-office | Oui, entierement | Non | P1 |
| C04 | Accueil | Actualites administrables | PRESENT MAIS NON FONCTIONNEL | `app/page.tsx`, `components/admin/admin-actualites.tsx` | Admin actualites existe | Accueil utilise `newsCards` statiques | Oui, entierement | Non | P1 |
| C05 | Accueil | Partenaires | PRESENT MAIS NON FONCTIONNEL | `app/page.tsx` | Logos textuels affiches | Donnees fictives/statiques, logos reels absents | Oui, avec informations a fournir | Fournir partenaires/logos/droits | P1 |
| D01 | Pages publiques | Creneaux | REALISE MAIS NON VALIDE MANUELLEMENT | `app/creneaux/page.tsx`, `PublicCreneauxPlanning` | Page, filtres, CTA, fallback, Supabase si configure | Donnees finales a valider | Oui, avec informations a fournir | Valider horaires officiels | P1 |
| D02 | Pages publiques | Le Bureau | REALISE MAIS NON VALIDE MANUELLEMENT | `app/club/bureau-benevoles/page.tsx`, `services/club.service.ts` | Page et donnees parametres | Droits a l'image/roles/emails a valider | Oui, avec informations a fournir | Valider bureau officiel | P1 |
| D03 | Pages publiques | Agenda | PARTIELLEMENT REALISE | `app/agenda/page.tsx`, `PublicAgenda`, `lib/public-planning.ts` | Liste, filtres, iCal, annulation cote modele | Source `events` statique vide par defaut, pas de table events admin reliee | Oui, entierement | Non | P1 |
| D04 | Pages publiques | Tarifs et inscriptions | REALISE MAIS NON VALIDE MANUELLEMENT | `app/tarifs/page.tsx`, `components/public/tarifs-list.tsx`, `admin-tarifs.tsx` | Tarifs affichables et admin | Montants/saison/lien FFBaD a valider | Oui, avec informations a fournir | Valider tarifs officiels | P1 |
| D05 | Pages publiques | Lieux et acces | REALISE MAIS NON VALIDE MANUELLEMENT | `app/lieux-acces/page.tsx`, `lib/mock-data.ts` | Adresse et acces presents | Adresse exacte, plan, accessibilite gymnase a confirmer | Oui, avec informations a fournir | Valider lieux | P1 |
| D06 | Pages publiques | FAQ | REALISE MAIS NON VALIDE MANUELLEMENT | `app/faq/page.tsx` | Route disponible | Contenu final a valider | Oui, avec informations a fournir | Valider reponses | P2 |
| D07 | Pages publiques | Partenaires / devenir partenaire | PARTIELLEMENT REALISE | Routes `/partenaires`, `/devenir-partenaire`, controle 200 | Pages presentes | Formulaire/dossier partenariat reel non prouve | Oui, avec informations a fournir | Fournir offre partenaire | P2 |
| D08 | Pages publiques | Contact | REALISE MAIS NON VALIDE MANUELLEMENT | `app/contact/page.tsx`, `app/api/contact-requests/route.ts` | Formulaire, validation serveur, honeypot, rate limit memoire | Test Supabase reel et traitement bureau non fait | Oui, avec informations a fournir | Valider email/process | P1 |
| E01 | Creneaux | Champs metier complets | PARTIELLEMENT REALISE | `CreneauRow`, `supabase/schema.sql`, `creneau-slots.ts` | Jour, horaires, lieu, type, public, niveau, responsable, capacite | Periode de validite partielle, exceptions public/admin a fiabiliser | Oui, entierement | Valider regles | P1 |
| E02 | Creneaux | Filtres public/niveau/jour/type/lieu | REALISE ET VALIDE | `PublicCreneauxBoard`, tests `run-public-planning-tests.mjs` | Tests filtres OK | Test UX mobile manuel absent | Oui, entierement | Recette mobile | P2 |
| E03 | Creneaux | Affichage mobile sans tableau horizontal | REALISE MAIS NON VALIDE MANUELLEMENT | `PublicCreneauxBoard` | Cartes empilees | Test telephone reel non fait | Oui, entierement | Test mobile reel | P2 |
| F01 | Agenda | Filtres et iCal | REALISE ET VALIDE | `PublicAgenda`, tests iCal | Filtres et generation iCal testes | Pas de donnees reelles | Oui, entierement | Non | P2 |
| F02 | Agenda | Brouillon, programmation, annulation | PARTIELLEMENT REALISE | `lib/public-planning.ts`, tests statuts | Logique de visibilite testee | Pas d'interface admin evenement dediee | Oui, entierement | Non | P1 |
| F03 | Agenda | Duplication, recurrence, exceptions | MANQUANT - CODEX PEUT LE REALISER | Aucun composant admin events dedie trouve | Rien de complet | Modele/interface manquants | Oui, entierement | Decisions de recurrence a valider | P2 |
| G01 | Auth | Connexion/deconnexion/mot de passe | REALISE MAIS NON VALIDE MANUELLEMENT | `auth-provider.tsx`, `login-form.tsx`, `password-reset-form.tsx` | Supabase Auth, reset, update password | Test email Supabase reel non fait | Non, service externe | Tester Supabase Auth/SMTP | P1 |
| G02 | Auth | Invitation personnelle a usage unique | PARTIELLEMENT REALISE | Migration `20260713000100_member_activation_invites.sql`, `lib/member-invitations.ts` | Table, hash, statut, expiration, tests logique | Pas d'UI admin envoi invitation, pas d'email | Oui, avec informations a fournir | Service email + contenu invitation | P1 |
| G03 | Auth | Numero de licence identifiant metier | PARTIELLEMENT REALISE | `profiles.licence_ffbad`, dashboard adherent | Champ affiche | Flux d'activation par licence non complet | Oui, avec informations a fournir | Fournir licences/adherents | P2 |
| G04 | Auth | Roles adherent/encadrant/editeur/admin | PARTIELLEMENT REALISE | `lib/member-access.ts`, `lib/roles.ts`, `user_roles` | Mapping member/manager/admin/super_admin | Role `editor` technique non separe | Oui, entierement | Decision club sur roles | P1 |
| G05 | Auth | Controle serveur | PARTIELLEMENT REALISE | RLS Supabase, `AdminRoute` client | RLS presente, UI protegee | Pas de middleware serveur ; tests RLS prod absents | Oui, entierement | Tester RLS Supabase | P0 |
| H01 | Reservations | Sessions datees et regles parametrees | PARTIELLEMENT REALISE | Migration `20260713000200_reservation_rules_atomicity.sql` | Ouverture, fermeture, annulation, capacite | Application prod des migrations non verifiee | Non, service externe | Appliquer/tester Supabase | P1 |
| H02 | Reservations | Atomicite et anti-doublon | REALISE MAIS NON VALIDE MANUELLEMENT | Index unique `reservations_unique_user_creneau_date_idx`, RPC `reserve_creneau` avec `for update` | Garanties SQL presentes | Test concurrence reel non fait | Non, service externe | Test deux navigateurs/comptes | P1 |
| H03 | Reservations | Fermeture exceptionnelle | PARTIELLEMENT REALISE | RPC `create_creneau_cancellation`, admin reservations | Fermeture et affichage prevus | Notification inscrits absente | Oui, avec informations a fournir | Service email | P2 |
| H04 | Reservations | Export CSV | REALISE ET VALIDE | `buildReservationCsv`, tests | CSV echappe les points-virgules | Validation depuis UI admin a faire | Oui, entierement | Recette admin | P2 |
| I01 | Boutique | Catalogue adherent HelloAsso | PARTIELLEMENT REALISE | `CommandeVolants`, `lib/helloasso.ts`, migration volants | Prix, quantite, retrait, lien HelloAsso, pas de CB | URLs HelloAsso reelles absentes | Non, service externe | Fournir/tester liens HelloAsso | P1 |
| I02 | Boutique | Stock non presente comme temps reel fiable | PARTIELLEMENT REALISE | `CommandeVolants` affiche `Stock indicatif` | Message indicatif | Admin gere encore stock interne, risque de double source | Oui, avec informations a fournir | Decision HelloAsso vs stock interne | P1 |
| J01 | Documents | Bibliotheque privee | PARTIELLEMENT REALISE | `documents_prives`, `PrivateDocumentsLibrary` | Recherche, filtres, signed URL | Test storage Supabase reel absent | Non, service externe | Configurer bucket/tester fichiers | P1 |
| J02 | Documents | Types/taille/noms de fichiers | REALISE ET VALIDE | `lib/private-documents.ts`, tests | Types dangereux refuses, noms nettoyes | Test upload reel absent | Oui, entierement | Recette admin storage | P2 |
| K01 | Back-office | Tableau de bord admin | PARTIELLEMENT REALISE | `AdminHome` | Stats Supabase, diagnostic auth | Actions recentes/erreurs envoi/imports non complets | Oui, entierement | Non | P2 |
| K02 | Back-office | Actualites avec image/lien | REALISE MAIS NON VALIDE MANUELLEMENT | `admin-actualites.tsx` | Creation, edition, suppression, image_url, lien_url | Pas de brouillon/programmation/corbeille | Oui, entierement | Non | P1 |
| K03 | Back-office | Creneaux/reservations | PARTIELLEMENT REALISE | `admin-creneaux.tsx`, `admin-reservations.tsx` | CRUD et annulations prevus | Recette Supabase reelle et exports UI a confirmer | Oui, entierement | Tester avec donnees reelles | P1 |
| K04 | Back-office | Adherents, roles | PARTIELLEMENT REALISE | `admin-adherents.tsx`, RPC `set_user_roles` | Liste et roles admin | Import CSV/invitations masse manquants | Oui, entierement | Fournir CSV de test | P1 |
| K05 | Back-office | Medias, corbeille, restauration | MANQUANT - CODEX PEUT LE REALISER | Aucun module media/corbeille global | Rien de complet | Module a creer | Oui, entierement | Regles de conservation a valider | P2 |
| L01 | Courriels | Invitations et notifications | BLOQUE PAR UN SERVICE EXTERNE | Aucun service SMTP/Resend configure | Supabase reset existe cote Auth | Emails invitation/annulation/confirmation non integres | Non, service externe | Choisir/configurer email | P1 |
| M01 | Securite | En-tetes HTTP | REALISE ET VALIDE | `next.config.mjs`, `curl -I localhost:3101` | CSP, Referrer, Permissions, nosniff, frame | CSP contient `unsafe-inline` | Oui, entierement | Non | P2 |
| M02 | Securite | Secrets non exposes | PARTIELLEMENT REALISE | `.env.example`, `api/sync-rankings` | Service role utilise seulement route serveur | `.env.example` liste `SUPABASE_SERVICE_ROLE_KEY`, prod non verifiable | Non, validation humaine | Verifier Vercel env | P0 |
| M03 | Securite | Uploads controles | PARTIELLEMENT REALISE | `documents_prives` migration, `private-documents.ts` | Types/taille/noms controles | Test storage reel non fait | Non, service externe | Tester bucket | P1 |
| M04 | Securite | Sauvegarde/restauration | MANQUANT - ACTION HUMAINE OBLIGATOIRE | `README.md`, docs | Procedure de principe documentee | Sauvegarde Supabase non configuree/testee | Non, validation humaine | Definir backup | P1 |
| N01 | RGPD | Confidentialite et mentions | PARTIELLEMENT REALISE | `app/confidentialite`, `mentions-legales` | Pages presentes et prudentes | Plusieurs champs "a valider" | Non, validation humaine | Bureau/juridique | P1 |
| N02 | RGPD | Formulaires avec consentement | REALISE MAIS NON VALIDE MANUELLEMENT | `RequestForm`, `contact-requests` API | Consentement requis | Texte final a valider | Oui, avec informations a fournir | Valider finalites | P1 |
| N03 | RGPD | Droit a l'image mineurs | MANQUANT - ACTION HUMAINE OBLIGATOIRE | Page confidentialite mentionne le sujet | Alerte presente | Registre/autorisations non fournis | Non, validation humaine | Collecter autorisations | P1 |
| O01 | Accessibilite | Skip link, landmarks, langue | REALISE ET VALIDE | `app/layout.tsx`, Lighthouse a11y 95-96 | `lang=fr`, skip link, main | Audit RGAA manuel absent | Non, validation humaine | Audit manuel | P2 |
| O02 | Accessibilite | Formulaires et erreurs | PARTIELLEMENT REALISE | Formulaires labels visibles, feedback aria-live | Labels et messages presents | Association champ-erreur non systematique | Oui, entierement | Test lecteur ecran | P2 |
| O03 | Accessibilite | Contrastes | REALISE MAIS NON VALIDE MANUELLEMENT | Lighthouse a11y 95-96 | Pas d'erreur majeure automatisee | Controle manuel complet non fait | Oui, entierement | Audit visuel | P2 |
| P01 | SEO | Titles, descriptions, sitemap, robots | REALISE ET VALIDE | `app/layout.tsx`, `lib/seo.ts`, `sitemap.ts`, `robots.ts`, Lighthouse SEO 100 | Base SEO solide | Google Search Console non configuree | Non, service externe | Configurer GSC | P2 |
| P02 | SEO | Donnees structurees locales | REALISE MAIS NON VALIDE MANUELLEMENT | `lib/structured-data.ts` | SportsOrganization, SportsActivityLocation, Event | Donnees locales exactes a confirmer | Oui, avec informations a fournir | Valider adresse/contact | P2 |
| P03 | Performance | Performance mobile | PARTIELLEMENT REALISE | Lighthouse accueil perf 70, connexion 80 | Site fonctionnel, JS raisonnable | Accueil a optimiser, images/hero a travailler | Oui, entierement | Non | P2 |
| Q01 | Exploitation | README, variables, deploiement | PARTIELLEMENT REALISE | `README.md`, `.env.example`, `vercel.json` | Docs presentes | `.env.example` incomplet pour `NEXT_PUBLIC_SITE_URL`, prod non verifiable | Oui, entierement | Verifier Vercel | P1 |
| Q02 | Exploitation | Domaine/DNS/HTTPS | BLOQUE PAR UN SERVICE EXTERNE | Vercel URL testee avant audit, `curl` local | Vercel repondait 200 lors controle precedent | Domaine final non configure | Non, service externe | DNS/domaine club | P1 |
| Q03 | Prototype restant | Anciennes routes localStorage | PRESENT MAIS NON FONCTIONNEL | `/compte`, `use-club-store.tsx`, `AuthPanel`, `/volants` | Demo locale fonctionne | Pas raccorde Supabase, confusion possible | Oui, entierement | Non | P1 |
| Q04 | Tests | Suite E2E | MANQUANT - CODEX PEUT LE REALISER | `package.json` sans Playwright/Cypress | Tests unitaires metier existants | Tests navigateur complets absents | Oui, entierement | Comptes de recette utiles | P2 |

## 4. Fonctionnalites terminees

- Build de production Next.js : OK.
- TypeScript : OK.
- Tests metier JS : OK.
- Routes principales : OK en 200 local.
- Sitemap, robots, metadata et donnees structurees : presents.
- En-tetes de securite : presents.
- UI de base : boutons, cartes, badges, feedback.
- Filtres creneaux et logique iCal : testes.
- Controle de fichiers prives cote logique : teste.

## 5. Fonctionnalites partielles

- Accueil visuel conforme a la direction graphique, mais contenus statiques.
- Creneaux publics avec fallback et Supabase client, mais donnees finales non validees.
- Agenda avec logique et iCal, mais pas encore source admin dynamique.
- Authentification Supabase presente, mais non testee avec comptes reels dans cet audit.
- Reservations avec RPC atomiques, mais concurrence reelle non testee.
- Boutique HelloAsso preparee, mais liens et retour paiement non testes.
- Documents prives prepares, mais bucket/storage reel non teste.
- Back-office operationnel en modules, mais workflow editorial incomplet.
- RGPD/accessibilite documentes, mais validation humaine indispensable.

## 6. Fonctionnalites manquantes

- Remontee automatique des actualites/evenements/partenaires sur l'accueil depuis le back-office.
- Vraie gestion admin Agenda dediee avec recurrence, duplication et exceptions.
- Envoi d'invitations adherents par email.
- Import CSV adherents complet dans l'interface.
- Mediatheque avec alt obligatoire, usages et suppression controlee.
- Corbeille/restauration globale.
- Service email transactionnel.
- Domaine final et DNS.
- Procedure de sauvegarde Supabase testee.
- Validation juridique RGPD finale.

## 7. Problemes critiques

| Priorite | Probleme | Preuve | Impact |
|---|---|---|---|
| P0 | RLS/roles Supabase production non verifies en conditions reelles | RLS dans SQL, mais pas de test prod avec comptes reels | Risque d'acces incorrect aux donnees |
| P0 | Secrets et variables production non verifiables depuis le depot | `.env.example`, Vercel non inspectable localement | Risque de mauvaise configuration |
| P1 | Anciennes routes prototype `/compte` et `/volants` encore accessibles | `use-club-store.tsx`, `app/compte/page.tsx`, `app/volants/page.tsx` | Confusion utilisateur, donnees locales fictives |
| P1 | Accueil contient encore des donnees statiques | `app/page.tsx` | Back-office ne pilote pas tout le public |
| P1 | Email/HelloAsso/Supabase storage non testes | Services externes absents de l'audit local | Parcours adherent incomplet |

## 8. Risques avant mise en production

- Un utilisateur peut tomber sur des pages prototype et croire que les donnees localStorage sont reelles.
- Les droits admin peuvent sembler bons cote interface mais doivent etre prouves par RLS en base.
- Les contenus de la page d'accueil peuvent devenir obsoletes car plusieurs blocs sont statiques.
- Les textes juridiques contiennent volontairement des marqueurs "a valider".
- Le systeme de reservation n'a pas encore ete teste en concurrence reelle.
- La boutique HelloAsso ne peut pas etre declaree terminee sans liens officiels et test de redirection.
- Les documents prives dependent d'un bucket Supabase configure correctement.

## 9. Resultats des tests

| Test | Resultat | Preuve |
|---|---|---|
| Typecheck | OK | `npm run typecheck` |
| Tests metier | OK | `npm.cmd run test` |
| Build production | OK | `npm.cmd run build`, 68 pages |
| Audit dependances | OK | `npm audit --omit=dev`, 0 vuln |
| Lighthouse local | Partiel | Perf 70 accueil, a11y 95, SEO 100 |
| Routes principales | OK | 26 routes testees en 200 |
| E2E auth/reversation | Non fait | Pas de comptes Supabase de recette fournis |
| RGAA manuel | Non fait | Necessite audit humain |
| HelloAsso reel | Non fait | Liens officiels non fournis |
| Email reel | Non fait | Service transactionnel non configure |

## 10. Pourcentages de realisation

Ces pourcentages sont des indicateurs de suivi, pas des garanties de conformite.

| Domaine | Pourcentage indicatif | Justification |
|---|---:|---|
| Site public | 74 % | Pages et routes presentes, design avance, SEO bon ; contenus administrables et finalisation humaine incomplets |
| Espace adherents | 58 % | Auth, dashboard, profil, volants, documents presents ; tests comptes reels/invitations manquants |
| Systeme de reservation | 63 % | Modele SQL/RPC/UI solide ; concurrence et Supabase reel non valides |
| Back-office | 52 % | Modules CRUD presents ; workflows CMS complets, import, medias et corbeille manquants |
| Securite/RGPD/accessibilite | 66 % | Headers, RLS, docs, Lighthouse bons ; validation RLS/RGPD/RGAA humaine manquante |
| Global MVP | 65 % | Base exploitable, mais plusieurs P0/P1 restent avant production large |

## 11. Verdict final

**Pret apres developpements complementaires.**

Le site ne doit pas etre declare pret pour production large tant que les P0/P1 suivants ne sont pas traites : verification RLS/roles Supabase en conditions reelles, nettoyage des routes prototype, raccord dynamique de l'accueil aux contenus admin essentiels, validation des variables Vercel, test HelloAsso, test email, test documents prives et validation RGPD minimale par le bureau.

### 1. Ce qui est reellement termine

- Build production.
- Typecheck.
- Tests metier disponibles.
- Routes principales en 200 local.
- Base SEO technique.
- En-tetes de securite.
- Design system de base.
- Filtres creneaux et iCal cote logique.

### 2. Ce que Codex doit encore developper

1. Supprimer ou rediriger les routes prototype `/compte` et `/volants`.
2. Raccorder l'accueil aux actualites, evenements et partenaires administrables.
3. Completer le footer et la navigation avec tous les liens attendus.
4. Creer le module admin Agenda.
5. Ajouter invitations adherents UI + import CSV.
6. Ajouter mediatheque/corbeille/restauration.
7. Ajouter tests E2E.
8. Optimiser performance accueil.

### 3. Ce que je dois faire manuellement

1. Valider les textes, horaires, tarifs, bureau et lieux.
2. Configurer Supabase production et tester RLS avec comptes reels.
3. Fournir les liens HelloAsso officiels.
4. Choisir/configurer le service d'email.
5. Valider RGPD, droit a l'image, mentions legales.
6. Configurer domaine, DNS, Vercel et sauvegardes.
7. Faire recette mobile et accessibilite manuelle.

### 4. Ce qui bloque actuellement la mise en ligne

- P0 : RLS/roles Supabase production non verifies.
- P0 : secrets/variables production non verifies.
- P1 : routes prototype accessibles.
- P1 : accueil partiellement statique.
- P1 : HelloAsso, email et documents prives non testes.
- P1 : RGPD final non valide.
