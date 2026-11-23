# 05 · Modèle du domaine

Le domaine est découpé en **cinq modules**. Chacun deviendra un paquet Java du backend (voir [08](08-architecture.md)).
Un module ne lit pas directement les tables d'un autre : il passe par son service.

| Module | Rôle | Version |
|---|---|---|
| **corpus** | Le droit lui-même : textes, structure, articles, versions, révisions, renvois, notes | V1 |
| **atelier** | Le travail de l'équipe : relecture, éditions publiées, signalements, audit | V1 |
| **compte** | Utilisateurs, codes de connexion, sessions, favoris, historique, appareils | V1 |
| **notification** | Boîte de notifications et envois push | V1 (push d'édition), V2 (boîte) |
| **don** | Dons, paiements, reçus | V2 |

Ce document décrit les **concepts métier**. Les tables SQL précises sont dans [06](06-modele-donnees.md).

---

## Module corpus

Le droit est un **graphe** de textes reliés, pas une liste de PDF.
Les cas observés dans la Constitution (version annotée du Conseil constitutionnel) ont guidé chaque choix :

| Cas réel | Concept qui le gère |
|---|---|
| Préambule sans numéro, « partie intégrante » | `Division` de nature `PREAMBULE` contenant un `Article` de nature `PREAMBULE` |
| « TITRE VI BIS », « TITRE VII-1 » | `Division.libelle` (texte officiel) + `Division.position` (ordre) |
| Intertitres « MARIAGE ET FAMILLE », « TRAVAIL » | `Division` de nature `INTERTITRE` |
| « Article premier », articles 25-1, 66-1, 87-1 | `Article.numero` (texte officiel) + `Article.cleTri` (ordre) |
| Titre II renommé en 2016 | `VersionDivision` (intitulé versionné) |
| 9 lois de révision citées | `Revision` |
| « remplaçant l'article 4 », « supprimant les mots “et les sénateurs” » | `EffetRevision` avec sa formulation officielle |
| Alinéa inséré par la loi 2008-30 | `Alinea.insereParRevision` |
| « NB : rédaction malencontreuse », « modification annoncée non mise en œuvre » | `NoteEditoriale` |
| Énumérations des articles 6 et 8 | `Alinea` de nature `ELEMENT_LISTE` |
| Loi de 2026 adoptée puis censurée | `Revision.statutJuridique = CENSUREE`, sans effet |

```mermaid
classDiagram
    direction TB

    class Texte {
        +String id
        +TypeTexte type
        +String intituleOfficiel
        +String intituleCourt
        +String objet
        +LocalDate dateAdoption
        +ReferenceJors referenceJors
        +StatutTexte statut
    }

    class Division {
        +UUID id
        +NatureDivision nature
        +String libelle
        +BigDecimal position
    }

    class VersionDivision {
        +UUID id
        +String intitule
        +LocalDate valideDu
        +LocalDate valideAu
        +StatutEditorial statutEditorial
    }

    class Article {
        +String id
        +NatureArticle nature
        +String numero
        +String cleTri
        +String resume
        +List~String~ motsCles
    }

    class VersionArticle {
        +UUID id
        +LocalDate valideDu
        +LocalDate valideAu
        +boolean dateIncertaine
        +NatureChangement natureChangement
        +boolean abrogee
        +StatutEditorial statutEditorial
    }

    class Alinea {
        +UUID id
        +int position
        +NatureAlinea nature
        +List~Segment~ segments
    }

    class Segment {
        <<valeur>>
        +NatureSegment nature
        +String valeur
        +UUID renvoiId
    }

    class Revision {
        +UUID id
        +NatureRevision nature
        +String numero
        +LocalDate date
        +String intitule
        +ReferenceJors referenceJors
        +StatutJuridiqueRevision statutJuridique
        +StatutIntegration statutIntegration
    }

    class EffetRevision {
        +UUID id
        +String articleDeLaRevision
        +OperationEffet operation
        +String formulationOfficielle
        +boolean applique
    }

    class NoteEditoriale {
        +UUID id
        +NatureNote nature
        +String texte
        +String source
    }

    class Renvoi {
        +UUID id
        +TypeRenvoi type
        +String libelle
    }

    class ReferenceJors {
        <<valeur>>
        +String numero
        +LocalDate date
        +Integer page
    }

    Texte "1" *-- "1..*" Division : structure
    Division "0..1" o-- "0..*" Division : sous-divisions
    Division "1" *-- "1..*" VersionDivision : intitulés successifs
    Division "1" o-- "0..*" Article : contient
    Texte "1" *-- "1..*" Article : articles
    Article "1" *-- "1..*" VersionArticle : versions
    VersionArticle "1" *-- "1..*" Alinea : alinéas
    Alinea "1" *-- "1..*" Segment : segments
    Revision "1" *-- "0..*" EffetRevision : effets
    EffetRevision "0..*" --> "0..1" Article : cible
    EffetRevision "0..*" --> "0..1" Division : cible
    EffetRevision "0..1" --> "0..1" VersionArticle : produit
    VersionArticle "0..*" --> "1" Revision : issue de
    VersionDivision "0..*" --> "1" Revision : issue de
    Alinea "0..*" --> "0..1" Revision : inséré par
    NoteEditoriale "0..*" --> "1" VersionArticle : porte sur
    NoteEditoriale "0..*" --> "0..1" Alinea : précise
    Renvoi "0..*" --> "1" Article : depuis
    Renvoi "0..*" --> "1" Texte : vers
    Renvoi "0..*" --> "0..1" Division : section visée
    Renvoi "0..*" --> "0..1" Article : article visé
    Segment ..> Renvoi : lien cliquable
```

**Points de modélisation importants**

- **Identifiants permanents** : `Texte.id` (`constitution-2001`) et `Article.id` (`const-art-25-1`) sont des chaînes stables,
  écrites une fois, jamais réutilisées. Les favoris, les liens partagés et l'historique pointent vers eux (RG-01).
- **Une version est un instantané complet** de l'article. On ne stocke pas de différences : elles sont calculées à l'affichage (DEC-13).
- **« En vigueur » et « ancienne » ne sont pas stockés** : ils se déduisent des dates (`valideAu` vide = en vigueur à ce jour).
- **L'acte d'origine est une révision comme une autre** : la loi n° 2001-03 du 22 janvier 2001 est une `Revision`
  de nature `ACTE_ORIGINE`. Ainsi toute version a une révision source, sans cas particulier.
- **Une révision censurée ou non appliquée** existe dans le registre mais ne produit aucune version (RG-09).
  Un effet annoncé mais non mis en œuvre (article 84 en 2012) a `applique = false` et une note éditoriale l'explique.
- **Le rattachement d'un article à sa division** suit la structure actuelle. Si une révision déplace un article, on
  versionnera ce rattachement (cas non rencontré à ce jour, noté en Q-12).

### Énumérations du module corpus

| Énumération | Valeurs |
|---|---|
| `TypeTexte` | `CONSTITUTION`, `LOI_ORGANIQUE`, `DECISION` (V2) |
| `StatutTexte` | `EN_VIGUEUR`, `ABROGE`, `CENSURE` |
| `NatureDivision` | `PREAMBULE`, `TITRE`, `CHAPITRE`, `SECTION`, `INTERTITRE` |
| `NatureArticle` | `ARTICLE`, `PREAMBULE` |
| `NatureChangement` | `ORIGINELLE`, `REMPLACEMENT`, `MODIFICATION`, `INSERTION`, `ABROGATION` |
| `NatureAlinea` | `TEXTE`, `ELEMENT_LISTE` |
| `NatureSegment` | `TEXTE`, `RENVOI` |
| `NatureRevision` | `ACTE_ORIGINE`, `LOI_CONSTITUTIONNELLE`, `REFERENDUM`, `LOI_ORGANIQUE` |
| `StatutJuridiqueRevision` | `PROMULGUEE`, `CENSUREE`, `EN_PROJET` |
| `StatutIntegration` | `A_INTEGRER`, `EN_COURS`, `INTEGREE` |
| `OperationEffet` | `REMPLACE_ARTICLE`, `AJOUTE_ARTICLE`, `ABROGE_ARTICLE`, `INSERE_ALINEA`, `MODIFIE_ALINEA`, `SUPPRIME_MOTS`, `REMPLACE_MOTS`, `AJOUTE_DIVISION`, `MODIFIE_INTITULE` |
| `NatureNote` | `ERREUR_MATERIELLE`, `MODIFICATION_NON_APPLIQUEE`, `MOTS_SUBSISTANTS`, `PRECISION` |
| `TypeRenvoi` | `PRECISE_PAR` (un article renvoie à une loi organique), `CITE_PAR` (une décision cite l'article, V2), `RENVOIE_A` (renvoi interne : « article 63 ») |
| `StatutEditorial` | voir le cycle de vie dans [07](07-cycles-de-vie.md) |

---

## Module atelier

```mermaid
classDiagram
    direction LR

    class MembreEquipe {
        +UUID id
        +String email
        +String nomComplet
        +Set~Role~ roles
        +boolean actif
        +boolean doubleFacteurActif
    }

    class Relecture {
        +UUID id
        +TypeObjet objetType
        +UUID objetId
        +DecisionRelecture decision
        +String commentaire
        +Instant date
    }

    class Edition {
        +UUID id
        +int numero
        +LocalDate dateVerification
        +StatutEdition statut
        +String fichier
        +String empreinteSha256
        +long tailleOctets
        +int versionSchema
        +String versionAppMin
        +Instant publieeLe
    }

    class ChangementEdition {
        +UUID id
        +NatureChangementEdition nature
        +String libelle
        +String cibleId
    }

    class Signalement {
        +UUID id
        +String reference
        +TypeSignalement type
        +Integer positionAlinea
        +String description
        +String source
        +String emailContact
        +StatutSignalement statut
        +String reponse
        +Instant creeLe
    }

    class EvenementAudit {
        +UUID id
        +String action
        +TypeObjet objetType
        +String objetId
        +Json avant
        +Json apres
        +Instant date
        +String adresseIp
    }

    MembreEquipe "1" --> "0..*" Relecture : relit
    MembreEquipe "1" --> "0..*" Edition : publie
    Edition "1" *-- "0..*" ChangementEdition : notes de version
    Signalement "0..*" --> "1" Article : concerne
    Signalement "0..*" --> "0..1" VersionArticle : version lue
    Signalement "0..*" --> "0..1" Signalement : doublon de
    Signalement "0..*" --> "0..1" MembreEquipe : traité par
    Signalement "0..*" --> "0..1" Utilisateur : envoyé par
    EvenementAudit "0..*" --> "1" MembreEquipe : auteur
```

| Énumération | Valeurs |
|---|---|
| `Role` | `EDITEUR`, `RELECTEUR`, `ADMIN` |
| `DecisionRelecture` | `VALIDEE`, `RENVOYEE` |
| `TypeObjet` | `VERSION_ARTICLE`, `VERSION_DIVISION`, `RENVOI`, `NOTE`, `REVISION`, `EDITION`, `SIGNALEMENT`, `MEMBRE` |
| `StatutEdition` | `EN_PREPARATION`, `PUBLIEE`, `RETIREE` |
| `NatureChangementEdition` | `NOUVELLE_VERSION`, `REDACTION_VERIFIEE`, `PLAN_AJOUTE`, `NOUVEAU_TEXTE`, `NOTE_AJOUTEE`, `RENVOI_AJOUTE` (libellés visibles sur E34) |
| `TypeSignalement` | `TEXTE_DIFFERENT_JO`, `FAUTE`, `RENVOI_INCORRECT`, `VERSION_MANQUANTE`, `AUTRE` |
| `StatutSignalement` | voir [07](07-cycles-de-vie.md) |

**La relecture concerne toute saisie** : version d'article, intitulé de division, renvoi, note. Le relecteur
ne peut pas être l'auteur de la saisie (RG-21). Chaque action de l'équipe produit un `EvenementAudit` immuable (RG-24).

---

## Module compte

```mermaid
classDiagram
    direction LR

    class Utilisateur {
        +UUID id
        +String email
        +String prenom
        +String nom
        +StatutCompte statut
        +Instant creeLe
        +Instant suppressionDemandeeLe
    }

    class DemandeCode {
        +UUID requestId
        +String email
        +String codeHache
        +int essais
        +Instant expireLe
        +StatutDemandeCode statut
        +String adresseIp
    }

    class SessionRafraichissement {
        +UUID id
        +UUID familleId
        +String jetonHache
        +Instant expireLe
        +Instant revoqueeLe
        +String libelleAppareil
    }

    class Favori {
        +UUID id
        +TypeCible cibleType
        +String cibleId
        +Instant modifieLe
        +boolean supprime
    }

    class EntreeHistorique {
        +UUID id
        +NatureEntree nature
        +String articleId
        +Verdict verdict
        +Instant date
    }

    class Appareil {
        +UUID id
        +String jetonPush
        +Plateforme plateforme
        +String versionApp
        +int editionInstallee
        +boolean notificationsRevisions
        +boolean statistiquesAnonymes
        +Instant dernierContact
    }

    Utilisateur "1" *-- "0..*" SessionRafraichissement : sessions
    Utilisateur "1" *-- "0..*" Favori : favoris
    Utilisateur "1" *-- "0..*" EntreeHistorique : historique V2
    Utilisateur "0..1" o-- "0..*" Appareil : appareils
    SessionRafraichissement "0..1" --> "0..1" SessionRafraichissement : remplacée par
    Favori ..> Article : cible ARTICLE
    Favori ..> Texte : cible TEXTE
```

| Énumération | Valeurs |
|---|---|
| `StatutCompte` | `ACTIF`, `SUPPRESSION_DEMANDEE` |
| `StatutDemandeCode` | `EMISE`, `VERIFIEE`, `EXPIREE`, `BLOQUEE` |
| `TypeCible` | `ARTICLE`, `TEXTE` |
| `NatureEntree` | `LECTURE`, `VERIFICATION` |
| `Verdict` | `CONFORME`, `INEXACT`, `INTROUVABLE` |
| `Plateforme` | `IOS`, `ANDROID` |

- **Un compte est identifié par son `id`, jamais par son e-mail** : l'adresse peut changer (RG-44), et des connexions
  Google ou Apple pourront s'ajouter plus tard dans une classe `IdentiteExterne` sans toucher aux comptes existants (DEC-17).
- **Un appareil existe sans compte** : il reçoit les notifications d'édition même pour un visiteur.
  À la connexion, il est rattaché à l'utilisateur ; à la déconnexion, détaché.
- **Les favoris ne sont jamais effacés physiquement pendant la synchronisation** : `supprime = true` avec la date,
  pour que la suppression se propage aux autres téléphones (RG-51).

---

## Module notification

```mermaid
classDiagram
    direction LR

    class Notification {
        +UUID id
        +NatureNotification nature
        +String titre
        +String corps
        +String lien
        +Portee portee
        +Instant creeLe
    }

    class NotificationLue {
        +Instant lueLe
    }

    class EnvoiPush {
        +UUID id
        +int destinataires
        +int succes
        +int echecs
        +Instant envoyeLe
    }

    Notification "1" *-- "0..*" EnvoiPush : envois
    Notification "0..*" --> "0..1" Utilisateur : destinataire si personnelle
    NotificationLue "0..*" --> "1" Notification
    NotificationLue "0..*" --> "1" Utilisateur
```

| Énumération | Valeurs |
|---|---|
| `NatureNotification` | `CORPUS_MIS_A_JOUR`, `FAVORI_MODIFIE`, `RECU_DISPONIBLE`, `REPONSE_SIGNALEMENT`, `NOUVEAUTE` (types visibles sur E25) |
| `Portee` | `TOUS` (édition, nouveauté) ou `PERSONNELLE` (reçu, favori modifié, réponse) |

---

## Module don (V2)

```mermaid
classDiagram
    direction LR

    class Don {
        +UUID id
        +String reference
        +int montantFcfa
        +MoyenPaiement moyen
        +StatutDon statut
        +String emailRecu
        +String idPaiementPrestataire
        +Instant creeLe
        +Instant expireLe
        +Instant confirmeLe
    }

    class EvenementPaiement {
        +UUID id
        +Json contenu
        +boolean signatureValide
        +Instant recuLe
    }

    class Recu {
        +UUID id
        +String numero
        +int montantFcfa
        +String nomDonateur
        +LocalDate date
        +String fichierPdf
    }

    Don "0..*" --> "0..1" Utilisateur : donateur connecté
    Don "1" *-- "0..*" EvenementPaiement : notifications du prestataire
    Don "1" -- "0..1" Recu : reçu
```

| Énumération | Valeurs |
|---|---|
| `MoyenPaiement` | `WAVE`, `ORANGE_MONEY` |
| `StatutDon` | voir [07](07-cycles-de-vie.md) |

Le `Recu` copie le nom et le montant au moment du don : il reste valable même si le compte est supprimé (RG-45, RG-64).

---

## Côté application mobile

L'app ne connaît pas tout le domaine. Elle manipule :

| Donnée | Où | Synchronisée |
|---|---|---|
| Édition du corpus (textes, versions, renvois, notes, index de recherche) | Fichier SQLite en lecture seule | Remplacée à chaque nouvelle édition |
| Favoris | SQLite locale | Oui, avec un compte |
| Historique (lectures, vérifications, citations) | SQLite locale | Non en V1 ; verdicts seulement en V2, jamais la citation |
| Signalements et changements en attente d'envoi | File d'envoi locale | Envoyés au retour du réseau |
| Préférences (thème, taille du texte, langue, statistiques) | Stockage clé-valeur | Non (RG-47) |
| Session (jetons) | Stockage chiffré (Keychain, Keystore) | |
