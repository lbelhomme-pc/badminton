# Réservations de créneaux CFVV

## Objectif

Le module permet à un adhérent actif de réserver ou d'annuler une place sur une session datée depuis son téléphone, sans dépasser la capacité du créneau et sans créer de doublon.

Les réservations sont prévues d'abord pour les mercredis et vendredis, mais chaque créneau peut activer ou désactiver la réservation depuis le back-office.

## Garanties côté Supabase

- La réservation passe par la fonction SQL `reserve_creneau`.
- La fonction verrouille le créneau avec `select ... for update` pendant le contrôle de capacité.
- Une contrainte unique empêche deux réservations actives pour le même adhérent, le même créneau et la même date.
- Si l'utilisateur a déjà réservé, la fonction renvoie la réservation existante au lieu de créer un doublon.
- Si le créneau est complet, l'utilisateur est placé en liste d'attente uniquement si la table `waiting_list` est disponible.
- L'annulation passe par la fonction `cancel_reservation` et respecte le délai paramétré sur le créneau.
- Les anciens contournements côté navigateur ont été retirés : si la migration Supabase n'est pas appliquée, le site affiche une erreur au lieu d'écrire directement dans les tables.

## Règles configurables

Chaque créneau peut définir :

- réservation active ou inactive ;
- nombre de jours avant ouverture ;
- heure d'ouverture ;
- fermeture avant la séance, en minutes ;
- délai limite d'annulation, en heures ;
- capacité maximale ;
- message particulier visible par l'adhérent.

## Fermetures exceptionnelles

Une fermeture exceptionnelle passe par `create_creneau_cancellation`.

La règle actuelle est volontairement prudente :

- la session est marquée fermée ;
- les réservations actives de la date concernée sont conservées dans l'historique mais passent en statut `annulee` ;
- les inscriptions en liste d'attente sont aussi annulées ;
- l'action est journalisée dans `audit_logs`.

La réouverture retire la fermeture exceptionnelle, mais ne restaure pas automatiquement les réservations annulées. Ce choix évite de réinscrire des personnes sans confirmation.

## Back-office minimal

Le back-office permet :

- de consulter les réservations ;
- de filtrer par date, statut et adhérent ;
- de modifier un statut ;
- d'exporter la liste en CSV ;
- de fermer ou rouvrir une date de créneau ;
- de régler les paramètres de réservation de chaque créneau.

## Notifications

La migration prépare les statuts nécessaires, mais l'envoi d'emails n'est pas encore branché.

À valider avant activation :

- canal de notification : email, message interne ou aucun en MVP ;
- contenu du message en cas de fermeture ;
- personne responsable des envois ;
- délai de prévenance minimal.

## Points à valider par le bureau

- Jours réellement réservables au lancement.
- Capacités exactes par créneau.
- Heure d'ouverture des réservations.
- Délai limite d'annulation.
- Politique de liste d'attente : activée ou reportée.
- Règle de réouverture après fermeture exceptionnelle.
- Communication en cas d'annulation de séance.
