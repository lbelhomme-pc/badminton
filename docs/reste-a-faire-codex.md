# Reste a faire par Codex

Ce document liste uniquement les taches que Codex peut encore realiser dans le code, sans action externe obligatoire. Les actions sont classees dans l'ordre recommande.

## Tache 1 - Nettoyer les routes prototype

- Objectif : supprimer la confusion entre les anciens composants localStorage et le vrai parcours Supabase.
- Fichiers concernes : `app/compte/page.tsx`, `app/volants/page.tsx`, `hooks/use-club-store.tsx`, `components/auth/auth-panel.tsx`, `components/shuttles/shuttle-shop.tsx`, `components/member/member-dashboard.tsx`.
- Dependances : aucune.
- Priorite : P1.
- Difficulte : moyenne.
- Criteres d'acceptation : `/compte` redirige vers `/espace-adherent` ou affiche le vrai dashboard ; `/volants` redirige vers `/commande-volants` ou devient public sans donnees fictives ; aucun bouton "Entrer comme admin/adherent" de demo.
- Tests necessaires : build, routes 200/redirect, test navigation connecte/deconnecte.

## Tache 2 - Raccorder l'accueil aux contenus administrables

- Objectif : remplacer les blocs statiques actualites, agenda, bureau et partenaires par des donnees provenant de Supabase ou de `settings_site`.
- Fichiers concernes : `app/page.tsx`, `services/club.service.ts`, `services/supabase-data.service.ts`, `components/admin/admin-actualites.tsx`, futurs composants partenaires/evenements.
- Dependances : schema partenaire/evenements a stabiliser.
- Priorite : P1.
- Difficulte : moyenne a forte.
- Criteres d'acceptation : les trois prochains evenements publies remontent automatiquement ; les actualites administrables s'affichent ; les donnees de demonstration sont clairement absentes ou marquees.
- Tests necessaires : tests unitaires selection evenements, build, verification page accueil avec donnees vides et donnees publiees.

## Tache 3 - Completer navigation et footer

- Objectif : rendre le menu et le pied de page conformes au cahier des charges.
- Fichiers concernes : `components/layout/site-header.tsx`, `components/layout/site-footer.tsx`, `components/layout/mobile-bottom-nav.tsx`, `lib/navigation.ts`.
- Dependances : choix final des liens sociaux et organismes.
- Priorite : P1.
- Difficulte : faible.
- Criteres d'acceptation : Partenaires present dans le menu ; footer contient tarifs, lieux, categories, reglement interieur, FAQ, mentions, confidentialite, cookies, accessibilite, FFBaD, HelloAsso, contact.
- Tests necessaires : route check, navigation clavier mobile, build.

## Tache 4 - Creer le module admin Agenda

- Objectif : administrer les evenements au lieu de garder `events` statique.
- Fichiers concernes : `app/admin`, `components/admin`, `lib/public-planning.ts`, `types/domain.ts`, migrations Supabase.
- Dependances : choix final du modele table `events`.
- Priorite : P1.
- Difficulte : forte.
- Criteres d'acceptation : creation, edition, brouillon, publication, programmation, annulation, duplication simple ; affichage public et accueil raccordes.
- Tests necessaires : tests statuts, build, test public agenda, test droits manager/admin.

## Tache 5 - Ajouter invitations adherents et import CSV dans le back-office

- Objectif : rendre l'activation adherent conforme au cahier des charges.
- Fichiers concernes : `components/admin/admin-adherents.tsx`, `lib/member-invitations.ts`, `lib/back-office-rules.ts`, `supabase/migrations`.
- Dependances : service email pour l'envoi reel ; modele CSV du club.
- Priorite : P1.
- Difficulte : forte.
- Criteres d'acceptation : apercu CSV, detection doublons, creation d'invitations, relance preparee, compte rendu d'erreurs.
- Tests necessaires : tests CSV, tests roles, build, test UI.

## Tache 6 - Ajouter une mediatheque admin

- Objectif : gerer images et fichiers publics avec alt, credits et suppression controlee.
- Fichiers concernes : nouveaux composants admin, migration medias, services Supabase storage.
- Dependances : bucket public/prive a definir.
- Priorite : P2.
- Difficulte : forte.
- Criteres d'acceptation : upload controle, alt obligatoire pour images informatives, recherche, remplacement, blocage suppression si usage connu.
- Tests necessaires : validation type/taille, upload local Supabase ou mock, build.

## Tache 7 - Ajouter corbeille et restauration

- Objectif : eviter les suppressions definitives accidentelles.
- Fichiers concernes : migrations sur contenus, composants admin actualites/evenements/documents/partenaires.
- Dependances : decision duree de conservation.
- Priorite : P2.
- Difficulte : moyenne.
- Criteres d'acceptation : archiver/depublier/restaurer avant suppression definitive ; suppression definitive reservee admin.
- Tests necessaires : tests statuts, droits admin, build.

## Tache 8 - Renforcer les tests E2E

- Objectif : verifier les parcours J1 a J5 automatiquement.
- Fichiers concernes : `package.json`, dossier tests E2E a creer.
- Dependances : comptes de recette Supabase pour les tests authentifies.
- Priorite : P2.
- Difficulte : moyenne.
- Criteres d'acceptation : tests accueil > creneaux > essai, connexion, admin refus, formulaire contact invalide, routes privees.
- Tests necessaires : suite E2E en CI ou local.

## Tache 9 - Optimiser performance accueil

- Objectif : ameliorer Lighthouse accueil, actuellement 70 en local.
- Fichiers concernes : `app/page.tsx`, images `public/logos`, CSS global.
- Dependances : images finales.
- Priorite : P2.
- Difficulte : moyenne.
- Criteres d'acceptation : Lighthouse mobile accueil superieur a 80 si possible, sans degrader la charte.
- Tests necessaires : Lighthouse, build, verification visuelle.

## Tache 10 - Ajouter `NEXT_PUBLIC_SITE_URL` a `.env.example`

- Objectif : aligner l'exemple d'environnement avec `README.md` et `lib/seo.ts`.
- Fichiers concernes : `.env.example`.
- Dependances : aucune.
- Priorite : P1.
- Difficulte : faible.
- Criteres d'acceptation : variable presente sans valeur secrete.
- Tests necessaires : build.
