# Boutique HelloAsso et documents privés CFVV

## Boutique de volants

Le MVP retient le fonctionnement recommandé par le cahier des charges :

- le site présente les produits aux adhérents connectés ;
- chaque produit peut pointer vers une page HelloAsso officielle ;
- le paiement est entièrement réalisé sur HelloAsso ;
- le site CFVV ne collecte ni ne stocke aucun numéro de carte bancaire ;
- le stock affiché sur le site reste indicatif tant qu'il n'existe pas de synchronisation fiable avec HelloAsso.

## Champs produit

Chaque volant peut contenir :

- référence interne ;
- marque ;
- modèle ;
- type ;
- quantité par boîte ;
- prix indicatif ;
- photo ;
- disponibilité ;
- limite par commande ;
- instructions de retrait ;
- lien HelloAsso ;
- identifiant HelloAsso facultatif.

## Informations HelloAsso nécessaires

À fournir par le bureau avant mise en service :

- URL officielle de la boutique ou du formulaire HelloAsso ;
- correspondance entre chaque produit du site et le produit HelloAsso ;
- prix définitifs côté HelloAsso ;
- modalités de retrait ;
- texte de confirmation côté HelloAsso ;
- possibilité ou non d'un retour vers le site après paiement.

## Documents privés

Les documents adhérents sont stockés dans :

- table Supabase : `documents_prives` ;
- bucket privé : `cfvv-private-documents`.

Les fichiers ne doivent pas être mis dans `public/`.

Types autorisés :

- PDF ;
- DOCX ;
- XLSX ;
- JPEG ;
- PNG.

Taille maximale :

- 15 Mo par fichier.

## Règles de sécurité

- Les documents privés ne sont pas indexés dans le sitemap.
- La route `/documents` est déclarée non indexable dans `robots.txt`.
- La protection réelle repose sur Supabase Auth, les politiques RLS et le bucket privé.
- Un adhérent ne reçoit qu'un lien signé temporaire.
- Les managers peuvent préparer ou modifier les documents.
- Les documents archivés ne sont plus visibles aux adhérents.

## À éviter

- Mettre un compte rendu privé dans `public/images` ou `public/docs`.
- Partager une URL signée dans une actualité publique.
- Publier des coordonnées personnelles inutiles.
- Stocker des documents contenant des données sensibles sans finalité claire.
- Utiliser le site CFVV pour encaisser un paiement carte bancaire hors HelloAsso.
