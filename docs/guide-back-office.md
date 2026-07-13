# Guide back-office CFVV

Ce guide explique les opérations courantes du site CFVV pour un membre du bureau. L'objectif est de pouvoir reprendre l'administration sans connaître le code.

## 1. Accéder au back-office

1. Se connecter au site.
2. Ouvrir `Admin`.
3. Vérifier le bloc de diagnostic sur la page d'accueil admin.
4. Si le rôle vient d'être modifié, cliquer sur `Rafraîchir le profil`.

Les gestionnaires voient les modules opérationnels. Les administrateurs voient aussi les membres, les rôles, les tarifs et les paramètres sensibles.

## 2. Tableau de bord du bureau

La page `Admin > Vue d'ensemble` sert de point de départ.

Elle affiche :

- réservations ;
- créneaux ;
- actualités ;
- documents ;
- brouillons ;
- volants ;
- adhérents et tarifs pour les administrateurs.

Si une donnée ne s'affiche pas, vérifier d'abord les droits du compte et la configuration Supabase.

## 3. Actualités et messages

Aller dans `Admin > Actualités`.

Opérations habituelles :

1. Créer une actualité.
2. Choisir si elle est publique ou interne.
3. Ajouter éventuellement une image ou un lien.
4. Enregistrer.

Bonne pratique :

- garder un titre court ;
- utiliser un lien clair ;
- ne pas publier d'information personnelle inutile ;
- dépublier ou archiver les informations obsolètes dès que possible.

## 4. Créneaux, réservations et fermetures

Aller dans `Admin > Créneaux`.

Pour créer ou modifier un créneau :

1. Renseigner jour, horaires, gymnase, public et niveau.
2. Définir la capacité si elle est réellement suivie.
3. Activer la réservation uniquement pour les créneaux concernés.
4. Définir ouverture, fermeture et délai d'annulation.
5. Ajouter un message adhérent si besoin.

Pour fermer une date :

1. Choisir le créneau.
2. Renseigner la date concernée.
3. Indiquer le motif.
4. Confirmer.

La fermeture conserve l'historique et annule les réservations concernées selon la règle Supabase.

## 5. Réservations

Aller dans `Admin > Réservations`.

Actions disponibles :

- filtrer par date ;
- filtrer par statut ;
- modifier le statut ;
- exporter en CSV.

Avant d'annuler ou refuser une réservation, vérifier que l'adhérent a bien été prévenu si nécessaire.

## 6. Adhérents et rôles

Aller dans `Admin > Membres`.

Seuls les administrateurs peuvent gérer les rôles.

Rôles :

- `Adhérent` : espace personnel, réservations, documents.
- `Gestionnaire` : créneaux, réservations, actualités, volants, documents.
- `Admin` : membres, rôles, tarifs, paramètres sensibles.
- `Super admin` : accès technique exceptionnel.

Ne pas modifier son propre rôle depuis l'interface. Cela évite de perdre l'accès.

## 7. Import CSV adhérents

Format recommandé :

```csv
email;prenom;nom;licence_ffbad;role
alice@example.fr;Alice;Dupont;123456;member
```

Contrôles à faire avant import :

- colonnes obligatoires : `email`, `prenom`, `nom` ;
- email valide ;
- doublons dans le fichier ;
- doublons avec les adhérents existants ;
- rôle correct.

L'import en masse doit rester réservé aux administrateurs.

## 8. Invitations

Pour inviter un adhérent :

1. Vérifier son email.
2. Créer une invitation.
3. Envoyer le lien ou le code à usage unique.
4. Relancer si le lien expire.

Ne jamais envoyer un mot de passe en clair.

## 9. Boutique volants

Aller dans `Admin > Volants`.

Pour chaque produit :

1. Renseigner marque, modèle, type et prix indicatif.
2. Ajouter la référence interne.
3. Indiquer disponibilité et limite par commande.
4. Ajouter le lien HelloAsso officiel.
5. Décrire le retrait.

Le paiement se fait sur HelloAsso. Le site CFVV ne stocke aucune donnée bancaire.

## 10. Documents privés

Aller dans `Admin > Documents`.

Pour ajouter un document :

1. Renseigner titre, catégorie, auteur et version.
2. Choisir le fichier.
3. Choisir les rôles autorisés.
4. Enregistrer en brouillon ou publier.

Statuts :

- `brouillon` : non visible par les adhérents ;
- `publié` : visible aux rôles autorisés ;
- `archivé` : retiré de l'espace adhérent.

Suppression :

1. Archiver d'abord.
2. Supprimer définitivement seulement si le document ne doit plus être conservé.

Les fichiers privés ne doivent jamais être placés dans `public/`.

## 11. Médias

Règles :

- utiliser JPEG, PNG ou PDF selon le besoin ;
- éviter les fichiers lourds ;
- renseigner un texte alternatif pour une image informative ;
- ne pas publier de photo de mineur sans validation du droit à l'image ;
- vérifier où une image est utilisée avant suppression.

## 12. Actions sensibles

Toujours demander confirmation avant :

- suppression ;
- archivage massif ;
- changement de rôle ;
- fermeture exceptionnelle ;
- import CSV ;
- publication d'un document interne.

Les journaux d'actions sensibles sont réservés aux personnes autorisées.

## 13. Ce qui nécessite encore un service externe

- Envoi automatique d'emails transactionnels.
- Notifications de fermeture de créneau.
- Paiement HelloAsso et confirmation de paiement.
- Compression automatique avancée des médias.
- Analyse d'audience sans profilage.
