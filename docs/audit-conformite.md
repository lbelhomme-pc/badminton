# Audit de conformité CFVV

Date : 13 juillet 2026  
Périmètre : site Next.js local du CFVV, pages publiques, espace adhérent, routes privées, formulaire de contact, SEO local, PWA/cache et documentation.

## 1. Synthèse

Le site possède déjà une base saine : navigation claire, en-tête accessible, lien d'évitement, pages publiques structurées, Supabase côté données, routes privées séparées et politique d'en-têtes de sécurité existante.

Les corrections effectuées renforcent :

- les en-têtes de sécurité ;
- la non-indexation des espaces privés ;
- le formulaire de contact ;
- la politique de confidentialité ;
- la page cookies ;
- le cache PWA ;
- les métadonnées sociales et les données structurées Event conditionnelles.

La conformité juridique reste à valider par le bureau, car certaines informations ne doivent pas être inventées : responsable de traitement, durées de conservation définitives, contact RGPD officiel, droit à l'image et sous-traitants confirmés.

## 2. Corrections appliquées

| Domaine | Correction | Fichier |
| --- | --- | --- |
| Sécurité | Ajout HSTS production, COOP, DNS prefetch off et protection cross-domain | `next.config.mjs` |
| SEO privé | Ajout `X-Robots-Tag` sur les routes privées | `next.config.mjs` |
| Contact | Limitation simple par IP, taille max, contrôle d'origine, parsing JSON sécurisé | `app/api/contact-requests/route.ts` |
| RGPD formulaire | Lien visible vers la politique de confidentialité dans le consentement | `components/public/request-form.tsx` |
| RGPD | Politique de confidentialité structurée avec finalités, droits, sous-traitants et marqueurs à valider | `app/confidentialite/page.tsx` |
| Cookies | Page cookies conforme à l'absence actuelle de traceurs non essentiels | `app/cookies/page.tsx` |
| PWA | Service worker limité aux pages publiques et statiques, sans cache privé/API | `public/sw.js` |
| SEO | Open Graph, Twitter et canonical global améliorés | `app/layout.tsx` |
| SEO local | Balisage Event conditionnel ajouté pour les événements publiés réels | `lib/structured-data.ts`, `app/vie-du-club/evenements/page.tsx` |
| Dépendances | Mise à jour de Next.js, Supabase JS et résolution PostCSS ; `npm audit --omit=dev` à 0 vulnérabilité | `package.json`, `package-lock.json` |
| Documentation | Procédure sécurité et incidents créée | `docs/securite-et-incidents.md` |

## 3. Sécurité

### Conforme ou renforcé

- HTTPS prévu en production via Vercel.
- En-têtes de sécurité définis dans la configuration Next.js.
- Pages privées exclues de l'indexation par en-tête HTTP.
- Formulaire de contact avec validation serveur.
- Absence de secret évident dans les fichiers inspectés hors dépendances.
- Service worker durci pour ne pas servir l'espace privé ou les API depuis le cache.

### Restant à valider

| Criticité | Sujet | Action |
| --- | --- | --- |
| P1 | MFA administrateurs | Activer ou préparer MFA dans Supabase selon l'offre et les capacités du projet |
| P1 | Sauvegardes Supabase | Définir fréquence, responsable et test de restauration |
| P1 | RLS production | Vérifier chaque politique Supabase sur les tables sensibles |
| P2 | CSP stricte | Remplacer progressivement `unsafe-inline` par une stratégie avec nonce si le projet le justifie |
| P2 | Logs d'audit | Confirmer que les actions sensibles du back-office sont journalisées |

## 4. RGPD

### Conforme ou préparé

- Politique de confidentialité disponible.
- Mentions de finalité et droits des personnes.
- Formulaire de contact avec consentement explicite.
- Sous-traitants principaux listés à confirmer : Vercel, Supabase, HelloAsso, GitHub.
- Mineurs et droit à l'image mentionnés comme points nécessitant validation.

### Validation juridique nécessaire

| Criticité | Sujet | Décision attendue |
| --- | --- | --- |
| P1 | Responsable de traitement | Nom officiel de l'association et personne/contact référent |
| P1 | Contact RGPD | Email ou adresse à afficher |
| P1 | Durées de conservation | Durées par catégorie : comptes, réservations, commandes, contact, documents |
| P2 | Droit à l'image | Règles photos, notamment mineurs et événements |
| P2 | Registre des traitements | Validation par le bureau |

Référence utile : la CNIL rappelle que le consentement cookies doit être préalable sauf traceurs strictement nécessaires, et que le retrait doit être aussi simple que l'acceptation.

## 5. Cookies et services tiers

État actuel : aucun service non essentiel volontairement chargé pour statistiques, publicité, cartes ou vidéos.

Conséquence :

- pas de bandeau cookies nécessaire pour les fonctions strictement nécessaires ;
- page cookies suffisante pour documenter l'état actuel ;
- si Google Maps, YouTube, analytics ou tracking sont ajoutés plus tard, ils devront être bloqués avant consentement.

## 6. Accessibilité

### Points favorables

- Langue du document en français.
- Lien d'évitement vers `main-content`.
- Navigation mobile avec fermeture par Échap.
- Focus visible prévu dans les composants.
- Formulaires avec labels visibles et messages d'erreur associés.
- Les contenus importants ne reposent pas uniquement sur la couleur.

### Points à tester manuellement

| Criticité | Sujet | Méthode |
| --- | --- | --- |
| P1 | Navigation clavier complète du back-office | Parcourir chaque écran sans souris |
| P1 | Lecteur d'écran | Tester les parcours connexion, contact, réservation |
| P2 | Zoom 200 % | Vérifier accueil, créneaux, agenda, formulaires |
| P2 | Contrastes réels | Mesurer les couleurs finales après toutes les pages |
| P2 | Documents PDF | Vérifier accessibilité si des PDF sont publiés |

Référence utile : RGAA et WCAG demandent notamment des alternatives, une structure de titres cohérente, des contrastes suffisants, des formulaires compréhensibles et une navigation clavier.

## 7. SEO local

### Conforme ou renforcé

- Titres et descriptions sur les pages principales.
- Canonical global et par page.
- Sitemap public existant via les chemins déclarés.
- Données structurées `SportsOrganization` et `SportsActivityLocation`.
- Balisage `Event` conditionnel pour les événements publiés.
- Contenu local autour de Vendôme et du Vendômois.

### Restant à compléter

| Criticité | Sujet | Action |
| --- | --- | --- |
| P1 | Coordonnées définitives | Confirmer adresse, téléphone public ou absence de téléphone |
| P2 | Google Business Profile | Créer ou mettre à jour la fiche du club |
| P2 | Événements réels | Publier des événements validés pour enrichir agenda et SEO |
| P3 | Données partenaires | Ajouter les partenaires réels validés |

## 8. Performance

### Points favorables

- Polices locales.
- Pas de carrousel automatique.
- Pas de carte ou vidéo tierce chargée par défaut.
- Service worker limité à des pages publiques.
- Pages majoritairement statiques et légères.

### Optimisations futures

| Criticité | Sujet | Action |
| --- | --- | --- |
| P2 | Images | Passer les grandes images en formats WebP/AVIF et tailles responsives |
| P2 | Lighthouse | Mesurer mobile et desktop après build de production |
| P3 | Scripts | Surveiller le poids si le back-office grossit |
| P3 | Cache | Définir une stratégie par type de contenu public |

### Mesure Lighthouse

L'audit Lighthouse automatisé a été tenté sur le serveur local. Il n'a pas produit une mesure fiable complète, car le serveur tournait en mode développement et recompilait plusieurs routes pendant l'audit.

Rapports partiels générés :

| Page | Performance | Accessibilité | Bonnes pratiques | SEO | Commentaire |
| --- | ---: | ---: | ---: | ---: | --- |
| Accueil | 0 | 96 | 0 | 83 | Performance et bonnes pratiques non exploitables en mode développement |
| Créneaux | 0 | 100 | 0 | 91 | Performance et bonnes pratiques non exploitables en mode développement |

Un audit fiable doit être relancé sur un serveur de production local ou sur Vercel après déploiement.

## 9. Éléments non vérifiables automatiquement ici

- Configuration Supabase Auth complète : Site URL, Redirect URLs, MFA, durées de session.
- Politiques RLS réellement présentes en production.
- Variables Vercel Preview/Production.
- Logs Vercel et Supabase.
- Tests lecteur d'écran réels.
- Audit juridique définitif RGPD.
- Sauvegarde et restauration Supabase.

## 10. Classement des restes par criticité

| Priorité | Sujet | Responsable |
| --- | --- | --- |
| P1 | Valider responsable de traitement, contact RGPD et durées de conservation | Bureau |
| P1 | Vérifier RLS Supabase sur toutes les tables sensibles | Admin technique |
| P1 | Activer/préparer MFA administrateurs | Admin technique |
| P1 | Définir sauvegardes/restauration | Bureau + admin technique |
| P2 | Tester clavier/lecteur d'écran sur les parcours privés | Développeur + testeur |
| P2 | Mesurer Lighthouse production | Développeur |
| P2 | Confirmer les contenus locaux réels : tarifs, lieux, partenaires | Bureau |
| P3 | CSP avec nonce | Développeur |
| P3 | Optimisation images avancée | Développeur/contributeur contenus |

## 11. Conclusion

La conformité technique progresse nettement : les protections de base sont en place, les pages privées sont mieux isolées, les formulaires sont plus robustes, le cache PWA est moins risqué et la documentation sécurité existe.

Le site ne doit toutefois pas être présenté comme juridiquement conforme tant que le bureau n'a pas validé les informations RGPD, les durées de conservation, le droit à l'image et l'organisation des sauvegardes.
