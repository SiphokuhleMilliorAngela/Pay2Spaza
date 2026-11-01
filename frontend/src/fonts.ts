import { useFonts } from 'expo-font';
import { CaveatBrush_400Regular } from '@expo-google-fonts/caveat-brush';
import { Caveat_400Regular, Caveat_700Bold } from '@expo-google-fonts/caveat';
import { Nunito_500Medium, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';

// Font names used across the app. Figma: Caveat Brush (painted headings), Caveat (handwriting), Nunito (UI text).
export const F = {
  display: 'CaveatBrush_400Regular',
  note: 'Caveat_400Regular',
  noteBold: 'Caveat_700Bold',
  body: 'Nunito_500Medium',
  semi: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  black: 'Nunito_800ExtraBold',
} as const;

export function useAppFonts() {
  const [loaded] = useFonts({
    CaveatBrush_400Regular, Caveat_400Regular, Caveat_700Bold,
    Nunito_500Medium, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold,
  });
  return loaded;
}
