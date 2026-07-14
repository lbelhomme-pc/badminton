# Actions manuelles utilisateur

Ce document liste uniquement les actions que le responsable du club doit effectuer ou valider lui-meme.

## Contenus

| Action precise | Raison | Emplacement ou service | Information a preparer | Priorite | Critere de fin |
|---|---|---|---|---|---|
| Valider les textes publics | Eviter les contenus fictifs ou obsoletes | Site public / back-office | Textes accueil, club, FAQ, inscriptions | P1 | Tous les textes sont relus par le bureau |
| Valider les actualites de depart | L'accueil contient encore des actualites statiques | Back-office actualites | 3 a 6 actualites reelles | P1 | Actualites publiees depuis l'admin |
| Valider l'agenda de saison | L'agenda dynamique doit afficher des dates reelles | Back-office agenda futur | Competitions, reunions, fermetures, stages | P1 | 3 prochains evenements visibles |

## Informations du club

| Action precise | Raison | Emplacement ou service | Information a preparer | Priorite | Critere de fin |
|---|---|---|---|---|---|
| Confirmer le nom officiel | Eviter incoherence juridique et SEO | Site, mentions, SEO | Nom association exact | P1 | Nom identique partout |
| Confirmer l'adresse du siege | Mentions legales | Mentions legales | Adresse siege ou mention choisie | P1 | Mentions legales completees |
| Confirmer les lieux de pratique | Informations visiteurs | Creneaux, lieux, schema SEO | Nom gymnase, adresse, acces, stationnement | P1 | Lieux verifies sur le site |
| Confirmer email et telephone publics | Contact fiable | Footer, contact, settings_site | Email generique, telephone si souhaite | P1 | Coordonnees testees |

## Photos et droits a l'image

| Action precise | Raison | Emplacement ou service | Information a preparer | Priorite | Critere de fin |
|---|---|---|---|---|---|
| Fournir photos reelles du club | Remplacer les visuels de demo | Public/images | Photos horizontales et cartes | P2 | Photos ajoutees avec droits |
| Valider droit a l'image | RGPD et mineurs | Documentation club | Autorisations, surtout mineurs | P1 | Registre interne disponible |
| Fournir credits photos | Mentions legales | Site legal | Auteur/source/licence | P2 | Credits ajoutes |

## Membres du bureau

| Action precise | Raison | Emplacement ou service | Information a preparer | Priorite | Critere de fin |
|---|---|---|---|---|---|
| Valider liste du bureau | Page Bureau | Back-office parametres | Prenom/nom/fonction/mission | P1 | Page Bureau correcte |
| Choisir contacts generiques | Ne pas exposer emails personnels | Contact/bureau | Emails de fonction | P1 | Aucun email personnel inutile |

## Adherents

| Action precise | Raison | Emplacement ou service | Information a preparer | Priorite | Critere de fin |
|---|---|---|---|---|---|
| Fournir CSV adherents de test | Tester import et roles | Back-office adherents | Email, prenom, nom, licence, statut | P1 | Import de recette OK |
| Creer comptes de recette | Tester les droits | Supabase Auth | 1 adherent, 1 encadrant, 1 manager, 1 admin, 1 suspendu | P0 | Chaque role teste |
| Valider statuts saison | Eviter acces indecis | Supabase / admin | Actif, en attente, suspendu, non renouvele | P1 | Regles confirmees |

## Reservations

| Action precise | Raison | Emplacement ou service | Information a preparer | Priorite | Critere de fin |
|---|---|---|---|---|---|
| Valider regles de reservation | Parametrer correctement le systeme | Supabase/admin | Jours, ouverture, fermeture, annulation, capacite | P1 | Regles documentees |
| Tester deux reservations simultanees | Prouver anti-depassement capacite | Supabase production/preview | Deux comptes de test | P1 | Derniere place geree correctement |
| Decider notifications fermeture | Les emails ne sont pas integres | Service email | Message type, destinataires | P2 | Process valide |

## HelloAsso

| Action precise | Raison | Emplacement ou service | Information a preparer | Priorite | Critere de fin |
|---|---|---|---|---|---|
| Creer ou confirmer boutique HelloAsso | Paiement officiel | HelloAsso | URLs produits/boutique | P1 | Lien HTTPS teste |
| Tester paiement ou parcours test | Valider redirection | HelloAsso + site | Produit test | P1 | Retour utilisateur clair |
| Decider source de stock | Eviter double gestion | Bureau | HelloAsso seul ou stock site | P1 | Regle ecrite |

## Courriels

| Action precise | Raison | Emplacement ou service | Information a preparer | Priorite | Critere de fin |
|---|---|---|---|---|---|
| Choisir service email | Invitations et notifications | Supabase SMTP/Resend/autre | Adresse expediteur | P1 | Email de test recu |
| Configurer SPF/DKIM/DMARC | Delivrabilite | DNS domaine | Domaine expediteur | P1 | Verification DNS OK |
| Valider modeles email | Ton associatif | Service email | Invitation, reset, annulation | P2 | Modeles relus |

## Domaine et hebergement

| Action precise | Raison | Emplacement ou service | Information a preparer | Priorite | Critere de fin |
|---|---|---|---|---|---|
| Choisir domaine final | SEO et Supabase redirects | Registrar/Vercel | Nom de domaine | P1 | Domaine pointe vers Vercel |
| Configurer variables Vercel Production | Connexion et SEO | Vercel | Supabase URL, anon key, site URL, secrets serveur | P0 | Build production OK |
| Configurer Supabase Redirect URLs | Reset password et login | Supabase Auth | URL prod, preview, local | P0 | Reset password recu et fonctionnel |

## RGPD

| Action precise | Raison | Emplacement ou service | Information a preparer | Priorite | Critere de fin |
|---|---|---|---|---|---|
| Designer responsable RGPD | Obligation d'information | Bureau | Contact RGPD | P1 | Page confidentialite completee |
| Valider bases legales | Texte juridique non final | Confidentialite | Decisions bureau | P1 | Plus aucun "a valider" critique |
| Valider durees de conservation | Donnees adherents/reservations | Registre traitements | Durees par type de donnees | P1 | Registre simplifie valide |
| Valider sous-traitants | Transparence RGPD | Confidentialite | Supabase, Vercel, HelloAsso, email | P1 | Liste complete |

## Securite

| Action precise | Raison | Emplacement ou service | Information a preparer | Priorite | Critere de fin |
|---|---|---|---|---|---|
| Verifier RLS en production | Protection donnees | Supabase | Comptes de test | P0 | Tests lecture/ecriture par role OK |
| Activer MFA admin si possible | Securiser comptes sensibles | Supabase Auth | Comptes admin | P1 | MFA actif ou decision documentee |
| Definir sauvegarde/restauration | Eviter perte de donnees | Supabase | Frequence, responsable | P1 | Restauration testee |

## Accessibilite

| Action precise | Raison | Emplacement ou service | Information a preparer | Priorite | Critere de fin |
|---|---|---|---|---|---|
| Tester mobile reel | Completer Lighthouse | Telephone | Parcours J1-J5 | P1 | Parcours faisables |
| Tester clavier complet | Accessibilite | Navigateur | Aucun | P2 | Focus logique |
| Faire audit lecteur d'ecran | Validation manuelle | NVDA/VoiceOver | Aucun | P2 | Blocages listes |

## Recette

| Action precise | Raison | Emplacement ou service | Information a preparer | Priorite | Critere de fin |
|---|---|---|---|---|---|
| Recette J1 a J5 avec vrais comptes | Valider MVP | Site Preview/Production | Comptes et donnees reelles | P1 | PV de recette OK |
| Tester donnees absentes | Robustesse | Site | Tables vides/partielles | P2 | Etats vides propres |

## Mise en production

| Action precise | Raison | Emplacement ou service | Information a preparer | Priorite | Critere de fin |
|---|---|---|---|---|---|
| Valider go/no-go bureau | Responsabilite club | Reunion bureau | Checklist avant production | P1 | Decision ecrite |
| Promouvoir le deploiement | Mise en ligne | Vercel | Domaine, variables, Supabase OK | P1 | Site public stable |
| Surveiller premiers jours | Detecter erreurs | Vercel/Supabase | Acces logs | P2 | Aucun incident majeur |
