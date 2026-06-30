/** @type {import('tailwindcss').Config} */
/* 아래 내용들은 디자이너와 협업 후 결정 */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
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
