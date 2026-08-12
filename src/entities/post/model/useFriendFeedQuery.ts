import { useInfiniteQuery } from '@tanstack/react-query';
import { getFriendFeed, type FeedPage } from '../api/postsApi';

// 팔로우 중인 사용자들의 게시물 커서 기반 무한 스크롤 쿼리 — FeedPage "팔로잉" 탭.
export function useFriendFeedQuery() {
  return useInfiniteQuery<FeedPage>({
    queryKey: ['feed', 'friends'],
    queryFn: ({ pageParam }) =>
      getFriendFeed({ cursor: pageParam as string | undefined, size: 20 }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? (lastPage.nextCursor ?? undefined) : undefined,
  });
}
