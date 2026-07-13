# Site CFVV

Site web du Club des Fous du Volant du Vendômois.

Le projet couvre :

- site public ;
- espace adhérent ;
- réservations de créneaux ;
- boutique de volants avec redirection HelloAsso ;
- documents privés ;
- back-office ;
- intégration Supabase ;
- déploiement Vercel.

## Stack

- Next.js 15 avec App Router
- React 19
- TypeScript
- Tailwind CSS
- Supabase Auth et PostgreSQL
- Vercel pour l'hébergement

## Installation locale

```bash
npm install
npm run dev
```

Le site local est ensuite disponible par défaut sur :

```text
http://localhost:3000
```

Pour utiliser un autre port :

```bash
npm run dev -- -p 3101
```

## Variables d'environnement

Créer un fichier `.env.local` en local.

Variables utilisées par le projet :

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=
```

Variables optionnelles pour Lighthouse :

```text
LIGHTHOUSE_BASE_URL=
LIGHTHOUSE_PAGES=
LIGHTHOUSE_OUTPUT_DIR=
LIGHTHOUSE_PACKAGE=
LIGHTHOUSE_TIMEOUT_MS=
```

Notes :

- `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` sont publiques et destinées au navigateur.
- Ne jamais ajouter de clé Supabase `service_role` dans le code client.
- Les variables Vercel doivent être renseignées séparément pour Preview et Production.

## Scripts utiles

```bash
npm run dev
npm run typecheck
npm run test
npm run build
npm run start
npm run audit:lighthouse
```

Il n'existe pas encore de script `lint` ou `format` séparé. Le build Next.js lance les contrôles intégrés disponibles.

## Base de données et migrations

Les migrations Supabase sont dans :

```text
supabase/migrations/
```

Avant mise en production :

1. Vérifier que les migrations ont été appliquées dans le bon projet Supabase.
2. Vérifier les tables publiques et privées.
3. Vérifier les politiques RLS.
4. Tester un compte adhérent, un compte gestionnaire et un compte administrateur.
5. Vérifier les RPC de réservation et de commandes.

Ne pas désactiver RLS pour corriger un bug d'interface.

## Données de démonstration

Les données de secours ou de démonstration sont principalement dans :

```text
lib/mock-data.ts
```

Elles permettent au site public de rester compréhensible même si Supabase n'est pas disponible.

Avant promotion large du site, le bureau doit valider :

- horaires ;
- lieux ;
- tarifs ;
- liens FFBaD ;
- liens HelloAsso ;
- partenaires ;
- coordonnées ;
- règles de réservation ;
- documents publiés.

## Déploiement

Déploiement cible : Vercel.

Procédure recommandée :

1. Vérifier que la branche GitHub reliée à Vercel est la bonne.
2. Pousser les changements sur GitHub.
3. Vérifier le build Preview Vercel.
4. Vérifier les variables d'environnement Preview.
5. Tester connexion, réservation, commande de volants et admin sur Preview.
6. Promouvoir en Production.
7. Vérifier les variables d'environnement Production.
8. Tester les routes publiques, privées, `robots.txt` et `sitemap.xml`.

## Sauvegarde

À définir par le bureau et l'administrateur technique :

- fréquence de sauvegarde Supabase ;
- durée de conservation ;
- personne responsable ;
- procédure de restauration ;
- test de restauration au moins annuel.

Pour les fichiers et documents privés, conserver une copie hors du dossier `public/`.

## Restauration

En cas d'incident :

1. Identifier la table, le compte ou le contenu concerné.
2. Bloquer les actions risquées si besoin.
3. Restaurer depuis une sauvegarde Supabase ou depuis l'historique Git selon le cas.
4. Vérifier les droits RLS après restauration.
5. Documenter l'incident dans le suivi du club.

## Retour arrière

Retour arrière applicatif :

1. Revenir au dernier déploiement stable dans Vercel.
2. Vérifier que les variables d'environnement n'ont pas changé.
3. Vérifier que la base de données reste compatible avec l'ancien code.

Retour arrière base de données :

- ne jamais supprimer une migration déjà appliquée en production ;
- préférer une migration corrective ;
- restaurer une sauvegarde seulement si l'incident l'exige.

## Gestion des comptes

Rôles fonctionnels :

- adhérent ;
- encadrant ;
- éditeur ou gestionnaire ;
- administrateur.

Règles :

- un compte par personne ;
- pas de compte partagé ;
- changement de rôle réservé aux administrateurs ;
- MFA recommandé pour les administrateurs ;
- désactivation plutôt que suppression immédiate d'un ancien adhérent.

## Administration courante

Guide principal :

```text
docs/guide-back-office.md
```

À faire régulièrement :

- mettre à jour les créneaux ;
- publier les événements ;
- archiver les actualités obsolètes ;
- vérifier les liens HelloAsso ;
- vérifier les demandes de contact ;
- maintenir les documents privés ;
- vérifier les comptes en attente.

## Services tiers

- Supabase : authentification, base de données, RLS.
- Vercel : hébergement, builds, cron de synchronisation.
- HelloAsso : paiement des volants ou inscriptions.
- GitHub : dépôt et historique de code.

Le site CFVV ne doit pas collecter de données bancaires.

## Documentation projet

Documents utiles :

- `docs/cahier-des-charges/cahier-des-charges-cfvv.md`
- `docs/audit-cahier-des-charges.md`
- `docs/design-system.md`
- `docs/guide-back-office.md`
- `docs/securite-et-incidents.md`
- `docs/audit-conformite.md`
- `docs/recette-finale.md`

## Limitations connues

- Les validations RGPD définitives doivent être faites par le bureau.
- Les durées de conservation doivent être confirmées.
- Les sauvegardes Supabase doivent être formalisées.
- Les tests authentifiés complets nécessitent des comptes réels de recette.
- Lighthouse doit être relancé après déploiement Vercel.
- Les fichiers de police Rajdhani locaux restent à fournir si l'exigence doit être strictement respectée.
