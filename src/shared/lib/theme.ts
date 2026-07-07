import { DefaultTheme, type Theme } from "@react-navigation/native";

// global.css와 동일 값 — 변경 시 같이 수정
export const COLORS = {
  background: "#FFFDF2",
  foreground: "#202124",
  primary: "#17C6D6",
  border: "#D5DBDD",
  card: "#FFFFFF",
  destructive: "#EF4444",
} as const;

// React Navigation용 테마 (expo-router가 내부적으로 사용)
export const NAV_THEME: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: COLORS.background,
    border: COLORS.border,
    card: COLORS.card,
    notification: COLORS.destructive,
    primary: COLORS.primary,
    text: COLORS.foreground,
  },
};

const lightPalette = {
  background: "#FFFDF2",
  foreground: "#202124",
  card: "#FFFFFF",
  cardForeground: "#202124",
  popover: "#FFFFFF",
  popoverForeground: "#202124",
  primary: "#17C6D6",
  primaryForeground: "#FFFFFF",
  secondary: "#E3E7E8",
  secondaryForeground: "#202124",
  muted: "#E3E7E8",
  mutedForeground: "#5F6368",
  accent: "#7ADFE6",
  accentForeground: "#202124",
  destructive: "#EF4444",
  destructiveForeground: "#FFFFFF",
  border: "#D5DBDD",
  input: "#D5DBDD",
  ring: "#17C6D6",
  chart1: "#17C6D6",
  chart2: "#7ADFE6",
  chart3: "#FFC73A",
  chart4: "#5F6368",
  chart5: "#EF4444",
  radius: "0.5rem",
} as const;

export const THEME = {
  light: lightPalette,
  dark: lightPalette, // 수정 예정
} as const;
