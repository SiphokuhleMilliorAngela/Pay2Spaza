import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';
import { Strings } from '../i18n/strings';
import { PrimaryButton } from '../components/PrimaryButton';

export type ResultInfo = { kind: 'confirmed' | 'pending' | 'rejected'; name: string; amount: number; reason?: string | null };

export function ResultScreen({ t, r, onDone }: { t: Strings; r: ResultInfo; onDone: () => void }) {
  const amt = `R${r.amount.toFixed(2)}`;
  const cfg = {
    confirmed: { bg: theme.colors.primary, fg: '#fff', icon: '✓', title: t.sharp(r.name, amt), body: '' },
    pending: { bg: theme.colors.accent, fg: theme.colors.onAccent, icon: '↻', title: t.savedTitle, body: t.savedBody(r.name) },
    rejected: { bg: theme.colors.danger, fg: '#fff', icon: '!', title: t.failedTitle, body: t.failedBody },
  }[r.kind];
  return (
    <View style={s.wrap}>
      <View style={[s.circle, { backgroundColor: cfg.bg }]}><Text style={[s.icon, { color: cfg.fg }]}>{cfg.icon}</Text></View>
      <Text style={s.title} accessibilityRole="header">{cfg.title}</Text>
      {r.kind === 'pending' && <Text style={s.amount}>{amt}</Text>}
      {!!cfg.body && <Text style={s.body}>{cfg.body}</Text>}
      <View style={{ flex: 1 }} />
      <View style={{ alignSelf: 'stretch' }}><PrimaryButton label={t.done} onPress={onDone} /></View>
    </View>
  );
}
const s = StyleSheet.create({
  wrap: { flex: 1, padding: theme.space.lg, alignItems: 'center', gap: 14, paddingTop: 60 },
  circle: { width: 112, height: 112, borderRadius: 56, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 56, fontWeight: '800' },
  title: { fontSize: theme.font.title, fontWeight: '800', color: theme.colors.ink, textAlign: 'center' },
  amount: { fontSize: 40, fontWeight: '800', color: theme.colors.ink },
  body: { fontSize: theme.font.body, color: theme.colors.muted, textAlign: 'center', lineHeight: 24 },
});
