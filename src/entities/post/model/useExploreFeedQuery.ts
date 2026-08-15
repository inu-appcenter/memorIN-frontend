import { useInfiniteQuery } from '@tanstack/react-query';
import { getFriendFeed, type FeedPage } from '../api/postsApi';

// 탐색 탭 그리드(검색어 없을 때) <- 추천 관련 APi 구현 시 수정 예정
// 임시로 "내가 팔로우한 사람들의 최신 게시물"(친구 피드와 동일한 API, GET /api/posts/friends)로 채움
export function useExploreFeedQuery() {
  return useInfiniteQuery<FeedPage>({
    queryKey: ['feed', 'explore'],
    queryFn: ({ pageParam }) =>
      getFriendFeed({ cursor: pageParam as string | undefined, size: 30 }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? (lastPage.nextCursor ?? undefined) : undefined,
  });
}
