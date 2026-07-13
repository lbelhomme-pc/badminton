# Design system CFVV

RÃ©fÃ©rences :

- `docs/cahier-des-charges/cahier-des-charges-cfvv.md`
- `docs/cahier-des-charges/cahier-des-charges-cfvv-v0.1.docx`
- `docs/audit-cahier-des-charges.md`

Ce document fixe les rÃ¨gles visuelles et d'interface Ã  respecter pendant la migration progressive du site.

## 1. Positionnement visuel

Le site doit donner une impression sportive, locale et fiable. L'Ã©nergie du badminton est portÃ©e par les photos, le logo, les titres courts et les actions visibles, sans multiplier les effets dÃ©coratifs.

Principes :

- interface claire avant d'Ãªtre spectaculaire ;
- navigation courte ;
- boutons d'action immÃ©diatement visibles ;
- mise en avant de VendÃ´me, des crÃ©neaux, de l'essai et de l'espace adhÃ©rent ;
- peu d'animations, jamais indispensables Ã  la comprÃ©hension ;
- design maintenable par une association.

## 2. Couleurs

Palette issue du cahier des charges :

| Token | Valeur | Usage |
|---|---:|---|
| `cfvv.turquoise` | `#0C8A9C` | Accents, Ã©lÃ©ments de marque, surfaces lÃ©gÃ¨res |
| `cfvv.action` | `#0B7F90` | Boutons et liens importants avec contraste renforcÃ© |
| `cfvv.actionDark` | `#076B79` | Survol des actions principales |
| `cfvv.anthracite` | `#1D1D1F` | Texte principal, navigation, surfaces sombres |
| `cfvv.white` | `#FFFFFF` | Fonds et respiration |

Dans Tailwind, les anciens tokens `court-*` sont conservÃ©s pour compatibilitÃ©, mais ils pointent maintenant vers la palette CFVV.

## 3. Typographies

- Titres, navigation et boutons : `Rajdhani`, puis fallback systÃ¨me.
- Texte courant : pile systÃ¨me lisible.
- Taille de base : 16 px minimum.
- Interlignage : confortable, surtout sur mobile.

Point restant : les fichiers de police Rajdhani ne sont pas encore prÃ©sents dans `public/fonts/`. Le CSS utilise la famille `Rajdhani`, mais il faudra ajouter les fichiers locaux officiels avant de considÃ©rer l'exigence "police hÃ©bergÃ©e localement" comme totalement conforme.

## 4. Logos et images de marque

Originaux conservÃ©s :

- `docs/cahier-des-charges/logos/`
- `docs/cahier-des-charges/photos-reference/`

Assets utilisÃ©s par le site :

- `public/logos/cfvv-horizontal.png`
- `public/logos/cfvv-blason.png`
- `public/logos/cfvv-illustration.png`

RÃ¨gles :

- ne pas dÃ©former le logo ;
- ne pas l'ombrer ;
- ne pas recolorer les originaux ;
- toujours prÃ©voir un nom textuel accessible autour du logo ;
- optimiser les variantes finales avant production.

Ã€ fournir plus tard :

- `cfvv-horizontal.svg` officiel ;
- `cfvv-blanc.svg` officiel ;
- `cfvv-monochrome.svg` officiel ;
- favicon et icÃ´nes PWA optimisÃ©s aux formats 32, 192 et 512 px ;
- fichiers Rajdhani locaux.

## 5. Layout

- Conteneur principal recommandÃ© : `max-w-7xl`.
- Largeur de lecture Ã©ditoriale : `max-w-3xl` Ã  `max-w-4xl`.
- Cartes : rayon 8 px (`rounded-lg`), bordure claire, ombre lÃ©gÃ¨re.
- Pas de carte dans une carte pour les sections de page.
- Espacement vertical gÃ©nÃ©reux entre sections.

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
- `ghost` : action discrÃ¨te ;
- `danger` : action destructive.

RÃ¨gles :

- libellÃ© court et explicite ;
- Ã©tat dÃ©sactivÃ© visible ;
- focus clavier visible ;
- icÃ´ne utile si elle aide Ã  identifier l'action ;
- confirmation avant suppression, annulation sensible ou modification de rÃ´le.

## 7. Badges

Composant : `components/ui/badge.tsx`

Variantes :

- `neutral`
- `success`
- `warning`
- `danger`
- `info`

RÃ¨gle importante : ne jamais transmettre une information uniquement par la couleur. Ajouter un texte clair et, si utile, une icÃ´ne.

## 8. Cartes

Composant de base : `components/ui/card.tsx`

Types attendus :

- carte d'Ã©vÃ©nement ;
- carte de crÃ©neau ;
- carte d'actualitÃ© ;
- carte partenaire.

Structure recommandÃ©e :

1. badge ou catÃ©gorie ;
2. titre ;
3. mÃ©tadonnÃ©es utiles : date, lieu, public, statut ;
4. court rÃ©sumÃ© ;
5. action claire.

## 9. Formulaires

Composants :

- `components/ui/form-field.tsx`
- `components/ui/feedback-message.tsx`

RÃ¨gles :

- labels visibles ;
- aide proche du champ ;
- erreur proche du champ ;
- messages persistants ou suffisamment longs ;
- pas de placeholder comme seul libellÃ© ;
- rÃ©sumÃ© ou confirmation avant action sensible.

## 10. Navigation

Navigation principale :

- Accueil ;
- CrÃ©neaux ;
- Le Bureau ;
- Agenda ;
- Le Club ;
- Partenaires ;
- Contact ;
- Espace adhÃ©rent.

Le header contient aussi :

- logo horizontal ;
- raccourci "Nous rejoindre" ;
- Ã©tat connectÃ© avec initiales ;
- accÃ¨s admin si l'utilisateur est admin ;
- menu mobile utilisable au clavier ;
- fermeture du menu avec Ã‰chap.

## 11. Footer

Le footer regroupe :

- tarifs et inscriptions ;
- lieux et catÃ©gories ;
- club, bureau, agenda, partenaires ;
- rÃ¨glement intÃ©rieur, FAQ, mentions lÃ©gales, confidentialitÃ©, cookies, accessibilitÃ© ;
- FFBaD, HelloAsso, rÃ©seaux sociaux configurÃ©s ;
- contact et plan d'accÃ¨s.

## 12. AccessibilitÃ©

RÃ¨gles appliquÃ©es ou Ã  conserver :

- lien d'Ã©vitement ;
- focus visible ;
- textes de base Ã  16 px minimum ;
- contraste renforcÃ© sur les actions ;
- menu mobile contrÃ´lable au clavier ;
- fermeture par Ã‰chap ;
- respect de `prefers-reduced-motion` ;
- textes alternatifs utiles pour les images non dÃ©coratives.

Ã€ vÃ©rifier lors de la recette :

- ordre du focus sur toutes les pages ;
- contraste des contenus administrables ;
- textes alternatifs des actualitÃ©s et partenaires ;
- zoom 200 % ;
- parcours mobile 320 px et 375 px.

## 13. Ã‰tats UI

Chaque module doit prÃ©voir :

- chargement ;
- vide ;
- succÃ¨s ;
- erreur ;
- dÃ©sactivÃ© ;
- accÃ¨s refusÃ© ;
- action en cours.

Les messages doivent expliquer ce que l'utilisateur peut faire ensuite.

## 14. Notes de migration

Le site contient encore plusieurs pages avec l'ancien libellÃ© `CFVV`. La migration complÃ¨te du contenu doit Ãªtre faite par lots, en validant le nom officiel avec le club avant remplacement massif.

La prioritÃ© visuelle actuelle est :

1. charte et tokens ;
2. header/footer/navigation ;
3. composants communs ;
4. pages publiques clÃ©s ;
5. espace adhÃ©rent ;
6. back-office.
