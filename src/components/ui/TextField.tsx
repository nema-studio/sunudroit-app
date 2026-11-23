/**
 * Champ de saisie du design system (pilule de 60 px).
 *
 *   <TextField label="ADRESSE E-MAIL" icon={Mail} value={email} onChangeText={setEmail} error={message} />
 *
 * - Libellé en capitales au-dessus, relié au champ pour VoiceOver / TalkBack.
 * - Toute la pilule donne le focus au champ (cible tactile plus grande).
 * - Contour : rouge en cas d'erreur, encre quand le champ est actif, invisible sinon.
 * - Message d'erreur sous le champ, annoncé par les lecteurs d'écran.
 *
 * Toutes les props de `TextInput` (clavier, saisie automatique…) sont acceptées.
 * `ref` donne accès au champ, par exemple pour passer au suivant avec `.focus()`.
 */
import { useId, useState, type ComponentRef, type Ref } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

/** Instance d'un champ natif (ce que reçoit une `ref`). */
export type TextInputRef = ComponentRef<typeof TextInput>;

export interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  /** Libellé affiché au-dessus du champ (en capitales). */
  label: string;
  /** Icône facultative à gauche du texte. */
  icon?: LucideIcon;
  /** Message d'erreur : affiché sous le champ et colore le contour en rouge. */
  error?: string | null;
  ref?: Ref<TextInputRef>;
}

export function TextField({ label, icon: Icon, error, ref, onFocus, onBlur, ...inputProps }: TextFieldProps) {
  const t = useTheme();
  const labelId = useId();
  const [focused, setFocused] = useState(false);
  const [input, setInput] = useState<TextInputRef | null>(null);

  const borderColor = error ? t.colors.danger : focused ? t.colors.ink : 'transparent';

  return (
    <View style={styles.group}>
      <Text variant="label" tone="muted" nativeID={labelId} style={styles.indent}>
        {label}
      </Text>
      <PressableScale
        pressedScale={1}
        onPress={() => input?.focus()}
        accessible={false}
        style={[styles.field, { backgroundColor: t.colors.surface, borderColor }]}
      >
        {Icon && <Icon size={20} color={t.colors.inkMuted} strokeWidth={2} />}
        <TextInput
          ref={(node) => {
            setInput(node);
            if (typeof ref === 'function') ref(node);
            else if (ref) ref.current = node;
          }}
          placeholderTextColor={t.colors.inkMuted}
          accessibilityLabelledBy={labelId}
          accessibilityLabel={label}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...inputProps}
          style={[t.type.input, styles.input, { color: t.colors.ink }]}
        />
      </PressableScale>
      {error ? (
        <Text variant="caption" tone="danger" accessibilityLiveRegion="polite" style={styles.indent}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: 8 },
  indent: { marginLeft: 4 },
  field: { height: 60, borderRadius: 30, borderWidth: 1.5, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, gap: 12 },
  input: { flex: 1, height: '100%' },
});
