export type TypoToken =
  | 'display'
  | 'title'
  | 'heading'
  | 'subheading'
  | 'body'
  | 'body-strong'
  | 'body-small'
  | 'label'
  | 'caption';

// display·title·heading은 화면 크기별로 다른 값 (typography-mobile에 정의됨)
// subheading 이하는 반응형 없이 고정 크기 (typography-mobile에 값 없음)
export const TYPO_CLASS: Record<TypoToken, string> = {
  display: 'font-sans-bold text-[28px] leading-[130%] desktop:text-[36px]',
  title: 'font-sans-bold text-[24px] leading-[130%] desktop:text-[28px]',
  heading: 'font-sans-bold text-[20px] leading-[130%] desktop:text-[22px]',
  subheading: 'font-sans-bold text-[18px] leading-[150%]',
  body: 'font-sans text-[16px] leading-[150%]',
  'body-strong': 'font-sans-bold text-[16px] leading-[150%]',
  'body-small': 'font-sans text-[14px] leading-[150%]',
  label: 'font-sans-bold text-[14px] leading-[150%]',
  caption: 'font-sans text-[12px] leading-[150%]',
};
