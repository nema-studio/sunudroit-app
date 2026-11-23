/**
 * En-tête de l'accueil : mot d'accueil en wolof « Dalal ak Jamm »
 * (« Bienvenue ») et accès au compte.
 *
 * Volontairement minimal : une salutation, un avatar. La recherche, juste
 * en dessous, est l'action principale de l'écran ; rien ne doit passer avant.
 * Les notifications se règlent dans Mon espace (pas de cloche sans boîte de
 * réception derrière).
 */
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { UserRound } from 'lucide-react-native';
import { Avatar, PressableScale, Text } from '@/components/ui';
import { useTheme } from '@/theme';
import { useAuth } from '@/features/auth/AuthProvider';
import { initials } from '@/lib/text';
import { fullName } from '@/features/auth/types';

export function HomeHeader() {
  const t = useTheme();
  const router = useRouter();
  const { user } = useAuth();

  return (
    <View style={styles.row}>
      <Text variant="headingL" accessibilityRole="header" style={styles.title}>
        Dalal ak Jamm
      </Text>
      <PressableScale
        onPress={() => router.push('/profil')}
        accessibilityLabel={user ? 'Mon espace' : 'Mon espace, sans compte'}
        hitSlop={6}
      >
        {user ? (
          <Avatar initials={initials(fullName(user)) || 'SD'} size={40} />
        ) : (
          <View style={[styles.guest, { backgroundColor: t.colors.surface }]}>
            <UserRound size={20} color={t.colors.ink} strokeWidth={2} />
          </View>
        )}
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { flex: 1 },
  guest: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
