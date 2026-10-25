import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { theme } from '../theme';
import { Strings } from '../i18n/strings';
import { api } from '../api';
import { Merchant } from '../api/types';
import { PrimaryButton } from '../components/PrimaryButton';

const parseId = (raw: string) => { try { const j = JSON.parse(raw); if (j.merchantId) return String(j.merchantId); } catch {} return raw.trim().toUpperCase(); };

export function ScanScreen({ t, onMerchant }: { t: Strings; onMerchant: (m: Merchant) => void }) {
  const [perm, askPerm] = useCameraPermissions();
  const [typing, setTyping] = useState(false);
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const locked = useRef(false);

  const lookup = async (raw: string) => {
    if (locked.current) return;
    locked.current = true; setErr('');
    const m = await api.lookupMerchant(parseId(raw));
    if (m) { onMerchant(m); } else { setErr(t.notFound); setTimeout(() => { locked.current = false; }, 1500); return; }
    locked.current = false;
  };

  return (
    <View style={s.wrap}>
      <Text style={s.title}>{t.scanTitle}</Text>
      {!typing && (
        <View style={s.cam}>
          {perm?.granted ? (
            <CameraView style={StyleSheet.absoluteFill} barcodeScannerSettings={{ barcodeTypes: ['qr'] }} onBarcodeScanned={({ data }) => lookup(data)} />
          ) : (
            <View style={s.camOff}><Text style={s.hint}>{t.cameraNeeded}</Text><View style={{ height: 12 }} /><PrimaryButton label={t.allowCamera} onPress={askPerm} /></View>
          )}
          <View style={s.frame} pointerEvents="none" />
        </View>
      )}
      {!typing && <Text style={s.hint}>{t.scanHint}</Text>}
      {typing && (
        <View style={{ gap: 12 }}>
          <TextInput value={code} onChangeText={setCode} placeholder={t.codePlaceholder} autoCapitalize="characters" autoCorrect={false}
            placeholderTextColor={theme.colors.muted} style={s.input} accessibilityLabel={t.typeCode} />
          <PrimaryButton label={t.findShop} onPress={() => lookup(code)} disabled={!code.trim()} />
        </View>
      )}
      {!!err && <Text style={s.err} accessibilityLiveRegion="polite">{err}</Text>}
      <Pressable onPress={() => { setTyping(v => !v); setErr(''); }} style={s.link} accessibilityRole="button">
        <Text style={s.linkText}>{typing ? t.scanHint : t.typeCode}</Text>
      </Pressable>
    </View>
  );
}
const s = StyleSheet.create({
  wrap: { flex: 1, padding: theme.space.lg, gap: 16 },
  title: { fontSize: theme.font.title, fontWeight: '800', color: theme.colors.ink },
  cam: { flex: 1, borderRadius: theme.radius.card, overflow: 'hidden', backgroundColor: '#1D1610', alignItems: 'center', justifyContent: 'center' },
  camOff: { padding: 24, alignItems: 'stretch', width: '100%' },
  frame: { position: 'absolute', width: 230, height: 230, borderWidth: 4, borderColor: theme.colors.accent, borderRadius: 28 },
  hint: { fontSize: theme.font.body, color: theme.colors.muted, textAlign: 'center' },
  input: { minHeight: 56, borderRadius: 18, borderWidth: 2, borderColor: theme.colors.line, backgroundColor: theme.colors.surface, paddingHorizontal: 16, fontSize: 20, color: theme.colors.ink },
  err: { color: theme.colors.errorText, backgroundColor: theme.colors.errorBg, padding: 12, borderRadius: 14, fontSize: theme.font.small },
  link: { minHeight: theme.touchMin, alignItems: 'center', justifyContent: 'center' },
  linkText: { color: theme.colors.primary, fontSize: theme.font.body, fontWeight: '700' },
});
