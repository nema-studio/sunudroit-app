/**
 * ============================================================================
 * ÉCRAN D'OUVERTURE ANIMÉ (à chaque lancement)
 * ============================================================================
 *
 * Le splash natif (vert uni, app.json) s'efface dès que les polices sont
 * chargées ; ce composant prend le relais sur le même vert, donc la jonction
 * est invisible. Séquence (≈ 1,8 s), sans rebond :
 *   1. la balance étoilée apparaît en fondu en grandissant à peine (0,96 → 1) ;
 *   2. « SunuDroit » et la signature apparaissent en fondu ;
 *   3. la barre tricolore se remplit (blanc, jaune, rouge) ;
 *   4. tout l'écran s'efface vers l'accueil.
 *
 * L'écran ne part que lorsque l'app est prête (`ready`) ET l'animation jouée.
 * « Réduire les animations » est respecté (configurations de theme/motion.ts).
 */
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { brand, duration, easing, timing, type as typeScale } from '@/theme';
import { LogoMark } from '@/components/ui/Logo';

/** Temps minimal d'affichage avant le fondu de sortie (ms). */
const HOLD = 1400;

export function AnimatedSplash({ ready, onDone }: { ready: boolean; onDone: () => void }) {
  const mark = useSharedValue(0);
  const words = useSharedValue(0);
  const bar = useSharedValue(0);
  const visible = useSharedValue(1);

  // Entrée.
  useEffect(() => {
    mark.set(withTiming(1, { duration: 600, easing: easing.out }));
    words.set(withDelay(300, withTiming(1, timing.slow)));
    bar.set(withDelay(450, withTiming(1, { duration: 900, easing: easing.standard })));
  }, [mark, words, bar]);

  // Sortie, une fois l'app prête.
  useEffect(() => {
    if (!ready) return;
    visible.set(
      withDelay(HOLD, withTiming(0, { duration: duration.base, easing: easing.in }, (finished) => {
        if (finished) scheduleOnRN(onDone);
      })),
    );
  }, [ready, visible, onDone]);

  const markStyle = useAnimatedStyle(() => ({
    opacity: mark.get(),
    transform: [{ scale: 0.96 + mark.get() * 0.04 }],
  }));
  const wordsStyle = useAnimatedStyle(() => ({ opacity: words.get() }));
  const barStyle = useAnimatedStyle(() => ({ width: `${bar.get() * 100}%` }));
  const rootStyle = useAnimatedStyle(() => ({ opacity: visible.get() }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.root, rootStyle]} pointerEvents="none" accessibilityLabel="SunuDroit, chargement">
      {/* Filigrane : grande balance débordant en bas à gauche. */}
      <View style={styles.watermark}>
        <LogoMark size={520} color={brand.greenWatermark} strokeWidth={3} />
      </View>

      <Animated.View style={markStyle}>
        <LogoMark size={120} color="#FFFFFF" strokeWidth={4.5} />
      </Animated.View>

      <Animated.View style={[styles.words, wordsStyle]}>
        <Animated.Text style={styles.name}>SunuDroit</Animated.Text>
        <Animated.Text style={styles.tagline}>LE DROIT SÉNÉGALAIS, VÉRIFIÉ</Animated.Text>
      </Animated.View>

      <View style={styles.track}>
        <Animated.View style={[styles.fill, barStyle]}>
          <View style={[styles.segment, { backgroundColor: '#FFFFFF' }]} />
          <View style={[styles.segment, { backgroundColor: brand.yellow }]} />
          <View style={[styles.segment, { backgroundColor: brand.coral }]} />
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: brand.green, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', zIndex: 100 },
  watermark: { position: 'absolute', left: -150, bottom: -110 },
  words: { alignItems: 'center', marginTop: 24, gap: 10 },
  // Logotype : le style des titres de l'app, en plus grand.
  name: { ...typeScale.displayXl, fontSize: 36, lineHeight: 42, color: '#FFFFFF' },
  tagline: { ...typeScale.ref, letterSpacing: 2, color: '#D6EBDD' },
  track: { position: 'absolute', bottom: 90, width: 120, height: 3, borderRadius: 2, backgroundColor: '#0B5C35', overflow: 'hidden' },
  fill: { height: 3, flexDirection: 'row', overflow: 'hidden' },
  segment: { width: 40, height: 3 },
});
