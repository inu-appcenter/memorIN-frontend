import { useInfiniteQuery } from '@tanstack/react-query';
import { getUserFeed, type FeedPage } from '../api/postsApi';

// 다른 사용자 프로필 화면의 "기록" 그리드용.
export function useUserFeedQuery(userId: string | undefined) {
  return useInfiniteQuery<FeedPage>({
    queryKey: ['feed', 'user', userId],
    queryFn: ({ pageParam }) =>
      getUserFeed(userId as string, {
        cursor: pageParam as string | undefined,
        size: 20,
      }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? (lastPage.nextCursor ?? undefined) : undefined,
    enabled: Boolean(userId),
  });
}
