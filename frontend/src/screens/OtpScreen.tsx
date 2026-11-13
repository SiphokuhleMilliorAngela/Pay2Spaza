import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { theme, topInset } from '../theme';
import { F } from '../fonts';
import { Strings } from '../i18n/strings';
import { api } from '../api';
import { OtpChallenge, OTP_ERRORS } from '../api/types';
import { OTP_LENGTH, OTP_RESEND_SECONDS } from '../config';
import { PrimaryButton } from '../components/Buttons';
import { setVerifiedPhone } from '../services/auth';
import { formatCountdown, formatPhone } from '../services/phone';

// Step 2 of 2: type the 6-digit code from the SMS. Submits by itself when all 6 digits are in.
export function OtpScreen(p: {
  t: Strings; identifier: string; challenge: OtpChallenge; online: boolean;
  onChallenge: (c: OtpChallenge) => void; onVerified: () => void; onBack: () => void;
}) {
  const { t, identifier, challenge } = p;
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [locked, setLocked] = useState(false);   // wrong too many times, or the server said it expired
  const [now, setNow] = useState(Date.now());
  const [resendAt, setResendAt] = useState(Date.now() + OTP_RESEND_SECONDS * 1000);
  const input = useRef<TextInput>(null);
  const submitting = useRef(false);

  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);

  const secondsLeft = Math.max(0, Math.ceil((new Date(challenge.expiresAt).getTime() - now) / 1000));
  const expired = secondsLeft === 0;
  const resendIn = Math.max(0, Math.ceil((resendAt - now) / 1000));
  const disabled = locked || expired;

  const submit = async (value: string) => {
    if (submitting.current) return;
    if (!p.online) { setErr(t.otpNeedsSignal); return; }
    submitting.current = true; setBusy(true); setErr('');
    const res = await api.confirmOtp(identifier, value);
    if (res.ok && res.data.verified) {
      await setVerifiedPhone(identifier);
      p.onVerified();
      return;
    }
    const reason = res.ok ? '' : res.error;
    if (reason === 'network') setErr(t.otpNetwork);
    else if (reason === OTP_ERRORS.wrong) setErr(t.otpWrong);
    else if (reason === OTP_ERRORS.expired) { setErr(t.otpExpiredMsg); setLocked(true); }
    else if (reason === OTP_ERRORS.tooMany) { setErr(t.otpTooMany); setLocked(true); }
    else setErr(t.otpVerifyFailed);
    setCode(''); setBusy(false); submitting.current = false;
    input.current?.focus();
  };

  const onChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, OTP_LENGTH);
    setCode(digits);
    if (err) setErr('');
    if (digits.length === OTP_LENGTH) submit(digits);
  };

  const resend = async () => {
    if (resendIn > 0 || busy) return;
    if (!p.online) { setErr(t.otpNeedsSignal); return; }
    setBusy(true); setErr('');
    const res = await api.requestOtp(identifier);
    setBusy(false);
    if (res.ok) {
      p.onChallenge(res.data); setCode(''); setLocked(false);
      setResendAt(Date.now() + OTP_RESEND_SECONDS * 1000); setNow(Date.now());
      input.current?.focus();
    } else setErr(res.network ? t.otpNetwork : t.otpSendFailed);
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
          <Text style={s.title} accessibilityRole="header">{t.otpTitle}</Text>
          <Text style={s.sub}>{t.otpSent(formatPhone(identifier))}</Text>
          <Pressable onPress={p.onBack} accessibilityRole="button" style={s.linkWrap}><Text style={s.link}>{t.otpWrongNumber}</Text></Pressable>

          <View style={s.boxes}>
            {Array.from({ length: OTP_LENGTH }).map((_, i) => {
              const active = !disabled && i === Math.min(code.length, OTP_LENGTH - 1);
              return (
                <View key={i} style={[s.box, active && s.boxActive, !!err && s.boxErr]}>
                  <Text style={s.boxText}>{code[i] ?? ''}</Text>
                </View>
              );
            })}
            {/* One invisible input sits on top of the boxes, so tapping anywhere on them opens the keypad. */}
            <TextInput ref={input} value={code} onChangeText={onChange} editable={!disabled && !busy} autoFocus caretHidden
              keyboardType="number-pad" maxLength={OTP_LENGTH} textContentType="oneTimeCode" autoComplete="sms-otp"
              accessibilityLabel={t.otpTitle} style={s.hidden} />
          </View>

          {!!err && <Text style={s.err} accessibilityLiveRegion="polite">{err}</Text>}
          <Text style={[s.timer, expired && { color: theme.colors.errorText }]} accessibilityLiveRegion="polite">
            {expired ? t.otpExpired : t.otpExpiresIn(formatCountdown(secondsLeft))}
          </Text>

          {__DEV__ && !!challenge.otp && (
            <View style={s.dev}>
              <Text style={s.devText}>{t.devCode(challenge.otp)}</Text>
              <Pressable onPress={() => onChange(challenge.otp as string)} accessibilityRole="button"><Text style={s.devBtn}>{t.devFill}</Text></Pressable>
            </View>
          )}
        </View>

        <Pressable onPress={resend} disabled={resendIn > 0 || busy} accessibilityRole="button" accessibilityState={{ disabled: resendIn > 0 || busy }} style={s.resend}>
          <Text style={[s.resendText, (resendIn > 0 || busy) && { color: theme.colors.muted }]}>{resendIn > 0 ? t.otpResendIn(resendIn) : t.otpResend}</Text>
        </Pressable>

        <View style={{ flex: 1, minHeight: 16 }} />
        <PrimaryButton label={busy ? t.verifying : t.verify} onPress={() => submit(code)} disabled={busy || disabled || code.length < OTP_LENGTH} />
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
  title: { fontFamily: F.black, fontSize: 26, color: theme.colors.ink },
  sub: { fontFamily: F.body, fontSize: 16, color: theme.colors.muted, marginTop: 6 },
  linkWrap: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },
  link: { fontFamily: F.bold, fontSize: 15, color: theme.colors.primary },
  boxes: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  box: { width: 44, height: 56, borderRadius: 14, borderWidth: 2, borderColor: theme.colors.line, backgroundColor: theme.colors.bg, alignItems: 'center', justifyContent: 'center' },
  boxActive: { borderColor: theme.colors.primary },
  boxErr: { borderColor: theme.colors.danger },
  boxText: { fontFamily: F.black, fontSize: 26, color: theme.colors.ink },
  hidden: { ...StyleSheet.absoluteFillObject, color: 'transparent', backgroundColor: 'transparent', fontSize: 1 },
  err: { fontFamily: F.semi, fontSize: 14, color: theme.colors.errorText, backgroundColor: theme.colors.errorBg, padding: 12, borderRadius: 14, overflow: 'hidden', marginTop: 16 },
  timer: { fontFamily: F.semi, fontSize: 14, color: theme.colors.muted, marginTop: 16 },
  dev: { marginTop: 16, padding: 12, borderRadius: 14, backgroundColor: theme.colors.pendingBg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  devText: { flex: 1, fontFamily: F.bold, fontSize: 13, color: theme.colors.pendingText },
  devBtn: { fontFamily: F.black, fontSize: 13, color: theme.colors.pendingText, textDecorationLine: 'underline' },
  resend: { minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  resendText: { fontFamily: F.bold, fontSize: 16, color: theme.colors.primary },
});
