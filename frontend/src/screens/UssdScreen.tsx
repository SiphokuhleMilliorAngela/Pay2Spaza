import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { theme, topInset } from '../theme';
import { F } from '../fonts';
import { Strings } from '../i18n/strings';
import { A } from '../i18n/authStrings';
import { api } from '../api';
import { Merchant } from '../api/types';
import { PrimaryButton } from '../components/Buttons';
import { StatusChip } from '../components/StatusChip';
import { history } from '../database/db';
import { getAllowance, OFFLINE_MAX, pay } from '../services/pay';

// Demo shortcode. A real one has to be issued by a mobile network or a USSD provider.
const SHORTCODE = '*120*729#';

type Node =
  | { id: 'menu' }
  | { id: 'shop' }
  | { id: 'amount'; merchant: Merchant }
  | { id: 'confirm'; merchant: Merchant; amount: number }
  | { id: 'end'; text: string };

const prompt = (n: Node): string => {
  switch (n.id) {
    case 'menu': return 'Pay2Spaza\n1. Pay a shop\n2. My offline allowance\n3. Last payments\n0. Exit';
    case 'shop': return 'Enter the shop code (for example SPZ12345):';
    case 'amount': return `Paying ${n.merchant.name}\nEnter the amount in rand:`;
    case 'confirm': return `Pay R${n.amount.toFixed(2)} to ${n.merchant.name}?\n1. Confirm\n2. Cancel`;
    case 'end': return n.text;
  }
};

// A simulated USSD session. Payments made here are sent with channel "USSD".
export function UssdScreen({ t, online, onClose }: { t: Strings; online: boolean; onClose: () => void }) {
  const [open, setOpen] = useState(false);
  const [node, setNode] = useState<Node>({ id: 'menu' });
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const go = (n: Node, err = '') => { setNode(n); setInput(''); setError(err); };
  const start = () => { go({ id: 'menu' }); setOpen(true); };
  const close = () => { setOpen(false); setBusy(false); };

  const send = async () => {
    if (busy) return;
    const v = input.trim();
    switch (node.id) {
      case 'menu': {
        if (v === '1') return go({ id: 'shop' });
        if (v === '2') {
          const a = await getAllowance();
          return go({ id: 'end', text: `Offline allowance\nR${a.leftAmount.toFixed(2)} left\n${a.leftCount} of ${OFFLINE_MAX} payments left` });
        }
        if (v === '3') {
          const h = (await history()).slice(0, 3);
          const lines = h.map(r => `R${r.amount.toFixed(2)} ${r.merchantId} ${r.status === 'LOCAL_PENDING' ? 'PENDING' : r.status}`);
          return go({ id: 'end', text: h.length ? `Last payments\n${lines.join('\n')}` : 'No payments yet' });
        }
        if (v === '0') return close();
        return go({ id: 'menu' }, 'Invalid choice.');
      }
      case 'shop': {
        const code = v.toUpperCase();
        if (!code) return go({ id: 'shop' }, 'Enter a shop code.');
        setBusy(true);
        const m = await api.lookupMerchant(code);
        setBusy(false);
        return m ? go({ id: 'amount', merchant: m }) : go({ id: 'shop' }, 'Shop not found.');
      }
      case 'amount': {
        const amt = Math.round(parseFloat(v.replace(',', '.')) * 100) / 100;
        if (!Number.isFinite(amt) || amt <= 0) return go(node, 'Enter a valid amount.');
        return go({ id: 'confirm', merchant: node.merchant, amount: amt });
      }
      case 'confirm': {
        if (v === '2') return go({ id: 'end', text: 'Payment cancelled.' });
        if (v !== '1') return go(node, 'Reply 1 or 2.');
        setBusy(true);
        try {
          const r = await pay({ merchantId: node.merchant.id, amount: node.amount, online, t, channel: 'USSD' });
          const amt = `R${node.amount.toFixed(2)}`;
          const who = node.merchant.ownerFirstName;
          const text = r.kind === 'confirmed' ? `Sharp! ${amt} sent to ${who}.\nRef: ${r.transactionId}`
            : r.kind === 'pending' ? `Saved. ${amt} goes to ${who} when you are back online.\nRef: ${r.transactionId}`
            : `That one didn’t go through.\n${r.reason ?? ''}`;
          setBusy(false);
          return go({ id: 'end', text });
        } catch (e: any) {
          setBusy(false);
          return go({ id: 'end', text: e?.message || t.failedBody });
        }
      }
      case 'end': return close();
    }
  };

  const ended = node.id === 'end';
  const keyboard = node.id === 'amount' ? 'decimal-pad' : node.id === 'shop' ? 'default' : 'number-pad';

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={[s.content, { paddingTop: topInset + 12 }]} keyboardShouldPersistTaps="handled">
        <View style={s.header}>
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Back" style={s.back}>
            <Svg pointerEvents="none" width={24} height={24} viewBox="0 0 24 24"><Path d="M15 5 l-7 7 l7 7" stroke={theme.colors.ink} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" /></Svg>
          </Pressable>
          <Text style={s.headerTitle} accessibilityRole="header">{A.ussdTitle}</Text>
          <StatusChip kind={online ? 'success' : 'pending'} label={online ? t.onlineChip : t.offlineChip} minWidth={78} />
        </View>

        <View style={[theme.card, s.card]}>
          <Text style={s.intro}>{A.ussdIntro}</Text>
          <Text style={s.code} accessibilityLabel={`Dial ${SHORTCODE}`}>{SHORTCODE}</Text>
          <PrimaryButton label={A.ussdDial} onPress={start} />
          <Text style={s.demo}>{A.ussdDemo}</Text>
        </View>
      </ScrollView>

      {open && (
        <View style={s.overlay}>
          <View style={s.dialog}>
            <Text style={s.dialogTitle}>{SHORTCODE}</Text>
            {!!error && <Text style={s.dialogErr} accessibilityLiveRegion="polite">{error}</Text>}
            <Text style={s.dialogText}>{busy ? 'USSD running…' : prompt(node)}</Text>
            {!ended && (
              <TextInput value={input} onChangeText={setInput} keyboardType={keyboard} autoFocus editable={!busy}
                autoCapitalize="characters" autoCorrect={false} style={s.dialogInput} accessibilityLabel="USSD reply" />
            )}
            <View style={s.dialogActions}>
              {!ended && <Pressable onPress={close} accessibilityRole="button" style={s.dialogBtn}><Text style={s.dialogCancel}>{A.ussdCancel}</Text></Pressable>}
              <Pressable onPress={send} disabled={busy} accessibilityRole="button" style={[s.dialogBtn, busy && { opacity: 0.5 }]}>
                <Text style={s.dialogSend}>{ended ? A.ussdOk : A.ussdSend}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 24, gap: 14 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  back: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: F.black, fontSize: 17, color: theme.colors.ink },
  card: { padding: 24, gap: 16 },
  intro: { fontFamily: F.body, fontSize: 16, color: theme.colors.muted },
  code: { fontFamily: F.black, fontSize: 40, color: theme.colors.ink, textAlign: 'center' },
  demo: { fontFamily: F.semi, fontSize: 13, color: theme.colors.muted, textAlign: 'center' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', paddingHorizontal: 24 },
  dialog: { backgroundColor: '#FFFFFF', borderRadius: 28, padding: 22 },
  dialogTitle: { fontFamily: F.black, fontSize: 15, color: theme.colors.muted, marginBottom: 10 },
  dialogErr: { fontFamily: F.semi, fontSize: 14, color: theme.colors.errorText, marginBottom: 8 },
  dialogText: { fontFamily: F.body, fontSize: 17, lineHeight: 25, color: theme.colors.ink },
  dialogInput: { marginTop: 14, borderBottomWidth: 2, borderBottomColor: theme.colors.primary, fontFamily: F.bold, fontSize: 20, color: theme.colors.ink, paddingVertical: 6 },
  dialogActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 14 },
  dialogBtn: { minHeight: 44, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  dialogCancel: { fontFamily: F.bold, fontSize: 16, color: theme.colors.muted },
  dialogSend: { fontFamily: F.black, fontSize: 16, color: theme.colors.primary },
});
