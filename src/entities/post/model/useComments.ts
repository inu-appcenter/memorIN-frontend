import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createComment, getCommentThread } from '../api/commentsApi';

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

export function useCreateComment(postId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => createComment(postId as string, { body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
  });
}
