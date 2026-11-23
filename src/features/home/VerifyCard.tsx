/**
 * Carte « Vérifier une citation » de l'accueil.
 *
 * C'est la fonction qui distingue SunuDroit : on l'explique en une phrase
 * plutôt que de la réduire à une icône. Sobre (fond surface), pour ne pas
 * concurrencer les couleurs des collections au-dessus.
 */
import { StyleSheet, View } from 'react-native';
import { ChevronRight, ShieldCheck } from 'lucide-react-native';
import { PressableScale, Text } from '@/components/ui';
import { useTheme } from '@/theme';

export function VerifyCard({ onPress }: { onPress: () => void }) {
  const t = useTheme();
  return (
    <PressableScale
      pressedScale={0.985}
      onPress={onPress}
      accessibilityLabel="Vérifier une citation. Comparez une phrase entendue au texte officiel"
      style={[styles.card, { backgroundColor: t.colors.surface }]}
    >
      <View style={[styles.icon, { backgroundColor: t.colors.greenSoft }]}>
        <ShieldCheck size={22} color={t.colors.greenDeep} strokeWidth={2} />
      </View>
      <View style={styles.text}>
        <Text variant="bodyStrong">Vérifier une citation</Text>
        <Text variant="bodySmall" tone="muted">
          Comparez une phrase entendue au texte officiel, version par version.
        </Text>
      </View>
      <ChevronRight size={20} color={t.colors.inkMuted} strokeWidth={2} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 22, borderCurve: 'continuous' },
  icon: { width: 44, height: 44, borderRadius: 14, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, gap: 2 },
});
