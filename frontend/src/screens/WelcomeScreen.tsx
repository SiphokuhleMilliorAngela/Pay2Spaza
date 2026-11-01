import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { theme, topInset } from '../theme';
import { F } from '../fonts';
import { LANGUAGES, Strings } from '../i18n/strings';
import { ShopIllustration } from '../art/ShopIllustration';
import { RoughShape } from '../components/RoughShape';
import { BTN_PATH, BTN_VB, TAG_PATHS, TAG_VB, WAVE_PATH, WAVE_VB } from '../art/roughPaths';

const H = theme.hand;

export function WelcomeScreen({ t, language, onLanguage, onContinue }: {
  t: Strings; language: number; onLanguage: (i: number) => void; onContinue: () => void;
}) {
  const { width } = useWindowDimensions();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: H.bg }} contentContainerStyle={s.content} bounces={false}>
      <Svg width={width} height={(width * 280) / 390} viewBox="0 0 390 280" style={{ marginTop: topInset - 20 }}
        accessibilityLabel="Drawing of a spaza shop">
        <ShopIllustration />
      </Svg>
      <View style={s.pad}>
        <Text style={s.title} accessibilityRole="header">{t.welcomeTitle}</Text>
        <Svg width={224} height={16} viewBox={`0 0 ${WAVE_VB[0]} ${WAVE_VB[1]}`} style={{ marginTop: -10 }}>
          <Path d={WAVE_PATH} stroke={H.brick} strokeWidth={5} strokeLinecap="round" fill="none" />
        </Svg>
        <Text style={s.hello}>{t.welcomeHello}</Text>
        <Text style={s.line}>{t.welcomeLine1}</Text>
        <Text style={s.line}>{t.welcomeLine2}</Text>
        <Text style={s.label}>{t.pickLanguage}</Text>
        <View style={s.grid} accessibilityRole="radiogroup">
          {LANGUAGES.map((l, i) => {
            const sel = i === language;
            return (
              <Pressable key={l} onPress={() => onLanguage(i)} accessibilityRole="radio" accessibilityState={{ selected: sel }}
                style={{ width: '48.4%', transform: [{ rotate: i % 2 === 0 ? '-0.8deg' : '0.8deg' }] }}>
                <RoughShape path={TAG_PATHS[i]} vb={TAG_VB} fill="#FFFFFF" stroke={sel ? H.teal : H.ink} strokeWidth={sel ? 3.5 : 3} style={s.tag}>
                  <Text style={[s.tagText, { color: sel ? H.teal : H.ink }]}>{l}</Text>
                  {sel && (
                    <Svg width={24} height={24} viewBox="0 0 24 24" style={s.tick}>
                      <Circle cx={12} cy={12} r={11} fill={H.teal} />
                      <Path d="M6.5 12.5 l4 4 l8 -9" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </Svg>
                  )}
                </RoughShape>
              </Pressable>
            );
          })}
        </View>
        <Pressable accessibilityRole="button" onPress={onContinue} style={{ marginTop: 22, transform: [{ rotate: '-0.8deg' }] }}>
          <RoughShape path={BTN_PATH} vb={BTN_VB} fill={H.mustard} stroke={H.ink} style={s.button}>
            <Text style={s.buttonText}>{t.letsGo}</Text>
          </RoughShape>
        </Pressable>
        <Text style={s.footer}>{t.worksWithoutData}</Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  content: { paddingBottom: 28 },
  pad: { paddingHorizontal: 24 },
  title: { fontFamily: F.display, fontSize: 72, lineHeight: 84, color: H.ink },
  hello: { fontFamily: F.noteBold, fontSize: 34, lineHeight: 40, color: H.muted, marginTop: 4 },
  line: { fontFamily: F.note, fontSize: 30, lineHeight: 30, color: H.muted },
  label: { fontFamily: F.bold, fontSize: 14, color: H.muted, marginTop: 22, marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10 },
  tag: { height: 50, alignItems: 'center', justifyContent: 'center' },
  tagText: { fontFamily: F.bold, fontSize: 17 },
  tick: { position: 'absolute', right: 12, top: 13 },
  button: { height: 64, alignItems: 'center', justifyContent: 'center' },
  buttonText: { fontFamily: F.display, fontSize: 36, color: H.ink },
  footer: { fontFamily: F.noteBold, fontSize: 18, color: H.muted, textAlign: 'center', marginTop: 12 },
});
