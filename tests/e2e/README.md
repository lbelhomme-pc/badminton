# Tests E2E CFVV

Cette suite vérifie les parcours critiques sans ajouter de dépendance lourde au projet.

## Commandes

```bash
npm run test:e2e:ci
```

La commande construit le site puis démarre une version de production locale pour tester :

- accueil > créneaux > séance d'essai ;
- page de connexion ;
- refus d'accès admin sans session ;
- routes privées principales ;
- formulaire de contact invalide.

Pour tester une version déjà lancée :

```bash
E2E_BASE_URL=http://localhost:3000 npm run test:e2e
```

## Connexion Supabase de recette

Les tests de connexion réelle sont optionnels tant que les comptes de recette ne sont pas créés.

Variables possibles :

- `E2E_SUPABASE_URL` ou `NEXT_PUBLIC_SUPABASE_URL` ;
- `E2E_SUPABASE_ANON_KEY` ou `NEXT_PUBLIC_SUPABASE_ANON_KEY` ;
- `E2E_MEMBER_EMAIL` ;
- `E2E_MEMBER_PASSWORD` ;
- `E2E_ADMIN_EMAIL` ;
- `E2E_ADMIN_PASSWORD`.

Si elles sont absentes, les tests publics passent et les tests de connexion sont marqués comme ignorés.

## Limite assumée

Cette suite est un filet de sécurité E2E HTTP. Un vrai test navigateur avec Playwright reste utile plus tard pour contrôler les menus mobiles, le focus clavier et les interactions client complexes.
