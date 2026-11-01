import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { theme, topInset } from '../theme';
import { F } from '../fonts';
import { Strings } from '../i18n/strings';
import { api } from '../api';
import { Merchant } from '../api/types';
import { PrimaryButton } from '../components/Buttons';

const parseId = (raw: string) => { try { const j = JSON.parse(raw); if (j.merchantId) return String(j.merchantId); } catch {} return raw.trim().toUpperCase(); };

export function ScanScreen({ t, online, onMerchant }: { t: Strings; online: boolean; onMerchant: (m: Merchant) => void }) {
  const [perm, askPerm] = useCameraPermissions();
  const [typing, setTyping] = useState(false);
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const locked = useRef(false);

  const lookup = async (raw: string) => {
    if (locked.current) return;
    locked.current = true; setErr('');
    const m = await api.lookupMerchant(parseId(raw));
    if (m) { onMerchant(m); locked.current = false; return; }
    setErr(t.notFound);
    setTimeout(() => { locked.current = false; }, 1500);
  };

  const cameraOn = !!perm?.granted && !typing;
  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {cameraOn && <CameraView style={StyleSheet.absoluteFill} facing="back" barcodeScannerSettings={{ barcodeTypes: ['qr'] }} onBarcodeScanned={({ data }) => lookup(data)} />}
      {cameraOn && <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(29,22,16,0.45)' }]} pointerEvents="none" />}

      <View style={[s.header, { paddingTop: topInset + 12 }]}>
        <Text style={s.title} accessibilityRole="header">{t.scanTitle}</Text>
        <View style={s.row}>
          <Text style={s.hint}>{t.scanHint}</Text>
          <View style={s.pill}><Text style={s.pillText}>{online ? t.onlineChip : t.offlineChip}</Text></View>
        </View>
      </View>

      <Svg style={s.frame} width="100%" height={300} viewBox="0 0 390 300" preserveAspectRatio="xMidYMin meet" pointerEvents="none">
        {['M75 40V16Q75 0 91 0H115', 'M275 0H299Q315 0 315 16V40', 'M315 200V224Q315 240 299 240H275', 'M115 240H91Q75 240 75 224V200'].map((d) => (
          <Path key={d} d={d} stroke={theme.colors.gold} strokeWidth={6} strokeLinecap="round" fill="none" />
        ))}
      </Svg>
      {!perm?.granted && !typing && (
        <View style={s.permBox}>
          <Text style={s.permText}>{t.cameraNeeded}</Text>
          <View style={{ height: 12 }} /><PrimaryButton label={t.allowCamera} onPress={askPerm} />
        </View>
      )}

      <View style={s.sheet}>
        <View style={s.handle} />
        <Text style={s.sheetTitle}>{t.noCameraTitle}</Text>
        <Text style={s.sheetSub}>{t.typeCodeSub}</Text>
        {typing ? (
          <View style={{ gap: 12, marginTop: 4 }}>
            <TextInput value={code} onChangeText={setCode} placeholder={t.codePlaceholder} autoCapitalize="characters" autoCorrect={false}
              placeholderTextColor={theme.colors.muted} style={s.input} accessibilityLabel={t.typeShopCode} />
            <PrimaryButton label={t.findShop} onPress={() => lookup(code)} disabled={!code.trim()} />
          </View>
        ) : (
          <View style={{ marginTop: 4 }}><PrimaryButton label={t.typeShopCode} onPress={() => { setTyping(true); setErr(''); }} /></View>
        )}
        {!!err && <Text style={s.err} accessibilityLiveRegion="polite">{err}</Text>}
        {typing && <Pressable onPress={() => { setTyping(false); setErr(''); }} style={s.link}><Text style={s.linkText}>{t.scanHint}</Text></Pressable>}
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.dark },
  header: { paddingHorizontal: 24 },
  title: { fontFamily: F.black, fontSize: 26, color: '#FFFFFF' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 },
  hint: { fontFamily: F.body, fontSize: 15, color: theme.colors.cameraHint, flex: 1 },
  pill: { height: 30, paddingHorizontal: 22, borderRadius: 15, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  pillText: { fontFamily: F.black, fontSize: 13, color: theme.colors.okText },
  frame: { position: 'absolute', top: topInset + 140, left: 0, right: 0 },
  permBox: { position: 'absolute', top: topInset + 200, left: 48, right: 48 },
  permText: { fontFamily: F.body, fontSize: 15, color: theme.colors.cameraHint, textAlign: 'center' },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: theme.colors.bg, borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 40 },
  handle: { alignSelf: 'center', width: 36, height: 4, borderRadius: 2, backgroundColor: theme.colors.sheetHandle, marginBottom: 22 },
  sheetTitle: { fontFamily: F.black, fontSize: 20, color: theme.colors.ink },
  sheetSub: { fontFamily: F.body, fontSize: 15, color: theme.colors.muted, marginTop: 6, marginBottom: 16 },
  input: { minHeight: 56, borderRadius: 18, borderWidth: 2, borderColor: theme.colors.line, backgroundColor: '#FFFFFF', paddingHorizontal: 16, fontFamily: F.bold, fontSize: 20, color: theme.colors.ink },
  err: { fontFamily: F.semi, fontSize: 14, color: theme.colors.errorText, backgroundColor: theme.colors.errorBg, padding: 12, borderRadius: 14, overflow: 'hidden', marginTop: 12 },
  link: { minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  linkText: { fontFamily: F.bold, fontSize: 16, color: theme.colors.primary },
});
