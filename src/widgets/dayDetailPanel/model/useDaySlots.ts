import { useMonthPosts } from '@/widgets/calendarGrid/model/useMonthPosts';
import { toDateKey } from '@/shared/lib/calendarDate';
import i18next from '@/shared/lib/i18n';
import type { PostSummary, TimeslotType } from '@/entities/post/api/postsApi';

// 상수 객체로 두면 모듈 로드 시 1회만 평가돼 언어 전환이 반영되지 않아 함수로 바꿨다.
export function getSlotLabel(slot: TimeslotType): string {
  return slot === 'AM'
    ? i18next.t('post.timeslotAm')
    : i18next.t('post.timeslotPm');
}
export const SLOTS: TimeslotType[] = ['AM', 'PM'];

// 하루(오전/오후) 슬롯별 게시물 매핑 — DayDetailContent(본문)와 DayDetailPanel(하단 입력줄)이
// 같은 계산을 공유해야 해서(react-query 캐시는 공유되니 useMonthPosts를 두 곳에서 불러도 무방) 훅으로 뺐다.
export function useDaySlots(date: Date) {
  const { data: monthPosts, isLoading } = useMonthPosts(
    date.getFullYear(),
    date.getMonth()
  );
  const dateKey = toDateKey(date);
  const postBySlot = SLOTS.map((slot) => ({
    slot,
    post: (monthPosts ?? []).find(
      (post) => post.recordedDate === dateKey && post.timeslot === slot
    ),
  }));
  const orderedPosts = postBySlot
    .map((entry) => entry.post)
    .filter((post): post is PostSummary => Boolean(post));

  return { postBySlot, orderedPosts, isLoading };
}
