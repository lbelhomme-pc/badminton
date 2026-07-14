# Blocages services externes

## HelloAsso

- Ce qui est deja integre : validation d'URL HelloAsso dans `lib/helloasso.ts`, redirection depuis `components/member/commande-volants.tsx`, champs `helloasso_url` et `helloasso_item_id` dans la migration volants/documents.
- Ce qui manque : liens officiels de boutique ou produits, test de redirection, eventuel retour utilisateur apres paiement.
- Configuration necessaire : URLs HTTPS HelloAsso par produit ou boutique.
- Test reel a effectuer : ouvrir une commande adherent, choisir une quantite, verifier que HelloAsso s'ouvre avec le bon produit.
- Caractere bloquant : bloquant P1 pour la boutique volants.

## Domaine

- Ce qui est deja integre : `lib/seo.ts` gere `NEXT_PUBLIC_SITE_URL`, Vercel URL par defaut.
- Ce qui manque : domaine final du club.
- Configuration necessaire : domaine dans Vercel, DNS chez le registrar, `NEXT_PUBLIC_SITE_URL`.
- Test reel a effectuer : ouvrir le domaine final en HTTPS, verifier canonical, sitemap et reset password.
- Caractere bloquant : bloquant P1 avant promotion publique large.

## DNS

- Ce qui est deja integre : aucune configuration DNS dans le depot.
- Ce qui manque : enregistrements domaine, SPF/DKIM/DMARC si email personnalise.
- Configuration necessaire : CNAME/A selon Vercel, TXT email.
- Test reel a effectuer : verification Vercel + outils DNS email.
- Caractere bloquant : P1 pour domaine/email, non bloquant pour preview Vercel.

## Hebergeur Vercel

- Ce qui est deja integre : `vercel.json` avec cron `/api/sync-rankings`, build Next compatible.
- Ce qui manque : verification variables Production/Preview, logs, branche de prod, domaine.
- Configuration necessaire : variables Supabase, `CRON_SECRET`, `RANKINGS_CSV_URL`, `NEXT_PUBLIC_SITE_URL`.
- Test reel a effectuer : deploiement Preview puis Production, ouvrir routes publiques/privees.
- Caractere bloquant : P0/P1 selon variable.

## Courriels

- Ce qui est deja integre : Supabase Auth peut envoyer reset password ; le code contient le flux reset.
- Ce qui manque : service transactionnel pour invitations, confirmations, fermetures, notifications.
- Configuration necessaire : SMTP Supabase ou service dedie, adresse expediteur, SPF/DKIM/DMARC.
- Test reel a effectuer : reception reset password, invitation, notification fermeture.
- Caractere bloquant : P1 pour activation adherent propre.

## Base de donnees Supabase

- Ce qui est deja integre : migrations schema, RLS, RPC reservations, volants, documents.
- Ce qui manque : verification que toutes les migrations sont appliquees dans le projet Supabase cible.
- Configuration necessaire : tables, policies, fonctions, triggers, storage buckets.
- Test reel a effectuer : compte adherent/admin, lecture/ecriture par role, reservation, document, commande.
- Caractere bloquant : P0.

## Authentification Supabase

- Ce qui est deja integre : provider client, login, signup invitation-only par defaut, reset password.
- Ce qui manque : Redirect URLs, SMTP, comptes de recette, MFA admin.
- Configuration necessaire : Site URL, Redirect URLs local/preview/prod, options Auth, MFA si disponible.
- Test reel a effectuer : connexion, deconnexion, refresh, reset password, compte suspendu, admin.
- Caractere bloquant : P0/P1.

## Stockage Supabase

- Ce qui est deja integre : bucket `cfvv-private-documents` cree par migration, policies storage, signed URLs.
- Ce qui manque : test upload/download reel et droits par role.
- Configuration necessaire : bucket prive, types MIME, taille max, policies.
- Test reel a effectuer : admin upload PDF, adherent telecharge, visiteur bloque.
- Caractere bloquant : P1 pour documents prives.

## Analytics

- Ce qui est deja integre : aucun analytics non essentiel detecte.
- Ce qui manque : choix club si besoin.
- Configuration necessaire : outil respecte RGPD ou exempt, consentement si necessaire.
- Test reel a effectuer : verifier absence de chargement avant consentement.
- Caractere bloquant : non bloquant MVP.

## Supervision

- Ce qui est deja integre : logs Vercel/Supabase disponibles via services, pas d'integration applicative dediee.
- Ce qui manque : alerte erreurs, suivi incidents.
- Configuration necessaire : notifications Vercel/Supabase ou outil externe.
- Test reel a effectuer : simuler erreur API et verifier trace.
- Caractere bloquant : non bloquant MVP, important apres lancement.
