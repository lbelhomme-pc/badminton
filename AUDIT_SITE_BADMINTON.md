# Audit du site CF2V41 - Club de badminton

Date de l'audit : 14 juin 2026  
Projet local audite : `C:\Users\ludov\Documents\Site_Club_Badminton`  
Version en ligne auditee : `https://badminton-orcin.vercel.app`

## 1. Résumé exécutif

Note globale : **73 / 100**

Le site donne une image moderne, claire et deja assez structurée du club. Les informations principales pour un visiteur sont visibles : nom du club, ville, créneaux, tarifs, contact, volants, connexion et inscription. La base technique est sérieuse : Next.js, TypeScript, Supabase, pages bien organisées, build de production valide.

Les trois principaux points forts sont :

- interface visuellement propre, moderne et lisible ;
- navigation publique simple avec accès rapide aux créneaux, tarifs, contact et inscription ;
- architecture technique déjà pensée pour évoluer vers espace adhérent et administration.

Les trois principaux points faibles sont :

- le formulaire de contact/séance d'essai affiche un succès mais ne transmet pas réellement la demande ;
- les mentions légales, la politique de confidentialité, le sitemap et le robots.txt sont incomplets ou absents ;
- l'auth Supabase montre un avertissement en ligne sur plusieurs instances GoTrue, cohérent avec les problèmes intermittents signalés côté connexion/admin.

Les trois urgences absolues sont :

- rendre le contact et la demande d'essai réellement fonctionnels ;
- stabiliser l'authentification Supabase avec un seul client navigateur partagé ;
- compléter les pages légales et ajouter `robots.txt` / `sitemap.xml` avant promotion large du site.

## 2. Fiche technique du projet

Technologies identifiées :

| Élément | Observation |
|---|---|
| Framework | Next.js 15.5.14 avec App Router |
| Langage | TypeScript 5.9.3 |
| UI | React 19.2.4, Tailwind CSS 3.4.19, lucide-react |
| Données | Supabase JS 2.49.4, tables SQL et migrations présentes |
| Authentification | Supabase Auth |
| Hébergement probable | Vercel, confirmé par les en-têtes en ligne |
| PWA | Manifest et service worker présents |
| Compilation | `npm run build` réussi après arrêt du serveur dev |
| Vérification TypeScript | `npm run typecheck` réussi après build propre |
| Déploiement | `vercel.json` avec cron `/api/sync-rankings` |
| Données éditoriales | Mélange de données Supabase et de données mock/fallback dans `lib/mock-data.ts` et `services/club.service.ts` |

Organisation des dossiers :

| Dossier | Rôle |
|---|---|
| `app` | Pages publiques, pages connectées, routes API |
| `components` | Composants UI, layout, admin, formulaires |
| `services` | Accès données et logique métier |
| `lib` | Client Supabase, données mock, utilitaires |
| `hooks` | Hooks React |
| `supabase` | Migrations SQL, schémas, RLS |
| `public` | Logo, icônes PWA, service worker |
| `docs` | Documentation projet |
| `types` | Types TypeScript |

Le projet est globalement bien structuré et maintenable pour un développeur. Pour des bénévoles non développeurs, il devient maintenable seulement si l'espace admin est fiable et si les contenus importants sont éditables sans modifier le code. Aujourd'hui, une partie des informations reste dans des fichiers de fallback, ce qui rend la maintenance fragile si Supabase n'est pas alimenté correctement.

## 3. Tableau des notes

| Catégorie | Note | Justification courte |
|---|---:|---|
| Fonctionnement et fiabilité | 10 / 15 | Pages publiques testées en 200, build OK, mais formulaire non réel et auth instable en ligne |
| Contenu et informations utiles | 11 / 15 | Créneaux, tarifs, gymnase et contact présents, mais événements, partenaires, interclubs et juridique incomplets |
| Expérience utilisateur et navigation | 12 / 15 | Navigation claire, CTA visibles, mais parcours inscription/contact perfectible |
| Design et identité visuelle | 8 / 10 | Site propre, moderne, cohérent, mais peu de photos réelles du club |
| Version mobile et responsive | 8 / 10 | Aucun débordement détecté aux largeurs testées, mais admin/connecté non audités complètement sur mobile |
| Accessibilité | 7 / 10 | Textes lisibles et images avec alt, mais double H1 sur connexion, pas de lien d'évitement observé |
| SEO et référencement local | 6 / 10 | Title/meta solides et ville présente, mais sitemap/robots absents, données structurées manquantes |
| Performances | 4 / 5 | Build raisonnable et pages légères, Lighthouse non exécuté |
| Qualité et maintenabilité du code | 4 / 5 | Architecture propre, TypeScript OK, mais données dispersées et auth à rationaliser |
| Sécurité, RGPD et juridique | 3 / 5 | HTTPS/HSTS et RLS prévus, mais mentions légales/confidentialité insuffisantes et headers incomplets |

## 4. Analyse de la version locale

La version locale a été testée via serveur Next.js local sur le port 3010. Les pages publiques suivantes ont répondu correctement : accueil, créneaux, tarifs, contact, commande-volants, connexion et admin.

Constats principaux :

- la page d'accueil locale correspond globalement à la version en ligne ;
- la page `/commande-volants` affiche localement `Connexion à configurer` lorsque Supabase n'est pas configuré ;
- la page `/admin` affiche localement `Administration à configurer` dans le même cas ;
- le build de production réussit ;
- le typecheck réussit après build propre ;
- un premier typecheck a échoué de manière transitoire pendant que `.next` était en cours de régénération, ce qui ne semble pas être une erreur de code finale.

Le local est adapté au développement, mais l'expérience connectée dépend fortement des variables Supabase. Sans `.env.local` complet, les pages connectées ne peuvent pas être testées fidèlement.

## 5. Analyse de la version en ligne

La version en ligne est servie en HTTPS sur Vercel. Les pages publiques testées répondent en 200. Le rendu est propre sur ordinateur et mobile.

Constats positifs :

- l'accueil présente clairement le club ;
- les pages créneaux, tarifs et contact sont accessibles depuis le menu ;
- le menu contient un onglet `Volants`, utile pour les adhérents ;
- les pages protégées bloquent correctement l'accès non connecté ;
- le site utilise un manifest PWA valide.

Constats problématiques :

- `robots.txt` retourne 404 ;
- `sitemap.xml` retourne 404 ;
- la console affiche l'avertissement Supabase : plusieurs instances `GoTrueClient` dans le même contexte navigateur ;
- aucune balise canonical n'a été détectée sur la page d'accueil ;
- les mentions légales et la politique de confidentialité ne sont pas suffisamment complètes pour un site associatif en production.

## 6. Comparaison local / en ligne

| Élément | Version locale | Version en ligne | Conséquence | Niveau de priorité |
|---|---|---|---|---|
| Accueil | Contenu et design cohérents | Contenu et design cohérents | Pas de divergence majeure | P4 |
| Pages publiques | Rendues correctement | Rendues correctement | Base publique fiable | P4 |
| `/commande-volants` non connecté | `Connexion à configurer` si Supabase absent | `Connexion nécessaire` | Local moins fidèle sans env Supabase | P2 |
| `/admin` non connecté | `Administration à configurer` si Supabase absent | `Connexion nécessaire` | Test admin local incomplet sans env | P2 |
| Console Supabase | Pas d'erreur relevée sur local testé | Avertissement `Multiple GoTrueClient instances` | Risque d'état de session instable | P1 |
| SEO technique | Non vérifié comme site public | `robots.txt` et `sitemap.xml` en 404 | Indexation locale affaiblie | P1 |
| En-têtes | Serveur dev Next.js | Vercel + HSTS, pas de CSP détectée | Sécurité perfectible en production | P2 |
| Performance | Dev local, non représentatif | Production Vercel | Comparaison de vitesse brute peu pertinente | P3 |

## 7. Points forts détaillés

- Le site affiche immédiatement le nom complet du club : `Club des fous du Volant Vendômois`.
- La ville `Vendôme` est présente dans les contenus et métadonnées.
- La navigation publique est simple : Accueil, Créneaux, Tarifs, Volants, Le club, Contact.
- Les CTA principaux sont visibles : rejoindre le club, voir les créneaux, inscription, connexion.
- Les pages sont visuellement cohérentes : couleurs, typographie, cartes et boutons suivent une logique commune.
- La structure technique est moderne et permet une vraie évolution : Supabase, RLS, API routes, espace admin.
- Le responsive de l'accueil tient correctement à 320 px, 375 px, 768 px et 1440 px sans débordement horizontal observé.
- Le build de production est valide.

## 8. Points faibles détaillés

- Le formulaire de contact est trompeur : dans `components/public/request-form.tsx`, il affiche un état envoyé mais ne transmet pas la demande.
- La page `mentions-legales` contient explicitement un texte de placeholder : `Page à compléter avec les informations officielles de l'association, son responsable de publication et son hébergeur.`
- Le référencement technique est incomplet : pas de `robots.txt`, pas de `sitemap.xml`, pas de données structurées locales.
- Le site manque encore de contenus de vie de club : événements, partenaires, interclubs, résultats, photos réelles.
- Le lien d'inscription FFBaD doit être vérifié : le fallback pointe vers `https://www.cfvv41.fr/inscription`, qui ressemble davantage à une URL interne/historique qu'à un lien fédéral direct.
- L'authentification doit être stabilisée : l'avertissement Supabase en production explique possiblement les variations `connecté / non connecté / admin / non admin`.

## 9. Problèmes fonctionnels

| Page | Élément | Reproduction | Attendu | Observé | Gravité | Solution recommandée |
|---|---|---|---|---|---|---|
| Contact / essai | Formulaire | Remplir et envoyer | Message envoyé au club ou stocké en base | Succès local seulement, pas d'envoi réel identifié | P1 | Créer une route API ou table Supabase `contact_requests` avec notification email |
| Connexion | Session Supabase | Ouvrir plusieurs pages connectées | Session stable | Warning `Multiple GoTrueClient instances` en ligne | P1 | Centraliser la création du client Supabase navigateur |
| SEO | `robots.txt` | Ouvrir `/robots.txt` | Fichier 200 | 404 | P1 | Ajouter un robots généré par Next.js |
| SEO | `sitemap.xml` | Ouvrir `/sitemap.xml` | Sitemap 200 | 404 | P1 | Ajouter un sitemap généré par Next.js |
| Connexion | Titres | Inspecter `/connexion` | Un seul H1 principal | Deux H1 détectés : `Connexion au club` et `Connexion` | P2 | Transformer le second H1 en H2 |
| Admin/connecté | Pages protégées | Tester sans env local | Comportement local fidèle | Pages de configuration affichées | P2 | Documenter `.env.local` et ajouter un état plus explicite |
| Juridique | Mentions légales | Ouvrir `/mentions-legales` | Informations légales complètes | Placeholder à compléter | P1 | Compléter association, publication, hébergeur, contact |

## 10. Audit des contenus badminton

Informations bien présentes :

- nom du club ;
- ville ;
- créneaux ;
- tarifs ;
- gymnase principal ;
- adresse du gymnase des Aigremonts ;
- contact email ;
- séances d'essai ;
- commande de volants ;
- classements prévus dans l'arborescence.

Informations manquantes ou insuffisantes :

- plan d'accès détaillé ;
- âge minimum exact pour les jeunes ;
- noms et rôles des encadrants sur les séances jeunes ;
- informations interclubs complètes ;
- résultats sportifs ;
- tournois ;
- partenaires et sponsors ;
- statistiques du club utiles pour collectivités ;
- lien FFBaD réellement vérifié ;
- documents nécessaires à l'inscription ;
- règlement intérieur ;
- informations sur assurance, droit à l'image et mineurs.

Phrase problématique :

> Page à compléter avec les informations officielles de l'association, son responsable de publication et son hébergeur.

Reformulation attendue : remplacer ce placeholder par les informations réelles de l'association, par exemple identité de l'association, siège, responsable de publication, hébergeur, contact et SIRET/RNA si disponible.

## 11. Audit UX et parcours utilisateurs

Parcours A - nouvel adulte :

- Clics estimés : 2 à 3.
- Il trouve rapidement les créneaux, tarifs et contact.
- Obstacle principal : la demande d'essai n'est pas réellement transmise si le formulaire reste factice.
- Note : 7 / 10.

Parcours B - parent d'un jeune joueur :

- Clics estimés : 3 à 4.
- Les créneaux jeunes existent, mais l'encadrement, l'âge minimum, les documents et les garanties parentales restent trop peu détaillés.
- Note : 6 / 10.

Parcours C - joueur compétiteur :

- Clics estimés : 3 à 5.
- Le site prévoit classements et vie sportive, mais manque de contenus interclubs, équipes, résultats et responsables sportifs.
- Note : 5 / 10.

Parcours D - partenaire ou collectivité :

- Clics estimés : 4 à 6.
- Le club paraît sérieux, mais les chiffres, actions, partenaires et contacts responsables sont insuffisants.
- Note : 5 / 10.

UX générale :

- La page d'accueil est compréhensible.
- Les boutons sont visibles.
- L'accès `Volants` dans le menu est pertinent pour les adhérents.
- Il manque un bloc très direct `Essayer une séance` avec les conditions, le lieu, le prix et le contact.

## 12. Audit responsive et mobile

Largeurs testées : 320 px, 375 px, 768 px, 1024 px et 1440 px, avec vérification automatisée renforcée sur 320, 375, 768 et 1440.

Constats :

- aucun débordement horizontal observé sur l'accueil ;
- les blocs se réorganisent correctement ;
- la navigation mobile affiche des accès utiles, notamment accueil, créneaux, réserver, volants et compte ;
- les CTA restent utilisables.

Limites :

- les parcours connectés complets sur mobile n'ont pas été validés faute de session de test fiable ;
- les tableaux admin et listes longues doivent être testés spécifiquement avec de vraies données ;
- les actions de commande/réservation doivent être testées au doigt sur téléphone réel.

## 13. Audit graphique

Le design est moderne, propre et plutôt professionnel. Les couleurs vertes correspondent bien à un univers sportif et associatif. Les cartes, boutons et espacements donnent une impression de site actuel.

Points forts :

- logo visible ;
- typographie forte pour les titres ;
- contraste global satisfaisant sur les zones principales ;
- boutons d'action bien différenciés ;
- interface calme, adaptée à un club.

Points faibles :

- peu de photos réelles du club, des gymnases, des bénévoles ou des joueurs ;
- le site paraît parfois plus `outil SaaS` que `club vivant` ;
- certaines pages de contenu léger donnent une impression de rubrique non terminée ;
- les pages juridiques et secondaires cassent l'impression de finition.

## 14. Audit accessibilité

Points positifs :

- langue française configurée dans l'application ;
- textes globalement lisibles ;
- formulaires avec libellés visibles ;
- aucune image sans attribut alt détectée sur les pages testées ;
- boutons HTML natifs majoritairement utilisés.

Problèmes :

| Impact | Problème | Conséquence | Recommandation |
|---|---|---|---|
| Majeur | Deux H1 sur `/connexion` | Hiérarchie confuse pour lecteurs d'écran et SEO | Garder un seul H1 |
| Modéré | Pas de lien d'évitement observé | Navigation clavier plus lente | Ajouter `Aller au contenu` |
| Modéré | Focus clavier non audité exhaustivement | Risque de parcours difficile | Tester tous menus, modales et formulaires |
| Modéré | Messages de succès/erreur à fiabiliser | Les lecteurs d'écran peuvent manquer l'information | Utiliser `aria-live` sur feedbacks |
| Mineur | Certains textes de cards sont longs | Fatigue visuelle sur mobile | Raccourcir et prioriser |

Le site est utilisable par beaucoup de publics, mais il n'est pas encore validable RGAA sans tests clavier, focus, contrastes mesurés et retours d'erreur accessibles.

## 15. Audit SEO

Points positifs :

- title clair : `CF2V41 - Planning, réservations et vie du club` ;
- meta description pertinente ;
- nom du club et ville présents ;
- pages thématiques utiles : créneaux, tarifs, contact, volants, actualités ;
- Open Graph présent sur la page d'accueil.

Points faibles :

- `robots.txt` absent ;
- `sitemap.xml` absent ;
- canonical non détectée ;
- pas de données structurées `SportsOrganization`, `LocalBusiness`, `Event` ou `FAQPage` ;
- contenus locaux à renforcer : `badminton Vendôme`, `badminton enfant Vendôme`, `badminton loisir Vendôme`, `club badminton Loir-et-Cher` ;
- pages interclubs, partenaires et jeunes encore trop faibles pour des requêtes spécifiques.

Capacité actuelle :

| Requête | Potentiel actuel |
|---|---|
| club badminton Vendôme | Moyen à bon |
| badminton Vendôme | Moyen |
| cours badminton Vendôme | Moyen |
| badminton enfant Vendôme | Faible à moyen |
| badminton adulte Vendôme | Moyen |
| badminton loisir Vendôme | Moyen |
| tournoi badminton Loir-et-Cher | Faible |

## 16. Audit performances

Tests exécutés :

- build Next.js de production ;
- inspection automatisée via navigateur Chrome/Playwright ;
- contrôle des erreurs réseau sur pages testées.

Résultats observés :

- `npm run build` réussi ;
- First Load JS partagé annoncé par Next.js : environ 102 kB ;
- accueil : environ 148 kB de First Load JS ;
- pages admin/connectées : environ 152 à 155 kB de First Load JS ;
- manifest PWA chargé correctement.

Lighthouse n'a pas été exécuté dans cet environnement. Aucun score Lighthouse mobile ou desktop n'est donc inventé.

Améliorations possibles :

- ajouter un audit Lighthouse CI ;
- vérifier les images réelles lorsqu'elles seront ajoutées ;
- imposer WebP/AVIF et dimensions explicites ;
- charger les modules admin uniquement dans les pages admin ;
- vérifier le service worker et la stratégie de cache.

## 17. Audit du code

Points forts :

- architecture Next.js claire ;
- séparation `app`, `components`, `services`, `lib`, `supabase` ;
- TypeScript valide ;
- migrations Supabase et RLS présentes ;
- composants réutilisables ;
- données de fallback utiles pour éviter un site vide.

Points à corriger :

| Fichier ou zone | Problème | Risque | Correction recommandée |
|---|---|---|---|
| `components/public/request-form.tsx` | Formulaire sans envoi réel | Demandes perdues | Brancher Supabase ou API email |
| Supabase client navigateur | Plusieurs instances GoTrue en ligne | Session instable | Singleton client browser |
| `app/connexion` | Deux H1 | Accessibilité/SEO | H1 unique, H2 pour la carte |
| `services/club.service.ts` et `lib/mock-data.ts` | Données importantes en fallback | Données divergentes | Centraliser les réglages dans Supabase |
| Pages légales | Contenu placeholder | Non-conformité | Remplacer par contenu officiel |
| SEO app | Pas de robots/sitemap/canonical | Indexation affaiblie | Ajouter fichiers Next.js dédiés |

Les informations à centraliser prioritairement sont : horaires, tarifs, contacts, lien FFBaD, lieux, volants, événements, partenaires et textes légaux.

## 18. Audit sécurité, RGPD et juridique

Points positifs :

- HTTPS actif ;
- HSTS détecté sur Vercel ;
- Supabase et RLS prévus dans l'architecture ;
- service role non visible dans le code public audité ;
- les pages protégées refusent l'accès non connecté.

Risques et manques :

- mentions légales incomplètes ;
- politique de confidentialité trop courte ;
- pas de durée de conservation clairement annoncée ;
- pas d'information détaillée sur droit d'accès, rectification et suppression ;
- pas de politique sur photos de mineurs et droit à l'image ;
- pas de CSP détectée ;
- pas de `Referrer-Policy` ni `Permissions-Policy` détectées ;
- formulaire de contact non réel, donc ambigu pour l'utilisateur ;
- si des photos/résultats de jeunes sont publiés, le RGPD et le droit à l'image doivent être cadrés.

Conclusion RGPD : le site ne peut pas être considéré comme complet juridiquement en l'état. Un avis juridique ou une validation par les responsables de l'association reste recommandé.

## 19. Tableau complet des recommandations

| Priorité | Page ou fichier | Problème | Conséquence | Recommandation | Impact | Effort | Profil nécessaire |
|---|---|---|---|---|---|---|---|
| P1 | `components/public/request-form.tsx` | Formulaire factice | Demandes d'essai perdues | Enregistrer en Supabase et/ou envoyer email | Fort | Moyen | Développeur |
| P1 | Auth Supabase | Plusieurs GoTrueClient | Connexion/admin instables | Singleton Supabase browser client | Fort | Moyen | Développeur Supabase |
| P1 | `/mentions-legales` | Placeholder | Risque juridique | Compléter les mentions | Fort | Faible | Responsable juridique/club |
| P1 | SEO | `robots.txt` absent | Indexation affaiblie | Ajouter robots | Moyen | Faible | Développeur |
| P1 | SEO | `sitemap.xml` absent | Pages moins découvertes | Ajouter sitemap | Moyen | Faible | Développeur |
| P1 | Inscription | Lien FFBaD à vérifier | Parcours d'inscription fragile | Valider le lien officiel et l'afficher clairement | Fort | Faible | Admin club |
| P2 | `/connexion` | Deux H1 | Accessibilité/SEO | Remplacer le H1 interne par H2 | Moyen | Faible | Développeur |
| P2 | Contenu | Parents/jeunes incomplets | Frein inscription jeunes | Ajouter âge, encadrants, documents | Fort | Moyen | Rédacteur club |
| P2 | Contenu | Compétiteurs incomplets | Peu attractif pour joueurs classés | Ajouter interclubs, équipes, résultats | Moyen | Moyen | Responsable sportif |
| P2 | SEO | Données structurées absentes | Visibilité locale limitée | Ajouter SportsOrganization/Event | Moyen | Moyen | Développeur SEO |
| P2 | Sécurité | Headers incomplets | Protection navigateur perfectible | Ajouter CSP, Referrer-Policy, Permissions-Policy | Moyen | Moyen | Développeur |
| P2 | Accessibilité | Pas de lien d'évitement | Navigation clavier moins bonne | Ajouter skip link | Moyen | Faible | Développeur |
| P2 | Admin | Données fallback dispersées | Incohérences possibles | Centraliser dans `settings_site` | Fort | Moyen | Développeur Supabase |
| P3 | Design | Peu de photos réelles | Club moins incarné | Ajouter photos gymnase/vie du club optimisées | Moyen | Moyen | Communication |
| P3 | Performance | Lighthouse absent | Pas de suivi objectif | Ajouter audit Lighthouse CI | Moyen | Moyen | Développeur |
| P3 | Contenu | Partenaires absents | Faible crédibilité collectivité | Ajouter page/section partenaires | Moyen | Faible | Bureau club |
| P4 | Textes | Certaines cards longues | Lisibilité perfectible | Raccourcir microcopy | Faible | Faible | Rédacteur |

## 20. Plan d'action immédiat

Actions réalisables en moins d'une journée :

- compléter les mentions légales minimales ;
- compléter la politique de confidentialité ;
- vérifier et corriger le lien d'inscription FFBaD ;
- ajouter `robots.txt` ;
- ajouter `sitemap.xml` ;
- corriger le double H1 de `/connexion` ;
- ajouter un lien d'évitement clavier ;
- remplacer le message du formulaire par un avertissement tant que l'envoi réel n'est pas branché ;
- documenter les variables `.env.local` nécessaires au test Supabase.

## 21. Plan d'action à court terme

Actions à mener sur les prochaines semaines :

- brancher le formulaire de contact/demande d'essai sur Supabase et/ou email ;
- stabiliser le client Supabase navigateur ;
- tester tout le parcours connexion, inscription, déconnexion, mot de passe oublié et changement de mot de passe ;
- ajouter les contenus jeunes, parents, compétiteurs, interclubs et partenaires ;
- ajouter les données structurées locales ;
- ajouter les headers de sécurité ;
- tester les pages admin avec données réelles sur mobile ;
- mettre en place un audit Lighthouse régulier.

## 22. Plan d'action à moyen terme

Améliorations structurelles :

- faire de Supabase la source unique des réglages club ;
- mettre en place un vrai workflow éditorial pour les actualités ;
- ajouter une médiathèque optimisée pour photos du club ;
- ajouter un suivi des demandes d'essai dans l'admin ;
- améliorer les exports CSV admin ;
- créer des pages SEO locales dédiées aux publics : jeunes, adultes, loisirs, compétition ;
- formaliser une procédure RGPD pour comptes, photos, mineurs et données de réservation.

## 23. Verdict final du comité

Le site inspire confiance visuellement et techniquement. Il donne plutôt envie de rejoindre le club, surtout pour un adulte ou un joueur loisir qui cherche rapidement les créneaux et les tarifs. Il est adapté aux téléphones sur les pages publiques testées.

En revanche, il ne doit pas encore être promu largement sans corrections ciblées. Les informations essentielles sont globalement accessibles, mais le contact réel, l'inscription, les pages légales, le SEO technique et la stabilité de l'authentification doivent être sécurisés. Pour une association, la bonne direction n'est pas d'ajouter plus de complexité tout de suite, mais de rendre les parcours de base irréprochables : comprendre, essayer, contacter, s'inscrire, se connecter.

Le site peut rester en ligne en phase de test, mais les modifications indispensables avant communication large sont : formulaire réel, lien d'inscription vérifié, pages légales complètes, sitemap/robots, auth Supabase stabilisée et contenus clés pour parents/jeunes/compétiteurs.

Tests non réalisés ou incomplets :

- Lighthouse mobile/desktop non exécuté ;
- parcours connecté complet non validé faute de session de test dédiée ;
- actions admin réelles non testées de bout en bout ;
- RLS Supabase non vérifiées par requêtes directes authentifiées ;
- audit clavier manuel complet non effectué ;
- livraison email du formulaire non testable car le formulaire n'a pas de backend réel identifié ;
- conformité juridique non validée par professionnel du droit.
