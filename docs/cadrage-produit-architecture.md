# Cadrage produit et architecture

Site web moderne pour une association de club de badminton.

Version initiale : cadrage avant code.

## 1. Vision produit

Le site doit servir trois usages sans se disperser :

- Decouvrir le club et donner envie de venir essayer.
- Permettre a un adherent de reserver vite, surtout sur mobile.
- Permettre aux responsables de gerer planning, reservations, volants, classements et messages sans perdre leur soiree.

Promesse MVP :

> Un adherent peut consulter les prochains creneaux et reserver une place en moins de 30 secondes, sans conflit possible, avec une interface claire et mobile-first.

## 2. Personas prioritaires

### Visiteur

Objectifs :

- Comprendre ou, quand et comment jouer.
- Voir les tarifs et les creneaux.
- Trouver le lien d'inscription FFBaD.
- Demander un essai.

Actions rapides :

- Voir les creneaux.
- Venir essayer.
- S'inscrire au club.
- Contacter le club.

### Adherent

Objectifs :

- Reserver ou annuler un creneau.
- Voir son prochain entrainement.
- Commander des volants.
- Consulter son classement et ses infos club.

Actions rapides mobile :

- Prochain creneau.
- Reserver ma place.
- Annuler.
- Voir l'adresse du gymnase.
- Commander des volants.

### Admin club

Objectifs :

- Maintenir le planning.
- Gerer les reservations et annulations.
- Gerer les stocks de volants.
- Publier les infos importantes.
- Importer les classements.
- Configurer le lien FFBaD.

Contraintes :

- Peu de temps.
- Besoin d'actions groupables.
- Besoin d'une vue claire des exceptions : gymnase ferme, creneau complet, stock faible, demande d'essai.

## 3. Stack technique recommandee

### Front-end

- Next.js App Router.
- TypeScript.
- Tailwind CSS.
- shadcn/ui pour les primitives accessibles : Dialog, Drawer, Tabs, Table, Toast, Command, Select.
- lucide-react pour les icones.
- React Hook Form + Zod pour les formulaires.
- TanStack Query ou Server Actions selon les besoins de donnees.
- date-fns pour les dates.
- ics pour export calendrier.

### Back-end

- Supabase Auth.
- Supabase PostgreSQL.
- Row Level Security activee sur toutes les tables exposees.
- Supabase Storage pour documents, photos, CSV.
- Server Actions Next.js pour mutations sensibles.
- Edge Functions Supabase uniquement si besoin de taches decouplees.

### Paiement et notifications

- MVP : reservation de volants avec statut `a_payer`, paiement sur place.
- V2 : Stripe Checkout ou Payment Links pour volants et cotisations.
- Notifications : Resend pour emails transactionnels en V2.
- PWA : manifest, icones, cache de base en V2.

## 4. Proposition d'arborescence publique

```text
/
/planning
/planning/[occurrenceId]
/reservation
/volants
/inscription
/classements
/equipes
/actualites
/actualites/[slug]
/club
/contact
/venir-essayer
/tarifs
/faq
/documents
/debutants
/jeunes
/adultes
/competiteurs
/stages
/tournois-internes
/galerie
/sponsors
/mentions-legales
/confidentialite
```

## 5. Arborescence espace connecte

```text
/compte
/compte/reservations
/compte/volants
/compte/classement
/compte/equipes
/compte/notifications
/compte/documents
/compte/profil
```

## 6. Arborescence admin

```text
/admin
/admin/planning
/admin/planning/nouveau
/admin/reservations
/admin/membres
/admin/roles
/admin/volants
/admin/commandes
/admin/actualites
/admin/evenements
/admin/classements
/admin/classements/import
/admin/ffbad
/admin/gymnases
/admin/documents
/admin/messages
/admin/statistiques
/admin/parametres
/admin/audit
```

## 7. UX/UI direction

### Direction visuelle

- Interface claire, fond blanc ou gris tres leger.
- Accent vif mais maitrise : vert terrain, jaune volant ou bleu sportif.
- Beaucoup d'espace blanc.
- Grandes cartes lisibles.
- Badges de statut tres nets.
- Animations courtes au hover et focus.
- Navigation mobile simple : Accueil, Planning, Reserver, Volants, Compte.
- Pas de look administratif ancien.

### Palette proposee

- Fond : `#F7F9F7`.
- Surface : `#FFFFFF`.
- Texte principal : `#10201B`.
- Texte secondaire : `#5B6863`.
- Bordures : `#DDE5E1`.
- Accent principal : `#12B76A`.
- Accent secondaire : `#2563EB`.
- Alerte : `#F97316`.
- Danger : `#DC2626`.

### Typographie

- Police sans-serif moderne : Inter, Geist ou system UI.
- Titres forts mais compacts.
- Corps lisible 16px minimum.
- Boutons et badges courts, sans jargon.

### Comportements

- Header sticky compact.
- Filtre par pills sur planning, volants, classements.
- Recherche instantanee sur pages a listes.
- Drawer mobile pour filtres.
- Modal de reservation avec recapitulatif clair.
- Toasts courts : "Reservation confirmee", "Annulation prise en compte".
- Empty states utiles avec action directe.

## 8. Design system et composants

### Layout

- `SiteHeader`
- `MobileNav`
- `Footer`
- `PageHeader`
- `Section`
- `ResponsiveGrid`
- `AdminShell`
- `MemberShell`

### Public

- `HeroClub`
- `QuickActionCard`
- `SlotPreviewCard`
- `EventCard`
- `NewsCard`
- `SponsorStrip`
- `StatsBand`
- `VenueCard`
- `ContactForm`
- `TrialRequestForm`

### Planning et reservation

- `PlanningToolbar`
- `SearchBar`
- `FilterPills`
- `CalendarWeekView`
- `SlotListView`
- `SlotCard`
- `SlotStatusBadge`
- `LevelBadge`
- `ReservationModal`
- `AttendeeList`
- `WaitlistNotice`
- `AddToCalendarButton`
- `CancelReservationDialog`

### Volants

- `ShuttleProductCard`
- `QuantityStepper`
- `OrderSummary`
- `OrderStatusBadge`
- `StockBadge`

### Classements

- `RankingTable`
- `RankingCardMobile`
- `RankingFilters`
- `ProgressionBadge`
- `CsvImportDropzone`

### Compte

- `MemberDashboardCard`
- `UpcomingReservations`
- `MyOrders`
- `ProfileForm`
- `NotificationList`

### Admin

- `AdminMetricCard`
- `AdminDataTable`
- `SlotEditorForm`
- `RecurringSlotForm`
- `ExceptionClosureForm`
- `MemberRoleSelect`
- `StockAdjustForm`
- `PostEditor`
- `SettingsForm`
- `AuditLogTable`

## 9. Pages publiques

### Accueil

Objectif : comprendre le club et declencher une action.

Contenu :

- Hero avec nom du club, slogan, CTA "Rejoindre le club" et "Voir les creneaux".
- Alerte visible si fermeture exceptionnelle.
- Prochains creneaux ouverts.
- Prochains evenements.
- Bloc "Venir essayer".
- Entrainements : loisirs, jeunes, adultes, competiteurs.
- Stats : adherents, creneaux/semaine, equipes, tournois.
- Galerie ou cartes visuelles.
- Sponsors.

### Planning

Objectif : trouver un creneau vite.

Vues :

- Liste mobile prioritaire.
- Vue semaine desktop.
- Detail d'une occurrence.

Filtres :

- Jour.
- Type.
- Niveau.
- Lieu.
- Statut.
- Recherche.

Actions :

- Reserver ce creneau.
- Rejoindre la liste d'attente en V2.
- Ajouter au calendrier.
- Voir l'adresse.

### Volants

Objectif : reserver ou acheter des volants.

MVP :

- Produits disponibles.
- Prix.
- Stock.
- Quantite.
- Reservation.
- Statuts commande : `en_attente`, `reserve`, `a_payer`, `paye`, `recupere`, `annule`.

V2 :

- Paiement Stripe.
- Facture ou recu simple.
- Notifications mail.

### Inscription

Objectif : guider sans jargon.

Contenu :

- Etapes.
- Tarifs.
- Documents.
- Certificat medical ou questionnaire sante selon consigne admin.
- FAQ.
- Contact responsable inscription.
- CTA tres visible "S'inscrire sur la FFBaD".

Le lien FFBaD est admin-configurable.

### Classements

Objectif : consulter les classements du club sans exposition excessive.

MVP :

- Import CSV admin.
- Saisie manuelle possible.
- Affichage public limite : pseudo ou prenom + initiale selon consentement.
- Affichage adherent plus complet.
- Filtres categorie, niveau, recherche.

Important :

- Pas de scraping non autorise.
- Source et date de mise a jour visibles.

### Equipes et competitions

MVP leger ou V2 selon priorite club :

- Equipes.
- Capitaines.
- Resultats.
- Prochaines rencontres.
- Liens officiels.

### Actualites

Types :

- Fermeture exceptionnelle.
- Tournoi interne.
- Stage.
- Resultats.
- Inscriptions.
- Recherche benevoles.
- Achats groupes.

### Le club

Contenu :

- Histoire.
- Valeurs.
- Bureau.
- Entraineurs.
- Gymnases.
- Acces.
- Carte.
- Horaires.

### Contact

Formulaire :

- Sujet.
- Nom.
- Email.
- Message.
- Type : inscription, essai, competition, reservation, achat volant, autre.

## 10. Espace adherent

### Tableau de bord

- Prochaine reservation.
- Bouton "Reserver".
- Commandes volants en cours.
- Notifications recentes.
- Raccourcis : Planning, Volants, Profil.

### Mes reservations

- Reservations futures.
- Historique.
- Annulation si autorisee.
- Statuts : confirmee, annulee, liste_attente en V2.

### Mes volants

- Commandes.
- Statut.
- Montant.
- Moyen de paiement.
- Point de retrait.

### Mon profil

- Infos minimales.
- Consentement affichage nom.
- Preference affichage : nom complet, prenom + initiale, pseudo.
- Notification email oui/non.

### Documents internes

- Reglement interieur.
- Convocations.
- Documents club reserves aux adherents.

## 11. Tableau de bord admin

### MVP admin

- Vue synthese.
- Gestion planning.
- Creation/modification/annulation de creneaux.
- Duplication hebdomadaire simple.
- Gestion reservations.
- Gestion membres et roles.
- Gestion volants et commandes.
- Gestion lien FFBaD.
- Import classements CSV.
- Messages de contact.
- Alerte site.

### V2 admin

- Statistiques.
- Documents.
- Evenements et competitions.
- Notifications mail.
- Liste d'attente.
- Export CSV.

### Actions rapides admin

- Fermer un gymnase aujourd'hui.
- Annuler un creneau.
- Ajouter un creneau exceptionnel.
- Modifier un stock.
- Marquer une commande payee.
- Importer les classements.
- Publier une actualite urgente.

## 12. Roles et droits

### Visiteur

- Lire site public.
- Lire creneaux publics.
- Contacter.
- Acceder au lien FFBaD.

### Adherent

- Reserver.
- Annuler ses reservations.
- Commander des volants.
- Lire son compte.
- Lire certains classements.

### Entraineur / responsable de creneau

- Voir les inscrits de ses creneaux.
- Signaler une absence.
- Envoyer une info aux participants en V2.
- Modifier ou annuler certains creneaux selon permission.

### Responsable volants

- Gerer produits.
- Gerer stock.
- Gerer commandes.
- Marquer paye / recupere.

### Admin club

- Gerer utilisateurs, roles, creneaux, reservations, volants, actualites, evenements, classements, documents et parametres.

### Super admin

- Acces technique complet.
- A reserver au deploiement et a la maintenance.

## 13. Modele de donnees

Conventions :

- Toutes les tables ont `id uuid primary key`, `created_at`, `updated_at`.
- Les tables sensibles ont `created_by`, `updated_by` si utile.
- Les statuts sont controles par enum PostgreSQL.
- RLS activee partout.
- Les mutations sensibles passent par Server Actions ou RPC securisees.

### auth.users

Fourni par Supabase Auth.

### profiles

- `id uuid primary key references auth.users(id)`
- `email text not null`
- `first_name text`
- `last_name text`
- `display_name text`
- `display_preference text check in ('full_name','first_initial','nickname')`
- `phone text`
- `membership_status text check in ('pending','active','inactive','former')`
- `consent_show_name boolean default false`
- `consent_email_notifications boolean default true`
- `ffbad_license_number text`

Index :

- `email`
- `membership_status`

RLS :

- L'utilisateur lit et modifie son profil limite.
- Admin lit les profils.
- Admin modifie roles et statut via table separee ou fonction securisee.

### roles

- `id uuid`
- `key text unique`
- `label text`
- `description text`

Valeurs :

- `member`
- `coach`
- `slot_manager`
- `shuttle_manager`
- `admin`
- `super_admin`

### user_roles

- `user_id uuid references profiles(id)`
- `role_id uuid references roles(id)`
- `created_by uuid references profiles(id)`

Contraintes :

- unique `user_id, role_id`

RLS :

- Seuls admins lisent/ecrivent.
- Les policies applicatives utilisent une fonction `has_role(user_id, role_key)`.

### venues

- `name`
- `address`
- `city`
- `postal_code`
- `map_url`
- `access_notes`
- `is_active`

Index :

- `city`
- `is_active`

### courts

- `venue_id references venues(id)`
- `name`
- `court_number int`
- `is_active boolean`

Index :

- `venue_id`

### training_slots

Serie recurrente ou modele de creneau.

- `title`
- `type text check in ('free_play','youth_training','adult_training','competitive_training','beginner_course','interclub','tournament','camp','special_event')`
- `venue_id`
- `weekday int`
- `starts_at time`
- `ends_at time`
- `public_label text`
- `recommended_level text`
- `capacity_max int`
- `courts_count int`
- `manager_id uuid references profiles(id)`
- `is_recurring boolean default true`
- `is_public boolean default true`
- `status text check in ('open','paused','archived')`

Index :

- `weekday`
- `type`
- `venue_id`
- `status`

### slot_occurrences

Occurrence datee reservable.

- `training_slot_id references training_slots(id)`
- `venue_id references venues(id)`
- `date date`
- `starts_at timestamptz`
- `ends_at timestamptz`
- `capacity_max int`
- `status text check in ('open','full','cancelled','competition_reserved','closed')`
- `cancellation_reason text`
- `manager_id uuid references profiles(id)`

Contraintes :

- unique `training_slot_id, date` si issue d'une recurrence.

Index :

- `starts_at`
- `status`
- `venue_id`
- `training_slot_id`

### reservations

- `slot_occurrence_id references slot_occurrences(id)`
- `user_id references profiles(id)`
- `status text check in ('confirmed','cancelled','admin_cancelled','no_show')`
- `cancelled_at timestamptz`
- `cancelled_by uuid references profiles(id)`
- `source text check in ('member','admin')`

Contraintes :

- unique partiel : un utilisateur ne peut avoir qu'une reservation active par occurrence.
- le nombre de reservations confirmees ne doit jamais depasser la capacite. A gerer via transaction/RPC.

Index :

- `slot_occurrence_id, status`
- `user_id, status`

### waiting_list

V2.

- `slot_occurrence_id`
- `user_id`
- `position int`
- `status text check in ('waiting','notified','promoted','cancelled','expired')`
- `notified_at timestamptz`

Contraintes :

- unique `slot_occurrence_id, user_id`
- unique `slot_occurrence_id, position`

### shuttlecock_products

- `brand`
- `model`
- `description`
- `price_cents int`
- `stock_quantity int`
- `low_stock_threshold int`
- `is_active boolean`
- `image_url text`

Index :

- `is_active`
- `stock_quantity`

### shuttlecock_orders

- `user_id references profiles(id)`
- `status text check in ('pending','reserved','to_pay','paid','picked_up','cancelled')`
- `total_cents int`
- `payment_method text check in ('on_site','stripe')`
- `notes text`

Index :

- `user_id`
- `status`
- `created_at`

### shuttlecock_order_items

- `order_id references shuttlecock_orders(id)`
- `product_id references shuttlecock_products(id)`
- `quantity int`
- `unit_price_cents int`

### payments

- `user_id`
- `order_id`
- `amount_cents`
- `status text check in ('pending','paid','failed','refunded','cancelled')`
- `provider text check in ('manual','stripe')`
- `provider_payment_id text`
- `paid_at timestamptz`

### club_settings

- `key text unique`
- `value jsonb`
- `description text`

Exemples :

- `club_name`
- `club_city`
- `ffbad_registration_url`
- `max_active_reservations`
- `reservation_open_days_ahead`
- `cancellation_deadline_hours`
- `show_attendee_names_default`
- `site_alert`

### ffbad_links

- `label`
- `url`
- `is_primary`
- `is_active`

### rankings

- `user_id references profiles(id)`
- `season text`
- `category text`
- `single_rank text`
- `double_rank text`
- `mixed_rank text`
- `progression text`
- `team text`
- `source text check in ('manual','csv')`
- `source_updated_at timestamptz`
- `public_visibility text check in ('hidden','limited','members','public')`

Index :

- `season`
- `category`
- `user_id`

### teams

- `name`
- `level`
- `captain_id references profiles(id)`
- `description`
- `photo_url`
- `is_active`

### competitions

- `team_id references teams(id)`
- `name`
- `season`
- `official_url`
- `starts_at`
- `status text`

### events

- `title`
- `slug unique`
- `description`
- `starts_at`
- `ends_at`
- `venue_id`
- `type`
- `is_public`
- `image_url`

### posts

- `title`
- `slug unique`
- `excerpt`
- `content`
- `category`
- `published_at`
- `status text check in ('draft','published','archived')`
- `author_id`
- `cover_image_url`

### documents

- `title`
- `description`
- `file_path`
- `visibility text check in ('public','members','admin')`
- `category`
- `uploaded_by`

### notifications

- `user_id`
- `title`
- `body`
- `type`
- `read_at`
- `metadata jsonb`

### contact_messages

- `name`
- `email`
- `subject`
- `type text`
- `message`
- `status text check in ('new','in_progress','closed','spam')`
- `handled_by`

### audit_logs

- `actor_id references profiles(id)`
- `action text`
- `target_table text`
- `target_id uuid`
- `metadata jsonb`
- `created_at timestamptz`

## 14. RLS et securite

Principes :

- Ne jamais faire confiance au role cote front.
- Les roles sont lus via fonction Postgres securisee.
- RLS activee sur toutes les tables exposees.
- Les actions admin importantes sont journalisees.
- Les fichiers Supabase Storage ont des buckets par visibilite.

Policies types :

- Visiteur : lecture seulement sur contenus publics.
- Adherent : lecture de son profil, ses reservations, ses commandes, contenus membres.
- Responsable creneau : lecture participants uniquement pour ses occurrences.
- Responsable volants : lecture/ecriture produits et commandes.
- Admin : acces large mais trace.
- Super admin : acces complet.

Fonctions RPC utiles :

- `reserve_slot(occurrence_id uuid)`
- `cancel_reservation(reservation_id uuid)`
- `promote_waitlist(occurrence_id uuid)`
- `adjust_stock(product_id uuid, delta int, reason text)`
- `import_rankings(rows jsonb)`
- `has_role(user_id uuid, role_key text)`

## 15. Regles de reservation

### MVP

- Un creneau a une capacite maximale.
- Seuls les adherents actifs peuvent reserver.
- Un adherent peut reserver si l'occurrence est ouverte.
- Un adherent ne peut pas reserver deux fois la meme occurrence.
- Un adherent ne peut pas depasser `max_active_reservations`.
- Une reservation est possible jusqu'a `reservation_open_days_ahead` jours a l'avance.
- Une annulation membre est possible jusqu'a `cancellation_deadline_hours` heures avant.
- L'admin peut forcer inscription ou annulation.
- Une occurrence peut etre annulee sans supprimer la serie recurrente.
- Une fermeture gymnase bloque toutes les occurrences concernees.

### Anti-conflit

- La verification capacite + insertion reservation doit etre transactionnelle.
- Le statut `full` peut etre derive du nombre de reservations confirmees.
- La base doit rester source de verite, pas l'interface.

### V2

- Si complet, l'adherent rejoint une liste d'attente.
- Quand une place se libere, la premiere personne est notifiee.
- La notification expire apres un delai configurable.
- L'admin peut promouvoir manuellement une personne.

## 16. Volants

### MVP

- Produits actifs visibles.
- Stock disponible.
- Quantite commandee.
- Statut commande.
- Paiement sur place.
- Admin peut ajuster stock et statut.
- Historique visible pour adherent et admin.

### V2

- Stripe.
- Email confirmation.
- Recu.
- Alerte stock faible.

## 17. Classements

### MVP

- Import CSV admin.
- Modele CSV documente.
- Saisie manuelle possible.
- Pas de scraping.
- Affichage public limite.
- Affichage complet reserve aux membres selon consentement.

Colonnes CSV proposees :

```csv
email,first_name,last_name,category,single_rank,double_rank,mixed_rank,progression,team,public_visibility
```

## 18. SEO local

Pages a optimiser :

- Accueil : club badminton + ville.
- Planning : creneaux badminton + ville.
- Inscription : inscription badminton + ville.
- Venir essayer : essai badminton + ville.
- Gymnases : badminton + nom du gymnase.

Elements :

- `title` et `description` par page.
- Open Graph.
- Donnees structurees LocalBusiness ou SportsActivityLocation.
- Adresse, ville, horaires, liens utiles.
- Performance mobile.
- Textes clairs et utiles.

## 19. RGPD

Mesures :

- Donnees minimales.
- Consentement pour affichage des noms.
- Option prenom + initiale ou pseudo.
- Suppression ou anonymisation des anciens comptes.
- Mentions legales.
- Politique de confidentialite.
- Journalisation admin.
- Conservation limitee des messages contact.
- Documents sensibles evites en MVP.
- Exports admin controles.

Donnees a eviter en MVP :

- Certificats medicaux stockes directement.
- Informations de paiement detaillees.
- Donnees sante non necessaires.

## 20. Accessibilite

Exigences :

- Contrastes WCAG AA.
- Navigation clavier.
- Focus visible.
- Labels de formulaires.
- Boutons explicites.
- `aria-label` pour boutons icones.
- Textes alternatifs sur images utiles.
- Taille lisible.
- Pas d'information transmise uniquement par couleur.
- Modales et drawers accessibles.

## 21. Decoupage MVP / V2 / V3

### MVP

- Accueil.
- Planning liste + detail.
- Authentification.
- Reservation connectee.
- Annulation.
- Liste des inscrits selon droits.
- Page volants reservation simple.
- Admin volants.
- Page inscription avec lien FFBaD configurable.
- Classements avec import CSV ou saisie manuelle.
- Espace adherent.
- Admin minimal.
- RLS Supabase.
- Design responsive moderne.

### V2

- Paiement Stripe.
- Notifications email.
- Liste d'attente.
- Statistiques admin.
- Equipes et interclubs.
- Export calendrier ICS.
- PWA.
- Galerie.
- Documents internes.
- Gestion invites.
- Alertes stock faible.

### V3

- PWA avancee.
- Notifications push.
- Automatisations.
- Presence aux entrainements.
- Badges communautaires.
- Gestion competitions avancee.
- Synchronisation externe uniquement si legale et techniquement fiable.

## 22. Ordre d'implementation recommande

1. Initialiser Next.js, TypeScript, Tailwind, shadcn/ui.
2. Poser le design system : couleurs, typo, composants de base, layout.
3. Creer schema Supabase, enums, RLS, seed minimal.
4. Integrer Auth Supabase et roles.
5. Construire pages publiques : accueil, planning, inscription.
6. Construire reservation MVP.
7. Construire espace adherent.
8. Construire volants MVP.
9. Construire admin minimal.
10. Ajouter classements CSV.
11. Polish responsive, accessibilite, SEO.
12. Tests et scenarios critiques.

## 23. Tests prioritaires

### Reservation

- Un visiteur ne peut pas reserver.
- Un adherent actif peut reserver.
- Un adherent inactif ne peut pas reserver.
- Capacite jamais depassee.
- Double reservation impossible.
- Quota actif respecte.
- Annulation avant deadline autorisee.
- Annulation apres deadline refusee sauf admin.
- Occurrence annulee non reservable.

### RLS

- Un membre ne lit pas les reservations privees d'autres membres.
- Un responsable ne lit que ses creneaux.
- Un responsable volants ne modifie pas le planning.
- Un admin peut gerer les donnees necessaires.

### UX

- Reservation mobile en moins de 30 secondes.
- Planning lisible sur petit ecran.
- Boutons accessibles au clavier.
- Alertes visibles et comprehensibles.

## 24. Questions a trancher avant le code

- Nom exact du club.
- Ville et gymnases.
- Couleur d'accent preferee.
- Lien FFBaD du club.
- Capacite par creneau ou par terrain.
- Les adherents reservent-ils une place ou un terrain entier ?
- Les noms des inscrits sont-ils publics, membres seulement, ou masques par defaut ?
- Paiement volants des la V1 ou paiement sur place ?
- Qui sera admin initial ?

