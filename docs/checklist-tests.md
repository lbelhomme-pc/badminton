# Check-list de tests

## Visiteur

- Ouvrir `/` et vérifier que le CSS est chargé.
- Ouvrir `/creneaux`.
- Ouvrir `/tarifs`.
- Ouvrir `/inscription`.
- Cliquer sur `S'inscrire`.
- Cliquer sur `Connexion`.
- Essayer `/espace-adherent` sans être connecté : la page doit demander la connexion.
- Essayer `/admin` sans être connecté : la page doit demander la connexion.

## Adhérent

- Créer un compte depuis `/creation-compte`.
- Confirmer l'email si Supabase le demande.
- Se connecter depuis `/connexion`.
- Ouvrir `/espace-adherent`.
- Ouvrir `/reservation-creneau`.
- Réserver un créneau.
- Ouvrir `/mes-reservations`.
- Annuler une réservation.
- Ouvrir `/commande-volants` et envoyer une demande.
- Vérifier que `/admin` refuse l'accès.

## Admin ou bureau

- Passer le compte en `admin` dans Supabase.
- Se reconnecter.
- Ouvrir `/admin`.
- Créer un créneau dans `/admin/creneaux`.
- Désactiver puis réactiver un créneau.
- Voir les réservations dans `/admin/reservations`.
- Modifier le statut d'une réservation.
- Créer une actualité dans `/admin/actualites`.
- Vérifier la liste des adhérents dans `/admin/adherents`.
- Ajouter un modèle de volant dans `/admin/volants`.
- Ajuster le stock avec `+1` et `-1`.

## Sécurité RLS

- Avec un compte adhérent, tenter de lire `profiles` hors de son propre profil depuis le navigateur : refus attendu.
- Avec un compte adhérent, tenter de modifier son rôle dans `profiles` : refus attendu.
- Avec un compte adhérent, tenter d'insérer ou modifier `creneaux` : refus attendu.
- Avec un compte adhérent, tenter de lire toutes les réservations : seules les siennes doivent être visibles.
- Avec un compte adhérent, tenter de modifier le stock des volants : refus attendu.
- Vérifier qu'aucune clé `service_role` n'est présente dans `.env.local`, le code client ou les logs.
