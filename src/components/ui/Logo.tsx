/**
 * Logo SunuDroit : la « balance étoilée » (SVG d'origine, viewBox 120×120).
 * `color` colore le trait et l'étoile ; `strokeWidth` s'adapte à la taille
 * (trait plus épais pour les petites tailles, comme sur la planche Logo).
 */
import Svg, { Path } from 'react-native-svg';

const PATHS = [
  'M60 25v9', 'M14 34h92', 'M52 34v58', 'M68 34v58', 'M60 44v38', 'M44 92h32', 'M34 102h52',
  'M24 34 12 64', 'M24 34l12 30', 'M7 64h34c0 9-7.6 14-17 14S7 73 7 64z',
  'M96 34 84 64', 'M96 34l12 30', 'M79 64h34c0 9-7.6 14-17 14s-17-5-17-14z',
];
const STAR = 'M60 6l3 6.2 6.8.9-5 4.8 1.2 6.8L60 21.5l-6 3.2 1.2-6.8-5-4.8 6.8-.9z';

export function LogoMark({ size = 64, color = '#FFFFFF', strokeWidth }: { size?: number; color?: string; strokeWidth?: number }) {
  const sw = strokeWidth ?? (size <= 32 ? 7 : size <= 80 ? 5 : 4);
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" fill="none" accessibilityLabel="Logo SunuDroit">
      <Path d={STAR} fill={color} />
      {PATHS.map((d) => (
        <Path key={d} d={d} stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </Svg>
  );
}
