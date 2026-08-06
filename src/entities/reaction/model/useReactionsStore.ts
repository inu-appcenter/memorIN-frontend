import { create } from 'zustand';
import type { ReactionTargetType, ReactionType } from './types';

function targetKey(targetType: ReactionTargetType, targetId: string): string {
  return `${targetType}:${targetId}`;
}

type CountsByType = Partial<Record<ReactionType, number>>;

// 매 렌더마다 새 객체를 만들지 않도록 고정 참조 (무한 리렌더 루프 방지)
const EMPTY_COUNTS: CountsByType = {};

interface ReactionsState {
  counts: Record<string, CountsByType>;
  myReaction: Record<string, ReactionType | null>;
  toggleReaction: (
    targetType: ReactionTargetType,
    targetId: string,
    type: ReactionType
  ) => void;
}

// 백엔드 반응 API(memorin-backend#138)가 아직 없어서 우선 로컬 상태로만 관리. API 준비되면 이 스토어 대신 useQuery/useMutation 기반 훅으로 교체 예정
// 한 유저가 대상 하나에 반응 1개만 남기는 걸로 단순화 — 같은 이모지 다시 누르면 취소, 다른 이모지 누르면 교체
export const useReactionsStore = create<ReactionsState>((set, get) => ({
  counts: {},
  myReaction: {},
  toggleReaction: (targetType, targetId, type) => {
    const key = targetKey(targetType, targetId);
    const currentMine = get().myReaction[key] ?? null;
    const currentCounts = get().counts[key] ?? EMPTY_COUNTS;

    const nextCounts: CountsByType = { ...currentCounts };
    if (currentMine) {
      nextCounts[currentMine] = Math.max(0, (nextCounts[currentMine] ?? 0) - 1);
    }
    const nextMine = currentMine === type ? null : type;
    if (nextMine) {
      nextCounts[nextMine] = (nextCounts[nextMine] ?? 0) + 1;
    }

    set({
      counts: { ...get().counts, [key]: nextCounts },
      myReaction: { ...get().myReaction, [key]: nextMine },
    });
  },
}));

export function useTargetReactions(
  targetType: ReactionTargetType,
  targetId: string
) {
  const key = targetKey(targetType, targetId);
  const counts = useReactionsStore((s) => s.counts[key] ?? EMPTY_COUNTS);
  const myReaction = useReactionsStore((s) => s.myReaction[key] ?? null);
  const toggleReaction = useReactionsStore((s) => s.toggleReaction);
  return {
    counts,
    myReaction,
    toggle: (type: ReactionType) => toggleReaction(targetType, targetId, type),
  };
}
