import { View } from 'react-native';
import { theme } from '../theme';

// Scalloped shop awning. Decorative.
export function Awning({ count = 8 }: { count?: number }) {
  return (
    <View style={{ flexDirection: 'row', height: 22 }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={{ flex: 1, backgroundColor: i % 2 ? theme.colors.primary : theme.colors.accent, borderBottomLeftRadius: 22, borderBottomRightRadius: 22 }} />
      ))}
    </View>
  );
}
