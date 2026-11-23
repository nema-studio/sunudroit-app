# CLAUDE.md · SunuDroit

Ce fichier présente le projet à Claude Code. Lis-le en entier avant de modifier le code.

## Le projet en bref

SunuDroit est une application mobile qui donne accès **gratuitement** à la Constitution du Sénégal et à ses lois organiques. On peut y lire les textes hors ligne, suivre leurs versions successives, ouvrir les renvois d'un article à l'autre, vérifier une citation entendue et partager un article. Le développement est financé par des dons (Wave, Orange Money).

- **Public** : citoyens sénégalais, étudiants en droit, journalistes. Beaucoup ont un téléphone Android d'entrée de gamme et une connexion irrégulière. Les performances et le mode hors ligne comptent donc beaucoup.
- **Langue de l'interface** : français, avec quelques touches de wolof (« Dalal ak Jamm », « Jërëjëf »).
- **Compte facultatif** : tout se lit sans compte. Le compte (connexion par e-mail, avec un code à 6 chiffres, sans mot de passe) sert à synchroniser les favoris et l'historique, et à recevoir les reçus de dons.
- **Développeur** : Mamadou Lamine Diassy, développeur fullstack junior (Java/Spring Boot, React/TypeScript). Le backend sera en **Spring Boot**.

## Comment travailler avec Mamadou

- Réponds en **français**.
- **N'utilise jamais de tiret cadratin** dans les textes, commentaires, messages de commit ou textes de l'interface. Utilise des deux-points, des virgules, des parenthèses ou une nouvelle phrase.
- Il vient du web (React, Tailwind) : quand une notion est propre à React Native (worklets, zones sûres, `StyleSheet`, navigation native), explique-la en une ou deux phrases.
- Le style se fait avec `StyleSheet` et les jetons du thème, **pas avec Tailwind/NativeWind**. C'est un choix assumé pour garder le mode sombre et les animations simples.
- Avant un gros changement (nouvelle dépendance, changement d'architecture), propose et attends son accord.
- Après une modification, lance `npm run typecheck` (et `npm run lint`).

## Commandes

```bash
npm install
npx expo install --fix         # aligne les versions sur le SDK Expo
npx expo start --ios           # simulateur iOS (ou touche « i ») ; --clear après un changement de dépendances
npm run typecheck              # tsc --noEmit
npm run lint                   # ESLint (eslint-config-expo, flat config)
npm run check                  # tests de la logique : numéros, recherche, vérification
npm run doctor                 # compatibilité des dépendances (expo-doctor)
```

Pour ajouter une dépendance, utilise **`npx expo install <paquet>`** (jamais `npm install <paquet>`), pour obtenir la version compatible avec le SDK. N'utilise jamais `npm audit fix --force`.

## Stack

- Expo SDK 58, React Native 0.88, TypeScript 6 strict. L'alias `@/` pointe vers `src/`.
- **Expo Router** : un fichier dans `src/app` correspond à un écran. Les gardes de routes passent par `Stack.Protected`. Dans les composants, navigue avec `useRouter()` (recommandation SDK 58), pas avec l'objet `router` importé.
- **react-native-reanimated 4** (+ `react-native-worklets`) pour toutes les animations. N'utilise pas l'API `Animated` de React Native. Lis et écris les valeurs partagées avec `.get()` et `.set()` (compatibles React Compiler), et rappelle le JS depuis un worklet avec `scheduleOnRN` (pas `runOnJS`).
- `react-native-keyboard-controller` (`KeyboardAwareScrollView`, `KeyboardProvider` dans `_layout.tsx`) pour garder les champs au-dessus du clavier.
- `react-native-gesture-handler`, `react-native-svg`, `lucide-react-native` (icônes).
- `expo-secure-store` (jetons de session), `expo-sqlite/kv-store` (préférences simples), `expo-haptics`, `expo-notifications`.
- Police `@expo-google-fonts/inter` (Inter seule, voir le design system).
- Qualité : ESLint (`eslint.config.js`), `tsx` pour les scripts de `scripts/`.

## Architecture

```
src/
  app/                       Routes Expo Router
    _layout.tsx              Polices, fournisseurs, gardes de routes, écran d'ouverture
    bienvenue.tsx            02 · premier lancement
    connexion.tsx            03 · adresse e-mail
    code.tsx                 04 · code reçu par e-mail (6 chiffres, clavier intégré)
    nom.tsx                  04 bis · prénom (obligatoire) et nom (facultatif), nouveau compte ou modification
    notifications.tsx        05 · autorisation des notifications
    profil.tsx               21 · Mon espace (thème, notifications, déconnexion)
    (tabs)/                  Onglets avec la barre flottante
      index.tsx              06 · Accueil
      recherche.tsx          08 · Rechercher (filtre, suggestion de correction)
      verifier.tsx           13 · Vérifier (état vide)
      favoris.tsx            15 · Favoris (état vide)
  theme/                     Design system
    tokens.ts                Couleurs claires et sombres, espacements, rayons, ombres
    typography.ts            Police et échelle typographique (rôles)
    motion.ts                Durées, courbes et animations d'entrée
    ThemeProvider.tsx        useTheme(), useThemePreference()
  components/
    ui/                      Text, Button, IconButton, Chip, Tag, Avatar, Logo, Screen, TopBar, PressableScale
    brand/AnimatedSplash.tsx Écran d'ouverture animé
    navigation/FloatingTabBar.tsx
    states/EmptyState.tsx
  features/
    auth/                    email.ts, authApi.ts, sessionStore.ts, AuthProvider.tsx, types.ts
    home/                    HomeHeader, CollectionCards, ResumeCard, VerifyCard, collections
                             (HeroDeck.tsx : ancienne pile de cartes, plus utilisée)
    search/searchEngine.ts   Recherche tolérante aux fautes, accès direct « art 92 »
    verify/verifyQuote.ts    Comparaison d'une citation au texte officiel
  data/
    types.ts                 Modèle : LegalText, Article, ArticleVersion, Relation
    corpus.ts                Corpus de démonstration (en mémoire)
    repository.ts            Interface LegalRepository + implémentation en mémoire
  lib/text.ts                Normalisation (accents, casse), Levenshtein, initiales
  config/env.ts              Variables EXPO_PUBLIC_*
```

Règle de découpage : `app/` ne contient que des écrans qui assemblent des composants. La logique métier va dans `features/<domaine>/`, les composants réutilisables dans `components/`. La logique pure (sans React) reste testable avec un script dans `scripts/`.

## Le design system (à respecter strictement)

Direction voulue par Mamadou : une app qui ressemble à un produit conçu par des équipes expertes (références : Apple, Zara). Sobre, durable, authentique, **rien de tendance ni d'agressif**.

Les maquettes Figma restent la référence pour la mise en page. **L'app fait foi pour le style** : les écrans marqués « V4 (app) » dans Figma (« 01 · Ouverture et compte · V4 (app) », « 06 · Accueil · V4 (app) ») correspondent au code actuel ; les autres maquettes utilisent encore les anciennes polices. Les noms des jetons du code sont ceux des variables Figma (collection « Couleurs », modes Clair et Sombre).

**Couleurs** : n'écris jamais de couleur en dur dans un écran. Utilise `const t = useTheme();` puis `t.colors.paper`, `t.colors.surface`, `t.colors.ink`, `t.colors.inkMuted`, etc. Les couleurs de marque sont dans `brand` : vert `#0F7A47`, jaune `#F6C945`, corail `#EF5B3F`.
- Clair : fond `paper #EDECE7`, cartes `surface #FFFFFF`, texte `ink #121412`.
- Sombre : fond `#121412`, cartes `#1F221F`, texte `#F2F1EC`.
- Sur du jaune ou du corail, le texte est toujours `brand.inkFixed`, quel que soit le thème.
- Sur une carte de couleur, un bouton utilise la variante `onBrand` (fond sombre fixe).

**Texte** : une seule police, **Inter**. Pas de serif, pas de police « display » à la mode, pas de monospace. Utilise toujours le composant `Text` de `@/components/ui` avec une variante. **Aucun écran ne fixe `fontSize` ni `fontFamily` lui-même** : c'est ce qui garantit un rendu homogène.

| Variante | Graisse | Taille / interligne | Usage |
| --- | --- | --- | --- |
| `displayXl` | SemiBold | 40 / 46 | Très grands titres (rare) |
| `headingL` | SemiBold | 30 / 36 | Titre d'écran, titre de carte |
| `headingM` | SemiBold | 22 / 28 | Titre d'état vide, nom du profil |
| `headingS` | SemiBold | 20 / 26 | Titre de section, barre du haut |
| `legal` | Regular | 17 / 28 | Corps d'un article de loi |
| `body` / `bodyStrong` | Regular / SemiBold | 16 | Texte courant, titres de ligne |
| `bodySmall` / `bodySmallStrong` | Regular / SemiBold | 14 / 20 | Textes secondaires ; puces, onglets, petits liens |
| `button` | SemiBold | 16 | Boutons |
| `input` | Regular | 17 / 22 | Champs de saisie |
| `caption` / `captionStrong` | Regular / SemiBold | 12 / 16 | Mentions, erreurs |
| `ref` / `label` | SemiBold capitales | 11 / 14 | Références (« CONSTITUTION · ART. 92 »), titres de groupe |
| `numeric` | Medium tabulaire | 24 / 30 | Chiffres seuls (code à 6 chiffres, numéro d'article) |

Les titres ont un interlettrage resserré (réglé dans `typography.ts`). Tons disponibles (`tone`) : `default`, `muted`, `green`, `danger`, `onPrimary`, `onBrand`, `inkFixed`.

**Formes** : grille de 4 px (`space`), marge d'écran de 20. Rayons (`radius`) : étiquettes 10, tuiles 16, groupes 24, cartes 24 à 30, feuilles 36, pilules 999. Coins « continus » façon iOS (`borderCurve: 'continuous'`) sur les cartes. Peu d'ombres (`elevation`) : la profondeur vient des couleurs. Les boutons font 60 px de haut, les champs 54 à 60 px. Aucune cible tactile ne descend sous 44 px.

**Composants** : réutilise ceux de `components/ui` avant d'en créer un nouveau.
- `Button` : variantes `primary`, `secondary`, `danger`, `ghost`, `ghostDanger`, `onBrand`. Avec `arrow`, le bouton affiche la pastille jaune à flèche (action principale d'un écran).
- `IconButton` : variantes `surface` ou `solid`, avec `badge` en option.
- `PressableScale` : léger rétrécissement au toucher (0,98, sans rebond), vibration en option. À utiliser pour tout élément cliquable sur mesure.
- `TextField` : champ de saisie (libellé, icône facultative, contour actif ou en erreur, message d'erreur). À utiliser pour tout champ de formulaire.
- `Screen` (zones sûres et défilement), `TopBar` (retour, titre, action à droite ; sans historique, « Retour » mène à l'accueil).

**Animations** : douces, fluides, premium, **jamais de rebond**. Tout passe par `theme/motion.ts` :
- pas de `withSpring`, `springify()`, `ZoomIn`, bascule ni saut ;
- `withTiming` avec les configurations `timing.press`, `timing.fast`, `timing.base`, `timing.slow` (courbes qui décélèrent, 140 à 450 ms) ;
- entrées d'écran avec `entering={enter(index)}` (fondu + montée de 8 px, cascade de 60 ms), `fadeIn()`, `layoutTransition` ;
- distances courtes (8 à 16 px) ; « Réduire les animations » est respecté par ces configurations.

**Accessibilité** : renseigne `accessibilityRole` et `accessibilityLabel` sur tout élément interactif. La taille du texte est plafonnée à ×1,4.

**Textes de l'interface** : français soigné, apostrophe typographique (’), espace avant « : ? ! », guillemets « ». Pas de tiret cadratin.

## Navigation et authentification

`src/app/_layout.tsx` affiche ou masque les routes selon l'état de `useAuth()` :
- `onboarded === false` : seul l'écran `bienvenue` est accessible ;
- ensuite, les onglets et `profil` deviennent accessibles ;
- `connexion`, `code` et `notifications` restent accessibles en permanence (on peut se connecter depuis n'importe où).

**Piège SDK 58** : chaque `Stack.Protected` doit avoir un `redirectTo` explicite. Sans lui, une garde fausse redirige vers le premier écran non protégé (au premier lancement, l'app s'ouvrait sur Connexion au lieu de Bienvenue).

Ne mets pas de logique « si connecté alors redirige » dans les écrans : modifie les gardes du layout.

Parcours de connexion (un seul pour l'inscription et la connexion) : `connexion` (e-mail, validé par `features/auth/email.ts`) → `requestCode(email)` → `code` → `verifyCode()` renvoie `{ isNewUser }` → `router.dismissAll()` puis `nom` pour un nouveau compte, sinon directement `notifications` → accueil (`router.dismissTo('/')`). Connexion et Code ne restent jamais dans l'historique après un succès. `nom` sert aussi à modifier son nom depuis Mon espace (`/nom?mode=edit`) ; c'est une route protégée (session obligatoire).

Les notifications se règlent depuis Mon espace (ligne « Notifications »). Pas de cloche sur l'accueil tant qu'il n'y a pas de boîte de réception.

**Outils de développement** : en `__DEV__` uniquement (Expo Go), Mon espace affiche une section « Développement » pour rejouer l'écran d'ouverture (`replaySplash()` de `components/brand/splashReplay.ts`), revoir Bienvenue (`resetOnboarding()` de `useAuth()`) et ouvrir la connexion. Elle n'apparaît jamais dans l'app publiée.

`useAuth()` expose : `status` (`loading` | `guest` | `signedIn`), `user`, `onboarded`, `pending` (demande de code en cours), `completeOnboarding()`, `requestCode(email)` (renvoie `{ requestId, expiresIn, resendIn }`), `verifyCode(code)` (renvoie `{ isNewUser }`), `updateProfile({ firstName, lastName })` et `signOut()`. Le nom affiché se calcule avec `fullName(user)` de `features/auth/types.ts`.

`features/auth/authApi.ts` contient deux implémentations de l'interface `AuthApi` :
- **MockAuthApi** si `EXPO_PUBLIC_API_URL` est vide. Le code valide est `123456`. Les comptes créés sont gardés sur le téléphone : une adresse déjà utilisée saute l'écran du nom.
- **HttpAuthApi** vers le backend Spring Boot.

Les jetons sont stockés dans `expo-secure-store`, jamais dans `kv-store` ni AsyncStorage.

**Barre d'onglets personnalisée** : avec Expo Router 58, le `tabBar` reçoit `{ state, descriptors, emitter, navigateToTab, insets }` (plus de prop `navigation`). On émet `tabPress` avec `emitter.emit(...)` puis on change d'onglet avec `navigateToTab(route.key)`.

## Contrat de l'API Spring Boot

Base : `EXPO_PUBLIC_API_URL`, préfixe `/api/v1`.

| Méthode | Route | Corps | Réponse |
| --- | --- | --- | --- |
| POST | `/auth/email/request` | `{ email }` | `{ requestId, expiresIn, resendIn }` |
| POST | `/auth/email/verify` | `{ requestId, code }` | `{ accessToken, refreshToken, expiresAt, user, isNewUser }` |
| PATCH | `/me` (en-tête `Authorization: Bearer`) | `{ firstName, lastName }` | `user` |
| POST | `/auth/refresh` | `{ refreshToken }` | même forme que `verify` |
| POST | `/auth/logout` | `{ refreshToken }` | 204 |

Les erreurs arrivent en 4xx avec `{ "code": "..." }`. Les codes possibles sont `INVALID_EMAIL`, `INVALID_CODE`, `CODE_EXPIRED`, `TOO_MANY_ATTEMPTS` et `RATE_LIMITED`. Le message affiché à l'utilisateur se trouve dans `authErrorMessage()` de `features/auth/types.ts`.

Si tu ajoutes un appel au backend, mets le type de la réponse dans `features/<domaine>/types.ts` et décris la route dans le README.

## Modélisation (référence avant le backend)

La modélisation complète de l'app et du backend Spring Boot est dans **`docs/modelisation/`** : périmètre, 42 cas d'utilisation, inventaire des 35 écrans de la maquette et écarts avec les décisions, scénarios, modèle du domaine, tables PostgreSQL et SQLite, cycles de vie, architecture, contrat d'API, 56 règles métier (`RG-xx`), décisions (`DEC-xx`) et questions ouvertes (`Q-xx`). Diagrammes en Mermaid. Avant toute évolution du modèle ou de l'API, mets ces documents à jour ; cite les règles dans le code (`// RG-04`). Le modèle actuel de `src/data/types.ts` est une version simplifiée qui sera alignée sur cette modélisation.

## Modèle de données juridique

- `LegalText` : un texte (Constitution, loi organique). `Article` : un article, avec un **identifiant stable** (`const-art-92`) distinct du numéro affiché, car une révision peut renuméroter un article. Les favoris pointent toujours vers l'identifiant.
- `ArticleVersion` : chaque version d'un article, avec ses dates et la révision qui l'a modifié. Les alinéas sont découpés en segments, pour que certains mots soient des **renvois cliquables** (`Relation`).
- Les écrans passent toujours par l'interface `LegalRepository` (`data/repository.ts`), jamais directement par `corpus.ts`. L'implémentation en mémoire sera remplacée par SQLite sans toucher aux écrans.
- Le contenu juridique doit rester exact : n'invente jamais le texte d'un article. Pour ajouter des données de test, marque-les clairement comme fictives.

## L'accueil (`src/app/(tabs)/index.tsx`)

Refait avec Mamadou selon des principes UX précis : **une action principale, tout le contenu visible, chaque élément à un seul geste, aucun doublon avec la barre d'onglets**.
1. **En-tête** (`HomeHeader`) : « Dalal ak Jamm » et l'avatar (vers Mon espace).
2. **Recherche** : la toucher ouvre l'onglet Rechercher avec le champ déjà actif (paramètre `focus`).
3. **Parcourir** (`CollectionCards`) : Constitution en carte vedette verte, lois organiques (jaune) et décisions (corail) en tuiles. Chaque carte ouvre la recherche filtrée (paramètre `type`).
4. **Reprendre** (`ResumeCard`) : la dernière lecture (paramètre `q`).
5. **Vérifier une citation** (`VerifyCard`) : la fonction phare, expliquée en une phrase.

Un fond fixe sous la barre d'état empêche le contenu de défiler sous l'heure. `HeroDeck.tsx` (ancienne pile de cartes animée) n'est plus utilisé : il sera supprimé une fois le nouvel accueil validé.

## Paramètres de l'écran Rechercher

- `?type=constitution|lois|decisions` : filtre sur un type de texte, affiché en puce retirable.
- `?q=art%2092` : requête pré-remplie.
- `?focus=<valeur>` : met le champ au premier plan (une valeur différente à chaque appel).

## Feuille de route (écrans de la maquette à construire)

Ordre conseillé :
1. **Article** (lecture) : texte en variante `legal`, taille réglable, renvois cliquables, badge « en vigueur », historique des versions, favori, partage.
2. **Recherche complète** : extraits avec mots surlignés, résultats cliquables vers l'article. (Le filtre par type et la suggestion de correction existent déjà.)
3. **Vérifier une citation**, branché sur `verifyQuote.ts`.
4. **Favoris et historique**, stockés en local puis synchronisés quand l'utilisateur est connecté.
5. **Dons** (Wave, Orange Money) et reçu.
6. **Mon espace complet** : taille du texte, à propos, sources officielles.
7. Technique : rafraîchissement automatique du jeton, corpus dans SQLite, tests Jest (`jest-expo`), development build pour les notifications push (Expo Go ne les prend pas en charge, d'où les avertissements `expo-notifications` au démarrage).

Pour chaque nouvel écran, demande à Mamadou la capture ou le lien Figma de la maquette correspondante si tu ne l'as pas.
