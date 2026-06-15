# Photos réelles du club

Le site est prêt à recevoir des photos réelles, mais aucune photo du club n'est actuellement présente dans `public`.

## Emplacements préparés

| Emplacement | Fichier recommandé | Dimensions conseillées | Poids cible | Texte alternatif |
| --- | --- | ---: | ---: | --- |
| Accueil | `/photos/accueil-badminton-cf2v41.webp` | 1600 x 1000 px | 250 Ko max | Joueurs adultes du CF2V41 en échange de badminton au Gymnase des Aigremonts |
| Page club | `/photos/vie-club-cf2v41.webp` | 1400 x 900 px | 220 Ko max | Bénévoles et adhérents adultes du CF2V41 pendant un moment convivial du club |
| Gymnase | `/photos/gymnase-aigremonts-cf2v41.webp` | 1400 x 900 px | 220 Ko max | Terrains du Gymnase des Aigremonts préparés pour un créneau du CF2V41 |
| Séance d'essai | `/photos/seance-essai-cf2v41.webp` | 1400 x 900 px | 220 Ko max | Accueil d'un joueur débutant lors d'une séance d'essai badminton du CF2V41 |
| Actualités | URL dans l'actualité | 1200 x 800 px | 200 Ko max | Dépend du titre de l'actualité |

## Activation

1. Ajouter les fichiers optimisés dans `public/photos/`.
2. Renseigner le champ `src` correspondant dans `lib/club-photos.ts`.
3. Garder les chemins commençant par `/photos/`.

Exemple :

```ts
src: "/photos/gymnase-aigremonts-cf2v41.webp"
```

## Recommandations droit à l'image

- Ne pas publier de photo de mineur sans autorisation écrite du responsable légal.
- Préférer des photos de gymnase, de matériel, de groupe adulte consentant ou des plans larges où les personnes ne sont pas identifiables.
- Ne pas afficher de données personnelles visibles : feuille d'inscription, numéro de téléphone, adresse email, licence, tableau avec noms.
- Prévoir une procédure simple de retrait si une personne demande la suppression d'une photo.
- Faire valider les photos par le bureau avant mise en ligne.

## Performance

- Utiliser WebP ou AVIF.
- Éviter les fichiers de plus de 250 Ko pour les grandes photos.
- Compresser avant ajout au dépôt.
- Les photos du site sont chargées en lazy loading, sauf la photo principale de l'accueil si elle est activée.
