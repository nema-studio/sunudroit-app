/**
 * ============================================================================
 * THÈME CLAIR / SOMBRE / SYSTÈME
 * ============================================================================
 *
 * Le réglage est enregistré sur le téléphone (expo-sqlite/kv-store, synchrone,
 * donc pas de « flash » du mauvais thème au démarrage).
 *  - « system » suit le réglage du téléphone (useColorScheme).
 *  - « light » / « dark » forcent le thème.
 */
import { createContext, use, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import Storage from 'expo-sqlite/kv-store';
import { brand, darkColors, elevation, lightColors, radius, size, space, type ColorTokens } from './tokens';
import { fonts, type } from './typography';

export type ThemePreference = 'light' | 'dark' | 'system';

export interface Theme {
  scheme: 'light' | 'dark';
  colors: ColorTokens;
  brand: typeof brand;
  space: typeof space;
  radius: typeof radius;
  size: typeof size;
  elevation: typeof elevation;
  fonts: typeof fonts;
  type: typeof type;
}

interface ThemeContextValue {
  theme: Theme;
  preference: ThemePreference;
  setPreference: (p: ThemePreference) => void;
}

const STORAGE_KEY = 'pref.theme';
const ThemeContext = createContext<ThemeContextValue | null>(null);

function readPreference(): ThemePreference {
  const v = Storage.getItemSync(STORAGE_KEY);
  return v === 'light' || v === 'dark' || v === 'system' ? v : 'system';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [preference, setPref] = useState<ThemePreference>(readPreference);

  const scheme: 'light' | 'dark' = preference === 'system' ? (system === 'dark' ? 'dark' : 'light') : preference;

  const value = useMemo<ThemeContextValue>(
    () => ({
      preference,
      setPreference: (p) => {
        Storage.setItemSync(STORAGE_KEY, p);
        setPref(p);
      },
      theme: {
        scheme,
        colors: scheme === 'dark' ? darkColors : lightColors,
        brand,
        space,
        radius,
        size,
        elevation,
        fonts,
        type,
      },
    }),
    [preference, scheme],
  );

  return <ThemeContext value={value}>{children}</ThemeContext>;
}

/** Accès au thème courant : `const { colors } = useTheme();` */
export function useTheme(): Theme {
  const ctx = use(ThemeContext);
  if (!ctx) throw new Error('useTheme doit être utilisé dans <ThemeProvider>.');
  return ctx.theme;
}

/** Lecture et modification du réglage (écran Réglages). */
export function useThemePreference() {
  const ctx = use(ThemeContext);
  if (!ctx) throw new Error('useThemePreference doit être utilisé dans <ThemeProvider>.');
  return { preference: ctx.preference, setPreference: ctx.setPreference };
}
