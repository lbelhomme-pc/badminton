# Configuration Supabase du CFVV41

## 1. Créer le projet Supabase

Crée un projet Supabase, puis récupère dans `Project settings > API` :

- `Project URL`
- `anon public key`

Ne copie jamais la clé `service_role` dans le site Next.js.

## 2. Variables d'environnement

Crée un fichier `.env.local` à la racine du projet avec :

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Le fichier `.env.example` contient le modèle à partager sans secrets.

## 3. SQL à exécuter

Dans l'éditeur SQL Supabase, exécute dans cet ordre :

1. `supabase/schema.sql`
2. `supabase/rls.sql`

Le premier fichier crée les tables, contraintes, index, triggers `updated_at`, le profil automatique à l'inscription et quelques données de démonstration. Le second active les règles Row Level Security.

Si la base existe déjà et que tu veux seulement ajouter l'automatisation du stock des volants, exécute aussi :

```sql
-- contenu du fichier supabase/volants-stock.sql
```

Cette migration retire automatiquement un tube du stock quand un adhérent commande, et remet le stock si la commande passe au statut `annulee`.

## 4. Authentification

Dans `Authentication > Providers`, active l'inscription email/mot de passe.

Selon le choix du club, tu peux :

- laisser la confirmation email activée pour plus de sécurité ;
- la désactiver temporairement en local pour tester vite.

## 5. Créer le premier compte admin

1. Va sur `/creation-compte`.
2. Crée ton compte avec l'email du responsable.
3. Dans Supabase, exécute :

```sql
update public.profiles
set role = 'admin'
where email = 'responsable@example.com';
```

Remplace l'email par celui du compte créé. Ensuite, reconnecte-toi et ouvre `/admin`.

## 6. Rôles prévus

- `adherent` : accès à l'espace privé, réservations personnelles, commandes de volants.
- `entraineur` : rôle prévu pour une future interface encadrant.
- `bureau` : accès admin fonctionnel pour les responsables.
- `admin` : accès admin complet.

Un utilisateur ne peut pas se donner lui-même le rôle `admin` : les policies et le trigger de protection du rôle bloquent l'escalade.

## 7. Pages principales

Pages publiques :

- `/`
- `/creneaux`
- `/tarifs`
- `/inscription`
- `/contact`

Pages auth :

- `/connexion`
- `/creation-compte`
- `/mot-de-passe-oublie`

Pages privées :

- `/espace-adherent`
- `/mes-reservations`
- `/reservation-creneau`
- `/commande-volants`

Pages admin :

- `/admin`
- `/admin/creneaux`
- `/admin/reservations`
- `/admin/actualites`
- `/admin/adherents`
- `/admin/volants`

## 8. Limites volontaires du MVP

Le paiement n'est pas intégré. Les cotisations et paiements peuvent rester sur FFBaD, HelloAsso ou sur place.

L'admin est volontairement simple : elle permet de démarrer sans créer une plateforme trop lourde pour une association locale.
