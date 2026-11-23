/**
 * Onglets de l'app, avec la barre flottante maison (FloatingTabBar).
 *
 * SDK 58 : `Tabs` n'affiche que les écrans déclarés ici. Un nouveau fichier
 * dans app/(tabs)/ doit donc être ajouté à cette liste (et à TABS dans
 * FloatingTabBar.tsx pour son icône).
 */
import { Tabs } from 'expo-router';
import { FloatingTabBar } from '@/components/navigation/FloatingTabBar';
import { useTheme } from '@/theme';

export default function TabsLayout() {
  const t = useTheme();
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: t.colors.paper },
        // Fondu court entre onglets : discret, sans glissement latéral.
        animation: 'fade',
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Accueil' }} />
      <Tabs.Screen name="recherche" options={{ title: 'Rechercher' }} />
      <Tabs.Screen name="verifier" options={{ title: 'Vérifier' }} />
      <Tabs.Screen name="favoris" options={{ title: 'Favoris' }} />
    </Tabs>
  );
}
