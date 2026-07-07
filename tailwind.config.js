/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      screens: {
        desktop: "768px", // 데스크탑이라고 판단할 최소 너비
      },
      maxWidth: {
        limit: "1440px", // 데스크탑 콘텐츠 최대 폭
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
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        text: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        yellow: "var(--yellow)",
        neutral: "var(--neutral)",
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
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
