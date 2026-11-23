/**
 * Texte du design system. Toujours passer par ce composant plutôt que par
 * <Text> de React Native : la police, la taille et la couleur suivent le thème.
 *
 *   <Text variant="headingL">Dalal ak Jamm</Text>
 *   <Text variant="ref" tone="muted">CONSTITUTION · ART. 92</Text>
 */
import { Text as RNText, type TextProps } from 'react-native';
import { useTheme, type TypeVariant } from '@/theme';

type Tone = 'default' | 'muted' | 'onPrimary' | 'onBrand' | 'inkFixed' | 'danger' | 'green';

export interface AppTextProps extends TextProps {
  variant?: TypeVariant;
  tone?: Tone;
  /** Met en majuscules (références, libellés en mono). */
  upper?: boolean;
}

export function Text({ variant = 'body', tone = 'default', upper, style, children, ...rest }: AppTextProps) {
  const t = useTheme();
  const color = {
    default: t.colors.ink,
    muted: t.colors.inkMuted,
    onPrimary: t.colors.onPrimary,
    onBrand: t.brand.onBrand,
    inkFixed: t.brand.inkFixed,
    danger: t.colors.danger,
    green: t.colors.greenText,
  }[tone];
  return (
    <RNText
      // L'utilisateur peut agrandir le texte dans les réglages du téléphone,
      // mais on plafonne pour ne pas casser la mise en page.
      maxFontSizeMultiplier={1.4}
      style={[t.type[variant], { color }, upper && { textTransform: 'uppercase' }, style]}
      {...rest}
    >
      {children}
    </RNText>
  );
}
