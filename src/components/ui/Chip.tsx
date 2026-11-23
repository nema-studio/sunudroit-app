/**
 * Puce de filtre (Sélectionnée / Normale) : types de texte sur l'accueil.
 * Annoncée comme un onglet : elle change le contenu affiché, sans naviguer.
 */
import { StyleSheet } from 'react-native';
import { useTheme } from '@/theme';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

export function Chip({ label, selected, onPress }: { label: string; selected?: boolean; onPress?: () => void }) {
  const t = useTheme();
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: !!selected }}
      style={[styles.base, { backgroundColor: selected ? t.colors.ink : t.colors.surface }]}
    >
      {/* Même graisse sélectionnée ou non : seule la couleur change, la puce ne « saute » pas. */}
      <Text variant="bodySmallStrong" style={{ color: selected ? t.colors.onPrimary : t.colors.ink }}>
        {label}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: { height: 38, paddingHorizontal: 16, borderRadius: 19, justifyContent: 'center' },
});
