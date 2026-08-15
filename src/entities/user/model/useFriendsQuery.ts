import { useMemo } from 'react';
import { useFollowListQuery } from './useFollowListQuery';

// "친구" = 맞팔로우(팔로잉·팔로워 양쪽 다 ACCEPTED)인 경우만 인정한다(교집합).
// 예전엔 합집합(팔로잉 또는 팔로워 하나만 있어도 친구)이었는데, 그러면 친구
// 목록엔 있지만 실제로는 내가 팔로우하지 않은 사람이 나올 수 있어서 친구
// 피드(GET /api/posts/friends, 백엔드에서 "내가 팔로우한 사람" 기준)와 계속
// 어긋났다. 교집합은 항상 팔로잉의 부분집합이라 이 문제가 구조적으로 생기지
// 않는다 (2026-08-11 재정의).
export function useFriendsQuery(userId: string | undefined) {
  const followingsQuery = useFollowListQuery(userId, 'followings');
  const followersQuery = useFollowListQuery(userId, 'followers');

  const followings = useMemo(
    () => followingsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [followingsQuery.data]
  );
  const followers = useMemo(
    () => followersQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [followersQuery.data]
  );

  const followerIds = useMemo(
    () => new Set(followers.map((f) => f.id)),
    [followers]
  );

  const friends = useMemo(
    () => followings.filter((f) => followerIds.has(f.id)),
    [followings, followerIds]
  );

  // 삭제(DELETE /api/follows/{followingId})는 "내가 follower인 관계"만 지운다.
  // 친구는 이제 항상 맞팔이므로, 내가 언팔로우하면 followings에서 그 사람이
  // 빠지고 교집합(friends)에서도 즉시 사라진다 — 상대 쪽엔 단방향 잔여 관계가
  // 남지만 어느 쪽에서도 더 이상 "친구"로 안 잡히므로 별도 게이팅이 필요 없다.

  const fetchNextPage = () => {
    // 두 목록을 동시에 채워야 교집합이 실제 친구 수만큼 빨리 맞다.
    // 한쪽만 먼저 다 불러오면 아직 안 불러온 반대쪽 페이지에 있는 친구가
    // 일시적으로 누락돼 보일 수 있다.
    if (followingsQuery.hasNextPage && !followingsQuery.isFetchingNextPage) {
      followingsQuery.fetchNextPage();
    }
    if (followersQuery.hasNextPage && !followersQuery.isFetchingNextPage) {
      followersQuery.fetchNextPage();
    }
  };

  const refetch = () => {
    followingsQuery.refetch();
    followersQuery.refetch();
  };

  return {
    friends,
    isLoading: followingsQuery.isLoading || followersQuery.isLoading,
    isError: followingsQuery.isError || followersQuery.isError,
    error: followingsQuery.error ?? followersQuery.error,
    isFetchingNextPage:
      followingsQuery.isFetchingNextPage || followersQuery.isFetchingNextPage,
    hasNextPage: followingsQuery.hasNextPage || followersQuery.hasNextPage,
    fetchNextPage,
    refetch,
  };
}
