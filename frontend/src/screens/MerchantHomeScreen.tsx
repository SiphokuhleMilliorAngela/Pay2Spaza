import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { theme } from '../theme';
import { Strings } from '../i18n/strings';
import { Merchant } from '../api/types';
import { Awning } from '../components/Awning';
import { StatusChip } from '../components/StatusChip';
import { history, Tx } from '../database/db';

// Prototype: shows payments stored on THIS phone. The real merchant view will use the backend history endpoint.
export function MerchantHomeScreen({ t, merchant, refreshKey }: { t: Strings; merchant: Merchant | null; refreshKey: number }) {
  const [rows, setRows] = useState<Tx[]>([]);
  const load = useCallback(() => { history().then(setRows).catch(() => {}); }, []);
  useEffect(load, [load, refreshKey]);
  if (!merchant) return null;

  const today = new Date().toISOString().slice(0, 10);
  const todays = rows.filter(r => r.createdAt.slice(0, 10) === today);
  const total = todays.filter(r => r.status !== 'REJECTED').reduce((a, r) => a + r.amount, 0);
  const waiting = rows.filter(r => r.status === 'LOCAL_PENDING').length;
  const kind = (st: Tx['status']) => (st === 'CONFIRMED' ? 'success' : st === 'REJECTED' ? 'error' : 'pending') as 'success' | 'error' | 'pending';
  const label = (st: Tx['status']) => (st === 'CONFIRMED' ? t.statusDone : st === 'REJECTED' ? t.statusFailed : t.statusPending);

  return (
    <ScrollView contentContainerStyle={s.wrap}>
      <View style={s.shop}>
        <Awning />
        <View style={s.shopBody}>
          <Text style={s.name}>{merchant.name}</Text>
          <View style={s.qr}><QRCode value={JSON.stringify({ merchantId: merchant.id })} size={170} /></View>
          <Text style={s.sub}>{t.showCode}</Text>
          <Text style={s.id}>{merchant.id}</Text>
        </View>
      </View>
      <Text style={s.today}>{t.today}</Text>
      <Text style={s.total}>R{total.toFixed(2)}</Text>
      {waiting > 0 && <Text style={s.wait}>{t.onTheWay(waiting)}</Text>}
      {todays.length === 0 && <Text style={s.sub}>{t.noPayments}</Text>}
      {todays.slice(0, 6).map(r => (
        <View key={r.transactionId} style={s.row}>
          <View><Text style={s.amt}>R{r.amount.toFixed(2)}</Text><Text style={s.when}>{new Date(r.createdAt).toTimeString().slice(0, 5)}</Text></View>
          <StatusChip kind={kind(r.status)} label={label(r.status)} />
        </View>
      ))}
    </ScrollView>
  );
}
const s = StyleSheet.create({
  wrap: { padding: theme.space.lg, gap: 12 },
  shop: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.card, overflow: 'hidden' },
  shopBody: { alignItems: 'center', padding: 20, gap: 10 },
  name: { fontSize: 22, fontWeight: '800', color: theme.colors.ink },
  qr: { padding: 12, backgroundColor: '#fff', borderRadius: 20, borderWidth: 2, borderColor: theme.colors.line },
  sub: { color: theme.colors.muted, fontSize: theme.font.small, textAlign: 'center' },
  id: { color: theme.colors.muted, fontSize: 13, fontWeight: '700' },
  today: { fontSize: theme.font.small, color: theme.colors.muted, fontWeight: '700', marginTop: 8 },
  total: { fontSize: 44, fontWeight: '800', color: theme.colors.ink },
  wait: { color: theme.colors.pendingText, backgroundColor: theme.colors.pendingBg, padding: 12, borderRadius: 14, overflow: 'hidden', fontWeight: '700' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: 18, padding: 14 },
  amt: { fontSize: 18, fontWeight: '800', color: theme.colors.ink },
  when: { fontSize: 13, color: theme.colors.muted },
});
