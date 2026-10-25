import { Pressable, Text } from 'react-native';
import { theme } from '../theme';

export function PrimaryButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} disabled={disabled}
      style={{ minHeight: 56, borderRadius: theme.radius.button, backgroundColor: theme.colors.accent, opacity: disabled ? 0.5 : 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: theme.colors.onAccent, fontSize: theme.font.body, fontWeight: '800' }}>{label}</Text>
    </Pressable>
  );
}
