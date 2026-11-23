/**
 * ============================================================================
 * PILE DE CARTES DE L'ACCUEIL
 * ============================================================================
 *
 * Trois cartes empilées (vert, jaune, corail), une par type de texte. Chaque
 * carte connaît sa place dans la pile (0 = devant, 1 = milieu, 2 = derrière)
 * et s'y rend en douceur. Les cartes de derrière sont réduites et remontées :
 * on n'en voit que le bord supérieur, comme sur la maquette.
 *
 * Mouvements (tous sans rebond, courbes de theme/motion.ts) :
 *  1. ENTRÉE      : les cartes apparaissent en fondu en montant de 16 px,
 *                   de la plus lointaine à la plus proche.
 *  2. CHANGEMENT  : toucher une puce fait glisser sa carte devant ; le contenu
 *                   de l'ancienne carte s'efface avant que le nouveau apparaisse
 *                   (fondu enchaîné), sans saut ni bascule.
 *  3. APPUI       : la carte de devant se tasse à peine et celles de derrière
 *                   remontent de quelques pixels.
 *  4. DÉFILEMENT  : tirer l'écran vers le bas écarte légèrement les cartes.
 *
 * Tout tourne sur le fil UI (worklets Reanimated). « Réduire les animations »
 * est respecté par les configurations de theme/motion.ts.
 */
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { Button, LogoMark, PressableScale, Text } from '@/components/ui';
import { duration, easing, STAGGER, timing, useTheme } from '@/theme';
import { COLLECTIONS, type Collection, type CollectionId } from './collections';

/* Géométrie, d'après la maquette (390 × 844). */
const DECK_HEIGHT = 290;
const CARD_HEIGHT = 256;
const CARD_RADIUS = 28;
/** Bord supérieur visible de chaque étage et largeur relative. */
const SLOTS = [
  { top: 34, scale: 1 }, // devant
  { top: 16, scale: 320 / 350 }, // milieu (15 px de retrait de chaque côté)
  { top: 0, scale: 290 / 350 }, // derrière (30 px de retrait)
] as const;
/** Distance de montée à l'entrée (px). */
const ENTER_OFFSET = 16;
/** Écartement maximal des cartes de derrière à l'appui (px). */
const FAN_OFFSET = 6;

/** Déplacement des cartes : un peu plus long qu'une apparition, pour être lisible. */
const MOVE = { duration: 420, easing: easing.out };

/** translateY qui place le BORD HAUT de la carte réduite au bon endroit. */
function slotY(slot: number) {
  'worklet';
  const s = SLOTS[slot] ?? SLOTS[2];
  return s.top - ((1 - s.scale) * CARD_HEIGHT) / 2;
}

interface CardProps {
  item: Collection;
  /** Place dans la pile : 0 (devant), 1 ou 2. */
  slot: number;
  /** Ordre d'apparition à l'entrée (0 = premier). */
  order: number;
  /** 0 → 1 pendant l'appui sur la pile. */
  pressed: SharedValue<number>;
  /** Défilement vertical de l'écran (négatif quand on tire vers le bas). */
  scrollY: SharedValue<number>;
  onOpen: (id: CollectionId) => void;
}

function DeckCard({ item, slot, order, pressed, scrollY, onOpen }: CardProps) {
  const t = useTheme();
  const position = useSharedValue(slot); // place animée (peut être fractionnaire)
  const entered = useSharedValue(0); // 0 → 1 à l'entrée
  const contentOpacity = useSharedValue(slot === 0 ? 1 : 0);

  // Entrée : de la carte la plus lointaine à la plus proche.
  useEffect(() => {
    entered.set(withDelay(120 + order * STAGGER, withTiming(1, timing.slow)));
  }, [entered, order]);

  // Changement de place. Le contenu sortant s'efface vite ; le contenu
  // entrant attend que la carte soit presque arrivée pour apparaître.
  useEffect(() => {
    position.set(withTiming(slot, MOVE));
    contentOpacity.set(
      slot === 0
        ? withDelay(duration.press, withTiming(1, timing.base))
        : withTiming(0, timing.press),
    );
  }, [slot, position, contentOpacity]);

  const cardStyle = useAnimatedStyle(() => {
    const p = position.get();
    const scale = interpolate(p, [0, 1, 2], [SLOTS[0].scale, SLOTS[1].scale, SLOTS[2].scale], Extrapolation.CLAMP);
    const baseY = interpolate(p, [0, 1, 2], [slotY(0), slotY(1), slotY(2)], Extrapolation.CLAMP);
    // Écartement : appui sur la pile, ou écran tiré vers le bas.
    const pull = interpolate(scrollY.get(), [-120, 0], [1, 0], Extrapolation.CLAMP);
    const fan = Math.max(pressed.get(), pull) * p * FAN_OFFSET;
    const fromBelow = (1 - entered.get()) * ENTER_OFFSET;
    const pressScale = p < 0.5 ? 1 - pressed.get() * 0.01 : 1;
    return {
      opacity: entered.get(),
      transform: [{ translateY: baseY + fromBelow - fan }, { scale: scale * pressScale }],
    };
  });

  const contentStyle = useAnimatedStyle(() => ({ opacity: contentOpacity.get() * entered.get() }));

  const isFront = slot === 0;
  const onGreen = item.id === 'constitution';

  return (
    <Animated.View
      style={[styles.card, { backgroundColor: item.bg, zIndex: 10 - slot }, cardStyle]}
      // Seule la carte de devant est lue par VoiceOver / TalkBack.
      importantForAccessibility={isFront ? 'auto' : 'no-hide-descendants'}
      accessibilityElementsHidden={!isFront}
    >
      {/* Filigrane : la balance, découpée par le bord de la carte. */}
      <View style={styles.watermark} pointerEvents="none">
        <LogoMark size={230} color={item.watermark} strokeWidth={3.5} />
      </View>

      <Animated.View style={[styles.content, contentStyle]} pointerEvents={isFront ? 'auto' : 'none'}>
        <View style={[styles.tag, { backgroundColor: onGreen ? '#FFFFFF' : t.brand.inkFixed }]}>
          <Text variant="ref" style={{ color: onGreen ? t.brand.green : '#FFFFFF' }}>{item.tagLabel}</Text>
        </View>

        <View style={styles.spacer} />

        <Text variant="ref" style={{ color: item.muted }}>{item.eyebrow}</Text>
        <Text variant="headingL" accessibilityRole="header" style={[styles.title, { color: item.fg }]}>
          {item.title}
        </Text>

        <Button variant="onBrand" label={item.cta} arrow onPress={() => onOpen(item.id)} style={styles.cta} />
      </Animated.View>
    </Animated.View>
  );
}

/**
 * La pile complète. Toucher n'importe où sur la carte de devant l'ouvre ;
 * le bouton de la carte fait la même chose (cible plus explicite).
 */
export function HeroDeck({
  selected,
  scrollY,
  onOpen,
}: {
  selected: CollectionId;
  scrollY: SharedValue<number>;
  onOpen: (id: CollectionId) => void;
}) {
  const pressed = useSharedValue(0);

  // Ordre de la pile : la sélection devant, les autres derrière dans l'ordre des puces.
  const others = COLLECTIONS.filter((c) => c.id !== selected);
  const slotOf = (id: CollectionId) => (id === selected ? 0 : others.findIndex((c) => c.id === id) + 1);

  return (
    <PressableScale
      accessible={false}
      pressedScale={1}
      onPressIn={() => pressed.set(withTiming(1, timing.press))}
      onPressOut={() => pressed.set(withTiming(0, timing.base))}
      onPress={() => onOpen(selected)}
      style={styles.deck}
    >
      {COLLECTIONS.map((c) => {
        const slot = slotOf(c.id);
        return <DeckCard key={c.id} item={c} slot={slot} order={2 - slot} pressed={pressed} scrollY={scrollY} onOpen={onOpen} />;
      })}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  deck: { height: DECK_HEIGHT, marginTop: 2 },
  card: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: CARD_HEIGHT,
    borderRadius: CARD_RADIUS,
    borderCurve: 'continuous', // coins « squircle » façon iOS
    overflow: 'hidden',
  },
  watermark: { position: 'absolute', right: -40, top: -18 },
  content: { flex: 1, padding: 22 },
  tag: { alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  spacer: { flex: 1 },
  title: { marginTop: 6 },
  cta: { marginTop: 16, height: 56 },
});
