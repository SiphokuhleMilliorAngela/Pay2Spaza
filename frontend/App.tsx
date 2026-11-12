import { useEffect, useState } from 'react';
import { Modal, Pressable, StatusBar, StyleSheet, Switch, Text, View } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import { useAppFonts } from './src/fonts';
import { theme } from './src/theme';
import { strings } from './src/i18n/strings';
import { api } from './src/api';
import { Merchant, OtpChallenge } from './src/api/types';
import { REQUIRE_OTP } from './src/config';
import { clearVerifiedPhone, getVerifiedPhone } from './src/services/auth';
import { syncPending } from './src/sync/sync';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { PhoneScreen } from './src/screens/PhoneScreen';
import { OtpScreen } from './src/screens/OtpScreen';
import { ScanScreen } from './src/screens/ScanScreen';
import { ConfirmScreen } from './src/screens/ConfirmScreen';
import { ResultScreen, ResultInfo } from './src/screens/ResultScreen';
import { UssdScreen } from './src/screens/UssdScreen';
import { UssdSimulatorScreen } from './src/screens/UssdSimulatorScreen';
import { MerchantHomeScreen } from './src/screens/MerchantHomeScreen';
import { F } from './src/fonts';

type Step = 'welcome' | 'phone' | 'otp' | 'scan' | 'confirm' | 'result' | 'shop' | 'ussd' | 'ussdTry';

export default function App() {
  const fontsLoaded = useAppFonts();
  const net = useNetInfo();
  const [simOffline, setSimOffline] = useState(false); // demo switch: real offline is hard to stage
  const online = net.isConnected !== false && !simOffline;
  const [language, setLanguage] = useState(0); // index into LANGUAGES
  const t = strings[language === 1 ? 'zu' : 'en'];
  const [step, setStep] = useState<Step>('welcome');
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [result, setResult] = useState<ResultInfo | null>(null);
  const [shop, setShop] = useState<Merchant | null>(null);
  const [tick, setTick] = useState(0);
  const [tools, setTools] = useState(false);
  const [verifiedPhone, setVerifiedPhoneState] = useState<string | null>(null); // number that passed the SMS code check
  const [pending, setPending] = useState<{ identifier: string; challenge: OtpChallenge } | null>(null);

  useEffect(() => { api.lookupMerchant('SPZ12345').then(setShop); }, []);
  useEffect(() => { getVerifiedPhone().then(setVerifiedPhoneState); }, []);
  useEffect(() => { if (online) syncPending(true).then(() => setTick(x => x + 1)).catch(() => {}); }, [online]);

  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: theme.colors.bg }} />;
  const reset = () => { setStep('scan'); setMerchant(null); setResult(null); setTick(x => x + 1); };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle={step === 'scan' ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />
      {step === 'welcome' && <WelcomeScreen t={t} language={language} onLanguage={setLanguage} onContinue={() => setStep(!REQUIRE_OTP || verifiedPhone ? 'scan' : 'phone')} />}
      {step === 'phone' && <PhoneScreen t={t} online={online} onBack={() => setStep('welcome')} onSent={(identifier, challenge) => { setPending({ identifier, challenge }); setStep('otp'); }} />}
      {step === 'otp' && pending && <OtpScreen t={t} online={online} identifier={pending.identifier} challenge={pending.challenge} onBack={() => setStep('phone')}
        onChallenge={c => setPending({ identifier: pending.identifier, challenge: c })} onVerified={() => { setVerifiedPhoneState(pending.identifier); setStep('scan'); }} />}
      {step === 'scan' && <ScanScreen t={t} online={online} onMerchant={m => { setMerchant(m); setStep('confirm'); }} />}
      {step === 'confirm' && merchant && <ConfirmScreen t={t} merchant={merchant} online={online} onBack={reset} onDone={r => { setResult(r); setStep('result'); }} />}
      {step === 'result' && result && <ResultScreen t={t} r={result} onDone={reset} />}
      {step === 'ussd' && <UssdScreen t={t} onBack={() => setStep('scan')} onTry={() => setStep('ussdTry')} />}
      {step === 'ussdTry' && <UssdSimulatorScreen t={t} onBack={() => setStep('ussd')} />}
      {step === 'shop' && <MerchantHomeScreen t={t} merchant={shop} refreshKey={tick} />}

      {__DEV__ && (
        <>
          <Pressable onPress={() => setTools(true)} accessibilityLabel="Demo tools" style={s.fab}><Text style={s.fabText}>···</Text></Pressable>
          <Modal visible={tools} transparent animationType="slide" onRequestClose={() => setTools(false)}>
            <Pressable style={s.backdrop} onPress={() => setTools(false)}>
              <View style={s.panel}>
                <Text style={s.panelTitle}>Demo tools</Text>
                <View style={s.panelRow}><Text style={s.panelText}>{t.demoOffline}</Text><Switch value={simOffline} onValueChange={setSimOffline} /></View>
                {([['Welcome', 'welcome'], ['Phone number (SMS code)', 'phone'], ['Scan to pay', 'scan'], ['Shop owner home', 'shop'], ['Feature phone (USSD)', 'ussd']] as const).map(([label, k]) => (
                  <Pressable key={k} style={s.panelBtn} onPress={() => { setStep(k); setTools(false); }}><Text style={s.panelBtnText}>{label}</Text></Pressable>
                ))}
                <Pressable style={s.panelBtn} onPress={() => { clearVerifiedPhone(); setVerifiedPhoneState(null); setTools(false); }}><Text style={s.panelBtnText}>Forget verified phone</Text></Pressable>
              </View>
            </Pressable>
          </Modal>
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  fab: { position: 'absolute', right: 12, bottom: 12, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(43,33,24,0.7)', alignItems: 'center', justifyContent: 'center' },
  fabText: { color: '#FFFFFF', fontSize: 18, fontFamily: F.black },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  panel: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 12 },
  panelTitle: { fontFamily: F.black, fontSize: 18, color: theme.colors.ink },
  panelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  panelText: { fontFamily: F.semi, fontSize: 15, color: theme.colors.ink },
  panelBtn: { minHeight: 48, borderRadius: 14, backgroundColor: theme.colors.bg, alignItems: 'center', justifyContent: 'center' },
  panelBtnText: { fontFamily: F.bold, fontSize: 15, color: theme.colors.ink },
});
