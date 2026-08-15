import type { Device } from './useBreakpoints';

// 게시물 썸네일 그리드 컬럼 수 — 피그마 기준(데스크탑 5 / 테블릿 4 / 폰 3)
export function columnsFor(device: Device): number {
  if (device === 'desktop') return 5;
  if (device === 'tablet') return 4;
  return 3;
}