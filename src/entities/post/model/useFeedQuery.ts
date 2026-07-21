import { useInfiniteQuery } from '@tanstack/react-query';
import { getMyFeed, type FeedPage } from '../api/postsApi';

// 커서 기반 무한 스크롤 피드 쿼리.
// 로그인 상태(액세스 토큰)는 client.ts 인터셉터가 자동으로 Authorization 헤더에 실어준다.
export function useFeedQuery() {
  return useInfiniteQuery<FeedPage>({
    queryKey: ['feed', 'me'],
    queryFn: ({ pageParam }) =>
      getMyFeed({ cursor: pageParam as string | undefined, size: 20 }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? (lastPage.nextCursor ?? undefined) : undefined,
  });
}
