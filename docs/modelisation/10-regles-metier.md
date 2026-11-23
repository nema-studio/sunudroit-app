# 10 · Règles métier

Chaque règle est numérotée, testable, et indique **où** elle s'applique : **A** = app mobile, **B** = backend,
**BO** = back-office. Une règle se cite dans le code et les tests : `// RG-04`.

## Corpus juridique

| Règle | Énoncé | Où |
|---|---|---|
| **RG-01** | L'identifiant d'un texte (`constitution-2001`) et d'un article (`const-art-25-1`) est attribué une fois, à la création, et ne change jamais, même si l'article est renuméroté. Il n'est jamais réutilisé. Favoris, liens partagés et historique pointent vers lui. | B, A |
| **RG-02** | Le numéro affiché est le libellé officiel (`premier`, `25-1`). L'ordre des articles suit la clé de tri calculée (`00025.001`), jamais l'ordre alphabétique du libellé. Un numéro est unique dans un texte. | B |
| **RG-03** | Le préambule est une division de nature `PREAMBULE` contenant un article de nature `PREAMBULE` : il est consultable, cherchable, citable et partageable comme un article. | B, A |
| **RG-04** | Les versions **validées** d'un même article ne se chevauchent pas dans le temps. Il y a au plus une version en vigueur à une date donnée. La fin d'une version (`valide_au`) est le début de la suivante. | B (contrainte SQL) |
| **RG-05** | Toute version d'article et tout intitulé de division a une révision source. Le texte d'origine a pour source son acte d'origine (loi n° 2001-03), enregistré comme une révision de nature `ACTE_ORIGINE`. | B |
| **RG-06** | Une version contient le **texte complet** de l'article à cette période. Une version publiée est immuable : toute correction crée une nouvelle saisie qui refait le cycle de relecture. Les différences entre versions se calculent à l'affichage. | B, A |
| **RG-07** | On ne corrige **jamais** le texte officiel, même s'il contient une erreur manifeste. L'anomalie est expliquée par une note éditoriale (« rédaction malencontreuse », « mots subsistants », « modification annoncée non mise en œuvre »). | BO |
| **RG-08** | Une date d'entrée en vigueur n'est jamais inventée. Si elle n'est pas établie par une source, la version est marquée `date_incertaine` et l'app affiche « depuis » sans date précise. | BO, A |
| **RG-09** | Une révision `CENSUREE` ou `EN_PROJET` est enregistrée dans le registre mais ne peut produire aucune version, aucun intitulé, aucun alinéa. | B |
| **RG-10** | Un article abrogé n'est pas supprimé : sa dernière version porte `abrogee = true`. L'app affiche « Abrogé depuis le … » et donne accès aux versions antérieures. | B, A |
| **RG-11** | Les intitulés de divisions sont versionnés comme les articles (Titre II renommé en 2016). | B |
| **RG-12** | Un renvoi a un type fermé (`PRECISE_PAR`, `CITE_PAR`, `RENVOIE_A`), une source (article) et une cible (texte, éventuellement division ou article). Un renvoi vers un texte absent de l'édition n'est pas affiché. | B, A |
| **RG-13** | Le statut d'un texte (`EN_VIGUEUR`, `ABROGE`, `CENSURE`) est affiché partout où le texte apparaît (carte, résultat, renvoi). | A |
| **RG-14** | Les textes de loi sont affichés dans leur langue officielle, le français, quelle que soit la langue de l'interface (E27). | A |

## Atelier éditorial et publication

| Règle | Énoncé | Où |
|---|---|---|
| **RG-20** | Toute saisie de contenu (version, intitulé, renvoi, note) suit le cycle brouillon → en relecture → validée → publiée. Seul un contenu validé peut entrer dans une édition. | B, BO |
| **RG-21** | Un membre de l'équipe ne peut pas valider sa propre saisie. | B |
| **RG-22** | Une édition publiée est immuable et porte un numéro strictement croissant. On ne revient jamais à une édition antérieure : une erreur se corrige par une nouvelle édition. La liste exacte des contenus de chaque édition est conservée. | B |
| **RG-23** | Chaque édition porte une date de vérification affichée « Corpus du JJ.MM.AAAA » (E01, E26, E28) et des notes de version lisibles par l'utilisateur (E34 « Ce qui change »). | B, A |
| **RG-24** | Toute action de l'équipe (saisie, relecture, publication, traitement de signalement, gestion des membres) produit un événement d'audit non modifiable. | B |
| **RG-25** | Un import automatique (PDF, page web) ne produit que des brouillons, à relire comme une saisie manuelle. | BO |
| **RG-26** | Avant publication, les contrôles automatiques doivent tous passer (chevauchements, renvois, révisions citées, version en vigueur ou abrogée par article, ouverture du fichier, index de recherche). | B |
| **RG-27** | Une édition déclare `version_schema` et `version_app_min`. Une app trop ancienne ne l'installe pas, garde l'édition actuelle et propose de mettre l'app à jour (E39). | B, A |
| **RG-28** | L'app vérifie l'empreinte SHA-256 du fichier téléchargé avant de l'installer. | A |
| **RG-29** | L'installation d'une édition est atomique : l'ancienne reste active jusqu'au succès complet. Chaque version de l'app publiée sur les stores embarque la dernière édition disponible. | A |
| **RG-30** | **Condition de lancement public** : toutes les révisions promulguées connues sont intégrées et relues. Pendant le développement, la base du Conseil constitutionnel (à jour au 11 mai 2018) suffit, avec sa date affichée. | BO |

## Signalements

| Règle | Énoncé | Où |
|---|---|---|
| **RG-31** | Tout le monde peut signaler une erreur, avec ou sans compte. L'e-mail de contact est facultatif. | A, B |
| **RG-32** | Anti-abus : 5 signalements par heure et par appareil, 20 par heure et par adresse IP ; description de 10 à 2 000 caractères. | B |
| **RG-33** | Si un contact existe (compte ou e-mail), l'auteur est informé quand son signalement est refusé (avec motif) ou corrigé. | B |
| **RG-34** | Un signalement ne modifie jamais directement le corpus : il peut seulement déclencher une saisie qui suit RG-20. | B |
| **RG-35** | Un signalement hors ligne est conservé dans la file d'envoi et transmis au retour du réseau. | A |

## Comptes et sessions

| Règle | Énoncé | Où |
|---|---|---|
| **RG-40** | L'identifiant d'un compte est l'adresse e-mail, normalisée (espaces retirés, minuscules) et unique. | A, B |
| **RG-41** | Code de connexion : 6 chiffres aléatoires, stocké haché, valable 10 minutes, 5 essais ; renvoi possible après le délai indiqué (`resendIn`) ; au plus 5 demandes par heure et par adresse, 20 par heure et par IP. Une nouvelle demande invalide la précédente. | B |
| **RG-42** | Jeton d'accès valable 15 minutes. Jeton de rafraîchissement valable 30 jours, remplacé à chaque usage ; la réutilisation d'un ancien jeton révoque toute sa famille (signe de vol). | B, A |
| **RG-43** | Prénom obligatoire (1 à 50 caractères), nom facultatif (0 à 50). Un compte sans prénom repasse par l'écran « Votre nom » à la connexion suivante. | A, B |
| **RG-44** | Changer d'adresse e-mail exige un code envoyé à la nouvelle adresse. Une adresse déjà liée à un compte est refusée (`EMAIL_TAKEN`). | B |
| **RG-45** | Suppression de compte : effet immédiat (connexion impossible, données invisibles, sessions révoquées), purge définitive à J+30. Les reçus de dons sont conservés sans lien avec le compte, pour les obligations comptables (durée légale à confirmer, Q-08). | B |
| **RG-46** | À la déconnexion, les données liées au compte (favoris synchronisés, historique synchronisé) sont retirées du téléphone ; les préférences et l'édition du corpus restent. | A |
| **RG-47** | Les préférences (thème, taille du texte, langue, statistiques anonymes) sont propres à chaque téléphone et ne sont pas synchronisées. | A |

## Favoris et historique

| Règle | Énoncé | Où |
|---|---|---|
| **RG-50** | Un favori vise un article ou un texte entier ; une même cible ne figure qu'une fois par utilisateur. | A, B |
| **RG-51** | Synchronisation : à la première connexion, union des favoris locaux et du compte ; ensuite, fusion élément par élément, la modification la plus récente l'emporte ; une suppression est une modification (suppression logique). Le serveur borne les dates futures à son heure de réception. | A, B |
| **RG-52** | Un favori dont la cible est abrogée ou modifiée reste dans la liste, avec la mention correspondante. | A |
| **RG-53** | L'historique local garde au plus 500 entrées et 12 mois ; l'utilisateur peut l'effacer à tout moment (E16). | A |
| **RG-54** | « Reprendre » (E06) montre la dernière lecture de l'historique local. | A |
| **RG-55** | Le texte d'une citation vérifiée reste sur le téléphone. Seuls le verdict et l'article peuvent être synchronisés (V2). | A, B |

## Dons (V2)

| Règle | Énoncé | Où |
|---|---|---|
| **RG-60** | Montant entier entre 200 et 1 000 000 FCFA ; montants proposés : 500, 1 000, 2 000 (par défaut), 5 000. | A, B |
| **RG-61** | Le statut d'un don ne change que sur information du prestataire (notification signée ou interrogation de son API), jamais sur la parole de l'app. Une notification rejouée est ignorée (idempotence). | B |
| **RG-62** | Chaque don a une référence unique lisible : `SD-AAMM-XXXX` (année, mois, 4 caractères aléatoires sans caractères ambigus). | B |
| **RG-63** | Un don sans confirmation après 15 minutes passe à « Expiré ». | B |
| **RG-64** | Un reçu numéroté (`R-AAAA-NNNNNN`) est généré à la confirmation, en PDF, avec le nom copié au moment du don. Il est envoyé par e-mail et disponible dans « Mes dons ». | B |

## Notifications

| Règle | Énoncé | Où |
|---|---|---|
| **RG-70** | Une notification de mise à jour du corpus n'est envoyée qu'aux appareils qui l'ont autorisée (`revisionAlerts`), et pas entre 22 h et 7 h (heure de Dakar). | B |
| **RG-71** | Jamais de publicité ni de message promotionnel par notification (promesse de E05). | B |
| **RG-72** | Une notification renvoie toujours vers un écran précis (lien profond), jamais vers une page vide. | B, A |

## Données personnelles et confidentialité

| Règle | Énoncé | Où |
|---|---|---|
| **RG-80** | Minimisation : seules sont collectées l'adresse e-mail, le prénom, le nom (facultatif) et les données techniques nécessaires (jeton de notification, version de l'app). Aucune donnée personnelle dans les journaux. | B |
| **RG-81** | Les statistiques anonymes n'utilisent aucun identifiant personnel et se désactivent dans les réglages (E26). | A |
| **RG-82** | L'hébergement des données personnelles hors du Sénégal est déclaré à la CDP avant le lancement public. | Organisation |
| **RG-83** | « À propos et sources » (E28) indique que seule la publication au Journal officiel fait foi, et liste les sources utilisées. | A |
