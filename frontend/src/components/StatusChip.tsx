import { Text, View } from 'react-native';
import { theme, statusStyle, StatusKind } from '../theme';

export function StatusChip({ kind, label }: { kind: StatusKind; label: string }) {
  const s = statusStyle(kind);
  return (
    <View style={{ alignSelf: 'flex-start', backgroundColor: s.bg, borderRadius: theme.radius.chip, paddingHorizontal: 12, paddingVertical: 6 }}>
      <Text style={{ color: s.fg, fontSize: 12, fontWeight: '700' }}>{label}</Text>
    </View>
  );
}
