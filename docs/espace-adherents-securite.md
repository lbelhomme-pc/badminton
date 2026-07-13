# Espace adhérents CFVV - activation, rôles et sécurité

## Objectif

L'espace adhérents repose sur Supabase Auth pour l'identité technique, Supabase PostgreSQL pour les profils et les données métier, et les politiques RLS pour empêcher les accès non autorisés côté base.

Le site ne doit pas créer un second système de mot de passe. Le numéro de licence est l'identifiant métier visible pour le membre, mais il ne remplace pas l'identifiant technique Supabase.

## Flux d'activation cible

1. Un administrateur crée ou importe un adhérent avec son email, son numéro de licence et son statut de saison.
2. Le site génère une invitation personnelle.
3. Le lien ou code contient un secret à usage unique.
4. Seule l'empreinte du secret est stockée dans `member_invitations.token_hash`.
5. L'invitation possède une date d'expiration.
6. À l'ouverture du lien, le site vérifie que l'invitation est `pending`, non expirée, non révoquée et non utilisée.
7. L'utilisateur choisit lui-même son mot de passe.
8. Après activation, le profil passe en statut `actif`, l'invitation passe en `used`, et `used_at` / `used_by` sont renseignés.
9. Une invitation utilisée, expirée ou révoquée ne doit jamais être réutilisable.

Le fichier SQL préparé est :

- `supabase/migrations/20260713000100_member_activation_invites.sql`

## Statuts de saison

Statuts fonctionnels du cahier des charges :

| Statut métier | Valeur cible | Compatibilité actuelle |
| --- | --- | --- |
| Actif | `actif` | accès autorisé |
| En attente | `en_attente` | accès bloqué jusqu'à validation |
| Suspendu | `suspendu` | compatible avec l'ancien `inactif` |
| Non renouvelé | `non_renouvele` | compatible avec l'ancien `ancien` |

La désactivation bloque l'accès, mais ne supprime pas les réservations, commandes ou historiques.

## Rôles fonctionnels

| Rôle cahier des charges | Rôle applicatif actuel | Droits attendus |
| --- | --- | --- |
| Adhérent | `member` / `adherent` | espace adhérent, réservations personnelles, volants, documents autorisés |
| Encadrant | `manager` / `entraineur` | accès membre + suivi limité des créneaux confiés |
| Éditeur | `manager` / `bureau` | gestion contenus, agenda, créneaux, partenaires selon périmètre |
| Administrateur | `admin` / `super_admin` | gestion utilisateurs, rôles, paramètres et actions sensibles |

Le masquage d'un bouton n'est pas une protection suffisante. Les contrôles doivent rester cohérents entre :

- interface ;
- fonctions client ;
- routes protégées ;
- RPC Supabase ;
- politiques RLS.

## Protections ajoutées côté interface

- L'espace adhérent vérifie maintenant le profil et le statut de saison.
- Un compte `en_attente`, `suspendu`, `inactif`, `ancien` ou `non_renouvele` n'accède plus au tableau de bord.
- L'administration refuse aussi les profils responsables non actifs.
- La création libre de compte est désactivée par défaut.
- La création libre ne peut être réactivée que temporairement avec `NEXT_PUBLIC_ENABLE_PUBLIC_SIGNUP=true`.
- Le tableau de bord affiche la licence, le statut saison et les rôles fonctionnels.

## Variables d'environnement requises

Ne jamais afficher ni commiter les valeurs.

| Variable | Public | Usage |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Oui | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` ou `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Oui | clé publique navigateur avec RLS obligatoire |
| `NEXT_PUBLIC_SITE_URL` | Oui | URL canonique, redirections et liens |
| `NEXT_PUBLIC_ENABLE_PUBLIC_SIGNUP` | Oui | transition uniquement, doit rester absent ou `false` en production cible |
| `SUPABASE_SERVICE_ROLE_KEY` | Non | uniquement côté serveur pour futures invitations/admin, jamais côté client |
| `INVITATION_TOKEN_PEPPER` | Non | secret serveur optionnel pour renforcer l'empreinte des invitations |

## MFA administrateurs

À préparer dans Supabase Auth si disponible pour le projet :

- obligatoire pour les administrateurs ;
- recommandé pour les éditeurs ;
- journalisation des changements de rôle ;
- révocation immédiate des sessions en cas de départ du bureau.

## Points restant à développer

- Écran admin d'envoi d'invitations.
- Route sécurisée `/activation` pour consommer une invitation.
- Fonction serveur qui vérifie le token sans l'exposer.
- Passage automatique du profil en `actif` après activation.
- Journalisation complète dans `audit_logs`.
- Emails transactionnels d'invitation et de relance.
