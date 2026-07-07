type Category =
  "text" | "primary" | "accent" | "background" | "neutral" | "yellow";
type CategoryColor =
  "#17C6D6" | "#7ADFE6" | "#FFFDF2" | "#FFC73A" | "#E3E7E8" | "#202124";

// 카테고리 별 색상표
export const color: Partial<Record<Category, CategoryColor>> = {
  primary: "#17C6D6",
  accent: "#7ADFE6",
  background: "#FFFDF2",
  yellow: "#FFC73A",
  neutral: "#E3E7E8",
  text: "#202124",
};
