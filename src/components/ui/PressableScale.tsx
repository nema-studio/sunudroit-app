/**
 * Zone pressable qui se tasse très légèrement au toucher.
 *
 * Base de tous les boutons et cartes cliquables : le même retour tactile
 * partout. L'animation tourne sur le fil UI (Reanimated), donc reste fluide
 * même si le JavaScript est occupé.
 *
 * Choix de mouvement : courbe douce sans rebond (voir theme/motion.ts),
 * échelle de 0,98 seulement. Un retour visible mais jamais « élastique ».
 */
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { timing } from '@/theme/motion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface PressableScaleProps extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  /** Échelle pendant l'appui (0,98 par défaut ; 0,99 pour les grandes cartes ; 1 pour désactiver). */
  pressedScale?: number;
  /** Légère vibration au toucher, réservée aux actions principales. */
  haptic?: boolean;
}

export function PressableScale({
  style,
  pressedScale = 0.98,
  haptic,
  onPressIn,
  onPressOut,
  onPress,
  disabled,
  accessibilityRole = 'button',
  ...rest
}: PressableScaleProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  return (
    <AnimatedPressable
      {...rest}
      accessibilityRole={accessibilityRole}
      disabled={disabled}
      onPressIn={(e) => {
        scale.set(withTiming(pressedScale, timing.press));
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.set(withTiming(1, timing.fast));
        onPressOut?.(e);
      }}
      onPress={(e) => {
        if (haptic) Haptics.selectionAsync();
        onPress?.(e);
      }}
      // L'apparence « désactivé » est gérée par chaque composant (Button…) :
      // pas d'opacité ajoutée ici, sinon le texte serait atténué deux fois.
      style={[style, animatedStyle]}
    />
  );
}
