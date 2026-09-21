import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import {
  createComment,
  deleteComment,
  getCommentThread,
  updateComment,
} from '../api/commentsApi';

// 페이징 단위는 최상위 댓글이다. 한 페이지에 실린 최상위 댓글의 답글은 개수와
// 무관하게 전부 같이 오므로, 다음 페이지 판단은 items.length가 아니라 hasNext로 한다.
//
// select로 페이지를 평탄화해 호출부는 지금까지처럼 PostComment[] 하나만 다룬다.
// 쿼리 키도 그대로 둔다 — 아래 뮤테이션들의 무효화가 이 키를 보고 있다.
export function useCommentThread(
  postId: string | undefined,
  options?: { refetchInterval?: number }
) {
  return useInfiniteQuery({
    queryKey: ['comments', postId],
    queryFn: ({ pageParam }) =>
      getCommentThread(postId as string, {
        cursor: pageParam as string | undefined,
        // size: 2, // 검증용. 커밋 전 제거
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? (lastPage.nextCursor ?? undefined) : undefined,
    enabled: Boolean(postId),
    refetchInterval: options?.refetchInterval,
    select: (data) => data.pages.flatMap((page) => page.items),
  });
}

// 문자열만 넘기면 최상위 댓글, { body, parentId }를 넘기면 답글이 된다.
// 기존 호출부(DayDetailPanel 등)가 문자열을 넘기고 있어 양쪽을 다 받는다.
export function useCreateComment(postId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: string | { body: string; parentId?: string }) =>
      createComment(
        postId as string,
        typeof params === 'string' ? { body: params } : params
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
  });
}

export function useUpdateComment(postId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId, body }: { commentId: string; body: string }) =>
      updateComment(commentId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
  });
}

export function useDeleteComment(postId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
  });
}
