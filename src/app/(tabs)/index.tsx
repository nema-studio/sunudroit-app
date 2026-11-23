/**
 * ============================================================================
 * ÉCRAN 06 · ACCUEIL
 * ============================================================================
 *
 * Principes UX :
 *  1. UNE action principale, en haut : la recherche. La toucher ouvre
 *     l'onglet Rechercher avec le clavier déjà prêt (pas de second geste).
 *  2. TOUT LE CORPUS VISIBLE : Constitution en vedette, lois organiques et
 *     décisions à côté. Chaque collection s'ouvre en un seul geste.
 *  3. LA CONTINUITÉ : « Reprendre » ramène à la dernière lecture.
 *  4. LA FONCTION PHARE EXPLIQUÉE : « Vérifier une citation », avec une phrase
 *     qui dit à quoi elle sert.
 *
 * Pas de doublon avec la barre d'onglets, pas d'élément décoratif qui
 * retarde l'accès au contenu. Les blocs apparaissent en cascade discrète.
 */
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PressableScale, Text } from '@/components/ui';
import { TAB_BAR_SPACE } from '@/components/navigation/FloatingTabBar';
import { enter, useTheme } from '@/theme';
import { HomeHeader } from '@/features/home/HomeHeader';
import { CollectionCards } from '@/features/home/CollectionCards';
import { ResumeCard } from '@/features/home/ResumeCard';
import { VerifyCard } from '@/features/home/VerifyCard';
import type { CollectionId } from '@/features/home/collections';

export default function Accueil() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  /** Ouvre la recherche, clavier prêt (`focus` change à chaque appel pour redéclencher le focus). */
  const openSearch = () => router.navigate({ pathname: '/recherche', params: { focus: String(Date.now()) } });
  /** Ouvre la recherche filtrée sur une collection. */
  const openCollection = (id: CollectionId) => router.navigate({ pathname: '/recherche', params: { type: id } });

  return (
    <View style={[styles.fill, { backgroundColor: t.colors.paper }]}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: TAB_BAR_SPACE + insets.bottom }]}
      >
        <Animated.View entering={enter(0)}>
          <HomeHeader />
        </Animated.View>

        <Animated.View entering={enter(1)}>
          <PressableScale
            pressedScale={0.99}
            onPress={openSearch}
            accessibilityRole="search"
            accessibilityLabel="Rechercher un article, un mot-clé, un thème"
            style={[styles.search, { backgroundColor: t.colors.surface }]}
          >
            <Search size={20} color={t.colors.inkMuted} strokeWidth={2} />
            <Text variant="input" tone="muted">Rechercher un article, un thème…</Text>
          </PressableScale>
        </Animated.View>

        <Animated.View entering={enter(2)} style={styles.section}>
          <Text variant="headingS" accessibilityRole="header">Parcourir</Text>
          <CollectionCards onOpen={openCollection} />
        </Animated.View>

        <Animated.View entering={enter(3)} style={styles.section}>
          <Text variant="headingS" accessibilityRole="header">Reprendre</Text>
          <ResumeCard
            item={{ number: '92', title: 'Conseil constitutionnel', reference: 'CONSTITUTION · ART. 92' }}
            onPress={() => router.navigate({ pathname: '/recherche', params: { q: 'art 92' } })}
          />
        </Animated.View>

        <Animated.View entering={enter(4)}>
          <VerifyCard onPress={() => router.navigate('/verifier')} />
        </Animated.View>
      </Animated.ScrollView>

      {/* Fond fixe sous la barre d'état : le contenu qui défile ne passe pas sous l'heure. */}
      <View pointerEvents="none" style={[styles.statusBarBackdrop, { height: insets.top, backgroundColor: t.colors.paper }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 24 },
  search: {
    height: 54,
    borderRadius: 27,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
  },
  section: { gap: 12 },
  statusBarBackdrop: { position: 'absolute', top: 0, left: 0, right: 0 },
});
