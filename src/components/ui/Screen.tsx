/**
 * Conteneur d'écran : fond du thème, marges de sécurité (encoche, barre
 * d'accueil), barre d'état adaptée au thème. `scroll` active le défilement.
 */
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/theme';

export function Screen({
  children,
  scroll,
  edges = ['top'],
  background,
  contentStyle,
  statusBar,
}: {
  children: ReactNode;
  scroll?: boolean;
  edges?: Edge[];
  background?: string;
  contentStyle?: StyleProp<ViewStyle>;
  statusBar?: 'light' | 'dark';
}) {
  const t = useTheme();
  const bg = background ?? t.colors.paper;
  return (
    <SafeAreaView edges={edges} style={[styles.fill, { backgroundColor: bg }]}>
      <StatusBar style={statusBar ?? (t.scheme === 'dark' ? 'light' : 'dark')} />
      {scroll ? (
        <ScrollView contentContainerStyle={[styles.pad, contentStyle]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.fill, styles.pad, contentStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  pad: { paddingHorizontal: 20 },
});
