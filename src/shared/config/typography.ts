export type TypoToken =
  "display" | "h1" | "h2" | "h3" | "bodyL" | "body" | "caption";

// 모바일 퍼스트
export const TYPO_CLASS: Record<TypoToken, string> = {
  display: "text-[40px] desktop:text-[64px]",
  h1: "text-[32px] desktop:text-[48px]",
  h2: "text-[24px] desktop:text-[40px]",
  h3: "text-[20px] desktop:text-[32px]",
  bodyL: "text-[16px] desktop:text-[18px]",
  body: "text-[14px] desktop:text-[16px]",
  caption: "text-[12px] desktop:text-[14px]",
};
