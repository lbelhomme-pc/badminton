# Audit du cahier des charges CFVV

Audit realise le 2026-07-13 a partir du depot local et des documents de reference :

- `docs/cahier-des-charges/cahier-des-charges-cfvv.md`
- `docs/cahier-des-charges/cahier-des-charges-cfvv-v0.1.docx`

Objectif : preparer une migration progressive vers le cahier des charges du Club des Fous du Volant du Vendomois, sans casser les fonctions deja operationnelles.

## 1. Architecture actuelle

### Stack detectee

- Framework : Next.js 15, App Router, React 19, TypeScript.
- Styles : Tailwind CSS 3, CSS global dans `app/globals.css`, theme Tailwind dans `tailwind.config.ts`.
- Donnees et authentification : Supabase JS v2, Auth client, tables PostgreSQL, migrations SQL dans `supabase/migrations`.
- Hebergement cible : Vercel, avec configuration `vercel.json` et cron quotidien pour la synchronisation des classements.
- PWA : manifest, icones, service worker `public/sw.js`, prompt d'installation.
- Qualite : script `typecheck`; pas de script `lint` ni de script de tests automatises detectes.
- Monitoring/performance : script Lighthouse manuel `audit:lighthouse`.

### Organisation actuelle

Le projet est organise autour de l'App Router Next.js directement a la racine :

```text
app/                  Routes publiques, espace adherent, admin, API
components/           Composants UI, layout, auth, admin, pages
hooks/                Hooks React
lib/                  Supabase, SEO, roles, utils, parsing classements
services/             Acces donnees Supabase cote client
supabase/migrations/  Schema, RLS, RPC et evolutions metier
public/               Logos, icones, PWA, service worker
docs/                 Cahier des charges, audit et documentation projet
scripts/              Audit Lighthouse
types/                Types partages
src/                  Present mais non utilise pour l'instant
```

Le cahier des charges recommande une architecture plus lisible par domaines. La structure actuelle est fonctionnelle, mais les responsabilites sont encore melangees : public, adherent, admin et services partages cohabitent dans les memes dossiers.

### Routes principales detectees

- Site public : accueil, creneaux, tarifs, contact, volants, classements, club, inscription, vie du club, partenaires, tournois.
- Espace adherent : connexion, creation de compte, mot de passe oublie, espace adherent, compte, reservations, commande de volants.
- Back-office : admin, actualites, adherents, creneaux, parametres, reservations, tarifs, volants.
- API : demandes de contact, synchronisation des classements.

### Authentification et protection

- L'authentification repose sur Supabase Auth.
- Un provider React centralise la session, le profil, les roles et la deconnexion.
- Les routes protegees sont controlees cote client par `ProtectedRoute` et `AdminRoute`.
- Les roles sont lus depuis `profiles.role` et/ou `user_roles`.
- Il n'y a pas de middleware serveur Next.js pour bloquer les routes privees avant rendu client.

Cette approche peut fonctionner pour une association, mais elle impose de soigner les etats de chargement pour eviter les impressions de deconnexion aleatoire ou de droits admin instables.

### Donnees et migrations

Les tables et objets metier deja prevus couvrent une grande partie du besoin :

- `profiles`
- `user_roles`
- `actualites`
- `creneaux`
- `reservations`
- `volants`
- `commandes_volants`
- `rankings`
- `tarifs`
- `settings_site`
- `stock_movements`
- `audit_logs`
- `waiting_list`
- `creneau_annulations`
- `contact_requests`

Des RPC existent pour reserver, annuler, gerer la disponibilite, gerer les commandes de volants, lister les membres, modifier les roles et synchroniser certains affichages.

## 2. Fonctionnalites deja presentes

### Site public

- Accueil avec proposition de valeur du club.
- Pages creneaux, tarifs, contact, volants, classements.
- Pages de presentation du club, bureau, encadrants, gymnases/acces.
- Pages inscription, tarifs, seance d'essai, licence FFBad, documents utiles.
- Pages vie du club, actualites, evenements, interclubs, partenaires, tournois.
- Sitemap, robots.txt, metadonnees SEO de base.
- Manifest PWA et service worker.

### Espace adherent

- Creation de compte.
- Connexion/deconnexion.
- Mot de passe oublie et reinitialisation.
- Tableau de bord adherent.
- Consultation de profil.
- Reservations.
- Commande de volants.
- Modification du mot de passe.

### Back-office

- Acces admin protege.
- Modules admin pour actualites, adherents, creneaux, reservations, tarifs, volants et parametres.
- Gestion de certains contenus directement depuis le site.
- Gestion des roles via Supabase et RPC.

### Base de donnees

- Schema metier deja avance.
- RLS prevues.
- Triggers et RPC pour plusieurs operations sensibles.
- Journalisation partielle via `audit_logs`.
- Gestion du stock de volants et des commandes.
- Classements synchronisables depuis CSV via cron Vercel.

## 3. Fonctionnalites partielles

### Identite CFVV

Le cahier des charges parle du CFVV et d'une charte turquoise/anthracite avec typographie Rajdhani. Le code contient encore des traces de `CFVV`, notamment dans les metadonnees, le cache PWA et certains libelles.

Statut : partiellement conforme.

Risque : incoherence d'image publique et SEO local moins propre.

### Navigation publique

Le cahier des charges attend une navigation principale du type :

- Accueil
- Creneaux
- Le Bureau
- Agenda
- Le Club
- Partenaires
- Contact
- Espace adherent

Le menu actuel met plutot en avant :

- Accueil
- Creneaux
- Tarifs
- Volants
- Le club
- Contact

Les contenus existent en partie, mais leur priorisation ne correspond pas encore au cahier des charges.

Statut : partiellement conforme.

### Agenda

Des pages evenements et planning existent, mais le modele cible du cahier des charges demande un vrai agenda editorial et sportif : filtres, evenements publies/brouillons/programmes/annules, mise en avant des trois prochains evenements sur l'accueil, event detaille, eventuellement iCal et partage.

Statut : partiellement conforme.

### Reservations

Le socle reservations existe et semble avance : creneaux, capacite, liste d'attente, annulation, disponibilite. Il reste a aligner les regles exactes du cahier des charges : reservation principalement mercredi/vendredi si c'est bien la decision club, exceptions, messages adherents, exports bureau et parcours mobile tres court.

Statut : partiellement conforme.

### Volants

Le site gere actuellement un stock interne, des commandes et des mouvements de stock. Le cahier des charges recommande plutot HelloAsso en MVP pour eviter de gerer le paiement et les donnees bancaires.

Statut : partiellement conforme, avec decision produit a valider.

### Back-office editorial

Les modules admin existent, mais le cahier des charges demande aussi : brouillons, previsualisation, publication planifiee, corbeille/restauration, gestion media avec textes alternatifs, duplication d'evenements, historique des modifications.

Statut : partiellement conforme.

### Documents

Des pages de documents utiles existent, mais l'espace documentaire reserve aux adherents et la gestion admin associee ne sont pas clairement separes.

Statut : partiellement conforme.

## 4. Fonctionnalites manquantes

### Manquantes pour le MVP du cahier des charges

- Alignement complet de l'identite : nom CFVV, charte turquoise/anthracite, typographie Rajdhani, logos definitifs.
- Menu public conforme au cahier des charges.
- Page Agenda comme rubrique structurante.
- Mise en avant claire de l'essai, des creneaux, de l'inscription et du contact en moins de trois clics.
- Parcours partenaire/sponsor plus visible et plus complet.
- Gestion claire des invitations ou codes d'acces pour les adherents.
- Identifiant licence comme reference adherent, si le club confirme ce choix.
- Statuts adherents : actif, en attente, suspendu, non renouvele.
- Role editeur distinct du role admin complet.
- Documentation RGPD visible : confidentialite, duree de conservation, droit a l'image, contact responsable.
- Politique precise pour les photos de mineurs.
- Strate de contenu "bureau/partenaires/agenda" editable sans intervention technique.

### Manquantes ou a reporter apres MVP

- Import CSV adherents complet.
- Invitations massives et relances automatiques.
- Notifications email avancees.
- iCal et partage automatique d'evenements.
- Mediatheque admin complete.
- Tableau de bord statistiques avance.
- Corbeille/restauration globale.
- MFA admin documentee et controlee.
- Interface de moderation fine.

## 5. Problemes techniques ou de securite identifies

### P1 - Incoherence d'identite CFVV / CFVV

Fichiers concernes : `app/layout.tsx`, `public/sw.js`, metadonnees, manifest et contenus.

Le cahier des charges stabilise l'identite autour de CFVV. Le code contient encore `CFVV` dans les titres SEO, l'Open Graph, le cache PWA et certains libelles.

Impact : confusion utilisateur, SEO local moins propre, risque d'image amateur.

Correction recommandee : faire un lot dedie "identite et metadonnees", avec validation humaine du nom officiel exact, des logos et des textes.

### P1 - Navigation non alignee avec les parcours attendus

Le menu actuel met `Tarifs` et `Volants` en navigation principale, mais pas `Agenda`, `Le Bureau` ni `Partenaires`.

Impact : les parcours nouveaux adherents, bureau et partenaires ne suivent pas encore le cahier des charges.

Correction recommandee : modifier progressivement le header, le footer et le menu mobile en gardant les anciennes routes accessibles.

### P1 - Authentification protegee surtout cote client

Les pages privees s'appuient sur des composants client pour afficher ou bloquer l'acces. Les donnees restent protegees par RLS, mais l'experience peut afficher temporairement un mauvais etat pendant la restauration de session.

Impact : impressions "des fois je suis admin, des fois non", clignotements, redirections trop tot.

Correction recommandee : conserver RLS, renforcer les etats de chargement, eviter les decisions de droits avant recuperation session/profil/roles, et envisager plus tard un middleware leger si necessaire.

### P1 - Variables d'environnement incompletes dans l'exemple

`NEXT_PUBLIC_SITE_URL` est utilise dans `lib/seo.ts`, mais n'est pas present dans `.env.example`.

Impact : canonical et metadonnees peuvent pointer vers le domaine Vercel par defaut.

Correction recommandee : ajouter cette variable a `.env.example` et verifier Vercel Production/Preview.

### P2 - Service worker avec cache et ancien nom

`public/sw.js` utilise `cfvv-static-v4` et met en cache des chemins precis. Un service worker peut servir une ancienne version si la strategie n'est pas controlee.

Impact : problemes de donnees ou d'interface qui semblent aleatoires apres deploiement.

Correction recommandee : renommer le cache CFVV, limiter le cache aux assets statiques, et documenter comment forcer une mise a jour PWA.

### P2 - Volants : modele interne plus lourd que le MVP recommande

Le cahier des charges recommande HelloAsso au MVP. Le site possede deja une logique interne de stock et commandes.

Impact : plus de complexite pour les benevoles, risque d'erreur de stock, besoin de controles forts.

Correction recommandee : decision humaine necessaire entre deux chemins :

- MVP simple : lien HelloAsso + suivi manuel leger.
- Gestion interne : conserver commandes/stock mais ajouter confirmations, controles, exports et regles de correction.

### P2 - Back-office encore incomplet pour l'edition autonome

Le back-office couvre plusieurs tables, mais pas encore toute la logique editoriale : brouillons, planification, previsualisation, medias, alt text, corbeille.

Impact : autonomie partielle des benevoles.

Correction recommandee : ajouter ces capacites par lots, sans grossir inutilement l'interface.

### P2 - Donnees personnelles et RGPD a renforcer

Le projet manipule profils, emails, telephones, reservations, commandes et messages de contact.

Impact : obligations RGPD reelles.

Correction recommandee : verifier les pages mentions legales/confidentialite, ajouter durees de conservation, droit d'acces/suppression, droit a l'image, politique photos mineurs, et limiter strictement l'affichage public des informations personnelles.

### P3 - Encodage a verifier sur certains messages serveur

La lecture console de `app/api/contact-requests/route.ts` affiche des chaines accentuees degradees. Cela peut venir de l'encodage du terminal, mais il faut verifier l'affichage reel dans le navigateur.

Impact : messages utilisateur potentiellement peu professionnels si le probleme est reel.

Correction recommandee : tester visuellement le formulaire contact et corriger les chaines si elles sont effectivement corrompues.

## 6. Donnees existantes a preserver

Les donnees suivantes ne doivent pas etre supprimees pendant la migration :

- Comptes Supabase Auth.
- Profils adherents dans `profiles`.
- Roles dans `user_roles`.
- Reservations existantes.
- Creneaux et exceptions.
- Actualites.
- Tarifs.
- Produits volants, commandes et mouvements de stock.
- Classements importes ou synchronises.
- Parametres du site.
- Demandes de contact.
- Logs d'audit.
- Migrations deja appliquees.

Regle de migration : privilegier les ajouts de colonnes, les vues, les statuts et les tables complementaires. Eviter les renommages destructifs tant que les donnees de production ne sont pas exportees et sauvegardees.

## 7. Migrations necessaires

### MVP

1. Ajouter ou stabiliser les champs d'identite site dans `settings_site` :
   - nom officiel court ;
   - nom officiel long ;
   - ville ;
   - email club ;
   - liens utiles ;
   - lien HelloAsso ;
   - lien FFBad ;
   - reseaux sociaux ;
   - contacts generiques.

2. Completer le modele adherent :
   - numero de licence ;
   - statut adherent ;
   - consentement droit a l'image si le club veut le gerer ;
   - date de derniere mise a jour.

3. Ajouter le role `editor` ou definir clairement l'equivalent dans `manager`.

4. Structurer l'agenda :
   - soit enrichir `actualites` avec type/publication ;
   - soit creer une table `events` dediee.

5. Ajouter les champs media editoriaux :
   - image ;
   - texte alternatif ;
   - credit photo ;
   - visibilite ;
   - statut de publication.

### V2

1. Invitations adherents et codes d'acces.
2. Import CSV adherents.
3. Mediatheque.
4. Documents prives.
5. Exports admin plus complets.
6. Notifications email.
7. Corbeille/restauration.

### V3

1. Statistiques avancees.
2. iCal et synchronisation calendrier.
3. Relances automatiques.
4. Workflow editorial complet.
5. Gestion avancee des sponsors.

## 8. Future arborescence fonctionnelle

La migration peut se faire sans tout reecrire. Proposition progressive :

```text
app/
  (public)/
    page.tsx
    creneaux/
    agenda/
    le-bureau/
    le-club/
    partenaires/
    contact/
    inscription/
  (auth)/
    connexion/
    creation-compte/
    mot-de-passe-oublie/
  (member)/
    espace-adherent/
    reservations/
    commandes/
    documents/
    profil/
  (admin)/
    admin/
    contenus/
    agenda/
    creneaux/
    reservations/
    adherents/
    volants/
    partenaires/
    parametres/
  api/

src/
  features/
    public-site/
    member-space/
    admin/
    reservations/
    agenda/
    shuttles/
    partners/
  shared/
    ui/
    auth/
    data/
    config/
    types/
```

Remarque : Next.js autorise `app/` a la racine. Il n'est pas necessaire de tout deplacer dans `src/` immediatement. Le plus propre est de migrer d'abord les composants metier vers `src/features`, puis de reorganiser les routes si cela apporte un vrai gain.

## 9. Futur modele de roles et permissions

### Cahier des charges

- Visiteur : lecture publique.
- Adherent : acces espace adherent, reservations, documents, commandes.
- Encadrant : acces a certaines informations de groupe ou de creneau.
- Editeur : gestion contenus publics, actualites, agenda, pages.
- Administrateur : gestion globale.
- Super administrateur : role technique exceptionnel.

### Modele actuel

- `member`
- `manager`
- `admin`
- `super_admin`
- roles historiques : `adherent`, `entraineur`, `bureau`, `admin`

### Proposition de correspondance

| Role cible | Role technique recommande | Commentaire |
|---|---|---|
| Visiteur | `anon` Supabase | Lecture publique uniquement |
| Adherent | `member` | Role de base connecte |
| Encadrant | `manager` avec scope limite | Peut aider sur presences/creneaux |
| Editeur | `editor` a ajouter ou `manager` + permissions editoriales | Decision humaine necessaire |
| Admin | `admin` | Gestion club |
| Super admin | `super_admin` | Rare, technique, a limiter |

### Principes de permission

- Un membre ne peut lire/modifier que son profil autorise.
- Un membre ne voit que ses reservations et commandes.
- Les actualites publiques sont lisibles par tous.
- Les actualites internes sont lisibles par les membres.
- Les roles ne peuvent etre modifies que par admin ou super_admin.
- Les suppressions doivent etre remplacees autant que possible par archivage, statut inactif ou corbeille.
- Le service role Supabase reste interdit dans le client.

## 10. Matrice de conformite

| Domaine | Statut | Constat | Priorite |
|---|---|---|---|
| Stack moderne Next/Supabase | conforme | La base technique est adaptee au projet. | MVP |
| Separation public/adherent/admin | partiellement conforme | Les routes existent, mais l'organisation fonctionnelle reste a clarifier. | MVP |
| Identite CFVV | partiellement conforme | Traces CFVV, charte graphique non alignee. | MVP |
| Navigation publique cible | partiellement conforme | Agenda, Bureau et Partenaires ne sont pas assez visibles. | MVP |
| Accueil orientee conversion | partiellement conforme | Les blocs existent en partie, mais doivent suivre le parcours cahier des charges. | MVP |
| Creneaux lisibles mobile | partiellement conforme | Base presente, filtres et lisibilite cible a verifier/renforcer. | MVP |
| Agenda | partiellement conforme | Pages presentes, modele editorial incomplet. | MVP |
| Bureau | partiellement conforme | Page presente, a aligner avec fonctions/photos/contacts generiques. | MVP |
| Partenaires | partiellement conforme | Page presente, parcours sponsor a renforcer. | MVP |
| Contact | conforme | Formulaire et API presents, anti-spam et encodage a verifier. | MVP |
| Espace adherent | partiellement conforme | Fonctions presentes, UX et stabilite auth a renforcer. | MVP |
| Reservations | partiellement conforme | Socle avance, regles club exactes a valider. | MVP |
| Volants | a clarifier | Gestion interne existante, HelloAsso recommande par le cahier. | MVP |
| Documents adherents | partiellement conforme | Pages utiles presentes, espace reserve a structurer. | V2 |
| Back-office contenus | partiellement conforme | CRUD existe, workflow editorial incomplet. | MVP/V2 |
| Roles et permissions | partiellement conforme | Role editeur absent ou non explicite. | MVP |
| Import adherents | absent | Non detecte comme fonction complete. | V2 |
| Invitations adherents | absent | Non detecte comme fonction complete. | V2 |
| Mediatheque | absent | Non detectee. | V2 |
| Audit logs | partiellement conforme | Table presente, couverture a verifier. | V2 |
| RGPD | partiellement conforme | Pages existent probablement, contenu juridique a auditer. | MVP |
| Accessibilite | partiellement conforme | Skip link present, audit RGAA complet non realise a ce stade. | MVP |
| SEO local | partiellement conforme | Base presente, domaine/nom/schema local a aligner. | MVP |
| Tests automatises | absent | Pas de script test/lint detecte. | V2 |
| Performance/PWA | partiellement conforme | PWA presente, cache a surveiller. | MVP |

## 11. Plan d'execution par lots

### Lot 0 - Stabilisation et decisions

Objectif : eviter de construire sur des hypotheses floues.

- Valider le nom officiel : CFVV, CFVV41 ou autre libelle public exact.
- Valider la couleur principale et les logos definitifs.
- Valider si les volants passent par HelloAsso au MVP ou restent geres en interne.
- Valider si le role `editor` doit exister separement de `manager`.
- Ajouter les variables manquantes dans `.env.example`, notamment `NEXT_PUBLIC_SITE_URL`.
- Documenter les URL Supabase autorisees et Vercel Production/Preview.

### Lot 1 - Identite, navigation et SEO de base

Objectif : rendre le site public coherent avec le cahier des charges.

- Remplacer les traces CFVV non voulues par CFVV.
- Aligner les metadonnees, manifest, Open Graph, service worker.
- Recomposer le menu : Accueil, Creneaux, Le Bureau, Agenda, Le Club, Partenaires, Contact, Espace adherent.
- Garder les routes existantes avec redirections ou liens secondaires.
- Mettre a jour sitemap et canonical.

### Lot 2 - Pages publiques MVP

Objectif : permettre a un visiteur de comprendre et contacter le club en moins de trois clics.

- Revoir l'accueil selon l'ordre du cahier des charges.
- Consolider Creneaux, Bureau, Agenda, Club, Partenaires, Contact.
- Mettre les contenus essentiels dans Supabase ou `settings_site` quand ils doivent etre modifies par les benevoles.
- Ajouter les appels a l'action : essayer, s'inscrire, contacter, voir les creneaux.

### Lot 3 - Espace adherent et authentification fiable

Objectif : supprimer les impressions de session instable.

- Verifier les etats de chargement auth.
- Bloquer les decisions admin tant que session/profil/roles ne sont pas charges.
- Clarifier les messages utilisateur.
- Ajouter le statut adherent et le numero de licence si valide par le club.
- Preparer invitations/codes en V2.

### Lot 4 - Reservations

Objectif : rendre le parcours mobile court, fiable et comprehensible.

- Valider les creneaux reservables.
- Afficher disponibilite, capacite, liste d'attente, confirmation et annulation.
- Ajouter exports responsables si manquants.
- Documenter les regles bureau.

### Lot 5 - Volants

Objectif : choisir entre simplicite MVP et gestion interne.

- Option A : HelloAsso comme parcours principal, stock informatif uniquement.
- Option B : conserver commandes internes avec prix modifiable, quantite, confirmation, statut, historique et correction de stock.
- Dans les deux cas : pas de donnees bancaires stockees sur le site.

### Lot 6 - Back-office editorial

Objectif : autonomie des benevoles sans usine a gaz.

- Actualites avec image, lien, alt, public/interne, epingle.
- Agenda avec brouillon/publication/annulation.
- Parametres site.
- Bureau, partenaires, contacts.
- Historique minimal des modifications sensibles.

### Lot 7 - Qualite, accessibilite, RGPD et tests

Objectif : rendre le site maintenable.

- Ajouter lint standard.
- Ajouter tests simples sur fonctions critiques si possible.
- Audit mobile 320/375/768/1024/1440.
- RGPD : confidentialite, droit image, donnees personnelles.
- Accessibilite : titres, focus, contrastes, formulaires.
- Performance : verifier PWA/cache, images, Lighthouse.

## 12. Decisions necessitant validation humaine

1. Nom public exact du club : CFVV, CFVV41, ou "Club des Fous du Volant du Vendomois".
2. Logo officiel a utiliser en production.
3. Choix volants : HelloAsso MVP ou gestion interne.
4. Role `editor` separe ou fusion avec `manager`.
5. Regles exactes de reservation : jours, capacites, delais, annulations, liste d'attente.
6. Donnees personnelles stockees : telephone, licence, classement, statut, droit a l'image.
7. Politique photos, en particulier pour les mineurs.
8. Domaine final du site et URL Supabase autorisees.

## 13. Conclusion

Le projet est deja plus avance qu'un simple site vitrine : il possede une base Next/Supabase solide, un espace adherent, un back-office, des migrations, des RLS et des fonctions metier. La bonne strategie n'est donc pas de tout reecrire.

La priorite est de transformer progressivement l'existant en produit CFVV coherent :

1. stabiliser l'identite, le menu, le SEO et les variables ;
2. aligner les pages publiques avec les parcours du cahier des charges ;
3. fiabiliser l'authentification et les roles ;
4. trancher le modele des volants ;
5. enrichir le back-office par petites couches utiles aux benevoles.

Le risque principal n'est pas technique pur : c'est de rendre l'outil trop complexe pour une association. Le cahier des charges doit rester le garde-fou : utile, lisible, maintenable, et modifiable par des benevoles sans dependance permanente a un developpeur.
