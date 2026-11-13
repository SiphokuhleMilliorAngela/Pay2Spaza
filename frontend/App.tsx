import { useEffect, useState } from 'react';
import { Modal, Pressable, StatusBar, StyleSheet, Switch, Text, View } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import { useAppFonts, F } from './src/fonts';
import { theme } from './src/theme';
import { strings } from './src/i18n/strings';
import { api } from './src/api';
import { Merchant } from './src/api/types';
import { Session, clearSession, loadSession, saveSession } from './src/auth/session';
import { syncPending } from './src/sync/sync';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { CustomerHomeScreen } from './src/screens/CustomerHomeScreen';
import { OwnerDashboardScreen } from './src/screens/OwnerDashboardScreen';
import { ScanScreen } from './src/screens/ScanScreen';
import { UssdScreen } from './src/screens/UssdScreen';
import { ConfirmScreen } from './src/screens/ConfirmScreen';
import { ResultScreen, ResultInfo } from './src/screens/ResultScreen';

type Step = 'welcome' | 'login' | 'customer' | 'scan' | 'confirm' | 'result' | 'owner' | 'ussd';
const DEMO_CUSTOMER: Session = { role: 'customer', phone: '+27821234567' };
const DEMO_OWNER: Session = { role: 'owner', phone: '+27821234567', merchantId: 'SPZ12345' };
const homeFor = (s: Session): Step => (s.role === 'owner' ? 'owner' : 'customer');

export default function App() {
  const fontsLoaded = useAppFonts();
  const net = useNetInfo();
  const [simOffline, setSimOffline] = useState(false); // demo switch: real offline is hard to stage
  const online = net.isConnected !== false && net.isInternetReachable !== false && !simOffline;
  const [language, setLanguage] = useState(0); // index into LANGUAGES
  const t = strings[language === 1 ? 'zu' : 'en'];
  const [session, setSession] = useState<Session | null>(null);
  const [booting, setBooting] = useState(true);
  const [step, setStep] = useState<Step>('welcome');
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [result, setResult] = useState<ResultInfo | null>(null);
  const [shop, setShop] = useState<Merchant | null>(null);
  const [tick, setTick] = useState(0);
  const [tools, setTools] = useState(false);

  // Restore a saved login so the user lands on their dashboard.
  useEffect(() => {
    loadSession().then(s => { if (s) { setSession(s); setStep(homeFor(s)); } }).finally(() => setBooting(false));
  }, []);

  // Shop owners: load their shop (retries when the connection comes back).
  useEffect(() => {
    if (session?.role === 'owner' && session.merchantId) api.lookupMerchant(session.merchantId).then(setShop);
    else setShop(null);
  }, [session, online]);

  useEffect(() => { if (online) syncPending(true).then(() => setTick(x => x + 1)).catch(() => {}); }, [online]);

  if (!fontsLoaded || booting) return <View style={{ flex: 1, backgroundColor: theme.colors.bg }} />;

  const goHome = () => { setMerchant(null); setResult(null); setTick(x => x + 1); setStep(session ? homeFor(session) : 'login'); };
  const signOut = async () => { await clearSession(); setSession(null); setShop(null); setMerchant(null); setResult(null); setStep('login'); };
  const loggedIn = async (s: Session) => { await saveSession(s); setSession(s); setStep(homeFor(s)); };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <StatusBar barStyle={step === 'scan' ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />
      {step === 'welcome' && <WelcomeScreen t={t} language={language} onLanguage={setLanguage} onContinue={() => setStep(session ? homeFor(session) : 'login')} />}
      {step === 'login' && <LoginScreen t={t} onDone={loggedIn} onBack={() => setStep('welcome')} />}
      {step === 'customer' && session && <CustomerHomeScreen t={t} session={session} online={online} refreshKey={tick} onPay={() => setStep('scan')} onUssd={() => setStep('ussd')} onSignOut={signOut} />}
      {step === 'ussd' && <UssdScreen t={t} online={online} onClose={goHome} />}
      {step === 'scan' && <ScanScreen t={t} online={online} onBack={goHome} onMerchant={m => { setMerchant(m); setStep('confirm'); }} />}
      {step === 'confirm' && merchant && <ConfirmScreen t={t} merchant={merchant} online={online} onBack={() => { setMerchant(null); setStep('scan'); }} onDone={r => { setResult(r); setStep('result'); }} />}
      {step === 'result' && result && <ResultScreen t={t} r={result} onDone={goHome} />}
      {step === 'owner' && <OwnerDashboardScreen t={t} merchant={shop} online={online} refreshKey={tick} onSignOut={signOut} />}

      {__DEV__ && (
        <>
          <Pressable onPress={() => setTools(true)} accessibilityLabel="Demo tools" style={s.fab}><Text style={s.fabText}>···</Text></Pressable>
          <Modal visible={tools} transparent animationType="slide" onRequestClose={() => setTools(false)}>
            <Pressable style={s.backdrop} onPress={() => setTools(false)}>
              <View style={s.panel}>
                <Text style={s.panelTitle}>Demo tools</Text>
                <View style={s.panelRow}><Text style={s.panelText}>{t.demoOffline}</Text><Switch value={simOffline} onValueChange={setSimOffline} /></View>
                {([['Welcome', 'welcome'], ['Sign in', 'login'], ['Customer home', 'customer'], ['Scan to pay', 'scan'], ['USSD pay', 'ussd'], ['Shop owner dashboard', 'owner']] as const).map(([label, k]) => (
                  <Pressable key={k} style={s.panelBtn} onPress={() => {
                    if (k === 'customer' && session?.role !== 'customer') setSession(DEMO_CUSTOMER); // demo only, not saved
                    if (k === 'owner' && session?.role !== 'owner') setSession(DEMO_OWNER);
                    setStep(k); setTools(false);
                  }}><Text style={s.panelBtnText}>{label}</Text></Pressable>
                ))}
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
