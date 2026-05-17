# Memo agent - Site CFVV41

## Vision produit

Construire un site de club de badminton clair, utile et maintenable :

- un site public pour les visiteurs ;
- un espace adherent simple pour reservations, profil, volants et infos internes ;
- un back-office admin comprehensible par des benevoles non techniciens ;
- Supabase comme source de verite pour Auth, profils, donnees, roles et RLS.

L'objectif n'est pas de faire une usine a gaz. La bonne version cible est : site vitrine public + espace adherent + back-office admin progressif.

## Roles cibles

- `visitor` : non connecte, pages publiques.
- `member` : adherent connecte.
- `manager` : benevole gestionnaire, peut gerer les modules operationnels.
- `admin` : responsable complet du club, gere utilisateurs, roles, contenus et exports.
- `super_admin` : role technique rare, a reserver au proprietaire du projet.

Transition actuelle :

- l'application utilise encore `profiles.role` avec `adherent`, `entraineur`, `bureau`, `admin` ;
- la cible propre est `user_roles(user_id, role)`;
- pendant la migration, garder une compatibilite entre les deux modeles.

Mapping temporaire :

- `adherent` -> `member`
- `entraineur` -> `member` + `manager`
- `bureau` -> `member` + `manager` + `admin`
- `admin` -> `member` + `manager` + `admin`

## Architecture UX publique

- Accueil : comprendre le club, CTA inscription, creneaux principaux, actualites.
- Le club : presentation, bureau, benevoles, gymnases.
- Creneaux et entrainements : horaires, lieux, publics, niveaux.
- Reservation / planning : lecture publique, reservation connectee.
- Actualites : publiques et internes.
- Classements : joueurs du club, donnees non sensibles.
- Volants : information et commande connectee.
- Inscription FFBaD : lien officiel, documents, seance d'essai.
- Contact : email, formulaire, lieu, questions.
- Connexion / espace membre : auth et compte.

## Espace adherent

Dashboard adherent :

- prochaine reservation ;
- creneaux disponibles ;
- commandes de volants ;
- stock ou disponibilite ;
- actualites importantes ;
- profil et licence/classement ;
- bouton contact.

Pages :

- Tableau de bord
- Mon profil
- Mes reservations
- Reserver un creneau
- Commander des volants
- Mes commandes
- Actualites du club
- Classements du club
- Parametres du compte
- Mot de passe oublie / reinitialisation

Chaque page doit avoir : etat vide, chargement, erreur, succes, message utilisateur clair.

## Espace admin cible

Modules :

- Membres : recherche, filtres, role, statut actif/inactif, historique reservations/commandes.
- Actualites : creer, modifier, archiver, publier/depublier, epingler, public/interne, image.
- Creneaux : lieu, date, horaire, type, capacite, reservation obligatoire, visibilite.
- Reservations : filtre date/utilisateur/creneau, annulation, liste d'attente, export CSV.
- Volants : stock, type, prix, seuil d'alerte, historique mouvements.
- Commandes : statut, paiement, remise, commentaire, validation, stock.
- Classements : ajout, modification, import CSV.
- Statistiques : adherents, reservations, commandes, stock.
- Parametres : nom du club, liens, FFBaD, gymnases, contacts, reseaux.

## Tables Supabase cibles

Minimum :

- `profiles`
- `user_roles`
- `actualites`
- `creneaux`
- `reservations`
- `volants`
- `commandes_volants`
- `rankings`
- `stock_movements`
- `audit_logs`
- `settings_site`

Regles :

- ne jamais exposer publiquement telephone/email adherents ;
- ne jamais laisser un membre modifier son role ;
- ne pas supprimer physiquement commandes/reservations sauf cas technique ;
- archiver/annuler avec statut ;
- tracer les actions sensibles.

## RLS cible

- visiteur : lit uniquement public ;
- membre : lit interne autorise, gere ses propres reservations et commandes ;
- manager : gere contenus operationnels ;
- admin : gere membres, roles, exports et parametres ;
- super_admin : reserve aux operations techniques.

Toutes les tables publiques doivent avoir RLS activee.

## Priorites

### Etape 1 - Fondations

- documenter la vision dans ce fichier ;
- poser `user_roles`, helpers RLS, audit logs, settings, stock movements ;
- garder la compatibilite avec `profiles.role` pour ne pas casser l'interface existante.

### Etape 2 - Raccordement des roles

- ajouter une couche `lib/roles.ts` pour normaliser `member`, `manager`, `admin`, `super_admin` ;
- faire lire `user_roles` par l'auth provider avec fallback sur `profiles.role` ;
- exposer `roles`, `isManager` et `isAdmin` cote application ;
- transformer l'ecran admin adherents en gestion multi-roles ;
- centraliser la modification des roles via la fonction SQL `set_user_roles` ;
- interdire la modification de ses propres roles pour eviter de perdre l'acces admin.

### Etape 3 - Back-office utilisable

- ajouter un shell d'administration commun avec navigation horizontale ;
- distinguer les pages operationnelles accessibles aux `manager` des pages sensibles reservees aux `admin` ;
- ajouter la page `/admin/parametres` pour modifier les infos publiques du club ;
- brancher les parametres sur `settings_site` ;
- garder un message clair si la migration Supabase n'est pas encore executee.

### MVP

- auth stable ;
- profils ;
- roles admin propres ;
- pages publiques ;
- creneaux lisibles ;
- reservations simples ;
- commandes volants simples ;
- admin actualites/creneaux/commandes/tarifs ;
- RLS propre.

### V2

- export CSV ;
- liste d'attente ;
- mouvements de stock visibles ;
- stats ;
- import classements ;
- parametres du site modifiables.

### V3

- notifications email ;
- paiement en ligne ;
- presence/absence ;
- logs detailles visibles ;
- dashboard stats avance.

## Erreurs a eviter

- espace membre trop complexe ;
- roles stockes uniquement dans `profiles` ;
- donnees personnelles visibles publiquement ;
- service role key cote client ;
- suppression definitive des donnees metier ;
- stock decremente au mauvais moment ;
- tableaux admin inutilisables sur mobile ;
- pages sans etat vide/erreur/succes.
