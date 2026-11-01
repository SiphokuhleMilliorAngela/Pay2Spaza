import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { theme } from '../theme';
import { F } from '../fonts';
import { Strings } from '../i18n/strings';
import { Merchant } from '../api/types';
import { Awning } from '../components/Awning';
import { StatusChip } from '../components/StatusChip';
import { history, Tx } from '../database/db';

// Prototype: lists payments stored on THIS phone. The real shop owner view will use the backend's history endpoint.
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
  const label = (st: Tx['status']) => (st === 'CONFIRMED' ? t.paidChip : st === 'REJECTED' ? t.failedTitle : t.onItsWay);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.bg }} contentContainerStyle={s.wrap} bounces={false}>
      <Awning />
      <View style={s.pad}>
        <Text style={s.name} accessibilityRole="header">{merchant.name}</Text>
        <View style={s.tags}>
          <View style={[s.tag, { backgroundColor: theme.colors.okBg, width: 110 }]}><Text style={[s.tagText, { color: theme.colors.okText }]}>{t.verified}</Text></View>
          <View style={[s.tag, { backgroundColor: theme.colors.gold, width: 78 }]}><Text style={[s.tagText, { color: theme.colors.ink }]}>{t.open}</Text></View>
        </View>

        <View style={[theme.card, s.qrCard]}>
          <View style={s.qrTile}><QRCode value={JSON.stringify({ merchantId: merchant.id })} size={148} /></View>
          <Text style={s.show}>{t.showCode}</Text>
          <Text style={s.id}>{merchant.id}</Text>
        </View>

        <Text style={s.today}>{t.today}</Text>
        <Text style={s.total}>R{total.toFixed(2)}</Text>
        {waiting > 0 && <View style={s.banner}><Text style={s.bannerText}>{t.onTheWay(waiting)}</Text></View>}

        <View style={[theme.card, s.list]}>
          {todays.length === 0 && <Text style={[s.id, { padding: 16 }]}>{t.noPayments}</Text>}
          {todays.slice(0, 6).map((r, i, a) => (
            <View key={r.transactionId} style={[s.row, i < a.length - 1 && s.rowLine]}>
              <View style={{ flex: 1 }}>
                <Text style={s.amt}>R{r.amount.toFixed(2)}</Text>
                <Text style={s.when}>{new Date(r.createdAt).toTimeString().slice(0, 5)} · {r.status === 'LOCAL_PENDING' ? t.backedBy : r.channel}</Text>
              </View>
              <StatusChip kind={kind(r.status)} label={label(r.status)} minWidth={84} />
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { paddingBottom: 32 },
  pad: { paddingHorizontal: 24 },
  name: { fontFamily: F.black, fontSize: 28, color: theme.colors.ink, marginTop: 18 },
  tags: { flexDirection: 'row', gap: 8, marginTop: 10 },
  tag: { height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  tagText: { fontFamily: F.black, fontSize: 13 },
  qrCard: { marginTop: 18, alignItems: 'center', paddingVertical: 18, gap: 4 },
  qrTile: { padding: 16, backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 2, borderColor: theme.colors.line, marginBottom: 6 },
  show: { fontFamily: F.bold, fontSize: 14, color: theme.colors.muted },
  id: { fontFamily: F.bold, fontSize: 12, color: theme.colors.muted },
  today: { fontFamily: F.bold, fontSize: 14, color: theme.colors.muted, marginTop: 24 },
  total: { fontFamily: F.black, fontSize: 44, color: theme.colors.ink },
  banner: { height: 46, borderRadius: 16, backgroundColor: theme.colors.pendingBg, justifyContent: 'center', paddingHorizontal: 20, marginTop: 8 },
  bannerText: { fontFamily: F.black, fontSize: 14, color: theme.colors.pendingText },
  list: { marginTop: 16, paddingHorizontal: 24, paddingVertical: 4 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 8 },
  rowLine: { borderBottomWidth: 1, borderBottomColor: theme.colors.line },
  amt: { fontFamily: F.black, fontSize: 18, color: theme.colors.ink },
  when: { fontFamily: F.body, fontSize: 12, color: theme.colors.muted, marginTop: 2 },
});
