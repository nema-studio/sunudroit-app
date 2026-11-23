/**
 * ============================================================================
 * ÉCRAN 05 · NOTIFICATIONS (pré-autorisation)
 * ============================================================================
 * Bonne pratique iOS / Android : expliquer AVANT la fenêtre système, pour que
 * l'utilisateur sache à quoi il dit oui. La demande réelle n'a lieu que sur
 * « Activer ».
 *
 * Accès : après une connexion réussie, ou depuis Mon espace (ligne « Notifications »).
 * Si l'autorisation est déjà accordée, l'écran le dit au lieu de redemander.
 *
 * Sortie : router.dismissTo('/') revient à l'accueil en retirant cet écran
 * de l'historique (pas de « Retour » vers une demande déjà traitée).
 */
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import Animated from 'react-native-reanimated';
import { Button, LogoMark, PressableScale, Screen, Text } from '@/components/ui';
import { enter, useTheme } from '@/theme';

/** Couleurs de la fausse notification : celles d'iOS, identiques en clair et en sombre. */
const NOTIF_BG = '#FFFFFF';
const NOTIF_TITLE = '#121412';
const NOTIF_BODY = '#3E403B';

export default function NotificationsPermission() {
  const t = useTheme();
  const router = useRouter();
  const [granted, setGranted] = useState(false);

  useEffect(() => {
    Notifications.getPermissionsAsync()
      .then((p) => setGranted(p.granted))
      .catch(() => {});
  }, []);

  const goHome = () => router.dismissTo('/');

  const enable = async () => {
    try {
      await Notifications.requestPermissionsAsync();
    } catch {
      // Refus ou indisponible (Expo Go) : on n'insiste pas.
    } finally {
      goHome();
    }
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.top}>
        <PressableScale onPress={goHome} accessibilityLabel={granted ? 'Fermer' : 'Plus tard'} style={styles.later}>
          <Text variant="bodyStrong" style={styles.underline}>{granted ? 'Fermer' : 'Plus tard'}</Text>
        </PressableScale>
      </View>

      {/* Illustration décorative : masquée pour VoiceOver / TalkBack. */}
      <View style={styles.illustration} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <View style={[styles.panel, { backgroundColor: t.brand.yellow }]} />
        <Animated.View entering={enter(1)} style={[styles.notif, t.elevation.float, { backgroundColor: NOTIF_BG }]}>
          <View style={[styles.appIcon, { backgroundColor: t.brand.green }]}>
            <LogoMark size={28} />
          </View>
          <View style={styles.notifText}>
            <Text variant="bodySmallStrong" style={{ color: NOTIF_TITLE }}>SunuDroit</Text>
            <Text variant="bodySmall" style={{ color: NOTIF_BODY }}>L’article 92 de la Constitution a été mis à jour.</Text>
          </View>
        </Animated.View>
        {/* L'animation d'entrée pilote l'opacité : elle est sur l'enveloppe, l'opacité fixe sur l'enfant. */}
        <Animated.View entering={enter(2)} style={styles.ghostWrap}>
          <View style={[styles.ghost, { backgroundColor: NOTIF_BG }]} />
        </Animated.View>
      </View>

      <Animated.View entering={enter(3)} style={styles.copy}>
        <Text variant="headingL" accessibilityRole="header">Restez à jour quand la loi change</Text>
        <Text tone="muted">
          Une notification quand un texte que vous suivez est révisé. Rien d’autre, jamais de publicité.
        </Text>
      </Animated.View>

      <View style={styles.spacer} />
      {granted ? (
        <Button label="Notifications activées" disabled style={styles.cta} />
      ) : (
        <Button label="Activer les notifications" arrow onPress={enable} style={styles.cta} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { alignItems: 'flex-end', paddingTop: 8 },
  later: { height: 44, justifyContent: 'center' },
  underline: { textDecorationLine: 'underline' },
  illustration: { height: 300, marginVertical: 12 },
  panel: { position: 'absolute', left: 0, right: 0, top: 30, height: 240, borderRadius: 32, borderCurve: 'continuous' },
  notif: { position: 'absolute', left: 24, right: 24, top: 70, borderRadius: 22, borderCurve: 'continuous', padding: 14, flexDirection: 'row', gap: 12 },
  appIcon: { width: 40, height: 40, borderRadius: 10, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center' },
  notifText: { flex: 1, gap: 3 },
  ghostWrap: { position: 'absolute', left: 44, right: 44, top: 160, height: 64 },
  ghost: { flex: 1, borderRadius: 22, borderCurve: 'continuous', opacity: 0.6 },
  copy: { gap: 12 },
  spacer: { flex: 1 },
  cta: { marginBottom: 8 },
});
