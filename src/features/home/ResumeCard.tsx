/**
 * Carte article compacte : « Reprendre » la dernière lecture.
 * Numéro d'article sur pastille jaune, titre, référence, flèche.
 */
import { StyleSheet, View } from 'react-native';
import { ArrowUpRight } from 'lucide-react-native';
import { PressableScale, Text } from '@/components/ui';
import { useTheme } from '@/theme';

export interface ResumeItem {
  number: string;
  title: string;
  reference: string;
}

export function ResumeCard({ item, onPress }: { item: ResumeItem; onPress?: () => void }) {
  const t = useTheme();
  return (
    <PressableScale
      onPress={onPress}
      pressedScale={0.99}
      accessibilityLabel={`Reprendre ${item.title}, ${item.reference}`}
      style={[styles.card, { backgroundColor: t.colors.surface }]}
    >
      <View style={[styles.num, { backgroundColor: t.brand.yellow }]}>
        <Text variant="numeric" style={{ color: t.brand.inkFixed }}>{item.number}</Text>
      </View>
      <View style={styles.body}>
        <Text variant="bodyStrong" numberOfLines={1}>{item.title}</Text>
        <Text variant="ref" tone="muted">{item.reference}</Text>
      </View>
      <View style={[styles.go, { backgroundColor: t.colors.paper }]}>
        <ArrowUpRight size={16} color={t.colors.ink} strokeWidth={2.2} />
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 10, paddingRight: 12, borderRadius: 22, borderCurve: 'continuous' },
  body: { flex: 1, gap: 4 },
  num: { width: 52, height: 52, borderRadius: 16, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center' },
  go: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
