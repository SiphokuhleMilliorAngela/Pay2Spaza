import { useEffect, useState } from 'react';
import { Pressable, SafeAreaView, StatusBar, StyleSheet, Switch, Text, View } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import { theme } from './src/theme';
import { strings } from './src/i18n/strings';
import { api } from './src/api';
import { Merchant } from './src/api/types';
import { syncPending } from './src/sync/sync';
import { ScanScreen } from './src/screens/ScanScreen';
import { ConfirmScreen } from './src/screens/ConfirmScreen';
import { ResultScreen, ResultInfo } from './src/screens/ResultScreen';
import { MerchantHomeScreen } from './src/screens/MerchantHomeScreen';

export default function App() {
  const net = useNetInfo();
  const [simOffline, setSimOffline] = useState(false); // demo switch, since real offline is hard to stage
  const online = net.isConnected !== false && !simOffline;
  const [lang, setLang] = useState<'en' | 'zu'>('en');
  const t = strings[lang];
  const [tab, setTab] = useState<'pay' | 'shop'>('pay');
  const [step, setStep] = useState<'scan' | 'confirm' | 'result'>('scan');
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [result, setResult] = useState<ResultInfo | null>(null);
  const [shop, setShop] = useState<Merchant | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => { api.lookupMerchant('SPZ12345').then(setShop); }, []);
  useEffect(() => { if (online) syncPending(true).then(() => setTick(x => x + 1)).catch(() => {}); }, [online]);

  const reset = () => { setStep('scan'); setMerchant(null); setResult(null); setTick(x => x + 1); };

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" />
      <View style={s.header}>
        <Text style={s.brand}>{t.appName}</Text>
        <View style={s.right}>
          <View style={[s.pill, online ? s.pillOn : s.pillOff]}><Text style={[s.pillText, { color: online ? theme.colors.successText : theme.colors.pendingText }]}>{online ? t.onlineChip : t.offlineChip}</Text></View>
          <Pressable onPress={() => setLang(l => (l === 'en' ? 'zu' : 'en'))} style={s.lang} accessibilityRole="button" accessibilityLabel="Language">
            <Text style={s.langText}>{lang === 'en' ? 'isiZulu' : 'English'}</Text>
          </Pressable>
        </View>
      </View>
      <View style={{ flex: 1 }}>
        {tab === 'pay' && step === 'scan' && <ScanScreen t={t} onMerchant={m => { setMerchant(m); setStep('confirm'); }} />}
        {tab === 'pay' && step === 'confirm' && merchant && <ConfirmScreen t={t} merchant={merchant} online={online} onCancel={reset} onDone={r => { setResult(r); setStep('result'); }} />}
        {tab === 'pay' && step === 'result' && result && <ResultScreen t={t} r={result} onDone={reset} />}
        {tab === 'shop' && <MerchantHomeScreen t={t} merchant={shop} refreshKey={tick} />}
      </View>
      <View style={s.demo}><Text style={s.demoText}>{t.demoOffline}</Text><Switch value={simOffline} onValueChange={setSimOffline} /></View>
      <View style={s.tabs}>
        {(['pay', 'shop'] as const).map(k => (
          <Pressable key={k} onPress={() => setTab(k)} style={[s.tab, tab === k && s.tabOn]} accessibilityRole="tab" accessibilityState={{ selected: tab === k }}>
            <Text style={[s.tabText, tab === k && s.tabTextOn]}>{k === 'pay' ? t.tabPay : t.tabShop}</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 12 },
  brand: { fontSize: 20, fontWeight: '800', color: theme.colors.primary },
  right: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99 },
  pillOn: { backgroundColor: theme.colors.successBg }, pillOff: { backgroundColor: theme.colors.pendingBg },
  pillText: { fontSize: 13, fontWeight: '800' },
  lang: { minHeight: 36, paddingHorizontal: 12, justifyContent: 'center', borderRadius: 18, borderWidth: 2, borderColor: theme.colors.line },
  langText: { fontSize: 13, fontWeight: '800', color: theme.colors.ink },
  demo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 6 },
  demoText: { fontSize: 13, color: theme.colors.muted },
  tabs: { flexDirection: 'row', backgroundColor: theme.colors.surface, padding: 8, gap: 8 },
  tab: { flex: 1, minHeight: theme.touchMin, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  tabOn: { backgroundColor: theme.colors.primary },
  tabText: { fontSize: 16, fontWeight: '800', color: theme.colors.muted }, tabTextOn: { color: '#fff' },
});
