import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { theme, topInset } from '../theme';
import { F } from '../fonts';
import { Strings } from '../i18n/strings';
import { api } from '../api';
import { OtpChallenge } from '../api/types';
import { PrimaryButton } from '../components/Buttons';
import { toSouthAfricanNumber } from '../services/phone';

// Step 1 of 2: ask for the cell number and text a 6-digit code.
export function PhoneScreen(p: { t: Strings; online: boolean; onSent: (identifier: string, challenge: OtpChallenge) => void; onBack: () => void }) {
  const { t } = p;
  const [text, setText] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [focus, setFocus] = useState(false);

  const send = async () => {
    const e164 = toSouthAfricanNumber(text);
    if (!e164) { setErr(t.phoneInvalid); return; }
    if (!p.online) { setErr(t.otpNeedsSignal); return; }
    setBusy(true); setErr('');
    const res = await api.requestOtp(e164);
    setBusy(false);
    if (res.ok) p.onSent(e164, res.data);
    else setErr(res.network ? t.otpNetwork : t.otpSendFailed);
  };

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={[s.content, { paddingTop: topInset + 12 }]} keyboardShouldPersistTaps="handled">
        <View style={s.header}>
          <Pressable onPress={p.onBack} accessibilityRole="button" accessibilityLabel={t.back} style={s.back}>
            <Svg pointerEvents="none" width={24} height={24} viewBox="0 0 24 24"><Path d="M15 5 l-7 7 l7 7" stroke={theme.colors.ink} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" /></Svg>
          </Pressable>
          <View style={{ width: 46 }} />
        </View>

        <View style={[theme.card, s.card]}>
          <View style={s.icon}>
            <Svg pointerEvents="none" width={34} height={34} viewBox="0 0 24 24">
              <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
                stroke={theme.colors.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </Svg>
          </View>
          <Text style={s.title} accessibilityRole="header">{t.phoneTitle}</Text>
          <Text style={s.sub}>{t.phoneSub}</Text>

          <Text style={s.label}>{t.phoneLabel}</Text>
          <View style={[s.field, focus && { borderColor: theme.colors.primary }, !!err && { borderColor: theme.colors.danger }]}>
            <Text style={s.prefix}>+27</Text>
            <TextInput value={text} onChangeText={v => { setText(v); if (err) setErr(''); }} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
              keyboardType="phone-pad" autoComplete="tel" textContentType="telephoneNumber" placeholder={t.phonePlaceholder}
              placeholderTextColor={theme.colors.muted} style={s.input} accessibilityLabel={t.phoneLabel} maxLength={18}
              returnKeyType="send" onSubmitEditing={send} />
          </View>
          {!!err && <Text style={s.err} accessibilityLiveRegion="polite">{err}</Text>}
        </View>

        <View style={{ flex: 1, minHeight: 24 }} />
        <PrimaryButton label={busy ? t.sending : t.sendCode} onPress={send} disabled={busy || text.trim().length < 9} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 24, gap: 14 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  back: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  card: { padding: 24, paddingBottom: 28 },
  icon: { width: 72, height: 72, borderRadius: 36, backgroundColor: theme.colors.gold, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: F.black, fontSize: 26, color: theme.colors.ink, marginTop: 16 },
  sub: { fontFamily: F.body, fontSize: 16, color: theme.colors.muted, marginTop: 6 },
  label: { fontFamily: F.bold, fontSize: 14, color: theme.colors.muted, marginTop: 24, marginBottom: 8 },
  field: { flexDirection: 'row', alignItems: 'center', height: 58, borderRadius: 16, borderWidth: 2, borderColor: theme.colors.line, backgroundColor: theme.colors.bg, paddingHorizontal: 16, gap: 10 },
  prefix: { fontFamily: F.black, fontSize: 20, color: theme.colors.ink },
  input: { flex: 1, fontFamily: F.black, fontSize: 20, color: theme.colors.ink, padding: 0 },
  err: { fontFamily: F.semi, fontSize: 14, color: theme.colors.errorText, backgroundColor: theme.colors.errorBg, padding: 12, borderRadius: 14, overflow: 'hidden', marginTop: 12 },
});
