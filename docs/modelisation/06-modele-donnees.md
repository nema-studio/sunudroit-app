# 06 · Modèle de données

Deux bases, deux rôles :

| Base | Où | Rôle |
|---|---|---|
| **PostgreSQL** | Serveur (cloud européen) | Source de vérité : tout le corpus avec ses brouillons et son historique éditorial, les comptes, les dons |
| **SQLite** | Téléphone | (1) l'**édition** du corpus, en lecture seule, remplacée à chaque publication ; (2) une petite base **personnelle** (favoris, historique, file d'envoi) |

Conventions SQL : noms en `snake_case` sans accents, clés primaires `id`, dates en `timestamptz` (UTC),
dates juridiques en `date`, énumérations en `varchar` avec contrainte `CHECK`. Les migrations sont gérées par Flyway (DEC-12).
Noms des tables et colonnes **en anglais**, comme le code (DEC-18). Les sections ci-dessous autres que le corpus gardent
encore les noms français de la première modélisation : elles seront traduites quand chaque module sera développé,
en suivant la table de correspondance de [05](05-modele-domaine.md).

---

## PostgreSQL · Corpus

Tables et colonnes **en anglais**, comme le code (DEC-18). Les tables `legal_text` (V2, V3) et `amendment` (V4)
sont déjà créées par les migrations du backend ; les autres le seront dans cet ordre : `division`, `article`,
`article_version` et `paragraph`, puis `amendment_effect`, `editorial_note` et `cross_reference`.

```mermaid
erDiagram
    LEGAL_TEXT ||--|{ DIVISION : "structure"
    DIVISION |o--o{ DIVISION : "parent of"
    DIVISION ||--|{ DIVISION_VERSION : "headings"
    LEGAL_TEXT ||--|{ ARTICLE : "contains"
    DIVISION ||--o{ ARTICLE : "holds"
    ARTICLE ||--|{ ARTICLE_VERSION : "versions"
    ARTICLE_VERSION ||--|{ PARAGRAPH : "paragraphs"
    LEGAL_TEXT ||--|{ AMENDMENT : "register"
    AMENDMENT ||--o{ AMENDMENT_EFFECT : "effects"
    AMENDMENT ||--o{ ARTICLE_VERSION : "produces"
    AMENDMENT ||--o{ DIVISION_VERSION : "produces"
    AMENDMENT |o--o{ PARAGRAPH : "last changed"
    ARTICLE_VERSION ||--o{ EDITORIAL_NOTE : "annotated by"
    ARTICLE ||--o{ CROSS_REFERENCE : "source"
    LEGAL_TEXT ||--o{ CROSS_REFERENCE : "target"
    AMENDMENT_EFFECT }o--o| ARTICLE : "targets"
    AMENDMENT_EFFECT }o--o| DIVISION : "targets"
    AMENDMENT_EFFECT }o--o| ARTICLE_VERSION : "produced"

    LEGAL_TEXT {
        varchar id PK "constitution-2001"
        varchar type "CONSTITUTION, ORGANIC_LAW, DECISION"
        text official_title
        varchar short_title "LO 2016-23"
        text subject "nullable"
        date adoption_date "referendum for the Constitution"
        varchar article_id_prefix UK "const, lo-2016-23"
        varchar journal_number "nullable"
        date journal_date "nullable"
        int journal_page "nullable"
        varchar status "IN_FORCE, REPEALED, STRUCK_DOWN"
    }
    AMENDMENT {
        uuid id PK
        varchar legal_text_id FK
        varchar kind "ORIGINAL_ACT, CONSTITUTIONAL_LAW, REFERENDUM, ORGANIC_LAW"
        varchar number UK "2016-10, nullable"
        date act_date "nullable, never guessed"
        text title
        varchar journal_number "nullable"
        date journal_date "nullable"
        int journal_page "nullable"
        varchar legal_status "PROMULGATED, STRUCK_DOWN, DRAFT"
        varchar integration_status "TO_INTEGRATE, IN_PROGRESS, INTEGRATED"
    }
    DIVISION {
        uuid id PK
        varchar legal_text_id FK
        uuid parent_id FK "null at top level"
        varchar kind "PREAMBLE, TITLE, CHAPTER, SECTION, HEADING"
        varchar label "TITRE VI BIS, null for a HEADING"
        numeric position "order among siblings"
    }
    DIVISION_VERSION {
        uuid id PK
        uuid division_id FK
        text heading "DE L ASSEMBLEE NATIONALE, nullable"
        date valid_from
        date valid_to "null if current"
        bool date_uncertain
        bool repealed
        uuid amendment_id FK
        varchar editorial_status
    }
    ARTICLE {
        varchar id PK "const-art-25-1, never changes"
        varchar legal_text_id FK
        uuid division_id FK
        varchar kind "ARTICLE, PREAMBLE"
        varchar number "premier, 25-1, null for the preamble"
        varchar sort_key "00025.001"
    }
    ARTICLE_VERSION {
        uuid id PK
        varchar article_id FK
        date valid_from
        date valid_to "null if current"
        bool date_uncertain
        varchar change_kind "ORIGINAL, REPLACED, AMENDED, INSERTED, REPEALED"
        bool repealed
        uuid amendment_id FK
        varchar editorial_status
        uuid created_by FK "team_member"
    }
    PARAGRAPH {
        uuid id PK
        uuid article_version_id FK
        int position
        varchar kind "TEXT, LIST_ITEM"
        text content "plain text, for search"
        jsonb segments "text and clickable references"
        uuid changed_by_amendment_id FK "null if unchanged"
        varchar change_kind "INSERTED, REWRITTEN, WORDS_CHANGED"
    }
    AMENDMENT_EFFECT {
        uuid id PK
        uuid amendment_id FK
        varchar provision "Article premier, Article unique"
        varchar operation
        text official_wording "verbatim from the Journal"
        varchar target_article_id FK "one target per row"
        uuid target_division_id FK
        uuid produced_version_id FK
        bool applied
    }
    EDITORIAL_NOTE {
        uuid id PK
        uuid article_version_id FK
        int paragraph_position "null for the whole article"
        varchar kind
        text content
        text source
        varchar editorial_status
    }
    CROSS_REFERENCE {
        uuid id PK
        varchar source_article_id FK
        varchar kind "SPECIFIED_BY, CITED_BY, REFERS_TO"
        varchar label
        varchar target_legal_text_id FK
        uuid target_division_id FK
        varchar target_article_id FK
        varchar editorial_status
    }
```

Toutes les tables ont aussi `created_at`, `updated_at` (`timestamptz`) et `version` (`bigint`, verrouillage optimiste) ;
elles ne sont pas répétées dans le diagramme.

### Contraintes et index du corpus

| Contrainte | Implémentation PostgreSQL | Règle |
|---|---|---|
| Identifiant de texte lisible | `CHECK (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$')` (migration V2) | RG-01 |
| Un seul acte d'origine par texte | Index unique partiel sur `amendment (legal_text_id) WHERE kind = 'ORIGINAL_ACT'` (migration V4) | RG-05 |
| Numéro de révision unique | `UNIQUE (number)` ; plusieurs révisions sans numéro restent possibles | |
| Pas de chevauchement de versions validées d'un même article | `EXCLUDE USING gist (article_id WITH =, daterange(valid_from, valid_to) WITH &&) WHERE (editorial_status IN ('APPROVED', 'PUBLISHED'))` (extension `btree_gist`) | RG-04 |
| Une seule version en vigueur par article | Index unique partiel sur `article_id` où `valid_to IS NULL AND editorial_status IN ('APPROVED', 'PUBLISHED')` | RG-04 |
| Même règle pour les intitulés de division | Mêmes contraintes sur `division_version (division_id, …)` | RG-11 |
| Identifiant d'article jamais réutilisé | Pas de suppression physique d'un article ; `id` immuable | RG-01 |
| Numéro unique dans un texte | `UNIQUE (legal_text_id, number)` | RG-02 |
| Préfixe d'article unique | `UNIQUE (article_id_prefix)` sur `legal_text` | RG-01 |
| Révision non promulguée sans effet | Vérifié par le use case (`Amendment.canChangeTheLaw()`) : aucune `article_version` ne référence une révision `STRUCK_DOWN` ou `DRAFT` | RG-09 |
| Ordre des articles | Index sur `(legal_text_id, sort_key)` | RG-02 |
| Recherche plein texte côté back-office | Colonne générée `tsvector` sur `paragraph.content` avec la configuration `french` + `unaccent`, index GIN | |

**Identifiant d'article** : `article.id` = `legal_text.article_id_prefix` + `-art-` + numéro en chiffres, calculé **une fois**
à la création (`const-art-1` pour l'article premier, comme l'app l'utilise déjà ; `const-art-25-1`), jamais recalculé
même si l'article est renuméroté (RG-01).

**Clé de tri** (`sort_key`) : numéro principal sur 5 chiffres, suffixe sur 3 : `premier` → `00001.000`,
`25` → `00025.000`, `25-1` → `00025.001`, `66-1` → `00066.001`. Le libellé officiel reste dans `number`.

**Les versions validées et publiées** comptent toutes deux pour les contraintes de période : une version publiée
garde ses dates, elle ne sort pas de la règle de non-chevauchement.

---

## PostgreSQL · Atelier

```mermaid
erDiagram
    MEMBRE_EQUIPE ||--|{ MEMBRE_ROLE : "a les rôles"
    MEMBRE_EQUIPE ||--o{ RELECTURE : "relit"
    MEMBRE_EQUIPE ||--o{ EVENEMENT_AUDIT : "auteur"
    MEMBRE_EQUIPE ||--o{ EDITION : "publie"
    EDITION ||--o{ CHANGEMENT_EDITION : "notes de version"
    EDITION ||--|{ EDITION_CONTENU : "fige"
    SIGNALEMENT }o--|| ARTICLE : "concerne"
    SIGNALEMENT }o--o| SIGNALEMENT : "doublon de"

    MEMBRE_EQUIPE {
        uuid id PK
        varchar email UK
        varchar nom_complet
        varchar mot_de_passe_hache "Argon2id"
        text totp_secret_chiffre
        bool actif
        timestamptz cree_le
    }
    MEMBRE_ROLE {
        uuid membre_id FK
        varchar role "EDITEUR, RELECTEUR, ADMIN"
    }
    RELECTURE {
        uuid id PK
        varchar objet_type
        uuid objet_id
        uuid auteur_saisie_id FK
        uuid relecteur_id FK "différent de l'auteur"
        varchar decision "VALIDEE, RENVOYEE"
        text commentaire
        timestamptz date
    }
    EDITION {
        uuid id PK
        int numero UK
        date date_verification "corpus du"
        varchar statut "EN_PREPARATION, PUBLIEE, RETIREE"
        varchar fichier "edition-13.sqlite.gz"
        varchar empreinte_sha256
        bigint taille_octets
        int version_schema
        varchar version_app_min
        timestamptz publiee_le
        uuid publiee_par FK
    }
    EDITION_CONTENU {
        uuid edition_id FK
        varchar objet_type
        uuid objet_id "version figée"
    }
    CHANGEMENT_EDITION {
        uuid id PK
        uuid edition_id FK
        varchar nature
        text libelle "Rédaction vérifiée"
        varchar cible_id "const-art-92"
    }
    SIGNALEMENT {
        uuid id PK
        varchar reference UK "SIG-2611-0042"
        varchar article_id FK
        uuid version_article_id FK
        int position_alinea
        varchar type
        text description
        text source
        varchar email_contact
        uuid utilisateur_id FK
        uuid appareil_id FK
        varchar statut
        text reponse
        uuid traite_par FK
        uuid doublon_de FK
        timestamptz cree_le
    }
    EVENEMENT_AUDIT {
        bigint id PK
        uuid auteur_id FK
        varchar action "VERSION_VALIDEE"
        varchar objet_type
        varchar objet_id
        jsonb avant
        jsonb apres
        timestamptz date
        varchar adresse_ip
    }
```

- `EDITION_CONTENU` fige la liste exacte des versions publiées dans chaque édition : on peut toujours répondre
  « que lisait un utilisateur de l'édition 12 ? » (RG-22).
- `EVENEMENT_AUDIT` n'accepte que des insertions (droit `INSERT` seul pour le rôle applicatif) (RG-24).

---

## PostgreSQL · Compte, notification, don

```mermaid
erDiagram
    UTILISATEUR ||--o{ SESSION_RAFRAICHISSEMENT : "sessions"
    UTILISATEUR ||--o{ FAVORI : "favoris"
    UTILISATEUR ||--o{ ENTREE_HISTORIQUE : "historique V2"
    UTILISATEUR |o--o{ APPAREIL : "appareils"
    UTILISATEUR |o--o{ NOTIFICATION : "personnelles"
    NOTIFICATION ||--o{ NOTIFICATION_LUE : "lectures"
    UTILISATEUR ||--o{ NOTIFICATION_LUE : "a lu"
    NOTIFICATION ||--o{ ENVOI_PUSH : "envois"
    UTILISATEUR |o--o{ DON : "dons V2"
    DON ||--o{ EVENEMENT_PAIEMENT : "notifications prestataire"
    DON ||--o| RECU : "reçu"

    UTILISATEUR {
        uuid id PK
        varchar email UK "minuscules"
        varchar prenom "nul tant que non renseigné"
        varchar nom
        varchar statut "ACTIF, SUPPRESSION_DEMANDEE"
        timestamptz cree_le
        timestamptz derniere_connexion_le
        timestamptz suppression_demandee_le
    }
    DEMANDE_CODE {
        uuid request_id PK
        varchar email
        varchar code_hache
        int essais
        timestamptz expire_le
        varchar statut "EMISE, VERIFIEE, EXPIREE, BLOQUEE"
        varchar adresse_ip
        timestamptz cree_le
    }
    SESSION_RAFRAICHISSEMENT {
        uuid id PK
        uuid utilisateur_id FK
        uuid famille_id
        varchar jeton_hache UK
        timestamptz expire_le
        timestamptz revoquee_le
        uuid remplacee_par_id FK
        varchar libelle_appareil
        timestamptz cree_le
    }
    FAVORI {
        uuid id PK
        uuid utilisateur_id FK
        varchar cible_type "ARTICLE, TEXTE"
        varchar cible_id
        timestamptz modifie_le
        bool supprime
    }
    ENTREE_HISTORIQUE {
        uuid id PK
        uuid utilisateur_id FK
        varchar nature "LECTURE, VERIFICATION"
        varchar article_id
        varchar verdict
        timestamptz date
    }
    APPAREIL {
        uuid id PK
        uuid utilisateur_id FK "nul pour un visiteur"
        varchar jeton_push UK
        varchar plateforme
        varchar version_app
        int edition_installee
        bool notifications_revisions
        timestamptz dernier_contact_le
    }
    NOTIFICATION {
        uuid id PK
        varchar nature
        varchar titre
        text corps
        varchar lien "sunudroit://..."
        varchar portee "TOUS, PERSONNELLE"
        uuid utilisateur_id FK
        timestamptz cree_le
    }
    NOTIFICATION_LUE {
        uuid notification_id FK
        uuid utilisateur_id FK
        timestamptz lue_le
    }
    ENVOI_PUSH {
        uuid id PK
        uuid notification_id FK
        int destinataires
        int succes
        int echecs
        timestamptz envoye_le
    }
    DON {
        uuid id PK
        varchar reference UK "SD-2611-8F3K"
        int montant_fcfa
        varchar moyen "WAVE, ORANGE_MONEY"
        varchar statut
        uuid utilisateur_id FK
        varchar email_recu
        varchar id_paiement_prestataire UK
        timestamptz cree_le
        timestamptz expire_le
        timestamptz confirme_le
    }
    EVENEMENT_PAIEMENT {
        uuid id PK
        uuid don_id FK
        jsonb contenu
        bool signature_valide
        timestamptz recu_le
    }
    RECU {
        uuid id PK
        varchar numero UK "R-2026-000123"
        uuid don_id FK
        int montant_fcfa
        varchar nom_donateur "copié au moment du don"
        date date
        varchar fichier_pdf
    }
```

| Contrainte | Règle |
|---|---|
| `UNIQUE (utilisateur_id, cible_type, cible_id)` sur `favori` | RG-50 |
| `code_hache` : HMAC-SHA256 du code avec un secret serveur ; jamais le code en clair | RG-41 |
| `jeton_hache` : SHA-256 du jeton de rafraîchissement ; le jeton n'est connu que du téléphone | RG-42 |
| `UNIQUE (id_paiement_prestataire)` sur `don` : une notification de paiement rejouée ne crée pas de doublon | RG-61 |
| `montant_fcfa` entre 200 et 1 000 000 | RG-60 |

---

## SQLite · Édition du corpus (téléphone)

Un fichier par édition, généré par le serveur, **en lecture seule** sur le téléphone.
Il ne contient que les contenus **validés** : aucun brouillon, aucune donnée de l'équipe.

```mermaid
erDiagram
    META_EDITION {
        int numero
        text date_verification
        int version_schema
        text version_app_min
    }
    TEXTE ||--|{ DIVISION : "structure"
    DIVISION ||--|{ INTITULE_DIVISION : "versions"
    TEXTE ||--|{ ARTICLE : "contient"
    ARTICLE ||--|{ VERSION : "versions"
    VERSION ||--|{ ALINEA : "alinéas"
    VERSION ||--o{ NOTE : "notes"
    ARTICLE ||--o{ RENVOI : "renvois"
    REVISION ||--o{ VERSION : "produit"
    ARTICLE ||--|| RECHERCHE_FTS : "indexé"

    TEXTE {
        text id PK
        text type
        text intitule_officiel
        text intitule_court
        text objet
        text statut
    }
    DIVISION {
        text id PK
        text texte_id FK
        text parent_id
        text nature
        text libelle
        real position
    }
    INTITULE_DIVISION {
        text division_id FK
        text intitule
        text valide_du
        text valide_au
    }
    ARTICLE {
        text id PK
        text texte_id FK
        text division_id FK
        text numero
        text cle_tri
        text resume
    }
    VERSION {
        text id PK
        text article_id FK
        text valide_du
        text valide_au
        int date_incertaine
        int abrogee
        text revision_id FK
    }
    ALINEA {
        text version_id FK
        int position
        text nature
        text segments_json
    }
    NOTE {
        text version_id FK
        int position_alinea
        text nature
        text texte
    }
    RENVOI {
        text id PK
        text article_id FK
        text type
        text libelle
        text cible_texte_id
        text cible_division_id
        text cible_article_id
    }
    REVISION {
        text id PK
        text numero
        text date
        text intitule
        text jors
    }
    RECHERCHE_FTS {
        text article_id
        text version_id
        int en_vigueur
        text contenu "normalisé, sans accents"
    }
```

- `RECHERCHE_FTS` est une table virtuelle **FTS5** : recherche rapide et hors ligne, y compris dans les anciennes
  versions (filtre « Version : toutes » de E09). La tolérance aux fautes reste faite par `searchEngine.ts`.
- Taille estimée : quelques centaines de kilo-octets pour la Constitution et une loi organique, compressé en gzip.
- `version_schema` : si l'app ne connaît pas ce schéma, elle garde l'édition précédente et propose E39 (RG-27).

## SQLite · Données personnelles (téléphone)

Base séparée du corpus : elle survit au remplacement des éditions.

```mermaid
erDiagram
    FAVORI_LOCAL {
        text id PK
        text cible_type "ARTICLE, TEXTE"
        text cible_id
        text modifie_le
        int supprime
        int a_envoyer
    }
    HISTORIQUE_LOCAL {
        text id PK
        text nature "LECTURE, VERIFICATION"
        text article_id
        text verdict
        text citation "reste sur le téléphone"
        text date
    }
    FILE_ENVOI {
        text id PK
        text nature "SIGNALEMENT, SYNC_FAVORIS"
        text contenu_json
        int tentatives
        text prochaine_tentative
    }
    SYNC_ETAT {
        text cle PK "favoris"
        text jeton "dernier jeton de synchronisation"
    }
```

Les préférences (thème, taille du texte, langue, statistiques) restent dans le stockage clé-valeur déjà utilisé
(`expo-sqlite/kv-store`), la session dans `expo-secure-store` (RG-47).

---

## Dictionnaire des données (champs sensibles ou délicats)

| Champ | Signification exacte | Exemple | Piège à éviter |
|---|---|---|---|
| `article.id` | Identifiant permanent, construit une fois à la création | `const-art-25-1` | Ne jamais le recalculer depuis le numéro après une renumérotation |
| `article.numero` | Libellé officiel du numéro | `premier`, `25-1` | Ne pas convertir « premier » en « 1 » à l'affichage d'un texte officiel |
| `version_article.valide_du` | Date d'entrée en vigueur de cette rédaction | `2016-04-05` | Ce n'est pas toujours la date de la loi : vérifier la promulgation et la publication |
| `version_article.date_incertaine` | Vrai si la date n'est pas établie par une source | | Ne jamais inventer une date pour combler un trou (RG-08) |
| `version_article.valide_au` | Fin de validité, exclue | `2016-04-05` | Égale au `valide_du` de la version suivante |
| `alinea.segments` | Tableau ordonné `{nature: TEXTE, valeur}` ou `{nature: RENVOI, valeur, renvoiId}` | | La concaténation des valeurs doit égaler `texte_brut` |
| `revision.numero` | Numéro officiel de l'acte | `2016-10` | L'acte d'origine (`2001-03`) est aussi une révision |
| `effet_revision.formulation_officielle` | Phrase telle qu'au Journal officiel | « article supprimant les mots “et les sénateurs” » | Ne pas reformuler |
| `edition.date_verification` | Date à laquelle l'équipe a vérifié le corpus | `2026-11-21` | Affichée « Corpus du 21.11.2026 » (E01, E26, E28) |
| `don.statut` | Statut reçu du prestataire | | Ne jamais le modifier à partir d'une information venant de l'app (RG-61) |
