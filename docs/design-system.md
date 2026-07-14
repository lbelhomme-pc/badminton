# Design system CFVV

Références :

- `docs/cahier-des-charges/cahier-des-charges-cfvv.md`
- `docs/cahier-des-charges/cahier-des-charges-cfvv-v0.1.docx`
- `docs/audit-cahier-des-charges.md`

Ce document fixe les règles visuelles et d'interface à respecter pendant la migration progressive du site.

## 1. Positionnement visuel

Le site doit donner une impression sportive, locale et fiable. L'énergie du badminton est portée par les photos, le logo, les titres courts et les actions visibles, sans multiplier les effets décoratifs.

Principes :

- interface claire avant d'être spectaculaire ;
- navigation courte ;
- boutons d'action immédiatement visibles ;
- mise en avant de Vendôme, des créneaux, de l'essai et de l'espace adhérent ;
- peu d'animations, jamais indispensables à la compréhension ;
- design maintenable par une association.

## 2. Couleurs

Palette issue du cahier des charges :

| Token | Valeur | Usage |
|---|---:|---|
| `cfvv.turquoise` | `#0C8A9C` | Accents, éléments de marque, surfaces légères |
| `cfvv.action` | `#0B7F90` | Boutons et liens importants avec contraste renforcé |
| `cfvv.actionDark` | `#076B79` | Survol des actions principales |
| `cfvv.anthracite` | `#1D1D1F` | Texte principal, navigation, surfaces sombres |
| `cfvv.white` | `#FFFFFF` | Fonds et respiration |

Dans Tailwind, les anciens tokens `court-*` sont conservés pour compatibilit?, mais ils pointent maintenant vers la palette CFVV.

## 3. Typographies

- Titres, navigation et boutons : `Rajdhani`, puis fallback système.
- Texte courant : pile système lisible.
- Taille de base : 16 px minimum.
- Interlignage : confortable, surtout sur mobile.

Point restant : les fichiers de police Rajdhani ne sont pas encore présents dans `public/fonts/`. Le CSS utilise la famille `Rajdhani`, mais il faudra ajouter les fichiers locaux officiels avant de considérer l'exigence "police hébergée localement" comme totalement conforme.

## 4. Logos et images de marque

Originaux conservés :

- `docs/cahier-des-charges/logos/`
- `docs/cahier-des-charges/photos-reference/`

Assets utilisés par le site :

- `public/logos/cfvv-horizontal.png`
- `public/logos/cfvv-blason.png`
- `public/logos/cfvv-illustration.png`

Règles :

- ne pas déformer le logo ;
- ne pas l'ombrer ;
- ne pas recolorer les originaux ;
- toujours prévoir un nom textuel accessible autour du logo ;
- optimiser les variantes finales avant production.

? fournir plus tard :

- `cfvv-horizontal.svg` officiel ;
- `cfvv-blanc.svg` officiel ;
- `cfvv-monochrome.svg` officiel ;
- favicon et icônes PWA optimisés aux formats 32, 192 et 512 px ;
- fichiers Rajdhani locaux.

## 5. Layout

- Conteneur principal recommandé : `max-w-7xl`.
- Largeur de lecture éditoriale : `max-w-3xl` ? `max-w-4xl`.
- Cartes : rayon 8 px (`rounded-lg`), bordure claire, ombre légère.
- Pas de carte dans une carte pour les sections de page.
- Espacement vertical génèreux entre sections.

Une classe utilitaire globale existe :

```css
.container-page
```

Elle applique une largeur maximale et des marges horizontales responsives.

## 6. Boutons

Composant : `components/ui/button.tsx`

Variantes :

- `primary` : action principale turquoise accessible ;
- `secondary` : action forte anthracite ;
- `outline` : action secondaire ;
- `ghost` : action discrète ;
- `danger` : action destructive.

Règles :

- libellé court et explicite ;
- état désactivé visible ;
- focus clavier visible ;
- icône utile si elle aide à identifier l'action ;
- confirmation avant suppression, annulation sensible ou modification de rôle.

## 7. Badges

Composant : `components/ui/badge.tsx`

Variantes :

- `neutral`
- `success`
- `warning`
- `danger`
- `info`

Règle importante : ne jamais transmettre une information uniquement par la couleur. Ajouter un texte clair et, si utile, une icône.

## 8. Cartes

Composant de base : `components/ui/card.tsx`

Types attendus :

- carte d'événement ;
- carte de créneau ;
- carte d'actualité ;
- carte partenaire.

Structure recommandée :

1. badge ou catégorie ;
2. titre ;
3. métadonnées utiles : date, lieu, public, statut ;
4. court résumé ;
5. action claire.

## 9. Formulaires

Composants :

- `components/ui/form-field.tsx`
- `components/ui/feedback-message.tsx`

Règles :

- labels visibles ;
- aide proche du champ ;
- erreur proche du champ ;
- messages persistants ou suffisamment longs ;
- pas de placeholder comme seul libellé ;
- résumé ou confirmation avant action sensible.

## 10. Navigation

Navigation principale :

- Accueil ;
- Créneaux ;
- Le Bureau ;
- Agenda ;
- Le Club ;
- Partenaires ;
- Contact ;
- Espace adhérent.

Le header contient aussi :

- logo horizontal ;
- raccourci "Nous rejoindre" ;
- état connect? avec initiales ;
- accès admin si l'utilisateur est admin ;
- menu mobile utilisable au clavier ;
- fermeture du menu avec Échap.

## 11. Footer

Le footer regroupe :

- tarifs et inscriptions ;
- lieux et catégories ;
- club, bureau, agenda, partenaires ;
- règlement intérieur, FAQ, mentions légales, confidentialité, cookies, accessibilité ;
- FFBaD, HelloAsso, réseaux sociaux configurés ;
- contact et plan d'accès.

## 12. Accessibilité

Règles appliquées ou à conserver :

- lien d'évitement ;
- focus visible ;
- textes de base ? 16 px minimum ;
- contraste renforcé sur les actions ;
- menu mobile contrôlable au clavier ;
- fermeture par Échap ;
- respect de `prefers-reduced-motion` ;
- textes alternatifs utiles pour les images non décoratives.

? vérifier lors de la recette :

- ordre du focus sur toutes les pages ;
- contraste des contenus administrables ;
- textes alternatifs des actualités et partenaires ;
- zoom 200 % ;
- parcours mobile 320 px et 375 px.

## 13. états UI

Chaque module doit prévoir :

- chargement ;
- vide ;
- succès ;
- erreur ;
- désactivé ;
- accès refus? ;
- action en cours.

Les messages doivent expliquer ce que l'utilisateur peut faire ensuite.

## 14. Notes de migration

Le site contient encore plusieurs pages avec l'ancien libellé `CFVV`. La migration complète du contenu doit être faite par lots, en validant le nom officiel avec le club avant remplacement massif.

La priorit? visuelle actuelle est :

1. charte et tokens ;
2. header/footer/navigation ;
3. composants communs ;
4. pages publiques clés ;
5. espace adhérent ;
6. back-office.
