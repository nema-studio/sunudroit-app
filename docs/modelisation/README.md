# Modélisation de SunuDroit

Ce dossier décrit l'application **avant** le développement du backend Java Spring Boot :
ce qu'elle fait, pour qui, avec quelles données, et comment les morceaux s'emboîtent.
Il sert de référence commune pour le code de l'app (Expo), le backend (Spring Boot),
le back-office et les maquettes Figma.

> État : **version 1 de la modélisation, 22 novembre 2026.** Rien n'est encore codé côté backend.
> Les points non tranchés sont listés dans [12 · Questions ouvertes](12-questions-ouvertes.md).

## Sommaire

| # | Document | Contenu | Diagrammes |
|---|---|---|---|
| 01 | [Vision et périmètre](01-vision-perimetre.md) | Objectifs, publics, contraintes, versions V1 et V2 | |
| 02 | [Acteurs et cas d'utilisation](02-acteurs-cas-utilisation.md) | Qui fait quoi, 42 cas d'utilisation numérotés | cas d'utilisation |
| 03 | [Écrans et navigation](03-ecrans-navigation.md) | Inventaire des 35 écrans de la maquette, carte de navigation, écarts maquette / décisions | navigation |
| 04 | [Scénarios détaillés](04-scenarios.md) | Parcours nominaux, variantes et cas d'erreur | séquence |
| 05 | [Modèle du domaine](05-modele-domaine.md) | Les concepts métier et leurs liens, par module | classes |
| 06 | [Modèle de données](06-modele-donnees.md) | Tables PostgreSQL (serveur) et SQLite (téléphone), dictionnaire | entité-association |
| 07 | [Cycles de vie](07-cycles-de-vie.md) | États et transitions des objets importants | états |
| 08 | [Architecture](08-architecture.md) | Contexte, conteneurs, modules Spring Boot, déploiement, hors ligne | architecture |
| 09 | [Contrat d'API](09-api.md) | Routes, formats, erreurs, sécurité | |
| 10 | [Règles métier](10-regles-metier.md) | Règles numérotées, à respecter dans tout le code | |
| 11 | [Décisions](11-decisions.md) | Décisions prises, avec leur justification | |
| 12 | [Questions ouvertes](12-questions-ouvertes.md) | Ce qui reste à trancher | |

## Comment lire les diagrammes

Les diagrammes sont écrits en **Mermaid**, directement dans le Markdown :

- **GitHub** les affiche automatiquement.
- **VS Code** : installer l'extension *Markdown Preview Mermaid Support* (Matt Bierner), puis ouvrir l'aperçu (`Cmd + Maj + V`).
- **En ligne** : copier un bloc dans [mermaid.live](https://mermaid.live) pour l'afficher ou l'exporter en image.

Les **diagrammes de classes** existent aussi au format **Excalidraw**, un fichier par module, dans
[`excalidraw/`](excalidraw/) : ouvrir sur [excalidraw.com](https://excalidraw.com) (menu ☰ › Ouvrir) ou dans VS Code
avec l'extension *Excalidraw* (pomdtr). Ils portent les **noms du code, en anglais** (DEC-18).
Les fichiers Excalidraw et les blocs Mermaid de [05](05-modele-domaine.md) sont produits par le même générateur
([`excalidraw/generator/`](excalidraw/generator/)) : pour changer un diagramme, modifier `gen.py`, relancer
`python3 gen.py ..` depuis ce dossier, puis recopier les blocs `.mmd` dans 05. Une retouche faite à la main dans
Excalidraw est perdue à la génération suivante.

Un diagramme se modifie comme du texte : quand le modèle change, on met à jour le bloc Mermaid
dans le même commit que le code concerné.

## Conventions

- **Langue** : français, sans tiret cadratin (règle du projet).
- **Identifiants** : chaque cas d'utilisation (`CU-xx`), scénario (`SC-xx`), règle (`RG-xx`),
  décision (`DEC-xx`) et question (`Q-xx`) a un numéro stable. On les cite dans le code,
  les tickets et les commits : « applique RG-07 ».
- **Écrans** : numérotés comme dans la maquette Figma (`E06` = « 06 · Accueil »).
- **Version** : `V1` = lancement public ; `V2` = évolutions prévues ensuite ; `Plus tard` = idée notée, non planifiée.
- **Noms dans les diagrammes** : les noms du code, en anglais (`ArticleVersion`, `legal_text`), comme décidé en DEC-18.
  La correspondance avec le vocabulaire métier français est dans [05](05-modele-domaine.md).

## Glossaire

| Terme | Définition |
|---|---|
| **Texte** | Un texte juridique entier : la Constitution, une loi organique, une décision du Conseil constitutionnel. |
| **Division** | Une subdivision d'un texte : préambule, titre, chapitre, section, intertitre. Forme un arbre. |
| **Article** | L'unité citable d'un texte (« Article 92 »). A un identifiant permanent, indépendant de son numéro. |
| **Version d'article** | Le contenu d'un article sur une période (« du 05.04.2016 à aujourd'hui »). Un article a une ou plusieurs versions. |
| **Alinéa** | Un paragraphe d'une version d'article. Peut être un élément de liste. |
| **Révision** | L'acte juridique qui modifie un texte : loi constitutionnelle, loi organique modificative, référendum. |
| **Effet** | Ce qu'une révision fait précisément : remplacer l'article 4, insérer un alinéa, supprimer des mots… |
| **Renvoi** | Un lien orienté entre un article et un autre texte (« précisé par », « cité par »). |
| **Note éditoriale** | Une note qui explique une anomalie du texte officiel (« NB : rédaction malencontreuse… »). |
| **Édition du corpus** | Un instantané publié et daté de tous les textes, téléchargé par l'app pour la lecture hors ligne. |
| **Corpus** | L'ensemble des textes disponibles dans l'app. |
| **Signalement** | Une erreur ou une suggestion envoyée par un utilisateur sur un article. |
| **Consolidation** | Le texte d'origine avec toutes ses modifications intégrées. |
| **JORS** | Journal officiel de la République du Sénégal. Seule sa publication fait foi. |
| **CDP** | Commission de protection des données personnelles du Sénégal. |
| **Back-office** | L'interface web d'administration réservée à l'équipe (saisie, relecture, publication). |
