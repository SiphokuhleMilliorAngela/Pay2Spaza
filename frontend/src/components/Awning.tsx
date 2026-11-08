import Svg, { Path } from 'react-native-svg';
import { theme } from '../theme';

// Scalloped awning across the top of the shop owner screen (gold and teal).
export function Awning() {
  const n = 8, w = 390 / n;
  return (
    <Svg pointerEvents="none" width="100%" height={38} viewBox="0 0 390 38" preserveAspectRatio="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {Array.from({ length: n }).map((_, i) => (
        <Path key={i} d={`M${i * w} 0 H${(i + 1) * w} V14 A${w / 2} ${w / 2} 0 0 1 ${i * w} 14 Z`} fill={i % 2 === 0 ? theme.colors.gold : theme.colors.primary} />
      ))}
    </Svg>
  );
}
