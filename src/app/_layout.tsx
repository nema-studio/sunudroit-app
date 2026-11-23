/**
 * ============================================================================
 * RACINE DE L'APPLICATION
 * ============================================================================
 *
 * 1. Garde le splash natif tant que les polices ne sont pas chargées.
 * 2. Installe les fournisseurs : gestes, zones sûres, clavier, thème, authentification.
 * 3. Déclare la navigation avec des routes PROTÉGÉES (Stack.Protected) :
 *      - « bienvenue » n'existe que tant qu'elle n'a pas été vue ;
 *      - l'app (onglets, Mon espace) n'existe qu'après la bienvenue ;
 *      - connexion / code / notifications restent accessibles (compte facultatif) ;
 *      - « nom » n'existe qu'avec une session.
 *    Quand l'état change, Expo Router redirige tout seul : aucun écran ne
 *    contient de logique « si connecté alors… ».
 * 4. Superpose l'écran d'ouverture animé à chaque lancement.
 *
 * Note SDK 58 : une route protégée reste déclarée ; quand sa garde est fausse,
 * Expo Router affiche une redirection (vers l'ancre du navigateur, ou vers
 * `redirectTo` si on le précise) au lieu de la retirer.
 */
import { useCallback, useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { StatusBar } from 'expo-status-bar';
import { fontAssets, ThemeProvider, useTheme } from '@/theme';
import { AuthProvider, useAuth } from '@/features/auth/AuthProvider';
import { AnimatedSplash } from '@/components/brand/AnimatedSplash';
import { useSplashReplayCount } from '@/components/brand/splashReplay';

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootNavigator() {
  const { onboarded, status } = useAuth();
  const theme = useTheme();
  const [splashVisible, setSplashVisible] = useState(true);

  // Outil de développement (Mon espace) : rejouer l'écran d'ouverture.
  // Ajustement pendant le rendu plutôt qu'un useEffect : pas de rendu en cascade.
  const replayCount = useSplashReplayCount();
  const [shownReplay, setShownReplay] = useState(replayCount);
  if (replayCount !== shownReplay) {
    setShownReplay(replayCount);
    setSplashVisible(true);
  }

  // Couleur de fond native (visible pendant les transitions et le clavier).
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(theme.colors.paper).catch(() => {});
  }, [theme.colors.paper]);

  const hideSplash = useCallback(() => setSplashVisible(false), []);

  return (
    <>
      {/* Barre d'état lisible sur le fond du thème (les écrans peuvent la surcharger). */}
      <StatusBar style={theme.scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.paper },
          animation: 'slide_from_right',
        }}
      >
        {/* `redirectTo` est indispensable depuis le SDK 58 : sans lui, une garde
            fausse redirige vers le premier écran non protégé (ici Connexion). */}
        <Stack.Protected guard={!onboarded} redirectTo="/">
          <Stack.Screen name="bienvenue" options={{ animation: 'fade' }} />
        </Stack.Protected>

        <Stack.Protected guard={onboarded} redirectTo="/bienvenue">
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
          <Stack.Screen name="profil" />
        </Stack.Protected>

        <Stack.Screen name="connexion" />
        <Stack.Screen name="code" />

        {/* Nom : seulement avec une session (nouveau compte ou modification). */}
        <Stack.Protected guard={status === 'signedIn'} redirectTo="/connexion">
          <Stack.Screen name="nom" options={{ gestureEnabled: false }} />
        </Stack.Protected>
        <Stack.Screen name="notifications" options={{ animation: 'fade', gestureEnabled: false }} />
      </Stack>

      {/* `key` remonte le composant à chaque relecture : l'animation repart de zéro. */}
      {splashVisible && <AnimatedSplash key={replayCount} ready={status !== 'loading'} onDone={hideSplash} />}
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);

  useEffect(() => {
    // Le splash natif et l'écran animé ont le même vert : on peut lâcher le natif.
    if (fontsLoaded || fontError) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <KeyboardProvider>
          <ThemeProvider>
            <AuthProvider>
              <RootNavigator />
            </AuthProvider>
          </ThemeProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
