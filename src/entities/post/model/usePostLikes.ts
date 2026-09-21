import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/shared/lib/toast';
import {
  getPostLike,
  togglePostLike,
  type PostLike,
} from '../api/postLikesApi';

export const postLikeKey = (postId: string) =>
  ['posts', postId, 'likes'] as const;

// 목록 화면은 카드마다 이 훅을 부르므로 게시물 수만큼 GET이 나간다.
// 목록 응답(PostSummaryResponse)에 liked·likeCount가 포함되면 그 값을 초기값으로
// 쓰고 이 조회를 없앨 수 있다 — 백엔드에 요청해 둔 항목이다.
//
// 전역 기본값(refetchOnMount·refetchOnWindowFocus: 'always')을 여기서만 끈다.
// 켜둔 채로 두면 스크롤로 카드가 다시 마운트될 때마다 요청이 쏟아진다.
// 내가 누른 결과는 토글 응답으로 캐시를 직접 갱신하므로 즉시 반영된다.
export function usePostLikes(postId: string) {
  const queryClient = useQueryClient();
  const enabled = postId.length > 0;

  const { data } = useQuery({
    queryKey: postLikeKey(postId),
    queryFn: () => getPostLike(postId),
    enabled,
    staleTime: 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: () => togglePostLike(postId),

    // 하트는 누르는 즉시 반응해야 한다. 서버 응답을 기다리면 눌린 뒤 깜빡인다.
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: postLikeKey(postId) });
      const previous = queryClient.getQueryData<PostLike>(postLikeKey(postId));

      if (previous) {
        queryClient.setQueryData<PostLike>(postLikeKey(postId), {
          liked: !previous.liked,
          likeCount: previous.likeCount + (previous.liked ? -1 : 1),
        });
      }

      return { previous };
    },

    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(postLikeKey(postId), context.previous);
      }
      toast.error((error as Error).message);
    },

    // 서버가 돌려준 값이 최종 상태다. 낙관적 값과 어긋나면 여기서 바로잡힌다.
    onSuccess: (result) => {
      queryClient.setQueryData<PostLike>(postLikeKey(postId), result);
    },
  });

  const toggle = useCallback(() => {
    if (!enabled || isPending) return;
    mutate();
  }, [enabled, isPending, mutate]);

  return {
    liked: data?.liked ?? false,
    count: data?.likeCount ?? 0,
    toggle,
  };
}
