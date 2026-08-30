import { useInfiniteQuery } from '@tanstack/react-query';
import { getRecommendedFeed, type FeedPage } from '../api/postsApi';

// 추천 피드 — 탐색 탭 그리드와 피드 "추천" 탭이 함께 쓴다.
// 두 화면이 같은 쿼리 키를 공유해 요청이 한 번만 나간다.
export function useRecommendedFeedQuery() {
  return useInfiniteQuery<FeedPage>({
    queryKey: ['feed', 'recommend'],
    queryFn: ({ pageParam }) =>
      getRecommendedFeed({ cursor: pageParam as string | undefined, size: 30 }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? (lastPage.nextCursor ?? undefined) : undefined,
  });
}
