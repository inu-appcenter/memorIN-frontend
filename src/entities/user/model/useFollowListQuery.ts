import { useInfiniteQuery } from '@tanstack/react-query';
import { getFollowers, getFollowings } from '../api/userApi';

// 팔로워/팔로잉 둘 다 같은 페이지 응답 모양이라 하나의 훅으로 방향만 바꿔 받는다.
export function useFollowListQuery(
  userId: string | undefined,
  direction: 'followers' | 'followings'
) {
  return useInfiniteQuery({
    queryKey: ['users', userId, direction],
    queryFn: ({ pageParam }) =>
      direction === 'followers'
        ? getFollowers(userId as string, {
            cursor: pageParam as string | undefined,
            size: 20,
          })
        : getFollowings(userId as string, {
            cursor: pageParam as string | undefined,
            size: 20,
          }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? (lastPage.nextCursor ?? undefined) : undefined,
    enabled: Boolean(userId),
    staleTime: 30 * 1000,
  });
}
