/**
 * ============================================================================
 * ÉCRAN 08 · RECHERCHE
 * ============================================================================
 * Champ de recherche + résultats du moteur local (hors ligne) :
 * accès direct « art 92 », tolérance aux fautes, suggestion de correction.
 *
 * Paramètres d'URL acceptés (liens depuis l'accueil) :
 *   /recherche?type=lois     → filtre sur un type de texte (puce retirable)
 *   /recherche?q=art%2092    → requête pré-remplie
 *   /recherche?focus=<n>     → ouvre le clavier (valeur différente à chaque appel)
 */
import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, StyleSheet, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Search as SearchIcon, X } from 'lucide-react-native';
import { PressableScale, Screen, Text } from '@/components/ui';
import { EmptyState } from '@/components/states/EmptyState';
import { TAB_BAR_SPACE } from '@/components/navigation/FloatingTabBar';
import { useTheme } from '@/theme';
import { search, type SearchResponse } from '@/features/search/searchEngine';
import { findCollection } from '@/features/home/collections';

/** Ligne affichée dans la liste, quel que soit le type de résultat. */
interface Row {
  key: string;
  reference: string;
  title: string;
  excerpt?: string;
}

/** Aplatit la réponse du moteur en lignes d'affichage (article direct en premier). */
function toRows(res: SearchResponse): Row[] {
  const rows: Row[] = [];
  const direct = res.directArticle;
  if (direct) {
    rows.push({ key: `direct-${direct.article.id}`, reference: `${direct.text.shortTitle} · ART. ${direct.article.number}`, title: direct.article.summary });
  }
  for (const r of res.results) {
    if (r.kind === 'article') {
      rows.push({ key: r.item.article.id, reference: `${r.item.text.shortTitle} · ART. ${r.item.article.number}`, title: r.item.article.summary, excerpt: r.excerpt });
    } else {
      rows.push({ key: r.text.id, reference: r.text.shortTitle, title: r.text.title, excerpt: r.text.subtitle });
    }
  }
  return rows;
}

export default function Recherche() {
  const t = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: string; q?: string; focus?: string }>();
  const collection = findCollection(params.type);
  const input = useRef<React.ComponentRef<typeof TextInput>>(null);

  // Arrivée depuis la barre de recherche de l'accueil : clavier prêt, sans second geste.
  // Léger délai pour laisser finir la transition d'onglet (sinon le clavier saccade).
  useEffect(() => {
    if (!params.focus) return;
    const id = setTimeout(() => input.current?.focus(), 250);
    return () => clearTimeout(id);
  }, [params.focus]);

  const [query, setQuery] = useState(params.q ?? '');
  const [focused, setFocused] = useState(false);
  // Un nouveau lien « ?q=… » (carte Reprendre) remplace la saisie en cours.
  // Ajustement pendant le rendu plutôt qu'un useEffect : pas de rendu en cascade
  // (https://react.dev/learn/you-might-not-need-an-effect).
  const [linkedQuery, setLinkedQuery] = useState(params.q);
  if (params.q !== linkedQuery) {
    setLinkedQuery(params.q);
    if (params.q) setQuery(params.q);
  }

  // La saisie reste fluide : le calcul suit avec un léger différé.
  const deferredQuery = useDeferredValue(query);
  const response = useMemo(() => search(deferredQuery, collection?.textType ?? 'all'), [deferredQuery, collection]);
  const rows = useMemo(() => toRows(response), [response]);

  const clearFilter = () => router.setParams({ type: undefined });

  return (
    <Screen>
      <Text variant="headingL" accessibilityRole="header" style={styles.title}>Rechercher</Text>

      <View style={[styles.field, { backgroundColor: t.colors.surface, borderColor: focused || query ? t.colors.ink : 'transparent' }]}>
        <SearchIcon size={18} color={t.colors.ink} strokeWidth={2} />
        <TextInput
          ref={input}
          value={query}
          onChangeText={setQuery}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Rechercher un article, un thème…"
          placeholderTextColor={t.colors.inkMuted}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="never"
          accessibilityLabel="Rechercher dans les textes"
          style={[t.type.input, styles.input, { color: t.colors.ink }]}
        />
        {query.length > 0 && (
          <PressableScale onPress={() => setQuery('')} accessibilityLabel="Effacer la recherche" hitSlop={8} style={[styles.clear, { backgroundColor: t.colors.paper }]}>
            <X size={13} color={t.colors.ink} strokeWidth={2.4} />
          </PressableScale>
        )}
      </View>

      {collection && (
        <PressableScale
          onPress={clearFilter}
          accessibilityLabel={`Filtre : ${collection.chip}. Toucher pour le retirer`}
          style={[styles.filter, { backgroundColor: t.colors.ink }]}
        >
          <Text variant="bodySmallStrong" style={{ color: t.colors.onPrimary }}>{collection.chip}</Text>
          <X size={13} color={t.colors.onPrimary} strokeWidth={2.4} />
        </PressableScale>
      )}

      {response.correctedQuery && rows.length === 0 && (
        <Text variant="bodySmall" tone="muted" style={styles.suggestion}>
          Vouliez-vous dire{' '}
          <Text variant="bodySmallStrong" accessibilityRole="link" onPress={() => setQuery(response.correctedQuery!)} style={styles.underline}>
            {response.correctedQuery}
          </Text>
          &#160;?
        </Text>
      )}

      <FlatList
        data={rows}
        keyExtractor={(r) => r.key}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          query.trim() ? (
            <EmptyState icon={SearchIcon} title="Aucun texte ne correspond" body="SunuDroit couvre pour l’instant la Constitution et ses lois organiques." />
          ) : (
            <EmptyState icon={SearchIcon} title="Que cherchez-vous ?" body="Essayez « mandat », « art 92 » ou « Conseil constitutionnel »." />
          )
        }
        renderItem={({ item }) => (
          <View style={[styles.result, { backgroundColor: t.colors.surface }]}>
            <Text variant="ref" tone="green">{item.reference.toUpperCase()}</Text>
            <Text variant="bodyStrong">{item.title}</Text>
            {item.excerpt ? <Text variant="bodySmall" tone="muted" numberOfLines={3}>{item.excerpt}</Text> : null}
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: 14 },
  field: { marginTop: 16, height: 54, borderRadius: 27, borderWidth: 1.5, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16 },
  input: { flex: 1, height: '100%' },
  clear: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  filter: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, height: 34, paddingHorizontal: 14, borderRadius: 17, marginTop: 12 },
  suggestion: { marginTop: 12 },
  underline: { textDecorationLine: 'underline' },
  list: { gap: 8, paddingTop: 16, paddingBottom: TAB_BAR_SPACE + 20 },
  result: { borderRadius: 20, borderCurve: 'continuous', padding: 16, gap: 6 },
});
