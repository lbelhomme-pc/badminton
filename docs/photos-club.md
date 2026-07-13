# Photos rÃ©elles du club

Le site est prÃªt Ã  recevoir des photos rÃ©elles, mais aucune photo du club n'est actuellement prÃ©sente dans `public`.

## Emplacements prÃ©parÃ©s

| Emplacement | Fichier recommandÃ© | Dimensions conseillÃ©es | Poids cible | Texte alternatif |
| --- | --- | ---: | ---: | --- |
| Accueil | `/photos/accueil-badminton-cfvv.webp` | 1600 x 1000 px | 250 Ko max | Joueurs adultes du CFVV en Ã©change de badminton au Gymnase des Aigremonts |
| Page club | `/photos/vie-club-cfvv.webp` | 1400 x 900 px | 220 Ko max | BÃ©nÃ©voles et adhÃ©rents adultes du CFVV pendant un moment convivial du club |
| Gymnase | `/photos/gymnase-aigremonts-cfvv.webp` | 1400 x 900 px | 220 Ko max | Terrains du Gymnase des Aigremonts prÃ©parÃ©s pour un crÃ©neau du CFVV |
| SÃ©ance d'essai | `/photos/seance-essai-cfvv.webp` | 1400 x 900 px | 220 Ko max | Accueil d'un joueur dÃ©butant lors d'une sÃ©ance d'essai badminton du CFVV |
| ActualitÃ©s | URL dans l'actualitÃ© | 1200 x 800 px | 200 Ko max | DÃ©pend du titre de l'actualitÃ© |

## Activation

1. Ajouter les fichiers optimisÃ©s dans `public/photos/`.
2. Renseigner le champ `src` correspondant dans `lib/club-photos.ts`.
3. Garder les chemins commenÃ§ant par `/photos/`.

Exemple :

```ts
src: "/photos/gymnase-aigremonts-cfvv.webp"
```

## Recommandations droit Ã  l'image

- Ne pas publier de photo de mineur sans autorisation Ã©crite du responsable lÃ©gal.
- PrÃ©fÃ©rer des photos de gymnase, de matÃ©riel, de groupe adulte consentant ou des plans larges oÃ¹ les personnes ne sont pas identifiables.
- Ne pas afficher de donnÃ©es personnelles visibles : feuille d'inscription, numÃ©ro de tÃ©lÃ©phone, adresse email, licence, tableau avec noms.
- PrÃ©voir une procÃ©dure simple de retrait si une personne demande la suppression d'une photo.
- Faire valider les photos par le bureau avant mise en ligne.

## Performance

- Utiliser WebP ou AVIF.
- Ã‰viter les fichiers de plus de 250 Ko pour les grandes photos.
- Compresser avant ajout au dÃ©pÃ´t.
- Les photos du site sont chargÃ©es en lazy loading, sauf la photo principale de l'accueil si elle est activÃ©e.
