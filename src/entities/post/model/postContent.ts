import type { TimeslotType } from '../api/postsApi';

// posts.content는 JSONB 원문(블록 배열 문자열)로 내려온다.
// 아직 블록 스펙(텍스트/이미지/링크 혼합)이 확정 전이라, 이번 증분에서는
// 텍스트 블록만 미리보기로 뽑아내고 나머지는 원문 fallback으로 처리한다.
export function extractPreviewText(rawContent: string): string {
  try {
    const parsed = JSON.parse(rawContent);
    if (Array.isArray(parsed)) {
      const textBlock = parsed.find(
        (block) =>
          block && typeof block === 'object' && typeof block.text === 'string'
      );
      if (textBlock) return textBlock.text as string;
      return parsed.length === 0 ? '' : rawContent;
    }
    return rawContent;
  } catch {
    return rawContent;
  }
}

// 뱃지 등 라벨만 단독으로 필요한 곳에서 재사용하기 위해 분리
export function getTimeslotLabel(timeslot: TimeslotType | null): string | null {
  if (timeslot === 'AM') return '오전';
  if (timeslot === 'PM') return '오후';
  return null;
}

export function formatRecordedLabel(
  recordedDate: string,
  timeslot: TimeslotType | null
): string {
  const slotLabel =
    timeslot === 'AM' ? '오전' : timeslot === 'PM' ? '오후' : '';
  return [recordedDate, slotLabel].filter(Boolean).join(' ');
}
