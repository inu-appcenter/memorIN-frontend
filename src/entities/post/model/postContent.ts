import i18next from '@/shared/lib/i18n';
import type { TagType, TimeslotType } from '../api/postsApi';

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
  if (timeslot === 'AM') return i18next.t('post.timeslotAm');
  if (timeslot === 'PM') return i18next.t('post.timeslotPm');
  return null;
}

// 카드 배지는 "오전"이 아니라 "오전 기록"으로 읽힌다.
export function getTimeslotBadgeLabel(
  timeslot: TimeslotType | null
): string | null {
  if (timeslot === 'AM') return i18next.t('post.timeslotAmBadge');
  if (timeslot === 'PM') return i18next.t('post.timeslotPmBadge');
  return null;
}

// 컴포넌트에서는 이 맵을 useTranslation의 t와 함께 쓴다. 아래 getTagLabel처럼
// i18next.t를 직접 부르면 언어를 바꿔도 다시 렌더되지 않는다.
export const TAG_LABEL_KEY = {
  STUDY: 'tag.study',
  GAME: 'tag.game',
  ANIMAL: 'tag.animal',
  TRAVEL: 'tag.travel',
  EXERCISE: 'tag.exercise',
  FOOD: 'tag.food',
  MUSIC: 'tag.music',
  DAILY: 'tag.daily',
  HOBBY: 'tag.hobby',
  ETC: 'tag.etc',
} as const satisfies Record<TagType, string>;

export function getTagLabel(tag: TagType): string {
  return i18next.t(TAG_LABEL_KEY[tag]);
}

// postId는 UUIDv7이라 앞 48비트가 생성 시각이다.
export function getPostCreatedAt(postId: string): Date | null {
  const hex = postId.replace(/-/g, '').slice(0, 12);
  if (hex.length < 12) return null;

  const ms = Number.parseInt(hex, 16);
  if (!Number.isFinite(ms) || ms <= 0) return null;

  return new Date(ms);
}

function startOfDay(date: Date): number {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  ).getTime();
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function formatDay(recordedDate: string): string {
  const [year, month, day] = recordedDate.split('-').map(Number);
  if (!year || !month || !day) return recordedDate;

  const target = new Date(year, month - 1, day);
  const diffDays = Math.round(
    (startOfDay(target) - startOfDay(new Date())) / MS_PER_DAY
  );

  if (diffDays === 0) return i18next.t('post.dayToday');
  if (diffDays === -1) return i18next.t('post.dayYesterday');

  return new Intl.DateTimeFormat(i18next.language, {
    month: 'long',
    day: 'numeric',
  }).format(target);
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat(i18next.language, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function formatPostMeta(postId: string, recordedDate: string): string {
  const createdAt = getPostCreatedAt(postId);
  const day = formatDay(recordedDate);
  return createdAt ? `${day} ${formatTime(createdAt)}` : day;
}

export function formatRecordedLabel(
  recordedDate: string,
  timeslot: TimeslotType | null
): string {
  const slotLabel = getTimeslotLabel(timeslot) ?? '';
  return [recordedDate, slotLabel].filter(Boolean).join(' ');
}
