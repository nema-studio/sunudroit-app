/**
 * Bouton icône rond (48 px par défaut, cible tactile ≥ 44 px).
 *  Bouton icône / Surface   fond surface, icône ink (Retour, Favori…)
 *  Bouton icône / Plein     fond ink, icône onPrimary (Vérifier)
 * `badge` affiche la pastille corail « non lu ».
 */
import { StyleSheet, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { PressableScale } from './PressableScale';

export interface IconButtonProps {
  icon: LucideIcon;
  label: string; // lu par VoiceOver / TalkBack
  onPress?: () => void;
  variant?: 'surface' | 'solid';
  size?: number;
  badge?: boolean;
}

export function IconButton({ icon: Icon, label, onPress, variant = 'surface', size = 48, badge }: IconButtonProps) {
  const t = useTheme();
  const bg = variant === 'solid' ? t.colors.ink : t.colors.surface;
  const fg = variant === 'solid' ? t.colors.onPrimary : t.colors.ink;
  return (
    <PressableScale
      onPress={onPress}
      accessibilityLabel={label}
      hitSlop={size < 44 ? (44 - size) / 2 : 0}
      style={[styles.base, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg }]}
    >
      <Icon size={Math.round(size * 0.42)} color={fg} strokeWidth={2.1} />
      {badge && <View style={[styles.badge, { backgroundColor: t.brand.coral, borderColor: bg, right: size * 0.22, top: size * 0.22 }]} />}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', width: 11, height: 11, borderRadius: 6, borderWidth: 2 },
});
