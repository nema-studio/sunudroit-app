/**
 * ============================================================================
 * ÉCRAN 03 · CONNEXION (facultative) PAR E-MAIL
 * ============================================================================
 * Un seul parcours pour l'inscription et la connexion : l'utilisateur donne
 * son e-mail, reçoit un code à 6 chiffres (écran Code), et seul un nouveau
 * compte passe ensuite par l'écran du nom. Pas de mot de passe.
 *
 * - Clavier e-mail, saisie automatique de l'adresse du téléphone.
 * - Validation locale avant tout appel réseau ; pas de message rouge tant
 *   que le champ est vide.
 * - Premier lancement : « Passer » permet de tout utiliser sans compte.
 */
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useCanGoBack, useRouter } from 'expo-router';
import { Bookmark, Clock, Heart, Mail, type LucideIcon } from 'lucide-react-native';
import Animated from 'react-native-reanimated';
import { Button, PressableScale, Screen, Text, TextField, TopBar } from '@/components/ui';
import { enter, useTheme } from '@/theme';
import { useAuth } from '@/features/auth/AuthProvider';
import { emailErrorMessage, normalizeEmail, validateEmail } from '@/features/auth/email';
import { AuthError, authErrorMessage } from '@/features/auth/types';

/** Espace gardé entre le champ actif et le clavier : assez pour voir le bouton d'envoi. */
const KEYBOARD_GAP = 96;

export default function Connexion() {
  const t = useTheme();
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const { onboarded, completeOnboarding, requestCode } = useAuth();

  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const error = validateEmail(email);
  const message = serverError ?? (touched && email.trim().length > 0 ? emailErrorMessage(error) : null);

  const submit = async () => {
    setTouched(true);
    if (error) return;
    setLoading(true);
    setServerError(null);
    try {
      await requestCode(normalizeEmail(email));
      router.push('/code');
    } catch (e) {
      setServerError(authErrorMessage(e instanceof AuthError ? e.code : 'UNKNOWN'));
    } finally {
      setLoading(false);
    }
  };

  /** Continuer sans compte (premier lancement, ou lien direct sans historique). */
  const skip = () => {
    completeOnboarding();
    router.replace('/');
  };

  const benefits: { icon: LucideIcon; label: string; bg: string; fg: string }[] = [
    { icon: Bookmark, label: 'Favoris retrouvés sur tous vos téléphones', bg: t.colors.greenSoft, fg: t.colors.greenDeep },
    { icon: Clock, label: 'Historique de lecture et de vérifications', bg: t.colors.yellowSoft, fg: t.colors.onYellowSoft },
    { icon: Heart, label: 'Reçus de vos dons', bg: t.colors.coralSoft, fg: t.colors.danger },
  ];

  return (
    <Screen edges={['top', 'bottom']} contentStyle={styles.noPad}>
      {/* Clavier (react-native-keyboard-controller, recommandé par Expo) : le
          défilement suit le champ actif et garde le bouton d'envoi visible
          (bottomOffset) au-dessus du clavier, sur iOS comme sur Android. */}
      <KeyboardAwareScrollView
        bottomOffset={KEYBOARD_GAP}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
      >
          {/* Déjà dans l'app : la flèche Retour suffit.
              Premier lancement : « Passer » permet de continuer sans compte. */}
          <TopBar
            onBack={canGoBack ? undefined : skip}
            right={
              onboarded ? null : (
                <PressableScale onPress={skip} style={[styles.skip, { backgroundColor: t.colors.surface }]} accessibilityLabel="Passer, continuer sans compte">
                  <Text variant="bodySmallStrong">Passer</Text>
                </PressableScale>
              )
            }
          />

          <Animated.View entering={enter(0)} style={styles.intro}>
            <Text variant="headingL" accessibilityRole="header">Votre espace, si vous le souhaitez.</Text>
            <Text tone="muted">Lire, chercher et vérifier restent libres, sans compte.</Text>
          </Animated.View>

          <Animated.View entering={enter(1)} style={[styles.card, { backgroundColor: t.colors.surface }]}>
            <Text variant="label" tone="muted">AVEC UN COMPTE</Text>
            {benefits.map(({ icon: Icon, label, bg, fg }) => (
              <View key={label} style={styles.benefit}>
                <View style={[styles.benefitIcon, { backgroundColor: bg }]}>
                  <Icon size={14} color={fg} strokeWidth={2.2} />
                </View>
                <Text variant="bodySmall" style={styles.benefitText}>{label}</Text>
              </View>
            ))}
          </Animated.View>

          <Animated.View entering={enter(2)}>
            <TextField
              label="ADRESSE E-MAIL"
              icon={Mail}
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                setServerError(null);
              }}
              onBlur={() => {
                if (email.trim().length > 0) setTouched(true);
              }}
              onSubmitEditing={submit}
              error={message}
              placeholder="vous@exemple.com"
              keyboardType="email-address"
              textContentType="emailAddress"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="send"
            />
          </Animated.View>

          {/* V1 : e-mail seul (DEC-17). Google et Apple viendront plus tard, sans boutons « bientôt »
              d'ici là : Apple refuse les fonctions visibles mais inactives. */}
          <Button label="Recevoir un code par e-mail" onPress={submit} loading={loading} disabled={email.trim().length === 0} />

          <Text variant="caption" tone="muted" style={styles.legal}>
            En continuant, vous acceptez les <Text variant="captionStrong" tone="muted">conditions</Text> et la{' '}
            <Text variant="captionStrong" tone="muted">politique de confidentialité</Text>.
          </Text>
      </KeyboardAwareScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  noPad: { paddingHorizontal: 0 },
  content: { paddingHorizontal: 20, paddingBottom: 24, gap: 18 },
  skip: { height: 44, paddingHorizontal: 16, borderRadius: 22, justifyContent: 'center' },
  intro: { gap: 8, marginTop: 12 },
  card: { borderRadius: 24, borderCurve: 'continuous', padding: 18, gap: 12 },
  benefit: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  benefitIcon: { width: 28, height: 28, borderRadius: 8, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center' },
  benefitText: { flex: 1 },
  legal: { textAlign: 'center', marginTop: 8 },
});
