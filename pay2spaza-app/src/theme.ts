// Human palette: painted-shopfront colours. Change values here to restyle the whole app.
export const theme = {
  colors: {
    bg: '#FFF8EC', surface: '#FFFFFF', ink: '#2B2118', muted: '#6B5B4B',
    primary: '#0F5C5C', onPrimary: '#FFFFFF', accent: '#F5B83D', onAccent: '#2B2118',
    line: '#EADFCB',
    pendingBg: '#FDEBC0', pendingText: '#6B4200',
    successBg: '#D6EFE6', successText: '#0B4A44',
    errorBg: '#F8DDD6', errorText: '#8A2E1A', danger: '#C8553D',
  },
  radius: { card: 28, button: 28, chip: 99 },
  space: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  font: { body: 17, small: 14, title: 26, amount: 56, family: undefined as string | undefined },
  touchMin: 52,
} as const;

export type StatusKind = 'pending' | 'success' | 'error';
export const statusStyle = (k: StatusKind) =>
  k === 'pending' ? { bg: theme.colors.pendingBg, fg: theme.colors.pendingText }
  : k === 'success' ? { bg: theme.colors.successBg, fg: theme.colors.successText }
  : { bg: theme.colors.errorBg, fg: theme.colors.errorText };
