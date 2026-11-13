import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { theme, topInset } from '../theme';
import { F } from '../fonts';
import { Strings } from '../i18n/strings';
import { A } from '../i18n/authStrings';
import { api, USE_MOCK } from '../api';
import { confirmOtp, requestOtp } from '../api/auth';
import { Role, Session } from '../auth/session';
import { RoughShape } from '../components/RoughShape';
import { BTN_PATH, BTN_VB, TAG_PATHS, TAG_VB, WAVE_PATH, WAVE_VB } from '../art/roughPaths';

const H = theme.hand;
type Stage = 'details' | 'code';

// 082 123 4567, 82 123 4567, 27821234567 and +27821234567 all become +27821234567.
const toE164 = (raw: string) => {
  const d = raw.replace(/[^\d+]/g, '');
  if (d.startsWith('+27')) return d;
  if (d.startsWith('27') && d.length === 11) return '+' + d;
  if (d.startsWith('0') && d.length === 10) return '+27' + d.slice(1);
  if (d.length === 9) return '+27' + d;
  return d;
};
const validPhone = (p: string) => /^\+27\d{9}$/.test(p);

export function LoginScreen({ t, onDone, onBack }: { t: Strings; onDone: (s: Session) => void; onBack: () => void }) {
  const [role, setRole] = useState<Role>('customer');
  const [phone, setPhone] = useState('');
  const [shopCode, setShopCode] = useState('');
  const [stage, setStage] = useState<Stage>('details');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [wait, setWait] = useState(0);

  const e164 = toE164(phone);
  const merchantId = role === 'owner' ? shopCode.trim().toUpperCase() : undefined;
  const msg = (e: string) => (e === 'network' ? A.codeFailed : e === 'failed' ? A.badCode : e);

  useEffect(() => {
    if (wait <= 0) return;
    const id = setTimeout(() => setWait(w => w - 1), 1000);
    return () => clearTimeout(id);
  }, [wait]);

  const send = async () => {
    if (busy) return;
    if (!validPhone(e164)) { setErr(A.badPhone); return; }
    setBusy(true); setErr('');
    if (role === 'owner') {
      const m = merchantId ? await api.lookupMerchant(merchantId) : null;
      if (!m) { setBusy(false); setErr(t.notFound); return; }
    }
    const r = await requestOtp({ phone: e164, role, merchantId });
    setBusy(false);
    if (!r.ok) { setErr(msg(r.error)); return; }
    setCode(''); setStage('code'); setWait(30);
  };

  const verify = async (value: string) => {
    if (busy || value.length !== 6) return;
    setBusy(true); setErr('');
    const r = await confirmOtp({ phone: e164, code: value, role, merchantId });
    if (r.ok) { onDone(r.session); return; } // the parent switches screens, so nothing else to do here
    setBusy(false); setCode(''); setErr(msg(r.error));
  };

  const onCode = (x: string) => {
    const v = x.replace(/\D/g, '').slice(0, 6);
    setCode(v);
    if (v.length === 6) verify(v);
  };

  const back = () => { setErr(''); if (stage === 'code') setStage('details'); else onBack(); };

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={[s.content, { paddingTop: topInset + 12 }]} keyboardShouldPersistTaps="handled">
        <Pressable onPress={back} accessibilityRole="button" accessibilityLabel="Back" style={s.back}>
          <Svg pointerEvents="none" width={24} height={24} viewBox="0 0 24 24"><Path d="M15 5 l-7 7 l7 7" stroke={H.ink} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" /></Svg>
        </Pressable>

        <Text style={s.title} accessibilityRole="header">{stage === 'details' ? A.loginTitle : A.codeTitle}</Text>
        <Svg pointerEvents="none" width={224} height={16} viewBox={`0 0 ${WAVE_VB[0]} ${WAVE_VB[1]}`} style={{ marginTop: -10 }}>
          <Path d={WAVE_PATH} stroke={H.brick} strokeWidth={5} strokeLinecap="round" fill="none" />
        </Svg>
        <Text style={s.sub}>{stage === 'details' ? A.loginSub : A.codeSent(e164)}</Text>

        {stage === 'details' ? (
          <>
            <View style={s.grid} accessibilityRole="radiogroup">
              {(['customer', 'owner'] as const).map((r, i) => {
                const sel = role === r;
                return (
                  <Pressable key={r} onPress={() => { setRole(r); setErr(''); }} accessibilityRole="radio" accessibilityState={{ selected: sel }}
                    style={{ width: '48.4%', transform: [{ rotate: i === 0 ? '-0.8deg' : '0.8deg' }] }}>
                    <RoughShape path={TAG_PATHS[i]} vb={TAG_VB} fill="#FFFFFF" stroke={sel ? H.teal : H.ink} strokeWidth={sel ? 3.5 : 3} style={s.tag}>
                      <Text style={[s.tagText, { color: sel ? H.teal : H.ink }]}>{r === 'customer' ? A.roleCustomer : A.roleOwner}</Text>
                    </RoughShape>
                  </Pressable>
                );
              })}
            </View>

            <Text style={s.label}>{A.phoneLabel}</Text>
            <TextInput value={phone} onChangeText={x => { setPhone(x); setErr(''); }} keyboardType="phone-pad" autoComplete="tel" textContentType="telephoneNumber"
              placeholder={A.phonePlaceholder} placeholderTextColor={H.muted} style={s.input} accessibilityLabel={A.phoneLabel} />

            {role === 'owner' && (
              <>
                <Text style={s.label}>{A.shopCodeLabel}</Text>
                <TextInput value={shopCode} onChangeText={x => { setShopCode(x); setErr(''); }} autoCapitalize="characters" autoCorrect={false}
                  placeholder={t.codePlaceholder} placeholderTextColor={H.muted} style={s.input} accessibilityLabel={A.shopCodeLabel} />
              </>
            )}

            {!!err && <Text style={s.err} accessibilityLiveRegion="polite">{err}</Text>}
            <InkButton label={busy ? '…' : A.sendCode} onPress={send} disabled={busy || !phone.trim()} />
          </>
        ) : (
          <>
            {USE_MOCK && <Text style={s.hint}>{A.demoCode}</Text>}
            <TextInput value={code} onChangeText={onCode} keyboardType="number-pad" maxLength={6} autoFocus textContentType="oneTimeCode" autoComplete="sms-otp"
              placeholder="······" placeholderTextColor={H.muted} style={[s.input, s.codeInput]} accessibilityLabel={A.codeLabel} editable={!busy} />
            {!!err && <Text style={s.err} accessibilityLiveRegion="polite">{err}</Text>}
            <InkButton label={busy ? '…' : A.verify} onPress={() => verify(code)} disabled={busy || code.length !== 6} />
            <Pressable onPress={send} disabled={wait > 0 || busy} accessibilityRole="button" style={s.link}>
              <Text style={[s.linkText, (wait > 0 || busy) && { opacity: 0.5 }]}>{wait > 0 ? A.resendIn(wait) : A.resendNow}</Text>
            </Pressable>
            <Pressable onPress={back} accessibilityRole="button" style={s.link}><Text style={s.linkText}>{A.changeNumber}</Text></Pressable>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function InkButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ disabled }} onPress={onPress} disabled={disabled}
      style={{ marginTop: 22, transform: [{ rotate: '-0.8deg' }], opacity: disabled ? 0.5 : 1 }}>
      <RoughShape path={BTN_PATH} vb={BTN_VB} fill={H.mustard} stroke={H.ink} style={s.button}>
        <Text style={s.buttonText}>{label}</Text>
      </RoughShape>
    </Pressable>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: H.bg },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 32 },
  back: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  title: { fontFamily: F.display, fontSize: 64, lineHeight: 76, color: H.ink },
  sub: { fontFamily: F.note, fontSize: 30, lineHeight: 32, color: H.muted, marginTop: 4 },
  grid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 },
  tag: { height: 50, alignItems: 'center', justifyContent: 'center' },
  tagText: { fontFamily: F.bold, fontSize: 17 },
  label: { fontFamily: F.bold, fontSize: 14, color: H.muted, marginTop: 22, marginBottom: 8 },
  input: { minHeight: 56, borderRadius: 18, borderWidth: 2, borderColor: theme.colors.line, backgroundColor: '#FFFFFF', paddingHorizontal: 16, fontFamily: F.bold, fontSize: 20, color: H.ink },
  codeInput: { marginTop: 24, textAlign: 'center', fontSize: 36, letterSpacing: 12, minHeight: 72 },
  hint: { fontFamily: F.bold, fontSize: 13, color: H.teal, marginTop: 14 },
  err: { fontFamily: F.semi, fontSize: 14, color: theme.colors.errorText, backgroundColor: theme.colors.errorBg, padding: 12, borderRadius: 14, overflow: 'hidden', marginTop: 14 },
  button: { height: 64, alignItems: 'center', justifyContent: 'center' },
  buttonText: { fontFamily: F.display, fontSize: 36, color: H.ink },
  link: { minHeight: 48, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  linkText: { fontFamily: F.bold, fontSize: 16, color: H.teal },
});
