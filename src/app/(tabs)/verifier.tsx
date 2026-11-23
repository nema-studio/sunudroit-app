/**
 * ÉCRAN 13 · VÉRIFIER UNE CITATION (à construire).
 * La logique existe déjà (features/verify/verifyQuote.ts) ; l'interface viendra ensuite.
 */
import { StyleSheet } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';
import { Screen, Text } from '@/components/ui';
import { EmptyState } from '@/components/states/EmptyState';

export default function Verifier() {
  return (
    <Screen>
      <Text variant="headingL" accessibilityRole="header" style={styles.title}>Vérifier une citation</Text>
      <EmptyState icon={ShieldCheck} title="Bientôt ici" body="Collez une phrase entendue : SunuDroit la compare au texte officiel, version par version." />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: 14 },
});
