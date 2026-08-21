import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createComment,
  deleteComment,
  getCommentThread,
  updateComment,
} from '../api/commentsApi';

export function useCommentThread(
  postId: string | undefined,
  options?: { refetchInterval?: number }
) {
  return useQuery({
    queryKey: ['comments', postId],
    queryFn: () => getCommentThread(postId as string),
    enabled: Boolean(postId),
    refetchInterval: options?.refetchInterval,
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
