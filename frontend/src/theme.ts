import { Platform, StatusBar } from 'react-native';

// Colours read from the Figma frames. The welcome frame uses the hand-drawn palette (hand),
// the other five use the main palette (colors). Unify them in Figma if you want one palette.
export const theme = {
  colors: {
    bg: '#FFF8EC', surface: '#FFFFFF', ink: '#2B2118', muted: '#6B5B4B',
    primary: '#0F5C5C', gold: '#F5B83D', line: '#EADFCB', dark: '#1D1610',
    okBg: '#D6EFE6', okText: '#0B4A44',
    pendingBg: '#FDEBC0', pendingText: '#6B4200',
    errorBg: '#F8DDD6', errorText: '#8A2E1A', danger: '#9A3A22',
    sheetHandle: '#EADFCB', cameraHint: '#E9DCC6',
  },
  hand: {
    bg: '#F7ECD4', ink: '#2B2118', muted: '#5E4B3A', mustard: '#F2B01E', teal: '#17695F', brick: '#B8432F',
  },
  radius: { card: 28, button: 29, chip: 99 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 28,
    shadowColor: '#2B2118', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 2,
  },
} as const;

export type StatusKind = 'pending' | 'success' | 'error';
export const statusStyle = (k: StatusKind) =>
  k === 'pending' ? { bg: theme.colors.pendingBg, fg: theme.colors.pendingText }
  : k === 'success' ? { bg: theme.colors.okBg, fg: theme.colors.okText }
  : { bg: theme.colors.errorBg, fg: theme.colors.errorText };

// Space above content so it clears the phone's status bar.
export const topInset = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44;
