# Recette finale CFVV

Date de recette : 13 juillet 2026  
Environnement testé : build Next.js local, serveur production local `http://127.0.0.1:3102`.

## 1. Verdict

Verdict : prêt sous réserve de corrections mineures et de validations humaines.

Le site peut avancer vers une mise en ligne contrôlée, mais il ne doit pas être promu largement comme version définitive tant que les points suivants ne sont pas validés :

- configuration Supabase production : Auth, Redirect URLs, RLS, rôles et MFA administrateurs ;
- comptes de recette réels pour adhérent, encadrant, éditeur, administrateur et compte suspendu ;
- durées de conservation RGPD ;
- responsable de traitement et contact RGPD ;
- politique de sauvegarde/restauration Supabase ;
- liens HelloAsso définitifs ;
- événements, partenaires et documents réels.

Aucun problème critique de build, dépendances, routes publiques, en-têtes de sécurité ou liens internes n'a été détecté pendant cette recette.

## 2. Documentation relue

Documents relus ou utilisés :

- `docs/audit-cahier-des-charges.md`
- `docs/design-system.md`
- `docs/guide-back-office.md`
- `docs/securite-et-incidents.md`
- `docs/audit-conformite.md`
- `docs/cahier-des-charges/cahier-des-charges-cfvv.md`
- migrations dans `supabase/migrations/`
- variables d'environnement détectées dans le code

## 3. Corrections effectuées pendant la recette

| Priorité | Correction | Résultat |
| --- | --- | --- |
| P1 | Remplacement des libellés restants `CF2V41` par `CFVV` dans le code, les assets publics et la documentation | Cohérence de marque rétablie |
| P1 | Nettoyage du dossier généré `.next` puis rebuild propre | HTML pré-rendu obsolète supprimé |
| P2 | Création du `README.md` de reprise projet | Installation, déploiement, migrations, sauvegarde et limites documentés |

## 4. Parcours J1 à J5

### J1 - Découvrir

Parcours attendu : Accueil > Créneaux > Détail > Demander un essai ou s'inscrire.

Résultat : conforme côté navigation publique.

- Accueil disponible en 200.
- Bouton vers les créneaux présent.
- Page créneaux disponible en 200.
- Route de détail testée : `/planning/slot-wednesday`, disponible en 200.
- Pages essai et inscription disponibles en 200.
- Objectif trois clics respecté.

Limite : test mobile visuel complet non réalisé avec un navigateur Playwright. La structure responsive est présente et Lighthouse mobile a été exécuté.

### J2 - Réserver

Parcours attendu : Connexion > Tableau de bord > Session mercredi ou vendredi > Confirmation.

Résultat : partiellement vérifié.

- Routes connexion, espace adhérent, réservation et mes réservations disponibles.
- Routes privées en `noindex`.
- Règles métier et tests unitaires existants pour réservation, doublons, annulation et accès membre.
- Build et tests automatisés OK.

Non vérifié complètement :

- connexion avec un compte réel Supabase ;
- réservation réelle en base ;
- affichage sur tableau de bord après réservation ;
- compte suspendu réel ;
- concurrence réelle sur deux navigateurs.

Décision : à tester sur Supabase Preview avec comptes de recette.

### J3 - Commander

Parcours attendu : Espace adhérent > Boutique > Produit > HelloAsso.

Résultat : partiellement conforme.

- Page `/commande-volants` disponible et privée.
- Interface prévue pour quantité, total indicatif, retrait et redirection HelloAsso.
- Le code vérifie que l'URL HelloAsso est en HTTPS et sur `helloasso.com`.
- Le site ne collecte aucune donnée bancaire.

Non vérifié complètement :

- lien HelloAsso réel ;
- compte adhérent réel ;
- retour après action HelloAsso.

Point à valider : fournir les URLs HelloAsso officielles par produit.

### J4 - Publier

Parcours attendu : Back-office > Nouvel événement > Publication > Agenda et accueil.

Résultat : partiellement conforme.

- Agenda public disponible.
- Back-office disponible.
- Modèle d'événement prévu pour publication, annulation et remontée accueil.
- Balisage SEO Event conditionnel si des événements publiés existent.

Non vérifié complètement :

- création réelle d'événement par un éditeur ;
- publication réelle en base ;
- remontée dynamique sur accueil depuis Supabase.

Point à valider : créer un événement de recette dans Supabase Preview.

### J5 - Partenariat

Parcours attendu : Partenaires > Devenir partenaire > Formulaire ou dossier.

Résultat : conforme côté public MVP.

- `/partenaires` disponible en 200.
- `/devenir-partenaire` disponible en 200.
- Les liens internes sont valides.
- Les mentions RGPD sont présentes via les pages confidentialité/contact.

Non vérifié complètement :

- envoi réel d'une demande partenaire avec Supabase connecté ;
- dossier de partenariat réel.

## 5. Matrice de tests

| Cas | Résultat | Commentaire |
| --- | --- | --- |
| Mobile étroit | Partiel | Lighthouse mobile exécuté ; inspection visuelle manuelle non complète |
| Mobile courant | Partiel | Structure responsive présente |
| Tablette | Partiel | Non testé visuellement |
| Ordinateur | OK | Routes et HTML testés |
| Navigation clavier | Partiel | Focus et skip link présents ; parcours complet non joué manuellement |
| Zoom 200 % | Non vérifié | À faire en navigateur |
| Réduction animations | Partiel | `motion-reduce` présent dans les composants |
| Utilisateur déconnecté | OK partiel | Routes privées accessibles en HTML mais protégées côté client ; noindex OK |
| Adhérent | Non vérifié | Compte Supabase requis |
| Encadrant | Non vérifié | Compte Supabase requis |
| Éditeur | Non vérifié | Compte Supabase requis |
| Administrateur | Non vérifié | Compte Supabase requis |
| Compte suspendu | Non vérifié | Donnée Supabase requise |
| Données absentes | OK partiel | États vides présents sur agenda, partenaires, volants/documents selon modules |
| Erreurs réseau | Partiel | Formulaire invalide testé ; panne Supabase réelle non simulée |
| Email indisponible | Non applicable MVP | Aucun service email transactionnel complet configuré |
| Lien HelloAsso manquant | OK code | Message d'erreur prévu : lien à configurer |
| Document interdit | Partiel | Bibliothèque privée prévue ; test rôle réel requis |
| Session complète | Partiel | Règle de capacité testée côté logique |
| Session fermée | Partiel | Règle métier présente ; test Supabase réel requis |
| Événement annulé | Partiel | Modèle et affichage prévus ; donnée réelle requise |

## 6. Tests techniques exécutés

| Test | Résultat |
| --- | --- |
| `npm run test` | OK |
| `npm run typecheck` | OK |
| `npm run build` | OK |
| `npm audit --omit=dev` | OK, 0 vulnérabilité |
| Routes principales | OK, 17 routes testées en 200 |
| Liens internes | OK, aucun lien interne cassé détecté dans les pages testées |
| `robots.txt` | OK |
| `sitemap.xml` | OK |
| En-têtes de sécurité production | OK |
| Routes privées `noindex` | OK |
| API contact invalid JSON | OK, 400 propre |
| API contact données invalides | OK, 400 propre |
| Lighthouse mobile | OK avec réserves, voir section performance |
| Migrations | Vérification statique seulement |

Scripts absents :

- pas de script `lint` séparé ;
- pas de script `format` séparé ;
- pas de suite E2E Playwright/Cypress configurée.

## 7. Résultats Lighthouse

Serveur testé : `http://127.0.0.1:3102`.

| Page | Performance | Accessibilité | Bonnes pratiques | SEO |
| --- | ---: | ---: | ---: | ---: |
| `/` | 78 | 96 | 100 | 100 |
| `/creneaux` | n/a | 100 | n/a | 100 |
| `/tarifs` | 74 | 100 | 100 | 100 |
| `/contact` | n/a | 100 | n/a | 100 |
| `/connexion` | n/a | 100 | n/a | 100 |

Les scores `n/a` viennent de rapports Lighthouse qui n'ont pas retourné toutes les catégories pour certaines pages, malgré un audit terminé. Les scores accessibilité et SEO sont très bons. La performance de l'accueil et des tarifs est correcte mais améliorable.

## 8. Anomalies corrigées

| Priorité | Anomalie | Correction |
| --- | --- | --- |
| P1 | Ancien nom `CF2V41` encore visible dans titres et textes | Remplacement par `CFVV` |
| P1 | Build local servant des HTML pré-rendus obsolètes | Suppression de `.next`, rebuild propre |
| P2 | Documentation de reprise absente | Création de `README.md` |

## 9. Anomalies restantes

| Priorité | Anomalie ou limite | Impact | Action recommandée |
| --- | --- | --- | --- |
| P1 | Tests authentifiés complets non réalisés avec comptes réels | Impossible de déclarer le système adhérent/admin totalement prêt | Créer comptes de recette et tester J2/J3/J4 |
| P1 | RLS Supabase production non vérifiées depuis cette recette locale | Risque d'accès incorrect aux données | Audit manuel Supabase avant production |
| P1 | Sauvegarde/restauration non formalisée | Risque de perte de données | Définir procédure et responsable |
| P1 | RGPD final non validé par le bureau | Risque juridique | Valider responsable, contact et durées |
| P2 | Lighthouse performance accueil 78 et tarifs 74 | Performance perfectible | Optimiser images, cache et JS si nécessaire |
| P2 | Pas de script E2E | Recette manuelle plus lourde | Ajouter Playwright plus tard |
| P2 | Pas de script lint/format séparé | Qualité dépendante du build | Ajouter ESLint/Prettier si souhaité |
| P3 | Police Rajdhani locale à confirmer | Conformité graphique incomplète | Ajouter fichiers de police officiels |

## 10. Risques

- Un mauvais paramétrage Supabase peut casser l'authentification même si le code local est correct.
- Un lien HelloAsso absent bloque l'achat de volants.
- Une RLS trop permissive ou trop restrictive peut exposer ou bloquer des données.
- Des données réelles non validées peuvent nuire à la crédibilité du club.
- Sans sauvegarde testée, une erreur de back-office peut être difficile à rattraper.

## 11. Décisions en attente

- URL de production définitive.
- URLs Supabase Auth autorisées.
- Activation MFA pour administrateurs.
- Durées de conservation RGPD.
- Politique photos et droit à l'image.
- Liens HelloAsso officiels.
- Responsable de sauvegarde.
- Liste réelle des partenaires et événements.
- Comptes de recette par rôle.

## 12. Recommandations après mise en ligne

1. Faire une recette Supabase Preview avec comptes réels.
2. Tester inscription, connexion, mot de passe oublié et déconnexion.
3. Créer une réservation mercredi/vendredi et l'annuler.
4. Ajouter un produit volant avec lien HelloAsso réel.
5. Publier un événement réel et vérifier accueil + agenda.
6. Tester le back-office avec un éditeur non admin.
7. Vérifier Vercel Production : variables, logs, build et domaine.
8. Relancer Lighthouse sur l'URL Vercel.
9. Vérifier Google Search Console après mise en ligne.
10. Mettre à jour la fiche Google Business Profile du club.

## 13. Conclusion

La base technique est saine : build OK, tests OK, dépendances sans vulnérabilité connue, routes publiques valides, SEO très bon, accessibilité automatisée très bonne, pages privées non indexables et documentation renforcée.

La production est envisageable sous contrôle, mais la validation finale dépend des tests authentifiés Supabase et des décisions RGPD/organisationnelles du bureau.
