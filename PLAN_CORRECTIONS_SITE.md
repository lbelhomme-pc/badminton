# Plan de corrections du site CF2V41

Ce plan transforme l'audit en tâches indépendantes, ordonnées pour traiter d'abord les blocages fonctionnels, puis les informations essentielles, le mobile, l'accessibilité, les performances, le SEO et les améliorations graphiques.

## Tâche 1 — Rendre le formulaire de contact réellement fonctionnel

- Priorité : P1
- Objectif : Ne plus perdre les demandes d'information ou de séance d'essai.
- Fichiers concernés : `components/public/request-form.tsx`, nouvelle route API ou table Supabase `contact_requests`.
- Problème actuel : Le formulaire affiche un succès mais ne transmet pas réellement la demande.
- Modification recommandée : Enregistrer chaque demande en base Supabase et/ou envoyer un email au club, avec validation serveur.
- Résultat attendu : Un responsable peut consulter ou recevoir chaque demande.
- Tests à effectuer : Envoyer une demande, vérifier la base, vérifier la notification, tester les erreurs réseau.
- Risques éventuels : Spam si aucun anti-abus n'est prévu.
- Dépendances avec d'autres tâches : Tâche 13 pour la protection anti-spam.

## Tâche 2 — Stabiliser l'authentification Supabase côté navigateur

- Priorité : P1
- Objectif : Corriger les états intermittents connecté/non connecté/admin/non admin.
- Fichiers concernés : clients Supabase dans `lib`, composants auth, hooks de session.
- Problème actuel : La console en ligne signale plusieurs instances `GoTrueClient`.
- Modification recommandée : Créer un singleton Supabase browser client et l'utiliser partout côté client.
- Résultat attendu : Session stable, déconnexion immédiate, rôle admin cohérent.
- Tests à effectuer : Connexion, déconnexion, reconnexion, accès `/admin`, refresh, plusieurs onglets.
- Risques éventuels : Régression si un composant dépendait d'un client séparé.
- Dépendances avec d'autres tâches : Aucune.

## Tâche 3 — Vérifier le parcours déconnexion/reconnexion

- Priorité : P1
- Objectif : Garantir que la déconnexion fonctionne sans clic droit ni actualisation manuelle.
- Fichiers concernés : `components/layout/user-menu`, hooks auth, pages `/connexion` et espace adhérent.
- Problème actuel : L'utilisateur peut rester affiché comme connecté après déconnexion.
- Modification recommandée : Après `signOut`, vider l'état local, rafraîchir le router et rediriger proprement.
- Résultat attendu : Le menu repasse immédiatement en mode visiteur.
- Tests à effectuer : Déconnexion depuis desktop et mobile, retour navigateur, reconnexion avec le même compte.
- Risques éventuels : Double redirection si la session est déjà expirée.
- Dépendances avec d'autres tâches : Tâche 2.

## Tâche 4 — Compléter les mentions légales

- Priorité : P1
- Objectif : Supprimer le contenu placeholder juridique.
- Fichiers concernés : `app/mentions-legales/page.tsx` ou données Supabase de contenu légal.
- Problème actuel : La page indique qu'elle doit être complétée.
- Modification recommandée : Ajouter identité de l'association, siège, responsable de publication, hébergeur, contact, propriété intellectuelle.
- Résultat attendu : Page légale crédible pour un site public.
- Tests à effectuer : Vérifier l'affichage desktop/mobile et tous les liens.
- Risques éventuels : Informations inexactes si non validées par le bureau.
- Dépendances avec d'autres tâches : Validation par responsable du club.

## Tâche 5 — Compléter la politique de confidentialité

- Priorité : P1
- Objectif : Expliquer clairement les données collectées et les droits des utilisateurs.
- Fichiers concernés : `app/confidentialite/page.tsx`.
- Problème actuel : Politique trop courte pour couvrir comptes, réservations, commandes, contact et photos.
- Modification recommandée : Ajouter finalités, données collectées, conservation, destinataires, droits RGPD, contact.
- Résultat attendu : Information compréhensible pour adhérents et parents.
- Tests à effectuer : Relecture juridique, vérification mobile.
- Risques éventuels : Texte incomplet sans validation juridique.
- Dépendances avec d'autres tâches : Tâche 1 si nouvelle collecte de demandes.

## Tâche 6 — Vérifier et corriger le lien d'inscription FFBaD

- Priorité : P1
- Objectif : Eviter un blocage au moment de s'inscrire.
- Fichiers concernés : `services/club.service.ts`, `lib/mock-data.ts`, page inscription, réglages Supabase.
- Problème actuel : Le fallback ressemble à une URL historique ou non vérifiée.
- Modification recommandée : Mettre le lien officiel réellement utilisé par le club et l'afficher avec un libellé clair.
- Résultat attendu : Un visiteur arrive au bon endroit pour s'inscrire.
- Tests à effectuer : Cliquer depuis accueil, tarifs, séance d'essai et menu mobile.
- Risques éventuels : Lien externe changeant chaque saison.
- Dépendances avec d'autres tâches : Centralisation des réglages en Tâche 14.

## Tâche 7 — Ajouter une vraie page ou section “Séance d'essai”

- Priorité : P1
- Objectif : Rassurer les débutants et parents.
- Fichiers concernés : page `inscriptions/seance-essai`, accueil, tarifs, contact.
- Problème actuel : L'information existe mais pourrait être plus directe et actionnable.
- Modification recommandée : Afficher lieu, horaires possibles, matériel, prix, nombre d'essais, contact et formulaire.
- Résultat attendu : Un nouveau joueur sait exactement comment venir essayer.
- Tests à effectuer : Parcours depuis accueil en moins de deux clics.
- Risques éventuels : Informations obsolètes si non maintenues.
- Dépendances avec d'autres tâches : Tâche 1.

## Tâche 8 — Corriger la hiérarchie de titres sur la page connexion

- Priorité : P2
- Objectif : Améliorer accessibilité et SEO.
- Fichiers concernés : page `/connexion`, composants du formulaire de connexion.
- Problème actuel : Deux H1 sont détectés.
- Modification recommandée : Conserver `Connexion au club` en H1 et passer le titre de carte en H2.
- Résultat attendu : Structure de page plus claire.
- Tests à effectuer : Inspecter les H1/H2 et relire au lecteur d'écran si possible.
- Risques éventuels : Aucun significatif.
- Dépendances avec d'autres tâches : Aucune.

## Tâche 9 — Ajouter un lien d'évitement clavier

- Priorité : P2
- Objectif : Faciliter la navigation clavier.
- Fichiers concernés : layout principal, header.
- Problème actuel : Aucun lien `Aller au contenu` n'a été observé.
- Modification recommandée : Ajouter un lien visible au focus vers le contenu principal.
- Résultat attendu : Les utilisateurs clavier évitent le menu à chaque page.
- Tests à effectuer : Navigation avec Tab sur desktop et mobile.
- Risques éventuels : Mauvais style du focus si non testé.
- Dépendances avec d'autres tâches : Aucune.

## Tâche 10 — Améliorer les messages de succès et d'erreur

- Priorité : P2
- Objectif : Donner un retour clair après chaque action admin/adhérent.
- Fichiers concernés : formulaires admin, commandes volants, tarifs, actualités, auth.
- Problème actuel : L'utilisateur a signalé que l'ajout doit confirmer clairement que c'est bien ajouté.
- Modification recommandée : Ajouter toasts ou alertes `aria-live`, avec états chargement/succès/erreur.
- Résultat attendu : Chaque action indique ce qui s'est passé.
- Tests à effectuer : Ajouter, modifier, supprimer, erreur réseau, erreur RLS.
- Risques éventuels : Trop de notifications si mal dosées.
- Dépendances avec d'autres tâches : Tâche 2 pour stabilité auth.

## Tâche 11 — Rendre le prix des volants administrable

- Priorité : P1
- Objectif : Permettre au club de modifier les prix sans code.
- Fichiers concernés : module admin volants, table `volants`, page `/commande-volants`.
- Problème actuel : Le besoin de modification du prix des volants est confirmé.
- Modification recommandée : Ajouter édition du prix en centimes, validation, historique et confirmation.
- Résultat attendu : Le prix affiché côté adhérent reflète la valeur admin.
- Tests à effectuer : Modifier prix, vérifier affichage public/connecté, commander après modification.
- Risques éventuels : Erreur de prix si aucune confirmation.
- Dépendances avec d'autres tâches : Tâche 10.

## Tâche 12 — Permettre le choix du nombre de tubes commandés

- Priorité : P1
- Objectif : Rendre la commande de volants utilisable.
- Fichiers concernés : `/commande-volants`, `commandes_volants`, `stock_movements`.
- Problème actuel : Le bouton commande un seul tube et une erreur de clé étrangère a été observée.
- Modification recommandée : Ajouter sélecteur quantité, calcul montant, transaction fiable commande + mouvement stock.
- Résultat attendu : Un adhérent commande 1, 2, 3 tubes ou plus selon stock disponible.
- Tests à effectuer : Commander quantité valide, stock insuffisant, annulation, vérification stock.
- Risques éventuels : Stock négatif si transaction mal conçue.
- Dépendances avec d'autres tâches : Tâche 2 et règles RLS/SQL à vérifier.

## Tâche 13 — Ajouter une protection anti-spam au contact

- Priorité : P2
- Objectif : Eviter les demandes automatisées.
- Fichiers concernés : formulaire contact, API contact, table Supabase éventuelle.
- Problème actuel : Un formulaire public réel peut attirer du spam.
- Modification recommandée : Ajouter honeypot, rate limit simple et validation serveur.
- Résultat attendu : Demandes légitimes conservées, abus réduits.
- Tests à effectuer : Soumission normale, soumission trop rapide, champ honeypot rempli.
- Risques éventuels : Bloquer un vrai utilisateur si règle trop stricte.
- Dépendances avec d'autres tâches : Tâche 1.

## Tâche 14 — Centraliser les réglages club dans Supabase

- Priorité : P2
- Objectif : Eviter les divergences entre données mock et données réelles.
- Fichiers concernés : `services/club.service.ts`, `lib/mock-data.ts`, table `settings_site`.
- Problème actuel : Horaires, contacts, liens et tarifs peuvent être dispersés.
- Modification recommandée : Lire Supabase en priorité et garder les mocks seulement comme fallback documenté.
- Résultat attendu : L'admin devient la source principale du contenu.
- Tests à effectuer : Modifier un réglage en base, vérifier affichage sans redeploiement.
- Risques éventuels : Site vide si Supabase indisponible.
- Dépendances avec d'autres tâches : Tâche 2.

## Tâche 15 — Ajouter `robots.txt` et `sitemap.xml`

- Priorité : P1
- Objectif : Corriger l'indexation technique.
- Fichiers concernés : `app/robots.ts`, `app/sitemap.ts` ou fichiers publics équivalents.
- Problème actuel : Les deux URL retournent 404 en ligne.
- Modification recommandée : Générer robots et sitemap avec les pages publiques importantes.
- Résultat attendu : Les moteurs découvrent mieux les pages.
- Tests à effectuer : Ouvrir `/robots.txt`, `/sitemap.xml`, vérifier les URLs.
- Risques éventuels : Indexer par erreur des pages privées si mal configuré.
- Dépendances avec d'autres tâches : Liste définitive des pages publiques.

## Tâche 16 — Ajouter les données structurées locales

- Priorité : P2
- Objectif : Renforcer le SEO local.
- Fichiers concernés : layout, accueil, créneaux, événements.
- Problème actuel : Pas de balisage `SportsOrganization`, `LocalBusiness` ou `Event`.
- Modification recommandée : Ajouter JSON-LD avec uniquement les données vérifiées.
- Résultat attendu : Meilleure compréhension du club par Google.
- Tests à effectuer : Test Rich Results, validation schema.org.
- Risques éventuels : Données fausses si coordonnées non validées.
- Dépendances avec d'autres tâches : Tâches 4, 6 et 14.

## Tâche 17 — Ajouter une canonical par page publique

- Priorité : P2
- Objectif : Eviter les signaux SEO faibles ou dupliqués.
- Fichiers concernés : métadonnées Next.js des pages publiques.
- Problème actuel : Canonical non détectée sur l'accueil.
- Modification recommandée : Définir `metadata.alternates.canonical`.
- Résultat attendu : URLs principales claires.
- Tests à effectuer : Inspecter le HTML généré.
- Risques éventuels : Canonical incorrecte en préproduction.
- Dépendances avec d'autres tâches : URL officielle de production confirmée.

## Tâche 18 — Compléter les contenus parents, jeunes et compétiteurs

- Priorité : P2
- Objectif : Répondre aux vrais profils du club.
- Fichiers concernés : pages club, créneaux, inscription, actualités.
- Problème actuel : Certaines informations existent mais manquent de précision.
- Modification recommandée : Ajouter âge, encadrement, niveaux, interclubs, responsables sportifs, documents.
- Résultat attendu : Chaque public trouve sa réponse sans contacter le club.
- Tests à effectuer : Parcours parent, débutant, compétiteur en moins de trois clics.
- Risques éventuels : Informations saisonnières à maintenir.
- Dépendances avec d'autres tâches : Validation bureau/entraîneurs.

## Tâche 19 — Ajouter des photos réelles optimisées

- Priorité : P3
- Objectif : Donner une image plus vivante du club.
- Fichiers concernés : accueil, club, actualités, public assets ou stockage Supabase.
- Problème actuel : Le site est propre mais peu incarné par la vie du club.
- Modification recommandée : Ajouter photos gymnase, jeu, bénévoles, événements, en WebP/AVIF avec alt.
- Résultat attendu : Site plus chaleureux et crédible.
- Tests à effectuer : Poids des images, alt, responsive, accord droit à l'image.
- Risques éventuels : Photos de mineurs sans autorisation.
- Dépendances avec d'autres tâches : Tâche 5.

## Tâche 20 — Ajouter des headers de sécurité

- Priorité : P2
- Objectif : Durcir la production.
- Fichiers concernés : `next.config`, `vercel.json` ou middleware.
- Problème actuel : CSP, Referrer-Policy et Permissions-Policy non détectées.
- Modification recommandée : Ajouter une politique progressive compatible avec Supabase/Vercel.
- Résultat attendu : Meilleure protection navigateur.
- Tests à effectuer : Vérifier headers, auth, images, scripts, Supabase.
- Risques éventuels : CSP trop stricte bloquant des ressources.
- Dépendances avec d'autres tâches : Inventaire des domaines externes.

## Tâche 21 — Mettre en place un audit Lighthouse régulier

- Priorité : P3
- Objectif : Suivre performance, accessibilité, SEO et bonnes pratiques.
- Fichiers concernés : scripts npm, CI éventuelle.
- Problème actuel : Aucun score Lighthouse fiable n'a été produit pendant l'audit.
- Modification recommandée : Ajouter un script Lighthouse local ou CI.
- Résultat attendu : Scores reproductibles mobile/desktop.
- Tests à effectuer : Exécuter audit sur accueil, créneaux, tarifs, contact.
- Risques éventuels : Résultats variables selon réseau.
- Dépendances avec d'autres tâches : Site de production stable.

## Tâche 22 — Tester l'admin avec des données réelles sur mobile

- Priorité : P2
- Objectif : S'assurer qu'un bénévole peut gérer le site depuis téléphone.
- Fichiers concernés : pages `/admin`, composants tableaux/formulaires admin.
- Problème actuel : Les pages admin n'ont pas été auditées complètement avec session et données.
- Modification recommandée : Tester listes, filtres, formulaires, modales, confirmations à 375 px.
- Résultat attendu : Administration utilisable hors ordinateur.
- Tests à effectuer : Créer actualité, modifier tarif, modifier volant, valider commande.
- Risques éventuels : Tableaux trop larges ou actions trop petites.
- Dépendances avec d'autres tâches : Tâches 2, 10, 11, 12.

## Tâche 23 — Ajouter des validations serveur sur les actions sensibles

- Priorité : P1
- Objectif : Eviter données incohérentes ou actions interdites.
- Fichiers concernés : routes API, services Supabase, RLS.
- Problème actuel : Les erreurs de commande/stock montrent que certaines écritures doivent être sécurisées.
- Modification recommandée : Valider quantité, prix, stock, rôle, statut et relations avant insertion.
- Résultat attendu : Pas de stock négatif, pas de commande orpheline, pas de rôle modifié par erreur.
- Tests à effectuer : Cas valides, cas invalides, utilisateur non admin, manager, admin.
- Risques éventuels : Blocage d'un flux existant si la règle est trop stricte.
- Dépendances avec d'autres tâches : Tâches 2, 11, 12.

## Tâche 24 — Préparer une checklist de publication saisonnière

- Priorité : P3
- Objectif : Eviter un site abandonné ou obsolète.
- Fichiers concernés : documentation `docs` ou `AGENT.md`.
- Problème actuel : Les infos de club changent chaque saison.
- Modification recommandée : Créer une checklist : horaires, tarifs, FFBaD, bureau, gymnase, volants, photos, mentions.
- Résultat attendu : Les bénévoles savent quoi vérifier avant chaque saison.
- Tests à effectuer : Faire relire par le bureau.
- Risques éventuels : Checklist ignorée si trop longue.
- Dépendances avec d'autres tâches : Aucune.
