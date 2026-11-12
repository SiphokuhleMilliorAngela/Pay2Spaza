import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { theme, topInset } from '../theme';
import { F } from '../fonts';
import { Strings } from '../i18n/strings';
import { PrimaryButton } from '../components/Buttons';

export const MONO = Platform.select({ ios: 'Menlo', default: 'monospace' }) as string;

// Small dark "phone screen" card used by the feature-phone page and the simulator.
export function Lcd({ label, lines }: { label: string; lines: string[] }) {
  return (
    <View style={s.lcd} accessible accessibilityLabel={`${label}. ${lines.join('. ')}`}>
      <Text style={s.lcdLabel}>{label}</Text>
      {lines.map((l, i) => <Text key={i} style={s.lcdLine}>{l}</Text>)}
    </View>
  );
}

// "Feature phone" page: what someone without a smartphone sees when they dial the USSD code.
export function UssdScreen({ t, onBack, onTry }: { t: Strings; onBack: () => void; onTry: () => void }) {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.bg }} contentContainerStyle={[s.content, { paddingTop: topInset + 12 }]}>
      <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel={t.back} style={s.back}>
        <Svg pointerEvents="none" width={24} height={24} viewBox="0 0 24 24"><Path d="M15 5 l-7 7 l7 7" stroke={theme.colors.ink} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" /></Svg>
      </Pressable>
      <Text style={s.title} accessibilityRole="header">{t.ussdTitle}</Text>
      <Text style={s.sub}>{t.ussdSub}</Text>

      <Lcd label={t.ussdMenuLabel} lines={['Pay2Spaza', '1. Pay a shop', '2. Check a payment', '3. My payments', '4. Help']} />
      <Lcd label={t.ussdConfirmLabel} lines={['Pay Thuba’s Spaza', 'R50.00', 'Enter your PIN:']} />
      <Lcd label={t.ussdSmsLabel} lines={['Sharp! R50.00 sent', 'to Thuba. Ref P2S-82931']} />

      <Text style={s.foot}>{t.ussdFootnote}</Text>
      <View style={{ flex: 1, minHeight: 8 }} />
      <PrimaryButton label={t.ussdTry} onPress={onTry} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  content: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 24, gap: 16 },
  back: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: F.black, fontSize: 26, color: theme.colors.ink, marginTop: 4 },
  sub: { fontFamily: F.body, fontSize: 15, color: theme.colors.muted, marginTop: -8 },
  lcd: { backgroundColor: theme.colors.dark, borderRadius: 24, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 22 },
  lcdLabel: { fontFamily: F.black, fontSize: 11, letterSpacing: 0.9, color: '#C9B998', marginBottom: 12 },
  lcdLine: { fontFamily: MONO, fontSize: 16, lineHeight: 26, color: theme.colors.gold },
  foot: { fontFamily: F.body, fontSize: 14, color: theme.colors.muted },
});
