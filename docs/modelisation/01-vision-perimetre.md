# 01 · Vision et périmètre

## Mission

Donner à tous les Sénégalais un accès **gratuit, fiable et hors ligne** à la Constitution et à ses
lois organiques, avec **la source et la version** de chaque article, pour pouvoir lire, chercher,
vérifier une citation et partager le texte exact.

Phrase repère de l'app : *« Le droit sénégalais, vérifié en quelques secondes. »*

## Publics

| Public | Besoin principal | Conséquence sur la conception |
|---|---|---|
| Citoyen | Comprendre ses droits, vérifier ce qu'il entend à la radio ou sur les réseaux | Interface simple, vérification de citation mise en avant |
| Étudiant en droit | Retrouver vite un article, suivre ses versions | Recherche tolérante aux fautes, historique des versions |
| Journaliste | Citer juste et sourcer | Partage en image avec la version et la source |
| Juriste ou enseignant | Naviguer entre Constitution et lois organiques | Renvois entre textes, table des matières |

## Contraintes du terrain

| Contrainte | Réponse |
|---|---|
| Beaucoup de téléphones Android d'entrée de gamme | App légère, animations simples, police unique (Inter) |
| Connexion irrégulière ou coûteuse | **Tout le corpus est sur le téléphone** ; les mises à jour sont petites et reprennent après coupure |
| Le texte officiel n'existe pas sous forme consolidée unique | Corpus construit et relu par l'équipe, chaque version sourcée au Journal officiel |
| Projet financé par des dons, développeur seul au départ | Pas de dépense variable par utilisateur (pas de SMS), hébergement géré, back-office intégré au backend |
| Données personnelles de Sénégalais hébergées en Europe | Déclaration à la CDP, minimisation des données collectées |

## Principes directeurs

1. **Fidélité au texte officiel.** On ne corrige jamais un texte de loi : on signale ses anomalies par une note.
   Seule la publication au Journal officiel fait foi, et l'app le dit.
2. **Hors ligne d'abord.** Lire, chercher, vérifier et consulter ses favoris ne demandent aucune connexion.
3. **Compte facultatif.** Tout se lit sans compte. Le compte sert à synchroniser et à recevoir des reçus.
4. **Chaque version est datée et sourcée.** Un utilisateur sait toujours « à jour au… » et « modifié par… ».
5. **Sobriété.** Ne collecter que le nécessaire : e-mail, prénom, nom facultatif.

## Périmètre fonctionnel

| Fonction | Écrans maquette | V1 | V2 | Plus tard |
|---|---|:-:|:-:|:-:|
| Ouverture, bienvenue | E01, E02 | ✓ | | |
| Compte par e-mail et code, nom | E03, E04, E04 bis | ✓ | | |
| Autorisation des notifications | E05 | ✓ | | |
| Accueil (recherche, Parcourir, Reprendre, Vérifier) | E06 | ✓ | | |
| Table des matières d'un texte | E07 | ✓ | | |
| Recherche tolérante aux fautes, filtres | E08, E09 | ✓ | | |
| Lecture d'un article, taille du texte, textes liés | E10 | ✓ | | |
| Historique des versions d'un article | E11 | ✓ | | |
| Renvoi vers une loi organique | E12 | ✓ | | |
| Vérifier une citation (hors ligne) | E13 | ✓ | | |
| Partager un article en image sourcée | E14 | ✓ | | |
| Favoris (local + synchronisés avec un compte) | E15 | ✓ | | |
| Historique de lecture et de vérification | E16 | ✓ local | ✓ synchronisé | |
| Signaler une erreur sur un article | (à concevoir) | ✓ | | |
| Dons Wave / Orange Money, reçus | E17 à E20 | | ✓ | |
| Mon espace, modifier le profil, supprimer le compte, déconnexion | E21 à E24 | ✓ | | |
| Boîte de notifications | E25 | | ✓ | |
| Réglages (thème, taille du texte, notifications, hors ligne, statistiques) | E26 | ✓ | | |
| Langue de l'interface (wolof, anglais) | E27 | | | ✓ |
| À propos et sources | E28 | ✓ | | |
| Thème sombre | E29 à E31 | ✓ | | |
| États système (chargement, aucun résultat, hors ligne et mise à jour, erreur serveur) | E32 à E35 | ✓ | | |
| Photo de profil | E22 | | | ✓ (voir Q-06) |

## Corpus

| Texte | V1 | Source de départ |
|---|:-:|---|
| Constitution du 22 janvier 2001 | ✓ | Version annotée du Conseil constitutionnel (à jour au 11 mai 2018), puis révisions 2019-10, 2021-41, 2023-13, 2024-15 (à vérifier) intégrées par l'équipe |
| Loi organique n° 2016-23 du 14 juillet 2016 relative au Conseil constitutionnel | ✓ | JORS n° 6953 du 3 août 2016, modifications éventuelles à vérifier |
| Renvois entre ces deux textes | ✓ | Saisis et relus par l'équipe |
| Autres lois organiques | | V2 |
| Décisions du Conseil constitutionnel | | V2 (la maquette en montre : « Décision n° 4/C/2026 ») |
| Codes et lois ordinaires | | Plus tard (annoncé sur l'écran E33) |

**Condition de lancement public** : toutes les révisions connues sont intégrées et relues
(voir [RG-30](10-regles-metier.md)). Pendant le développement, la base 2018 suffit.

## Indicateurs de réussite (à suivre en V1)

- Taux de recherches avec au moins un résultat.
- Nombre de vérifications de citation et part des verdicts « inexact ».
- Nombre d'articles partagés.
- Délai entre la publication d'une révision au Journal officiel et sa disponibilité dans l'app.
- Nombre de signalements reçus, acceptés, délai de traitement.

Ces mesures passent par des **statistiques anonymes**, désactivables dans les réglages (E26).
