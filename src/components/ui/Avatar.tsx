/**
 * Avatar (tailles du design system : 88 · 72 · 44 · 32) : initiales en Inter
 * sur le vert de marque. Décoratif pour VoiceOver : le nom est lu à côté.
 */
import { View } from 'react-native';
import { useTheme } from '@/theme';
import { Text } from './Text';

export function Avatar({ initials, size = 44 }: { initials: string; size?: number }) {
  const t = useTheme();
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: t.brand.green, alignItems: 'center', justifyContent: 'center' }}
    >
      <Text style={{ fontFamily: t.fonts.textSemi, fontSize: Math.round(size * 0.36), lineHeight: Math.round(size * 0.44), letterSpacing: 0.5, color: '#FFFFFF' }}>{initials}</Text>
    </View>
  );
}
