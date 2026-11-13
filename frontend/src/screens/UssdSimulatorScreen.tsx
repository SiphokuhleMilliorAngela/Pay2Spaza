import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { theme, topInset } from '../theme';
import { F } from '../fonts';
import { Strings } from '../i18n/strings';
import { api } from '../api';
import { history } from '../database/db';
import { pay } from '../services/pay';
import { START, UssdDeps, UssdState, UssdView, ussdNext } from '../services/ussd';
import { MONO } from './UssdScreen';
import { PrimaryButton } from '../components/Buttons';

// Try the "*120*321#" flow like a feature phone: read the text, type a reply, press Send.
export function UssdSimulatorScreen({ t, onBack }: { t: Strings; onBack: () => void }) {
  const [state, setState] = useState<UssdState>(START.state);
  const [view, setView] = useState<UssdView>(START.view);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [sms, setSms] = useState<string | null>(null);
  const field = useRef<TextInput>(null);

  // USSD runs on the mobile network, not on data, so these payments are sent straight away (online: true).
  const deps: UssdDeps = {
    lookupMerchant: api.lookupMerchant,
    history,
    pay: (merchantId, amount) => pay({ merchantId, amount, online: true, t, channel: 'USSD' }),
  };

  const send = async () => {
    if (busy || view.end || !input.trim()) return;
    setBusy(true);
    try {
      const r = await ussdNext(state, input, deps);
      setState(r.state); setView(r.view); setInput('');
      if (r.view.sms) setSms(r.view.sms);
    } catch {
      setView({ text: 'Network error.\nSession ended.', input: 'number', end: true });
    }
    setBusy(false);
    setTimeout(() => field.current?.focus(), 50);
  };
  const cancel = () => setView({ text: 'Session ended.', input: 'number', end: true });
  const redial = () => { setState(START.state); setView(START.view); setInput(''); setSms(null); setBusy(false); };

  const lines = busy ? ['Please wait…'] : view.text.split('\n');
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={[s.content, { paddingTop: topInset + 12 }]} keyboardShouldPersistTaps="handled">
        <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel={t.back} style={s.back}>
          <Svg pointerEvents="none" width={24} height={24} viewBox="0 0 24 24"><Path d="M15 5 l-7 7 l7 7" stroke={theme.colors.ink} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" /></Svg>
        </Pressable>
        <Text style={s.title} accessibilityRole="header">{t.ussdTitle}</Text>
        <Text style={s.sub}>{t.ussdDialed}</Text>

        <View style={s.lcd} accessibilityLiveRegion="polite">
          {lines.map((l, i) => <Text key={i} style={s.line}>{l}</Text>)}
          {!view.end && !busy && (
            <TextInput ref={field} value={input} onChangeText={setInput} autoFocus onSubmitEditing={send} returnKeyType="send" blurOnSubmit={false}
              secureTextEntry={view.input === 'pin'} keyboardType={view.input === 'text' ? 'default' : view.input === 'pin' ? 'number-pad' : 'decimal-pad'}
              autoCapitalize="characters" autoCorrect={false} maxLength={view.input === 'pin' ? 4 : 24} accessibilityLabel={t.ussdReply}
              style={s.input} placeholderTextColor="#8C7B5E" placeholder="_" selectionColor={theme.colors.gold} />
          )}
        </View>

        {!view.end ? (
          <View style={s.row}>
            <Pressable onPress={cancel} accessibilityRole="button" style={[s.btn, s.ghost]}><Text style={s.ghostText}>{t.ussdCancel}</Text></Pressable>
            <View style={{ flex: 1 }}><PrimaryButton label={t.ussdSend} onPress={send} disabled={busy || !input.trim()} /></View>
          </View>
        ) : (
          <PrimaryButton label={t.ussdRedial} onPress={redial} />
        )}

        {!!sms && (
          <View style={s.sms} accessible accessibilityLabel={`${t.ussdSmsLabel}. ${sms}`}>
            <Text style={s.smsLabel}>{t.ussdSmsLabel}</Text>
            <Text style={s.smsText}>{sms}</Text>
          </View>
        )}
        <Text style={s.note}>{t.ussdDemoNote}</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  content: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 24, gap: 16 },
  back: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: F.black, fontSize: 26, color: theme.colors.ink, marginTop: 4 },
  sub: { fontFamily: F.body, fontSize: 15, color: theme.colors.muted, marginTop: -8 },
  lcd: { backgroundColor: theme.colors.dark, borderRadius: 24, paddingHorizontal: 24, paddingVertical: 22, minHeight: 190 },
  line: { fontFamily: MONO, fontSize: 16, lineHeight: 26, color: theme.colors.gold },
  input: { fontFamily: MONO, fontSize: 18, color: '#FFFFFF', marginTop: 10, paddingVertical: 8, borderBottomWidth: 2, borderBottomColor: theme.colors.gold },
  row: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  btn: { height: 58, paddingHorizontal: 24, borderRadius: 29, alignItems: 'center', justifyContent: 'center' },
  ghost: { borderWidth: 2, borderColor: theme.colors.line },
  ghostText: { fontFamily: F.black, fontSize: 16, color: theme.colors.ink },
  sms: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, gap: 6 },
  smsLabel: { fontFamily: F.black, fontSize: 11, letterSpacing: 0.9, color: theme.colors.muted },
  smsText: { fontFamily: F.bold, fontSize: 15, color: theme.colors.ink },
  note: { fontFamily: F.body, fontSize: 13, color: theme.colors.muted },
});
