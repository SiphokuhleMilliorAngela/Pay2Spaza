import { useEffect, useState } from 'react';
import { Modal, Pressable, StatusBar, StyleSheet, Switch, Text, View } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import { useAppFonts } from './src/fonts';
import { theme } from './src/theme';
import { strings } from './src/i18n/strings';
import { api } from './src/api';
import { Merchant } from './src/api/types';
import { syncPending } from './src/sync/sync';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { ScanScreen } from './src/screens/ScanScreen';
import { ConfirmScreen } from './src/screens/ConfirmScreen';
import { ResultScreen, ResultInfo } from './src/screens/ResultScreen';
import { MerchantHomeScreen } from './src/screens/MerchantHomeScreen';
import { F } from './src/fonts';

type Step = 'welcome' | 'scan' | 'confirm' | 'result' | 'shop';

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

  useEffect(() => { api.lookupMerchant('SPZ12345').then(setShop); }, []);
  useEffect(() => { if (online) syncPending(true).then(() => setTick(x => x + 1)).catch(() => {}); }, [online]);

  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: theme.colors.bg }} />;
  const reset = () => { setStep('scan'); setMerchant(null); setResult(null); setTick(x => x + 1); };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle={step === 'scan' ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />
      {step === 'welcome' && <WelcomeScreen t={t} language={language} onLanguage={setLanguage} onContinue={() => setStep('scan')} />}
      {step === 'scan' && <ScanScreen t={t} online={online} onMerchant={m => { setMerchant(m); setStep('confirm'); }} />}
      {step === 'confirm' && merchant && <ConfirmScreen t={t} merchant={merchant} online={online} onBack={reset} onDone={r => { setResult(r); setStep('result'); }} />}
      {step === 'result' && result && <ResultScreen t={t} r={result} onDone={reset} />}
      {step === 'shop' && <MerchantHomeScreen t={t} merchant={shop} refreshKey={tick} />}

      {__DEV__ && (
        <>
          <Pressable onPress={() => setTools(true)} accessibilityLabel="Demo tools" style={s.fab}><Text style={s.fabText}>···</Text></Pressable>
          <Modal visible={tools} transparent animationType="slide" onRequestClose={() => setTools(false)}>
            <Pressable style={s.backdrop} onPress={() => setTools(false)}>
              <View style={s.panel}>
                <Text style={s.panelTitle}>Demo tools</Text>
                <View style={s.panelRow}><Text style={s.panelText}>{t.demoOffline}</Text><Switch value={simOffline} onValueChange={setSimOffline} /></View>
                {([['Welcome', 'welcome'], ['Scan to pay', 'scan'], ['Shop owner home', 'shop']] as const).map(([label, k]) => (
                  <Pressable key={k} style={s.panelBtn} onPress={() => { setStep(k); setTools(false); }}><Text style={s.panelBtnText}>{label}</Text></Pressable>
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
