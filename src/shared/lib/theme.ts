import { DefaultTheme, type Theme } from '@react-navigation/native';

// TS에서 색이 필요할 때의 소스파일 (아이콘 color prop 등)
// global.css의 CSS 변수와 값 동기화 유지 필요
export const COLORS = {
  brand: '#1E5EF9', // blue/300
  accent: '#FFD21E', // yellow/normal
  background: '#FFFFFF', // bg/page
  surface: '#F7F8FA', // bg/surface
  text: '#131519', // text/primary
  textSecondary: '#464B55', // text/secondary (neutral/600)
  textMuted: '#8A8F9C', // text/muted
  border: '#DADCE3', // border/default
  bgSubtle: '#EDEEF2', // bg/subtle
  success: '#2E7D32',
  warning: '#C59E00',
  error: '#D03B3B',
  white: '#FFFFFF',
  iconDefault: '#C9F8FB',
  tertiary: '#5F6470',
  neutral600: '#22252B', // primitive/neutral/600

  // 임시: 정식 다크 테마 확정 전까지 임시로 사용
  surfaceDarkBg: '#22252B',
  surfaceDarkBorder: 'rgba(255,255,255,0.15)',
  surfaceDarkTextPrimary: '#FFFFFF',
  surfaceDarkTextSecondary: 'rgba(255,255,255,0.7)',
  surfaceDarkTextMuted: 'rgba(255,255,255,0.5)',
  surfaceDarkAvatarBg: 'rgba(255,255,255,0.15)',
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
  primary: '#1E5EF9',
  primaryForeground: '#FFFFFF',
  secondary: '#EDEEF2',
  secondaryForeground: '#131519',
  muted: '#EDEEF2',
  mutedForeground: '#8A8F9C',
  accent: '#FFD21E',
  accentForeground: '#131519',
  destructive: '#D03B3B',
  destructiveForeground: '#FFFFFF',
  border: '#DADCE3',
  input: '#B8BCC7',
  ring: '#1E5EF9',
  chart1: '#1E5EF9',
  chart2: '#FFD21E',
  chart3: '#2E7D32',
  chart4: '#C59E00',
  chart5: '#D03B3B',
  radius: '8px',
} as const;

export const THEME = {
  light: lightPalette,
  dark: lightPalette, // 다크모드 정의 시 교체
} as const;

// dark 쪽은 임시 토큰(SURFACE_DARK_*)이며, 정식 다크 테마가 나오면 교체 대상.
export interface SurfaceColors {
  background: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  avatarBackground: string;
}

export const SURFACE_COLORS: Record<'light' | 'dark', SurfaceColors> = {
  light: {
    background: COLORS.white,
    border: COLORS.border,
    textPrimary: COLORS.text,
    textSecondary: COLORS.textSecondary,
    textMuted: COLORS.textMuted,
    avatarBackground: COLORS.bgSubtle,
  },
  dark: {
    background: COLORS.surfaceDarkBg,
    border: COLORS.surfaceDarkBorder,
    textPrimary: COLORS.surfaceDarkTextPrimary,
    textSecondary: COLORS.surfaceDarkTextSecondary,
    textMuted: COLORS.surfaceDarkTextMuted,
    avatarBackground: COLORS.surfaceDarkAvatarBg,
  },
};

export function getSurfaceColors(variant: 'light' | 'dark'): SurfaceColors {
  return SURFACE_COLORS[variant];
}
