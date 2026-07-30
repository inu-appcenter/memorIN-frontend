import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updatePost, type UpdatePostParams } from '../api/postsApi';

export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      postId,
      params,
    }: {
      postId: string;
      params: UpdatePostParams;
    }) => updatePost(postId, params),
    onSuccess: () => {
      // 피드/캘린더 둘 다 이 게시물을 표시할 수 있어 양쪽 다 갱신한다
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
    },
  });
}
