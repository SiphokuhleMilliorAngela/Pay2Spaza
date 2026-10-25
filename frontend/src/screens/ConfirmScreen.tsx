import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { theme } from '../theme';
import { Strings } from '../i18n/strings';
import { Merchant } from '../api/types';
import { PrimaryButton } from '../components/PrimaryButton';
import { pay } from '../services/pay';
import { ResultInfo } from './ResultScreen';

export function ConfirmScreen(p: { t: Strings; merchant: Merchant; online: boolean; onCancel: () => void; onDone: (r: ResultInfo) => void }) {
  const { t, merchant: m, online } = p;
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const value = parseFloat(amount.replace(',', '.'));
  const valid = value > 0;

  const go = async () => {
    setBusy(true); setErr('');
    try {
      const r = await pay({ merchantId: m.id, amount: value, online, t });
      p.onDone({ kind: r.kind, name: m.ownerFirstName, amount: value, reason: r.reason });
    } catch (e: any) { setErr(e.message || t.failedBody); setBusy(false); }
  };

  return (
    <View style={s.wrap}>
      <View style={s.card}>
        <View style={s.avatar}><Text style={s.avatarText}>{m.ownerFirstName[0]}</Text></View>
        <Text style={s.name}>{m.name}</Text>
        <Text style={s.badge}>{t.checkedBy(m.ownerFirstName)}</Text>
        <Text style={s.label}>{t.howMuch}</Text>
        <View style={s.amountRow}>
          <Text style={s.rand}>R</Text>
          <TextInput value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0" placeholderTextColor={theme.colors.line}
            style={s.amount} accessibilityLabel={t.howMuch} autoFocus />
        </View>
        <View style={s.quick}>
          {[10, 20, 50, 100].map(n => (
            <Pressable key={n} onPress={() => setAmount(String(n))} style={s.chip} accessibilityRole="button" accessibilityLabel={`R${n}`}>
              <Text style={s.chipText}>R{n}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <Text style={[s.note, !online && s.noteOff]}>{online ? t.onlineNote(m.ownerFirstName) : t.offlineNote}</Text>
      {!!err && <Text style={s.err} accessibilityLiveRegion="polite">{err}</Text>}
      <View style={{ flex: 1 }} />
      <PrimaryButton label={t.payBtn(m.ownerFirstName)} onPress={go} disabled={!valid || busy} />
      <Pressable onPress={p.onCancel} style={s.cancel} accessibilityRole="button"><Text style={s.cancelText}>{t.cancel}</Text></Pressable>
    </View>
  );
}
const s = StyleSheet.create({
  wrap: { flex: 1, padding: theme.space.lg, gap: 14 },
  card: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.card, padding: 24, alignItems: 'center', gap: 8 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: theme.colors.accent, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 32, fontWeight: '800', color: theme.colors.onAccent },
  name: { fontSize: 24, fontWeight: '800', color: theme.colors.ink },
  badge: { fontSize: 13, color: theme.colors.successText, backgroundColor: theme.colors.successBg, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99, overflow: 'hidden', fontWeight: '700' },
  label: { marginTop: 12, fontSize: theme.font.small, color: theme.colors.muted },
  amountRow: { flexDirection: 'row', alignItems: 'center' },
  rand: { fontSize: 40, fontWeight: '800', color: theme.colors.muted, marginRight: 6 },
  amount: { fontSize: theme.font.amount, fontWeight: '800', color: theme.colors.ink, minWidth: 90, textAlign: 'left' },
  quick: { flexDirection: 'row', gap: 8, marginTop: 4 },
  chip: { minHeight: 44, minWidth: 60, paddingHorizontal: 14, borderRadius: 22, backgroundColor: theme.colors.bg, borderWidth: 2, borderColor: theme.colors.line, alignItems: 'center', justifyContent: 'center' },
  chipText: { fontWeight: '800', color: theme.colors.ink },
  note: { fontSize: theme.font.small, color: theme.colors.successText, backgroundColor: theme.colors.successBg, padding: 12, borderRadius: 14, overflow: 'hidden' },
  noteOff: { color: theme.colors.pendingText, backgroundColor: theme.colors.pendingBg },
  err: { color: theme.colors.errorText, backgroundColor: theme.colors.errorBg, padding: 12, borderRadius: 14, fontSize: theme.font.small, overflow: 'hidden' },
  cancel: { minHeight: theme.touchMin, alignItems: 'center', justifyContent: 'center' },
  cancelText: { color: theme.colors.muted, fontSize: theme.font.body, fontWeight: '700' },
});
