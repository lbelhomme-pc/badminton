# UX/UI et design system

Site moderne pour club de badminton.

Document de conception visuelle et ergonomique avant code.

## 1. Direction artistique

### Intention

Creer une experience claire, premium et sportive, sans agressivite visuelle. Le site doit sembler moderne et fiable des le premier ecran, avec une interface plus proche d'une plateforme de reservation contemporaine que d'un site associatif classique.

Principes :

- Clarte avant decoration.
- Mobile-first.
- Actions visibles et courtes.
- Grandes cartes respirantes.
- Filtres simples.
- Statuts immediatement lisibles.
- Animations discretes.
- Administration dense mais calme.

### Ambiance

Mots-cles :

- propre
- dynamique
- communautaire
- lumineux
- sportif
- accessible
- organise
- rapide

Ce que l'interface doit eviter :

- pages surchargees
- look administratif
- grands blocs de texte non scannables
- contrastes criards
- illustrations generiques
- boutons trop nombreux au meme niveau
- navigation mobile profonde

### Reference mentale

Une galerie moderne de contenus :

- grandes cartes avec titres courts
- visuels nets
- filtres horizontaux
- recherche en haut de liste
- transitions fluides
- beaucoup d'espace blanc
- surfaces bien separees par ombre legere ou bordure

Application au badminton :

- cartes de creneaux comme des cartes d'evenements
- badges de niveau et statut
- planning lisible en liste mobile
- admin comme un tableau de bord SaaS calme

## 2. Palette de couleurs

### Palette principale

| Role | Couleur | Usage |
| --- | --- | --- |
| Fond global | `#F7F9F7` | Arriere-plan leger, sections publiques |
| Surface | `#FFFFFF` | Cartes, panneaux, modales |
| Surface douce | `#EFF5F1` | Zones secondaires, etats vides |
| Texte principal | `#10201B` | Titres, contenu important |
| Texte secondaire | `#5B6863` | Descriptions, metadata |
| Texte discret | `#84918B` | Hints, timestamps |
| Bordure | `#DDE5E1` | Separateurs, contours |
| Bordure forte | `#C7D3CD` | Champs actifs, cartes selectionnees |
| Accent principal | `#12B76A` | CTA reservation, actions positives |
| Accent principal fonce | `#078D50` | Hover CTA, focus fort |
| Accent bleu | `#2563EB` | Liens, export calendrier, info |
| Accent volant | `#FACC15` | Highlights sportifs, pictos subtils |
| Alerte | `#F97316` | Gymnase ferme, attention |
| Danger | `#DC2626` | Annulation, erreur |
| Succes doux | `#DCFCE7` | Badges ouverts, confirmations |
| Alerte douce | `#FFEDD5` | Warning, attente |
| Danger doux | `#FEE2E2` | Annule, erreur |

### Usage recommande

- Le vert est reserve aux actions principales et aux statuts ouverts.
- Le bleu sert aux actions secondaires utiles : details, calendrier, lien.
- Le jaune sert en accent de marque, jamais en grand fond dominant.
- L'orange sert aux alertes et aux creneaux particuliers.
- Le rouge est limite aux erreurs et annulations.

### Ratios visuels

- 70% tons clairs neutres.
- 20% texte, bordures, surfaces secondaires.
- 10% accents.

Objectif : garder une interface premium, pas un theme vert omnipresent.

## 3. Typographies

### Police principale

Recommandation :

- Inter ou Geist Sans.
- Fallback : system UI, Arial, sans-serif.

Raison :

- lisible sur mobile
- moderne
- bonne densite pour admin
- compatible interface sportive sobre

### Echelle typographique

| Token | Desktop | Mobile | Usage |
| --- | --- | --- | --- |
| Display | 56/62 | 38/44 | Hero accueil uniquement |
| H1 | 44/52 | 32/40 | Titre page |
| H2 | 32/40 | 26/34 | Sections importantes |
| H3 | 24/32 | 22/30 | Cartes majeures |
| H4 | 18/26 | 18/26 | Titres cartes |
| Body | 16/26 | 16/26 | Texte courant |
| Small | 14/22 | 14/22 | Metadata |
| Caption | 12/18 | 12/18 | Badges, labels courts |

Regles :

- Pas de texte inferieur a 12px.
- Pas de letter-spacing negatif.
- Titres courts.
- Les cartes admin utilisent H4 ou body fort, jamais de hero-scale.

### Ton editorial

Le texte doit etre direct et chaleureux.

Exemples :

- "Voir les creneaux"
- "Reserver ma place"
- "Commander des volants"
- "Venir essayer"
- "S'inscrire au club"
- "Creneau complet"
- "Annuler ma reservation"
- "Gymnase ferme exceptionnellement"

## 4. Grille, espacements et formes

### Grille

Mobile :

- 1 colonne.
- marges laterales 16px.
- cartes pleine largeur.
- nav basse fixe ou header compact + drawer.

Tablette :

- 2 colonnes pour cartes.
- filtres en ligne si place suffisante.

Desktop :

- conteneur max 1180px.
- grille 12 colonnes.
- cartes planning en 2 ou 3 colonnes.
- admin avec sidebar 248px et contenu flexible.

### Espacements

Tokens :

- `4px` micro
- `8px` compact
- `12px` champs internes
- `16px` cartes compactes
- `24px` blocs
- `32px` sections
- `48px` grandes sections
- `72px` hero et respiration desktop

### Rayons

- Boutons : 8px.
- Champs : 8px.
- Cartes : 8px.
- Modales : 12px maximum.
- Pills : 999px uniquement pour filtres, badges et avatars.

### Ombres

Ombres tres discretes :

- Carte standard : bordure + ombre quasi invisible.
- Carte hover : translation `-2px`, ombre douce.
- Modale : ombre forte mais floue.

Ne pas utiliser d'orbes, blobs, gradients decoratifs ou fonds purement atmospheriques.

## 5. Design system

### Tokens semantiques

Couleurs :

- `background`
- `surface`
- `surface-muted`
- `foreground`
- `muted-foreground`
- `border`
- `primary`
- `primary-hover`
- `secondary`
- `warning`
- `danger`
- `success`

Espacements :

- `space-xs`
- `space-sm`
- `space-md`
- `space-lg`
- `space-xl`
- `space-2xl`

Etats :

- `hover`
- `focus-visible`
- `disabled`
- `selected`
- `loading`
- `error`

### Boutons

Variantes :

- `primary` : action principale, vert.
- `secondary` : action utile mais moins prioritaire.
- `outline` : filtres, actions secondaires.
- `ghost` : navigation, icones.
- `danger` : annulation destructive.

Tailles :

- `sm` : admin tables.
- `md` : usage standard.
- `lg` : CTA public et mobile reservation.
- `icon` : actions compactes avec tooltip.

Regles :

- Une seule action primaire par zone.
- Les actions destructives demandent confirmation.
- Les boutons icones ont aria-label et tooltip.

### Champs

Types :

- input texte
- textarea
- select
- combobox recherche
- date picker
- quantity stepper
- checkbox
- switch

Regles :

- label visible.
- aide courte sous champ si necessaire.
- erreur sous champ.
- focus visible.
- taille tactile minimum 44px sur mobile.

### Badges

Statuts creneaux :

- Ouvert : vert doux.
- Complet : gris fonce ou orange doux.
- Annule : rouge doux.
- Reserve competition : bleu doux.
- Ferme : orange doux.

Niveaux :

- Debutant : bleu doux.
- Loisir : vert doux.
- Confirme : jaune doux.
- Competiteur : orange doux.

Commandes :

- En attente.
- Reserve.
- A payer.
- Paye.
- Recupere.
- Annule.

### Cartes

Types :

- `SlotCard`
- `EventCard`
- `NewsCard`
- `ShuttleProductCard`
- `MemberDashboardCard`
- `AdminMetricCard`
- `RankingCardMobile`

Anatomie commune :

- badge ou metadata en haut
- titre clair
- details importants
- action principale
- action secondaire si utile

Regle :

- Une carte ne doit pas contenir une autre carte.

## 6. Composants principaux

### Header sticky

Desktop :

- logo/nom du club a gauche.
- navigation principale au centre.
- CTA "Voir les creneaux" ou "Se connecter" a droite.
- profil adherent si connecte.

Mobile :

- logo compact.
- bouton menu.
- CTA rapide selon contexte : "Reserver" ou "Compte".

### Navigation mobile

Barre basse recommandee pour les adherents :

- Accueil
- Planning
- Reserver
- Volants
- Compte

Pour visiteur :

- Accueil
- Planning
- Essai
- Inscription
- Contact

### Hero accueil

Contenu :

- nom du club
- promesse courte
- CTA principal "Rejoindre le club"
- CTA secondaire "Voir les creneaux"
- prochaine info utile : prochain creneau ouvert ou alerte

Visuel :

- photo sportive lumineuse ou image badminton sobre.
- pas de hero en carte.
- le debut de la section suivante doit etre visible en bas de viewport.

### Planning toolbar

Elements :

- recherche.
- filtres jour, type, niveau, lieu.
- toggle liste/calendrier.
- action export calendrier.

Mobile :

- recherche pleine largeur.
- bouton "Filtres".
- pills horizontales scrollables.

### Slot card

Informations :

- jour + date.
- horaire.
- lieu.
- type.
- niveau conseille.
- places restantes.
- responsable.
- statut.

Actions :

- Reserver ma place.
- Details.
- Ajouter au calendrier.

### Reservation modal

Etapes :

1. Recapitulatif du creneau.
2. Etat places disponibles.
3. Regle d'annulation courte.
4. Consentement affichage nom si necessaire.
5. Confirmation.

Message apres succes :

- "Reservation confirmee."
- "Retrouvez ce creneau dans votre espace."

### Admin shell

Desktop :

- sidebar fixe.
- topbar avec recherche admin et alertes.
- zone principale dense.

Mobile :

- drawer admin.
- tableaux remplaces par cartes ou lignes empilees.

### Data table admin

Elements :

- recherche.
- filtres.
- colonnes essentielles.
- actions ligne en menu.
- selection multiple si utile.
- pagination.

Ne pas surcharger la premiere version.

## 7. Wireframes textuels page par page

### Accueil

```text
[Header sticky]

[Hero plein ecran partiel]
Nom du club
Slogan court
[Rejoindre le club] [Voir les creneaux]
Mini info : Prochain creneau ouvert aujourd'hui 19:30

[Alerte site si active]
Gymnase ferme exceptionnellement vendredi

[Actions rapides]
Carte Planning | Carte Essai | Carte Inscription | Carte Volants

[Prochains creneaux]
Carte creneau x3
[Voir tout le planning]

[Entrainements]
Loisirs | Jeunes | Adultes | Competiteurs

[Stats]
Adherents | Creneaux/semaine | Equipes | Tournois

[Evenements]
Cartes evenements

[Galerie ou vie du club]

[Sponsors]

[Footer]
```

### Planning

```text
[Header]
[Page header]
Titre : Planning des creneaux
Sous-texte : Trouvez le bon moment pour jouer.

[Toolbar sticky sous header]
Recherche
Filtres : Jour, Type, Niveau, Lieu
Toggle Liste / Calendrier

[Vue liste]
Groupe Aujourd'hui
  SlotCard
  SlotCard
Groupe Cette semaine
  SlotCard

[Vue calendrier desktop]
Colonnes jours
Blocs creneaux couleur par type

[Footer ou nav mobile]
```

### Detail creneau

```text
[Header]
[Retour Planning]

[Titre creneau + badge statut]
[Horaire, lieu, niveau, responsable]

[Bloc places]
12/20 inscrits
[Reserver ma place]
[Ajouter au calendrier]

[Regles]
Annulation possible jusqu'a X heures avant.

[Participants]
Affichage selon droits RGPD

[Gymnase]
Adresse, acces, carte/lien itineraire
```

### Reservation

```text
[Header]
[Page header : Reserver un creneau]

[Recherche rapide]
Aujourd'hui / Demain / Cette semaine

[Creneaux disponibles]
SlotCard compacte

[Modal confirmation]
Recap
Places restantes
Regle annulation
[Confirmer]
```

### Volants

```text
[Header]
[Page header]
Titre : Commander des volants
Sous-texte : Reserve ton tube, paiement sur place.

[Toolbar]
Recherche modele
Filtres : disponible, prix, marque

[Grille produits]
ProductCard
  marque/modele
  prix
  stock
  stepper quantite
  [Reserver]

[Mes commandes recentes si connecte]
Order rows/cards
```

### Inscription

```text
[Header]
[Hero inscription compact]
S'inscrire au club
[S'inscrire sur la FFBaD]

[Etapes]
1. Choisir sa categorie
2. Completer FFBaD
3. Transmettre les documents
4. Recevoir confirmation

[Tarifs]
Cartes Jeunes / Adultes / Loisirs / Competiteurs

[Documents]
Liste telechargements

[FAQ inscription]

[Contact responsable]
```

### Classements

```text
[Header]
[Page header]
Classements du club
Date de mise a jour

[Toolbar]
Recherche joueur
Filtres categorie, niveau, equipe

[Desktop table]
Joueur | Categorie | Simple | Double | Mixte | Progression | Equipe

[Mobile cards]
RankingCardMobile

[Note confidentialite]
Affichage limite selon les preferences des adherents.
```

### Equipes

```text
[Header]
[Page header]
Equipes et competitions

[Filtres saison/equipe]

[Cartes equipes]
Nom, niveau, capitaine, prochaine rencontre

[Resultats recents]

[Liens officiels]
```

### Actualites

```text
[Header]
[Page header]
Actualites du club

[Filtres categories]
Toutes | Fermetures | Tournois | Stages | Resultats | Benevoles

[Grille articles]
NewsCard

[Pagination ou charger plus]
```

### Le club

```text
[Header]
[Page header]
Le club

[Histoire courte]

[Valeurs]
Cartes simples

[Bureau et entraineurs]
Profils

[Gymnases]
VenueCard avec adresse et acces

[Horaires]

[Sponsors]
```

### Contact

```text
[Header]
[Page header]
Contact

[Formulaire]
Type de demande
Nom
Email
Sujet
Message
[Envoyer]

[Coordonnees utiles]
Inscription, competition, reservation, volants
```

### Venir essayer

```text
[Header]
[Hero compact]
Venir essayer le badminton
[Demander un creneau d'essai]

[Comment ca marche]
3 etapes

[Creneaux conseilles debutants]
SlotCard

[Materiel necessaire]

[Formulaire demande essai]
```

## 8. Wireframes espace adherent

### Compte

```text
[MemberShell]

[Bonjour Prenom]
[Prochaine reservation]
Date, horaire, lieu
[Voir details] [Annuler]

[Actions rapides]
Reserver | Commander des volants | Mon profil

[Mes commandes volants]
Statut commande

[Notifications]

[Documents utiles]
```

### Mes reservations

```text
[MemberShell]
[Tabs : A venir | Historique | Annulees]

[Liste reservations]
ReservationCard
  creneau
  date
  statut
  action annuler si autorisee

[Empty state]
Aucune reservation a venir.
[Voir les creneaux]
```

### Mon profil

```text
[MemberShell]
[Formulaire]
Prenom
Nom
Pseudo
Telephone
Preference affichage
Consentement email
Consentement affichage participants
[Enregistrer]
```

## 9. Wireframes admin

### Dashboard admin

```text
[AdminShell]
[Topbar]

[Alertes]
Gymnase ferme | Stock faible | Messages nouveaux

[Metrics]
Reservations semaine
Taux remplissage
Commandes a traiter
Adherents actifs

[Actions rapides]
Ajouter creneau
Fermer gymnase
Importer classements
Publier alerte

[Listes courtes]
Creneaux du jour
Commandes a traiter
Messages contact
```

### Admin planning

```text
[AdminShell]
[Page header + Ajouter creneau]

[Toolbar]
Recherche
Filtres : lieu, type, statut, responsable
Vue semaine/liste

[Liste occurrences]
Date | Heure | Type | Lieu | Places | Statut | Actions

[Actions ligne]
Modifier
Annuler cette date
Dupliquer
Voir inscrits
```

### Admin reservations

```text
[AdminShell]
[Toolbar]
Recherche adherent/creneau
Filtres statut/date/lieu

[Table]
Adherent | Creneau | Date | Statut | Source | Actions

[Actions]
Confirmer
Annuler
Forcer inscription
Exporter CSV
```

### Admin volants

```text
[AdminShell]
[Metrics stock]
Stock total | Stock faible | Commandes a payer | Commandes a retirer

[Produits]
Table produits avec stock et prix

[Commandes]
Table commandes avec statut

[Actions]
Ajouter modele
Ajuster stock
Marquer paye
Marquer recupere
```

### Admin classements

```text
[AdminShell]
[Import CSV]
Dropzone
Modele CSV telechargeable
Preview lignes
[Importer]

[Table classements]
Recherche et filtres
Edition manuelle
```

### Admin parametres

```text
[AdminShell]
[Sections]
Identite club
Lien FFBaD
Regles reservation
Affichage RGPD
Alerte site
SEO local
```

## 10. Versions mobiles des ecrans cles

### Accueil mobile

Priorites :

1. voir le nom du club.
2. voir le prochain creneau.
3. rejoindre ou essayer.
4. acceder au planning.

Structure :

```text
[Header compact]
[Hero court]
Nom club
Slogan 1 ligne
[Voir les creneaux]
[Venir essayer]

[Prochain creneau]
Carte pleine largeur

[Actions rapides en grille 2x2]

[Entrainements en cartes horizontales]

[Nav basse]
```

### Planning mobile

Priorites :

1. recherche.
2. filtres rapides.
3. liste lisible.
4. reserver en un tap.

Structure :

```text
[Header compact]
[Titre Planning]
[Recherche]
[Pills scrollables : Aujourd'hui, Demain, Jeunes, Adultes, Ouvert]
[Bouton Filtres]

[Liste par date]
SlotCard pleine largeur
CTA sticky dans carte

[Nav basse]
```

Regle :

- La vue calendrier n'est pas prioritaire sur mobile.
- La liste groupee par date est le mode par defaut.

### Detail creneau mobile

Structure :

```text
[Retour]
[Badge statut]
[Titre]
[Horaire]
[Lieu + itineraire]
[Places restantes]

[CTA sticky bottom : Reserver ma place]

[Regles annulation]
[Participants si autorise]
[Gymnase]
```

### Reservation mobile

Objectif : 30 secondes.

Structure :

```text
[Bottom sheet]
Creneau selectionne
Date + horaire
Lieu
Places restantes
Regle annulation
[Confirmer ma reservation]
```

Apres confirmation :

```text
[Succes]
Reservation confirmee
[Voir mes reservations]
[Retour au planning]
```

### Volants mobile

Structure :

```text
[Header]
[Titre Volants]
[Recherche]

[ProductCard pleine largeur]
Prix
Stock
Stepper quantite
[Reserver]

[Mes commandes]
```

### Compte mobile

Structure :

```text
[Bonjour Prenom]
[Prochaine reservation]
[Reserver un creneau]

[Commandes volants]
[Notifications]
[Profil]

[Nav basse]
```

### Admin mobile

Objectif :

- permettre les urgences, pas remplacer un grand ecran pour toute l'administration.

Actions prioritaires :

- fermer un gymnase.
- annuler un creneau.
- voir inscrits.
- marquer commande payee/recuperee.
- publier alerte.

Structure :

```text
[Admin header]
[Alertes]
[Actions rapides]
[Listes du jour]
[Drawer admin]
```

## 11. Micro-interactions

### General

- Hover carte : translation `-2px`, bordure accent douce, ombre legere.
- Bouton primary hover : fond accent fonce.
- Focus clavier : anneau 2px vert/bleu tres visible.
- Filtres selectionnes : fond accent doux + coche.
- Tabs : underline ou fond doux, transition 150ms.
- Drawer : slide 180ms ease-out.
- Modal : fade + scale 98% vers 100%.
- Toast : slide depuis bas sur mobile, haut droit desktop.

### Planning

- Quand un filtre est applique, compteur "12 creneaux".
- Changement liste/calendrier : transition courte, pas d'effet spectaculaire.
- Reservation en cours : bouton loading avec texte "Reservation...".
- Reservation confirmee : carte passe brièvement en contour vert.
- Creneau complet : CTA remplace par "Complet" ou "Liste d'attente" en V2.

### Volants

- Stepper quantite : feedback immediat sur total.
- Stock faible : badge orange.
- Commande confirmee : toast + lien "Voir ma commande".

### Admin

- Sauvegarde auto uniquement si tres fiable. Sinon bouton explicite.
- Ligne modifiee : highlight doux temporaire.
- Action destructive : confirmation concise.
- Import CSV : preview avant validation.

## 12. Etats vides

### Planning sans resultat

Titre :

- "Aucun creneau trouve"

Texte :

- "Essayez de retirer un filtre ou de choisir une autre date."

Action :

- "Reinitialiser les filtres"

### Aucun creneau ouvert

Titre :

- "Aucun creneau ouvert pour le moment"

Texte :

- "Le club mettra les prochaines disponibilites en ligne des qu'elles seront confirmees."

Action :

- "Contacter le club"

### Mes reservations vide

Titre :

- "Aucune reservation a venir"

Texte :

- "Choisissez un creneau et reservez votre place en quelques secondes."

Action :

- "Voir les creneaux"

### Volants sans stock

Titre :

- "Plus de volants disponibles"

Texte :

- "Un responsable remettra le stock a jour prochainement."

Action :

- "Me prevenir" en V2, "Contacter le club" en MVP.

### Classements vides

Titre :

- "Classements en attente"

Texte :

- "Les classements seront affiches apres import par le club."

Action admin :

- "Importer un CSV"

### Admin sans donnees

Exemple planning :

- "Aucun creneau cree"
- "Ajoutez le premier creneau regulier du club."
- CTA : "Creer un creneau"

## 13. Etats chargement

### Principes

- Preferer des skeletons aux spinners pleine page.
- Garder la structure visible.
- Montrer les filtres rapidement.
- Eviter les sauts de layout.

### Skeletons

Planning :

- barre recherche skeleton.
- pills skeleton.
- 4 cartes creneaux skeleton.

Carte creneau :

- badge skeleton.
- titre skeleton.
- 3 lignes metadata.
- bouton skeleton.

Admin table :

- header visible.
- lignes skeleton.
- pagination skeleton.

Compte :

- carte prochaine reservation skeleton.
- actions rapides skeleton.
- liste notifications skeleton.

### Loading actions

Boutons :

- texte specifique : "Reservation...", "Annulation...", "Import..."
- bouton desactive pendant mutation.
- ne pas bloquer toute la page si l'action est locale.

## 14. Etats erreur

### Erreurs formulaire

Regles :

- message sous champ.
- resume d'erreur en haut si plusieurs erreurs.
- focus sur premier champ en erreur.

Exemples :

- "Indiquez une adresse email valide."
- "Choisissez une quantite disponible."
- "Ce champ est obligatoire."

### Erreur reservation

Cas :

- complet entre temps.
- quota atteint.
- creneau annule.
- annulation trop tardive.
- session expiree.

Messages :

- "Ce creneau vient d'etre complet."
- "Vous avez atteint votre limite de reservations actives."
- "Ce creneau a ete annule par le club."
- "L'annulation n'est plus possible en ligne. Contactez le responsable."
- "Reconnectez-vous pour reserver."

Actions :

- "Voir les autres creneaux"
- "Contacter le club"
- "Se reconnecter"

### Erreur admin

Messages :

- "Impossible d'enregistrer cette modification."
- "Le fichier CSV contient des lignes invalides."
- "Vous n'avez pas les droits pour cette action."

Toujours proposer :

- correction possible.
- retour a l'etat precedent.
- detail technique seulement si admin technique.

### Page 404

Titre :

- "Page introuvable"

Texte :

- "Cette page n'existe pas ou a ete deplacee."

Actions :

- "Retour a l'accueil"
- "Voir les creneaux"

### Page 500

Titre :

- "Une erreur est survenue"

Texte :

- "Rechargez la page ou reessayez dans quelques instants."

Action :

- "Recharger"

## 15. Recommandations accessibilite

### Navigation

- Navigation clavier complete.
- Focus visible sur tous les elements interactifs.
- Skip link vers contenu principal.
- Header et nav avec landmarks.
- Drawer mobile piege le focus pendant ouverture.

### Couleurs

- Contraste texte normal minimum WCAG AA.
- Ne pas utiliser uniquement la couleur pour distinguer statut.
- Chaque badge combine couleur + texte.
- Rouge reserve aux actions destructives et erreurs.

### Formulaires

- Label visible pour chaque champ.
- `aria-describedby` pour aides et erreurs.
- Champs requis clairement signales.
- Messages d'erreur comprehensibles.
- Confirmation avant action destructive.

### Modales et toasts

- Modales avec titre accessible.
- Fermeture clavier possible.
- Toasts non essentiels, avec information aussi visible dans la page si critique.
- Les toasts ne doivent pas contenir la seule preuve d'une action importante.

### Planning

- Vue calendrier accompagnee d'une vue liste accessible.
- Les blocs de creneaux ont un titre lisible par lecteur d'ecran.
- Les statuts sont exposes en texte.
- Les boutons indiquent l'action et le creneau si necessaire.

### Tables admin

- Headers de colonnes explicites.
- Actions ligne avec aria-label.
- Filtres utilisables au clavier.
- Pagination claire.
- Version mobile en cartes si table trop large.

### Mobile

- Cibles tactiles 44px minimum.
- CTA sticky sans masquer le contenu.
- Pas de texte tronque sur les actions critiques.
- Filtres horizontaux scrollables accessibles.

## 16. Recommandations visuelles par page

### Pages publiques

- Une page = une intention claire.
- Titre court.
- CTA visible au-dessus du pli.
- Sections larges non encapsulees dans des cartes.
- Cartes uniquement pour contenus repetes.

### Espace adherent

- Prioriser le prochain creneau.
- Ne jamais cacher "Annuler" trop profondement.
- Montrer les regles utiles au moment de l'action.
- Eviter les tableaux sur mobile.

### Admin

- Densite plus forte que public.
- Moins d'ornement.
- Actions rapides en haut.
- Filtres persistants.
- Statuts visibles.
- Journalisation non intrusive.

## 17. Iconographie

Utiliser lucide-react ou une bibliotheque coherente.

Icones recommandees :

- calendrier : planning
- clock : horaires
- map-pin : gymnase
- users : participants
- trophy : competition
- medal : classements
- shopping-bag : volants
- bell : notifications
- alert-triangle : alerte
- file-text : documents
- settings : admin
- shield : roles/securite
- search : recherche
- filter : filtres
- plus : ajouter
- check : confirme
- x : annuler

Regles :

- Icone + texte pour actions importantes.
- Icone seule uniquement pour actions evidentes avec tooltip.
- Taille standard 18px ou 20px.

## 18. Contenu et hierarchie

### Regle de priorite

Chaque ecran doit repondre a une question :

- Accueil : "Est-ce que ce club me correspond ?"
- Planning : "Quand puis-je jouer ?"
- Detail : "Puis-je reserver ce creneau ?"
- Volants : "Que puis-je commander ?"
- Compte : "Quelle est ma prochaine action ?"
- Admin : "Qu'est-ce qui demande mon attention ?"

### Redaction UI

Boutons :

- verbe + objet.
- 2 a 4 mots.
- pas de jargon.

Descriptions :

- une phrase courte.
- orientee action.

Exemples :

- "Reserver ma place"
- "Voir les inscrits"
- "Marquer comme paye"
- "Importer les classements"
- "Publier l'alerte"

## 19. Checklist avant implementation

- Valider le nom du club et la ville.
- Choisir la couleur d'accent finale.
- Recuperer ou produire 3 a 6 visuels badminton lumineux.
- Valider les libelles de navigation.
- Decider si nav basse mobile est active pour tous ou seulement connectes.
- Valider les statuts exacts des creneaux.
- Valider les preferences RGPD par defaut.
- Valider les actions admin MVP.
- Preparer le modele CSV classements.

