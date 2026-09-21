import { useInfiniteQuery } from '@tanstack/react-query';
import { getFollowRequests } from '../api/userApi';

// 쿼리 키는 ['users', 'followRequests'] 그대로 둔다 —
// useFollowMutations의 무효화 조건이 queryKey[1]을 보고 있다.
// select로 페이지를 평탄화해서 호출부는 FollowRequestItem[]만 다루면 된다.
export function useFollowRequestsQuery() {
  return useInfiniteQuery({
    queryKey: ['users', 'followRequests'],
    queryFn: ({ pageParam }) =>
      getFollowRequests({ cursor: pageParam as string | undefined, size: 20 }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? (lastPage.nextCursor ?? undefined) : undefined,
    select: (data) => data.pages.flatMap((page) => page.items),
    staleTime: 30 * 1000,
  });
}
