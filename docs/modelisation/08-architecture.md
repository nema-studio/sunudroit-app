# 08 · Architecture

Présentée en trois niveaux de zoom, inspirés du modèle C4 : le **contexte** (le système et son entourage),
les **conteneurs** (les applications et bases), les **composants** (les modules du backend).

---

## Niveau 1 · Contexte

```mermaid
flowchart TB
    CIT(["👥 Citoyens, étudiants, journalistes<br/>application mobile"])
    EQ(["👥 Équipe éditoriale<br/>navigateur web"])

    SD["🏛️ SunuDroit"]

    JO[["Journal officiel<br/>(consulté par l'équipe)"]]
    MAIL[["Service d'e-mail<br/>Brevo"]]
    PUSH[["Expo Push<br/>→ Apple APNs, Google FCM"]]
    PAY[["Wave, Orange Money<br/>V2"]]
    STORES[["App Store, Google Play"]]

    CIT -->|"lit, cherche, vérifie hors ligne<br/>synchronise ses favoris"| SD
    EQ -->|"saisit, relit, publie"| SD
    EQ -.->|"recherche des révisions"| JO
    SD -->|"codes de connexion, reçus"| MAIL
    SD -->|"nouvelle édition, reçus"| PUSH
    SD <-->|"paiements des dons"| PAY
    STORES -->|"installe l'app<br/>avec une édition embarquée"| CIT
```

---

## Niveau 2 · Conteneurs

```mermaid
flowchart LR
    subgraph PHONE["📱 Téléphone"]
        APP["App mobile<br/>Expo · React Native · TypeScript"]
        ED[("Édition du corpus<br/>SQLite, lecture seule")]
        PERSO[("Données personnelles<br/>SQLite : favoris, historique, file d'envoi")]
        SEC[("Session<br/>Keychain, Keystore")]
        APP --- ED & PERSO & SEC
    end

    subgraph CLOUD["☁️ Cloud européen géré"]
        API["Backend Spring Boot<br/>API REST + back-office web<br/>Java 25"]
        PG[("PostgreSQL<br/>source de vérité")]
        S3[("Stockage objet S3<br/>fichiers des éditions, reçus PDF")]
        API --- PG
        API -->|"dépose"| S3
    end

    BROWSER["🖥️ Navigateur de l'équipe<br/>pages Thymeleaf + htmx"]

    APP -->|"HTTPS JSON<br/>/api/v1/…"| API
    APP -->|"HTTPS<br/>téléchargement direct"| S3
    BROWSER -->|"HTTPS, session<br/>/admin/…"| API
    API -->|"API"| MAIL[["Brevo"]]
    API -->|"API"| PUSH[["Expo Push"]]
    API <-->|"API + webhooks signés"| PAY[["Wave, Orange Money"]]
```

| Conteneur | Technologie | Responsabilité | Ne fait pas |
|---|---|---|---|
| App mobile | Expo SDK 58, Expo Router, Reanimated, SQLite | Toute la lecture, la recherche, la vérification, hors ligne ; compte ; envoi des signalements | Pas de logique éditoriale ; ne modifie jamais le corpus |
| Backend Spring Boot | Java 25, Spring Boot 4, Spring Security, Spring Data JPA, Flyway, Thymeleaf, htmx | API de l'app, back-office, génération des éditions, envois d'e-mails et de notifications | Pas de rendu des textes pour l'app (elle les a déjà) |
| PostgreSQL | PostgreSQL géré (version stable récente) | Données de référence, brouillons, comptes, audit | |
| Stockage objet | S3 compatible (Scaleway, Clever Cloud Cellar…) | Sert les fichiers d'édition et les reçus, avec un CDN si besoin | |

> Les versions exactes (Java, Spring Boot, PostgreSQL) seront confirmées au démarrage du backend : on prendra les dernières versions **stables à support long**.

---

## Niveau 3 · Modules du backend

Un **monolithe modulaire** : une seule application à déployer, découpée en modules aux frontières claires (DEC-02).
Spring Modulith permet de vérifier automatiquement qu'aucun module n'utilise l'intérieur d'un autre.

```mermaid
flowchart TB
    subgraph SB["sn.sunudroit (Spring Boot)"]
        direction TB
        subgraph WEB["Entrées"]
            RESTAPP["api · contrôleurs REST de l'app"]
            ADMIN["backoffice · contrôleurs Thymeleaf + htmx"]
            HOOKS["webhooks · Wave, Orange Money (V2)"]
        end
        subgraph MOD["Modules métier"]
            CORPUS["corpus<br/>textes, versions, révisions, renvois, notes"]
            ATELIER["atelier<br/>relecture, éditions, signalements, audit"]
            COMPTE["compte<br/>utilisateurs, codes, sessions, favoris, appareils"]
            NOTIF["notification<br/>boîte, envois push"]
            DON["don<br/>dons, paiements, reçus (V2)"]
        end
        subgraph INFRA["Infrastructure partagée"]
            SECU["securite · JWT app, session back-office, 2e facteur"]
            MAILER["mail · modèles d'e-mails, envoi"]
            STORE["stockage · fichiers S3"]
            JOBS["taches · purge, expiration, relances"]
        end
    end

    RESTAPP --> CORPUS & COMPTE & ATELIER & NOTIF & DON
    ADMIN --> CORPUS & ATELIER & COMPTE & NOTIF
    HOOKS --> DON
    ATELIER -->|"lit les versions validées"| CORPUS
    ATELIER -.->|"événement : édition publiée"| NOTIF
    DON -.->|"événement : don confirmé"| NOTIF
    COMPTE --> MAILER
    DON --> MAILER
    ATELIER --> STORE
    DON --> STORE
    JOBS --> COMPTE & DON
```

**Organisation d'un module** (exemple `corpus`, DEC-20) : d'abord par sujet, puis par couche.

```
sn.sunudroit.corpus
├── package-info.java           ← le module ; sa racine est la seule partie visible des autres modules
├── legaltext/                  ← un sujet
│   ├── domain/                 ← LegalText (entité JPA + règles), enums, LegalTextRepository, exceptions
│   ├── application/            ← command/ et usecase/ (un use case par action), port/ si système extérieur
│   └── api/                    ← LegalTextController, requêtes, réponses, gestion des erreurs
├── amendment/                  ← même découpage
└── article/                    ← même découpage (à venir)
```

Spring Modulith vérifie ces frontières dans un test (`ModularityTests`) : un module qui utilise une classe interne
d'un autre fait échouer ce test.

Les modules communiquent par **appel de service** (lecture) ou par **événement** (« édition publiée », « don confirmé »),
ce qui évite les dépendances circulaires.

---

## La chaîne de publication hors ligne

Le cœur de l'architecture : l'app lit **son** fichier, le serveur ne fait que produire des fichiers.

```mermaid
flowchart LR
    A["Saisies validées<br/>PostgreSQL"] --> B["Générateur d'édition<br/>module atelier"]
    B --> C["edition-13.sqlite<br/>+ index FTS5"]
    C --> D["Contrôles automatiques<br/>(voir 07 §4)"]
    D -->|"OK"| E["gzip + SHA-256"]
    E --> F[("Stockage objet")]
    E --> G["Edition 13 = PUBLIÉE<br/>+ notes de version"]
    G --> H["Notification push"]
    F --> I["📱 App : télécharge,<br/>vérifie, bascule"]
    D -->|"échec"| X["Rien n'est publié<br/>rapport à l'administrateur"]
```

- **Édition embarquée** : chaque version de l'app sur les stores contient la dernière édition au moment de sa construction.
  Une première installation fonctionne donc **sans réseau**.
- **Fichier complet compressé** en V1 (quelques centaines de Ko). Des mises à jour différentielles seront envisagées
  si le corpus grossit (codes, décisions).
- **Compatibilité** : chaque édition déclare `version_schema` et `version_app_min` (RG-27).

---

## Synchronisation des favoris

- Chaque favori porte `modifie_le` et `supprime` (suppression logique).
- L'app envoie ses changements depuis le dernier **jeton de synchronisation** ; le serveur fusionne élément par élément,
  le plus récent l'emporte, et renvoie l'état fusionné et un nouveau jeton (RG-51).
- Si l'horloge du téléphone est fausse, le serveur borne `modifie_le` à son heure de réception.

---

## Sécurité

| Sujet | Mesure | Règle |
|---|---|---|
| Transport | HTTPS partout (TLS 1.2 minimum), HSTS sur le back-office | |
| Connexion de l'app | Code à 6 chiffres par e-mail ; jeton d'accès JWT 15 min ; jeton de rafraîchissement 30 jours à rotation, détection de réutilisation | RG-41, RG-42 |
| Back-office | Comptes nominatifs, mot de passe Argon2id, 2e facteur (TOTP), session courte, protection CSRF, rôles | DEC-11 |
| Limites de débit | Par adresse e-mail et par IP sur les codes ; par appareil et IP sur les signalements | RG-41, RG-32 |
| Webhooks de paiement | Signature vérifiée, idempotence par identifiant de paiement | RG-61 |
| Intégrité des éditions | Empreinte SHA-256 vérifiée par l'app avant installation | RG-28 |
| Données personnelles | Minimisation, chiffrement au repos (fourni par l'hébergeur), sauvegardes chiffrées, purge à 30 jours | RG-45, RG-80 |
| Secrets | Variables d'environnement de l'hébergeur, jamais dans le dépôt | |
| Journalisation | Pas d'e-mail ni de code dans les journaux ; identifiants techniques seulement | RG-80 |

---

## Déploiement

```mermaid
flowchart TB
    DEV["💻 Poste de Mamadou<br/>Docker : PostgreSQL local"] -->|"git push"| GH["GitHub<br/>dépôt sunudroit-api"]
    GH -->|"intégration continue<br/>tests + Testcontainers"| CI["GitHub Actions"]
    CI -->|"branche main"| STG["Environnement de recette<br/>cloud européen"]
    STG -->|"validation manuelle"| PROD["Production<br/>cloud européen"]
    PROD --- PGP[("PostgreSQL géré<br/>sauvegardes quotidiennes, 30 jours")]
    PROD --- S3P[("Stockage objet")]
```

| Environnement | Usage | Données |
|---|---|---|
| Local | Développement | Corpus 2018 de démonstration, faux serveur d'e-mail |
| Recette | Essais avec l'app en version de test | Copie anonymisée de la production |
| Production | Utilisateurs | Réelles |

**Observabilité** : Spring Boot Actuator (santé, métriques), journaux structurés, alerte si l'API est indisponible
(l'écran E35 « Erreur 503 » doit rester rare). Les textes restant lisibles hors ligne, une panne du serveur n'empêche
jamais la lecture.
