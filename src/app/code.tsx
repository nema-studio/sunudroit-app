/**
 * ============================================================================
 * ÉCRAN 04 · CODE REÇU PAR E-MAIL
 * ============================================================================
 * - 6 cases et un pavé numérique intégré (gros boutons, comme la maquette).
 * - Validation automatique au 6e chiffre. Code faux : courte secousse
 *   horizontale (convention iOS pour un mot de passe refusé) et vibration.
 * - Compte à rebours avant de pouvoir redemander un code.
 * - En mode faux serveur, le code de test est affiché.
 *
 * Navigation après succès : Connexion et Code sont retirés de l'historique
 * (dismissAll), puis s'ouvre par-dessus l'écran d'origine :
 *  - l'écran du nom pour un NOUVEAU compte (prénom, nom),
 *  - directement l'écran des notifications pour un compte existant.
 * « Retour » ne ramène donc jamais vers un formulaire déjà validé.
 */
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Delete } from 'lucide-react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Button, PressableScale, Screen, Text, TopBar } from '@/components/ui';
import { easing, fadeIn, useTheme } from '@/theme';
import { env } from '@/config/env';
import { useAuth } from '@/features/auth/AuthProvider';
import { maskEmail } from '@/features/auth/email';
import { AuthError, authErrorMessage } from '@/features/auth/types';

const CODE_LENGTH = 6;
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'] as const;
type Key = (typeof KEYS)[number];

/** Secousse d'erreur : 3 allers-retours amortis, 6 px au plus, sans ressort. */
const SHAKE_STEP = { duration: 55, easing: easing.standard };

export default function Code() {
  const t = useTheme();
  const router = useRouter();
  const { pending, verifyCode, requestCode } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(pending?.resendIn ?? 0);
  const shake = useSharedValue(0);

  // Aucune demande en cours À L'OUVERTURE (lien direct, redémarrage) : retour à
  // la saisie du numéro. Vérifié une seule fois : après un code juste,
  // `pending` repasse à null et il ne faut surtout pas renvoyer vers Connexion.
  useEffect(() => {
    if (!pending) router.replace('/connexion');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Compte à rebours, une seconde à la fois.
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft]);

  const submit = async (value: string) => {
    setLoading(true);
    setError(null);
    try {
      const { isNewUser } = await verifyCode(value);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.dismissAll();
      router.push(isNewUser ? '/nom' : '/notifications');
    } catch (e) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(authErrorMessage(e instanceof AuthError ? e.code : 'UNKNOWN'));
      shake.set(
        withSequence(
          withTiming(-6, SHAKE_STEP),
          withTiming(6, SHAKE_STEP),
          withTiming(-4, SHAKE_STEP),
          withTiming(4, SHAKE_STEP),
          withTiming(0, SHAKE_STEP),
        ),
      );
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  const press = (key: Key) => {
    if (loading || key === '') return;
    Haptics.selectionAsync();
    setError(null);
    if (key === 'del') {
      setCode((c) => c.slice(0, -1));
      return;
    }
    if (code.length >= CODE_LENGTH) return;
    const next = code + key;
    setCode(next);
    if (next.length === CODE_LENGTH) submit(next);
  };

  const resend = async () => {
    if (!pending || secondsLeft > 0) return;
    setError(null);
    try {
      const res = await requestCode(pending.email);
      setSecondsLeft(res.resendIn);
    } catch (e) {
      setError(authErrorMessage(e instanceof AuthError ? e.code : 'UNKNOWN'));
    }
  };

  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.get() }] }));
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  return (
    <Screen edges={['top', 'bottom']}>
      <TopBar />
      <View style={styles.header}>
        <Text variant="headingL" accessibilityRole="header">Entrez le code</Text>
        <Text tone="muted">
          Envoyé par e-mail à{' '}
          <Text variant="bodyStrong">{pending ? maskEmail(pending.email) : ''}</Text>.{' '}
          <Text variant="bodyStrong" style={styles.link} onPress={() => router.back()} accessibilityRole="link">
            Modifier
          </Text>
        </Text>
      </View>

      <Animated.View
        style={[styles.boxes, shakeStyle]}
        accessible
        accessibilityLabel={`Code saisi : ${code.length} chiffre${code.length > 1 ? 's' : ''} sur ${CODE_LENGTH}`}
      >
        {Array.from({ length: CODE_LENGTH }, (_, i) => {
          const digit = code[i];
          const active = i === code.length && !loading;
          return (
            <View
              key={i}
              style={[
                styles.box,
                {
                  backgroundColor: digit || active ? t.colors.surface : t.colors.surfaceMuted,
                  borderColor: error ? t.colors.danger : active ? t.colors.ink : 'transparent',
                },
              ]}
            >
              {digit && (
                <Animated.Text entering={fadeIn()} style={[t.type.numeric, { color: t.colors.ink }]}>
                  {digit}
                </Animated.Text>
              )}
            </View>
          );
        })}
      </Animated.View>

      <View style={styles.meta}>
        {error ? (
          <Animated.View entering={fadeIn()}>
            <Text variant="caption" tone="danger" accessibilityLiveRegion="assertive">{error}</Text>
          </Animated.View>
        ) : secondsLeft > 0 ? (
          <Text variant="ref" tone="muted">RENVOYER DANS {mm}:{ss}</Text>
        ) : (
          <Text variant="bodyStrong" style={styles.link} onPress={resend} accessibilityRole="button">
            Renvoyer un code
          </Text>
        )}
        {env.useMockApi && <Text variant="ref" tone="green">MODE TEST · CODE 123456</Text>}
      </View>

      <View style={styles.spacer} />

      <Button label="Valider" onPress={() => submit(code)} disabled={code.length < CODE_LENGTH} loading={loading} />

      <View style={styles.keypad}>
        {KEYS.map((key, i) =>
          key === '' ? (
            <View key={i} style={styles.key} />
          ) : (
            <PressableScale
              key={i}
              onPress={() => press(key)}
              accessibilityLabel={key === 'del' ? 'Effacer le dernier chiffre' : key}
              style={[styles.key, { backgroundColor: key === 'del' ? 'transparent' : t.colors.surface }]}
            >
              {key === 'del' ? (
                <Delete size={24} color={t.colors.ink} strokeWidth={1.8} />
              ) : (
                <Text variant="numeric">{key}</Text>
              )}
            </PressableScale>
          ),
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: 8, marginTop: 16 },
  link: { textDecorationLine: 'underline' },
  boxes: { flexDirection: 'row', gap: 8, marginTop: 24 },
  box: { flex: 1, height: 60, borderRadius: 16, borderCurve: 'continuous', borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  meta: { marginTop: 16, gap: 8, minHeight: 40 },
  spacer: { flex: 1 },
  keypad: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16, marginBottom: 8 },
  key: { width: '31.6%', height: 54, borderRadius: 16, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center' },
});
