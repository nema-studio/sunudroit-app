# SunuDroit · application mobile (base V2)

La Constitution du Sénégal et ses lois organiques, gratuites, hors ligne, sourcées.
Cette base reprend le design system V2 (maquette Figma) : polices, couleurs claires et sombres, composants et animations.

## Ce qui est prêt

| Écran | Fichier | État |
| --- | --- | --- |
| 01 · Ouverture animée | `src/components/brand/AnimatedSplash.tsx` | Complet |
| 02 · Bienvenue | `src/app/bienvenue.tsx` | Complet |
| 03 · Connexion par e-mail | `src/app/connexion.tsx` | Complet |
| 04 · Code reçu par e-mail | `src/app/code.tsx` | Complet |
| 04 bis · Votre nom (nouveau compte) | `src/app/nom.tsx` | Complet |
| 05 · Autoriser les notifications | `src/app/notifications.tsx` | Complet |
| 06 · Accueil | `src/app/(tabs)/index.tsx` | Complet, identique à la maquette |
| Barre de navigation flottante | `src/components/navigation/FloatingTabBar.tsx` | Complet |
| 21 · Mon espace (thème, déconnexion) | `src/app/profil.tsx` | Base |
| Rechercher | `src/app/(tabs)/recherche.tsx` | Base (moteur de recherche branché) |
| Vérifier, Favoris | `src/app/(tabs)/…` | État vide, à construire |

## Lancer le projet (Mac + simulateur iOS)

```bash
cd sunudroit-app
npm install
npx expo install --fix      # aligne toutes les versions sur le SDK 58
cp .env.example .env        # laisser EXPO_PUBLIC_API_URL vide = faux serveur
npx expo start --ios        # ou : npx expo start, puis touche « i »
```

Reanimated et Gesture Handler fonctionnent dans Expo Go. Pour les notifications, le mieux reste un build de développement : `npx expo run:ios`.

**Code de test** : en mode faux serveur, le code est `123456` (affiché sur l'écran). Le faux serveur garde les comptes créés : une adresse déjà utilisée saute l'écran du nom.
Pour revoir l'écran de bienvenue : supprimer l'app du simulateur, ou effacer la clé `app.onboarded`.

Vérifications sans lancer l'app :

```bash
npm run typecheck                 # TypeScript (strict)
npm run lint                      # ESLint (eslint-config-expo, flat config)
npm run check                     # logique métier : numéros, recherche, citations
npm run doctor                    # cohérence des versions avec le SDK
```

## Architecture

```
src/
  app/                    Routes (Expo Router, un fichier = un écran)
    _layout.tsx           Polices, fournisseurs, routes protégées, ouverture animée
    bienvenue.tsx         Premier lancement
    connexion.tsx code.tsx nom.tsx notifications.tsx
    profil.tsx
    (tabs)/               Accueil, Rechercher, Vérifier, Favoris + barre flottante
  theme/                  Design system : jetons, typographie, mouvement, thème clair/sombre/système
  components/
    ui/                   Text, Button, IconButton, Chip, Tag, Avatar, Logo, Screen, TopBar, PressableScale
    brand/                Écran d'ouverture animé
    navigation/           Barre flottante
    states/               États vides
  features/
    auth/                 E-mail, API (faux serveur ou Spring Boot), session sécurisée, contexte
    home/                 En-tête, collections, carte « Reprendre », carte « Vérifier »
    search/ verify/       Logique métier (reprise de la V1, testée)
  data/                   Corpus et dépôt (Repository pattern, prêt pour SQLite)
  config/env.ts           Variables EXPO_PUBLIC_*
```

Principes :
- **Aucune couleur en dur dans les écrans** : tout passe par `useTheme()`, donc le mode sombre ne demande aucune retouche. Les noms des jetons sont ceux des variables Figma.
- **Police** (`theme/typography.ts`) : Inter seule, comme les produits de référence (Apple, Zara, Linear) : la hiérarchie vient de la taille et de la graisse, pas d'un mélange de polices. Titres en SemiBold à interlettrage resserré, références juridiques en capitales espacées. Les écrans utilisent des rôles (`variant="headingL"`, `"bodySmall"`…), jamais une taille ou une police directement.
- **Mouvement** (`theme/motion.ts`) : aucune animation à ressort ni rebond. Courbes qui décélèrent doucement, distances courtes (8 à 16 px), durées brèves (140 à 450 ms), une seule source pour toute l'app (`enter()`, `fadeIn()`, `timing.*`).
- **Navigation** : `useRouter()` dans les composants (recommandation SDK 58). `Stack.Protected` avec `redirectTo` explicite : depuis le SDK 58, une garde fausse redirige au lieu de retirer la route. Après connexion, Connexion et Code sont retirés de l'historique.
- **Clavier** : `react-native-keyboard-controller` (`KeyboardAwareScrollView`), recommandé par Expo : le champ actif et son bouton restent au-dessus du clavier.
- **Reanimated 4** : valeurs partagées lues et écrites avec `.get()` / `.set()` (compatibles React Compiler), `scheduleOnRN` de react-native-worklets pour rappeler le JS.
- **Compte facultatif** : tout se lit sans compte. Le compte sert aux favoris synchronisés, à l'historique et aux reçus de dons.
- **Accessibilité** : rôles et libellés VoiceOver/TalkBack, cibles tactiles de 44 px minimum, taille de texte plafonnée à ×1,4. Les animations respectent « Réduire les animations ».

## L'écran d'accueil (`app/(tabs)/index.tsx`)

Principes : une action principale, tout le contenu visible, chaque élément à un seul geste, aucun doublon avec la barre d'onglets.
1. **Accueil** « Dalal ak Jamm » (« Bienvenue » en wolof) et avatar (vers Mon espace). Les notifications se règlent dans Mon espace.
2. **Recherche** : la toucher ouvre l'onglet Rechercher avec le clavier déjà actif.
3. **Parcourir** (`features/home/CollectionCards.tsx`) : la Constitution en carte vedette, les lois organiques et les décisions en tuiles. Chaque carte ouvre la recherche filtrée sur sa collection.
4. **Reprendre** : la dernière lecture.
5. **Vérifier une citation** (`features/home/VerifyCard.tsx`) : la fonction phare, expliquée en une phrase.

## Contrat avec le backend Spring Boot

Définir `EXPO_PUBLIC_API_URL=https://api.sunudroit.sn` dans `.env`. L'app appelle alors :

| Méthode | Route | Corps | Réponse |
| --- | --- | --- | --- |
| POST | `/api/v1/auth/email/request` | `{ email }` | `{ requestId, expiresIn, resendIn }` |
| POST | `/api/v1/auth/email/verify` | `{ requestId, code }` | `{ accessToken, refreshToken, expiresAt, user, isNewUser }` |
| PATCH | `/api/v1/me` (en-tête `Authorization: Bearer`) | `{ firstName, lastName }` | `user` |
| POST | `/api/v1/auth/refresh` | `{ refreshToken }` | même forme que verify |
| POST | `/api/v1/auth/logout` | `{ refreshToken }` | 204 |

Les erreurs sont renvoyées en HTTP 4xx avec `{ "code": "INVALID_CODE" }`. Codes possibles : `INVALID_EMAIL`, `INVALID_CODE`, `CODE_EXPIRED`, `TOO_MANY_ATTEMPTS`, `RATE_LIMITED`.
Côté serveur, il faut prévoir :
- un code à 6 chiffres envoyé par e-mail, haché, valable 10 minutes et limité à 5 essais ;
- le compte créé à la première vérification (`isNewUser: true`), le nom complété ensuite par `PATCH /me` ;
- une limite de demandes par adresse e-mail et par adresse IP ;
- SPF, DKIM et DMARC configurés sur le domaine d'envoi (sinon les codes arrivent dans les indésirables) ;
- un jeton d'accès JWT de 15 minutes et un jeton de rafraîchissement à rotation.

Les jetons sont stockés dans le trousseau du téléphone (`expo-secure-store`).

## Prochaines étapes conseillées

1. Écran Article (lecture, taille du texte, renvois cliquables), à partir de `data/repository.ts`.
2. Rafraîchissement automatique du jeton (intercepteur sur les appels authentifiés).
3. Corpus dans SQLite (`expo-sqlite`), avec la même interface `LegalRepository`.
4. Tests Jest (`jest-expo`) sur `features/auth` et `features/search`.
