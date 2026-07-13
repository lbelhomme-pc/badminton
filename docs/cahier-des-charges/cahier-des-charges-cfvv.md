# Cahier des charges CFVV

> Conversion Markdown générée depuis `cahier-des-charges-cfvv-v0.1.docx`. Les images intégrées au Word sont conservées séparément dans `docs/cahier-des-charges/photos-reference/` et ne sont pas insérées dans ce fichier Markdown.

| CAHIER DES CHARGES | VERSION 0.1 |
| --- | --- |

SITE WEB DU CLUB

Site public + espace adhérents

Cadrage fonctionnel, graphique, technique et organisationnel

| 01INFORMERCréneaux, agenda, bureau, inscriptions et accès | 02FIDÉLISEREspace personnel, réservations et informations membres | 03DÉVELOPPERPartenaires, visibilité locale et gestion simplifiée |
| --- | --- | --- |

## 1. Synthèse et positionnement du projet

Le projet ne se limite pas à un site vitrine. Il associe une présence publique destinée aux futurs licenciés, familles, partenaires et collectivités, et une application de service réservée aux adhérents. Le cahier des charges sépare donc clairement les contenus publics, les fonctions authentifiées et l'administration.

- Donner une image moderne, locale et cohérente avec le nouveau logo du CFVV.
- Permettre à un visiteur de trouver les créneaux, le lieu, les modalités d'essai et le contact en moins de trois clics.
- Centraliser l'agenda, les fermetures exceptionnelles et les informations utiles aux licenciés.
- Permettre aux adhérents de réserver les créneaux concernés, en particulier les mercredis et vendredis.
- Faciliter l'achat de boîtes de volants via HelloAsso sans stocker de données bancaires sur le site du club.
- Valoriser les partenaires et proposer un parcours clair pour devenir sponsor.
- Réduire les tâches manuelles du bureau grâce à un back-office simple, documenté et transmissible.
## 2. Publics et parcours utilisateurs

La conception doit partir des tâches réellement accomplies, et non d'une accumulation de pages. Chaque profil dispose d'un accès, d'objectifs et d'un niveau de confidentialité différents.

| Profil | Accès | Besoins principaux |
| --- | --- | --- |
| Visiteur / futur licencié | Public | Comprendre l’offre, trouver un créneau, connaître le tarif, demander un essai ou s’inscrire. |
| Parent ou représentant légal | Public | Identifier le créneau adapté, recevoir les informations utiles. |
| Adhérent actif | Authentifié | Réserver un créneau, commander des volants, accéder aux documents. |
| Membre du bureau / éditeur | Back-office | Mettre à jour pages, agenda, créneaux, partenaires et communications. |
| Administrateur technique | Back-office sensible | Gérer comptes, rôles, sauvegardes, sécurité, intégrations et incidents. |
| Partenaire / sponsor | Public | Comprendre la visibilité proposée, consulter les partenaires existants et prendre contact. |

### 2.1 Parcours clés à rendre fluides

| Parcours | Étapes | Critère de réussite |
| --- | --- | --- |
| J1 - Découvrir | Accueil > Créneaux > Détail du créneau > Demander un essai / S’inscrire | ≤ 3 clics depuis l’accueil |
| J2 - Réserver | Connexion > Tableau de bord > Choisir mercredi/vendredi > Confirmer | Confirmation immédiate |
| J3 - Commander | Espace adhérent > Boutique volants > Produit > Paiement HelloAsso | Aucune donnée bancaire gérée par le CFVV |
| J4 - Publier | Back-office > Nouvel événement > Publier > Affichage agenda et accueil | Sans intervention technique |
| J5 - Partenariat | Partenaires > Devenir partenaire > Formulaire / dossier | Contact qualifié et consentement RGPD |

## 3. Arborescence et navigation

La navigation principale doit rester courte. Les informations secondaires sont regroupées dans « Le Club » et dans le pied de page. Sur mobile, le menu doit être entièrement utilisable au clavier et au toucher.

| Entrée principale | Visibilité | Finalité |
| --- | --- | --- |
| Accueil | Public | Résumé du club, appels à l’action, prochains événements, partenaires. |
| Créneaux | Public | Horaires, publics, niveaux, lieux, fermetures et essai. |
| Le Bureau | Public | Équipe dirigeante, rôles, contacts génériques et fonctionnement. |
| Agenda | Public | Événements, compétitions, stages, réunions, fermetures. |
| Le Club | Public | Présentation, valeurs, histoire, catégories, tarifs, inscriptions, équipements, FAQ. |
| Partenaires | Public | Logos, présentation, avantages, devenir partenaire. |
| Contact | Public | Coordonnées, formulaire, accès, réseaux sociaux. |
| Espace adhérent | Authentifié | Tableau de bord, réservations, boutique, documents, profil. |

### 3.1 Navigation secondaire et pied de page

| Groupe | Liens |
| --- | --- |
| Le Club | Tarifs et inscriptions, lieux, catégories, règlement intérieur, FAQ. |
| Informations légales | Mentions légales, politique de confidentialité, gestion des cookies, accessibilité. |
| Liens utiles | FFBaD, ligue/comité, HelloAsso, réseaux sociaux, mairie ou équipements. |
| Contact | Adresse générique, téléphone du club si validé, formulaire, plan d’accès. |

## 4. Spécifications fonctionnelles du site public

### 4.1 En-tête global

- Logo horizontal du CFVV, menu principal, bouton « Espace adhérent » et raccourci « Nous rejoindre ».
- Sur mobile : menu hamburger explicite, zone de clic minimale confortable, fermeture par touche Échap et focus clavier maîtrisé.
- Aucun carrousel automatique dans l'en-tête ou le bandeau principal.
- Le bouton de connexion change d'état après authentification : avatar ou initiales + accès au tableau de bord.
### 4.2 Page d’accueil - ordre recommandé des blocs

| Ordre | Bloc | Contenu attendu |
| --- | --- | --- |
| 1 | Bandeau principal | Photo locale de badminton, promesse courte, boutons « Voir les créneaux » et « Rejoindre le club ». |
| 2 | Accès rapides | Créneaux, agenda, espace adhérent ; trois cartes maximum. |
| 3 | Prochains rendez-vous | Trois événements à venir, date, catégorie, lieu, lien détail. |
| 4 | Le club en bref | Valeurs, pratique loisir/compétition, jeunes/adultes, chiffres uniquement s’ils sont vérifiés. |
| 5 | Actualités / temps forts | Articles administrables ou sélection manuelle de publications ; pas d’intégration sociale bloquante. |
| 6 | Partenaires | Logos avec texte alternatif, lien, niveau de partenariat et appel « Devenir partenaire ». |
| 7 | Contact et accès | Adresse du gymnase, carte avec alternative textuelle, moyens de contact. |

### 4.3 Page « Créneaux »

- Affichage en cartes et/ou tableau, lisible sur mobile sans défilement horizontal obligatoire.
- Filtres : public ou catégorie, niveau, jour, type de pratique, lieu.
- Pour chaque créneau : jour, horaire, public, niveau, type, encadrant si pertinent, lieu, période de validité, statut.
- Statuts visibles : habituel, modifié, fermé exceptionnellement, vacances scolaires, complet si le club souhaite afficher cette information.
- Boutons contextuels : « Demander un essai », « S’inscrire » ou « Réserver » pour un adhérent connecté.
- Lien vers le plan d'accès et informations pratiques du gymnase.
### 4.4 Page « Le Bureau »

- Présentation des fonctions : présidence, vice-présidence, secrétariat, trésorerie, communication, responsables sportifs et autres rôles utiles.
- Photo, prénom/nom, fonction et courte présentation, après validation du droit à l'image.
- Contacts génériques par fonction de préférence aux adresses personnelles.
- Possibilité d'afficher les commissions ou référents sans exposer de coordonnées privées.
- Mise à jour simple après assemblée générale ou changement de bureau.
### 4.5 Page « Agenda »

| Rubrique | Exigence |
| --- | --- |
| Affichages | Liste chronologique par défaut + vue calendrier optionnelle. |
| Filtres | Compétitions, événements club, réunions, fermetures. |
| Fiche événement | Titre, date/heure, lieu, public, description, image, contact, lien externe, pièce jointe. |
| Actions | Ajouter à son agenda au format iCal, partager, s’inscrire ou réserver si applicable. |
| Administration | Création, duplication, brouillon, publication programmée, annulation avec message. |
| Accueil | Remontée automatique des trois prochains événements publiés. |

### 4.6 « Le Club », inscriptions, partenaires et contact

| Page / bloc | Contenu |
| --- | --- |
| Présentation | Valeurs, histoire, projet associatif, pratique loisir et compétition, publics accueillis. |
| Tarifs / inscriptions | Tarifs par catégorie, pièces demandées, procédure, lien FFbad, aides acceptées. |
| Lieux | Adresse, accès, stationnement, transports, accessibilité du gymnase, photos utiles. |
| FAQ | Séance d’essai, matériel, tenue, licence, certificats/questionnaire santé, vacances, compétitions. |
| Partenaires | Logo, description, lien, niveau de partenariat, dates de visibilité, appel à partenariat. |
| Contact | Formulaire avec objet, coordonnées génériques, délai de réponse indicatif, anti-spam non bloquant. |

## 5. Spécifications de l’espace adhérents

L'espace adhérents doit être conçu comme un service sécurisé, simple et rapide. Les fonctions de réservation et d'achat doivent être utilisables en moins d'une minute depuis un téléphone.

### 5.1 Accès, activation et rôles

| Fonction | Règle fonctionnelle |
| --- | --- |
| Activation | Invitation personnelle envoyée par le club avec lien ou code à usage unique. |
| Identifiant | Numéro de licence |
| Mot de passe | Créé par l’utilisateur, réinitialisable, jamais partagé ni communiqué en clair par le club. |
| Statut saison | Actif, en attente, suspendu, non renouvelé ; désactivation sans suppression immédiate. |
| Rôles | Adhérent, encadrant, éditeur, administrateur ; principe du moindre privilège. |
| Administration | Import CSV, invitation en masse, relance, désactivation, export et journal des actions sensibles. |

### 5.2 Tableau de bord adhérent

- Prochaine réservation avec bouton d'annulation si le délai l'autorise.
- Créneaux ouverts à la réservation pour les mercredis et vendredis.
- Prochains événements du club et messages prioritaires du bureau.
- Accès à la boutique de volants, aux documents (type CR reunion bureau…) et au profil.
- Affichage personnalisé pour le membre connecté.
### 5.3 Réservation des créneaux

Le module doit gérer des créneaux récurrents et leurs exceptions. Les règles sont paramétrées par le bureau sans modification du code.

| Paramètre | Comportement attendu |
| --- | --- |
| Jours concernés | Mercredi et vendredi au lancement ; extensible à d’autres jours. |
| Ouverture | N jours avant le créneau, à une heure configurable. |
| Fermeture | À l’heure du créneau ou selon une limite définie. |
| Annulation | Autorisée jusqu’à N heures avant ; règle clairement affichée. |
| Fermeture exceptionnelle | Annulation par l’administrateur avec notification de tous les inscrits. |

### 5.4 Cycle de réservation

| Étape | Comportement |
| --- | --- |
| 1 | L’adhérent sélectionne une date. |
| 2 | La réservation est enregistrée de manière atomique. |
| 3 | Un écran confirme la reservation et la date |
| 4 | Annulation possible |
| 5 | Le bureau consultent ou exportent la liste nominative. |

### 5.5 Achat de boîtes de volants avec HelloAsso

La solution recommandée au lancement consiste à présenter les produits dans l'espace adhérent puis à rediriger vers une boutique HelloAsso dédiée, ou à intégrer le formulaire officiel lorsque cela est compatible avec la confidentialité et l'accessibilité. HelloAsso gère le paiement ; le site du club ne stocke aucune donnée de carte bancaire.

| Niveau | Solution | Conséquences |
| --- | --- | --- |
| MVP recommandé | Boutique HelloAsso hébergée | Mise en œuvre rapide, gestion des paiements et commandes dans HelloAsso, lien ou intégration depuis l’espace adhérent. |
| Option intermédiaire | WooCommerce + paiement HelloAsso | Catalogue et stock gérés dans le site, paiement via le connecteur officiel ; maintenance plus importante. |
| Option avancée | HelloAsso Checkout par API | Parcours très intégré et synchronisation sur mesure ; développement, tests et supervision supplémentaires. |

- Produits : référence, marque, type, quantité par boîte, prix, disponibilité, limite par commande, photo.
- Retrait : lieu, créneau ou personne de contact ; pas d'expédition.
- Confirmation : numéro de commande HelloAsso, récapitulatif, modalités de retrait.
- Stock : ne pas afficher un stock en temps réel si aucune synchronisation fiable n'est prévue ; utiliser « disponible / indisponible » ou gérer le stock dans un seul outil.
- Accès : boutique réservée aux adhérents comme les tarifs sont internes au club.
### 5.6 Documents et informations réservés

- Règlement intérieur, documents de saison, comptes rendus d'assemblée générale, contacts utiles, documents d'équipes.
- Droits de lecture par rôle ou groupe ; ne pas mettre en ligne de données sensibles inutiles.
- Date de mise à jour, auteur et version visibles sur chaque document.
- Téléchargements journalisés uniquement si nécessaire ; durée de conservation définie.
## 6. Back-office, contenus et données

Le back-office doit pouvoir être repris par un nouveau bureau. La simplicité d'administration, la documentation et la séparation des rôles sont des critères de choix aussi importants que l'apparence du site.

Tous les éléments peuvent être éditable.

### 6.1 Fonctions de gestion obligatoires

- Brouillon, prévisualisation, publication, dépublication et programmation.
- Historique ou journal des actions sensibles : comptes, réservations, capacités, annulations, rôles.
- Import et export CSV des adhérents et réservations avec contrôle des doublons.
- Envoi de courriels transactionnels et, si prévu, notifications ciblées par créneau ou groupe.
- Duplication d'événements et génération de sessions récurrentes avec exceptions.
- Gestion des médias avec texte alternatif obligatoire et compression automatique.
- Corbeille ou restauration avant suppression définitive.
- Tableau de bord : sessions à venir, remplissage, comptes en attente, événements, erreurs d'envoi.
## 7. Direction artistique et système d’interface

L'interface doit traduire l'énergie du badminton et l'ancrage vendômois tout en restant sobre, lisible et pérenne. Les traits de pinceau du logo peuvent inspirer les séparateurs et accents, sans devenir un décor omniprésent.

### 7.1 Palette

| Turquoise officiel0C8A9CAccents, surfaces, grands titres | Anthracite officiel1D1D1FTextes, navigation, fonds | Blanc officielFFFFFFRespiration, fonds | Turquoise fonctionnel*0B7F90Boutons et petits textes |
| --- | --- | --- | --- |

* Nuance fonctionnelle proposée à valider. Le turquoise officiel présente un contraste insuffisant pour certains petits textes blancs ou turquoise sur fond blanc ; une nuance plus sombre doit être utilisée pour les composants concernés.

### 7.2 Typographie

- Police identitaire : Rajdhani, graisses Bold, SemiBold et Regular, conformément à la charte.
- Recommandation web : Rajdhani pour titres, navigation et boutons ; Rajdhani Regular ou une police système très lisible pour les textes longs, après test.
- Police hébergée localement sur le serveur afin de limiter les dépendances et les traceurs tiers.
- Taille de base minimale recommandée : 16 px, interlignage généreux, lignes de texte limitées en largeur.
### 7.3 Usages des logos

| En-tête du site | Favicon et mobile | Réseaux sociaux |
| --- | --- | --- |

- Respecter la zone de protection et ne jamais déformer, incliner, recolorer ou ajouter d'ombre au logo.
- Utiliser la version blanche sur fond sombre et la version noire/monochrome pour les contraintes d'impression ou de contraste.
- Prévoir les fichiers favicon, icône d'application, image de partage social et logo de courriel.
- Conserver un équivalent textuel « Club des Fous du Volant du Vendômois » pour l'accessibilité.
### 7.4 Composants d’interface

| Composant | Règle |
| --- | --- |
| Boutons | Primaire sombre/turquoise accessible, secondaire contour, état focus, chargement, désactivé. |
| Cartes | Événement, créneau, partenaire, actualité ; hiérarchie constante et zone cliquable claire. |
| Badges | Ouvert, complet, liste d’attente, fermé, nouveau ; texte + icône, jamais couleur seule. |
| Tableaux horaires | Version mobile en cartes ou lignes empilées ; en-têtes explicites. |
| Formulaires | Libellés visibles, aide, erreurs proches du champ, récapitulatif avant action sensible. |
| Notifications | Succès, information, avertissement, erreur ; messages compréhensibles et non éphémères. |
| Photos | Action, convivialité, mixité des publics, lieux identifiables ; droits d’image documentés. |

### 7.5 Direction photographique

- Privilégier des photos réelles du club, nettes et lumineuses, montrant le jeu, l'accueil et les bénévoles.
- Prévoir des cadrages horizontaux pour les bandeaux et verticaux/carrés pour les cartes.
- Éviter les banques d'images génériques si des photos locales de qualité sont disponibles.
- Ne pas intégrer du texte essentiel directement dans les images.
## 8. Sécurité, RGPD, accessibilité et qualité

### 8.1 Sécurité des comptes et des données

- Comptes individuels ; interdiction des identifiants partagés.
- Mots de passe robustes, stockage avec algorithme de hachage adapté, réinitialisation sécurisée et limitation des tentatives.
- Authentification multifacteur obligatoire pour les administrateurs et recommandée pour les responsables sensibles.
- Principe du moindre privilège et revue des droits à chaque changement de bureau.
- Protection CSRF, validation côté serveur, requêtes paramétrées, téléversements contrôlés et en-têtes de sécurité.
- Journal des connexions et actions sensibles avec accès restreint et durée de conservation limitée.
- Plan de gestion des incidents : contact, qualification, restauration, information et obligations de notification.
### 8.2 RGPD et vie privée

| Sujet | Exigence |
| --- | --- |
| Responsable de traitement | Identifier l’association, le contact RGPD et les personnes habilitées. |
| Finalités | Gestion des adhérents, réservations, commandes, communications et administration. |
| Minimisation | Collecter uniquement les données nécessaires ; exclure les données médicales non indispensables. |
| Information | Mentions claires sur chaque formulaire et politique de confidentialité complète. |
| Droits | Accès, rectification, effacement, limitation et opposition via un contact simple. |
| Conservation | Définir des durées par type de donnée, puis archiver ou supprimer. |
| Sous-traitants | Contrats et localisation pour hébergeur, courriel, analytics, prestataire et outils. |
| Mineurs | Compte ou rattachement géré par le représentant légal selon l’organisation retenue. |
| Images | Droits à l’image documentés, notamment pour les mineurs. |

### 8.3 Cookies et services tiers

- Aucun bandeau de consentement inutile si seuls des traceurs strictement nécessaires sont utilisés.
- Consentement préalable pour les traceurs non essentiels et possibilité de refuser aussi facilement que d'accepter.
- Blocage des cartes, vidéos, flux sociaux ou statistiques non exemptés avant consentement.
- Page de gestion des préférences accessible à tout moment.
- Journalisation du consentement uniquement dans la mesure nécessaire.
### 8.4 Accessibilité

- Objectif de conformité : WCAG 2.2 niveau AA, avec vérification inspirée du RGAA en vigueur au moment de la recette.
- Navigation complète au clavier, focus visible, ordre logique et lien d'évitement.
- Contrastes suffisants, taille de texte adaptable, information non transmise par la seule couleur.
- Titres hiérarchisés, régions de page, tableaux structurés et formulaires correctement étiquetés.
- Alternatives textuelles pour logos, photos utiles et icônes ; images décoratives ignorées par les aides techniques.
- Messages d'erreur identifiables et associés aux champs ; confirmation avant suppression ou annulation sensible.
- Réduction ou désactivation des animations selon la préférence système.
### 8.5 SEO local, performance et mesure

| Domaine | Exigence |
| --- | --- |
| SEO | Titres et descriptions uniques, URLs lisibles, sitemap, redirections, données structurées Organisation/SportsActivityLocation/Event. |
| Local | Contenus ciblant Vendôme et le Vendômois, adresse cohérente, liens vers annuaires et partenaires locaux. |
| Performance | Pages légères, images adaptées, polices locales, cache, scripts tiers limités ; objectifs mesurés avant mise en ligne. |
| Partage | Images et métadonnées Open Graph cohérentes avec la charte. |
| Analytics | Tableau de bord simple : pages vues, parcours, clics vers inscription/HelloAsso, sans profilage superflu. |

---

Images extraites du document Word : 5 fichier(s) dans docs/cahier-des-charges/photos-reference/.
