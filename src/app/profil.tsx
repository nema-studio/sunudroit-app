/**
 * ============================================================================
 * ÉCRAN 21 · MON ESPACE
 * ============================================================================
 * Identité, choix du thème (Clair / Sombre / Système), réglage des
 * notifications, connexion ou déconnexion. Les autres lignes de la maquette viendront ensuite.
 *
 * En développement uniquement (`__DEV__`, vrai dans Expo Go et faux dans
 * l'app publiée), une section « Développement » permet de revoir les écrans
 * d'ouverture et de compte (01 à 05) sans réinstaller l'app.
 */
import { Alert, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell, ChevronRight, LogIn, LogOut, Moon, Play, RotateCcw, Smartphone, Sun, UserRound, type LucideIcon } from 'lucide-react-native';
import { Avatar, Button, PressableScale, Screen, Text, TopBar } from '@/components/ui';
import { useTheme, useThemePreference, type ThemePreference } from '@/theme';
import { useAuth } from '@/features/auth/AuthProvider';
import { fullName } from '@/features/auth/types';
import { initials } from '@/lib/text';
import { replaySplash } from '@/components/brand/splashReplay';

const THEME_OPTIONS: { value: ThemePreference; label: string; icon: LucideIcon }[] = [
  { value: 'light', label: 'Clair', icon: Sun },
  { value: 'dark', label: 'Sombre', icon: Moon },
  { value: 'system', label: 'Système', icon: Smartphone },
];

/** Ligne de réglage : icône dans une pastille, libellé, chevron. */
function SettingsRow({ icon: Icon, label, iconBg, iconFg, onPress }: { icon: LucideIcon; label: string; iconBg: string; iconFg: string; onPress: () => void }) {
  const t = useTheme();
  return (
    <PressableScale pressedScale={0.99} onPress={onPress} accessibilityLabel={label} style={[styles.row, { backgroundColor: t.colors.surface }]}>
      <View style={[styles.rowIcon, { backgroundColor: iconBg }]}>
        <Icon size={16} color={iconFg} strokeWidth={2} />
      </View>
      <Text variant="bodyStrong" style={styles.rowLabel}>{label}</Text>
      <ChevronRight size={18} color={t.colors.inkMuted} strokeWidth={2} />
    </PressableScale>
  );
}

export default function Profil() {
  const t = useTheme();
  const router = useRouter();
  const { user, signOut, resetOnboarding } = useAuth();
  const { preference, setPreference } = useThemePreference();

  const confirmSignOut = () =>
    Alert.alert('Se déconnecter ?', 'Vos favoris restent enregistrés dans votre espace.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Se déconnecter', style: 'destructive', onPress: () => signOut() },
    ]);

  return (
    <Screen scroll edges={['top', 'bottom']} contentStyle={styles.content}>
      <TopBar title="Mon espace" />

      <View style={styles.identity}>
        <Avatar initials={user ? initials(fullName(user)) || 'SD' : '?'} size={72} />
        <View style={styles.identityText}>
          <Text variant="headingM">{user ? (fullName(user) ?? 'Mon compte') : 'Invité'}</Text>
          {user ? (
            <Text variant="bodySmall" tone="muted">{user.email}</Text>
          ) : (
            <Text variant="ref" tone="muted">SANS COMPTE</Text>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text variant="label" tone="muted" style={styles.sectionLabel}>APPARENCE</Text>
        <View style={[styles.group, { backgroundColor: t.colors.surface }]}>
          <Text variant="bodyStrong">Thème</Text>
          <View style={[styles.segmented, { backgroundColor: t.colors.surfaceMuted }]} accessibilityRole="radiogroup">
            {THEME_OPTIONS.map(({ value, label, icon: Icon }) => {
              const selected = preference === value;
              return (
                <PressableScale
                  key={value}
                  pressedScale={0.97}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  accessibilityLabel={label}
                  onPress={() => setPreference(value)}
                  style={[styles.segment, selected && [{ backgroundColor: t.colors.segmentActive }, t.elevation.segment]]}
                >
                  <Icon size={16} color={selected ? t.colors.ink : t.colors.inkMuted} strokeWidth={2} />
                  <Text variant="bodySmallStrong" style={{ color: selected ? t.colors.ink : t.colors.inkMuted }}>
                    {label}
                  </Text>
                </PressableScale>
              );
            })}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text variant="label" tone="muted" style={styles.sectionLabel}>PRÉFÉRENCES</Text>
        <View style={styles.rows}>
          {user && (
            <SettingsRow icon={UserRound} label="Modifier mon nom" iconBg={t.colors.greenSoft} iconFg={t.colors.greenDeep} onPress={() => router.push({ pathname: '/nom', params: { mode: 'edit' } })} />
          )}
          <SettingsRow icon={Bell} label="Notifications" iconBg={t.colors.yellowSoft} iconFg={t.colors.onYellowSoft} onPress={() => router.push('/notifications')} />
        </View>
      </View>

      {__DEV__ && (
        <View style={styles.section}>
          <Text variant="label" tone="muted" style={styles.sectionLabel}>DÉVELOPPEMENT</Text>
          <View style={styles.rows}>
            <SettingsRow icon={Play} label="Rejouer l’écran d’ouverture" iconBg={t.colors.greenSoft} iconFg={t.colors.greenDeep} onPress={replaySplash} />
            {/* Les gardes de _layout.tsx redirigent seules vers Bienvenue. */}
            <SettingsRow icon={RotateCcw} label="Revoir l’écran Bienvenue" iconBg={t.colors.greenSoft} iconFg={t.colors.greenDeep} onPress={resetOnboarding} />
            <SettingsRow icon={UserRound} label="Écran de connexion" iconBg={t.colors.greenSoft} iconFg={t.colors.greenDeep} onPress={() => router.push('/connexion')} />
          </View>
        </View>
      )}

      {user ? (
        <Button variant="danger" icon={LogOut} label="Se déconnecter" onPress={confirmSignOut} />
      ) : (
        <Button icon={LogIn} label="Se connecter" onPress={() => router.push('/connexion')} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: 20, paddingBottom: 24 },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 8 },
  identityText: { flex: 1, gap: 4 },
  section: { gap: 8 },
  sectionLabel: { marginLeft: 6 },
  group: { borderRadius: 24, borderCurve: 'continuous', padding: 14, gap: 10 },
  segmented: { flexDirection: 'row', padding: 4, borderRadius: 26, gap: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 20, borderCurve: 'continuous' },
  rowIcon: { width: 32, height: 32, borderRadius: 10, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center' },
  rowLabel: { flex: 1 },
  rows: { gap: 8 },
  segment: { flex: 1, height: 44, borderRadius: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
});
