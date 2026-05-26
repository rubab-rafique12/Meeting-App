export const LightTheme = {
  dark: false,

  // Backgrounds — warm white + cool slate tints
  bg: '#F0F4F8',
  bgCard: '#FFFFFF',
  bgInput: '#F7F9FC',
  bgSurface: '#E8EEF5',

  // Brand — deep teal primary, gold accent
  primary: '#0D7377',
  primaryDark: '#095E62',
  primaryLight: '#14A8AE',
  primarySoft: '#E0F5F5',
  accent: '#E8A838',
  accentSoft: '#FEF3DC',

  // Pastel card colors — muted, professional
  cardYellow: '#FEF9EC',
  cardPink:   '#FDF0F5',
  cardMint:   '#EBF8F4',
  cardBlue:   '#EBF3FD',
  cardPurple: '#F0EDFB',
  cardOrange: '#FEF3EB',

  // Text
  textPrimary:   '#0D1B2A',
  textSecondary: '#4A5568',
  textMuted:     '#8A9BB0',
  textOnPrimary: '#FFFFFF',

  // Status
  success:     '#0A8754',
  successSoft: '#E6F5EE',
  danger:      '#D93025',
  dangerSoft:  '#FDECEA',
  warning:     '#E8A838',
  warningSoft: '#FEF3DC',

  // Borders
  border:      '#DDE3EC',
  borderLight: '#EEF2F7',

  // Shadow
  shadow: 'rgba(13, 115, 119, 0.10)',
};

export const DarkTheme = {
  dark: true,

  bg:        '#0A0F14',
  bgCard:    '#111820',
  bgInput:   '#161E28',
  bgSurface: '#1A2332',

  primary:     '#14A8AE',
  primaryDark: '#0D7377',
  primaryLight:'#1DCDD4',
  primarySoft: '#0D2E30',
  accent:      '#E8A838',
  accentSoft:  '#2E2010',

  cardYellow: '#1E1A0E',
  cardPink:   '#1E1018',
  cardMint:   '#0E1E1A',
  cardBlue:   '#0E1620',
  cardPurple: '#16101E',
  cardOrange: '#1E1408',

  textPrimary:   '#E8EEF5',
  textSecondary: '#8A9BB0',
  textMuted:     '#4A5568',
  textOnPrimary: '#FFFFFF',

  success:     '#0FBA6F',
  successSoft: '#0A2E1E',
  danger:      '#F04438',
  dangerSoft:  '#2E0E0A',
  warning:     '#E8A838',
  warningSoft: '#2E1E08',

  border:      '#1E2A38',
  borderLight: '#161E28',

  shadow: 'rgba(0,0,0,0.5)',
};

export type Theme = typeof LightTheme;

export const Spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48,
};

export const Radius = {
  sm: 6, md: 10, lg: 14, xl: 20, xxl: 28, full: 9999,
};
