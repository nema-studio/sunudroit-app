/**
 * ============================================================================
 * PARCOURIR : LES TROIS COLLECTIONS DE TEXTES
 * ============================================================================
 *
 * Tout le corpus est visible d'un coup d'œil et s'ouvre en un seul geste :
 *  - la Constitution, texte principal, en carte vedette pleine largeur ;
 *  - les lois organiques et les décisions, en deux tuiles côte à côte.
 *
 * Les couleurs du drapeau (vert, jaune, rouge) identifient chaque collection,
 * comme dans le reste de l'app. La balance en filigrane, sur la carte vedette
 * seulement, signe la marque sans charger la lecture.
 */
import { StyleSheet, View } from 'react-native';
import { ArrowRight, ArrowUpRight } from 'lucide-react-native';
import { LogoMark, PressableScale, Text } from '@/components/ui';
import { useTheme } from '@/theme';
import { COLLECTIONS, type Collection, type CollectionId } from './collections';

type OpenCollection = (id: CollectionId) => void;

/** Carte vedette (Constitution). */
function FeaturedCard({ item, onOpen }: { item: Collection; onOpen: OpenCollection }) {
  const t = useTheme();
  return (
    <PressableScale
      pressedScale={0.985}
      onPress={() => onOpen(item.id)}
      accessibilityLabel={`${item.title.replace('\n', ' ')}, ${item.eyebrow.toLowerCase()}. Ouvrir`}
      style={[styles.featured, { backgroundColor: item.bg }]}
    >
      <View style={styles.featuredWatermark} pointerEvents="none">
        <LogoMark size={200} color={item.watermark} strokeWidth={3.5} />
      </View>

      <View style={[styles.tag, { backgroundColor: '#FFFFFF' }]}>
        <Text variant="ref" style={{ color: t.brand.green }}>{item.tagLabel}</Text>
      </View>

      <View style={styles.featuredBottom}>
        <View style={styles.featuredText}>
          <Text variant="headingL" style={{ color: item.fg }}>{item.title}</Text>
          <Text variant="ref" style={{ color: item.muted }}>{item.eyebrow}</Text>
        </View>
        <View style={[styles.arrowDisc, { backgroundColor: t.brand.yellow }]}>
          <ArrowRight size={18} color={t.brand.inkFixed} strokeWidth={2.2} />
        </View>
      </View>
    </PressableScale>
  );
}

/**
 * Tuile compacte (lois organiques, décisions). Sans filigrane : la balance
 * reste la signature de la carte vedette, les tuiles restent nettes.
 */
function TileCard({ item, onOpen }: { item: Collection; onOpen: OpenCollection }) {
  return (
    <PressableScale
      pressedScale={0.97}
      onPress={() => onOpen(item.id)}
      accessibilityLabel={`${item.chip}, ${item.eyebrow.toLowerCase()}. Ouvrir`}
      style={[styles.tile, { backgroundColor: item.bg }]}
    >
      <ArrowUpRight size={18} color={item.fg} strokeWidth={2.2} style={styles.tileArrow} />
      <View style={styles.tileText}>
        <Text variant="bodyStrong" style={{ color: item.fg }} numberOfLines={1}>{item.chip}</Text>
        <Text variant="bodySmall" style={{ color: item.muted }} numberOfLines={2}>
          {item.summary}
        </Text>
      </View>
    </PressableScale>
  );
}

export function CollectionCards({ onOpen }: { onOpen: OpenCollection }) {
  const [featured, ...others] = COLLECTIONS;
  if (!featured) return null;
  return (
    <View style={styles.wrap}>
      <FeaturedCard item={featured} onOpen={onOpen} />
      <View style={styles.row}>
        {others.map((c) => (
          <TileCard key={c.id} item={c} onOpen={onOpen} />
        ))}
      </View>
    </View>
  );
}

const RADIUS = 24;

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  row: { flexDirection: 'row', gap: 10 },

  featured: {
    height: 196,
    borderRadius: RADIUS,
    borderCurve: 'continuous',
    overflow: 'hidden',
    padding: 20,
    justifyContent: 'space-between',
  },
  featuredWatermark: { position: 'absolute', right: -36, top: -14 },
  tag: { alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  featuredBottom: { flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  featuredText: { flex: 1, gap: 8 },
  arrowDisc: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },

  tile: {
    flex: 1,
    height: 120,
    borderRadius: RADIUS,
    borderCurve: 'continuous',
    overflow: 'hidden',
    padding: 16,
    justifyContent: 'flex-end',
  },
  tileArrow: { position: 'absolute', top: 16, right: 16 },
  tileText: { gap: 4 },
});
