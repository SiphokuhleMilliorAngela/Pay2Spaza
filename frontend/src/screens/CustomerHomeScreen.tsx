import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { theme, topInset } from '../theme';
import { F } from '../fonts';
import { Strings } from '../i18n/strings';
import { A } from '../i18n/authStrings';
import { Session } from '../auth/session';
import { OutlineButton, PrimaryButton } from '../components/Buttons';
import { StatusChip } from '../components/StatusChip';
import { history, Tx } from '../database/db';
import { getAllowance, OFFLINE_MAX, OFFLINE_TOTAL } from '../services/pay';
import { api } from '../api';
import { WalletInfo } from '../api/types';
import { refreshWallet } from '../services/walletCache';
import { myPublicKey } from '../security/sign';

const mask = (p: string) => (p.length > 6 ? `${p.slice(0, 3)} ••• ${p.slice(-4)}` : p);
const today = (iso: string) => new Date(iso).toDateString() === new Date().toDateString(); // local date, not UTC
const kind = (st: Tx['status']) => (st === 'CONFIRMED' ? 'success' : st === 'REJECTED' ? 'error' : 'pending') as 'success' | 'error' | 'pending';

export function CustomerHomeScreen({ t, session, online, refreshKey, onPay, onUssd, onSignOut }: {
  t: Strings; session: Session; online: boolean; refreshKey: number; onPay: () => void; onUssd: () => void; onSignOut: () => void;
}) {
  const [rows, setRows] = useState<Tx[]>([]);
  const [allow, setAllow] = useState({ leftAmount: OFFLINE_TOTAL, leftCount: OFFLINE_MAX });

  useEffect(() => {
    history().then(setRows).catch(() => {});
    getAllowance().then(setAllow).catch(() => {});
  }, [refreshKey]);

  // The wallet comes from the server. The phone remembers it, and the offline allowance can never be more than it.
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [walletMsg, setWalletMsg] = useState('');
  const loadWallet = useCallback(async () => {
    const w = await refreshWallet(session.phone);
    if (w) setWallet(w);
    getAllowance().then(setAllow).catch(() => {});
  }, [session.phone]);
  useEffect(() => { loadWallet().catch(() => {}); }, [loadWallet, refreshKey, online]);
  const addMoney = async () => {
    setWalletMsg('');
    const w = await api.topUpWallet(session.phone, 100, await myPublicKey());
    if (!w) { setWalletMsg(A.topUpFailed); return; }
    await loadWallet();
  };

  const label = (st: Tx['status']) => (st === 'CONFIRMED' ? t.paidChip : st === 'REJECTED' ? A.failedChip : t.onItsWay);
  const spent = rows.filter(r => today(r.createdAt) && r.status !== 'REJECTED').reduce((a, r) => a + r.amount, 0);
  const waiting = rows.filter(r => r.status === 'LOCAL_PENDING').length;
  const pct = Math.max(0, Math.min(100, (allow.leftAmount / OFFLINE_TOTAL) * 100));

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.bg }} contentContainerStyle={[s.wrap, { paddingTop: topInset + 16 }]} bounces={false}>
      <View style={s.top}>
        <View>
          <Text style={s.hello} accessibilityRole="header">{t.welcomeTitle}</Text>
          <Text style={s.phone}>{mask(session.phone)}</Text>
        </View>
        <StatusChip kind={online ? 'success' : 'pending'} label={online ? t.onlineChip : t.offlineChip} minWidth={92} />
      </View>

      <View style={[theme.card, s.spent]}>
        <Text style={s.label}>{A.walletTitle}</Text>
        <Text style={s.total}>{wallet ? `R${wallet.balance.toFixed(2)}` : '–'}</Text>
        {wallet && wallet.balance <= 0 && <Text style={s.walletNote}>{A.walletEmpty}</Text>}
        {!!walletMsg && <Text style={s.walletNote}>{walletMsg}</Text>}
        <Pressable onPress={addMoney} accessibilityRole="button" style={s.link}><Text style={s.linkText}>{A.topUpDemo}</Text></Pressable>
      </View>

      <View style={[theme.card, s.spent]}>
        <Text style={s.label}>{A.spentToday}</Text>
        <Text style={s.total}>R{spent.toFixed(2)}</Text>
      </View>

      <PrimaryButton label={t.payAShop} onPress={onPay} />
      <OutlineButton label={A.ussdBtn} onPress={onUssd} color={theme.colors.ink} border={theme.colors.line} />
      {waiting > 0 && <View style={s.banner}><Text style={s.bannerText}>{t.onTheWay(waiting)}</Text></View>}

      <View style={[theme.card, s.allow]}>
        <View style={s.allowRow}><Text style={s.label}>{t.offlineAllowance}</Text><Text style={s.allowLeft}>{t.allowanceLeft(allow.leftAmount)}</Text></View>
        <View style={s.track}><View style={[s.fill, { width: `${pct}%` }]} /></View>
        <Text style={s.allowCount}>{t.paymentsLeft(allow.leftCount)}</Text>
      </View>

      <Text style={s.section}>{A.recent}</Text>
      <View style={[theme.card, s.list]}>
        {rows.length === 0 && <Text style={s.empty}>{A.noRecent}</Text>}
        {rows.slice(0, 6).map((r, i, a) => (
          <View key={r.transactionId} style={[s.row, i < a.length - 1 && s.rowLine]}>
            <View style={{ flex: 1 }}>
              <Text style={s.amt}>R{r.amount.toFixed(2)}</Text>
              <Text style={s.when}>{r.merchantId} · {new Date(r.createdAt).toTimeString().slice(0, 5)}</Text>
            </View>
            <StatusChip kind={kind(r.status)} label={label(r.status)} minWidth={84} />
          </View>
        ))}
      </View>

      <Pressable onPress={onSignOut} accessibilityRole="button" style={s.signOut}><Text style={s.signOutText}>{A.signOut}</Text></Pressable>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { paddingHorizontal: 24, paddingBottom: 32, gap: 14 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hello: { fontFamily: F.display, fontSize: 52, lineHeight: 60, color: theme.colors.ink },
  phone: { fontFamily: F.bold, fontSize: 14, color: theme.colors.muted },
  spent: { padding: 24 },
  label: { fontFamily: F.bold, fontSize: 14, color: theme.colors.muted },
  total: { fontFamily: F.black, fontSize: 44, color: theme.colors.ink },
  banner: { height: 46, borderRadius: 16, backgroundColor: theme.colors.pendingBg, justifyContent: 'center', paddingHorizontal: 20 },
  bannerText: { fontFamily: F.black, fontSize: 14, color: theme.colors.pendingText },
  allow: { padding: 24 },
  allowRow: { flexDirection: 'row', justifyContent: 'space-between' },
  allowLeft: { fontFamily: F.black, fontSize: 14, color: theme.colors.ink },
  track: { height: 12, borderRadius: 6, backgroundColor: theme.colors.line, marginTop: 12, overflow: 'hidden' },
  fill: { height: 12, borderRadius: 6, backgroundColor: theme.colors.primary },
  allowCount: { fontFamily: F.semi, fontSize: 14, color: theme.colors.muted, marginTop: 14 },
  section: { fontFamily: F.black, fontSize: 18, color: theme.colors.ink, marginTop: 8 },
  list: { paddingHorizontal: 24, paddingVertical: 4 },
  empty: { fontFamily: F.bold, fontSize: 13, color: theme.colors.muted, padding: 16 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 8 },
  rowLine: { borderBottomWidth: 1, borderBottomColor: theme.colors.line },
  amt: { fontFamily: F.black, fontSize: 18, color: theme.colors.ink },
  when: { fontFamily: F.body, fontSize: 12, color: theme.colors.muted, marginTop: 2 },
  walletNote: { fontFamily: F.semi, fontSize: 13, color: theme.colors.errorText, marginTop: 4 },
  link: { minHeight: 44, justifyContent: 'center', marginTop: 4 },
  linkText: { fontFamily: F.bold, fontSize: 15, color: theme.colors.primary },
  signOut: { minHeight: 52, alignItems: 'center', justifyContent: 'center' },
  signOutText: { fontFamily: F.bold, fontSize: 16, color: theme.colors.muted },
});
