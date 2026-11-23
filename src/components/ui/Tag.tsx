/** Étiquette de statut en mono : EN VIGUEUR, ANCIENNE, INEXACT, PRÉCISÉ PAR… */
import { View } from 'react-native';
import { useTheme } from '@/theme';
import { Text } from './Text';

type Kind = 'inForce' | 'old' | 'wrong' | 'specified' | 'onBrand';

export function Tag({ label, kind = 'inForce' }: { label: string; kind?: Kind }) {
  const t = useTheme();
  const c = {
    inForce: { bg: t.colors.greenSoft, fg: t.colors.greenDeep },
    old: { bg: t.colors.surfaceMuted, fg: t.colors.inkMuted },
    wrong: { bg: t.brand.coral, fg: t.brand.inkFixed },
    specified: { bg: t.brand.yellow, fg: t.brand.inkFixed },
    onBrand: { bg: '#FFFFFF', fg: t.brand.green },
  }[kind];
  return (
    <View style={{ backgroundColor: c.bg, borderRadius: t.radius.s, paddingHorizontal: 10, paddingVertical: 6, alignSelf: 'flex-start' }}>
      <Text variant="ref" style={{ color: c.fg }}>
        {label}
      </Text>
    </View>
  );
}
