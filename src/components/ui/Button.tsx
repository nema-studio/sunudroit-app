/**
 * Bouton du design system.
 *
 *   <Button label="Continuer" arrow />                          Primaire, avec flèche (action principale d'un écran)
 *   <Button label="Enregistrer" />                              Primaire
 *   <Button label="Valider" disabled />                         Désactivé
 *   <Button variant="secondary" label="Annuler" />              Secondaire
 *   <Button variant="danger" icon={LogOut} label="…" />         Destructif
 *   <Button variant="ghost" label="Plus tard" />                Fantôme (lien)
 *   <Button variant="onBrand" label="Explorer" arrow />         Sur une carte de couleur (fond sombre fixe)
 *
 * Les couleurs suivent le thème, sauf `onBrand` : posé sur le vert, le jaune
 * ou le corail, il reste sombre en clair comme en sombre pour garder le contraste.
 */
import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { ArrowRight, type LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'ghostDanger' | 'onBrand';

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  /** Pastille jaune avec flèche à droite (action principale d'un écran). */
  arrow?: boolean;
  icon?: LucideIcon;
  disabled?: boolean;
  /** Affiche un indicateur d'activité et bloque l'appui. */
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
}

export function Button({ label, onPress, variant = 'primary', arrow, icon: Icon, disabled, loading, style, accessibilityHint }: ButtonProps) {
  const t = useTheme();
  const isGhost = variant === 'ghost' || variant === 'ghostDanger';

  const palette: Record<Variant, { bg: string; fg: string }> = {
    primary: { bg: t.colors.ink, fg: t.colors.onPrimary },
    secondary: { bg: t.colors.surface, fg: t.colors.ink },
    danger: { bg: t.colors.danger, fg: t.scheme === 'dark' ? t.brand.inkFixed : '#FFFFFF' },
    ghost: { bg: 'transparent', fg: t.colors.ink },
    ghostDanger: { bg: 'transparent', fg: t.colors.danger },
    onBrand: { bg: t.brand.inkFixed, fg: '#FFFFFF' },
  };
  const { bg, fg } = disabled ? { bg: isGhost ? 'transparent' : t.colors.surfaceMuted, fg: t.colors.inkMuted } : palette[variant];

  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled || loading}
      haptic={variant === 'primary' || variant === 'onBrand'}
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!(disabled || loading), busy: !!loading }}
      style={[
        styles.base,
        { backgroundColor: bg, height: isGhost ? t.size.touchMin : t.size.button },
        arrow ? styles.withArrow : styles.centered,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {Icon && <Icon size={18} color={fg} strokeWidth={2} />}
          <Text variant="button" style={[{ color: fg }, arrow && styles.grow, isGhost && styles.underline]} numberOfLines={1}>
            {label}
          </Text>
          {arrow && (
            <View style={[styles.disc, { backgroundColor: disabled ? t.colors.line : t.brand.yellow }]}>
              <ArrowRight size={18} color={t.brand.inkFixed} strokeWidth={2.2} />
            </View>
          )}
        </>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: 999, flexDirection: 'row', alignItems: 'center', gap: 10 },
  centered: { justifyContent: 'center', paddingHorizontal: 24 },
  withArrow: { paddingLeft: 24, paddingRight: 6 },
  grow: { flex: 1 },
  underline: { textDecorationLine: 'underline' },
  disc: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
