import { Pressable, StyleSheet, Text } from 'react-native';
import { theme } from '../theme';
import { F } from '../fonts';

// Gold pill button from the Figma frames (342 x 58, fully rounded).
export function PrimaryButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ disabled }} onPress={onPress} disabled={disabled}
      style={[s.base, s.primary, disabled && { opacity: 0.5 }]}>
      <Text style={s.primaryText}>{label}</Text>
    </Pressable>
  );
}

// Outlined pill button, used on the success screen (light outline on teal).
export function OutlineButton({ label, onPress, color = '#FFFFFF', border = '#7FB3AE' }: { label: string; onPress: () => void; color?: string; border?: string }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[s.base, { borderWidth: 2, borderColor: border, height: 56 }]}>
      <Text style={[s.outlineText, { color }]}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  base: { alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center', borderRadius: 29 },
  primary: { height: 58, backgroundColor: theme.colors.gold },
  primaryText: { fontFamily: F.black, fontSize: 17, color: theme.colors.ink },
  outlineText: { fontFamily: F.black, fontSize: 16 },
});
