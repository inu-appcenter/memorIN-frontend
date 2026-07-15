import { DefaultTheme, type Theme } from '@react-navigation/native';

// TS에서 색이 필요할 때의 소스파일 (아이콘 color prop 등)
// global.css의 CSS 변수와 값 동기화 유지 필요
export const COLORS = {
  brand: '#012EAF', // blue/600
  accent: '#FEC200', // yellow/400
  background: '#FFFFFF', // bg/page
  surface: '#F7F8FA', // bg/surface
  text: '#131519', // text/primary
  textMuted: '#8A8F9C', // text/muted
  border: '#DADCE3', // border/default
  success: '#2E7D32',
  warning: '#DFAA00',
  error: '#D03B3B',
  white: '#FFFFFF',
  iconDefault: '#C9F8FB',
  tertiary: '#5F6470',
} as const;

export type ColorToken = keyof typeof COLORS;
export type ColorValue = (typeof COLORS)[ColorToken];

// React Navigation용 테마
export const NAV_THEME: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: COLORS.background,
    border: COLORS.border,
    card: COLORS.background,
    notification: COLORS.error,
    primary: COLORS.brand,
    text: COLORS.text,
  },
};

export const lightPalette = {
  background: '#FFFFFF',
  foreground: '#131519',
  card: '#FFFFFF',
  cardForeground: '#131519',
  popover: '#FFFFFF',
  popoverForeground: '#131519',
  primary: '#012EAF',
  primaryForeground: '#FFFFFF',
  secondary: '#EDEEF2',
  secondaryForeground: '#131519',
  muted: '#EDEEF2',
  mutedForeground: '#8A8F9C',
  accent: '#FEC200',
  accentForeground: '#131519',
  destructive: '#D03B3B',
  destructiveForeground: '#FFFFFF',
  border: '#DADCE3',
  input: '#B8BCC7',
  ring: '#012EAF',
  chart1: '#012EAF',
  chart2: '#FEC200',
  chart3: '#2E7D32',
  chart4: '#DFAA00',
  chart5: '#D03B3B',
  radius: '8px',
} as const;

export const THEME = {
  light: lightPalette,
  dark: lightPalette, // 다크모드 정의 시 교체
} as const;
