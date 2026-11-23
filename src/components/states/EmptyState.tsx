/** État vide : icône dans une tuile, titre, texte d'aide, action facultative. */
import { StyleSheet, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import Animated from 'react-native-reanimated';
import { Button, Text } from '@/components/ui';
import { enter, useTheme } from '@/theme';

export function EmptyState({ icon: Icon, title, body, action }: { icon: LucideIcon; title: string; body: string; action?: { label: string; onPress: () => void } }) {
  const t = useTheme();
  return (
    <Animated.View entering={enter(0)} style={styles.wrap}>
      <View style={[styles.tile, { backgroundColor: t.colors.surface }]}>
        <Icon size={32} color={t.colors.inkMuted} strokeWidth={2} />
      </View>
      <Text variant="headingM" accessibilityRole="header" style={styles.center}>{title}</Text>
      <Text tone="muted" style={styles.center}>{body}</Text>
      {action && <Button variant="secondary" label={action.label} onPress={action.onPress} style={{ alignSelf: 'stretch', marginTop: 8 }} />}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 12, paddingHorizontal: 12, paddingTop: 60 },
  center: { textAlign: 'center' },
  tile: { width: 72, height: 72, borderRadius: 22, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center' },
});
