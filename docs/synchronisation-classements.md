# Synchronisation automatique des classements

Le site peut synchroniser automatiquement les classements depuis une source CSV vers Supabase.

Important : ne pas scraper directement MyFFBaD sans API ou export officiel. La méthode propre consiste à utiliser un export CSV officiel, un fichier CSV contrôlé par le club, ou un Google Sheet publié en CSV.

## 1. Ce que fait le système

Chaque jour, Vercel appelle :

```txt
/api/sync-rankings
```

La route :

1. vérifie le secret `CRON_SECRET` ;
2. télécharge le CSV défini par `RANKINGS_CSV_URL` ;
3. convertit les lignes en classements publics ;
4. met à jour la table Supabase `rankings` ;
5. désactive les anciens joueurs absents du dernier CSV.

La clé `SUPABASE_SERVICE_ROLE_KEY` est utilisée uniquement côté serveur dans cette route API. Elle ne doit jamais être utilisée dans le navigateur.

## 2. Variables Vercel à ajouter

Dans Vercel, ajoute :

```env
SUPABASE_SERVICE_ROLE_KEY=
CRON_SECRET=
RANKINGS_CSV_URL=
```

Tu as déjà :

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

`CRON_SECRET` doit être une chaîne aléatoire longue, par exemple générée avec un gestionnaire de mots de passe.

## 3. Où trouver la clé service role

Dans Supabase :

```txt
Project Settings → API
```

Copie la clé `service_role` ou `secret key` selon l'interface.

Attention : cette clé donne des droits élevés. Elle doit rester uniquement dans Vercel en variable serveur, jamais dans le code client, jamais dans GitHub.

## 4. Créer la table rankings

Si ta base a déjà été créée avant cette fonctionnalité, exécute dans Supabase SQL Editor :

```txt
supabase/rankings.sql
```

Si tu repars d'une base neuve, `supabase/schema.sql` puis `supabase/rls.sql` contiennent déjà la table et les règles.

## 5. Format CSV accepté

Le système reconnaît plusieurs noms de colonnes. Format recommandé :

```csv
licence;prenom;nom;categorie;simple;double;mixte;points_simple;points_double;points_mixte;progression;equipe
12345678;Ludovic;Belhomme;Senior;P10;P10;NC;12,5;10;0;+2;Loisirs
```

Colonnes utiles :

- `licence` : identifiant stable, jamais affiché publiquement ;
- `prenom`
- `nom`
- `categorie`
- `simple`
- `double`
- `mixte`
- `points_simple`
- `points_double`
- `points_mixte`
- `progression`
- `equipe`

L'affichage public transforme automatiquement le nom en :

```txt
Prénom + initiale
```

Exemple :

```txt
Ludovic B.
```

## 6. Source CSV possible avec Google Sheets

Tu peux créer un Google Sheet avec ces colonnes, puis publier l'onglet en CSV.

Dans Google Sheets :

```txt
Fichier → Partager → Publier sur le Web → CSV
```

Copie l'URL CSV obtenue dans Vercel :

```env
RANKINGS_CSV_URL=https://docs.google.com/spreadsheets/d/.../pub?output=csv
```

## 7. Tester manuellement la synchronisation

En local, sans `CRON_SECRET`, la route peut être appelée en développement :

```txt
http://127.0.0.1:3000/api/sync-rankings
```

En production, Vercel envoie automatiquement :

```txt
Authorization: Bearer CRON_SECRET
```

Tu peux voir le résultat dans :

```txt
Supabase → Table Editor → rankings
```

## 8. Fréquence

Le fichier `vercel.json` lance la synchronisation tous les jours à 06:00 UTC :

```json
{
  "crons": [
    {
      "path": "/api/sync-rankings",
      "schedule": "0 6 * * *"
    }
  ]
}
```

Sur Vercel Hobby, les cron jobs sont limités à une exécution quotidienne, ce qui suffit pour des classements club.
