import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { theme, topInset } from '../theme';
import { F } from '../fonts';
import { Strings } from '../i18n/strings';
import { Merchant } from '../api/types';
import { PrimaryButton } from '../components/Buttons';
import { pay } from '../services/pay';
import { ResultInfo } from './ResultScreen';

export function ConfirmScreen(p: { t: Strings; merchant: Merchant; online: boolean; onBack: () => void; onDone: (r: ResultInfo) => void }) {
  const { t, merchant: m, online } = p;
  const [amount, setAmount] = useState('50');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const value = parseFloat(amount.replace(',', '.'));
  const valid = value > 0;

  const go = async () => {
    setBusy(true); setErr('');
    try {
      const r = await pay({ merchantId: m.id, amount: value, online, t });
      p.onDone({ kind: r.kind, shopName: m.name, name: m.ownerFirstName, amount: value, reference: r.transactionId, createdAt: r.createdAt, reason: r.reason, allowance: r.allowance });
    } catch (e: any) { setErr(e.message || t.failedBody); setBusy(false); }
  };

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={[s.content, { paddingTop: topInset + 12 }]} keyboardShouldPersistTaps="handled">
        <View style={s.header}>
          <Pressable onPress={p.onBack} accessibilityRole="button" accessibilityLabel="Back" style={s.back}>
            <Svg pointerEvents="none" width={24} height={24} viewBox="0 0 24 24"><Path d="M15 5 l-7 7 l7 7" stroke={theme.colors.ink} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" /></Svg>
          </Pressable>
          <Text style={s.headerTitle} accessibilityRole="header">{t.payAShop}</Text>
          <View style={{ width: 46 }} />
        </View>

        <View style={[theme.card, s.card]}>
          <View style={s.avatar}><Text style={s.avatarText}>{m.ownerFirstName[0]}</Text></View>
          <Text style={s.name}>{m.name}</Text>
          <View style={s.badge}><Text style={s.badgeText}>{t.checkedBy(m.ownerFirstName)}</Text></View>
          <Text style={s.label}>{t.howMuch}</Text>
          <View style={s.amountRow}>
            <Text style={s.amountText}>R</Text>
            <TextInput value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0" placeholderTextColor={theme.colors.line}
              style={s.amountInput} accessibilityLabel={t.howMuch} />
          </View>
          <View style={s.quick}>
            {[10, 20, 50, 100].map(n => {
              const sel = value === n;
              return (
                <Pressable key={n} onPress={() => setAmount(String(n))} accessibilityRole="button" accessibilityLabel={`R${n}`}
                  style={[s.chip, sel && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]}>
                  <Text style={[s.chipText, sel && { color: '#FFFFFF' }]}>R{n}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={[s.note, !online && { backgroundColor: theme.colors.pendingBg }]}>
          <Text style={[s.noteText, !online && { color: theme.colors.pendingText }]}>{online ? t.onlineNote(m.ownerFirstName) : t.offlineNote}</Text>
        </View>
        {!!err && <Text style={s.err} accessibilityLiveRegion="polite">{err}</Text>}
        <View style={{ flex: 1, minHeight: 24 }} />
        <PrimaryButton label={t.payBtn(m.ownerFirstName)} onPress={go} disabled={!valid || busy} />
        <Pressable onPress={p.onBack} accessibilityRole="button" style={s.cancel}><Text style={s.cancelText}>{t.cancel}</Text></Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 24, gap: 14 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  back: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: F.black, fontSize: 17, color: theme.colors.ink },
  card: { alignItems: 'center', padding: 24, paddingBottom: 28 },
  avatar: { width: 76, height: 76, borderRadius: 38, backgroundColor: theme.colors.gold, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: F.black, fontSize: 40, color: theme.colors.ink },
  name: { fontFamily: F.black, fontSize: 24, color: theme.colors.ink, marginTop: 10 },
  badge: { alignSelf: 'stretch', height: 30, borderRadius: 15, backgroundColor: theme.colors.okBg, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  badgeText: { fontFamily: F.black, fontSize: 12, color: theme.colors.okText },
  label: { fontFamily: F.semi, fontSize: 15, color: theme.colors.muted, marginTop: 22 },
  amountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  amountText: { fontFamily: F.black, fontSize: 64, color: theme.colors.ink },
  amountInput: { fontFamily: F.black, fontSize: 64, color: theme.colors.ink, minWidth: 70, padding: 0 },
  quick: { flexDirection: 'row', gap: 6, marginTop: 8 },
  chip: { minWidth: 66, height: 44, paddingHorizontal: 10, borderRadius: 22, backgroundColor: theme.colors.bg, borderWidth: 2, borderColor: theme.colors.line, alignItems: 'center', justifyContent: 'center' },
  chipText: { fontFamily: F.black, fontSize: 15, color: theme.colors.ink },
  note: { minHeight: 52, borderRadius: 16, backgroundColor: theme.colors.okBg, justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 10 },
  noteText: { fontFamily: F.bold, fontSize: 14, color: theme.colors.okText },
  err: { fontFamily: F.semi, fontSize: 14, color: theme.colors.errorText, backgroundColor: theme.colors.errorBg, padding: 12, borderRadius: 14, overflow: 'hidden' },
  cancel: { minHeight: 52, alignItems: 'center', justifyContent: 'center' },
  cancelText: { fontFamily: F.bold, fontSize: 16, color: theme.colors.muted },
});
