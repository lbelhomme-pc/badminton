# Sécurité et incidents CFVV

Ce document sert de base opérationnelle pour le bureau du CFVV. Il ne remplace pas un audit juridique ou cybersécurité externe, mais il fixe les règles minimales pour exploiter le site sans fragiliser les comptes, les données des adhérents et les contenus privés.

## 1. Principes de sécurité

- Chaque responsable utilise un compte individuel. Les comptes partagés sont à proscrire.
- Les rôles doivent être attribués au plus juste : adhérent, encadrant, éditeur, administrateur.
- Un bouton masqué dans l'interface ne suffit jamais : les permissions doivent être vérifiées côté base de données, serveur ou API.
- Les mots de passe ne doivent jamais être demandés ou transmis par mail, SMS ou messagerie.
- Les données bancaires ne doivent jamais transiter par le site CFVV : les paiements restent gérés par HelloAsso ou un service équivalent validé.
- Les documents privés ne doivent pas être placés dans un dossier public indexable.

## 2. Comptes et rôles

### Comptes individuels

Chaque membre du bureau ou bénévole disposant d'un accès d'administration doit avoir son propre compte. Cela permet :

- de retirer un accès sans bloquer les autres ;
- de tracer les actions sensibles ;
- d'éviter le partage de mot de passe ;
- de responsabiliser les modifications.

### Règles par rôle

| Rôle | Accès recommandé | Restrictions |
| --- | --- | --- |
| Adhérent | Tableau de bord, réservations, boutique, documents autorisés | Ne modifie que ses propres données autorisées |
| Encadrant | Créneaux ou listes utiles à l'encadrement | Pas de gestion des administrateurs |
| Éditeur | Actualités, événements, pages publiques, partenaires | Pas de rôles, pas de données sensibles |
| Administrateur | Gestion complète du back-office | Actions sensibles confirmées et journalisées |

Le changement de rôle doit rester réservé aux administrateurs et protégé par les règles Supabase/RLS.

## 3. Authentification

Supabase Auth doit rester le fournisseur d'identité. Les bonnes pratiques à appliquer sont :

- URL du site de production correctement configurée dans Supabase Auth.
- URL de redirection locales et Vercel Preview ajoutées uniquement si elles sont nécessaires.
- Réinitialisation de mot de passe via le flux officiel Supabase.
- Sessions expirées traitées proprement avec un retour vers la connexion.
- MFA préparée, puis activée pour les administrateurs si la configuration Supabase du projet le permet.

À valider dans Supabase :

- durée de session ;
- stratégie MFA pour les administrateurs ;
- limitation des tentatives selon les options disponibles du fournisseur ;
- modèle d'invitation des nouveaux adhérents.

## 4. Variables et secrets

Règles à respecter :

- Les clés publiques `NEXT_PUBLIC_*` peuvent être exposées au navigateur si elles sont prévues pour cela.
- Aucune clé `service_role` Supabase ne doit être utilisée côté client.
- Les secrets doivent rester dans Vercel Environment Variables ou dans un coffre adapté.
- Les valeurs complètes des secrets ne doivent jamais être copiées dans la documentation, les tickets, les captures d'écran ou les logs.

Vérification réalisée côté dépôt : aucune occurrence évidente de clé `service_role`, `sb_secret`, clé privée ou secret OpenAI/Stripe n'a été trouvée dans les fichiers inspectés hors dépendances.

## 5. Formulaires et spam

Le formulaire de contact comporte :

- validation côté client ;
- validation côté serveur ;
- consentement explicite lié à la politique de confidentialité ;
- champ anti-spam invisible ;
- limitation simple par adresse IP côté route API ;
- contrôle d'origine pour réduire les envois depuis un site tiers.

Ces protections sont adaptées à un MVP associatif. Pour un volume important de spam, ajouter un service anti-abus respectueux de l'accessibilité.

## 6. En-têtes de sécurité

Le site applique des en-têtes de base via `next.config.mjs` :

- `Content-Security-Policy` ;
- `Referrer-Policy` ;
- `Permissions-Policy` ;
- `X-Content-Type-Options` ;
- `X-Frame-Options` ;
- `Strict-Transport-Security` en production ;
- `Cross-Origin-Opener-Policy` ;
- `X-DNS-Prefetch-Control` ;
- `X-Permitted-Cross-Domain-Policies`.

Limite connue : la CSP conserve `unsafe-inline` pour rester compatible avec Next.js et les styles actuels. Une CSP avec nonce serait plus stricte, mais demande un chantier plus technique.

## 7. Cache, PWA et pages privées

Le service worker ne doit pas servir de version en cache pour :

- l'administration ;
- l'espace adhérent ;
- les documents privés ;
- les commandes de volants ;
- les réservations ;
- les API ;
- les requêtes JSON ou authentifiées.

Le fichier `public/sw.js` a été durci pour ignorer ces routes et éviter un affichage obsolète ou privé en cas de réseau instable.

## 8. Documents et médias

Pour les documents privés :

- stockage non public ;
- vérification du rôle côté serveur ;
- URL signées ou téléchargement contrôlé ;
- types de fichiers autorisés ;
- taille maximale ;
- nom de fichier nettoyé ;
- pas d'indexation par les moteurs.

Pour les images :

- texte alternatif obligatoire si l'image informe ;
- pas de photo de mineur sans validation du droit à l'image ;
- compression avant publication.

## 9. Incidents

### Exemples d'incidents à traiter

- compte administrateur compromis ;
- mauvais rôle attribué ;
- document privé rendu public ;
- suppression accidentelle ;
- spam massif ;
- erreur de stock ou commande incohérente ;
- fuite de clé API ;
- contenu diffamatoire ou donnée personnelle publiée par erreur.

### Procédure courte

1. Bloquer l'accès concerné ou dépublier le contenu.
2. Préserver les éléments utiles : date, compte, page, capture si nécessaire.
3. Corriger la cause technique ou organisationnelle.
4. Informer les personnes concernées si des données personnelles sont touchées.
5. Décider si une notification CNIL est nécessaire.
6. Documenter l'incident et la correction.

## 10. Sauvegarde et restauration

À valider par le bureau et l'administrateur technique :

- fréquence de sauvegarde Supabase ;
- durée de conservation ;
- responsable de restauration ;
- test de restauration annuel ;
- procédure en cas de suppression accidentelle.

## 11. Points nécessitant validation humaine

- Identité exacte du responsable de traitement.
- Contact RGPD officiel.
- Durées de conservation par catégorie.
- Activation MFA pour les administrateurs.
- Politique de droit à l'image, notamment mineurs.
- Conditions exactes d'archivage ou anonymisation des anciens adhérents.
