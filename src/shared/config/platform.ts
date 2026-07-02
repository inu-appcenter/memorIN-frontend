// 추후 수정 예정
export const colors = {
  bg: "#0f1115",
  surface: "#171a21",
  surfaceAlt: "#1f2430",
  border: "#2a3140",
  text: "#f5f7fa",
  textMuted: "#9aa4b2",
  primary: "#6c8cff",
  primarySoft: "rgba(108, 140, 255, 0.15)",
  danger: "#ff6b6b",
  overlay: "rgba(0, 0, 0, 0.55)",
};

export const spacing = (n: number) => n * 4;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
};

// 화면 분기 기준
// 768px 이상이면 데스크탑(Split View), 768px 미만이면 모바일(stack view)
export const BREAKPOINT = 768;
