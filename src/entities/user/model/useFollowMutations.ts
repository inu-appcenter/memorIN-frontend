import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  requestFollow,
  unfollow,
  acceptFollow,
  rejectFollowRequest,
} from '../api/userApi';

// 팔로우 요청(POST /api/follows). 성공해도 상태는 PENDING이라 팔로잉/팔로워
// 목록에는 아직 반영되지 않는다 — 버튼 상태는 호출부(FollowButton)가 로컬로 들고 있는다.
export function useFollowUser() {
  return useMutation({
    mutationFn: (targetUserId: string) => requestFollow(targetUserId),
  });
}

// 언팔로우 / 내가 보낸 요청 취소(DELETE /api/follows/{followingId}).
// 성공하면 내 팔로잉 목록에서 즉시 사라져야 하므로 관련 쿼리를 무효화한다.
export function useUnfollowUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (targetUserId: string) => unfollow(targetUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === 'users' && query.queryKey[2] === 'followings',
      });
    },
  });
}

// 받은 팔로우 요청 수락(PATCH /api/follows/{followId}/accept).
// followId는 유저 id가 아니라 관계 행 id — 받은 요청 목록에서 내려받은 값을 그대로 넘긴다.
export function useAcceptFollow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (followId: string) => acceptFollow(followId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === 'users' &&
          (query.queryKey[2] === 'followers' ||
            query.queryKey[1] === 'followRequests'),
      });
    },
  });
}

// 받은 팔로우 요청 거절(DELETE /api/follows/requests/{followId}).
// 관계 행 자체가 삭제되므로 팔로워/팔로잉 목록에는 원래 없던 상태 그대로다.
// 받은 요청 목록만 다시 불러오면 된다.
export function useRejectFollow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (followId: string) => rejectFollowRequest(followId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === 'users' &&
          query.queryKey[1] === 'followRequests',
      });
    },
  });
}
