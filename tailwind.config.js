/** @type {import('tailwindcss').Config} */
/* 아래 내용들은 디자이너와 협업 후 결정 */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      screens: {
        desktop: "768px", // 데스크탑이라고 판단할 최소 너비
      },
      spacing: {
        // spacing 토큰명 = px값 일치
        s4: "4px", // 아이콘과 텍스트 간 최소 간격
        s8: "8px", // 작은 요소 간 여백
        s12: "12px", // 작은 카드 내부 여백
        s16: "16px", // 기본 패딩, 리스트 간격
        s24: "24px", // 섹션 내부 간격
        s32: "32px", // 큰 카드, 그룹 간격
        s40: "40px", // 큰 섹션 여백
        s48: "48px", // 페이지 요소 간격
        s64: "64px", // 페이지 단위 여백
      },
      fontFamily: {
        sans: ["Pretendard-Regular"],
      },
      // 임시로 적용 (색깔별 목적에 맞게 수정 필요 <- 디자이너 협업 후 결정)
      colors: {
        primary: "#6b11a0", // 보라
        secondary: "#fcf7d6", // 크림
        brand: "#bff140", // 형광
        stroke: "#a3a2a0", // 회색
        background: "#121110", // 검정
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        pill: "9999px",
      },
    },
  },
  plugins: [],
};
