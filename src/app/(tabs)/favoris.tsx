/**
 * ÉCRAN 15 · FAVORIS (à construire).
 * État vide en attendant ; sans compte, invite à se connecter pour synchroniser.
 */
import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Bookmark } from 'lucide-react-native';
import { Screen, Text } from '@/components/ui';
import { EmptyState } from '@/components/states/EmptyState';
import { useAuth } from '@/features/auth/AuthProvider';

export default function Favoris() {
  const router = useRouter();
  const { user } = useAuth();
  return (
    <Screen>
      <Text variant="headingL" accessibilityRole="header" style={styles.title}>Favoris</Text>
      <EmptyState
        icon={Bookmark}
        title="Aucun favori pour l’instant"
        body="Touchez le signet d’un article pour le retrouver ici, même hors ligne."
        action={user ? undefined : { label: 'Se connecter pour synchroniser', onPress: () => router.push('/connexion') }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: 14 },
});
