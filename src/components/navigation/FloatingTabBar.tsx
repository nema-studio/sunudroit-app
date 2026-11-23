/**
 * ============================================================================
 * BARRE D'ONGLETS FLOTTANTE (4 onglets)
 * ============================================================================
 * Pilule sombre posée au-dessus du contenu. L'onglet actif s'élargit en
 * pastille claire avec son libellé ; les autres icônes glissent doucement
 * pour lui faire de la place (theme/motion.ts → layoutTransition).
 *
 * Contrat avec Expo Router (SDK 58) : `Tabs` embarque sa propre copie de
 * React Navigation et passe au `tabBar` les props
 *   { state, descriptors, emitter, navigateToTab, insets }.
 * Il n'y a plus de prop `navigation` : on émet `tabPress` avec `emitter`
 * (pour que les écrans puissent l'intercepter) puis on change d'onglet avec
 * `navigateToTab(route.key)`, exactement comme la barre par défaut.
 */
import { StyleSheet, View } from 'react-native';
import type { BottomTabBarProps } from 'expo-router/tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bookmark, House, Search, ShieldCheck, type LucideIcon } from 'lucide-react-native';
import Animated from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { fadeIn, layoutTransition, useTheme } from '@/theme';
import { PressableScale, Text } from '@/components/ui';

/** Icône et libellé de chaque onglet, par nom de route (fichier dans app/(tabs)/). */
const TABS: Record<string, { icon: LucideIcon; label: string }> = {
  index: { icon: House, label: 'Accueil' },
  recherche: { icon: Search, label: 'Rechercher' },
  verifier: { icon: ShieldCheck, label: 'Vérifier' },
  favoris: { icon: Bookmark, label: 'Favoris' },
};

/** Marge à laisser en bas des écrans à onglets pour ne pas passer sous la barre. */
export const TAB_BAR_SPACE = 110;

export function FloatingTabBar({ state, emitter, navigateToTab }: BottomTabBarProps) {
  const t = useTheme();
  const insets = useSafeAreaInsets();

  const onTabPress = (routeKey: string, focused: boolean) => {
    const event = emitter.emit({ type: 'tabPress', target: routeKey, canPreventDefault: true });
    if (!focused && !event.defaultPrevented) {
      Haptics.selectionAsync();
      navigateToTab(routeKey);
    }
  };

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: Math.max(insets.bottom, 12) + 6 }]}>
      <View style={[styles.bar, { backgroundColor: t.colors.navBar }]} accessibilityRole="tablist">
        {state.routes.map((route, index) => {
          const tab = TABS[route.name];
          if (!tab) return null;
          const focused = state.index === index;
          const Icon = tab.icon;
          return (
            <Animated.View key={route.key} layout={layoutTransition}>
              <PressableScale
                accessibilityRole="tab"
                accessibilityState={{ selected: focused }}
                accessibilityLabel={tab.label}
                onPress={() => onTabPress(route.key, focused)}
                style={[styles.item, focused && [styles.active, { backgroundColor: t.colors.navActive }]]}
              >
                <Icon size={focused ? 20 : 22} color={focused ? t.colors.navActiveText : t.colors.navIcon} strokeWidth={2} />
                {focused && (
                  <Animated.View entering={fadeIn(80)}>
                    <Text variant="bodySmallStrong" style={{ color: t.colors.navActiveText }}>
                      {tab.label}
                    </Text>
                  </Animated.View>
                )}
              </PressableScale>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 20, right: 20 },
  bar: {
    height: 68,
    borderRadius: 34,
    borderCurve: 'continuous',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  item: { height: 52, minWidth: 52, borderRadius: 26, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  active: { paddingLeft: 14, paddingRight: 18 },
});
