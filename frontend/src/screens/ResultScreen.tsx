import { Share, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { theme, topInset } from '../theme';
import { F } from '../fonts';
import { Strings } from '../i18n/strings';
import { OutlineButton, PrimaryButton } from '../components/Buttons';
import { StatusChip } from '../components/StatusChip';
import { OFFLINE_TOTAL } from '../services/pay';

export type ResultInfo = {
  kind: 'confirmed' | 'pending' | 'rejected';
  shopName: string; name: string; amount: number; reference: string; createdAt: string;
  reason?: string | null; allowance?: { leftAmount: number; leftCount: number };
};

export function ResultScreen({ t, r, onDone }: { t: Strings; r: ResultInfo; onDone: () => void }) {
  return r.kind === 'pending' ? <SavedOffline t={t} r={r} onDone={onDone} /> : <Paid t={t} r={r} onDone={onDone} />;
}

// Successful payment (also used for a rejected one, with a red background).
function Paid({ t, r, onDone }: { t: Strings; r: ResultInfo; onDone: () => void }) {
  const ok = r.kind === 'confirmed';
  const amt = `R${r.amount.toFixed(2)}`;
  const share = () => Share.share({ message: `${t.appName}: ${t.sentTo(amt, r.shopName)}. ${t.receiptRef}: ${r.reference}` });
  return (
    <View style={[s.root, { backgroundColor: ok ? theme.colors.primary : theme.colors.danger, paddingTop: topInset + 90 }]}>
      <View style={s.circle}>
        <Svg width={64} height={64} viewBox="0 0 64 64">
          {ok
            ? <Path d="M16 34 l11 11 l22 -25" stroke={theme.colors.primary} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            : <Path d="M18 18 L46 46 M46 18 L18 46" stroke={theme.colors.danger} strokeWidth={8} strokeLinecap="round" fill="none" />}
        </Svg>
      </View>
      <Text style={s.title} accessibilityRole="header">{ok ? t.sharp : t.failedTitle}</Text>
      <Text style={s.sub}>{ok ? t.sentTo(amt, r.name) : r.reason || t.failedBody}</Text>
      <View style={[theme.card, s.receipt]}>
        {[[t.receiptShop, r.shopName], [t.receiptPaid, amt], [t.receiptRef, r.reference]].map(([a, v], i) => (
          <View key={a} style={[s.row, i < 2 && s.rowLine]}><Text style={s.rowLabel}>{a}</Text><Text style={s.rowValue}>{v}</Text></View>
        ))}
      </View>
      <View style={{ flex: 1 }} />
      <PrimaryButton label={t.done} onPress={onDone} />
      <View style={{ height: 14 }} />
      <OutlineButton label={t.shareReceipt} onPress={share} />
    </View>
  );
}

// Saved offline: shows the real allowance the phone still has.
function SavedOffline({ t, r, onDone }: { t: Strings; r: ResultInfo; onDone: () => void }) {
  const left = r.allowance?.leftAmount ?? 0, count = r.allowance?.leftCount ?? 0;
  return (
    <View style={[s.root, { backgroundColor: theme.colors.bg, paddingTop: topInset + 12 }]}>
      <View style={s.topRow}>
        <Text style={s.topTitle} accessibilityRole="header">{t.noSignal}</Text>
        <StatusChip kind="pending" label={t.offlineChip} minWidth={92} />
      </View>
      <View style={[s.circle, s.clock]}>
        <Svg width={124} height={124} viewBox="0 0 124 124">
          <Circle cx={62} cy={62} r={26} stroke={theme.colors.ink} strokeWidth={5} fill="none" />
          <Path d="M62 46 V62 L73 70" stroke={theme.colors.ink} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </Svg>
      </View>
      <Text style={s.savedTitle}>{t.savedTitle}</Text>
      <Text style={s.savedBody}>{t.savedBody1(r.name)}</Text>
      <Text style={s.savedBody}>{t.savedBody2}</Text>

      <View style={[theme.card, s.payCard]}>
        <View><Text style={s.payAmt}>R{r.amount.toFixed(2)}</Text><Text style={s.payTo}>to {r.shopName}</Text></View>
        <StatusChip kind="pending" label={t.onItsWay} minWidth={98} />
      </View>
      <View style={[theme.card, s.allow]}>
        <View style={s.allowRow}><Text style={s.allowLabel}>{t.offlineAllowance}</Text><Text style={s.allowLeft}>{t.allowanceLeft(left)}</Text></View>
        <View style={s.track}><View style={[s.fill, { width: `${Math.max(0, Math.min(100, (left / OFFLINE_TOTAL) * 100))}%` }]} /></View>
        <Text style={s.allowCount}>{t.paymentsLeft(count)}</Text>
      </View>
      <View style={{ flex: 1 }} />
      <PrimaryButton label={t.done} onPress={onDone} />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 24, paddingBottom: 32 },
  circle: { alignSelf: 'center', width: 128, height: 128, borderRadius: 64, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: F.black, fontSize: 52, color: '#FFFFFF', textAlign: 'center', marginTop: 8 },
  sub: { fontFamily: F.bold, fontSize: 20, color: theme.colors.okBg, textAlign: 'center', marginTop: 4 },
  receipt: { marginTop: 40, paddingHorizontal: 24, paddingVertical: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 56 },
  rowLine: { borderBottomWidth: 1, borderBottomColor: theme.colors.line },
  rowLabel: { fontFamily: F.bold, fontSize: 13, color: theme.colors.muted },
  rowValue: { fontFamily: F.black, fontSize: 15, color: theme.colors.ink },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  topTitle: { fontFamily: F.black, fontSize: 30, color: theme.colors.ink },
  clock: { backgroundColor: theme.colors.gold, width: 124, height: 124, borderRadius: 62, marginTop: 32 },
  savedTitle: { fontFamily: F.black, fontSize: 28, color: theme.colors.ink, textAlign: 'center', marginTop: 28 },
  savedBody: { fontFamily: F.body, fontSize: 16, color: theme.colors.muted, textAlign: 'center', marginTop: 4 },
  payCard: { marginTop: 24, height: 92, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  payAmt: { fontFamily: F.black, fontSize: 32, color: theme.colors.ink },
  payTo: { fontFamily: F.body, fontSize: 15, color: theme.colors.muted },
  allow: { marginTop: 16, padding: 24 },
  allowRow: { flexDirection: 'row', justifyContent: 'space-between' },
  allowLabel: { fontFamily: F.bold, fontSize: 14, color: theme.colors.muted },
  allowLeft: { fontFamily: F.black, fontSize: 14, color: theme.colors.ink },
  track: { height: 12, borderRadius: 6, backgroundColor: theme.colors.line, marginTop: 12, overflow: 'hidden' },
  fill: { height: 12, borderRadius: 6, backgroundColor: theme.colors.primary },
  allowCount: { fontFamily: F.semi, fontSize: 14, color: theme.colors.muted, marginTop: 14 },
});
