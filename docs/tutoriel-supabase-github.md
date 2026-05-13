# Tutoriel Supabase + publication GitHub

Ce tutoriel explique comment travailler proprement avec Supabase pour le site du CFVV41, puis publier le projet sur le dépôt GitHub :

https://github.com/lbelhomme-pc/badminton

## 1. Comprendre le rôle de Supabase

Supabase sert ici à gérer :

- les comptes utilisateurs avec Supabase Auth ;
- les profils adhérents ;
- les rôles : `adherent`, `entraineur`, `bureau`, `admin` ;
- les créneaux ;
- les réservations ;
- les actualités ;
- les volants et commandes de volants.

Le site ne stocke jamais les mots de passe. Ils sont gérés par Supabase Auth.

## 2. Créer le projet Supabase

1. Va sur https://supabase.com.
2. Crée un nouveau projet.
3. Choisis une région proche, par exemple Europe.
4. Note le mot de passe de base de données dans un gestionnaire sécurisé.
5. Ouvre `Project settings > API`.
6. Copie :
   - `Project URL`
   - `anon public key`

Ne copie jamais la clé `service_role` dans le code Next.js.

## 3. Configurer les variables locales

À la racine du projet, crée un fichier `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=https://ton-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ta-cle-anon
```

Le fichier `.env.local` est ignoré par Git grâce au `.gitignore`. Il ne doit pas être envoyé sur GitHub.

## 4. Créer la base de données

Dans Supabase, ouvre `SQL Editor`.

Exécute d'abord :

```txt
supabase/schema.sql
```

Puis :

```txt
supabase/rls.sql
```

Le premier fichier crée les tables et données de départ. Le second active la sécurité Row Level Security.

## 5. Activer l'authentification

Dans Supabase :

1. Va dans `Authentication > Providers`.
2. Vérifie que `Email` est activé.
3. Pour tester vite en local, tu peux désactiver temporairement la confirmation email.
4. Pour un vrai site public, garde la confirmation email activée.

## 6. Créer le premier administrateur

1. Lance le site :

```bash
npm run dev
```

2. Va sur :

```txt
http://127.0.0.1:3000/creation-compte
```

3. Crée ton compte.
4. Dans Supabase SQL Editor, passe ce compte admin :

```sql
update public.profiles
set role = 'admin'
where email = 'ton-email@example.com';
```

5. Déconnecte-toi puis reconnecte-toi.
6. Va sur :

```txt
http://127.0.0.1:3000/admin
```

## 7. Travailler au quotidien avec Supabase

Avant de modifier une règle de sécurité, pose-toi toujours ces questions :

- Qui peut lire cette donnée ?
- Qui peut créer cette donnée ?
- Qui peut la modifier ?
- Qui peut la supprimer ?
- Est-ce qu'un adhérent pourrait voir les données personnelles d'un autre ?
- Est-ce qu'un adhérent pourrait se donner le rôle admin ?

Bon réflexe :

```bash
npm run typecheck
npm run build
```

À lancer avant chaque mise en ligne.

## 8. Modifier la structure de la base

Pour ajouter une table ou une colonne :

1. Modifie `supabase/schema.sql`.
2. Ajoute les contraintes nécessaires.
3. Ajoute les index utiles.
4. Modifie `supabase/rls.sql`.
5. Teste avec un compte adhérent et un compte admin.

Ne désactive jamais RLS pour corriger vite un problème.

## 9. Préparer le projet pour GitHub

Vérifie que les fichiers sensibles ou lourds ne seront pas envoyés :

- `node_modules/`
- `.next/`
- `.env.local`
- les fichiers `.log`
- `tsconfig.tsbuildinfo`

Ils sont déjà couverts par le fichier `.gitignore`.

## 10. Initialiser Git

Dans le dossier du projet :

```bash
git init
git branch -M main
git status
```

Ajoute les fichiers :

```bash
git add .
git commit -m "Initial site CFVV41 avec Supabase"
```

## 11. Lier au dépôt GitHub

Ajoute le dépôt distant :

```bash
git remote add origin https://github.com/lbelhomme-pc/badminton.git
```

Vérifie :

```bash
git remote -v
```

## 12. Envoyer le site sur GitHub

Si le dépôt GitHub est vide :

```bash
git push -u origin main
```

Si GitHub répond que le dépôt contient déjà des fichiers, fais d'abord :

```bash
git pull origin main --allow-unrelated-histories
```

Résous les conflits si Git en signale, puis :

```bash
git add .
git commit -m "Fusion avec le dépôt GitHub"
git push -u origin main
```

## 13. Travailler après la première publication

Routine simple :

```bash
git status
git add .
git commit -m "Décris clairement la modification"
git push
```

Exemples de messages :

```bash
git commit -m "Ajoute les pages adhérent"
git commit -m "Corrige les policies RLS des réservations"
git commit -m "Améliore le menu mobile"
```

## 14. Déployer ensuite le site

Pour mettre le site en ligne, le plus simple est Vercel :

1. Connecte Vercel à GitHub.
2. Importe le dépôt `badminton`.
3. Ajoute dans Vercel les variables :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Lance le déploiement.

Ne mets jamais la clé `service_role` dans Vercel côté frontend.

## 15. Checklist avant push

Avant d'envoyer sur GitHub :

```bash
npm run typecheck
npm run build
git status
```

Vérifie aussi :

- pas de `.env.local` dans `git status` ;
- pas de clé Supabase secrète dans le code ;
- pas de données personnelles réelles dans les fichiers ;
- les fichiers SQL sont présents ;
- la documentation est à jour.
