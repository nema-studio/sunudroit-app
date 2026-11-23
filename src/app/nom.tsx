/**
 * ============================================================================
 * ÉCRAN 04 bis · VOTRE NOM
 * ============================================================================
 * Deux usages :
 *  - après le code, pour un NOUVEAU compte : on demande le prénom
 *    (obligatoire) et le nom (facultatif), puis on passe aux notifications ;
 *  - depuis Mon espace (`/nom?mode=edit`) : modifier son nom, puis revenir.
 *
 * Le prénom sert à l'avatar (« AN ») et à personnaliser l'app. Le nom reste
 * facultatif : on ne demande que ce qui est utile.
 *
 * Route protégée (_layout.tsx) : accessible seulement avec une session.
 */
import { useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated from 'react-native-reanimated';
import { Button, Screen, Text, TextField, TopBar, type TextInputRef } from '@/components/ui';
import { enter } from '@/theme';
import { useAuth } from '@/features/auth/AuthProvider';
import { AuthError, authErrorMessage } from '@/features/auth/types';

/** Espace gardé entre le champ actif et le clavier : assez pour voir le bouton. */
const KEYBOARD_GAP = 96;

export default function Nom() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const editing = mode === 'edit';
  const { user, updateProfile } = useAuth();

  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastNameInput = useRef<TextInputRef>(null);

  const canSubmit = firstName.trim().length > 0 && !loading;

  const submit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      await updateProfile({ firstName: firstName.trim(), lastName: lastName.trim() || null });
      if (editing) router.back();
      else router.replace('/notifications');
    } catch (e) {
      setError(authErrorMessage(e instanceof AuthError ? e.code : 'UNKNOWN'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen edges={['top', 'bottom']} contentStyle={styles.noPad}>
      <KeyboardAwareScrollView
        bottomOffset={KEYBOARD_GAP}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
      >
        {/* Nouveau compte : pas de retour possible vers le code déjà validé. */}
        {editing && <TopBar title="Mon nom" />}

        <Animated.View entering={enter(0)} style={[styles.intro, !editing && styles.introTop]}>
          <Text variant="headingL" accessibilityRole="header">
            {/* Trait d'union et espace insécables : le titre ne se coupe pas au mauvais endroit. */}
            {editing ? 'Modifier votre nom' : 'Comment vous appelez\u2011vous\u00a0?'}
          </Text>
          <Text tone="muted">Votre prénom s’affiche dans l’app. Votre nom est facultatif.</Text>
        </Animated.View>

        <Animated.View entering={enter(1)} style={styles.fields}>
          <TextField
            label="PRÉNOM"
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Awa"
            textContentType="givenName"
            autoComplete="name-given"
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => lastNameInput.current?.focus()}
            autoFocus={!editing}
          />
          <TextField
            ref={lastNameInput}
            label="NOM (FACULTATIF)"
            value={lastName}
            onChangeText={setLastName}
            placeholder="Ndiaye"
            textContentType="familyName"
            autoComplete="name-family"
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={submit}
          />
          {error && (
            <Text variant="caption" tone="danger" accessibilityLiveRegion="polite" style={styles.error}>
              {error}
            </Text>
          )}
        </Animated.View>

        <Button label={editing ? 'Enregistrer' : 'Continuer'} arrow={!editing} onPress={submit} loading={loading} disabled={!canSubmit} />
      </KeyboardAwareScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  noPad: { paddingHorizontal: 0 },
  content: { paddingHorizontal: 20, paddingBottom: 24, gap: 24 },
  intro: { gap: 8 },
  introTop: { marginTop: 40 },
  fields: { gap: 16 },
  error: { marginLeft: 4 },
});
