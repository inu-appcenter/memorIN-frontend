import { create } from 'zustand';

interface PostLikesState {
  liked: Record<string, boolean>;
  toggleLike: (postId: string) => void;
}

// postId로부터 항상 같은 랜덤 초기 카운트를 만든다 (새로고침해도 값 유지)
// 좋아요 수 API가 아직 없어서 임시 목업으로 구현. 백엔드 API 구현 시 수정 예정
function seedLikeCount(postId: string): number {
  let hash = 0;
  for (let i = 0; i < postId.length; i++) {
    hash = (hash * 31 + postId.charCodeAt(i)) >>> 0;
  }
  return hash % 40;
}

export const usePostLikesStore = create<PostLikesState>((set, get) => ({
  liked: {},
  toggleLike: (postId) =>
    set({ liked: { ...get().liked, [postId]: !get().liked[postId] } }),
}));

export function usePostLikes(postId: string) {
  const liked = usePostLikesStore((s) => s.liked[postId] ?? false);
  const toggleLike = usePostLikesStore((s) => s.toggleLike);
  const count = seedLikeCount(postId) + (liked ? 1 : 0);
  return { liked, count, toggle: () => toggleLike(postId) };
}
