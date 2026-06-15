# Prompts de correction du site CF2V41

Ces prompts sont à utiliser un par un, dans l'ordre.  
Chaque prompt demande à Codex de corriger une priorité précise, sans mélanger les sujets.

## Prompt 1 — Corriger le formulaire de contact et séance d'essai

```text
Tu travailles sur le projet local du site CF2V41.

Objectif prioritaire P1 : rendre le formulaire de contact / demande de séance d'essai réellement fonctionnel.

Contexte :
- Le fichier concerné principal est probablement components/public/request-form.tsx.
- Aujourd'hui, le formulaire affiche un succès côté interface mais ne transmet pas réellement la demande.
- Le site utilise Supabase.

Ce que tu dois faire :
1. Analyse d'abord le code existant du formulaire, des services Supabase et des routes API.
2. Ne modifie que les fichiers nécessaires.
3. Crée une vraie persistance des demandes :
   - soit dans une table Supabase contact_requests ;
   - soit via une route API qui enregistre en base ;
   - si une table équivalente existe déjà, utilise-la au lieu d'en créer une nouvelle.
4. Le formulaire doit enregistrer :
   - nom ;
   - email ;
   - téléphone si présent ;
   - type de demande ;
   - message ;
   - date de création ;
   - statut initial, par exemple "nouveau".
5. Ajoute une validation côté client et côté serveur :
   - email valide ;
   - nom obligatoire ;
   - message obligatoire ;
   - message d'erreur clair.
6. Ajoute un retour utilisateur visible :
   - état chargement ;
   - succès ;
   - erreur ;
   - message accessible avec aria-live.
7. Ne fais pas d'envoi email si la configuration email n'existe pas encore, mais prépare le code pour qu'on puisse l'ajouter plus tard.
8. Si une migration Supabase est nécessaire, crée-la proprement avec RLS :
   - insertion publique autorisée uniquement pour créer une demande ;
   - lecture/modification réservée aux admins/managers ;
   - pas de suppression publique.

Tests attendus :
- npm run typecheck
- npm run build
- test manuel du formulaire
- vérifier qu'une demande est bien créée en base ou que le fallback affiche une erreur claire si Supabase n'est pas configuré.

À la fin, donne :
- les fichiers modifiés ;
- la table Supabase créée ou utilisée ;
- les tests effectués ;
- ce qui reste à configurer côté Supabase ou email.
```

## Prompt 2 — Stabiliser Supabase Auth et la déconnexion

```text
Tu travailles sur le projet local du site CF2V41.

Objectif prioritaire P1 : stabiliser l'authentification Supabase.

Problèmes observés :
- En production, la console affiche : "Multiple GoTrueClient instances detected".
- L'utilisateur signale que la déconnexion ne fonctionne pas toujours sans actualiser.
- Parfois l'utilisateur semble admin, parfois non.
- Après reconnexion, l'état de session peut rester incohérent.

Ce que tu dois faire :
1. Analyse tous les fichiers qui créent un client Supabase côté navigateur.
2. Identifie les doublons de createClient côté client.
3. Mets en place un singleton Supabase browser client.
4. Fais en sorte que tous les composants client utilisent ce singleton.
5. Vérifie la logique de session, profil et rôle :
   - récupération session ;
   - récupération profile ;
   - récupération role ;
   - rafraîchissement après login/logout.
6. Corrige la déconnexion :
   - appeler supabase.auth.signOut() ;
   - vider l'état local ;
   - invalider/rafraîchir le router si nécessaire ;
   - rediriger vers /connexion ou / ;
   - mettre à jour immédiatement le header.
7. Ne modifie pas les règles RLS sauf si tu identifies une erreur indispensable.
8. Ne casse pas le parcours mot de passe oublié / reset password.

Tests attendus :
- npm run typecheck
- npm run build
- ouvrir le site local ;
- se connecter ;
- aller sur espace adhérent ;
- aller sur admin si le rôle le permet ;
- se déconnecter ;
- vérifier que le bouton connexion réapparaît sans actualisation manuelle ;
- se reconnecter.

À la fin, donne :
- la cause principale du bug ;
- les fichiers modifiés ;
- les tests effectués ;
- les limites éventuelles si une donnée Supabase manque.
```

## Prompt 3 — Compléter les mentions légales et confidentialité

```text
Tu travailles sur le projet local du site CF2V41.

Objectif prioritaire P1 : remplacer les pages juridiques incomplètes par des pages propres et utilisables.

Pages concernées :
- app/mentions-legales/page.tsx
- app/confidentialite/page.tsx
- éventuellement footer ou navigation si les liens ne sont pas assez visibles.

Contexte :
- La page mentions légales contient actuellement un placeholder.
- Le site est celui d'une association sportive.
- Ne fabrique pas d'informations non connues.

Ce que tu dois faire :
1. Lire les pages existantes.
2. Remplacer les textes placeholder par une structure claire.
3. Garder des champs explicites à compléter si une information n'est pas connue :
   - nom légal de l'association ;
   - siège social ;
   - responsable de publication ;
   - hébergeur : Vercel si confirmé par le déploiement ;
   - contact ;
   - propriété intellectuelle ;
   - crédits photos ;
   - droit à l'image.
4. Pour la confidentialité, expliquer :
   - données de compte ;
   - réservations ;
   - commandes de volants ;
   - formulaire de contact ;
   - durée de conservation à compléter par le club ;
   - droits RGPD ;
   - contact pour suppression ou rectification.
5. Ajouter un avertissement clair si une information doit être validée par le bureau.
6. Ne prétends pas que le site est juridiquement conforme à 100 %.

Tests attendus :
- npm run typecheck
- npm run build
- vérifier affichage desktop et mobile.

À la fin, donne :
- les sections ajoutées ;
- les informations encore à compléter par le club ;
- les fichiers modifiés.
```

## Prompt 4 — Ajouter robots.txt, sitemap.xml et canonical

```text
Tu travailles sur le projet local du site CF2V41.

Objectif prioritaire P1/P2 : corriger le SEO technique de base.

Problèmes observés :
- https://badminton-orcin.vercel.app/robots.txt retourne 404.
- https://badminton-orcin.vercel.app/sitemap.xml retourne 404.
- Aucune canonical claire n'a été détectée sur la page d'accueil.

Ce que tu dois faire :
1. Analyse la structure Next.js App Router.
2. Ajoute un robots.txt via la méthode Next.js adaptée.
3. Ajoute un sitemap.xml via la méthode Next.js adaptée.
4. Inclure uniquement les pages publiques :
   - /
   - /creneaux
   - /tarifs
   - /contact
   - /vie-du-club/actualites
   - /club/gymnases-acces
   - /inscriptions/seance-essai
   - /mentions-legales
   - /confidentialite
5. Exclure les pages privées :
   - /admin
   - /espace-adherent ou équivalent
   - pages de compte si privées.
6. Ajouter des canonical propres dans les métadonnées des pages publiques principales.
7. Utiliser comme URL de production : https://badminton-orcin.vercel.app sauf si une variable NEXT_PUBLIC_SITE_URL existe déjà.

Tests attendus :
- npm run typecheck
- npm run build
- vérifier localement /robots.txt et /sitemap.xml ;
- vérifier le HTML de l'accueil pour la canonical.

À la fin, donne :
- les URLs incluses dans le sitemap ;
- les URLs exclues ;
- les fichiers modifiés ;
- les tests effectués.
```

## Prompt 5 — Vérifier et clarifier le parcours inscription FFBaD

```text
Tu travailles sur le projet local du site CF2V41.

Objectif prioritaire P1 : rendre le parcours d'inscription clair et fiable.

Problème :
- Le lien d'inscription FFBaD ou club doit être vérifié et affiché clairement.
- Un nouveau joueur doit comprendre comment s'inscrire ou demander une séance d'essai.

Ce que tu dois faire :
1. Cherche tous les endroits où le lien d'inscription est défini ou affiché.
2. Identifie le lien fallback actuel.
3. Ne remplace pas par une URL inventée.
4. Si l'URL officielle n'est pas certaine, centralise le lien dans un réglage clair et affiche un message administrable.
5. Améliore la page ou section inscription :
   - étapes simples ;
   - documents à prévoir ;
   - lien FFBaD ;
   - contact en cas de question ;
   - séance d'essai ;
   - indication que les informations sont à confirmer par le club si besoin.
6. Ajoute des CTA visibles depuis :
   - accueil ;
   - tarifs ;
   - créneaux ;
   - contact.

Tests attendus :
- npm run typecheck
- npm run build
- cliquer tous les CTA inscription ;
- vérifier desktop et mobile.

À la fin, donne :
- les textes modifiés ;
- les liens trouvés ;
- les liens qui restent à confirmer par le club ;
- les fichiers modifiés.
```

## Prompt 6 — Corriger les commandes de volants et le choix de quantité

```text
Tu travailles sur le projet local du site CF2V41.

Objectif prioritaire P1 : rendre la commande de volants fiable.

Problèmes observés :
- L'utilisateur doit pouvoir choisir le nombre de tubes.
- Une erreur a été observée : insert/update on table stock_movements violates foreign key constraint stock_movements_commande_id_fkey.
- Le prix des volants doit être modifiable côté admin.

Ce que tu dois faire :
1. Analyse les tables Supabase liées :
   - volants ;
   - commandes_volants ;
   - stock_movements.
2. Analyse le code de la page commande-volants et le module admin volants.
3. Ajoute un sélecteur de quantité par produit :
   - minimum 1 ;
   - maximum selon stock disponible ;
   - montant total calculé.
4. Corrige la création de commande pour éviter toute commande ou mouvement stock orphelin.
5. Si possible, utiliser une transaction ou une fonction RPC Supabase pour :
   - créer la commande ;
   - créer le mouvement de stock ;
   - décrémenter le stock uniquement si la commande est valide.
6. Ajouter des messages clairs :
   - commande créée ;
   - stock insuffisant ;
   - erreur technique ;
   - connexion requise.
7. Ne permets pas un stock négatif.

Tests attendus :
- npm run typecheck
- npm run build
- commander 1 tube ;
- commander plusieurs tubes ;
- tester stock insuffisant ;
- vérifier que le stock et les commandes restent cohérents.

À la fin, donne :
- la cause de l'erreur de clé étrangère ;
- les fichiers modifiés ;
- les migrations ou RPC ajoutées ;
- les tests effectués.
```

## Prompt 7 — Permettre à l'admin de modifier le prix des volants

```text
Tu travailles sur le projet local du site CF2V41.

Objectif prioritaire P1 : permettre à l'admin de modifier les prix des volants directement sur le site.

Ce que tu dois faire :
1. Analyse le module admin existant pour les volants.
2. Vérifie la structure de la table volants :
   - nom ;
   - type ;
   - stock ;
   - prix en centimes ou format équivalent ;
   - actif/inactif.
3. Ajoute ou corrige le formulaire admin pour modifier :
   - nom ;
   - type ;
   - stock ;
   - prix ;
   - seuil d'alerte si présent ;
   - actif/inactif.
4. Le prix doit être saisi en euros côté interface et stocké proprement en centimes si c'est le modèle existant.
5. Ajouter validation :
   - prix positif ;
   - stock entier ;
   - nom obligatoire.
6. Ajouter confirmation de succès et message d'erreur.
7. Vérifier que la page commande-volants affiche le nouveau prix.

Tests attendus :
- npm run typecheck
- npm run build
- modifier un prix en admin ;
- vérifier affichage côté adhérent ;
- tester valeur invalide.

À la fin, donne :
- les fichiers modifiés ;
- la logique de conversion euros/centimes ;
- les tests effectués.
```

## Prompt 8 — Ajouter des confirmations sur toutes les actions admin

```text
Tu travailles sur le projet local du site CF2V41.

Objectif prioritaire P2 : chaque action admin doit confirmer clairement son résultat.

Contexte :
- L'utilisateur veut une validation visible quand une actualité, un tarif, un volant, un créneau ou une commande est ajouté/modifié.

Ce que tu dois faire :
1. Analyse tous les formulaires admin.
2. Liste les actions :
   - créer ;
   - modifier ;
   - supprimer ;
   - publier/dépublier ;
   - valider ;
   - annuler.
3. Ajoute un système cohérent de feedback :
   - chargement ;
   - succès ;
   - erreur ;
   - confirmation avant action sensible.
4. Les messages doivent être précis :
   - "Actualité publiée"
   - "Tarif mis à jour"
   - "Volant ajouté"
   - "Commande validée"
   - "Erreur : stock insuffisant"
5. Les messages doivent être accessibles avec aria-live ou équivalent.
6. Ne crée pas plusieurs systèmes de notifications concurrents si un composant existe déjà.

Tests attendus :
- npm run typecheck
- npm run build
- tester au moins une création, une modification, une suppression/annulation.

À la fin, donne :
- les actions couvertes ;
- les fichiers modifiés ;
- les tests effectués ;
- les actions qui restent sans feedback si tu en trouves.
```

## Prompt 9 — Ajouter liens et photos dans les actualités

```text
Tu travailles sur le projet local du site CF2V41.

Objectif prioritaire P2 : permettre aux admins d'ajouter des liens et des photos dans les actualités.

Ce que tu dois faire :
1. Analyse la table actualites et le module admin actualités.
2. Vérifie si des champs existent déjà pour :
   - image_url ;
   - lien_url ;
   - lien_label ;
   - contenu riche ;
   - visibilité public/interne.
3. Si les champs manquent, crée une migration Supabase propre.
4. Dans l'admin, permettre :
   - ajouter une image par URL ou via stockage Supabase si déjà configuré ;
   - ajouter un lien avec libellé ;
   - prévisualiser l'actualité ;
   - publier/dépublier ;
   - choisir public/interne.
5. Côté public, afficher :
   - image optimisée ;
   - alt text ;
   - lien cliquable avec rel adapté si externe.
6. Ne permets pas de HTML libre dangereux sans sanitation.

Tests attendus :
- npm run typecheck
- npm run build
- créer une actualité avec image ;
- créer une actualité avec lien ;
- vérifier rendu public et interne.

À la fin, donne :
- les champs ajoutés ou utilisés ;
- les protections XSS prévues ;
- les fichiers modifiés ;
- les tests effectués.
```

## Prompt 10 — Améliorer l'accessibilité de base

```text
Tu travailles sur le projet local du site CF2V41.

Objectif prioritaire P2 : corriger les principaux problèmes d'accessibilité relevés dans l'audit.

Corrections attendues :
1. Un seul H1 par page principale, notamment sur /connexion.
2. Ajouter un lien d'évitement "Aller au contenu".
3. Vérifier que le focus clavier est visible dans le header, le menu mobile, les boutons et formulaires.
4. Vérifier que les messages d'erreur/succès sont annoncés avec aria-live.
5. Vérifier les labels des champs.
6. Ne pas utiliser la couleur seule pour indiquer un statut.

Ce que tu dois faire :
1. Lire les composants layout, header, formulaires et pages auth.
2. Appliquer les corrections minimales.
3. Ne refais pas le design complet.
4. Garde la cohérence visuelle actuelle.

Tests attendus :
- npm run typecheck
- npm run build
- navigation clavier avec Tab ;
- vérifier /, /connexion, /contact, /commande-volants.

À la fin, donne :
- les problèmes corrigés ;
- les fichiers modifiés ;
- les tests effectués ;
- les points d'accessibilité qui restent à auditer manuellement.
```

## Prompt 11 — Ajouter les données structurées SEO local

```text
Tu travailles sur le projet local du site CF2V41.

Objectif prioritaire P2 : améliorer le SEO local avec des données structurées propres.

Ce que tu dois faire :
1. Lire les données fiables disponibles :
   - nom du club ;
   - ville ;
   - adresse gymnase ;
   - email ;
   - URL du site ;
   - créneaux si fiables.
2. Ne fabrique aucune donnée incertaine.
3. Ajouter un JSON-LD adapté :
   - SportsOrganization ou Organization ;
   - éventuellement SportsActivityLocation si pertinent ;
   - Event seulement pour de vrais événements datés.
4. Ajouter les mêmes informations visibles dans la page si elles ne le sont pas déjà.
5. Vérifier que le JSON-LD ne contient pas de téléphone ou adresse non validée.

Tests attendus :
- npm run typecheck
- npm run build
- inspecter le HTML généré ;
- tester avec un validateur schema.org si possible.

À la fin, donne :
- le type schema.org utilisé ;
- les données incluses ;
- les données volontairement exclues car non vérifiées ;
- les fichiers modifiés.
```

## Prompt 12 — Ajouter des headers de sécurité

```text
Tu travailles sur le projet local du site CF2V41.

Objectif prioritaire P2 : améliorer les en-têtes de sécurité en production.

Contexte :
- Le site est hébergé sur Vercel.
- HSTS est déjà détecté.
- CSP, Referrer-Policy et Permissions-Policy n'ont pas été détectées pendant l'audit.

Ce que tu dois faire :
1. Analyse next.config et vercel.json.
2. Ajouter des headers de sécurité compatibles avec Next.js, Vercel et Supabase :
   - Content-Security-Policy progressive ;
   - Referrer-Policy ;
   - Permissions-Policy ;
   - X-Content-Type-Options ;
   - éventuellement X-Frame-Options si compatible.
3. Ne bloque pas Supabase, les images, les polices ou les scripts nécessaires.
4. Préfère une CSP prudente mais fonctionnelle.

Tests attendus :
- npm run typecheck
- npm run build
- ouvrir le site local ;
- vérifier que les pages chargent ;
- vérifier que Supabase Auth fonctionne encore ;
- contrôler les headers si possible.

À la fin, donne :
- les headers ajoutés ;
- les domaines autorisés dans la CSP ;
- les risques restants ;
- les fichiers modifiés.
```

## Prompt 13 — Ajouter les contenus parents, jeunes, compétiteurs et partenaires

```text
Tu travailles sur le projet local du site CF2V41.

Objectif prioritaire P2 : compléter les informations utiles pour les différents publics du club.

Publics concernés :
- parent d'un jeune joueur ;
- nouveau adulte ;
- joueur loisir ;
- compétiteur ;
- partenaire ou collectivité.

Ce que tu dois faire :
1. Analyse les pages existantes : accueil, créneaux, tarifs, le club, contact, actualités.
2. Ajoute ou améliore les contenus sans inventer de données précises non vérifiées.
3. Utilise des formulations avec champs à compléter si nécessaire.
4. Ajouter clairement :
   - âge minimum ou "à confirmer" ;
   - encadrement des jeunes ;
   - niveaux acceptés ;
   - interclubs / compétition ;
   - documents nécessaires ;
   - valeurs du club ;
   - contact responsable.
5. Ne surcharge pas l'accueil : créer des sections courtes et des liens vers pages dédiées.

Tests attendus :
- npm run typecheck
- npm run build
- vérifier mobile ;
- vérifier qu'un parent trouve les infos en moins de trois clics.

À la fin, donne :
- les contenus ajoutés ;
- les informations qui doivent être validées par le bureau ;
- les fichiers modifiés.
```

## Prompt 14 — Tester et améliorer l'admin sur mobile

```text
Tu travailles sur le projet local du site CF2V41.

Objectif prioritaire P2 : rendre l'espace admin utilisable par des bénévoles sur téléphone.

Ce que tu dois faire :
1. Lancer le site local.
2. Tester les pages admin à 375 px de largeur.
3. Identifier :
   - tableaux trop larges ;
   - boutons trop petits ;
   - modales qui débordent ;
   - formulaires trop longs ;
   - actions dangereuses sans confirmation.
4. Corriger uniquement les problèmes ergonomiques importants.
5. Préférer :
   - cartes empilées sur mobile ;
   - boutons pleine largeur si nécessaire ;
   - filtres repliables ;
   - confirmations simples.

Tests attendus :
- npm run typecheck
- npm run build
- capture ou description des pages testées à 375 px ;
- test création/modification si session admin disponible.

À la fin, donne :
- les écrans testés ;
- les problèmes corrigés ;
- les problèmes restants ;
- les fichiers modifiés.
```

## Prompt 15 — Mettre en place un audit Lighthouse reproductible

```text
Tu travailles sur le projet local du site CF2V41.

Objectif prioritaire P3 : ajouter un audit performance/accessibilité/SEO reproductible.

Ce que tu dois faire :
1. Vérifie si Lighthouse ou une alternative est déjà disponible.
2. Ajoute un script npm si pertinent, sans alourdir inutilement le projet.
3. Prévoir l'audit des pages :
   - /
   - /creneaux
   - /tarifs
   - /contact
   - /connexion.
4. Documenter comment lancer l'audit.
5. Ne bloque pas le build de production avec Lighthouse tant que les seuils ne sont pas décidés.

Tests attendus :
- npm run build
- lancement du script d'audit si l'outil est disponible.

À la fin, donne :
- la commande ajoutée ;
- les pages auditées ;
- les scores si le test a été exécuté ;
- les limites si Lighthouse n'est pas disponible.
```

## Prompt 16 — Ajouter des photos réelles optimisées du club

```text
Tu travailles sur le projet local du site CF2V41.

Objectif prioritaire P3 : rendre le site plus vivant avec des images réelles du club.

Important :
- Ne pas utiliser de photos de mineurs sans autorisation.
- Ne pas ajouter d'images lourdes.
- Ne pas remplacer le design complet.

Ce que tu dois faire :
1. Identifier les emplacements où une photo réelle serait utile :
   - accueil ;
   - page club ;
   - gymnases ;
   - actualités ;
   - séance d'essai.
2. Si aucune photo réelle n'est disponible dans public, prépare seulement les emplacements et recommandations.
3. Si des photos existent, les optimiser :
   - dimensions adaptées ;
   - format WebP/AVIF si possible ;
   - alt text descriptif ;
   - lazy loading.
4. Garder le site rapide et lisible.

Tests attendus :
- npm run typecheck
- npm run build
- vérifier desktop/mobile ;
- vérifier poids des images.

À la fin, donne :
- les images utilisées ou les emplacements préparés ;
- les alt texts ;
- les recommandations droit à l'image ;
- les fichiers modifiés.
```

## Prompt 17 — Centraliser les réglages du club dans Supabase

```text
Tu travailles sur le projet local du site CF2V41.

Objectif prioritaire P2/P3 : faire de Supabase la source principale des informations modifiables du club.

Contexte :
- Plusieurs données sont actuellement dans des fallbacks : horaires, tarifs, contact, liens, volants.
- L'objectif est que les bénévoles puissent modifier les infos depuis l'admin.

Ce que tu dois faire :
1. Identifier toutes les données importantes écrites en dur :
   - horaires ;
   - tarifs ;
   - email ;
   - lien FFBaD ;
   - lieux ;
   - volants ;
   - textes publics.
2. Vérifier les tables existantes :
   - settings_site ;
   - creneaux ;
   - tarifs ;
   - volants ;
   - actualites.
3. Centraliser progressivement sans casser les fallbacks.
4. L'admin doit pouvoir modifier les données les plus importantes.
5. Les fallbacks doivent rester seulement pour éviter un site vide, pas comme source principale.

Tests attendus :
- npm run typecheck
- npm run build
- modifier une donnée en Supabase/admin ;
- vérifier l'affichage sans changer le code.

À la fin, donne :
- les données encore en dur ;
- les données maintenant administrables ;
- les fichiers modifiés ;
- les migrations éventuelles.
```

## Prompt 18 — Créer une checklist de publication saisonnière

```text
Tu travailles sur le projet local du site CF2V41.

Objectif prioritaire P3 : aider les bénévoles à maintenir le site chaque saison.

Ce que tu dois faire :
1. Créer un fichier de documentation simple, par exemple docs/CHECKLIST_SAISON.md.
2. La checklist doit contenir :
   - horaires ;
   - tarifs ;
   - lien FFBaD ;
   - contacts ;
   - membres du bureau ;
   - gymnases ;
   - volants et prix ;
   - actualités ;
   - mentions légales ;
   - confidentialité ;
   - photos et droit à l'image ;
   - test contact ;
   - test connexion ;
   - test inscription ;
   - test mobile.
3. Rédiger pour des bénévoles non techniciens.
4. Ne modifie pas le code du site.

Tests attendus :
- relire le document ;
- vérifier que les liens de fichiers cités existent.

À la fin, donne :
- le fichier créé ;
- les points à valider par le bureau.
```
