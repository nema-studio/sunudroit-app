/**
 * ============================================================================
 * ÉCRAN 02 · BIENVENUE (premier lancement uniquement)
 * ============================================================================
 * Illustration « orbite » : le logo au centre, les repères juridiques autour
 * (ART. 27, LO, 92, DC…). Les pastilles apparaissent en fondu, une à une,
 * puis flottent très lentement (4 px, cycle de 6 s) ; le texte et les
 * boutons suivent.
 *
 * Route protégée (voir app/_layout.tsx) : elle n'existe que tant que
 * `onboarded` est faux.
 */
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ShieldCheck } from 'lucide-react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withTiming } from 'react-native-reanimated';
import { Button, LogoMark, Screen, Text } from '@/components/ui';
import { enter, fadeIn, STAGGER, useTheme } from '@/theme';
import { useAuth } from '@/features/auth/AuthProvider';

/** Diamètre de l'illustration (px). */
const ORBIT = 330;

type Tone = 'green' | 'yellow' | 'coral' | 'ink' | 'surface' | 'soft';
interface Satellite {
  label: string;
  /** Position relative au centre de l'orbite (px). */
  x: number;
  y: number;
  tone: Tone;
  size: number;
  /** Affiche l'icône « Vérifier » au lieu d'un libellé. */
  icon?: boolean;
}

const SATELLITES: Satellite[] = [
  { label: 'ART.27', x: 0, y: -125, tone: 'green', size: 66 },
  { label: 'LO', x: 95, y: -88, tone: 'yellow', size: 63 },
  { label: '92', x: 135, y: 0, tone: 'surface', size: 60 },
  { label: 'DC', x: 95, y: 95, tone: 'coral', size: 65 },
  { label: '§1', x: 0, y: 135, tone: 'ink', size: 63 },
  { label: '2016', x: -95, y: 95, tone: 'soft', size: 61 },
  { label: '103', x: -135, y: 0, tone: 'yellow', size: 65 },
  { label: '', x: -95, y: -88, tone: 'surface', size: 62, icon: true },
];

/** Flottement : aller-retour de 4 px, très lent, courbe sinusoïdale. */
const FLOAT = { duration: 3000, easing: Easing.inOut(Easing.sin) };

function SatelliteBadge({ s, index }: { s: Satellite; index: number }) {
  const t = useTheme();
  const float = useSharedValue(0);

  useEffect(() => {
    float.set(withDelay(800 + index * 150, withRepeat(withTiming(1, FLOAT), -1, true)));
  }, [float, index]);

  const floatStyle = useAnimatedStyle(() => ({ transform: [{ translateY: -2 + float.get() * 4 }] }));

  const colors: Record<Tone, { bg: string; fg: string }> = {
    green: { bg: t.brand.green, fg: '#FFFFFF' },
    yellow: { bg: t.brand.yellow, fg: t.brand.inkFixed },
    coral: { bg: t.brand.coral, fg: t.brand.inkFixed },
    ink: { bg: t.colors.ink, fg: t.colors.onPrimary },
    surface: { bg: t.colors.surface, fg: t.colors.ink },
    soft: { bg: t.colors.greenSoft, fg: t.colors.greenDeep },
  };
  const { bg, fg } = colors[s.tone];
  // Numéros courts (92, 103, §1) en grands chiffres ; sigles et années en capitales espacées.
  const isNumber = /^(\d+|§\d+)$/.test(s.label) && s.label.length <= 3;

  return (
    <Animated.View
      entering={fadeIn(200 + index * STAGGER)}
      style={[
        styles.satellite,
        {
          width: s.size,
          height: s.size,
          backgroundColor: bg,
          left: ORBIT / 2 + s.x - s.size / 2,
          top: ORBIT / 2 + s.y - s.size / 2,
        },
      ]}
    >
      <Animated.View style={floatStyle}>
        {s.icon ? (
          <ShieldCheck size={24} color={t.brand.green} strokeWidth={2} />
        ) : isNumber ? (
          <Text variant="numeric" style={{ color: fg }}>{s.label}</Text>
        ) : (
          <Text variant="ref" style={{ color: fg }}>{s.label}</Text>
        )}
      </Animated.View>
    </Animated.View>
  );
}

export default function Bienvenue() {
  const t = useTheme();
  const router = useRouter();
  const { completeOnboarding } = useAuth();

  const start = () => {
    completeOnboarding();
    router.replace('/');
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.orbitWrap} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <View style={styles.orbit}>
          <View style={[styles.ring, { borderColor: t.colors.line }]} />
          <Animated.View entering={fadeIn()} style={[styles.disc, { backgroundColor: t.colors.surface }]} />
          <Animated.View entering={fadeIn(100)} style={[styles.core, { backgroundColor: t.brand.green }]}>
            <LogoMark size={64} />
          </Animated.View>
          {SATELLITES.map((s, i) => (
            <SatelliteBadge key={s.label || 'icon'} s={s} index={i} />
          ))}
        </View>
      </View>

      <Animated.View entering={enter(8)} style={styles.copy}>
        <Text variant="label" tone="muted">GRATUIT · HORS LIGNE · SOURCÉ</Text>
        <Text variant="headingL" accessibilityRole="header">Le droit sénégalais, vérifié en quelques secondes.</Text>
        <Text tone="muted">
          La Constitution et ses lois organiques, reliées entre elles. Retrouvez un article, comparez une citation, partagez la source.
        </Text>
      </Animated.View>

      <Animated.View entering={enter(10)} style={styles.actions}>
        <Button label="Commencer" arrow onPress={start} />
        <Button variant="ghost" label="J’ai déjà un compte" onPress={() => router.push('/connexion')} />
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  orbitWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 300 },
  orbit: { width: ORBIT, height: ORBIT },
  ring: { position: 'absolute', left: 30, top: 30, right: 30, bottom: 30, borderRadius: 999, borderWidth: StyleSheet.hairlineWidth },
  disc: { position: 'absolute', left: 75, top: 75, width: 180, height: 180, borderRadius: 90 },
  core: { position: 'absolute', left: 117, top: 117, width: 96, height: 96, borderRadius: 26, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center' },
  satellite: { position: 'absolute', borderRadius: 18, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center' },
  copy: { gap: 12, paddingTop: 8 },
  actions: { gap: 8, paddingTop: 24, paddingBottom: 8 },
});
