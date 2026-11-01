import { Text, View } from 'react-native';
import { statusStyle, StatusKind } from '../theme';
import { F } from '../fonts';

export function StatusChip({ kind, label, minWidth = 84 }: { kind: StatusKind; label: string; minWidth?: number }) {
  const s = statusStyle(kind);
  return (
    <View style={{ minWidth, height: 28, paddingHorizontal: 14, borderRadius: 14, backgroundColor: s.bg, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: s.fg, fontSize: 12, fontFamily: F.black }}>{label}</Text>
    </View>
  );
}
