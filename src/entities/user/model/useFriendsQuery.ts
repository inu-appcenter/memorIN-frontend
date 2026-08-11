import { useMemo } from 'react';
import { useFollowListQuery } from './useFollowListQuery';
import type { UserFollowSummary } from '../api/userApi';

// "친구" = 내가 팔로우 요청을 보내 상대가 수락한 사람(팔로잉) ∪ 상대가 나에게
// 요청을 보내 내가 수락한 사람(팔로워). 방향과 무관하게 ACCEPTED 관계가 있으면
// 친구로 취급하고, 맞팔(양쪽 목록에 다 걸침)이면 하나로 합친다.
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

  // 삭제(DELETE /api/follows/{followingId})는 "내가 follower인 관계"만 지울 수
  // 있다 — 즉 팔로잉 목록에 있는 사람만 이 화면에서 삭제 가능하다. 팔로워로만
  // 잡힌 사람(내가 팔로우한 적 없는데 상대가 나를 팔로우해서 친구로 묶인 경우)은
  // 지울 API가 아직 없다(받은 요청 거절 API 부재와 같은 백엔드 gap).
  const followingIds = useMemo(
    () => new Set(followings.map((f) => f.id)),
    [followings]
  );
  const followerIds = useMemo(
    () => new Set(followers.map((f) => f.id)),
    [followers]
  );

  // 맞팔(양쪽 다 ACCEPTED)인 경우 unfollow(id)를 눌러도 "내가 상대를 팔로우"하는
  // 쪽만 지워지고 "상대가 나를 팔로우"하는 쪽은 그대로 남아, 목록에서 사람은
  // 안 사라지고 삭제 버튼만 사라지는 것처럼 보인다. 이걸 삭제로 오해하지 않도록,
  // 맞팔이 아니라 "내가 팔로우해서 생긴 관계"인 경우에만 삭제를 노출한다.
  const removableIds = useMemo(() => {
    const result = new Set<string>();
    for (const id of followingIds) {
      if (!followerIds.has(id)) result.add(id);
    }
    return result;
  }, [followingIds, followerIds]);

  const friends = useMemo(() => {
    const map = new Map<string, UserFollowSummary>();
    for (const f of followings) map.set(f.id, f);
    for (const f of followers) map.set(f.id, f);
    return Array.from(map.values());
  }, [followings, followers]);

  const fetchNextPage = () => {
    if (followingsQuery.hasNextPage && !followingsQuery.isFetchingNextPage) {
      followingsQuery.fetchNextPage();
    } else if (
      followersQuery.hasNextPage &&
      !followersQuery.isFetchingNextPage
    ) {
      followersQuery.fetchNextPage();
    }
  };

  const refetch = () => {
    followingsQuery.refetch();
    followersQuery.refetch();
  };

  return {
    friends,
    followingIds,
    followerIds,
    removableIds,
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
