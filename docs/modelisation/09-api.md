# 09 · Contrat d'API

Ce document fixe **ce que l'app et le backend échangent**. Au démarrage du backend, il deviendra un fichier
**OpenAPI** dans le dépôt `sunudroit-api` ; les types TypeScript de l'app en seront générés (DEC-12).

## Conventions

| Sujet | Règle |
|---|---|
| Base | `https://api.<domaine>/api/v1` (domaine à choisir, Q-03) |
| Langue | Routes et champs JSON **en anglais** (`camelCase`), comme le contrat déjà codé dans l'app (DEC-16). Le domaine Java et la base restent en français. |
| Dates | ISO 8601 : `2026-11-22` pour une date juridique, `2026-11-22T14:05:00Z` pour un instant (UTC) |
| Montants | Entiers en FCFA (`amountFcfa: 2000`) |
| Identifiants | Chaînes ; identifiants permanents du corpus (`const-art-92`), UUID ailleurs |
| Authentification | En-tête `Authorization: Bearer <accessToken>` sur les routes marquées 🔒 |
| Erreurs | HTTP 4xx ou 5xx avec un corps *Problem Details* (RFC 9457) qui porte un `code` métier (voir plus bas) |
| Pagination | Par curseur : `?after=<curseur>&limit=50`, réponse `{ items, nextCursor }` |
| Idempotence | En-tête `Idempotency-Key` sur `POST /reports` et `POST /donations` : un même envoi rejoué ne crée pas de doublon |
| Limites de débit | Réponse 429 `RATE_LIMITED` avec l'en-tête `Retry-After` |
| Version de l'app | En-tête `X-App-Version` sur chaque appel (statistiques de compatibilité, RG-27) |

## Correspondance des termes

| Domaine (français) | API (anglais) |
|---|---|
| Texte, article, version, alinéa | text, article, version, paragraph |
| Révision | amendment |
| Édition du corpus | edition |
| Favori | favorite |
| Signalement | report |
| Appareil | device |
| Don, reçu | donation, receipt |

---

## Corpus (public)

Le corpus n'est **pas servi article par article** : l'app télécharge des éditions complètes (DEC-01).

| Méthode | Route | Description | Réponse |
|---|---|---|---|
| GET | `/corpus/editions/latest` | Dernière édition publiée | `{ number, verifiedOn, schemaVersion, minAppVersion, sizeBytes, sha256, url, changes: [{ kind, label, targetId }] }` |
| GET | `/corpus/editions/{number}` | Une édition précise | même forme |

Le champ `url` pointe vers le stockage objet ; le téléchargement ne passe pas par l'API et supporte la reprise (en-tête `Range`).

**Page web publique** (hors API JSON) : `GET https://<domaine>/a/{articleId}` affiche le texte en vigueur d'un article,
sa version et sa source, et propose d'ouvrir l'app (DEC-14).

---

## Authentification

| Méthode | Route | Corps | Réponse | Erreurs |
|---|---|---|---|---|
| POST | `/auth/email/request` | `{ email }` | `{ requestId, expiresIn, resendIn }` | `INVALID_EMAIL`, `RATE_LIMITED` |
| POST | `/auth/email/verify` | `{ requestId, code }` | `{ accessToken, refreshToken, expiresAt, user, isNewUser }` | `INVALID_CODE`, `CODE_EXPIRED`, `TOO_MANY_ATTEMPTS` |
| POST | `/auth/refresh` | `{ refreshToken }` | même forme que `verify`, sans `isNewUser` | `SESSION_REVOKED` |
| POST | `/auth/logout` | `{ refreshToken }` | 204 | |

`user` = `{ id, email, firstName, lastName }`. Ce contrat est **déjà implémenté côté app** (faux serveur compris).

## Compte 🔒

| Méthode | Route | Corps | Réponse | Notes |
|---|---|---|---|---|
| GET | `/me` | | `user` + compteurs `{ favorites, verifications, donations }` (E21) | |
| PATCH | `/me` | `{ firstName, lastName }` | `user` | Prénom 1 à 50 caractères, nom facultatif (RG-43) |
| POST | `/me/email/change` | `{ newEmail }` | `{ requestId, expiresIn, resendIn }` | Code envoyé à la **nouvelle** adresse (RG-44) |
| POST | `/me/email/change/verify` | `{ requestId, code }` | `user` | `EMAIL_TAKEN` si l'adresse a déjà un compte |
| DELETE | `/me` | `{ confirmation: "SUPPRIMER" }` | 204 | Suppression immédiate, purge à J+30 (RG-45) |

## Favoris 🔒

| Méthode | Route | Corps | Réponse |
|---|---|---|---|
| GET | `/me/favorites` | | `{ items: [favorite], syncToken }` |
| POST | `/me/favorites/sync` | `{ syncToken, changes: [{ targetType, targetId, modifiedAt, deleted }] }` | `{ items: [favorite], syncToken }` |

`favorite` = `{ targetType: ARTICLE \| TEXT, targetId, modifiedAt, deleted }`. Fusion décrite en RG-51.

## Historique 🔒 (V2)

| Méthode | Route | Corps | Réponse |
|---|---|---|---|
| POST | `/me/history/sync` | `{ syncToken, entries: [{ kind, articleId, verdict, at }] }` | `{ syncToken }` |
| DELETE | `/me/history` | | 204 |

La citation vérifiée n'est **jamais** envoyée (RG-55).

## Appareils (sans compte possible)

| Méthode | Route | Corps | Notes |
|---|---|---|---|
| PUT | `/devices/{deviceId}` | `{ pushToken, platform, appVersion, installedEdition, revisionAlerts }` | `deviceId` généré par l'app à l'installation. Avec un jeton 🔒, l'appareil est rattaché au compte. |
| DELETE | `/devices/{deviceId}` | | Notifications désactivées ou app réinitialisée |

## Signalements

| Méthode | Route | Corps | Réponse |
|---|---|---|---|
| POST | `/reports` | `{ articleId, versionId, paragraphPosition?, type, description, source?, contactEmail? }` | 201 `{ reference: "SIG-2611-0042" }` |
| GET | `/me/reports` 🔒 | | `{ items: [{ reference, articleId, status, answer, createdAt }] }` |

Sans compte, la réponse arrive par e-mail si `contactEmail` est fourni (RG-33). Limites : RG-32.

## Notifications 🔒 (V2)

| Méthode | Route | Corps | Réponse |
|---|---|---|---|
| GET | `/me/notifications?after=…` | | `{ items: [{ id, kind, title, body, link, createdAt, read }], nextCursor, unread }` |
| POST | `/me/notifications/read` | `{ ids }` ou `{ all: true }` | 204 |

## Dons (V2)

| Méthode | Route | Corps | Réponse | Notes |
|---|---|---|---|---|
| POST | `/donations` | `{ amountFcfa, method: WAVE \| ORANGE_MONEY, receiptEmail? }` | `{ donationId, reference, paymentUrl, expiresAt }` | 🔒 facultatif ; sans compte, `receiptEmail` requis pour un reçu |
| GET | `/donations/{donationId}` | | `{ status, amountFcfa, method, reference, confirmedAt }` | Appelé au retour dans l'app |
| GET | `/me/donations` 🔒 | | `{ totalFcfa, since, items }` (E20) | |
| GET | `/me/donations/{donationId}/receipt` 🔒 | | PDF | |
| POST | `/webhooks/wave` | (format Wave) | 200 | Signature vérifiée, idempotent (RG-61) |
| POST | `/webhooks/orange-money` | (format Orange Money) | 200 | Idem |

---

## Codes d'erreur

| Code | HTTP | Message affiché dans l'app (`authErrorMessage` et équivalents) |
|---|---|---|
| `INVALID_EMAIL` | 400 | « Cette adresse e-mail n'est pas valide. » |
| `INVALID_CODE` | 400 | « Code incorrect. Vérifiez l'e-mail et réessayez. » |
| `CODE_EXPIRED` | 400 | « Ce code a expiré. Demandez-en un nouveau. » |
| `TOO_MANY_ATTEMPTS` | 400 | « Trop d'essais. Demandez un nouveau code. » |
| `RATE_LIMITED` | 429 | « Trop de demandes. Patientez une minute. » |
| `SESSION_REVOKED` | 401 | (déconnexion silencieuse, retour en visiteur) |
| `UNAUTHENTICATED` | 401 | (tentative de rafraîchissement, sinon visiteur) |
| `EMAIL_TAKEN` | 409 | « Cette adresse est déjà utilisée par un autre compte. » |
| `VALIDATION_FAILED` | 400 | Message par champ (`errors: [{ field, code }]`) |
| `NOT_FOUND` | 404 | « Introuvable. » |
| `PAYMENT_PROVIDER_UNAVAILABLE` | 502 | « Wave est momentanément indisponible. Essayez Orange Money ou plus tard. » |
| `SERVICE_UNAVAILABLE` | 503 | E35 « Un souci de notre côté » |
| `NETWORK` (côté app) | | « Pas de connexion. Les textes restent lisibles hors ligne. » |

Exemple de réponse d'erreur :

```json
{
  "type": "https://<domaine>/errors/invalid-code",
  "title": "Code incorrect",
  "status": 400,
  "code": "INVALID_CODE",
  "detail": "Le code ne correspond pas à la demande.",
  "attemptsLeft": 3
}
```

---

## Back-office (pages web, pas d'API JSON)

| Route | Écran | Rôle requis |
|---|---|---|
| `/admin/connexion` | Connexion + 2e facteur | |
| `/admin` | Tableau de bord : relectures en attente, signalements nouveaux, registre des révisions | Tous |
| `/admin/revisions` | Registre des révisions (statuts juridique et d'intégration) | Éditeur |
| `/admin/textes/{id}` | Structure d'un texte (divisions, ordre, intitulés) | Éditeur |
| `/admin/articles/{id}` | Article : versions, alinéas, renvois, notes ; création d'une nouvelle version | Éditeur |
| `/admin/import` | Import d'un texte en brouillons | Éditeur |
| `/admin/relectures` | File de relecture avec comparaison côte à côte | Relecteur |
| `/admin/signalements` | File des signalements | Éditeur |
| `/admin/editions` | Préparation, contrôles, publication, notes de version | Administrateur |
| `/admin/notifications` | Envoi d'une notification à tous | Administrateur |
| `/admin/equipe` | Membres et rôles | Administrateur |
| `/admin/audit` | Journal d'audit, filtrable | Administrateur |
