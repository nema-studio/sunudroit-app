/**
 * Barre supérieure : bouton Retour rond, titre centré, action facultative à droite.
 * Par défaut, Retour revient à l'écran précédent ; `onBack` remplace ce comportement
 * (ex. : écran ouvert par un lien direct, sans historique).
 */
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { IconButton } from './IconButton';
import { Text } from './Text';

export function TopBar({ title, right, onBack }: { title?: string; right?: ReactNode; onBack?: () => void }) {
  const router = useRouter();
  return (
    <View style={styles.row}>
      <IconButton
        icon={ChevronLeft}
        label="Retour"
        // Sans historique (lien direct), « Retour » mène à l'accueil au lieu de ne rien faire.
        onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/')))}
      />
      {title ? (
        <Text variant="headingS" accessibilityRole="header" numberOfLines={1} style={styles.title}>
          {title}
        </Text>
      ) : (
        <View style={styles.title} />
      )}
      <View style={styles.side}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 8 },
  title: { flex: 1, textAlign: 'center' },
  // Largeur minimale = bouton Retour (titre centré), extensible pour une action texte (« Passer »).
  side: { minWidth: 48, alignItems: 'flex-end' },
});
